const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const result = await prisma.$queryRaw`
      SELECT table_schema, count(*) as column_count
      FROM information_schema.columns 
      WHERE table_name = 'Deal' 
      GROUP BY table_schema;
    `;
        console.log('Schemas containing a Deal table:');
        console.table(result);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
