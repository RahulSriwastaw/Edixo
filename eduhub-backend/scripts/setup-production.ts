import { PrismaClient, UserRole, StaffRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding production users...');
    
    // 1. Super Admin (Project Level)
    const superAdminEmail = 'admin@eduhub.in';
    const superAdminPassword = 'EduHubAdmin@2026';
    const saPasswordHash = await bcrypt.hash(superAdminPassword, 10);

    const superAdminUser = await prisma.user.upsert({
        where: { email: superAdminEmail },
        update: { passwordHash: saPasswordHash },
        create: {
            email: superAdminEmail,
            passwordHash: saPasswordHash,
            role: UserRole.SUPER_ADMIN,
            isActive: true,
        },
    });

    await prisma.superAdmin.upsert({
        where: { email: superAdminEmail },
        update: { name: 'EduHub Super Admin' },
        create: {
            userId: superAdminUser.id,
            name: 'EduHub Super Admin',
            email: superAdminEmail,
        },
    });
    console.log(`Created Super Admin: ${superAdminEmail} / ${superAdminPassword}`);

    // 2. Organization Admin (Mockveda Level)
    const orgEmail = 'admin@mockveda.com';
    const orgPassword = 'MockvedaAdmin@2026';
    const orgPasswordHash = await bcrypt.hash(orgPassword, 10);
    
    // Delete old test superadmin just to clean up if it exists
    try {
        await prisma.superAdmin.delete({ where: { email: 'superadmin@mockveda.com' } });
        await prisma.user.delete({ where: { email: 'superadmin@mockveda.com' } });
    } catch (e) {}

    const org = await prisma.organization.upsert({
        where: { orgId: 'MOCKVEDA-001' },
        update: { orgAdminEmail: orgEmail, orgAdminPassword: orgPasswordHash },
        create: {
            orgId: 'MOCKVEDA-001',
            name: 'Mockveda',
            status: 'ACTIVE',
            plan: 'ENTERPRISE',
            orgAdminEmail: orgEmail,
            orgAdminPassword: orgPasswordHash, 
        },
    });

    const orgAdminUser = await prisma.user.upsert({
        where: { email: orgEmail },
        update: { passwordHash: orgPasswordHash },
        create: {
            email: orgEmail,
            passwordHash: orgPasswordHash,
            role: UserRole.ORG_STAFF,
            isActive: true,
        },
    });

    await prisma.orgStaff.upsert({
        where: { userId: orgAdminUser.id },
        update: { name: 'Mockveda Admin', staffId: 'STF-ORG-M001' },
        create: {
            userId: orgAdminUser.id,
            orgId: org.id,
            name: 'Mockveda Admin',
            email: orgEmail,
            staffId: 'STF-ORG-M001',
            role: StaffRole.ORG_ADMIN,
        },
    });
    console.log(`Created Org Admin: ${orgEmail} / ${orgPassword}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
