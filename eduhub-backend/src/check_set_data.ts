import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkSet() {
    const setId = "503023";
    try {
        console.log(`Checking Set ID: ${setId}`);
        const setRows = await prisma.$queryRawUnsafe<any[]>(`
            SELECT id, name, pin FROM question_sets WHERE set_id = '${setId}' OR id = '${setId}'
        `);
        
        if (setRows.length === 0) {
            console.log("❌ Set not found");
            return;
        }
        
        const set = setRows[0];
        console.log(`✅ Set found: ${set.name} (UUID: ${set.id}, PIN: ${set.pin})`);
        
        const questions = await prisma.$queryRawUnsafe<any[]>(`
            SELECT COUNT(*) AS cnt FROM question_set_items WHERE set_id = '${set.id}'
        `);
        console.log(`Count of items: ${questions[0].cnt}`);
        
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await prisma.$disconnect();
    }
}

checkSet();
