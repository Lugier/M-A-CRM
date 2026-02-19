const { Client } = require('pg');

const projectRef = 'urfflntfcztmvhcsckqv';
const pass = 'kA8DNgZl0pIc18to';
const poolerIPs = ['18.198.30.239', '18.198.145.223', '52.59.152.35'];
const directIPs = ['18.192.175.244', '18.192.35.155', '3.65.111.41'];

const combinations = [];

// Pooler variations
for (const ip of poolerIPs) {
    combinations.push({ name: `Pooler ${ip}:6543 (dot)`, url: `postgresql://postgres.${projectRef}:${pass}@${ip}:6543/postgres` });
    combinations.push({ name: `Pooler ${ip}:5432 (dot)`, url: `postgresql://postgres.${projectRef}:${pass}@${ip}:5432/postgres` });
    combinations.push({ name: `Pooler ${ip}:6543 (at)`, url: `postgresql://postgres@${projectRef}:${pass}@${ip}:6543/postgres` });
    combinations.push({ name: `Pooler ${ip}:6543 (just-ref)`, url: `postgresql://${projectRef}:${pass}@${ip}:6543/postgres` });
}

// Direct variations (port 5432)
for (const ip of directIPs) {
    combinations.push({ name: `Direct ${ip}:5432`, url: `postgresql://postgres:${pass}@${ip}:5432/postgres` });
}

async function run() {
    for (const c of combinations) {
        console.log(`Testing: ${c.name}...`);
        const client = new Client({ connectionString: c.url, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 5000 });
        try {
            await client.connect();
            console.log(`✅ SUCCESS: ${c.name}`);
            await client.end();
            process.exit(0);
        } catch (e) {
            console.log(`❌ FAILED: ${e.message}`);
        }
        console.log('---');
    }
}

run();
