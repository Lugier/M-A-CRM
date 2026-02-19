const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Attempting prisma.deal.findMany()...');
        const deals = await prisma.deal.findMany({
            select: {
                id: true,
                isSuccessful: true
            }
        });
        console.log('Success! Found', deals.length, 'deals.');
        if (deals.length > 0) {
            console.log('First deal isSuccessful:', deals[0].isSuccessful);
        }
    } catch (e) {
        console.error('FAILED with error:');
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
