import pkg from 'pg';
import fs from 'fs';
const { Client } = pkg;

// Using the same connection string as before
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

        console.log('Reading migration file...');
        const sql = fs.readFileSync('./bulk_upload_schema.sql', 'utf8');

        console.log('Executing Bulk Upload Schema Migration...');
        await client.query(sql);

        console.log('✅ Bulk Upload Tables created successfully!');

    } catch (e) {
        console.error('❌ Migration Error:', e);
        process.exit(1);
    } finally {
        await client.end();
    }
}

run();
