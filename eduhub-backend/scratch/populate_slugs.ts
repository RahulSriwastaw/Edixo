// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')   // Remove all non-word chars
    .replace(/--+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')        // Trim - from start of text
    .replace(/-+$/, '');       // Trim - from end of text
}

async function main() {
  const categories = await prisma.examCategory.findMany();
  for (const cat of categories) {
    if (!cat.slug) {
      let slug = slugify(cat.name);
      // Check for uniqueness
      const existing = await prisma.examCategory.findUnique({ where: { slug } });
      if (existing) {
        slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
      }
      await prisma.examCategory.update({
        where: { id: cat.id },
        data: { slug }
      });
      console.log(`Updated Category ${cat.name} -> ${slug}`);
    }
  }

  const folders = await prisma.examFolder.findMany();
  for (const folder of folders) {
    if (!folder.slug) {
      let slug = slugify(folder.name);
      const existing = await prisma.examFolder.findUnique({ where: { slug } });
      if (existing) {
        slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
      }
      await prisma.examFolder.update({
        where: { id: folder.id },
        data: { slug }
      });
      console.log(`Updated Folder ${folder.name} -> ${slug}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
