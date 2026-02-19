const { Client } = require('pg');

const projectRef = 'urfflntfcztmvhcsckqv';
const pass = 'kA8DNgZl0pIc18to';
const ip = '18.202.64.2';

async function testTransactionMode() {
    const url = `postgresql://postgres.${projectRef}:${pass}@${ip}:6543/postgres?pgbouncer=true`; // Transaction mode

    console.log(`Testing Transaction Mode (6543) on ${ip}`);

    const client = new Client({
        connectionString: url,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
    });

    try {
        await client.connect();
        console.log(`✅ SUCCESS! Transaction Mode works.`);
        await client.end();
        process.exit(0);
    } catch (e) {
        console.log(`❌ FAILED: ${e.message}`);
        process.exit(1);
    }
}

testTransactionMode();
