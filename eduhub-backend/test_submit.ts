import { PrismaClient } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import * as http from 'http';

const prisma = new PrismaClient();

async function main() {
  const attempt = await prisma.testAttempt.findFirst({
    where: { status: 'IN_PROGRESS' },
    include: { student: true, test: true }
  });

  if (!attempt) {
    console.log("No IN_PROGRESS attempts found to test with.");
    return;
  }

  console.log(`Found IN_PROGRESS attempt for Test ID: ${attempt.test.id}, Student User ID: ${attempt.student.userId}`);

  require('dotenv').config();
  const actualSecret = process.env.JWT_SECRET || 'supersecret';
  const token = jwt.sign({ userId: attempt.student.userId, role: 'STUDENT' }, actualSecret);

  const payload = JSON.stringify({
    action: "submit",
    answers: []
  });

  const options = {
    hostname: 'localhost',
    port: 4000,
    path: `/api/mockbook/tests/${attempt.test.testId}/attempts`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      console.log(`API Status: ${res.statusCode}`);
      console.log(`API Response: ${data}`);
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });
  
  req.write(payload);
  req.end();
}

main().catch(console.error).finally(() => prisma.$disconnect());
