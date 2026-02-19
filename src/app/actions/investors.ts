"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addInvestorToDeal(dealId: string, organizationId: string) {
    await prisma.dealInvestor.create({
        data: { dealId, organizationId }
    });
    revalidatePath(`/deals/${dealId}/investors`);
}

export async function updateInvestorStatus(investorId: string, status: any) {
    await prisma.dealInvestor.update({
        where: { id: investorId },
        data: { status }
    });
    revalidatePath(`/deals`);
}

export async function searchInvestors(query: { ticketSize?: number, industry?: string }) {
    return await prisma.organization.findMany({
        where: {
            type: { in: ['STRATEGIC_INVESTOR', 'FINANCIAL_INVESTOR'] },
            industry: query.industry ? { contains: query.industry, mode: 'insensitive' } : undefined,
            ticketSizeMax: query.ticketSize ? { gte: query.ticketSize } : undefined,
        }
    });
}
