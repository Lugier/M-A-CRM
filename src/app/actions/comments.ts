"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getComments(dealId: string) {
    return await prisma.comment.findMany({
        where: { dealId },
        include: { user: true },
        orderBy: { createdAt: 'desc' }
    });
}

export async function addComment(dealId: string | undefined, userId: string, content: string, contactId?: string, organizationId?: string) {
    try {
        // Auto-resolve organizationId if not provided but contactId or dealId is
        let resolvedOrgId = organizationId;
        if (!resolvedOrgId) {
            if (contactId) {
                const contact = await prisma.contact.findUnique({ where: { id: contactId }, select: { organizationId: true } });
                if (contact?.organizationId) resolvedOrgId = contact.organizationId;
            } else if (dealId) {
                const deal = await prisma.deal.findUnique({ where: { id: dealId }, select: { lead: { select: { organizationId: true } } } });
                if (deal?.lead?.organizationId) resolvedOrgId = deal.lead.organizationId;
            }
        }

        const comment = (await prisma.comment.create({
            data: {
                dealId: (dealId || null),
                userId,
                content,
                contactId: (contactId || null),
                organizationId: (resolvedOrgId || null)
            } as any,
            include: { deal: true, user: true }
        })) as any;

        // 1. Check for mentions (simple regex for @Name)
        // This is a naive implementation. Real implementation would parse IDs.
        // For now, we just notify the deal lead if someone else comments.
        if (dealId) {
            const deal = await prisma.deal.findUnique({
                where: { id: dealId },
                include: { teamMembers: true }
            });

            if (deal) {
                // Notify team members (except the commenter)
                const recipients = deal.teamMembers
                    .filter(tm => tm.userId !== userId)
                    .map(tm => tm.userId);

                if (recipients.length > 0) {
                    await prisma.notification.createMany({
                        data: recipients.map(rId => ({
                            userId: rId,
                            type: "MENTION", // Generic for now
                            content: `${comment.user.name} hat einen Kommentar zu ${deal.name} geschrieben.`,
                            link: `/deals/${dealId}?tab=overview`
                        }))
                    });
                }
            }
            revalidatePath(`/deals/${dealId}`);
        }
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}
