
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

async function migrate() {
    console.log("Migrating MockTest testId to secure hex strings...");
    
    const tests = await prisma.mockTest.findMany({
        select: { id: true, testId: true, name: true }
    });

    console.log(`Found ${tests.length} tests.`);

    for (const test of tests) {
        // Skip if already hex (24 chars)
        if (/^[0-9a-f]{24}$/.test(test.testId)) {
            console.log(`Skipping ${test.testId} (already secure)`);
            continue;
        }

        const newTestId = crypto.randomBytes(12).toString('hex');
        console.log(`Updating ${test.testId} -> ${newTestId} (${test.name})`);
        
        await prisma.mockTest.update({
            where: { id: test.id },
            data: { testId: newTestId }
        });
    }

    console.log("Migration complete.");
}

migrate().catch(console.error).finally(() => prisma.$disconnect());
