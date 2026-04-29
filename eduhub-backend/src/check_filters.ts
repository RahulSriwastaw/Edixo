import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const exams = await prisma.questions.groupBy({ by: ['exam'], _count: { id: true } });
  console.log('Exams:', JSON.stringify(exams, null, 2));

  const subjects = await prisma.questions.groupBy({ by: ['subject_name'], _count: { id: true } });
  console.log('Subjects:', JSON.stringify(subjects, null, 2));

  const sections = await prisma.questions.groupBy({ by: ['section'], _count: { id: true } });
  console.log('Sections:', JSON.stringify(sections, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
