const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function migrate() {
    console.log('Migrating Organization types...');

    // BUYER -> STRATEGIC_INVESTOR
    const buyers = await prisma.organization.updateMany({
        where: { type: 'BUYER' },
        data: { type: 'STRATEGIC_INVESTOR' }
    });
    console.log(`Updated ${buyers.count} BUYER -> STRATEGIC_INVESTOR`);

    // PE_FUND -> FINANCIAL_INVESTOR
    const pe = await prisma.organization.updateMany({
        where: { type: 'PE_FUND' },
        data: { type: 'FINANCIAL_INVESTOR' }
    });
    console.log(`Updated ${pe.count} PE_FUND -> FINANCIAL_INVESTOR`);

    // VC -> FINANCIAL_INVESTOR
    const vc = await prisma.organization.updateMany({
        where: { type: 'VC' },
        data: { type: 'FINANCIAL_INVESTOR' }
    });
    console.log(`Updated ${vc.count} VC -> FINANCIAL_INVESTOR`);

    // TARGET -> OTHER
    const target = await prisma.organization.updateMany({
        where: { type: 'TARGET' },
        data: { type: 'OTHER' }
    });
    console.log(`Updated ${target.count} TARGET -> OTHER`);

    console.log('✅ Migration complete.');
    await prisma.$disconnect();
}

migrate().catch(e => {
    console.error(e);
    process.exit(1);
});
