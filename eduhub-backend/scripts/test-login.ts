import axios from 'axios';

async function testLogin() {
    try {
        console.log('Testing SuperAdmin Login...');
        const response = await axios.post('http://localhost:4000/api/auth/login', {
            email: 'admin@eduhub.in',
            passwordHash: 'SuperAdmin@123', // Wait, the field should be 'password' in the request!
            password: 'SuperAdmin@123',
            role: 'SUPER_ADMIN'
        });
        console.log('Login Response:', response.data);
    } catch (error: any) {
        console.log('Login Failed!');
        console.log('Status:', error.response?.status);
        console.log('Data:', JSON.stringify(error.response?.data, null, 2));
    }
}

testLogin();
