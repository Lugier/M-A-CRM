"use server";

import prisma from "@/lib/prisma";

export async function getDashboardStats() {
    try {
        const deals = await prisma.deal.findMany({
            where: { status: "ACTIVE" },
            orderBy: { updatedAt: 'desc' },
            take: 5,
            include: {
                _count: { select: { tasks: true, investors: true } }
            }
        });

        const tasks = await prisma.task.findMany({
            where: { isCompleted: false },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                deal: { select: { name: true } }
            }
        });

        const totalVolume = await prisma.deal.aggregate({
            where: { status: "ACTIVE" },
            _sum: { expectedValue: true }
        });

        const activeCount = await prisma.deal.count({
            where: { status: "ACTIVE" }
        });

        const contactCount = await prisma.contact.count();
        const orgCount = await prisma.organization.count();
        const openTaskCount = await prisma.task.count({ where: { isCompleted: false } });

        // Stage distribution for pipeline overview
        const allDeals = await prisma.deal.findMany({
            where: { status: "ACTIVE" },
            select: { stage: true, expectedValue: true, probability: true }
        });

        const stageDistribution: Record<string, { count: number; volume: number }> = {};
        for (const d of allDeals) {
            if (!stageDistribution[d.stage]) {
                stageDistribution[d.stage] = { count: 0, volume: 0 };
            }
            stageDistribution[d.stage].count++;
            stageDistribution[d.stage].volume += d.expectedValue || 0;
        }

        // Weighted forecast
        const weightedForecast = allDeals.reduce((sum, d) => {
            return sum + ((d.expectedValue || 0) * (d.probability || 0.1));
        }, 0);

        // Team Workload
        const users = await prisma.user.findMany({
            include: {
                dealTeams: {
                    where: { deal: { status: "ACTIVE" } }
                }
            }
        });

        const teamWorkload = users.map(user => ({
            id: user.id,
            name: user.name,
            initials: user.initials,
            avatarColor: user.avatarColor,
            role: user.role,
            activeDeals: user.dealTeams.length
        })).sort((a, b) => b.activeDeals - a.activeDeals);

        return {
            deals,
            tasks,
            totalVolume: totalVolume._sum.expectedValue || 0,
            activeCount,
            contactCount,
            orgCount,
            openTaskCount,
            stageDistribution,
            weightedForecast,
            teamWorkload
        };
    } catch (error) {
        console.error("Dashboard data fetch failed:", error);
        return {
            deals: [],
            tasks: [],
            totalVolume: 0,
            activeCount: 0,
            contactCount: 0,
            orgCount: 0,
            openTaskCount: 0,
            stageDistribution: {},
            weightedForecast: 0,
        };
    }
}
