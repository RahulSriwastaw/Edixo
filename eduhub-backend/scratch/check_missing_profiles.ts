
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const usersWithoutStudents = await prisma.user.findMany({
            where: {
                role: 'STUDENT',
                NOT: {
                    id: {
                        in: (await prisma.student.findMany({ select: { userId: true } })).map(s => s.userId)
                    }
                }
            },
            select: { id: true, email: true, role: true }
        });
        console.log('Users (STUDENT role) without Student profile:', JSON.stringify(usersWithoutStudents, null, 2));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
