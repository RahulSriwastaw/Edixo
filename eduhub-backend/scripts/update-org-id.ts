import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function update() {
    try {
        console.log('Updating organization orgId to GK-ORG-00001...');
        const org = await prisma.organization.findFirst({ where: { orgId: 'MOCKVEDA-001' } });
        if (org) {
            await prisma.organization.update({
                where: { id: org.id },
                data: { orgId: 'GK-ORG-00001' }
            });
            console.log('Organization updated successfully.');
        } else {
            console.log('Organization MOCKVEDA-001 not found.');
        }
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

update();
