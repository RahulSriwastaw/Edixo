import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const orgs = await prisma.organization.findMany({ select: { id: true, name: true, orgId: true } });
  console.log("Organizations:");
  console.table(orgs);
}

main().catch(console.error).finally(() => prisma.$disconnect());
