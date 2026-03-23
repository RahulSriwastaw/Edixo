const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const students = await prisma.student.findMany({
    take: 5,
    include: { org: true }
  });
  console.log(JSON.stringify(students, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
