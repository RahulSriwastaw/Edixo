import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const org = await prisma.organization.findUnique({
    where: { orgId: 'GK-ORG-00001' }
  });

  if (!org) {
    console.log("Org not found");
    return;
  }

  console.log("Org DB ID:", org.id);

  const folders = await prisma.examFolder.findMany({
    where: { orgId: null } // We saw `orgId: null` meant global earlier. Let's just grab all that match the frontend auth check logic.
  });
  const orgFolders = await prisma.examFolder.findMany({
    where: { orgId: org.id }
  });

  console.log("Global Folders:", folders.map(f => f.name));
  console.log("Org Folders:", orgFolders.map(f => f.name));

  const categories = await prisma.examCategory.findMany({
    where: { OR: [ { orgId: org.id }, { orgId: null } ] }
  });

  console.log("Categories (Series):", categories.map(c => ({ id: c.id, name: c.name, folderId: c.folderId, orgId: c.orgId })));

  const tests = await prisma.mockTest.findMany({
    where: { orgId: org.id }
  });

  console.log("Tests:", tests.map(t => ({ id: t.id, name: t.name, subCategoryId: t.subCategoryId, status: t.status })));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
