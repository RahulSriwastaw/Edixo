/**
 * Seed Test Data Script
 * Generates 100K+ test questions for performance testing
 * Run: node scripts/seed-test-data.js
 */

// This script populates Supabase with large test dataset
// Use storageService which is already exposed on window

const SUBJECTS = [
    'Current Affairs', 'General Knowledge', 'Mathematics', 'Science',
    'English', 'Reasoning', 'History', 'Geography', 'Polity',
    'Economics', 'Environment', 'Computer', 'Art and Culture', 'Sports'
];

const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Expert'];
const LANGUAGES = ['English', 'Hindi', 'Bilingual'];
const SOURCES = ['UPSC', 'SSC', 'Banking', 'Railways', 'State PSC'];

function generateRandomQuestion(index) {
    const subject = SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];
    const difficulty = DIFFICULTIES[Math.floor(Math.random() * DIFFICULTIES.length)];
    const language = LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)];
    const source = SOURCES[Math.floor(Math.random() * SOURCES.length)];

    return {
        id: `test-question-${index}`,
        question: `<p>Test Question ${index}: This is a sample ${difficulty.toLowerCase()} question for ${subject}. What is the correct answer?</p>`,
        options: [
            `Option A for question ${index}`,
            `Option B for question ${index}`,
            `Option C for question ${index}`,
            `Option D for question ${index}`
        ],
        correctAnswer: Math.floor(Math.random() * 4),
        explanation: `<p>This is the explanation for test question ${index}. The correct answer demonstrates understanding of ${subject} concepts.</p>`,
        subject,
        difficulty,
        language,
        topic: `Topic ${Math.floor(index / 100)}`,
        chapter: `Chapter ${Math.floor(index / 50)}`,
        tags: [`tag-${Math.floor(Math.random() * 100)}`, `${subject.toLowerCase()}`, difficulty.toLowerCase()],
        marks: difficulty === 'Easy' ? 1 : difficulty === 'Medium' ? 2 : difficulty === 'Hard' ? 3 : 5,
        time_limit: difficulty === 'Easy' ? 60 : difficulty === 'Medium' ? 90 : difficulty === 'Hard' ? 120 : 180,
        question_source: source,
        year: String(2018 + Math.floor(Math.random() * 7)),
        exam: source,
        isAIGenerated: Math.random() > 0.5,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    };
}

async function seedData() {
    console.log('🌱 Starting test data seeding...');

    // Check if storageService is available
    if (typeof window === 'undefined' || !window.storageService) {
        console.error('❌ This script must be run in browser console with storageService available');
        console.log('📝 Steps:');
        console.log('1. Open http://localhost:3000/creator in browser');
        console.log('2. Open DevTools Console (F12)');
        console.log('3. Copy and paste this entire seed-test-data.js file');
        console.log('4. Run: await seedData()');
        return;
    }

    const BATCH_SIZE = 1000;
    const TOTAL_QUESTIONS = 100000;
    const NUM_BATCHES = Math.ceil(TOTAL_QUESTIONS / BATCH_SIZE);

    console.log(`📊 Generating ${TOTAL_QUESTIONS} questions in ${NUM_BATCHES} batches...`);

    for (let batch = 0; batch < NUM_BATCHES; batch++) {
        const start = batch * BATCH_SIZE;
        const end = Math.min(start + BATCH_SIZE, TOTAL_QUESTIONS);
        const questions = [];

        for (let i = start; i < end; i++) {
            questions.push(generateRandomQuestion(i));
        }

        try {
            // Store batch using storageService
            await window.storageService.saveQuestions(questions);

            const progress = ((batch + 1) / NUM_BATCHES * 100).toFixed(1);
            console.log(`✅ Batch ${batch + 1}/${NUM_BATCHES} complete (${progress}%) - ${end}/${TOTAL_QUESTIONS} questions`);

            // Small delay to avoid overwhelming Supabase
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
            console.error(`❌ Error in batch ${batch + 1}:`, error);
            console.log('⏸️  Pausing... Fix the error and run again');
            return;
        }
    }

    console.log('🎉 Test data seeding complete!');
    console.log(`✅ ${TOTAL_QUESTIONS} questions added to database`);
    console.log('🧪 Ready for performance testing');
}

// Usage Instructions
console.log(`
🌱 Test Data Seeder Ready!

To seed 100K+ questions for performance testing:

METHOD 1 (Browser Console - Recommended):
1. Open http://localhost:3000/creator
2. Open DevTools Console (F12)
3. Copy this entire file content
4. Paste into console and press Enter
5. Run: await seedData()

METHOD 2 (Alternative - Direct Supabase):
If you have direct Supabase access, modify this script to use
Supabase client directly instead of storageService.

⚠️  WARNING: This will add 100K questions to your database.
Make sure you're using a test/dev database, not production!
`);

// Export for potential Node.js use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { seedData, generateRandomQuestion };
}
