"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateTeamsWebhookAction(userId: string, webhookUrl: string) {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { teamsWebhookUrl: webhookUrl || null }
        });
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        console.error("Update Teams Webhook Error:", error);
        return { error: error.message };
    }
}
