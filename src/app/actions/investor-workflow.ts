"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// ============================================================
// INVESTOR WORKFLOW ACTIONS
// ============================================================

export type OutreachType = 'EMAIL' | 'PHONE' | 'LINKEDIN' | 'OTHER';

import { cookies } from "next/headers";

/**
 * Log outreach for a single investor or bulk for multiple.
 */
export async function logOutreach(
    dealId: string,
    investorIds: string[], // Organization IDs
    method: OutreachType,
    content?: string,
    templateId?: string
) {
    try {
        const now = new Date();
        const cookieStore = cookies();
        const userId = cookieStore.get("crm_current_user")?.value;

        // 1. Update DealInvestor records
        await prisma.dealInvestor.updateMany({
            where: {
                dealId,
                organizationId: { in: investorIds }
            },
            data: {
                status: 'CONTACTED',
                contactedVia: method.toLowerCase(),
                emailSentAt: method === 'EMAIL' ? now : undefined,
                emailBody: content, // Store the actual content sent if available
                updatedAt: now
            }
        });

        // 2. Log Activities for timeline
        // We fetch the organization names and contact info
        const investors = await prisma.dealInvestor.findMany({
            where: { dealId, organizationId: { in: investorIds } },
            include: { organization: true, contact: true }
        });

        // Prisma createMany is efficient, but we want to link contacts if they exist
        const activityData = investors.map(inv => ({
            dealId,
            contactId: inv.contactId,
            userId: userId,
            type: "OUTREACH",
            content: `Outreach via ${method} to ${inv.organization.name}${inv.contact ? ` (${inv.contact.firstName} ${inv.contact.lastName})` : ""}`,
            createdAt: now
        }));

        await prisma.activity.createMany({
            data: activityData
        });

        revalidatePath(`/deals/${dealId}`);
        return { success: true, count: investorIds.length };
    } catch (error: any) {
        console.error("Failed to log outreach:", error);
        return { error: "Fehler beim Loggen der Ansprache" };
    }
}

/**
 * Advanced Stage Update with automated timestamping
 */
export async function updateInvestorStage(
    dealId: string,
    organizationId: string,
    stage: string, // e.g., 'NDA_SIGNED'
    metadata?: {
        notes?: string,
        date?: Date
    }
) {
    try {
        const now = metadata?.date || new Date();
        const data: any = {
            status: stage,
            updatedAt: new Date()
        };

        // Automate timestamps based on stage
        if (stage === 'NDA_SENT') data.ndaSentAt = now;
        if (stage === 'NDA_SIGNED') data.ndaSignedAt = now;
        if (stage === 'IM_SENT') data.imSentAt = now;
        if (stage === 'DROPPED') data.passReason = metadata?.notes;

        if (metadata?.notes) data.notes = metadata.notes; // Append or replace? For now replace or we need a fetch first.

        const updated = await prisma.dealInvestor.update({
            where: { dealId_organizationId: { dealId, organizationId } },
            data,
            include: { organization: true }
        });

        // Log Activity
        await prisma.activity.create({
            data: {
                dealId,
                type: "STAGE_CHANGE",
                content: `${updated.organization.name} moved to ${stage}`,
            }
        });

        revalidatePath(`/deals/${dealId}`);
        return { success: true, investor: updated };
    } catch (error: any) {
        console.error("Failed to update investor stage:", error);
        return { error: "Fehler beim Aktualisieren des Status" };
    }
}

/**
 * Generate personalized outreach content (Mock AI for now)
 */
export async function generateOutreachContent(
    dealId: string,
    investorId: string,
    templateType: 'TEASER' | 'NDA' | 'PROCESS_LETTER'
) {
    try {
        const deal = await prisma.deal.findUnique({ where: { id: dealId } });
        const investor = await prisma.organization.findUnique({ where: { id: investorId } });

        if (!deal || !investor) throw new Error("Deal or Investor not found");

        // In a real app, we would fetch a stored EmailTemplate here.
        // For now, we generate a simple dynamic string.

        const subject = `Project ${deal.name} - Investment Opportunity`;
        let body = "";

        if (templateType === 'TEASER') {
            body = `Dear Team at ${investor.name},\n\nWe are pleased to present Project ${deal.name}, a leading player in the ${deal.targetSubIndustry || 'sector'}.\n\nPlease find the Teaser attached.\n\nBest regards,\nBachert DealFlow Team`;
        } else if (templateType === 'NDA') {
            body = `Dear Team,\n\nPlease find attached the NDA for Project ${deal.name}.\n\nAccess to the data room will be granted upon signature.\n\nBest,\nBachert DealFlow Team`;
        }

        return { subject, body };
    } catch (error) {
        return { error: "Failed to generate content" };
    }
}
