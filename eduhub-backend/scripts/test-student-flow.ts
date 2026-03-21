import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import 'dotenv/config';

const prisma = new PrismaClient();
const API_BASE = 'http://localhost:4000/api';

async function runTest() {
    try {
        console.log('1. Checking for a student...');
        let student = await prisma.student.findFirst({ include: { user: true } });
        if (!student) {
            console.log('No student found. Creating one...');
            const org = await prisma.organization.findFirst();
            const user = await prisma.user.create({
                data: { email: 'teststudent@example.com', passwordHash: 'hash', role: 'STUDENT' }
            });
            student = await prisma.student.create({
                data: {
                    studentId: 'TEST-STU-01', userId: user.id, orgId: org!.id, name: 'Test Student'
                },
                include: { user: true }
            });
        }
        
        console.log(`Using student: ${student.name} (${student.id})`);
        
        // Generate a token for the student
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { userId: student.userId, role: 'STUDENT', email: student.user.email, orgDbId: student.orgId },
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '1d' }
        );
        
        const headers = { Authorization: `Bearer ${token}` };

        console.log('\n2. Testing GET /students/me...');
        const meRes = await axios.get(`${API_BASE}/students/me`, { headers });
        console.log('GET /students/me Success:', meRes.data.success);

        console.log('\n3. Fetching a mock test...');
        const test = await prisma.mockTest.findFirst();
        if (!test) throw new Error('No published mock test found to test with.');
        console.log(`Found test: ${test.name} (${test.id})`);

        console.log(`\n4. Testing GET /mockbook/tests/${test.id}...`);
        const testInfoRes = await axios.get(`${API_BASE}/mockbook/tests/${test.id}`);
        console.log('GET /mockbook/tests/:id Success:', testInfoRes.data.success);

        console.log(`\n5. Testing GET /mockbook/tests/${test.id}/questions...`);
        const qRes = await axios.get(`${API_BASE}/mockbook/tests/${test.id}/questions`);
        console.log(`GET /tests/:id/questions Success:`, qRes.data.success);
        const questions = qRes.data.data.questions;
        console.log(`Loaded ${questions.length} questions.`);

        console.log(`\n6. Testing POST /mockbook/tests/${test.id}/attempts (start)...`);
        const startRes = await axios.post(`${API_BASE}/mockbook/tests/${test.id}/attempts`, { action: 'start' }, { headers });
        console.log('Start Attempt Success:', startRes.data.success);
        const attemptId = startRes.data.data.id;
        console.log(`Attempt ID: ${attemptId}`);

        console.log('\n7. Testing POST /mockbook/tests/${test.id}/attempts (submit)...');
        const answers = questions.map((q: any) => ({
            questionId: q.id,
            selectedOptions: q.options.length > 0 ? [q.options[0].id] : [] // Pick first option randomly
        }));

        const submitRes = await axios.post(`${API_BASE}/mockbook/tests/${test.id}/attempts`, {
            action: 'submit', answers
        }, { headers });
        console.log('Submit Attempt Success:', submitRes.data.success);
        console.log(`Score: ${submitRes.data.data.score}`);

        console.log('\n✅ All student flow tests passed!');
    } catch (err: any) {
        console.error('❌ Test failed:', err.response?.data || err);
    } finally {
        await prisma.$disconnect();
    }
}

runTest();
