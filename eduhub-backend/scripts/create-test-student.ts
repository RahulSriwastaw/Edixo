import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function createTestStudent() {
  const email = 'student@test.com';
  const password = 'password123';
  
  console.log(`Creating test student: ${email}`);

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: 'STUDENT',
        isActive: true,
      }
    });

    const student = await prisma.student.create({
      data: {
        studentId: 'GK-STU-00001',
        userId: user.id,
        name: 'Test Student',
        email: user.email,
        mobile: '1234567890',
        isActive: true
      }
    });

    console.log('Success! Test student created.');
    console.log('Email:', email);
    console.log('Password:', password);
  } catch (err) {
    console.error('Failed to create student:', err);
  }
}

createTestStudent()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e);
    throw e;
  });
