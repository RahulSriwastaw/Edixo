const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
    // Get 5 questions with options
    const questions = await p.questions.findMany({
        take: 5,
        include: { question_options: { take: 2 } }
    });

    for (const q of questions) {
        console.log('\n--- Question ---');
        console.log('text_en:', q.text_en ? q.text_en.slice(0, 100) : '(null)');
        console.log('text_hi:', q.text_hi ? q.text_hi.slice(0, 100) : '(null)');
        if (q.question_options[0]) {
            console.log('  opt text_en:', q.question_options[0].text_en || '(null)');
            console.log('  opt text_hi:', q.question_options[0].text_hi || '(null)');
        }
    }
}

main()
    .then(() => p.$disconnect())
    .catch(e => { console.error(e); p.$disconnect(); });
