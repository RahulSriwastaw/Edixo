import { PrismaClient, UserRole } from '@prisma/client';
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function check() {
    try {
        const superAdmins = await prisma.superAdmin.findMany({
            include: { user: true }
        });
        console.log('Super Admins found:', superAdmins.length);
        
        if (superAdmins.length === 0) {
            console.log('No SuperAdmin found. Creating one...');
            
            // Check if user with admin@eduhub.in exists
            let user = await prisma.user.findUnique({ where: { email: 'admin@eduhub.in' } });
            
            if (!user) {
                console.log('Creating User record...');
                const passwordHash = await bcrypt.hash('SuperAdmin@123', 12);
                user = await prisma.user.create({
                    data: {
                        email: 'admin@eduhub.in',
                        passwordHash,
                        role: UserRole.SUPER_ADMIN
                    }
                });
            } else {
                console.log('User record already exists with ID:', user.id);
                // Ensure role is SUPER_ADMIN
                if (user.role !== UserRole.SUPER_ADMIN) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { role: UserRole.SUPER_ADMIN }
                    });
                }
            }

            // Check if SuperAdmin record exists for this userId (might be missing even if user exists)
            const saExists = await prisma.superAdmin.findUnique({ where: { userId: user.id } });
            if (!saExists) {
                await prisma.superAdmin.create({
                    data: {
                        userId: user.id,
                        email: user.email!,
                        name: 'Super Admin'
                    }
                });
                console.log('SuperAdmin record created successfully!');
            } else {
                console.log('SuperAdmin record already exists.');
            }
        } else {
            console.log('Existing Super Admins:', superAdmins.map(s => s.email));
        }
    } catch (e) {
        console.error('Error checking database:', e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
