import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

async function main() {
  const attempt = await prisma.testAttempt.findFirst({
    where: { status: 'SUBMITTED' },
    include: { student: true }
  });

  if (!attempt) {
    console.log("No submitted attempts found in DB");
    return;
  }

  const student = attempt.student;
  console.log(`Found attempt ${attempt.id} for student ${student.name} (userId: ${student.userId})`);

  // Generate a token for this student
  const token = jwt.sign(
    { userId: student.userId, role: 'STUDENT' },
    process.env.JWT_SECRET || 'your-default-secret'
  );

  try {
    const res = await axios.get(`http://localhost:4000/api/mockbook/attempts/${attempt.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("FETCH SUCCESS!", res.data.success);
    console.log("Data sample:", res.data.data.testName, res.data.data.score);
    
    // Test report
    const reportRes = await axios.get(`http://localhost:4000/api/mockbook/attempts/${attempt.id}/report`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("REPORT SUCCESS!", reportRes.data.success);
  } catch (err: any) {
    console.error("FETCH FAILED:", err.response?.status, err.response?.data || err.message);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
