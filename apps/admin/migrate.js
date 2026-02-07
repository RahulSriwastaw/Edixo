import fs from 'fs';
import pkg from 'pg';
const { Client } = pkg;

// Connection string constructed from user-provided credentials
const connectionString = 'postgres://postgres:x8MBb*7Qf6eicpc@db.jwwjjyxdepayjdjlmdmo.supabase.co:5432/postgres';

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log('Connecting to Supabase Database...');
        await client.connect();
        console.log('Connected.');

        console.log('Reading schema file...');
        const sql = fs.readFileSync('./supabase_schema.sql', 'utf8');

        console.log('Executing SQL migration...');
        // Simple split by statement for robustness, removing empty/comment lines primarily if needed, 
        // but client.query usually handles multi-statement if simple.
        // However, to be safe against some driver configs, we'll try sending it all.
        await client.query(sql);

        console.log('✅ Migration successful! Tables created.');

    } catch (e) {
        console.error('❌ Migration Error:', e);
        process.exit(1);
    } finally {
        await client.end();
    }
}

run();
