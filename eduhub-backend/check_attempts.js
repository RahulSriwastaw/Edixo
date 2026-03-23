const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const attempts = await prisma.testAttempt.findMany({
    include: {
      student: { select: { userId: true, name: true } },
      test: { select: { id: true, testId: true, name: true } }
    },
    take: 10
  });

  console.log(JSON.stringify(attempts, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
