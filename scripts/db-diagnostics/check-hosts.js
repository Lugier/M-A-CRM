const { Client } = require('pg');

const url = "postgresql://postgres:kA8DNgZl0pIc18to@db.urfflntfcztmvhcsckqv.supabase.co:6543/postgres?pgbouncer=true";

async function testFinal() {
    console.log("Testing Hostname Connection (expecting hosts file override)...");
    console.log(`URL: ${url}`);

    // Force IPv4 is not a standard pg option, but let's see if OS resolution handles it.
    const client = new Client({
        connectionString: url,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000
    });

    try {
        await client.connect();
        console.log("✅ SUCCESS! Connected via Hostname.");
        const res = await client.query('SELECT NOW()');
        console.log("Time:", res.rows[0].now);
        await client.end();
        process.exit(0);
    } catch (e) {
        console.log(`❌ FAILED: ${e.message}`);
        process.exit(1);
    }
}

testFinal();
