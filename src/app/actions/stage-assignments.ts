"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addStageMember(dealId: string, step: any, userId: string) {
    try {
        await (prisma as any).dealStageMember.create({
            data: {
                dealId,
                step,
                userId
            }
        });
        revalidatePath(`/deals/${dealId}`);
        return { success: true };
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { error: "Mitarbeiter ist dieser Phase bereits zugeordnet." };
        }
        return { error: error.message };
    }
}

export async function removeStageMember(dealId: string, step: any, userId: string) {
    try {
        await (prisma as any).dealStageMember.delete({
            where: {
                dealId_userId_step: {
                    dealId,
                    userId,
                    step
                }
            }
        });
        revalidatePath(`/deals/${dealId}`);
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function addStageComment(dealId: string, step: any, userId: string, content: string) {
    try {
        await prisma.comment.create({
            data: {
                dealId,
                step,
                userId,
                content
            } as any
        });
        revalidatePath(`/deals/${dealId}`);
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}
