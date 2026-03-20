import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    try {
        console.log('Checking Question Bank Sets for GK-ORG-00001...');
        const org = await prisma.organization.findUnique({ where: { orgId: 'GK-ORG-00001' } });
        if (!org) return console.error('Org not found');

        const sets = await prisma.questionSet.findMany({
            where: { orgId: org.id },
            include: {
                _count: { select: { items: true } }
            }
        });

        console.log(`Found ${sets.length} sets.`);
        sets.forEach(s => {
            console.log(`- Set: ${s.name} (id: ${s.id}) | Questions: ${s._count.items}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

check();
