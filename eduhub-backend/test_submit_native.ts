import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const attempt = await prisma.testAttempt.findFirst({
    where: { status: 'IN_PROGRESS', student: { name: 'Rahul Kumar' } },
    include: { student: true, test: true }
  });

  if (!attempt) {
    console.log("No IN_PROGRESS attempts found to test with.");
    return;
  }

  const test = attempt.test;
  const student = attempt.student;

  const mockTestSections = await prisma.mockTestSection.findMany({
    where: { testId: attempt.test.id },
    include: { set: { include: { items: { include: { question: true } } } } }
  });

  const answers: any[] = [];
  if (mockTestSections.length > 0 && mockTestSections[0].set.items.length > 0) {
    answers.push({
      questionId: mockTestSections[0].set.items[0].question.id,
      selectedOptions: []
    });
  }

  try {
    let score = 0;
    const savedAnswers: any[] = [];

    if (answers && Array.isArray(answers)) {
        for (const ans of answers) {
            const correctOptions = await prisma.questionOption.findMany({
                where: { questionId: ans.questionId, isCorrect: true },
                select: { id: true }
            });
            const correctIds = correctOptions.map((o: any) => o.id);
            const selected: string[] = ans.selectedOptions || [];
            const isCorrect = selected.length > 0 && correctIds.length > 0 &&
                selected.every((id: string) => correctIds.includes(id)) &&
                correctIds.every((id: string) => selected.includes(id));

            const marksAwarded = isCorrect ? 1 : (selected.length > 0 ? -0.33 : 0);
            score += marksAwarded;

            savedAnswers.push({
                attemptId: attempt.id,
                questionId: ans.questionId,
                selectedOptions: selected,
                isCorrect,
                marksAwarded,
                timeTakenSecs: ans.timeTakenSecs || 0,
            });
        }
        console.log("Creating answers:", savedAnswers);
        await prisma.attemptAnswer.createMany({ data: savedAnswers });
    }

    const finalScore = Math.max(0, score);
    
    console.log("Saving score:", finalScore);

    const betterAttempts = await prisma.testAttempt.count({
        where: { testId: test.id, score: { gt: finalScore }, status: 'SUBMITTED' }
    });
    const totalSubmitted = await prisma.testAttempt.count({
        where: { testId: test.id, status: 'SUBMITTED' }
    });
    const rank = betterAttempts + 1;
    const percentile = totalSubmitted > 0 ? parseFloat(((betterAttempts / (totalSubmitted + 1)) * 100).toFixed(1)) : 100;

    console.log(`Updating attempt ${attempt.id} with rank: ${rank}, percentile: ${percentile}`);

    const updatedAttempt = await prisma.testAttempt.update({
        where: { id: attempt.id },
        data: {
            status: 'SUBMITTED',
            submittedAt: new Date(),
            score: finalScore,
            rank,
            percentile,
            timeTakenSecs: null,
        }
    });

    console.log("Success!", updatedAttempt);
  } catch (err) {
    console.error("CRITICAL ERROR:", err);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
