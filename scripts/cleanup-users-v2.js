const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const correctTeam = [
    { name: "Lukas Ogiermann", role: "ASSOCIATE", email: "logiermann@bachert-partner.de" },
    { name: "Colin Roberts", role: "ASSOCIATE", email: "croberts@bachert-partner.de" },
    { name: "Lennard Swan", role: "ASSOCIATE", email: "lswan@bachert-partner.de" },
    { name: "Alexander Becker", role: "DIRECTOR", email: "abecker@bachert-partner.de" },
    { name: "Thomas Klapsia", role: "DIRECTOR", email: "tklapsia@bachert-partner.de" },
    { name: "Tobias Spreitzer", role: "PARTNER", email: "tspreitzer@bachert-partner.de" },
    { name: "Alexander Flor", role: "INTERN", email: "aflor@bachert-partner.de" },
    { name: "Sebastian Schwab", role: "INTERN", email: "sschwab@bachert-partner.de" }
];

async function main() {
    console.log("Cleaning up and consolidating users...");

    for (const member of correctTeam) {
        // 1. Find all users with this name (case insensitive)
        const users = await prisma.user.findMany({
            where: { name: { equals: member.name, mode: 'insensitive' } }
        });

        if (users.length === 0) {
            // Create if doesn't exist at all
            const initials = member.name.split(" ").map(n => n[0]).join("").toUpperCase();
            await prisma.user.create({
                data: {
                    name: member.name,
                    email: member.email,
                    role: member.role,
                    initials,
                    avatarColor: "#" + Math.floor(Math.random() * 16777215).toString(16)
                }
            });
            console.log(`Created new user: ${member.name}`);
            continue;
        }

        // 2. We have at least one user. Pick the first one as "master" and update it.
        const master = users[0];
        await prisma.user.update({
            where: { id: master.id },
            data: {
                email: member.email,
                role: member.role,
                name: member.name
            }
        });
        console.log(`Updated master user: ${member.name} (Role: ${member.role}, Email: ${member.email})`);

        // 3. Delete all other users with the same name
        const others = users.slice(1);
        for (const other of others) {
            console.log(`Deleting duplicate: ${other.name} (${other.email})`);
            // Reassign relations to master before deleting
            await prisma.dealTeamMember.updateMany({ where: { userId: other.id }, data: { userId: master.id } }).catch(() => { });
            await prisma.task.updateMany({ where: { assignedToId: other.id }, data: { assignedToId: master.id } }).catch(() => { });
            await prisma.activity.updateMany({ where: { userId: other.id }, data: { userId: master.id } }).catch(() => { });
            await prisma.calendarEvent.updateMany({ where: { userId: other.id }, data: { userId: master.id } }).catch(() => { });

            await prisma.user.delete({ where: { id: other.id } });
        }
    }

    // 4. One final check for the "@bachert.de" duplicates that might have different names slightly
    const bachertDeUsers = await prisma.user.findMany({
        where: { email: { contains: "@bachert.de" } }
    });

    for (const u of bachertDeUsers) {
        console.log(`Removing leftover @bachert.de user: ${u.email}`);
        await prisma.dealTeamMember.deleteMany({ where: { userId: u.id } }).catch(() => { });
        await prisma.user.delete({ where: { id: u.id } }).catch(() => { });
    }

    console.log("Cleanup complete!");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
