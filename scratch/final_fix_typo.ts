
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkSlugs() {
    console.log("Checking for 'secries' in slugs...");
    const categories = await prisma.examCategory.findMany({
        where: {
            OR: [
                { slug: { contains: 'secries' } },
                { name: { contains: 'secries' } }
            ]
        }
    });

    if (categories.length > 0) {
        console.log(`Found ${categories.length} categories with typo.`);
        for (const cat of categories) {
            const newName = cat.name.replace(/secries/gi, 'Series');
            const newSlug = cat.slug?.replace(/secries/gi, 'series');
            console.log(`Updating ${cat.id}: ${cat.name} -> ${newName} (${newSlug})`);
            await prisma.examCategory.update({
                where: { id: cat.id },
                data: { name: newName, slug: newSlug }
            });
        }
    } else {
        console.log("No categories with 'secries' found.");
    }

    const folders = await prisma.examFolder.findMany({
        where: {
            OR: [
                { slug: { contains: 'secries' } },
                { name: { contains: 'secries' } }
            ]
        }
    });

    if (folders.length > 0) {
        console.log(`Found ${folders.length} folders with typo.`);
        for (const f of folders) {
            const newName = f.name.replace(/secries/gi, 'Series');
            const newSlug = f.slug?.replace(/secries/gi, 'series');
            console.log(`Updating ${f.id}: ${f.name} -> ${newName} (${newSlug})`);
            await prisma.examFolder.update({
                where: { id: f.id },
                data: { name: newName, slug: newSlug }
            });
        }
    }

    console.log("Done.");
}

checkSlugs().catch(console.error).finally(() => prisma.$disconnect());
