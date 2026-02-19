const { Client } = require('pg');

const projectRef = 'urfflntfcztmvhcsckqv';
const pass = 'kA8DNgZl0pIc18to';
const poolerIPs = ['18.198.30.239', '18.198.145.223', '52.59.152.35'];
const directIPs = ['18.192.175.244', '18.192.35.155', '3.65.111.41'];

// Configs to test
const combinations = [];

// 1. Transaction Mode (Port 6543) - usually requires user=postgres.projectid
for (const ip of poolerIPs) {
    combinations.push({
        name: `Pooler ${ip}:6543 (User: postgres.${projectRef})`,
        url: `postgresql://postgres.${projectRef}:${pass}@${ip}:6543/postgres?pgbouncer=true`
    });
    combinations.push({
        name: `Pooler ${ip}:6543 (User: postgres)`,
        url: `postgresql://postgres:${pass}@${ip}:6543/postgres?pgbouncer=true`
    });
}

// 2. Session Mode (Port 5432)
for (const ip of directIPs) {
    combinations.push({
        name: `Direct ${ip}:5432 (User: postgres)`,
        url: `postgresql://postgres:${pass}@${ip}:5432/postgres`
    });
}

async function run() {
    console.log("Starting connection tests...");

    for (const c of combinations) {
        console.log(`\nTesting: ${c.name}`);
        const client = new Client({
            connectionString: c.url,
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 5000
        });

        try {
            await client.connect();
            console.log(`✅ SUCCESS! Working URL:\n${c.url}`);
            await client.end();
            // We found a working one, exit with success
            process.exit(0);
        } catch (e) {
            console.log(`❌ FAILED: ${e.message}`);
            // Don't exit, try next
        }
    }

    console.log("\nAll combinations failed.");
    process.exit(1);
}

run();
