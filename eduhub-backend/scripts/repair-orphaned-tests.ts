/**
 * One-time repair script: assigns orphaned mock tests 
 * (subCategoryId = null) to their correct exam series.
 * 
 * Run: npx ts-node scripts/repair-orphaned-tests.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const assignments = [
  { testId: '30efe429-3b04-4c8a-9c77-24112337f979', testName: 'SSC Mock Test-1',          categoryId: '837f1ff0-1d61-459c-b196-9fa1ef37529b', categoryName: 'SSC CGL 2026' },
  { testId: '44562a98-df6b-42c1-9b7c-ceca6ece4ccc', testName: 'E2E Verification Test',     categoryId: '7df8ae7f-08d6-4e1d-a592-c8e6f9158fa5', categoryName: 'E2E Test Series' },
  { testId: 'e6af8b3e-4da4-42f4-9960-e3177abe5312', testName: 'Banking Prelims Mock #1',   categoryId: 'c214feb3-cdf5-4479-b8a7-95454fa5fb56', categoryName: 'Banking Mock Series 2026' },
];

async function getOrCreateSubCategory(categoryId: string, categoryName: string): Promise<string> {
  let subCat = await prisma.examSubCategory.findFirst({
    where: { categoryId, name: 'General' }
  });

  if (!subCat) {
    console.log(`  Creating "General" subcategory under "${categoryName}"...`);
    subCat = await prisma.examSubCategory.create({
      data: {
        category: { connect: { id: categoryId } },
        name: 'General',
        description: 'Auto-created default group',
        sortOrder: 0,
      }
    });
  } else {
    console.log(`  Found existing "General" subcategory (id: ${subCat.id}) under "${categoryName}"`);
  }

  return subCat.id;
}

async function main() {
  console.log('\n🔧 Repairing orphaned mock tests...\n');

  for (const { testId, testName, categoryId, categoryName } of assignments) {
    try {
      console.log(`→ "${testName}" → "${categoryName}"`);
      const subCatId = await getOrCreateSubCategory(categoryId, categoryName);

      await prisma.mockTest.update({
        where: { id: testId },
        data: { subCategory: { connect: { id: subCatId } } }
      });

      console.log(`  ✅ Assigned to subcategory ${subCatId}\n`);
    } catch (err: any) {
      console.error(`  ❌ Failed for test ${testId}: ${err.message}\n`);
    }
  }

  console.log('✅ Repair complete!\n');
}

main().catch(console.error).finally(() => prisma.$disconnect());
