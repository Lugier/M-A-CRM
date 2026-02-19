const { spawn } = require('child_process');
const path = require('path');

const cwd = path.resolve(__dirname);

// Directly reference node_modules JS entry points to avoid shell path issues with '&'
const prismaJs = path.join(cwd, 'node_modules', 'prisma', 'build', 'index.js');
const nextJs = path.join(cwd, 'node_modules', 'next', 'dist', 'bin', 'next');

function run(args) {
    return new Promise((resolve, reject) => {
        console.log(`> node ${args.join(' ')}`);
        const child = spawn(process.execPath, args, {
            cwd,
            stdio: 'inherit',
            env: process.env
        });
        child.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`Exited with code ${code}`));
        });
        child.on('error', reject);
    });
}

async function main() {
    console.log('=== Bachert DealFlow CRM ===');
    console.log('CWD:', cwd);

    try {
        console.log('\n1. Generating Prisma Client...');
        await run([prismaJs, 'generate']);
        console.log('   Prisma client ready!\n');
    } catch (e) {
        console.error('Prisma generate warning:', e.message);
    }

    console.log('2. Starting dev server → http://localhost:3000\n');
    const dev = spawn(process.execPath, [nextJs, 'dev'], {
        cwd,
        stdio: 'inherit',
        env: process.env
    });

    dev.on('close', (code) => {
        console.log(`Dev server exited with code ${code}`);
    });
}

main();
