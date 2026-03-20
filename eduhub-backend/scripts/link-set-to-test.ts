import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
    try {
        const testId = '708ad87c-22ba-43a5-8496-dfaa5476c92c';
        const setId = '7c22a7ca-ac77-4708-a4dd-a498f3e270fd';

        console.log(`Linking Set ${setId} to Test ${testId}...`);

        // Create section
        const section = await prisma.mockTestSection.create({
            data: {
                testId,
                setId,
                name: 'General Intelligence & Reasoning',
                durationMins: 60,
                sortOrder: 1
            }
        });

        // Set test to LIVE
        await prisma.mockTest.update({
            where: { id: testId },
            data: { status: 'LIVE' }
        });

        console.log('Successfully linked and set to LIVE.');

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

run();
