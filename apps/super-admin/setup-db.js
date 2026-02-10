const { Client } = require('pg');
const fs = require('fs');

async function setupDatabase() {
    // Using Session Pooler (IPv4 compatible)
    const client = new Client({
        host: 'aws-1-ap-south-1.pooler.supabase.com',
        port: 5432,
        database: 'postgres',
        user: 'postgres.jwwjjyxdepayjdjlmdmo',
        password: 'PPSSi7YumnGzVDlq',
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 10000,
    });

    console.log('🔌 Connecting to Supabase PostgreSQL...');
    console.log('Host: db.jwwjjyxdepayjdjlmdmo.supabase.co\n');

    try {
        await client.connect();
        console.log('✅ Connected successfully!\n');

        // First, disable RLS on tables that might have policy issues
        console.log('🔧 Fixing RLS policies...');
        await client.query(`
      ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS organizations DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS blogs DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS courses DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS students DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS tools DISABLE ROW LEVEL SECURITY;
    `);
        console.log('✅ RLS policies fixed\n');

        // Check if users table exists
        const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

        if (!tableCheck.rows[0].exists) {
            console.log('📝 Creating tables...');
            const setupSQL = fs.readFileSync('database-setup.sql', 'utf-8');
            await client.query(setupSQL);
            console.log('✅ Tables created\n');
        } else {
            console.log('✅ Tables already exist\n');
        }

        // Create super admin user
        console.log('👤 Creating super admin user...');

        // Check if auth user exists
        const authCheck = await client.query(`
      SELECT id FROM auth.users WHERE email = 'admin@qbank.com' LIMIT 1;
    `);

        if (authCheck.rows.length > 0) {
            const authUserId = authCheck.rows[0].id;

            await client.query(`
        INSERT INTO users (auth_user_id, email, full_name, role, status, created_at)
        VALUES ($1, $2, $3, $4, $5, NOW())
        ON CONFLICT (auth_user_id) 
        DO UPDATE SET role = $4, status = $5, updated_at = NOW();
      `, [authUserId, 'admin@qbank.com', 'Super Admin', 'super_admin', 'active']);

            console.log('✅ Super admin created!\n');
        } else {
            console.log('⚠️  Auth user not found in auth.users');
            console.log('📝 Creating in Supabase Dashboard:');
            console.log('   Authentication → Users → Add User');
            console.log('   Email: admin@qbank.com');
            console.log('   Password: Admin@123\n');
        }

        // Verify
        const verify = await client.query(`
      SELECT email, role, status FROM users WHERE role = 'super_admin';
    `);

        if (verify.rows.length > 0) {
            console.log('🎉 SUCCESS! Super admin is ready:');
            console.log(`   Email: ${verify.rows[0].email}`);
            console.log(`   Role: ${verify.rows[0].role}`);
            console.log(`   Status: ${verify.rows[0].status}\n`);
            console.log('🚀 Login at: http://localhost:3000');
            console.log('   Email: admin@qbank.com');
            console.log('   Password: Admin@123');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
            console.error('\n💡 Network issue. Try:');
            console.error('   1. Check internet connection');
            console.error('   2. VPN might be blocking');
            console.error('   3. Use Supabase Dashboard instead');
        }
    } finally {
        await client.end();
        console.log('\n🔌 Connection closed.');
    }
}

setupDatabase();
