const { execSync } = require('child_process');
const path = require('path');

const cwd = path.resolve(__dirname);
console.log('Working directory:', cwd);

try {
    console.log('\n=== Prisma Validate ===');
    execSync('npx prisma validate', { stdio: 'inherit', cwd, shell: 'cmd.exe' });
    console.log('Prisma schema: OK');
} catch (e) {
    console.error('Prisma validate failed');
}

try {
    console.log('\n=== Next.js Build ===');
    execSync('npx next build', { stdio: 'inherit', cwd, shell: 'cmd.exe', timeout: 120000 });
    console.log('\nBuild: SUCCESS');
} catch (e) {
    console.error('\nBuild failed - check errors above');
    process.exit(1);
}
