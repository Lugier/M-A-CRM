"use server";

import prisma from "@/lib/prisma";

export async function verifyClientPortalAccess(dealId: string, password: string) {
    try {
        const deal = await prisma.deal.findUnique({
            where: { id: dealId }
        });

        if (!deal) return { success: false };
        if (!deal.clientPortalEnabled) return { success: false };
        if (deal.clientPortalPassword !== password) return { success: false };

        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

export async function getClientPortalDealData(dealId: string) {
    try {
        const deal = await prisma.deal.findUnique({
            where: { id: dealId },
            include: {
                investors: {
                    include: {
                        organization: true
                    },
                    orderBy: { createdAt: 'desc' }
                },
                documents: true,
                history: {
                    orderBy: { enteredAt: 'asc' }
                }
            }
        });

        if (!deal || !deal.clientPortalEnabled) return null;

        // Anonymize investors for stats, but provide full list for view
        const stats = {
            longlist: deal.investors.length,
            contacted: deal.investors.filter(i => i.status !== "LONGLIST" && i.status !== "SHORTLIST").length,
            ndaSigned: deal.investors.filter(i => i.ndaSignedAt).length,
            imSent: deal.investors.filter(i => i.imSentAt).length,
            bids: deal.investors.filter(i => i.status === "BID_RECEIVED").length,
        };

        return {
            name: deal.name,
            stage: deal.stage,
            stats,
            history: deal.history,
            updatedAt: deal.updatedAt,
            investors: deal.investors.map(inv => ({
                id: inv.id,
                name: inv.organization.name,
                type: inv.organization.type,
                status: inv.status,
                clientFeedback: inv.clientFeedback,
                // Only show relevant dates to client
                ndaSignedAt: inv.ndaSignedAt,
                imSentAt: inv.imSentAt
            }))
        };
    } catch (error) {
        console.error("Error fetching portal data:", error);
        return null;
    }
}

export async function updateClientFeedback(investorId: string, feedback: string) {
    try {
        await prisma.dealInvestor.update({
            where: { id: investorId },
            data: { clientFeedback: feedback }
        });
        return { success: true };
    } catch (error) {
        console.error("Error updating feedback:", error);
        return { success: false };
    }
}
