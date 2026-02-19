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

        console.log('--- AUSLASTUNG START ---');
        users.forEach(u => {
            const activeDeals = u.dealTeams.filter(dt => dt.deal.status === 'ACTIVE').length;
            const openTasks = u.assignedTasks.length;
            console.log(`${u.name}: ${activeDeals} Deals, ${openTasks} Aufgaben`);
        });
        console.log('--- AUSLASTUNG END ---');
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
