"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getEmailTemplates() {
    return await prisma.emailTemplate.findMany({
        orderBy: { name: 'asc' }
    });
}

export async function createEmailTemplate(data: {
    name: string;
    subject: string;
    body: string;
    type?: string;
}) {
    try {
        const template = await prisma.emailTemplate.create({ data });
        revalidatePath("/");
        return { success: true, template };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function updateEmailTemplate(id: string, data: { name?: string; subject?: string; body?: string; type?: string }) {
    try {
        await prisma.emailTemplate.update({ where: { id }, data });
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function deleteEmailTemplate(id: string) {
    try {
        await prisma.emailTemplate.delete({ where: { id } });
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}
