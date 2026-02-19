const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany({
            select: { name: true, role: true }
        });
        console.log('TEAM_LIST_START');
        users.forEach(u => console.log(`${u.name} (${u.role})`));
        console.log('TEAM_LIST_END');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
