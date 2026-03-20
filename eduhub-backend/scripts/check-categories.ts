import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    try {
        console.log('Checking Exam Categories (Series) for GK-ORG-00001...');
        const org = await prisma.organization.findUnique({ where: { orgId: 'GK-ORG-00001' } });
        if (!org) return console.error('Org not found');

        const categories = await prisma.examCategory.findMany({
            where: { orgId: org.id },
            include: {
                subCategories: {
                    include: {
                        _count: { select: { mockTests: true } }
                    }
                }
            }
        });

        console.log(`Found ${categories.length} categories.`);
        categories.forEach(c => {
            console.log(`- Category: ${c.name} (id: ${c.id})`);
            c.subCategories.forEach(s => {
                console.log(`  -- SubCategory: ${s.name} (id: ${s.id}) | Tests: ${s._count.mockTests}`);
            });
        });

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

check();
