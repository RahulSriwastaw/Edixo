import fetch from 'node-fetch';

async function verify() {
    try {
        const url = 'http://localhost:4000/api/mockbook/public?orgId=GK-ORG-00001';
        console.log(`Fetching from ${url}...`);
        
        const res = await fetch(url);
        const data: any = await res.json();
        
        console.log('Response:', JSON.stringify(data, null, 2));
        
        if (data.success && data.data) {
            const test = data.data.find((t: any) => t.name.includes('SSC Mock Test-1'));
            if (test) {
                console.log('✅ Found SSC Mock Test-1 in Public API');
            } else {
                console.log('❌ SSC Mock Test-1 NOT found in Public API');
            }
        }
    } catch (err) {
        console.error('Fetch failed:', err);
    }
}

verify();
