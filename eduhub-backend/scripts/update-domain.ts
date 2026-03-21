import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.update({
    where: { orgId: 'GK-ORG-00001' },
    data: { customDomain: 'mockveda.com' }
  });
  console.log('Update result:', JSON.stringify(org, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
