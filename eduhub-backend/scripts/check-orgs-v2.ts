import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    try {
        const orgs = await prisma.organization.findMany();
        console.log('Total Organizations:', orgs.length);
        console.table(orgs.map(o => ({ id: o.id, orgId: o.orgId, name: o.name })));
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
