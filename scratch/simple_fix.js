
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
    console.log("Searching for 'secries' in database...");
    
    // Check ExamCategory
    const cats = await prisma.examCategory.findMany({
        where: {
            OR: [
                { name: { contains: 'secries', mode: 'insensitive' } },
                { slug: { contains: 'secries', mode: 'insensitive' } }
            ]
        }
    });
    console.log(`Found ${cats.length} categories with typo.`);
    for (const c of cats) {
        const newName = c.name.replace(/secries/gi, 'Series');
        const newSlug = c.slug.replace(/secries/gi, 'series');
        await prisma.examCategory.update({
            where: { id: c.id },
            data: { name: newName, slug: newSlug }
        });
        console.log(`Updated Category: ${c.slug} -> ${newSlug}`);
    }

    // Check ExamFolder
    const folders = await prisma.examFolder.findMany({
        where: {
            OR: [
                { name: { contains: 'secries', mode: 'insensitive' } },
                { slug: { contains: 'secries', mode: 'insensitive' } }
            ]
        }
    });
    console.log(`Found ${folders.length} folders with typo.`);
    for (const f of folders) {
        const newName = f.name.replace(/secries/gi, 'Series');
        const newSlug = f.slug.replace(/secries/gi, 'series');
        await prisma.examFolder.update({
            where: { id: f.id },
            data: { name: newName, slug: newSlug }
        });
        console.log(`Updated Folder: ${f.slug} -> ${newSlug}`);
    }

    console.log("Fix complete.");
}

fix().catch(console.error).finally(() => prisma.$disconnect());
