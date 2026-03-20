import axios from 'axios';

async function check() {
    try {
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:4000/api/auth/login', {
            email: 'admin@eduhub.in',
            password: 'SuperAdmin@123',
            role: 'SUPER_ADMIN'
        });
        const token = loginRes.data.data.accessToken;

        console.log('Fetching analytics stats...');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        // Try global
        const res1 = await axios.get('http://localhost:4000/api/mockbook/analytics/stats', config);
        console.log('Global Stats:', res1.data.data);

        // Try with MOCKVEDA-001
        const res2 = await axios.get('http://localhost:4000/api/mockbook/analytics/stats?orgId=MOCKVEDA-001', config);
        console.log('Mockveda Stats:', res2.data.data);
    } catch (e: any) {
        console.error('Error:', e.response?.data || e.message);
    }
}

check();
