"use server";

import prisma from "@/lib/prisma";

export type SearchResult = {
    type: "deal" | "organization" | "contact" | "activity" | "comment";
    id: string;
    title: string;
    subtitle: string;
    href: string;
};

export async function globalSearch(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return [];

    const q = query.toLowerCase();

    const [deals, organizations, contacts, activities, comments] = await Promise.all([
        prisma.deal.findMany({
            where: {
                OR: [
                    { name: { contains: q, mode: "insensitive" } },
                    { description: { contains: q, mode: "insensitive" } },
                ]
            },
            take: 5,
            select: { id: true, name: true, stage: true, type: true }
        }),
        prisma.organization.findMany({
            where: {
                OR: [
                    { name: { contains: q, mode: "insensitive" } },
                    { industry: { contains: q, mode: "insensitive" } },
                    { city: { contains: q, mode: "insensitive" } },
                ]
            },
            take: 5,
            select: { id: true, name: true, industry: true, type: true }
        }),
        prisma.contact.findMany({
            where: {
                OR: [
                    { firstName: { contains: q, mode: "insensitive" } },
                    { lastName: { contains: q, mode: "insensitive" } },
                    { email: { contains: q, mode: "insensitive" } },
                ]
            },
            take: 5,
            include: { organization: { select: { name: true } } }
        }),
        prisma.activity.findMany({
            where: {
                content: { contains: q, mode: "insensitive" }
            },
            take: 5,
            include: { deal: { select: { name: true } }, contact: { select: { firstName: true, lastName: true } } }
        }),
        prisma.comment.findMany({
            where: {
                content: { contains: q, mode: "insensitive" }
            },
            take: 5,
            include: { deal: { select: { name: true } }, user: { select: { name: true } } }
        }),
    ]);

    const results: SearchResult[] = [];

    for (const deal of deals) {
        results.push({
            type: "deal",
            id: deal.id,
            title: deal.name,
            subtitle: `${deal.type} • ${deal.stage}`,
            href: `/deals/${deal.id}`,
        });
    }

    for (const org of organizations) {
        results.push({
            type: "organization",
            id: org.id,
            title: org.name,
            subtitle: org.industry || org.type,
            href: `/organizations/${org.id}`,
        });
    }

    for (const contact of contacts) {
        results.push({
            type: "contact",
            id: contact.id,
            title: `${contact.firstName} ${contact.lastName}`,
            subtitle: contact.organization?.name || contact.email || "Kontakt",
            href: `/contacts/${contact.id}`,
        });
    }

    for (const activity of activities) {
        results.push({
            type: "activity",
            id: activity.id,
            title: activity.content.substring(0, 40) + (activity.content.length > 40 ? "..." : ""),
            subtitle: `Aktivität • ${activity.deal?.name || "Kontakt"}`,
            href: activity.dealId ? `/deals/${activity.dealId}` : `/contacts/${activity.contactId}`,
        });
    }

    for (const comment of comments) {
        results.push({
            type: "comment",
            id: comment.id,
            title: comment.content.substring(0, 40) + (comment.content.length > 40 ? "..." : ""),
            subtitle: `Kommentar von ${comment.user.name} • ${comment.deal.name}`,
            href: `/deals/${comment.dealId}`,
        });
    }

    return results;
}
