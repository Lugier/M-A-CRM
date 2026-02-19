"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createDealAction(formData: FormData) {
    try {
        const name = formData.get("name") as string;
        const expectedValueStr = formData.get("expectedValue") as string;
        const type = formData.get("type") as string;
        const probabilityStr = formData.get("probability") as string;
        const website = formData.get("website") as string;
        const description = formData.get("description") as string;
        const revStr = formData.get("targetRevenue") as string;
        const ebitdaStr = formData.get("targetEbitda") as string;
        const empStr = formData.get("targetEmployees") as string;
        const subIndustry = formData.get("targetSubIndustry") as string;

        if (!name) {
            return { error: "Name ist erforderlich" };
        }

        const expectedValue = expectedValueStr ? parseFloat(expectedValueStr) : undefined;
        const probability = probabilityStr ? parseFloat(probabilityStr) : undefined;

        const result = await prisma.deal.create({
            data: {
                name,
                expectedValue,
                probability,
                type: (type as any) || "SELL_SIDE",
                stage: "PITCH",
                status: "ACTIVE",
                website: website || null,
                description: description || null,
                targetRevenue: revStr ? parseFloat(revStr) : null,
                targetEbitda: ebitdaStr ? parseFloat(ebitdaStr) : null,
                targetEmployees: empStr ? parseInt(empStr) : null,
                targetSubIndustry: subIndustry || null,
            }
        });

        revalidatePath("/deals");
        revalidatePath("/");

        return { success: true, id: result.id };
    } catch (error: any) {
        console.error("[createDealAction] ERROR:", error);
        return { error: error.message || "Unbekannter Fehler beim Speichern" };
    }
}
