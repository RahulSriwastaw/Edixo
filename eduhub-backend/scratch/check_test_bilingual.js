const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
    const testId = '730254712620cec16b456f6c';
    
    // Find the test
    const test = await p.mockTest.findFirst({
        where: { OR: [{ testId }, { id: testId }] },
        include: {
            sections: {
                include: {
                    set: {
                        include: {
                            question_set_items: {
                                take: 3,
                                include: {
                                    questions: {
                                        include: { question_options: { take: 4 } }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!test) {
        console.log('Test not found:', testId);
        return;
    }
    console.log('Test:', test.name);

    let qCount = 0;
    for (const section of test.sections) {
        const items = section.set?.question_set_items || [];
        for (const item of items) {
            const q = item.questions;
            if (!q || qCount >= 3) continue;
            qCount++;
            console.log(`\n=== Q${qCount} (id: ${q.id}) ===`);
            console.log('text_en:', q.text_en ? q.text_en.slice(0, 120) : '(NULL)');
            console.log('text_hi:', q.text_hi ? q.text_hi.slice(0, 120) : '(NULL)');
            console.log('SAME?   ', q.text_en === q.text_hi);
            for (const opt of (q.question_options || [])) {
                console.log(`  Opt ${opt.option_key}: en="${opt.text_en ? opt.text_en.slice(0,60) : 'NULL'}" | hi="${opt.text_hi ? opt.text_hi.slice(0,60) : 'NULL'}" | same=${opt.text_en === opt.text_hi}`);
            }
        }
    }
}

main()
    .then(() => p.$disconnect())
    .catch(e => { console.error(e); p.$disconnect(); });
