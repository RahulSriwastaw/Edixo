const axios = require('axios');
const jwt = require('jsonwebtoken');
const env = require('dotenv').config().parsed;
const token = jwt.sign({ role: 'SUPER_ADMIN', userId: 'test' }, env.JWT_SUPER_ADMIN_SECRET, { expiresIn: '1h' });

async function run() {
    try {
        const res = await axios.delete('http://localhost:4000/api/qbank/sets', {
            headers: { Authorization: `Bearer ${token}` },
            data: { ids: ["some-id"] }
        });
        console.log("Success:", res.data);
    } catch (e) {
        console.error("Error:", e.response?.status, e.response?.data);
    }
}
run();
