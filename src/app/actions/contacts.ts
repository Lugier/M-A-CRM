"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ActionResponse } from "@/lib/types";
import { OrganizationType } from "@prisma/client";

export async function getContacts() {
    try {
        return await prisma.contact.findMany({
            include: {
                organization: true,
                _count: {
                    select: { deals: true }
                }
            },
            orderBy: { lastName: 'asc' }
        });
    } catch (error) {
        console.error("Failed to fetch contacts:", error);
        return [];
    }
}

export async function getContactById(id: string) {
    try {
        return await prisma.contact.findUnique({
            where: { id },
            include: {
                organization: true,
                deals: true,
                tasks: {
                    include: {
                        deal: true
                    },
                    orderBy: { createdAt: 'desc' }
                },
                activities: {
                    orderBy: { createdAt: 'desc' }
                },
                connectionsFrom: {
                    where: { type: "INTRODUCED_BY" },
                    include: { to: true }
                },
                connectionsTo: {
                    where: { type: "INTRODUCED_BY" },
                    include: { from: true }
                },
                internalOwner: true,
                investorDeals: {
                    include: {
                        deal: true
                    }
                },
                comments: {
                    include: {
                        user: true
                    }
                }
            }
        });
    } catch (error) {
        console.error("Failed to fetch contact:", error);
        return null;
    }
}

export async function createContact(formData: FormData): Promise<ActionResponse<{ id: string }>> {
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const role = formData.get("role") as string;
    let organizationId = formData.get("organizationId") as string;
    const internalOwnerId = formData.get("internalOwnerId") as string;

    const newOrgName = formData.get("newOrgName") as string;
    const newOrgType = formData.get("newOrgType") as OrganizationType;
    const newOrgIndustry = formData.get("newOrgIndustry") as string;

    if (!lastName) return { success: false, error: "Nachname ist erforderlich" };

    try {
        if (organizationId === "NEW" && newOrgName) {
            const org = await prisma.organization.create({
                data: {
                    name: newOrgName,
                    type: newOrgType || OrganizationType.OTHER,
                    industry: newOrgIndustry || null,
                }
            });
            organizationId = org.id;
        }

        const contact = await prisma.contact.create({
            data: {
                firstName: firstName || "",
                lastName,
                email: email || null,
                phone: phone || null,
                role: role || null,
                organizationId: (organizationId && organizationId !== "NEW") ? organizationId : null,
                internalOwnerId: (internalOwnerId && internalOwnerId !== "NONE") ? internalOwnerId : null
            }
        });

        const introducedById = formData.get("introducedById") as string;
        if (introducedById && introducedById !== "NONE") {
            await prisma.contactConnection.create({
                data: {
                    fromId: introducedById,
                    toId: contact.id,
                    type: "INTRODUCED_BY"
                }
            });
        }

        revalidatePath("/contacts");
        revalidatePath("/organizations");
        return { success: true, data: { id: contact.id } };
    } catch (error: any) {
        console.error("Failed to create contact:", error);
        return { success: false, error: error.message || "Fehler beim Erstellen des Kontakts" };
    }
}

export async function updateContact(id: string, formData: FormData): Promise<ActionResponse> {
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const role = formData.get("role") as string;
    const organizationId = formData.get("organizationId") as string;
    const internalOwnerId = formData.get("internalOwnerId") as string;

    if (!lastName) return { success: false, error: "Nachname ist erforderlich" };

    try {
        await prisma.contact.update({
            where: { id },
            data: {
                firstName,
                lastName,
                email: email || null,
                phone: phone || null,
                role: role || null,
                organizationId: organizationId || null,
                internalOwnerId: (internalOwnerId && internalOwnerId !== "NONE") ? internalOwnerId : null
            }
        });

        revalidatePath("/contacts");
        revalidatePath(`/contacts/${id}`);
        return { success: true };
    } catch (error: any) {
        console.error("Failed to update contact:", error);
        return { success: false, error: error.message || "Fehler beim Aktualisieren des Kontakts" };
    }
}

export async function deleteContact(id: string): Promise<ActionResponse> {
    try {
        await prisma.contact.delete({ where: { id } });
        revalidatePath("/contacts");
        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete contact:", error);
        return { success: false, error: error.message || "Fehler beim Löschen des Kontakts" };
    }
}
