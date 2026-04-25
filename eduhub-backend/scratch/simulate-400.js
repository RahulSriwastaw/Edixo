const axios = require('axios');
const jwt = require('jsonwebtoken');
const env = require('dotenv').config().parsed;
const token = jwt.sign({ role: 'SUPER_ADMIN', userId: 'test' }, env.JWT_SUPER_ADMIN_SECRET, { expiresIn: '1h' });

async function run() {
    const payloads = [
        { name: "test", questionIds: ["Q-EXT-1777044479215-233521-12"] },
        { name: "test", questionIds: [] },
        { name: "", questionIds: ["Q-EXT-1777044479215-233521-12"] },
        {},
        { name: "test", questionIds: ["Q-EXT-1777044479215-233521-12"], extra: true }
    ];

    for (let i = 0; i < payloads.length; i++) {
        try {
            console.log(`Payload ${i}:`, payloads[i]);
            await axios.post('http://localhost:4000/api/qbank/sets', payloads[i], {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`Payload ${i} Success`);
        } catch (e) {
            console.error(`Payload ${i} Error:`, e.response?.status, e.response?.data);
        }
    }
}
run();
