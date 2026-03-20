import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
    try {
        const testId = '708ad87c-22ba-43a5-8496-dfaa5476c92c';

        const test = await prisma.mockTest.update({
            where: { id: testId },
            data: { isPublic: true },
            include: { subCategory: { include: { category: true } } }
        });

        console.log(`Test: ${test.name} | isPublic: ${test.isPublic} | status: ${test.status}`);
        if (test.subCategory) {
            console.log(`SubCategory: ${test.subCategory.name} (id: ${test.subCategory.id})`);
            if (test.subCategory.category) {
                console.log(`Category: ${test.subCategory.category.name} (id: ${test.subCategory.category.id})`);
            }
        } else {
            console.log('No SubCategory linked.');
        }

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

run();
