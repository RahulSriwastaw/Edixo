import axios from 'axios';

async function testRegistration() {
  const payload = {
    email: 'test_student_' + Date.now() + '@example.com',
    password: 'password123',
    name: 'Test Student',
    role: 'STUDENT'
    // orgId is missing!
  };

  try {
    console.log('Sending registration request with Origin: http://localhost:3000');
    const res = await axios.post('http://localhost:4000/api/auth/register', payload, {
      headers: {
        'Origin': 'http://localhost:3000'
      }
    });
    console.log('Success:', JSON.stringify(res.data, null, 2));
  } catch (err: any) {
    console.error('Error:', err.response?.status, JSON.stringify(err.response?.data, null, 2));
  }
}

testRegistration();
