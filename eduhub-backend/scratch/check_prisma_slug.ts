
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  try {
    const category = await prisma.examCategory.findFirst({
      where: {
        OR: [
          { id: 'some-id' },
          { slug: 'some-slug' }
        ]
      }
    });
    console.log('Runtime Check Success: slug is accepted in where clause');
  } catch (err) {
    console.error('Runtime Check Failed:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
