const { Client } = require('pg');

const url = "postgresql://postgres:kA8DNgZl0pIc18to@db.urfflntfcztmvhcsckqv.supabase.co:6543/postgres?pgbouncer=true";

async function verifyCreation() {
    const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
    try {
        await client.connect();
        const res = await client.query("INSERT INTO \"Deal\" (id, name, type, status, stage, \"updatedAt\") VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id",
            ['test-deal-id', 'Test Project', 'SELL_SIDE', 'ACTIVE', 'LEAD']);
        console.log('✅ Success: Created deal with ID:', res.rows[0].id);

        // Clean up
        await client.query("DELETE FROM \"Deal\" WHERE id = 'test-deal-id'");
        console.log('✅ Success: Cleaned up test deal');

        await client.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to create deal:', err.message);
        process.exit(1);
    }
}

verifyCreation();
