import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function listUsers() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, mobile: true, role: true }
  });
  console.log('--- USER LIST ---');
  console.table(users);
  
  const students = await prisma.student.findMany({
    select: { id: true, name: true, email: true, userId: true }
  });
  console.log('--- STUDENT LIST ---');
  console.table(students);
}

listUsers()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e);
    prisma.$disconnect();
    throw e;
  });
