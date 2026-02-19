"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTags() {
    return await prisma.tag.findMany({
        include: { assignments: true },
        orderBy: { name: 'asc' }
    });
}

export async function createTag(name: string, color: string = "#6366f1") {
    try {
        const tag = await prisma.tag.create({ data: { name, color } });
        return { success: true, tag };
    } catch (error: any) {
        return { error: "Tag existiert bereits" };
    }
}

export async function assignTag(tagId: string, entityType: "deal" | "organization" | "contact", entityId: string) {
    try {
        const data: any = { tagId };
        if (entityType === "deal") data.dealId = entityId;
        if (entityType === "organization") data.organizationId = entityId;
        if (entityType === "contact") data.contactId = entityId;

        await prisma.tagAssignment.create({ data });
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { error: "Tag bereits zugewiesen" };
    }
}

export async function removeTagAssignment(assignmentId: string) {
    try {
        await prisma.tagAssignment.delete({ where: { id: assignmentId } });
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function deleteTag(tagId: string) {
    try {
        await prisma.tag.delete({ where: { id: tagId } });
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}
