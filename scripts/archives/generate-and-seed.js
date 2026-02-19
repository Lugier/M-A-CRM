const { spawn } = require('child_process');
const path = require('path');

process.env.DATABASE_URL = "postgresql://postgres:kA8DNgZl0pIc18to@db.urfflntfcztmvhcsckqv.supabase.co:6543/postgres?pgbouncer=true";

const prismaBin = path.join(__dirname, 'node_modules', 'prisma', 'build', 'index.js');

console.log('Generating Prisma Client...');
const gen = spawn(process.execPath, [prismaBin, 'generate'], {
    cwd: __dirname,
    env: process.env
});

gen.stdout.on('data', (data) => console.log(`${data}`));
gen.stderr.on('data', (data) => console.error(`${data}`));
gen.on('close', (code) => {
    console.log(`Generate exited with code ${code}`);
    if (code === 0) {
        console.log('Now seeding...');
        const seed = spawn(process.execPath, [path.join(__dirname, 'prisma', 'seed.js')], {
            cwd: __dirname,
            env: process.env
        });
        seed.stdout.on('data', (data) => console.log(`${data}`));
        seed.stderr.on('data', (data) => console.error(`${data}`));
        seed.on('close', (c) => console.log(`Seed exited with code ${c}`));
    }
});
