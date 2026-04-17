import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkAndFix() {
  const email = 'test@test.com';
  console.log(`Checking user: ${email}`);

  const user = await prisma.user.findFirst({
    where: { email }
  });

  if (!user) {
    console.error('User not found!');
    throw new Error('User not found');
  }

  console.log('User found:', { id: user.id, email: user.email, role: user.role });

  const student = await prisma.student.findFirst({
    where: { userId: user.id }
  });

  if (student) {
    console.log('Student profile already exists:', { id: student.id, name: student.name });
  } else {
    console.log('Student profile missing! Creating one...');
    const newStudent = await prisma.student.create({
      data: {
        studentId: `GK-STU-${Math.floor(10000 + Math.random() * 90000)}`,
        userId: user.id,
        name: 'Test Student',
        email: user.email,
        mobile: '1234567890',
        isActive: true
      }
    });
    console.log('Student profile created:', newStudent);
  }
}

checkAndFix()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e);
    prisma.$disconnect();
    throw e;
  });
