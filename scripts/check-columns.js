const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const result = await prisma.$queryRaw`
      SELECT table_schema, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Deal' 
      ORDER BY table_schema, column_name;
    `;
        console.log('Columns in Deal table:');
        console.table(result);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
