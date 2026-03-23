const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  console.log('Querying student...');
  const student = await prisma.student.findFirst({
    where: {
      OR: [
        { studentId: 'STU-MOCK-001' },
        { email: 'student@mockveda.com' }
      ],
      org: { orgId: 'GK-ORG-00001' },
    },
    include: { user: true, org: true },
  });
  console.log('Result:', JSON.stringify(student, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
