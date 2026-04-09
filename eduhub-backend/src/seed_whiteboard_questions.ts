import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function seed() {
    const setIdFromUser = "503023";
    console.log(`Seeding questions for set: ${setIdFromUser}...`);

    try {
        // 1. Find the set UUID from set_id
        const setRows = await prisma.$queryRawUnsafe<any[]>(`
            SELECT id FROM question_sets WHERE set_id = '${setIdFromUser}' OR id = '${setIdFromUser}' LIMIT 1
        `);

        if (setRows.length === 0) {
            console.error("❌ Set not found in database.");
            return;
        }
        const setPrimaryId = setRows[0].id;
        console.log(`✅ Set primary ID (UUID): ${setPrimaryId}`);

        // 2. Create 5 mock questions
        for (let i = 1; i <= 5; i++) {
            const qId = uuidv4();
            const questionIdStr = `Q-DEMO-WB-${Date.now()}-${i}`;
            
            console.log(`Creating Question ${i}...`);
            await prisma.$executeRawUnsafe(`
                INSERT INTO questions (id, question_id, text_en, type, difficulty, subject_name, is_approved, is_global)
                VALUES ('${qId}', '${questionIdStr}', 'Demo Question ${i}: This is a seeded test question for whiteboard import.', 'mcq_single', 'easy', 'Mathematics', true, true)
            `);

            // 3. Create 4 options for each question
            for (let j = 0; j < 4; j++) {
                const optId = uuidv4();
                const isCorrect = j === 0;
                const labels = ['A', 'B', 'C', 'D'];
                const optText = j === 0 ? `Option ${labels[j]} (Correct Answer)` : `Option ${labels[j]} (Wrong choice)`;
                
                await prisma.$executeRawUnsafe(`
                    INSERT INTO question_options (id, question_id, text_en, is_correct, sort_order)
                    VALUES ('${optId}', '${qId}', '${optText}', ${isCorrect}, ${j})
                `);
            }

            // 4. Link question to set (Fixed: No 'id' column in question_set_items)
            console.log(`Linking Question ${i} to Set...`);
            await prisma.$executeRawUnsafe(`
                INSERT INTO question_set_items (set_id, question_id, sort_order)
                VALUES ('${setPrimaryId}', '${qId}', ${i})
                ON CONFLICT (set_id, question_id) DO NOTHING
            `);
        }

        console.log("✅ Successfully seeded 5 questions specifically for set 503023!");
    } catch (err) {
        console.error("❌ Seeding failed:", err);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
