import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database';
import { authenticate, requireSuperAdmin } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';
import mockbookRoutes from './mockbook/superAdminMockbook.routes';

const router = Router();
router.use(authenticate, requireSuperAdmin);
router.use('/mockbook', mockbookRoutes);

// ─── GET /api/super-admin/dashboard ─────────────────────────
router.get('/dashboard', async (_req, res, next) => {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const [
            totalOrgs, activeOrgs, trialOrgs, suspendedOrgs,
            totalStudents, totalStaff,
            testAttemptCount, globalQuestionCount,
            activeUserCount
        ] = await Promise.all([
            prisma.organization.count({ where: { deletedAt: null } }),
            prisma.organization.count({ where: { status: 'ACTIVE', deletedAt: null } }),
            prisma.organization.count({ where: { status: 'TRIAL', deletedAt: null } }),
            prisma.organization.count({ where: { status: 'SUSPENDED', deletedAt: null } }),
            prisma.student.count({ where: { isActive: true } }),
            prisma.orgStaff.count({ where: { isActive: true } }),
            prisma.testAttempt.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
            prisma.question.count({ where: { orgId: null } }), // Global questions
            prisma.user.count({ where: { lastLoginAt: { gte: thirtyDaysAgo } } }),
        ]);

        // Monthly Recurring Revenue (MRR) calculation based on plans
        // SMALL: 5000, MEDIUM: 15000, LARGE: 40000, ENTERPRISE: 100000 (Mock values for calculation)
        const planRates: Record<string, number> = {
            SMALL: 5000,
            MEDIUM: 15000,
            LARGE: 40000,
            ENTERPRISE: 100000
        };

        const activeOrgsList = await prisma.organization.findMany({
            where: { status: 'ACTIVE', deletedAt: null },
            select: { plan: true }
        });

        const mrr = activeOrgsList.reduce((acc, org) => acc + (planRates[org.plan] || 0), 0);

        // Plan Distribution
        const planDistribution = await prisma.organization.groupBy({
            by: ['plan'],
            where: { deletedAt: null },
            _count: { _all: true }
        });

        // Trial expiring soon (next 3 days)
        const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        const trialExpiringSoon = await prisma.organization.findMany({
            where: {
                status: 'TRIAL',
                trialEndsAt: { lte: threeDaysFromNow },
                deletedAt: null,
            },
            select: { orgId: true, name: true, trialEndsAt: true },
            take: 10,
        });

        res.json({
            success: true,
            data: {
                stats: {
                    totalOrgs,
                    activeOrgs,
                    trialOrgs,
                    suspendedOrgs,
                    totalStudents,
                    totalStaff,
                    mrr,
                    testAttemptCount,
                    globalQuestionCount,
                    activeUserCount
                },
                planDistribution: planDistribution.map(p => ({
                    name: p.plan,
                    value: p._count._all
                })),
                alerts: { trialExpiringSoon },
                recentActivity: await prisma.platformAuditLog.findMany({
                    take: 10,
                    orderBy: { createdAt: 'desc' }
                }),
                revenueHistory: [
                    { month: "Jan", mrr: mrr * 0.9 },
                    { month: "Feb", mrr: mrr * 0.95 },
                    { month: "Mar", mrr: mrr }
                ] // Mocking history for now as we don't have historical snapshots yet
            },
        });
    } catch (err) { next(err); }
});

// ─── GET /api/super-admin/organizations ─────────────────────
router.get('/organizations', async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search, status, plan } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = { deletedAt: null };
        if (search) where.OR = [
            { name: { contains: search as string, mode: 'insensitive' } },
            { orgId: { contains: search as string, mode: 'insensitive' } },
        ];
        if (status) where.status = status;
        if (plan) where.plan = plan;

        const [orgs, total] = await Promise.all([
            prisma.organization.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true, orgId: true, name: true, plan: true,
                    status: true, billingCycle: true, trialEndsAt: true,
                    studentCount: true, staffCount: true, aiCredits: true,
                    createdAt: true, city: true, state: true,
                    subdomain: true, customDomain: true,
                },
            }),
            prisma.organization.count({ where }),
        ]);

        res.json({
            success: true,
            data: { orgs, total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
        });
    } catch (err) { next(err); }
});

// ─── GET /api/super-admin/organizations/:orgId ──────────────
router.get('/organizations/:orgId', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirst({
            where: { orgId: req.params.orgId, deletedAt: null },
            include: {
                featureFlags: true,
                personalizationSettings: true,
            },
        });
        if (!org) throw new AppError('Organization not found', 404);

        const [studentCount, staffCount, testAttemptCount] = await Promise.all([
            prisma.student.count({ where: { orgId: org.id, isActive: true } }),
            prisma.orgStaff.count({ where: { orgId: org.id, isActive: true } }),
            prisma.testAttempt.count({ 
                where: { 
                    student: { 
                        orgId: org.id 
                    } 
                } 
            }).catch(e => {
                console.error("Error counting test attempts:", e);
                return 0;
            }),
        ]);

        res.json({
            success: true,
            data: {
                ...org,
                _count: {
                    students: studentCount,
                    staff: staffCount,
                    testAttempts: testAttemptCount,
                }
            },
        });
    } catch (err) { 
        console.error("Error in GET /organizations/:orgId:", err);
        next(err); 
    }
});

// ─── GET /api/super-admin/organizations/:orgId/staff ────────
router.get('/organizations/:orgId/staff', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirst({ where: { orgId: req.params.orgId } });
        if (!org) throw new AppError('Organization not found', 404);

        const staff = await prisma.orgStaff.findMany({
            where: { orgId: org.id },
            include: { user: { select: { lastLoginAt: true } } },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: staff });
    } catch (err) { next(err); }
});

// ─── GET /api/super-admin/organizations/:orgId/students ─────
router.get('/organizations/:orgId/students', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirst({ where: { orgId: req.params.orgId } });
        if (!org) throw new AppError('Organization not found', 404);

        const students = await prisma.student.findMany({
            where: { orgId: org.id },
            include: { user: { select: { lastLoginAt: true } } },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        res.json({ success: true, data: students });
    } catch (err) { next(err); }
});

// ─── GET /api/super-admin/organizations/:orgId/audit ────────
router.get('/organizations/:orgId/audit', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirst({ where: { orgId: req.params.orgId } });
        if (!org) throw new AppError('Organization not found', 404);

        const audit = await prisma.orgAuditLog.findMany({
            where: { orgId: org.id },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        res.json({ success: true, data: audit });
    } catch (err) { next(err); }
});

// ─── POST /api/super-admin/organizations ────────────────────
router.post('/organizations', async (req, res, next) => {
    try {
        const schema = z.object({
            name: z.string().min(2),
            email: z.string().email().optional(),
            mobile: z.string().optional(),
            plan: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE']).default('SMALL'),
            billingCycle: z.enum(['MONTHLY', 'YEARLY']).default('MONTHLY'),
            adminEmail: z.string().email(),
            adminPassword: z.string().min(8),
            trialDays: z.number().default(30),
            subdomain: z.string().optional(),
            customDomain: z.string().optional(),
        });
        const body = schema.parse(req.body);

        // Generate Org ID: GK-ORG-XXXXX (sequential)
        const count = await prisma.organization.count();
        const orgId = `GK-ORG-${String(count + 1).padStart(5, '0')}`;

        const passwordHash = await bcrypt.hash(body.adminPassword, 12);
        const trialEndsAt = new Date(Date.now() + body.trialDays * 24 * 60 * 60 * 1000);

        // AI credits by plan
        const planCredits: Record<string, number> = {
            SMALL: 500, MEDIUM: 2000, LARGE: 8000, ENTERPRISE: 999999
        };

        const [org] = await prisma.$transaction(async (tx) => {
            const newOrg = await tx.organization.create({
                data: {
                    orgId,
                    name: body.name,
                    email: body.email,
                    mobile: body.mobile,
                    plan: body.plan,
                    billingCycle: body.billingCycle,
                    status: 'TRIAL',
                    trialEndsAt,
                    aiCredits: planCredits[body.plan],
                    orgAdminEmail: body.adminEmail,
                    orgAdminPassword: passwordHash,
                    subdomain: body.subdomain,
                    customDomain: body.customDomain,
                },
            });

            // Create org admin user
            const user = await tx.user.create({
                data: { email: body.adminEmail, passwordHash, role: 'ORG_STAFF' },
            });

            const staffCount = await tx.orgStaff.count({ where: { orgId: newOrg.id } });
            const staffId = `GK-TCH-${String(staffCount + 1).padStart(5, '0')}`;

            await tx.orgStaff.create({
                data: {
                    staffId,
                    userId: user.id,
                    orgId: newOrg.id,
                    name: 'Org Admin',
                    email: body.adminEmail,
                    role: 'ORG_ADMIN',
                },
            });

            // Default feature flags
            await tx.orgFeatureFlag.createMany({
                data: [
                    { orgId: newOrg.id, key: 'ai_question_generation', value: false },
                    { orgId: newOrg.id, key: 'pdf_extraction', value: true },
                    { orgId: newOrg.id, key: 'video_recordings', value: false },
                    { orgId: newOrg.id, key: 'advanced_analytics', value: false },
                    { orgId: newOrg.id, key: 'whatsapp_bot', value: false },
                    { orgId: newOrg.id, key: 'razorpay_integration', value: false },
                ],
            });

            // Default personalization settings
            await tx.orgPersonalizationSettings.create({
                data: { orgId: newOrg.id },
            });

            return [newOrg];
        });

        res.status(201).json({ success: true, data: org, message: `Organization ${orgId} created` });
    } catch (err) { next(err); }
});

// ─── PATCH /api/super-admin/organizations/:orgId ─────────────
router.patch('/organizations/:orgId', async (req, res, next) => {
    try {
        const schema = z.object({
            name: z.string().min(2).optional(),
            email: z.string().email().optional(),
            mobile: z.string().optional(),
            city: z.string().optional(),
            state: z.string().optional(),
            address: z.string().optional(),
            category: z.string().optional(),
            subdomain: z.string().optional(),
            customDomain: z.string().optional(),
            logoUrl: z.string().optional(),
            primaryColor: z.string().optional(),
        });
        const body = schema.parse(req.body);

        const org = await prisma.organization.findFirst({
            where: { orgId: req.params.orgId, deletedAt: null },
        });
        if (!org) throw new AppError('Organization not found', 404);

        const updated = await prisma.organization.update({
            where: { id: org.id },
            data: body,
        });

        res.json({ success: true, data: updated, message: 'Organization updated' });
    } catch (err) { next(err); }
});

// ─── PATCH /api/super-admin/organizations/:orgId/status ─────
router.patch('/organizations/:orgId/status', async (req, res, next) => {
    try {
        const { status } = z.object({
            status: z.enum(['ACTIVE', 'SUSPENDED', 'EXPIRED', 'TRIAL']),
        }).parse(req.body);

        const org = await prisma.organization.findFirst({
            where: { orgId: req.params.orgId, deletedAt: null },
        });
        if (!org) throw new AppError('Organization not found', 404);

        await prisma.organization.update({
            where: { id: org.id },
            data: { status },
        });

        res.json({ success: true, message: `Status updated to ${status}` });
    } catch (err) { next(err); }
});

// ─── PATCH /api/super-admin/organizations/:orgId/plan ────────
router.patch('/organizations/:orgId/plan', async (req, res, next) => {
    try {
        const { plan, billingCycle } = z.object({
            plan: z.enum(['SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE']),
            billingCycle: z.enum(['MONTHLY', 'YEARLY']).optional(),
        }).parse(req.body);

        const org = await prisma.organization.findFirst({
            where: { orgId: req.params.orgId, deletedAt: null },
        });
        if (!org) throw new AppError('Organization not found', 404);

        const planCredits: Record<string, number> = {
            SMALL: 500, MEDIUM: 2000, LARGE: 8000, ENTERPRISE: 999999
        };

        const updateData: any = { plan };
        if (billingCycle) updateData.billingCycle = billingCycle;
        // Top up AI credits when upgrading plan
        if (planCredits[plan] > (org.aiCredits || 0)) {
            updateData.aiCredits = planCredits[plan];
        }

        const updated = await prisma.organization.update({
            where: { id: org.id },
            data: updateData,
        });

        res.json({ success: true, data: updated, message: `Plan changed to ${plan}` });
    } catch (err) { next(err); }
});

// ─── PATCH /api/super-admin/organizations/:orgId/extend-trial ─
router.patch('/organizations/:orgId/extend-trial', async (req, res, next) => {
    try {
        const { days } = z.object({
            days: z.number().int().min(1).max(365),
        }).parse(req.body);

        const org = await prisma.organization.findFirst({
            where: { orgId: req.params.orgId, deletedAt: null },
        });
        if (!org) throw new AppError('Organization not found', 404);

        const baseDate = org.trialEndsAt && org.trialEndsAt > new Date()
            ? org.trialEndsAt
            : new Date();
        const newTrialEnd = new Date(baseDate.getTime() + days * 24 * 60 * 60 * 1000);

        await prisma.organization.update({
            where: { id: org.id },
            data: {
                trialEndsAt: newTrialEnd,
                status: 'TRIAL',
            },
        });

        res.json({ success: true, message: `Trial extended by ${days} days until ${newTrialEnd.toLocaleDateString()}` });
    } catch (err) { next(err); }
});

// ─── DELETE /api/super-admin/organizations/:orgId ────────────
router.delete('/organizations/:orgId', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirst({
            where: { orgId: req.params.orgId, deletedAt: null },
        });
        if (!org) throw new AppError('Organization not found', 404);

        await prisma.organization.update({
            where: { id: org.id },
            data: { deletedAt: new Date(), status: 'SUSPENDED' },
        });

        res.json({ success: true, message: `Organization ${org.name} deleted` });
    } catch (err) { next(err); }
});

// ─── POST /api/super-admin/organizations/:orgId/ai-credits ──
router.post('/organizations/:orgId/ai-credits', async (req, res, next) => {
    try {
        const { amount, description } = z.object({
            amount: z.number(),
            description: z.string().optional(),
        }).parse(req.body);

        const org = await prisma.organization.findFirst({
            where: { orgId: req.params.orgId, deletedAt: null },
        });
        if (!org) throw new AppError('Organization not found', 404);

        await prisma.$transaction([
            prisma.organization.update({
                where: { id: org.id },
                data: { aiCredits: { increment: amount } },
            }),
            prisma.aiCreditTransaction.create({
                data: {
                    orgId: org.id,
                    action: 'topup',
                    credits: amount,
                    description: description || 'Super Admin topup',
                },
            }),
        ]);

        res.json({ success: true, message: `${amount} AI credits added` });
    } catch (err) { next(err); }
});

// ─── GET /api/super-admin/organizations/:orgId/feature-flags 
router.get('/organizations/:orgId/feature-flags', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirst({
            where: { orgId: req.params.orgId },
            include: { featureFlags: true },
        });
        if (!org) throw new AppError('Organization not found', 404);
        res.json({ success: true, data: org.featureFlags });
    } catch (err) { next(err); }
});

// ─── PATCH /api/super-admin/organizations/:orgId/feature-flags
router.patch('/organizations/:orgId/feature-flags', async (req, res, next) => {
    try {
        const { key, value } = z.object({
            key: z.string(),
            value: z.boolean(),
        }).parse(req.body);

        const org = await prisma.organization.findFirst({
            where: { orgId: req.params.orgId },
        });
        if (!org) throw new AppError('Organization not found', 404);

        await prisma.orgFeatureFlag.upsert({
            where: { orgId_key: { orgId: org.id, key } },
            update: { value },
            create: { orgId: org.id, key, value },
        });

        res.json({ success: true, message: `Feature flag "${key}" set to ${value}` });
    } catch (err) { next(err); }
});

// ─── GET /api/super-admin/users ─────────────────────────────
router.get('/users', async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search, role, status } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {};
        if (search) {
            where.OR = [
                { email: { contains: search as string, mode: 'insensitive' } },
                { mobile: { contains: search as string, mode: 'insensitive' } },
                { student: { name: { contains: search as string, mode: 'insensitive' } } },
                { orgStaff: { name: { contains: search as string, mode: 'insensitive' } } },
            ];
        }
        if (role) where.role = role;
        if (status) where.isActive = status === 'ACTIVE';

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    student: { select: { name: true, studentId: true, org: { select: { name: true, orgId: true } } } },
                    orgStaff: { select: { name: true, staffId: true, org: { select: { name: true, orgId: true } } } },
                },
            }),
            prisma.user.count({ where }),
        ]);

        res.json({
            success: true,
            data: { users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
        });
    } catch (err) { next(err); }
});

// ─── MockBook / Organization Tests ───────────────────────────
router.get('/mockbook/:orgId/tests', async (req, res, next) => {
    try {
        const { folderId } = req.query;
        const org = await prisma.organization.findFirst({ where: { orgId: req.params.orgId } });
        if (!org) throw new AppError('Organization not found', 404);

        const tests = await prisma.mockTest.findMany({
            where: { 
                orgId: org.id,
                subCategoryId: folderId ? (folderId as string) : undefined
            },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: { select: { attempts: true } },
                sections: { include: { set: true } }
            },
        });

        // Map to frontend format
        const mappedTests = tests.map(test => ({
            id: test.testId,
            dbId: test.id,
            name: test.name,
            type: "Full Mock", 
            setCode: test.sections[0]?.set?.setId || "N/A",
            questions: test.sections[0]?.set?.totalQuestions || 0,
            duration: test.durationMins,
            attempts: test._count.attempts,
            status: test.status.toLowerCase(),
            marks: test.totalMarks,
            accessType: test.isPublic ? "free" : "pack",
        }));

        res.json({ success: true, data: mappedTests });
    } catch (err) { next(err); }
});

router.post('/mockbook/:orgId/tests', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirst({ where: { orgId: req.params.orgId } });
        if (!org) throw new AppError('Organization not found', 404);

        const schema = z.object({
            name: z.string().min(1),
            type: z.string().optional(),
            description: z.string().optional(),
            instructions: z.string().optional(),
            setId: z.string().min(1),
            setPassword: z.string().optional(),
            duration: z.number().min(1),
            totalMarks: z.number().min(0),
            status: z.string().optional(),
            folderId: z.string().optional(), // ExamSubCategory ID
        });

        const body = schema.parse(req.body);

        // Find the QuestionSet DB ID from the user-provided setId (human-readable or UUID)
        const qSet = await prisma.questionSet.findFirst({
            where: {
                OR: [
                    { id: body.setId },
                    { setId: body.setId }
                ]
            }
        });
        if (!qSet) throw new AppError('Question Set not found', 404);

        const testId = String(Math.floor(100000 + Math.random() * 900000));
        const pin = body.setPassword || String(Math.floor(100000 + Math.random() * 900000));

        const test = await prisma.mockTest.create({
            data: {
                testId,
                pin,
                orgId: org.id,
                subCategoryId: body.folderId || null,
                name: body.name,
                description: body.description,
                durationMins: body.duration,
                totalMarks: body.totalMarks,
                status: (body.status?.toUpperCase() as any) || 'DRAFT',
                sections: {
                    create: [{
                        setId: qSet.id,
                        name: 'Section 1',
                        sortOrder: 0,
                    }]
                }
            },
            include: {
                _count: { select: { attempts: true } }
            }
        });

        res.status(201).json({ 
            success: true, 
            data: {
                id: test.testId,
                dbId: test.id,
                name: test.name,
                type: body.type || "Full Mock",
                setCode: body.setId,
                questions: qSet.totalQuestions || 0,
                duration: test.durationMins,
                attempts: 0,
                status: test.status.toLowerCase(),
                marks: test.totalMarks,
                accessType: "free"
            }
        });
    } catch (err) { next(err); }
});

// ─── MockBook Packs (Super Admin) ─────────────────────────────
router.get('/mockbook/:orgId/packs', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirst({ where: { orgId: req.params.orgId } });
        if (!org) throw new AppError('Organization not found', 404);

        // Using ExamCategory as "packs" scoped to org
        const packs = await prisma.examCategory.findMany({
            where: { orgId: org.id },
            include: { _count: { select: { subCategories: true } } },
            orderBy: { createdAt: 'desc' },
        });

        res.json({
            success: true,
            data: packs.map(p => ({
                id: p.id,
                name: p.name,
                shortDesc: p.description || '',
                monthlyPrice: p.isFree ? 0 : (p.price || 0),
                yearlyPrice: p.isFree ? 0 : Math.round((p.price || 0) * 10),
                status: p.isActive ? 'active' : 'draft',
                badge: p.isFeatured ? 'Most Popular' : null,
                mockTests: p._count.subCategories || 0,
                studyPlans: 0,
                aiPoints: 500,
                dailyPractice: true,
                students: 0,
                isFree: p.isFree,
            }))
        });
    } catch (err) { next(err); }
});

router.post('/mockbook/:orgId/packs', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirst({ where: { orgId: req.params.orgId } });
        if (!org) throw new AppError('Organization not found', 404);

        const folder = await prisma.examFolder.findFirst({ where: { orgId: org.id } });
        if (!folder) throw new AppError('Create an exam folder first', 400);

        const pack = await prisma.examCategory.create({
            data: {
                orgId: org.id,
                folderId: folder.id,
                name: req.body.name || 'Unnamed Pack',
                description: req.body.shortDesc || req.body.description || '',
                isFree: req.body.monthlyPrice === 0 || req.body.isFree || false,
                price: req.body.monthlyPrice || 0,
                isActive: req.body.status === 'active',
                isFeatured: req.body.badge === 'Most Popular',
            }
        });

        res.status(201).json({ success: true, data: { id: pack.id, ...req.body, status: pack.isActive ? 'active' : 'draft' } });
    } catch (err) { next(err); }
});

router.patch('/mockbook/:orgId/packs/:packId', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirst({ where: { orgId: req.params.orgId } });
        if (!org) throw new AppError('Organization not found', 404);

        const pack = await prisma.examCategory.update({
            where: { id: req.params.packId },
            data: {
                name: req.body.name,
                description: req.body.shortDesc,
                isActive: req.body.status === 'active',
                isFeatured: req.body.badge === 'Most Popular',
                price: req.body.monthlyPrice,
                isFree: req.body.isFree,
            }
        });

        res.json({ success: true, data: pack });
    } catch (err) { next(err); }
});

router.delete('/mockbook/:orgId/packs/:packId', async (req, res, next) => {
    try {
        await prisma.examCategory.delete({ where: { id: req.params.packId } });
        res.json({ success: true, message: 'Pack deleted' });
    } catch (err) { next(err); }
});

// ─── GET /api/super-admin/audit-logs ─────────────────────────
router.get('/audit-logs', async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search, category } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {};
        if (search) {
            where.OR = [
                { actorName: { contains: search as string, mode: 'insensitive' } },
                { action: { contains: search as string, mode: 'insensitive' } },
                { resource: { contains: search as string, mode: 'insensitive' } },
            ];
        }
        if (category && category !== 'all') {
            where.actorType = category;
        }

        const [logs, total] = await Promise.all([
            prisma.platformAuditLog.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
            }),
            prisma.platformAuditLog.count({ where }),
        ]);

        res.json({
            success: true,
            data: { logs, total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
        });
    } catch (err) { next(err); }
});

// ─── GET /api/super-admin/settings ──────────────────────────
router.get('/settings', async (_req, res, next) => {
    try {
        const settings = await prisma.platformSetting.findMany();
        const settingsMap = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
        res.json({ success: true, data: settingsMap });
    } catch (err) { next(err); }
});

// ─── PATCH /api/super-admin/settings ────────────────────────
router.patch('/settings', async (req, res, next) => {
    try {
        const updates = req.body; 
        
        await prisma.$transaction(
            Object.entries(updates).map(([key, value]) => 
                prisma.platformSetting.upsert({
                    where: { key },
                    update: { value: value as any },
                    create: { key, value: value as any },
                })
            )
        );

        res.json({ success: true, message: 'Settings updated' });
    } catch (err) { next(err); }
});

// ─── MockBook Stats (Super Admin) ───────────────────────────
router.get('/mockbook/stats', async (_req, res, next) => {
    try {
        const [totalTests, totalAttempts, totalQuestions] = await Promise.all([
            prisma.mockTest.count(),
            prisma.testAttempt.count(),
            prisma.question.count()
        ]);
        res.json({ success: true, data: { totalTests, totalAttempts, totalQuestions } });
    } catch (err) { next(err); }
});

// ─── MockBook Folders (Super Admin) ──────────────────────────
router.get('/mockbook/:orgId/folders', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirst({ where: { orgId: req.params.orgId } });
        if (!org) throw new AppError('Organization not found', 404);

        const folders = await prisma.examFolder.findMany({
            where: { orgId: org.id },
            include: { categories: { include: { subCategories: true } } },
            orderBy: { sortOrder: 'asc' }
        });

        res.json({ success: true, data: folders });
    } catch (err) { next(err); }
});

// ─── Whiteboard Settings (Super Admin) ──────────────────────
router.get('/organizations/:orgId/whiteboard-settings', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirst({ where: { orgId: req.params.orgId } });
        if (!org) throw new AppError('Organization not found', 404);

        let settings = await prisma.whiteboardSettings.findUnique({ where: { orgId: org.id } });
        if (!settings) {
            settings = await prisma.whiteboardSettings.create({ data: { orgId: org.id } });
        }
        res.json({ success: true, data: settings });
    } catch (err) { next(err); }
});

router.patch('/organizations/:orgId/whiteboard-settings', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirst({ where: { orgId: req.params.orgId } });
        if (!org) throw new AppError('Organization not found', 404);

        const schema = z.object({
            aiAssistant: z.boolean().optional(),
            periodicTable: z.boolean().optional(),
            shapeBuilder3D: z.boolean().optional(),
            attendance: z.boolean().optional(),
            homeworkGenerator: z.boolean().optional(),
            splitScreen: z.boolean().optional(),
            mathTools: z.boolean().optional(),
            chemistryTools: z.boolean().optional(),
            physicsSimulations: z.boolean().optional(),
            allowedGrades: z.array(z.number()).optional(),
            globalAiTokenLimit: z.number().int().optional(),
        });
        const body = schema.parse(req.body);

        const settings = await prisma.whiteboardSettings.upsert({
            where: { orgId: org.id },
            update: body,
            create: { orgId: org.id, ...body },
        });

        res.json({ success: true, data: settings, message: 'Whiteboard settings updated' });
    } catch (err) { next(err); }
});

// ─── Personalization Settings (Super Admin) ───────────────────
router.patch('/organizations/:orgId/personalization', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirst({ where: { orgId: req.params.orgId } });
        if (!org) throw new AppError('Organization not found', 404);

        const schema = z.object({
            isEnabled: z.boolean().optional(),
            unlockThreshold: z.number().int().optional(),
            aiMatchEnabled: z.boolean().optional(),
            collabFilterEnabled: z.boolean().optional(),
            studyPlanEnabled: z.boolean().optional(),
        });
        const body = schema.parse(req.body);

        const settings = await prisma.orgPersonalizationSettings.upsert({
            where: { orgId: org.id },
            update: body,
            create: { orgId: org.id, ...body },
        });

        res.json({ success: true, data: settings, message: 'Personalization settings updated' });
    } catch (err) { next(err); }
});

// ─── MockBook Test Series (Super Admin) ─────────────────────
router.get('/mockbook/test-series', async (req, res, next) => {
    try {
        const { search, categoryId } = req.query;
        const where: any = {};
        if (search) where.name = { contains: search as string, mode: 'insensitive' };
        if (categoryId) where.categoryId = categoryId as string;

        const series = await prisma.examSubCategory.findMany({
            where,
            include: {
                category: { select: { name: true } },
                org: { select: { name: true } },
                _count: { select: { mockTests: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: series });
    } catch (err) { next(err); }
});

router.post('/mockbook/test-series', async (req, res, next) => {
    try {
        const schema = z.object({
            orgId: z.string(),
            categoryId: z.string(),
            name: z.string().min(2),
            description: z.string().optional(),
            price: z.number().optional(),
            isFree: z.boolean().optional(),
            status: z.enum(['active', 'draft']).optional()
        });
        const body = schema.parse(req.body);
        const folder = await prisma.examFolder.findFirst({ where: { orgId: body.orgId }});
        if (!folder) throw new AppError("Organization must have an exam folder first", 400);

        const series = await prisma.examSubCategory.create({
            data: {
                orgId: body.orgId,
                categoryId: body.categoryId,
                name: body.name,
                description: body.description || '',
                isActive: body.status === 'active',
            }
        });
        res.json({ success: true, data: series });
    } catch (err) { next(err); }
});

router.put('/mockbook/test-series/:id', async (req, res, next) => {
    try {
        const body = req.body;
        const series = await prisma.examSubCategory.update({
            where: { id: req.params.id },
            data: {
                name: body.name,
                description: body.description,
                categoryId: body.categoryId,
                isActive: body.status === 'active',
            }
        });
        res.json({ success: true, data: series });
    } catch (err) { next(err); }
});

router.delete('/mockbook/test-series/:id', async (req, res, next) => {
    try {
        await prisma.examSubCategory.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: "Deleted" });
    } catch (err) { next(err); }
});

// ─── MockBook Tests (Super Admin) ─────────────────────────
router.get('/mockbook/tests', async (req, res, next) => {
    try {
        const { search, status, orgId } = req.query;
        const where: any = {};
        if (search) where.name = { contains: search as string, mode: 'insensitive' };
        if (status) where.status = status as string;
        if (orgId) where.orgId = orgId as string;

        const tests = await prisma.mockTest.findMany({
            where,
            include: {
                org: { select: { name: true } },
                subCategory: { select: { name: true } },
                _count: { select: { attempts: true, sections: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: tests });
    } catch (err) { next(err); }
});

router.post('/mockbook/tests', async (req, res, next) => {
    try {
        const schema = z.object({
            orgId: z.string(),
            subCategoryId: z.string().optional(),
            name: z.string().min(2),
            description: z.string().optional(),
            durationMins: z.number().min(1),
            totalMarks: z.number().min(0),
            status: z.enum(['DRAFT', 'SCHEDULED', 'LIVE', 'ENDED']).optional(),
        });
        const body = schema.parse(req.body);

        // Auto-generate testId
        const testId = String(Math.floor(100000 + Math.random() * 900000));
        const pin = String(Math.floor(100000 + Math.random() * 900000));

        const test = await prisma.mockTest.create({
            data: {
                testId,
                pin,
                orgId: body.orgId,
                subCategoryId: body.subCategoryId || null,
                name: body.name,
                description: body.description || '',
                durationMins: body.durationMins,
                totalMarks: body.totalMarks,
                status: body.status || 'DRAFT',
            }
        });
        res.status(201).json({ success: true, data: test });
    } catch (err) { next(err); }
});

router.put('/mockbook/tests/:id', async (req, res, next) => {
    try {
        const body = req.body;
        const test = await prisma.mockTest.update({
            where: { id: req.params.id },
            data: {
                name: body.name,
                description: body.description,
                subCategoryId: body.subCategoryId || null,
                durationMins: body.durationMins,
                totalMarks: body.totalMarks,
                status: body.status,
            }
        });
        res.json({ success: true, data: test });
    } catch (err) { next(err); }
});

router.delete('/mockbook/tests/:id', async (req, res, next) => {
    try {
        await prisma.mockTest.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: "Deleted" });
    } catch (err) { next(err); }
});

export default router;
