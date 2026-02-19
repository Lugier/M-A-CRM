"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Add an investor from the global pool to the specific deal
export async function addInvestorToDeal(dealId: string, organizationId: string) {
    try {
        await prisma.dealInvestor.create({
            data: {
                dealId,
                organizationId,
                status: "LONGLIST"
            }
        });
        revalidatePath(`/deals/${dealId}`);
        return { success: true };
    } catch (e: any) {
        if (e.code === 'P2002') return { error: "Bereits auf der Liste" };
        console.error(e);
        return { error: "Fehler beim Hinzufügen" };
    }
}

// Remove investor from deal (if early stage)
export async function removeInvestorFromDeal(dealId: string, organizationId: string) {
    try {
        await prisma.dealInvestor.delete({
            where: { dealId_organizationId: { dealId, organizationId } }
        });
        revalidatePath(`/deals/${dealId}`);
        return { success: true };
    } catch (e) {
        return { error: "Fehler beim Löschen" };
    }
}

// Update general organization details (Address, Description) - affects global record
export async function updateOrganizationDetails(orgId: string, data: {
    description?: string,
    address?: string,
    postalCode?: string,
    city?: string,
    country?: string,
    website?: string
}) {
    try {
        await prisma.organization.update({
            where: { id: orgId },
            data
        });
        revalidatePath(`/organizations/${orgId}`);
        revalidatePath(`/deals`); // In case it's shown in lists
        return { success: true };
    } catch (e) {
        return { error: "Fehler beim Speichern der Firmendaten" };
    }
}

// Update deal-specific investor notes
export async function updateInvestorNote(dealId: string, organizationId: string, notes: string) {
    try {
        await prisma.dealInvestor.update({
            where: { dealId_organizationId: { dealId, organizationId } },
            data: { notes }
        });
        revalidatePath(`/deals/${dealId}`);
        return { success: true };
    } catch (e) {
        return { error: "Fehler beim Speichern der Notiz" };
    }
}
