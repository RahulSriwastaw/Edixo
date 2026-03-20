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

        console.log('Fetching admin tests...');
        const config = { headers: { Authorization: `Bearer ${token}` } };
        
        const res = await axios.get('http://localhost:4000/api/mockbook/admin/tests?orgId=GK-ORG-00001', config);
        console.log('Total Tests found:', res.data.data.length);
        console.log('Tests:', res.data.data.map((t: any) => ({ id: t.id, name: t.name })));
    } catch (e: any) {
        console.error('Error:', e.response?.data || e.message);
    }
}

check();
