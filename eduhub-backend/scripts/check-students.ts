import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
    try {
        console.log('Checking Student Records...');
        const students = await prisma.student.findMany({
            include: { org: true }
        });

        console.log(`Found ${students.length} students.`);
        students.forEach(s => {
            console.log(`- Student: ${s.name} (id: ${s.id}) | Org: ${s.org.orgId}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        await prisma.$disconnect();
    }
}

check();
