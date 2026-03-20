import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    try {
        const tests = await prisma.mockTest.findMany({
            select: { id: true, name: true, status: true, orgId: true }
        });
        console.log('--- Mock Tests Status ---');
        console.table(tests);
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
