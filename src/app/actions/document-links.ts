"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getDocumentLinks(dealId: string) {
    return await prisma.documentLink.findMany({
        where: { dealId },
        orderBy: { createdAt: 'desc' }
    });
}

export async function createDocumentLink(data: {
    name: string;
    url: string;
    type: string;
    version: string;
    dealId: string;
}) {
    await prisma.documentLink.create({
        data: {
            name: data.name,
            url: data.url,
            type: data.type as any,
            version: data.version,
            dealId: data.dealId,
            status: "DRAFT"
        }
    });
    revalidatePath(`/deals/${data.dealId}`);
}

export async function deleteDocumentLink(linkId: string, dealId: string) {
    await prisma.documentLink.delete({ where: { id: linkId } });
    revalidatePath(`/deals/${dealId}`);
}

export async function updateDocumentLinkStatus(linkId: string, dealId: string, status: string) {
    await prisma.documentLink.update({
        where: { id: linkId },
        data: { status: status as any }
    });
    revalidatePath(`/deals/${dealId}`);
}
