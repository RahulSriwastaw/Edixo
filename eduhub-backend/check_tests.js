
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTests() {
    const tests = await prisma.mockTest.findMany({
        where: {
            OR: [
                { name: { contains: 'secries', mode: 'insensitive' } },
                { testId: { contains: 'secries', mode: 'insensitive' } }
            ]
        }
    });
    console.log("MockTests with typo:", tests.length);
    tests.forEach(t => console.log(t.testId, t.name));
}

checkTests().catch(console.error).finally(() => prisma.$disconnect());
