const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const env = {
  JWT_SECRET: "a7429e14c5745f9de00dc85ca6d75295",
  JWT_EXPIRES_IN: "7d"
};

async function main() {
  const body = {
    email: 'student@mockveda.com',
    password: 'password123',
    orgId: 'GK-ORG-00001',
    role: 'STUDENT'
  };

  console.log('1. Finding Student...');
  const student = await prisma.student.findFirst({
    where: {
      OR: [
        { studentId: body.studentId },
        { email: body.email }
      ],
      org: { orgId: body.orgId },
    },
    include: { user: true, org: true },
  });

  if (!student) {
    console.log('Student not found');
    return;
  }

  console.log('2. Comparing Password...');
  const valid = await bcrypt.compare(body.password, student.user.passwordHash);
  console.log('Password Valid:', valid);

  if (!valid) return;

  console.log('3. Generating Tokens...');
  const tokenPayload = {
    userId: student.userId,
    studentId: student.studentId,
    email: student.email,
    name: student.name,
    orgId: student.org.orgId,
    orgDbId: student.orgId,
    role: 'STUDENT',
  };

  const accessToken = jwt.sign(tokenPayload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
  console.log('Token Generated:', accessToken.substring(0, 20) + '...');

  console.log('4. Updating Last Login...');
  await prisma.user.update({
    where: { id: student.userId },
    data: { lastLoginAt: new Date() },
  });
  console.log('Done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
