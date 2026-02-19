const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Mapping MANDATE to KICKOFF...');

    // 1. Add KICKOFF to enum first via SQL if it doesn't exist (to allow mapping)
    try {
        await prisma.$executeRawUnsafe(`ALTER TYPE "DealStage" ADD VALUE 'KICKOFF'`);
        console.log('Added KICKOFF.');
    } catch (e) { }

    // 2. Update records
    const dealCount = await prisma.$executeRawUnsafe(
        `UPDATE "Deal" SET "stage" = 'KICKOFF' WHERE "stage"::text = 'MANDATE'`
    );
    console.log(`Updated ${dealCount} deals.`);

    const historyCount = await prisma.$executeRawUnsafe(
        `UPDATE "DealPipelineHistory" SET "stage" = 'KICKOFF' WHERE "stage"::text = 'MANDATE'`
    );
    console.log(`Updated ${historyCount} history records.`);

    console.log('Done.');
    await prisma.$disconnect();
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
