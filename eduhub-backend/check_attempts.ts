import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const attempts = await prisma.testAttempt.findMany({
    where: { 
      test: { testId: 'ssc-mock-test-1-1773939901737' }
    },
    include: { student: true, test: true },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  console.log("Recent Attempts for ssc-mock-test-1:");
  attempts.forEach(a => {
    console.log(`- Student: ${a.student.name} (${a.student.userId}) | Status: ${a.status} | Score: ${a.score} | CreatedAt: ${a.createdAt}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
