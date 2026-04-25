const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');
const env = require('dotenv').config().parsed;

async function run() {
    const q = await prisma.questions.findFirst();
    if (!q) {
        console.log("No questions found");
        return;
    }
    console.log("Found question:", q.id);

    const token = jwt.sign({ role: 'SUPER_ADMIN', userId: 'test' }, env.JWT_SUPER_ADMIN_SECRET, { expiresIn: '1h' });

    const axios = require('axios');
    try {
        const res = await axios.post('http://localhost:4000/api/qbank/sets', {
            name: "Test Set",
            questionIds: [q.id]
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Success:", res.data);
    } catch (e) {
        console.error("Error:", e.response?.status, e.response?.data);
    }
}
run();
