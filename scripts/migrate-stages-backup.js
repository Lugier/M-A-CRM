const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: true });

// Use the migration URL
process.env.DATABASE_URL = "postgresql://postgres.urfflntfcztmvhcsckqv:kA8DNgZl0pIc18to@18.202.64.2:5432/postgres";

const prisma = new PrismaClient();

async function main() {
    console.log('Starting migration...');

    // 1. Fetch all data that we might lose
    const members = await prisma.$queryRawUnsafe(`SELECT * FROM \"DealStageMember\"`);
    const comments = await prisma.$queryRawUnsafe(`SELECT * FROM \"Comment\" WHERE \"stage\" IS NOT NULL`);
    const deals = await prisma.deal.findMany();

    console.log(`Backed up ${members.length} members and ${comments.length} comments.`);

    // 2. Perform schema push (this might drop the old columns/enums)
    // We already edited schema.prisma. Now we need to run push.
    // I will do this outside or via exec.

    // Actually, I'll map the data first in memory
    const projectStepMap = {
        'PITCH': 'PITCH',
        'KICKOFF': 'KICKOFF',
        'LL': 'LL',
        'TEASER': 'TEASER',
        'NDA': 'NDA',
        'IM': 'IM',
        'PROZESSBRIEF': 'PROZESSBRIEF',
        'MP': 'MP',
        'NBO': 'NBO',
        'CLOSING': 'SIGNING_CLOSING',
        'ARCHIVED': 'SIGNING_CLOSING'
    };

    const kanbanStageMap = {
        'PITCH': 'PITCH',
        'KICKOFF': 'MANDATE',
        'LL': 'MANDATE',
        'TEASER': 'MANDATE',
        'NDA': 'MANDATE',
        'IM': 'MANDATE',
        'PROZESSBRIEF': 'MANDATE',
        'MP': 'MANDATE',
        'NBO': 'MANDATE',
        'CLOSING': 'CLOSING',
        'ARCHIVED': 'CLOSING'
    };

    console.log('Migration data prepared. Please run "node scripts/fix-schema-sync.js" now, then I will restore data.');

    // We will save the backup to a temp file
    const fs = require('fs');
    fs.writeFileSync('migration_backup.json', JSON.stringify({ members, comments, deals, projectStepMap, kanbanStageMap }));
    console.log('Backup saved to migration_backup.json');
}

main();
