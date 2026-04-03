import { prisma } from '../src/config/database';
import bcrypt from 'bcryptjs';

// ─── Global Folder Seed Data ──────────────────────────────────
const GLOBAL_FOLDERS = [
    {
        id: 'global-ssc', name: 'SSC', slug: 'ssc', icon: '📁', color: '#3b82f6',
        children: [
            {
                id: 'global-ssc-cgl', name: 'CGL', slug: 'ssc-cgl',
                children: [
                    {
                        id: 'global-ssc-cgl-2024', name: '2024', slug: 'ssc-cgl-2024',
                        children: [
                            {
                                id: 'global-ssc-cgl-2024-t1', name: 'Tier-1', slug: 'ssc-cgl-2024-t1',
                                children: [
                                    { id: 'global-ssc-cgl-2024-t1-quant', name: 'Quantitative Aptitude', slug: 'ssc-cgl-2024-t1-quant', children: [] },
                                    { id: 'global-ssc-cgl-2024-t1-reasoning', name: 'Reasoning', slug: 'ssc-cgl-2024-t1-reasoning', children: [] },
                                    { id: 'global-ssc-cgl-2024-t1-english', name: 'English', slug: 'ssc-cgl-2024-t1-english', children: [] },
                                    { id: 'global-ssc-cgl-2024-t1-ga', name: 'General Awareness', slug: 'ssc-cgl-2024-t1-ga', children: [] },
                                ]
                            },
                            {
                                id: 'global-ssc-cgl-2024-t2', name: 'Tier-2', slug: 'ssc-cgl-2024-t2',
                                children: [
                                    { id: 'global-ssc-cgl-2024-t2-math', name: 'Math', slug: 'ssc-cgl-2024-t2-math', children: [] },
                                    { id: 'global-ssc-cgl-2024-t2-english', name: 'English', slug: 'ssc-cgl-2024-t2-english', children: [] },
                                ]
                            },
                        ]
                    },
                    {
                        id: 'global-ssc-cgl-2023', name: '2023', slug: 'ssc-cgl-2023',
                        children: [
                            {
                                id: 'global-ssc-cgl-2023-t1', name: 'Tier-1', slug: 'ssc-cgl-2023-t1',
                                children: [
                                    { id: 'global-ssc-cgl-2023-t1-quant', name: 'Quantitative Aptitude', slug: 'ssc-cgl-2023-t1-quant', children: [] },
                                    { id: 'global-ssc-cgl-2023-t1-reasoning', name: 'Reasoning', slug: 'ssc-cgl-2023-t1-reasoning', children: [] },
                                    { id: 'global-ssc-cgl-2023-t1-english', name: 'English', slug: 'ssc-cgl-2023-t1-english', children: [] },
                                    { id: 'global-ssc-cgl-2023-t1-ga', name: 'General Awareness', slug: 'ssc-cgl-2023-t1-ga', children: [] },
                                ]
                            },
                        ]
                    },
                    {
                        id: 'global-ssc-cgl-2022', name: '2022', slug: 'ssc-cgl-2022',
                        children: [
                            {
                                id: 'global-ssc-cgl-2022-t1', name: 'Tier-1', slug: 'ssc-cgl-2022-t1',
                                children: [
                                    { id: 'global-ssc-cgl-2022-t1-quant', name: 'Quantitative Aptitude', slug: 'ssc-cgl-2022-t1-quant', children: [] },
                                    { id: 'global-ssc-cgl-2022-t1-reasoning', name: 'Reasoning', slug: 'ssc-cgl-2022-t1-reasoning', children: [] },
                                    { id: 'global-ssc-cgl-2022-t1-english', name: 'English', slug: 'ssc-cgl-2022-t1-english', children: [] },
                                ]
                            },
                        ]
                    },
                ]
            },
            {
                id: 'global-ssc-chsl', name: 'CHSL', slug: 'ssc-chsl',
                children: [
                    { id: 'global-ssc-chsl-2024', name: '2024', slug: 'ssc-chsl-2024', children: [] },
                    { id: 'global-ssc-chsl-2023', name: '2023', slug: 'ssc-chsl-2023', children: [] },
                ]
            },
            { id: 'global-ssc-mts', name: 'MTS', slug: 'ssc-mts', children: [] },
            { id: 'global-ssc-gd', name: 'GD Constable', slug: 'ssc-gd', children: [] },
            { id: 'global-ssc-cpo', name: 'CPO', slug: 'ssc-cpo', children: [] },
        ]
    },
    {
        id: 'global-banking', name: 'Banking', slug: 'banking', icon: '🏦', color: '#10b981',
        children: [
            {
                id: 'global-ibps-po', name: 'IBPS PO', slug: 'ibps-po',
                children: [
                    { id: 'global-ibps-po-pre', name: 'Prelims', slug: 'ibps-po-pre', children: [] },
                    { id: 'global-ibps-po-mains', name: 'Mains', slug: 'ibps-po-mains', children: [] },
                ]
            },
            {
                id: 'global-ibps-clerk', name: 'IBPS Clerk', slug: 'ibps-clerk',
                children: [
                    { id: 'global-ibps-clerk-pre', name: 'Prelims', slug: 'ibps-clerk-pre', children: [] },
                    { id: 'global-ibps-clerk-mains', name: 'Mains', slug: 'ibps-clerk-mains', children: [] },
                ]
            },
            {
                id: 'global-sbi-po', name: 'SBI PO', slug: 'sbi-po',
                children: [
                    { id: 'global-sbi-po-pre', name: 'Prelims', slug: 'sbi-po-pre', children: [] },
                    { id: 'global-sbi-po-mains', name: 'Mains', slug: 'sbi-po-mains', children: [] },
                ]
            },
            { id: 'global-sbi-clerk', name: 'SBI Clerk', slug: 'sbi-clerk', children: [] },
            { id: 'global-rbi-grade-b', name: 'RBI Grade B', slug: 'rbi-grade-b', children: [] },
        ]
    },
    {
        id: 'global-neet', name: 'NEET', slug: 'neet', icon: '🔬', color: '#8b5cf6',
        children: [
            {
                id: 'global-neet-biology', name: 'Biology', slug: 'neet-biology',
                children: [
                    { id: 'global-neet-botany', name: 'Botany', slug: 'neet-botany', children: [] },
                    { id: 'global-neet-zoology', name: 'Zoology', slug: 'neet-zoology', children: [] },
                ]
            },
            {
                id: 'global-neet-chemistry', name: 'Chemistry', slug: 'neet-chemistry',
                children: [
                    { id: 'global-neet-chem-organic', name: 'Organic', slug: 'neet-chem-organic', children: [] },
                    { id: 'global-neet-chem-inorganic', name: 'Inorganic', slug: 'neet-chem-inorganic', children: [] },
                    { id: 'global-neet-chem-physical', name: 'Physical', slug: 'neet-chem-physical', children: [] },
                ]
            },
            { id: 'global-neet-physics', name: 'Physics', slug: 'neet-physics', children: [] },
        ]
    },
    {
        id: 'global-jee', name: 'JEE', slug: 'jee', icon: '⚙️', color: '#f59e0b',
        children: [
            {
                id: 'global-jee-mains', name: 'JEE Mains', slug: 'jee-mains',
                children: [
                    { id: 'global-jee-mains-math', name: 'Mathematics', slug: 'jee-mains-math', children: [] },
                    { id: 'global-jee-mains-physics', name: 'Physics', slug: 'jee-mains-physics', children: [] },
                    { id: 'global-jee-mains-chemistry', name: 'Chemistry', slug: 'jee-mains-chemistry', children: [] },
                ]
            },
            {
                id: 'global-jee-advanced', name: 'JEE Advanced', slug: 'jee-advanced',
                children: [
                    { id: 'global-jee-adv-math', name: 'Mathematics', slug: 'jee-adv-math', children: [] },
                    { id: 'global-jee-adv-physics', name: 'Physics', slug: 'jee-adv-physics', children: [] },
                    { id: 'global-jee-adv-chemistry', name: 'Chemistry', slug: 'jee-adv-chemistry', children: [] },
                ]
            },
        ]
    },
    {
        id: 'global-upsc', name: 'UPSC', slug: 'upsc', icon: '🏛️', color: '#6366f1',
        children: [
            { id: 'global-upsc-prelims', name: 'Prelims', slug: 'upsc-prelims', children: [] },
            { id: 'global-upsc-mains', name: 'Mains', slug: 'upsc-mains', children: [] },
        ]
    },
    {
        id: 'global-railways', name: 'Railways', slug: 'railways', icon: '🚂', color: '#ef4444',
        children: [
            { id: 'global-rrb-ntpc', name: 'RRB NTPC', slug: 'rrb-ntpc', children: [] },
            { id: 'global-rrb-group-d', name: 'RRB Group D', slug: 'rrb-group-d', children: [] },
            { id: 'global-rrb-alp', name: 'RRB ALP', slug: 'rrb-alp', children: [] },
        ]
    },
    {
        id: 'global-state-psc', name: 'State PSC', slug: 'state-psc', icon: '🏢', color: '#14b8a6',
        children: [
            { id: 'global-uppsc', name: 'UPPSC', slug: 'uppsc', children: [] },
            { id: 'global-bpsc', name: 'BPSC', slug: 'bpsc', children: [] },
            { id: 'global-mpsc', name: 'MPSC', slug: 'mpsc', children: [] },
            { id: 'global-rpsc', name: 'RPSC', slug: 'rpsc', children: [] },
        ]
    },
];

// ─── Helper: Seed folder recursively ─────────────────────────
async function seedFolder(folder: any, parentId: string | null, depth: number, parentPath: string) {
    const path = parentId === null ? '/' : (parentPath === '/' ? `/${parentId}` : `${parentPath}/${parentId}`);

    await prisma.qBankFolder.upsert({
        where: { id: folder.id },
        update: { name: folder.name, slug: folder.slug, icon: folder.icon, color: folder.color, depth, path, sortOrder: 0 },
        create: {
            id: folder.id,
            name: folder.name,
            slug: folder.slug,
            icon: folder.icon || '📁',
            color: folder.color,
            parentId,
            path,
            depth,
            scope: 'GLOBAL',
            sortOrder: 0,
            isActive: true,
        },
    });

    for (const child of (folder.children || [])) {
        await seedFolder(child, folder.id, depth + 1, path);
    }
}

async function seed() {
    console.log('🌱 Seeding database...');

    // ─── Super Admin ──────────────────────────────────────────
    const passwordHash = await bcrypt.hash('SuperAdmin@123', 12);

    const saUser = await prisma.user.upsert({
        where: { email: 'admin@eduhub.in' },
        update: {},
        create: {
            email: 'admin@eduhub.in',
            passwordHash,
            role: 'SUPER_ADMIN',
            isActive: true,
        },
    });

    await prisma.superAdmin.upsert({
        where: { userId: saUser.id },
        update: {},
        create: {
            userId: saUser.id,
            name: 'EduHub Super Admin',
            email: 'admin@eduhub.in',
        },
    });

    console.log('✅ Super Admin created: admin@eduhub.in / SuperAdmin@123');

    // ─── Demo Organization & Staff ────────────────────────────
    const orgId = 'eduhub';
    const demoOrg = await prisma.organization.upsert({
        where: { orgId },
        update: {},
        create: {
            orgId,
            name: 'EduHub Demo',
            whiteboardPin: '123456',
        },
    });

    const teacherEmail = 'teacher@eduhub.in';
    const teacherPasswordHash = await bcrypt.hash('password', 12);
    const teacherUser = await prisma.user.upsert({
        where: { email: teacherEmail },
        update: {},
        create: {
            email: teacherEmail,
            passwordHash: teacherPasswordHash,
            role: 'ORG_STAFF',
            isActive: true,
        },
    });

    await prisma.orgStaff.upsert({
        where: { 
            userId: teacherUser.id 
        },
        update: {},
        create: {
            staffId: 'STAFF001',
            orgId: demoOrg.id,
            userId: teacherUser.id,
            name: 'Demo Teacher',
        },
    });

    console.log(`✅ Demo Staff created: ${teacherEmail} / password (Org: ${orgId})`);

    // ─── Demo Question Sets ──────────────────────────────────
    console.log('📝 Seeding demo question sets...');
    
    const set1 = await prisma.questionSet.upsert({
        where: { setId: 'SET001' },
        update: {},
        create: {
            setId: 'SET001',
            pin: '123456',
            name: 'Mathematics Basic Test',
            description: 'A basic math assessment for demo purposes.',
            totalQuestions: 10,
            durationMins: 30,
            orgId: demoOrg.id,
        },
    });

    const set2 = await prisma.questionSet.upsert({
        where: { setId: 'SET002' },
        update: {},
        create: {
            setId: 'SET002',
            pin: '123456',
            name: 'General Awareness Quiz',
            description: 'Demo quiz covering global events.',
            totalQuestions: 15,
            durationMins: 20,
            orgId: demoOrg.id,
        },
    });

    // ─── Demo Questions ──────────────────────────────────────
    console.log('❓ Seeding demo questions...');
    
    const q1 = await prisma.question.upsert({
        where: { questionId: 'Q-1001' },
        update: {},
        create: {
            questionId: 'Q-1001',
            textEn: 'What is the sum of 12 + 15?',
            textHi: '12 aur 15 ka jod kya hai?',
            type: 'MCQ_SINGLE',
            difficulty: 'EASY',
            orgId: demoOrg.id,
            options: {
                create: [
                    { id: 'opt1', textEn: '25', isCorrect: false },
                    { id: 'opt2', textEn: '27', isCorrect: true },
                    { id: 'opt3', textEn: '30', isCorrect: false },
                ]
            }
        },
    });

    const q2 = await prisma.question.upsert({
        where: { questionId: 'Q-1002' },
        update: {},
        create: {
            questionId: 'Q-1002',
            textEn: 'Identify the verb in the sentence "She runs fast".',
            textHi: '',
            type: 'MCQ_SINGLE',
            difficulty: 'MEDIUM',
            orgId: demoOrg.id,
            options: {
                create: [
                    { id: 'opt4', textEn: 'Runs', isCorrect: true },
                    { id: 'opt5', textEn: 'Fast', isCorrect: false },
                    { id: 'opt6', textEn: 'She', isCorrect: false },
                ]
            }
        },
    });

    // Link Questions to Sets
    await prisma.questionSetItem.upsert({
        where: { setId_questionId: { setId: set1.id, questionId: q1.id } },
        update: {},
        create: { setId: set1.id, questionId: q1.id, sortOrder: 1 },
    });

    await prisma.questionSetItem.upsert({
        where: { setId_questionId: { setId: set2.id, questionId: q2.id } },
        update: {},
        create: { setId: set2.id, questionId: q2.id, sortOrder: 1 },
    });

    console.log('✅ Demo Questions and Items created.');

    console.log('\n🎉 Seeding complete!');
}

seed()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
