const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  console.log('Updating user lastLoginAt...');
  const user = await prisma.user.update({
    where: { id: 'ca95767b-9765-49af-956b-1eb437da2f81' },
    data: { lastLoginAt: new Date() }
  });
  console.log('Update Successful:', user.lastLoginAt);
}
main().catch(console.error).finally(() => prisma.$disconnect());
