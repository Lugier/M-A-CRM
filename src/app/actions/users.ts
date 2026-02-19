"use server";

import prisma from "@/lib/prisma";

export async function getUsers() {
    return await prisma.user.findMany({
        include: {
            dealTeams: {
                where: {
                    deal: { status: "ACTIVE" }
                }
            }
        },
        orderBy: { name: 'asc' }
    });
}

export async function getUserById(id: string) {
    return await prisma.user.findUnique({ where: { id } });
}
