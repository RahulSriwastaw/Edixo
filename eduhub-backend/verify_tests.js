const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tests = await prisma.mockTest.findMany({
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      organization: true
    }
  });

  console.log("Recent Tests:");
  tests.forEach(t => {
    console.log(`- ${t.title} (Org: ${t.organization?.name || 'N/A'}) - ID: ${t.id}`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
