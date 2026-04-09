import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Real SSC/Competitive exam questions for testing
const REAL_QUESTIONS = [
  {
    text: 'A train 250 m long is running at 60 km/h. In what time will it pass a man who is running at 6 km/h in the same direction as the train?',
    options: [
      { text: '15 seconds', isCorrect: true },
      { text: '20 seconds', isCorrect: false },
      { text: '25 seconds', isCorrect: false },
      { text: '30 seconds', isCorrect: false },
    ],
    subject: 'Mathematics',
    difficulty: 'medium',
    exam: 'SSC CGL',
  },
  {
    text: 'If the simple interest on a sum of money at 5% per annum for 3 years is ₹1,200, then what is the principal?',
    options: [
      { text: '₹6,000', isCorrect: false },
      { text: '₹7,500', isCorrect: false },
      { text: '₹8,000', isCorrect: true },
      { text: '₹9,000', isCorrect: false },
    ],
    subject: 'Mathematics',
    difficulty: 'easy',
    exam: 'SSC CHSL',
  },
  {
    text: 'The ratio of the ages of A and B is 4:5. If the sum of their ages is 54 years, what is the age of A?',
    options: [
      { text: '20 years', isCorrect: false },
      { text: '24 years', isCorrect: true },
      { text: '28 years', isCorrect: false },
      { text: '30 years', isCorrect: false },
    ],
    subject: 'Mathematics',
    difficulty: 'easy',
    exam: 'SSC MTS',
  },
  {
    text: 'A shopkeeper sells an article for ₹840 with a profit of 20%. What is the cost price of the article?',
    options: [
      { text: '₹650', isCorrect: false },
      { text: '₹700', isCorrect: true },
      { text: '₹720', isCorrect: false },
      { text: '₹750', isCorrect: false },
    ],
    subject: 'Mathematics',
    difficulty: 'medium',
    exam: 'SSC CGL',
  },
  {
    text: 'What is the value of sin²60° + cos²30° − 2sin45°cos45°?',
    options: [
      { text: '0', isCorrect: true },
      { text: '1', isCorrect: false },
      { text: '1/2', isCorrect: false },
      { text: '√3/2', isCorrect: false },
    ],
    subject: 'Mathematics',
    difficulty: 'hard',
    exam: 'SSC CGL Tier-1',
  },
];

async function updateQuestions() {
  const setIdFromUser = '503023';
  console.log(`\n🔄 Updating questions for set: ${setIdFromUser}...`);

  try {
    // 1. Find the set UUID
    const setRows = await prisma.$queryRawUnsafe<any[]>(`
      SELECT id FROM question_sets WHERE set_id = '${setIdFromUser}' OR id = '${setIdFromUser}' LIMIT 1
    `);
    if (setRows.length === 0) { console.error('❌ Set not found.'); return; }
    const setPrimaryId = setRows[0].id;
    console.log(`✅ Set found: ${setPrimaryId}`);

    // 2. Get existing question IDs for this set (in order)
    const existingItems = await prisma.$queryRawUnsafe<any[]>(`
      SELECT question_id FROM question_set_items WHERE set_id = '${setPrimaryId}' ORDER BY sort_order ASC
    `);
    console.log(`📋 Found ${existingItems.length} existing questions to update.`);

    for (let i = 0; i < existingItems.length && i < REAL_QUESTIONS.length; i++) {
      const qId = existingItems[i].question_id;
      const real = REAL_QUESTIONS[i];

      // Update question text
      const safeText = real.text.replace(/'/g, "''");
      await prisma.$executeRawUnsafe(`
        UPDATE questions
        SET text_en = '${safeText}',
            subject_name = '${real.subject}',
            difficulty = '${real.difficulty}',
            exam = '${real.exam}'
        WHERE id = '${qId}'
      `);

      // Delete old options and re-insert correct ones
      await prisma.$executeRawUnsafe(`DELETE FROM question_options WHERE question_id = '${qId}'`);

      for (let j = 0; j < real.options.length; j++) {
        const opt = real.options[j];
        const { v4: uuidv4 } = await import('uuid');
        const optId = uuidv4();
        const safeOptText = opt.text.replace(/'/g, "''");
        await prisma.$executeRawUnsafe(`
          INSERT INTO question_options (id, question_id, text_en, is_correct, sort_order)
          VALUES ('${optId}', '${qId}', '${safeOptText}', ${opt.isCorrect}, ${j})
        `);
      }

      console.log(`✅ Updated Q${i + 1}: ${real.text.substring(0, 50)}...`);
    }

    console.log('\n🎉 All questions updated with real exam content!');
  } catch (err) {
    console.error('❌ Update failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

updateQuestions();
