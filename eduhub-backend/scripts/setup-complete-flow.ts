import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
    try {
        const orgId = 'GK-ORG-00001';
        const categoryId = 'aa16fd30-1d7d-4bc6-8e42-2f5b250589d5'; // SSC Test Series
        const testId = '708ad87c-22ba-43a5-8496-dfaa5476c92c'; // SSC Mock Test-1

        console.log('Setting up complete flow...');

        const org = await prisma.organization.findUnique({ where: { orgId } });
        if (!org) return console.error('Org not found');

        // 1. Create SubCategory
        let subCat = await prisma.examSubCategory.findFirst({
            where: { categoryId, name: 'Full Length Mocks' }
        });

        if (!subCat) {
            console.log('Creating SubCategory: Full Length Mocks...');
            subCat = await prisma.examSubCategory.create({
                data: {
                    categoryId,
                    orgId: org.id,
                    name: 'Full Length Mocks',
                    sortOrder: 1
                }
            });
        }

        // 2. Link Test to SubCategory
        console.log(`Linking Test to SubCategory ${subCat.id}...`);
        await prisma.mockTest.update({
            where: { id: testId },
            data: { 
                subCategoryId: subCat.id,
                isPublic: true,
                status: 'LIVE'
            }
        });

        console.log('Flow setup complete!');

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

run();
