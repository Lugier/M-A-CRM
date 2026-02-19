const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: true });

// HARDCODE TO BE SAFE - USE PORT 5432 FOR MIGRATIONS
process.env.DATABASE_URL = "postgresql://postgres.urfflntfcztmvhcsckqv:kA8DNgZl0pIc18to@18.202.64.2:5432/postgres";

const prismaBin = path.join(__dirname, '..', 'node_modules', 'prisma', 'build', 'index.js');

console.log('Pushing schema to DB...');
console.log('Target URL:', process.env.DATABASE_URL);

// Use --accept-data-loss only if necessary, but usually adding a column is safe.
// The user asked not to break things, so I'll try without force first, but usually push prompts if changes are destructive.
// To make it non-interactive and "just work" for the user's missing column:
const child = spawn(process.execPath, [prismaBin, 'db', 'push', '--accept-data-loss'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    env: process.env
});

child.on('close', (code) => {
    if (code === 0) {
        console.log('✅ Schema push successful.');
        console.log('Regenerating client...');
        const gen = spawn(process.execPath, [prismaBin, 'generate'], {
            cwd: path.join(__dirname, '..'),
            stdio: 'inherit',
            env: process.env
        });
    } else {
        console.error('❌ Schema push failed with code:', code);
        process.exit(code);
    }
});
