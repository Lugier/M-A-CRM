"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ActionResponse, Task as LibTask } from "@/lib/types";
import { DealStage, ProjectStep, DealTeamRole, InvestorStatus, TaskPriority } from "@prisma/client";

export async function getDealById(id: string) {
    return await prisma.deal.findUnique({
        where: { id },
        include: {
            lead: {
                include: { internalOwner: true }
            },
            investors: {
                include: {
                    organization: true,
                    contact: true
                },
                orderBy: { createdAt: 'desc' }
            },
            tasks: {
                include: { assignedTo: true },
                orderBy: { createdAt: 'desc' }
            },
            activities: {
                include: { user: true },
                orderBy: { createdAt: 'desc' }
            },
            documents: true,
            documentLinks: {
                orderBy: { createdAt: 'desc' }
            },
            history: {
                orderBy: { enteredAt: 'desc' }
            },
            tags: {
                include: { tag: true }
            },
            calendarEvents: {
                include: { user: true },
                orderBy: { startDate: 'asc' }
            },
            teamMembers: {
                include: { user: true },
                orderBy: { createdAt: 'asc' }
            },
            stageMemberships: {
                include: { user: true }
            },
            comments: {
                include: { user: true },
                orderBy: { createdAt: 'desc' }
            }
        } as any
    }) as any;
}

export async function updateDealAction(dealId: string, data: any): Promise<ActionResponse> {
    try {
        await prisma.deal.update({
            where: { id: dealId },
            data: {
                ...data,
            }
        });
        revalidatePath(`/deals/${dealId}`);
        revalidatePath("/deals");
        return { success: true };
    } catch (error: any) {
        console.error("[updateDealAction] ERROR:", error);
        if (error.message?.includes("Unknown argument `website`")) {
            return { success: false, error: "Datenbank-Client muss aktualisiert werden. Bitte stoppen Sie den Server und führen Sie 'npx prisma generate' aus." };
        }
        return { success: false, error: error.message || "Fehler beim Aktualisieren" };
    }
}

export async function updateDealStageAction(dealId: string, stage: DealStage): Promise<ActionResponse> {
    try {
        const lastHistory = await prisma.dealPipelineHistory.findFirst({
            where: { dealId, exitedAt: null },
            orderBy: { enteredAt: 'desc' }
        });
        if (lastHistory) {
            await prisma.dealPipelineHistory.update({
                where: { id: lastHistory.id },
                data: { exitedAt: new Date() }
            });
        }

        await prisma.deal.update({
            where: { id: dealId },
            data: { stage }
        });

        await prisma.dealPipelineHistory.create({
            data: { dealId, stage }
        });

        revalidatePath(`/deals/${dealId}`);
        revalidatePath("/deals");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Fehler beim Aktualisieren der Phase" };
    }
}

export async function updateProjectStepAction(dealId: string, step: ProjectStep): Promise<ActionResponse> {
    try {
        await prisma.deal.update({
            where: { id: dealId },
            data: { projectStep: step }
        });

        revalidatePath(`/deals/${dealId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Fehler beim Aktualisieren des Projektschritts" };
    }
}

export async function addTaskAction(dealId: string, title: string, priority?: TaskPriority, assignedToId?: string, category?: string): Promise<ActionResponse> {
    try {
        await prisma.task.create({
            data: {
                title,
                dealId,
                isCompleted: false,
                priority: priority || "MEDIUM",
                assignedToId: assignedToId || null,
                category: category || null,
            }
        });
        revalidatePath(`/deals/${dealId}`);
        revalidatePath("/dashboard");
        revalidatePath("/tasks");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: "Fehler beim Erstellen der Aufgabe" };
    }
}

export async function toggleTaskAction(taskId: string, isCompleted: boolean): Promise<ActionResponse> {
    try {
        await prisma.task.update({
            where: { id: taskId },
            data: { isCompleted }
        });
        revalidatePath("/deals");
        revalidatePath("/tasks");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: "Fehler beim Aktualisieren der Aufgabe" };
    }
}

export async function updateTaskAction(taskId: string, data: Partial<LibTask>): Promise<ActionResponse> {
    try {
        await prisma.task.update({
            where: { id: taskId },
            data: data as any
        });
        revalidatePath("/deals");
        revalidatePath("/tasks");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function addDealTeamMemberAction(dealId: string, userId: string, role: DealTeamRole): Promise<ActionResponse> {
    try {
        await prisma.dealTeamMember.upsert({
            where: { dealId_userId: { dealId, userId } },
            create: { dealId, userId, role: role || "SUPPORT" },
            update: { role: role || "SUPPORT" }
        });
        revalidatePath(`/deals/${dealId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: "Fehler beim Hinzufügen zum Team" };
    }
}

export async function removeDealTeamMemberAction(dealId: string, userId: string): Promise<ActionResponse> {
    try {
        await prisma.dealTeamMember.delete({
            where: { dealId_userId: { dealId, userId } }
        });
        revalidatePath(`/deals/${dealId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: "Fehler beim Entfernen vom Team" };
    }
}

export async function addInvestorToDealAction(dealId: string, organizationId: string, contactId?: string): Promise<ActionResponse> {
    try {
        const exists = await prisma.dealInvestor.findUnique({
            where: { dealId_organizationId: { dealId, organizationId } }
        });

        if (!exists) {
            await prisma.dealInvestor.create({
                data: {
                    dealId,
                    organizationId,
                    status: "LONGLIST",
                    contactId: contactId || undefined
                }
            });
        }
        revalidatePath(`/deals/${dealId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: "Fehler beim Hinzufügen des Investors" };
    }
}

export async function updateInvestorStatusAction(dealId: string, organizationId: string, status: InvestorStatus): Promise<ActionResponse> {
    try {
        const updateData: any = { status };
        const now = new Date();
        if (status === "NDA_SENT") updateData.ndaSentAt = now;
        if (status === "NDA_SIGNED") updateData.ndaSignedAt = now;
        if (status === "IM_SENT") updateData.imSentAt = now;
        if (status === "CONTACTED") updateData.emailSentAt = now;

        await prisma.dealInvestor.update({
            where: { dealId_organizationId: { dealId, organizationId } },
            data: updateData
        });
        revalidatePath(`/deals/${dealId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: "Fehler beim Aktualisieren des Investor-Status" };
    }
}

export async function updateDealInvestorAction(dealId: string, organizationId: string, data: any): Promise<ActionResponse> {
    try {
        const { type, ...updateData } = data; // Remove type if present (legacy field)
        await prisma.dealInvestor.update({
            where: { dealId_organizationId: { dealId, organizationId } },
            data: updateData
        });
        revalidatePath(`/deals/${dealId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: "Fehler beim Aktualisieren des Investors" };
    }
}

export async function getOrganizationDetailsAction(organizationId: string) {
    try {
        return await prisma.organization.findUnique({
            where: { id: organizationId },
            include: { contacts: true }
        });
    } catch (error) {
        return null;
    }
}

export async function createContactForDealAction(dealId: string, organizationId: string, data: any): Promise<ActionResponse<{ contactId: string }>> {
    try {
        const contact = await prisma.contact.create({
            data: {
                organizationId,
                title: data.title,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                phone: data.phone,
                role: data.role
            }
        });
        await addInvestorToDealAction(dealId, organizationId, contact.id);
        revalidatePath(`/deals/${dealId}`);
        return { success: true, data: { contactId: contact.id } };
    } catch (error: any) {
        return { success: false, error: error.message || "Fehler beim Erstellen des Kontakts" };
    }
}

export async function createUnifiedInvestorAction(dealId: string, data: {
    org: {
        id?: string;
        name: string;
        industry?: string;
        description?: string;
        address?: string;
        type?: any;
        website?: string;
        ticketSizeMin?: number;
        ticketSizeMax?: number;
        aum?: number;
        revenue?: number;
        employees?: number;
    };
    contact?: { id?: string; title?: string; firstName: string; lastName: string; email?: string; phone?: string; role?: string; };
}): Promise<ActionResponse> {
    try {
        let organizationId = data.org.id;
        if (!organizationId) {
            const org = await prisma.organization.create({
                data: {
                    name: data.org.name,
                    industry: data.org.industry || null,
                    description: data.org.description || null,
                    address: data.org.address || null,
                    type: data.org.type || "OTHER",
                    website: data.org.website || null,
                    ticketSizeMin: data.org.ticketSizeMin || null,
                    ticketSizeMax: data.org.ticketSizeMax || null,
                    aum: data.org.aum || null,
                    revenue: data.org.revenue || null,
                    employees: data.org.employees || null,
                }
            });
            organizationId = org.id;
        }

        let contactId = data.contact?.id;
        if (!contactId && data.contact?.lastName) {
            const contact = await prisma.contact.create({
                data: {
                    organizationId,
                    title: data.contact.title || null,
                    firstName: data.contact.firstName,
                    lastName: data.contact.lastName,
                    email: data.contact.email || null,
                    phone: data.contact.phone || null,
                    role: data.contact.role || null,
                }
            });
            contactId = contact.id;
        }

        if (!contactId && organizationId) {
            const firstContact = await prisma.contact.findFirst({
                where: { organizationId },
                orderBy: { createdAt: 'asc' }
            });
            if (firstContact) {
                contactId = firstContact.id;
            }
        }

        const exists = await prisma.dealInvestor.findUnique({
            where: { dealId_organizationId: { dealId, organizationId } }
        });

        if (!exists) {
            await prisma.dealInvestor.create({
                data: { dealId, organizationId, contactId: contactId || null, status: "LONGLIST" }
            });
        }

        revalidatePath(`/deals/${dealId}`);
        revalidatePath("/organizations");
        revalidatePath("/contacts");
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message || "Fehler beim Erstellen des Investors" };
    }
}

export async function addActivityAction(dealId: string, type: string, content: string, userId?: string): Promise<ActionResponse> {
    try {
        await prisma.activity.create({
            data: { dealId, type, content, userId: userId || null }
        });
        revalidatePath(`/deals/${dealId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateClientPortalSettings(dealId: string, enabled: boolean, password?: string): Promise<ActionResponse> {
    try {
        await prisma.deal.update({
            where: { id: dealId },
            data: { clientPortalEnabled: enabled, clientPortalPassword: password || null }
        });
        revalidatePath(`/deals/${dealId}`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getClientPortalData(dealId: string) {
    const deal = await prisma.deal.findUnique({
        where: { id: dealId },
        select: {
            id: true, name: true, type: true, stage: true, projectStep: true, status: true,
            clientPortalEnabled: true, clientPortalPassword: true,
            createdAt: true, updatedAt: true,
            investors: {
                select: {
                    status: true, createdAt: true,
                    ndaSentAt: true, ndaSignedAt: true,
                    imSentAt: true,
                }
            },
            history: { orderBy: { enteredAt: 'asc' } }
        }
    });
    if (!deal || !deal.clientPortalEnabled) return null;

    const stats = {
        totalInvestors: deal.investors.length,
        contacted: deal.investors.filter(i => i.status !== "LONGLIST" && i.status !== "SHORTLIST").length,
        ndaSigned: deal.investors.filter(i => i.ndaSignedAt).length,
        imSent: deal.investors.filter(i => i.imSentAt).length,
        bidsReceived: deal.investors.filter(i => i.status === "BID_RECEIVED").length,
    };

    return { deal, stats };
}
