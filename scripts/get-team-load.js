const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany({
            include: {
                dealTeams: {
                    include: {
                        deal: true
                    }
                },
                assignedTasks: {
                    where: { isCompleted: false }
                }
            }
        });

        console.log('Team Auslastung:');
        const data = users.map(u => ({
            Name: u.name,
            Rolle: u.role,
            'Aktive Deals': u.dealTeams.filter(dt => dt.deal.status === 'ACTIVE').length,
            'Offene Aufgaben': u.assignedTasks.length
        }));
        console.table(data);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
