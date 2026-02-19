"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { sendTeamsNotification } from "@/lib/teams";

export async function addActivityAction(dealId: string, content: string, userId: string, type: string = "NOTE") {
    // 1. Smart Detection (Type refinement)
    let finalType = type;
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes("entscheidung") || lowerContent.includes("beschlossen") || lowerContent.includes("decision")) {
        finalType = "DECISION";
    } else if (lowerContent.includes("telefon") || lowerContent.includes("anruf") || lowerContent.includes("call")) {
        finalType = "CALL";
    } else if (lowerContent.includes("email") || lowerContent.includes("mail")) {
        finalType = "EMAIL";
    } else if (lowerContent.includes("termin") || lowerContent.includes("meeting") || lowerContent.includes("besprechung")) {
        finalType = "MEETING";
    }

    // 2. Create Activity
    const activity = await prisma.activity.create({
        data: {
            content,
            type: finalType,
            dealId,
            userId
        },
        include: {
            user: true,
            deal: true
        }
    });

    // 3. Handle Mentions & Notifications
    const mentionRegex = /@(\w+)/g;
    const matches = Array.from(content.matchAll(mentionRegex));

    if (matches.length > 0) {
        const potentialNames = matches.map(m => m[1]);

        const mentionedUsers = await prisma.user.findMany({
            where: {
                OR: [
                    ...potentialNames.map(name => ({ name: { contains: name, mode: 'insensitive' as const } })),
                    ...potentialNames.map(name => ({ initials: { equals: name, mode: 'insensitive' as const } }))
                ]
            }
        });

        const activeUser = activity.user?.name || 'System';
        const dealName = activity.deal?.name || 'Unbekannt';
        const dealLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/deals/${dealId}?tab=overview`;

        // Create Internal Notifications
        const notifications = mentionedUsers
            .filter(u => u.id !== userId)
            .map(u => ({
                userId: u.id,
                type: "MENTION" as const,
                content: `${activeUser} hat Sie in einer Aktivität zu ${dealName} markiert.`,
                link: `/deals/${dealId}?tab=overview`
            }));

        if (notifications.length > 0) {
            await prisma.notification.createMany({
                data: notifications
            });

            // Send Teams Notifications in parallel
            for (const u of mentionedUsers) {
                if (u.id !== userId && u.teamsWebhookUrl) {
                    await sendTeamsNotification(u.teamsWebhookUrl, {
                        title: `Erwähnung bei ${dealName}`,
                        text: `**${activeUser}** hat dich in einer Notiz markiert:\n\n> ${content}`,
                        link: dealLink,
                        linkLabel: "Deal öffnen"
                    });
                }
            }
        }
    }

    revalidatePath(`/deals/${dealId}`);
}

export async function parseEmailAction(dealId: string, emailText: string, userId: string) {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) throw new Error("OpenAI API Key not configured");

        const prompt = `Du bist ein hocheffizienter Assistent für M&A-Berater.
        
E-MAIL TEXT:
${emailText.substring(0, 5000)}

AUFGABE:
Analysiere den Inhalt extrem prägnant. Ich brauche keine Prosa, nur Fakten.

ANTWORTE NUR ALS JSON:
{
  "subject": "Betreff",
  "from": "Absender Name",
  "summary": "Ein einziger, sehr kurzer Satz, was passiert ist (z.B. 'Unterlagen erhalten und Rückfrage zu EBIT-Bridge').",
  "todos": ["Konkrete Aufgabe (z.B. 'EBIT-Überleitung an S. Puhlmann senden')"]
}`;

        const response = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-5-mini-2025-08-07",
                reasoning: { effort: "low" },
                input: prompt
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`AI Request failed: ${err.substring(0, 100)}`);
        }

        const result = await response.json();

        // Extract content logic (simplified fro brevity, assuming same structure)
        let aiContent = "";
        if (result.output_text) aiContent = result.output_text;
        else if (result.content) aiContent = result.content;
        else if (Array.isArray(result) && result[0]?.content?.[0]?.text) aiContent = result[0].content[0].text;
        else if (result.output && Array.isArray(result.output)) {
            const messageItem = result.output.find((item: any) => item.type === "message");
            const textPart = messageItem?.content?.find((part: any) => part.type === "output_text" || part.type === "text");
            aiContent = textPart?.text || textPart?.output_text || "";
        }

        let parsed = null;
        try {
            const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
            if (jsonMatch) parsed = JSON.parse(jsonMatch[0]);
            else parsed = JSON.parse(aiContent);
        } catch (e) {
            console.error("JSON Parse Error", e);
            // Fallback: Just save text
            parsed = { summary: aiContent.substring(0, 500), subject: "E-Mail Import" };
        }

        // Format Activity Content - Compact Style
        let formattedContent = `📧 **${parsed.subject || "E-Mail"}** | Von: ${parsed.from || "?"}\n`;
        formattedContent += `> ${parsed.summary || "Keine Zusammenfassung"}`;

        if (parsed.todos && parsed.todos.length > 0) {
            formattedContent += `\n\n**To-Do:**\n${parsed.todos.map((t: string) => `- [ ] ${t}`).join('\n')}`;
        }

        // Return structured data for review instead of saving immediately
        return {
            success: true,
            data: {
                subject: parsed.subject || "E-Mail Import",
                from: parsed.from || "",
                date: parsed.date || "",
                summary: parsed.summary || "",
                todos: parsed.todos || [],
                formattedContent
            }
        };

    } catch (error: any) {
        console.error("Parse Email Error:", error);
        return { success: false, error: error.message };
    }
}

export async function createEmailLogAndTasks(
    dealId: string,
    userId: string,
    emailData: { subject: string, from: string, summary: string, formattedContent: string },
    tasks: { title: string, assignedToId: string }[]
) {
    try {
        // 1. Create the Activity
        await addActivityAction(dealId, emailData.formattedContent, userId, "EMAIL");

        // 2. Create Tasks if any
        if (tasks.length > 0) {
            await prisma.task.createMany({
                data: tasks.map(t => ({
                    title: t.title,
                    dealId,
                    assignedToId: t.assignedToId,
                    priority: "MEDIUM",
                    isCompleted: false,
                    description: `Aus E-Mail von ${emailData.from}: ${emailData.subject}`
                }))
            });

            // Notify assigned users (excluding self)
            // This is a simplified notification, ideally we batch or use the notification system more robustly
            // For now, let's rely on the Task creation. 
            // We could add a system note or notification here if needed.
        }

        revalidatePath(`/deals/${dealId}`);
        return { success: true };
    } catch (error: any) {
        console.error("Create Email Log Error:", error);
        return { success: false, error: error.message };
    }
}
