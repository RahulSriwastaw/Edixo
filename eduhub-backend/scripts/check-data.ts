import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    try {
        const folders = await prisma.examFolder.findMany();
        const categories = await prisma.examCategory.findMany();
        const tests = await prisma.mockTest.findMany();

        console.log('--- Exam Folders ---');
        console.table(folders.map(f => ({ id: f.id, orgId: f.orgId, name: f.name })));

        console.log('--- Exam Categories (Series) ---');
        console.table(categories.map(c => ({ id: c.id, orgId: c.orgId, name: c.name, folderId: c.folderId })));

        console.log('--- Mock Tests ---');
        console.table(tests.map(t => ({ id: t.id, orgId: t.orgId, name: t.name, subCatId: t.subCategoryId })));
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
