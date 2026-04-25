
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function dump() {
    const cats = await prisma.examCategory.findMany({ select: { id: true, name: true, slug: true } });
    console.log("ExamCategories:", JSON.stringify(cats, null, 2));

    const folders = await prisma.examFolder.findMany({ select: { id: true, name: true, slug: true } });
    console.log("ExamFolders:", JSON.stringify(folders, null, 2));

    const subcats = await prisma.examSubCategory.findMany({ select: { id: true, name: true } });
    console.log("ExamSubCategories:", JSON.stringify(subcats, null, 2));
}

dump().catch(console.error).finally(() => prisma.$disconnect());
