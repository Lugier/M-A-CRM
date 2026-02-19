"use server";

import prisma from "@/lib/prisma";

export async function getUserProfile(userId: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                dealTeams: {
                    include: {
                        deal: {
                            include: {
                                investors: {
                                    select: { id: true, status: true }
                                },
                                tasks: {
                                    where: { isCompleted: false },
                                    select: { id: true }
                                }
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                assignedTasks: {
                    include: {
                        deal: {
                            select: { id: true, name: true }
                        }
                    },
                    orderBy: [
                        { isCompleted: 'asc' },
                        { dueDate: 'asc' }
                    ]
                },
                activities: {
                    take: 20,
                    orderBy: { createdAt: 'desc' },
                    include: {
                        deal: {
                            select: { id: true, name: true }
                        }
                    }
                },
                calendarEvents: {
                    take: 10,
                    orderBy: { startDate: 'asc' },
                    where: { startDate: { gte: new Date() } },
                    include: {
                        deal: {
                            select: { id: true, name: true }
                        }
                    }
                },
                ownedContacts: {
                    include: {
                        organization: {
                            select: { id: true, name: true }
                        }
                    },
                    orderBy: { lastName: 'asc' }
                }
            }
        });

        if (!user) return null;

        // Explicitly cast or handle the types for stats calculation
        const u = user as any;
        const activeDeals = u.dealTeams.filter((dt: any) => dt.deal.status === 'ACTIVE');
        const openTasks = u.assignedTasks.filter((t: any) => !t.isCompleted);
        const now = new Date();
        const overdueTasks = openTasks.filter((t: any) => t.dueDate && new Date(t.dueDate) < now);

        return {
            ...u,
            stats: {
                activeDealsCount: activeDeals.length,
                totalOpenTasks: openTasks.length,
                overdueTasksCount: overdueTasks.length,
                completedTasksCount: u.assignedTasks.filter((t: any) => t.isCompleted).length
            }
        };
    } catch (error) {
        console.error("Failed to fetch user profile:", error);
        return null;
    }
}
