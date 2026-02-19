"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getUserTasks(userId: string) {
    try {
        return await prisma.task.findMany({
            where: {
                // @ts-ignore
                assignedToId: userId,
                isCompleted: false
            },
            include: {
                deal: { select: { id: true, name: true } }
            },
            orderBy: { dueDate: 'asc' },
            take: 5
        });
    } catch (error) {
        return [];
    }
}

export async function getTasks() {
    return await prisma.task.findMany({
        include: {
            assignedTo: true,
            deal: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'desc' }
    });
}

export async function toggleTaskCompletion(taskId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) return;

    await prisma.task.update({
        where: { id: taskId },
        data: { isCompleted: !task.isCompleted }
    });
    revalidatePath("/tasks");
}

export async function deleteTask(taskId: string) {
    await prisma.task.delete({ where: { id: taskId } });
    revalidatePath("/tasks");
}
