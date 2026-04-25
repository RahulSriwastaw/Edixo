
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fix() {
  try {
    // Fix ExamCategory
    const cat = await prisma.examCategory.findFirst({ where: { name: { contains: 'Secries' } } });
    if (cat) {
       const newName = cat.name.replace('Secries', 'Series');
       const newSlug = cat.slug?.replace('secries', 'series');
       await prisma.examCategory.update({
         where: { id: cat.id },
         data: { name: newName, slug: newSlug }
       });
       console.log(`Updated Category: ${cat.name} -> ${newName} (${newSlug})`);
    }

    // Fix ExamFolder
    const folder = await prisma.examFolder.findFirst({ where: { name: { contains: 'Secries' } } });
    if (folder) {
       const newName = folder.name.replace('Secries', 'Series');
       const newSlug = folder.slug?.replace('secries', 'series');
       await prisma.examFolder.update({
         where: { id: folder.id },
         data: { name: newName, slug: newSlug }
       });
       console.log(`Updated Folder: ${folder.name} -> ${newName} (${newSlug})`);
    }

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

fix();
