import { PrismaClient, UserRole } from '@prisma/client';
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function reset() {
    try {
        console.log('Resetting SuperAdmin password...');
        const passwordHash = await bcrypt.hash('SuperAdmin@123', 12);
        
        const user = await prisma.user.findUnique({ where: { email: 'admin@eduhub.in' } });
        if (user) {
            await prisma.user.update({
                where: { id: user.id },
                data: { 
                    passwordHash,
                    role: UserRole.SUPER_ADMIN 
                }
            });
            console.log('Password reset successful for user ID:', user.id);
        } else {
            console.log('User admin@eduhub.in not found!');
        }
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

reset();
