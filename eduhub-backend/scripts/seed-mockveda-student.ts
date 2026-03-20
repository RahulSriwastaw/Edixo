import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Mockveda student user...');
    
    // 3. Student
    const studentEmail = 'student@mockveda.com';
    const studentPassword = 'MockvedaStudent@123';
    const passwordHash = await bcrypt.hash(studentPassword, 10);

    const org = await prisma.organization.findUnique({
        where: { orgId: 'MOCKVEDA-001' }
    });

    if (!org) {
        throw new Error('Mockveda organization not found!');
    }

    const studentUser = await prisma.user.upsert({
        where: { email: studentEmail },
        update: { passwordHash, isActive: true },
        create: {
            email: studentEmail,
            passwordHash,
            role: 'STUDENT',
            isActive: true,
        },
    });

    await prisma.student.upsert({
        where: { userId: studentUser.id },
        update: { name: 'Mockveda Student', studentId: 'STU-MOCK-001' },
        create: {
            userId: studentUser.id,
            orgId: org.id,
            name: 'Mockveda Student',
            email: studentEmail,
            studentId: 'STU-MOCK-001',
        },
    });
    
    console.log(`Created Student: ${studentEmail} / ${studentPassword}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
