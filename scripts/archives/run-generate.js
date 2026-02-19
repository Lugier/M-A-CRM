const { spawn } = require('child_process');
const path = require('path');

console.log('Führe Prisma Generate aus...');
console.log('BITTE SICHERSTELLEN, DASS DER DEV-SERVER (node run-dev.js) GESTOPPT IST!');

const prismaBin = path.join(__dirname, 'node_modules', 'prisma', 'build', 'index.js');

const child = spawn(process.execPath, [prismaBin, 'generate'], {
    cwd: __dirname,
    stdio: 'inherit',
    env: process.env
});

child.on('close', (code) => {
    if (code === 0) {
        console.log('✅ Erfolgreich! Der Prisma Client ist aktualisiert.');
        console.log('Du kannst den Dev-Server jetzt wieder starten: node run-dev.js');
    } else {
        console.error('❌ Fehler: Wahrscheinlich läuft der Dev-Server noch und blockiert die Dateien.');
    }
});
