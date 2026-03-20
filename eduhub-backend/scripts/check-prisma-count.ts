import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    try {
        const count = await prisma.mockTest.count();
        console.log('Direct prisma.mockTest.count():', count);
        
        const orgFilter = {};
        const count2 = await prisma.mockTest.count({ where: orgFilter });
        console.log('prisma.mockTest.count({ where: {} }):', count2);

        const tests = await prisma.mockTest.findMany();
        console.log('findMany().length:', tests.length);
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
