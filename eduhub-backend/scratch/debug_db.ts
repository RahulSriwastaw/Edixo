// @ts-nocheck
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.examCategory.findMany({
    include: {
      subCategories: {
        include: {
          mockTests: true
        }
      }
    }
  });

  console.log('Categories:', JSON.stringify(categories, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
