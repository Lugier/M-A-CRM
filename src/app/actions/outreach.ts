"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/email";

export async function sendOutreachEmail(dealId: string, organizationId: string, subject: string, body: string) {
    try {
        const dealInvestor = await prisma.dealInvestor.findUnique({
            where: { dealId_organizationId: { dealId, organizationId } },
            include: { contact: true, organization: true }
        });

        // Use contact email if available, otherwise fallback (or handle error)
        const recipientEmail = dealInvestor?.contact?.email || "investor@example.com";

        // 1. Send Email (Mock)
        const emailResult = await sendEmail({
            to: recipientEmail,
            subject,
            html: body.replace(/\n/g, "<br>")
        });

        if (!emailResult.success) throw new Error("Email Service failed");

        // 2. Update Status & Log
        await prisma.dealInvestor.update({
            where: { dealId_organizationId: { dealId, organizationId } },
            data: {
                status: "CONTACTED",
                contactedVia: "email",
                emailSubject: subject,
                emailBody: body,
                emailSentAt: new Date(),
            }
        });

        // 3. Create Activity Log
        await prisma.activity.create({
            data: {
                dealId,
                type: "EMAIL",
                content: `Email an ${dealInvestor?.organization.name} (${recipientEmail}): ${subject}`,
                contactId: dealInvestor?.contactId
            }
        });

        revalidatePath(`/deals/${dealId}`);
        return { success: true };
    } catch (error: any) {
        console.error("Outreach error:", error);
        return { error: error.message || "Fehler beim Senden der Email" };
    }
}
