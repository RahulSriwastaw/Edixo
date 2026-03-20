import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    try {
        console.log('Checking Mock Tests for GK-ORG-00001...');
        const org = await prisma.organization.findUnique({ where: { orgId: 'GK-ORG-00001' } });
        if (!org) return console.error('Org not found');

        const tests = await prisma.mockTest.findMany({
            where: { orgId: org.id },
            include: {
                sections: {
                    include: {
                        set: {
                            include: {
                                items: {
                                    include: {
                                        question: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        console.log(`Found ${tests.length} tests.`);
        tests.forEach(t => {
            const questionCount = t.sections.reduce((acc, s) => acc + (s.set?.items.length || 0), 0);
            console.log(`- Test: ${t.name} (id: ${t.id}) | Sections: ${t.sections.length} | Total Questions: ${questionCount}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

check();
