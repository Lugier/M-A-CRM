"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getDeals() {
    try {
        return await prisma.deal.findMany({
            include: {
                lead: {
                    include: { internalOwner: true }
                },
                tasks: {
                    where: { isCompleted: false },
                    select: { id: true }
                },
                teamMembers: {
                    include: { user: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });
    } catch (error) {
        console.error("Failed to fetch deals:", error);
        return [];
    }
}

export async function updateDealStage(dealId: string, stage: any) {
    try {
        await prisma.deal.update({
            where: { id: dealId },
            data: { stage }
        });

        await prisma.dealPipelineHistory.create({
            data: { dealId, stage }
        });

        revalidatePath("/deals");
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        console.error("Failed to update deal stage:", error);
        return { error: error.message || "Fehler beim Aktualisieren der Phase" };
    }
}

export async function updateDeal(id: string, formData: FormData) {
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const status = formData.get("status") as string;
    const expectedValueStr = formData.get("expectedValue") as string;
    const probabilityStr = formData.get("probability") as string;
    const feeRetainerStr = formData.get("feeRetainer") as string;
    const feeSuccessStr = formData.get("feeSuccess") as string;

    if (!name) return { error: "Name ist erforderlich" };

    try {
        await prisma.deal.update({
            where: { id },
            data: {
                name,
                type: (type as any) || undefined,
                status: (status as any) || undefined,
                expectedValue: expectedValueStr ? parseFloat(expectedValueStr) : null,
                probability: probabilityStr ? parseFloat(probabilityStr) : null,
                feeRetainer: feeRetainerStr ? parseFloat(feeRetainerStr) : null,
                feeSuccess: feeSuccessStr ? parseFloat(feeSuccessStr) : null,
            }
        });

        revalidatePath("/deals");
        revalidatePath(`/deals/${id}`);
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        console.error("Failed to update deal:", error);
        return { error: error.message || "Fehler beim Aktualisieren des Deals" };
    }
}

export async function deleteDeal(id: string) {
    try {
        // Delete related records first to avoid FK constraint errors
        await prisma.dealPipelineHistory.deleteMany({ where: { dealId: id } });
        await prisma.dealInvestor.deleteMany({ where: { dealId: id } });
        await prisma.task.deleteMany({ where: { dealId: id } });
        await prisma.activity.deleteMany({ where: { dealId: id } });
        await prisma.document.deleteMany({ where: { dealId: id } });
        await prisma.deal.delete({ where: { id } });

        revalidatePath("/deals");
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete deal:", error);
        return { error: error.message || "Fehler beim Löschen des Deals" };
    }
}
