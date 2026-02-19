"use server";

import prisma from "@/lib/prisma";

export async function checkTriggers(dealId: string, oldStage: string, newStage: string) {
    if (newStage === "DD") {
        await prisma.task.create({
            data: {
                title: "VDR einrichten",
                description: "Virtuellen Datenraum für Due Diligence vorbereiten.",
                dealId
            }
        });
    }
}
