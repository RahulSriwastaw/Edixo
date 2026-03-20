import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const superAdmins = await prisma.superAdmin.findMany({
    include: { user: true }
  });
  console.log('Super Admins:', JSON.stringify(superAdmins, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
