"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getOrganizations() {
    try {
        return await prisma.organization.findMany({
            include: {
                _count: {
                    select: { contacts: true, investorDeals: true }
                }
            },
            orderBy: { name: 'asc' }
        });
    } catch (error) {
        console.error("Failed to fetch organizations:", error);
        return [];
    }
}

export async function getOrganizationById(id: string) {
    try {
        return await prisma.organization.findUnique({
            where: { id },
            include: {
                contacts: true,
                investorDeals: {
                    include: {
                        deal: true
                    }
                }
            }
        });
    } catch (error) {
        console.error("Failed to fetch organization:", error);
        return null;
    }
}

export async function createOrganization(formData: FormData) {
    const name = formData.get("name") as string;
    const industry = formData.get("industry") as string;
    const type = formData.get("type") as string;
    const address = formData.get("address") as string;
    const description = formData.get("description") as string;
    const website = formData.get("website") as string;
    const ticketSizeMin = formData.get("ticketSizeMin") as string;
    const ticketSizeMax = formData.get("ticketSizeMax") as string;
    const aum = formData.get("aum") as string;

    if (!name) return { error: "Name ist erforderlich" };

    try {
        const org = await prisma.organization.create({
            data: {
                name,
                industry: industry || null,
                type: (type as any) || "OTHER",
                address: address || null,
                description: description || null,
                website: website || null,
                ticketSizeMin: ticketSizeMin ? parseFloat(ticketSizeMin) : null,
                ticketSizeMax: ticketSizeMax ? parseFloat(ticketSizeMax) : null,
                aum: aum ? parseFloat(aum) : null,
                revenue: formData.get("revenue") ? parseFloat(formData.get("revenue") as string) : null,
                employees: formData.get("employees") ? parseInt(formData.get("employees") as string) : null,
            }
        });

        revalidatePath("/organizations");
        revalidatePath("/investors");
        return { success: true, id: org.id };
    } catch (error: any) {
        console.error("Failed to create organization:", error);
        return { error: error.message || "Fehler beim Erstellen der Organisation" };
    }
}

export async function updateOrganization(id: string, formData: FormData) {
    const name = formData.get("name") as string;
    const industry = formData.get("industry") as string;
    const type = formData.get("type") as string;
    const address = formData.get("address") as string;
    const description = formData.get("description") as string;
    const website = formData.get("website") as string;
    const ticketSizeMin = formData.get("ticketSizeMin") as string;
    const ticketSizeMax = formData.get("ticketSizeMax") as string;
    const aum = formData.get("aum") as string;

    if (!name) return { error: "Name ist erforderlich" };

    try {
        await prisma.organization.update({
            where: { id },
            data: {
                name,
                industry: industry || null,
                type: (type as any) || "OTHER",
                address: address || null,
                description: description || null,
                website: website || null,
                ticketSizeMin: ticketSizeMin ? parseFloat(ticketSizeMin) : null,
                ticketSizeMax: ticketSizeMax ? parseFloat(ticketSizeMax) : null,
                aum: aum ? parseFloat(aum) : null,
                revenue: formData.get("revenue") ? parseFloat(formData.get("revenue") as string) : null,
                employees: formData.get("employees") ? parseInt(formData.get("employees") as string) : null,
            }
        });

        revalidatePath("/organizations");
        revalidatePath(`/organizations/${id}`);
        revalidatePath("/investors");
        return { success: true };
    } catch (error: any) {
        console.error("Failed to update organization:", error);
        return { error: error.message || "Fehler beim Aktualisieren der Organisation" };
    }
}

export async function deleteOrganization(id: string) {
    try {
        await prisma.organization.delete({ where: { id } });
        revalidatePath("/organizations");
        revalidatePath("/investors");
        return { success: true };
    } catch (error: any) {
        console.error("Failed to delete organization:", error);
        return { error: error.message || "Fehler beim Löschen der Organisation" };
    }
}
