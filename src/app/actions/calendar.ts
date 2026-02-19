"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCalendarEvents(dealId?: string) {
    const whereEvent: any = {};
    const whereTask: any = { dueDate: { not: null } };

    if (dealId) {
        whereEvent.dealId = dealId;
        whereTask.dealId = dealId;
    }

    const [events, tasks] = await Promise.all([
        prisma.calendarEvent.findMany({
            where: whereEvent,
            include: { deal: true, user: true },
            orderBy: { startDate: 'asc' }
        }),
        prisma.task.findMany({
            where: whereTask,
            include: { deal: true, assignedTo: true },
            orderBy: { dueDate: 'asc' }
        })
    ]);

    // Map tasks to event format
    const taskEvents = tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        startDate: task.dueDate,
        endDate: task.dueDate, // Tasks are point-in-time or all-day
        allDay: true,
        type: "TASK",
        location: null,
        dealId: task.dealId,
        userId: task.assignedToId,
        deal: task.deal,
        user: task.assignedTo,
        isTask: true, // Marker to distinguish
        priority: task.priority,
        isCompleted: task.isCompleted
    }));

    // Combine and sort
    return [...events, ...taskEvents].sort((a, b) =>
        new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime()
    );
}

export async function createCalendarEvent(data: {
    title: string;
    description?: string;
    startDate: string;
    endDate?: string;
    allDay?: boolean;
    type?: string;
    location?: string;
    dealId?: string;
    userId?: string;
}) {
    try {
        const event = await prisma.calendarEvent.create({
            data: {
                title: data.title,
                description: data.description || null,
                startDate: new Date(data.startDate),
                endDate: data.endDate ? new Date(data.endDate) : null,
                allDay: data.allDay || false,
                type: (data.type as any) || "MEETING",
                location: data.location || null,
                dealId: data.dealId || null,
                userId: data.userId || null,
            }
        });
        revalidatePath("/");
        return { success: true, event };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function deleteCalendarEvent(eventId: string) {
    try {
        await prisma.calendarEvent.delete({ where: { id: eventId } });
        revalidatePath("/");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function getUpcomingEvents(limit: number = 5) {
    return await prisma.calendarEvent.findMany({
        where: { startDate: { gte: new Date() } },
        include: { deal: true, user: true },
        orderBy: { startDate: 'asc' },
        take: limit,
    });
}
