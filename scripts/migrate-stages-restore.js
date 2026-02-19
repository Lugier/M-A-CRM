const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: true });

process.env.DATABASE_URL = "postgresql://postgres.urfflntfcztmvhcsckqv:kA8DNgZl0pIc18to@18.202.64.2:5432/postgres";

const prisma = new PrismaClient();

async function main() {
    console.log('Restoring data...');

    if (!fs.existsSync('migration_backup.json')) {
        console.error('Backup file not found!');
        return;
    }

    const backup = JSON.parse(fs.readFileSync('migration_backup.json', 'utf8'));
    const { members, comments, deals, projectStepMap, kanbanStageMap } = backup;

    // 1. Recreate Deals
    console.log(`Recreating ${deals.length} deals...`);
    for (const deal of deals) {
        const oldStage = deal.stage;
        const newStage = kanbanStageMap[oldStage] || 'PITCH';
        const newStep = projectStepMap[oldStage] || 'PITCH';

        // Remove computed or relation fields that shouldn't be in create()
        const { ...dealData } = deal;
        delete dealData.investors;
        delete dealData.history;
        delete dealData.teamMembers;
        delete dealData.tasks;
        delete dealData.activities;
        delete dealData.documents;
        delete dealData.clientPortalEnabled; // Prisma will use default

        // Ensure stage and projectStep are set
        dealData.stage = newStage;
        dealData.projectStep = newStep;

        try {
            await prisma.deal.create({
                data: dealData
            });
            console.log(`Recreated deal: ${deal.name}`);
        } catch (e) {
            console.error(`Failed to recreate deal ${deal.name}:`, e.message);
        }
    }

    // 2. Restore Members
    console.log(`Restoring ${members.length} members...`);
    for (const member of members) {
        const oldStage = member.stage;
        const newStep = projectStepMap[oldStage] || 'PITCH';

        try {
            await prisma.dealStageMember.create({
                data: {
                    dealId: member.dealId,
                    userId: member.userId,
                    step: newStep
                }
            });
            console.log(`Restored member ${member.userId} to ${newStep}`);
        } catch (e) {
            console.log(`Skip duplicate/failed member: ${member.userId} in ${newStep} - ${e.message}`);
        }
    }

    // 3. Restore Comments
    console.log(`Restoring ${comments.length} comments...`);
    for (const comment of comments) {
        const oldStage = comment.stage;
        const newStep = projectStepMap[oldStage] || 'PITCH';

        try {
            await prisma.comment.create({
                data: {
                    content: comment.content,
                    userId: comment.userId,
                    dealId: comment.dealId,
                    step: newStep,
                    contactId: comment.contactId,
                    createdAt: new Date(comment.createdAt)
                }
            });
            console.log(`Restored comment for deal ${comment.dealId}`);
        } catch (e) {
            console.error(`Failed to restore comment:`, e.message);
        }
    }

    console.log('✅ Migration complete.');
}

main();
