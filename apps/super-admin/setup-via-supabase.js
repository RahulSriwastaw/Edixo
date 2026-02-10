const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function setupDatabaseViaSupabase() {
    const supabaseUrl = 'https://jwwjjyxdepayjdjlmdmo.supabase.co';
    const supabaseKey = 'sb_publishable_X3GlI_rtZno7RTwI4kj_Bg_BeYH1cPZ';

    // Create service role client (this is anon key, not ideal but let's try)
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🚀 Starting database setup via Supabase Client...\n');

    try {
        // Read the SQL file
        const sqlContent = fs.readFileSync('database-setup.sql', 'utf-8');

        // Split SQL into individual statements
        const statements = sqlContent
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'));

        console.log(`📝 Found ${statements.length} SQL statements\n`);

        // Execute each statement
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < Math.min(statements.length, 30); i++) {
            const statement = statements[i];

            // Skip comments and policy statements (need admin access)
            if (statement.includes('POLICY') ||
                statement.includes('ROW LEVEL SECURITY') ||
                statement.includes('ENABLE')) {
                console.log(`⏭️  Skipping: ${statement.substring(0, 50)}...`);
                continue;
            }

            try {
                console.log(`⚙️  Executing: ${statement.substring(0, 60)}...`);

                const { data, error } = await supabase.rpc('exec_sql', {
                    query: statement
                });

                if (error) {
                    console.log(`   ⚠️  Error: ${error.message}`);
                    errorCount++;
                } else {
                    console.log(`   ✅ Success`);
                    successCount++;
                }
            } catch (err) {
                console.log(`   ❌ Failed: ${err.message}`);
                errorCount++;
            }
        }

        console.log(`\n📊 Summary:`);
        console.log(`   ✅ Success: ${successCount}`);
        console.log(`   ❌ Errors: ${errorCount}`);

    } catch (error) {
        console.error('❌ Setup failed:', error.message);
    }

    console.log('\n💡 Since Supabase client has limited SQL execution capabilities,');
    console.log('   you may need to run the SQL manually in Supabase Dashboard.');
    console.log('\n📖 Quick steps:');
    console.log('   1. Open: https://supabase.com/dashboard/project/jwwjjyxdepayjdjlmdmo');
    console.log('   2. Go to SQL Editor');
    console.log('   3. Copy paste from database-setup.sql');
    console.log('   4. Click Run\n');
}

setupDatabaseViaSupabase();
