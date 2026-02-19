const { PrismaClient } = require('@prisma/client');

async function main() {
    const prisma = new PrismaClient();
    try {
        console.log('Testing connection...');
        const users = await prisma.user.findMany({ take: 1 });
        console.log('Success!', users);
    } catch (e) {
        console.error('Connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
