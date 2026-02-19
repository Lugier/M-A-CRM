const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const result = await prisma.$queryRaw`
      SELECT table_name, table_schema
      FROM information_schema.tables 
      WHERE table_name ILIKE 'deal';
    `;
        console.log('Tables matching deal:');
        console.table(result);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
