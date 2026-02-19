"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getDealTeam(dealId: string) {
    return await prisma.dealTeamMember.findMany({
        where: { dealId },
        include: { user: true },
        orderBy: { createdAt: 'asc' }
    });
}

export async function addDealTeamMember(dealId: string, userId: string, role: string = "SUPPORT") {
    try {
        await prisma.dealTeamMember.create({
            data: { dealId, userId, role: role as any }
        });
        revalidatePath(`/deals/${dealId}`);
        return { success: true };
    } catch (error: any) {
        if (error.code === "P2002") return { error: "Teammitglied bereits zugewiesen" };
        return { error: error.message };
    }
}

export async function removeDealTeamMember(dealId: string, userId: string) {
    try {
        await prisma.dealTeamMember.delete({
            where: { dealId_userId: { dealId, userId } }
        });
        revalidatePath(`/deals/${dealId}`);
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function updateDealTeamRole(dealId: string, userId: string, role: string) {
    try {
        await prisma.dealTeamMember.update({
            where: { dealId_userId: { dealId, userId } },
            data: { role: role as any }
        });
        revalidatePath(`/deals/${dealId}`);
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}
