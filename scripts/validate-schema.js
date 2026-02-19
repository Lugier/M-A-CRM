const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), override: true });

const prismaBin = path.join(__dirname, '..', 'node_modules', 'prisma', 'build', 'index.js');
console.log('Validating schema...');

const child = spawn(process.execPath, [prismaBin, 'validate'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    env: process.env
});

child.on('close', (code) => {
    process.exit(code);
});
