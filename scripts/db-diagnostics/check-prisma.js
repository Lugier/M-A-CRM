require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

// Override URL locally for test
const manualUrl = "postgresql://postgres.urfflntfcztmvhcsckqv:kA8DNgZl0pIc18to@18.202.64.2:5432/postgres";

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: manualUrl
        }
    }
});

async function main() {
    console.log("Testing Prisma Connection with IP...");
    console.log("URL:", manualUrl);
    try {
        await prisma.$connect();
        console.log("✅ Prisma Connected Successfully via IP!");
        const count = await prisma.user.count();
        console.log(`User count: ${count}`);
        await prisma.$disconnect();
    } catch (e) {
        console.error("❌ Prisma Connection Failed:", e);
        await prisma.$disconnect();
        process.exit(1);
    }
}

main();
