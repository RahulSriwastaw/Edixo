import axios from 'axios';

async function testLogin() {
  const url = 'http://localhost:4000/api/auth/login';
  const credentials = {
    email: 'admin@eduhub.in',
    password: 'SuperAdmin@123',
    role: 'SUPER_ADMIN'
  };

  try {
    console.log('Attempting login with:', credentials);
    const response = await axios.post(url, credentials);
    console.log('Login successful:', response.data);
  } catch (error: any) {
    if (error.response) {
      console.error('Login failed (Status ' + error.response.status + '):', error.response.data);
    } else {
      console.error('Login failed (Network error):', error.message);
    }
  }
}

testLogin();
