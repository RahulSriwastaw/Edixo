const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const questions = await prisma.questions.findMany({
    where: {
      text_en: {
        not: {
          contains: 'अ' // Rough check for Hindi characters
        }
      }
    },
    take: 5
  });
  console.log(JSON.stringify(questions, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
