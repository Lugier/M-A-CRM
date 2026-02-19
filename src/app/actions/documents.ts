"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getDocuments() {
    try {
        return await prisma.document.findMany({
            include: {
                deal: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    } catch (error) {
        console.error("Failed to fetch documents:", error);
        return [];
    }
}

export async function createDocument(data: {
    name: string;
    path: string;
    type: string;
    dealId?: string;
}) {
    try {
        const doc = await prisma.document.create({
            data: {
                name: data.name,
                path: data.path,
                type: data.type as any,
                dealId: data.dealId || null,
            }
        });

        revalidatePath("/documents");
        if (data.dealId) revalidatePath(`/deals/${data.dealId}`);
        return { success: true, id: doc.id };
    } catch (error: any) {
        console.error("Failed to create document:", error);
        return { error: error.message || "Fehler beim Erstellen des Dokuments" };
    }
}

export async function deleteDocument(id: string) {
    try {
        const doc = await prisma.document.delete({ where: { id } });
        revalidatePath("/documents");
        if (doc.dealId) revalidatePath(`/deals/${doc.dealId}`);
        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete document:", error);
        return { error: error.message || "Fehler beim Löschen des Dokuments" };
    }
}
