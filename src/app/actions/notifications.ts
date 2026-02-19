"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getNotifications(userId: string) {
    return await prisma.notification.findMany({
        where: { userId, read: false },
        orderBy: { createdAt: 'desc' },
        take: 20
    });
}

export async function markNotificationRead(notificationId: string) {
    await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true }
    });
    revalidatePath("/");
}

export async function markAllNotificationsRead(userId: string) {
    await prisma.notification.updateMany({
        where: { userId, read: false },
        data: { read: true }
    });
    revalidatePath("/");
}
