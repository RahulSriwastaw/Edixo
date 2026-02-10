const { createClient } = require('@supabase/supabase-js');

async function checkExistingTables() {
    const supabase = createClient(
        'https://jwwjjyxdepayjdjlmdmo.supabase.co',
        'sb_publishable_X3GlI_rtZno7RTwI4kj_Bg_BeYH1cPZ'
    );

    console.log('🔍 Checking existing database tables...\n');

    try {
        // Try to query users table
        console.log('Checking users table...');
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('count')
            .limit(1);

        if (usersError) {
            console.log('❌ users table: NOT FOUND');
            console.log(`   Error: ${usersError.message}\n`);
        } else {
            console.log('✅ users table: EXISTS\n');
        }

        // Try organizations
        console.log('Checking organizations table...');
        const { data: orgs, error: orgsError } = await supabase
            .from('organizations')
            .select('count')
            .limit(1);

        if (orgsError) {
            console.log('❌ organizations table: NOT FOUND');
            console.log(`   Error: ${orgsError.message}\n`);
        } else {
            console.log('✅ organizations table: EXISTS\n');
        }

        // Try blogs
        console.log('Checking blogs table...');
        const { data: blogs, error: blogsError } = await supabase
            .from('blogs')
            .select('count')
            .limit(1);

        if (blogsError) {
            console.log('❌ blogs table: NOT FOUND');
            console.log(`   Error: ${blogsError.message}\n`);
        } else {
            console.log('✅ blogs table: EXISTS\n');
        }

        console.log('\n📝 Summary:');
        console.log('If tables don\'t exist, you need to run SQL manually in Supabase Dashboard');
        console.log('\n🔗 Dashboard: https://supabase.com/dashboard/project/jwwjjyxdepayjdjlmdmo/editor');

    } catch (error) {
        console.error('Error checking tables:', error.message);
    }
}

checkExistingTables();
