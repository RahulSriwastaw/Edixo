import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';

const router = Router();
router.use(authenticate);

// ─── GET /api/tests ──────────────────────────────────────────
router.get('/', async (req, res, next) => {
    try {
        const { page = 1, limit = 20, status, orgId: queryOrgId } = req.query;
        const orgId = queryOrgId || req.user?.orgId;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {};
        if (orgId) where.orgId = String(orgId);
        if (status) where.status = status;

        const [tests, total] = await Promise.all([
            prisma.mockTest.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: { select: { attempts: true, sections: true } },
                    batches: true,
                },
            }),
            prisma.mockTest.count({ where }),
        ]);

        res.json({ success: true, data: { tests, total } });
    } catch (err) { next(err); }
});

// ─── POST /api/tests ─────────────────────────────────────────
router.post('/', async (req, res, next) => {
    try {
        const schema = z.object({
            name: z.string().min(1),
            description: z.string().optional(),
            durationMins: z.number().min(1),
            shuffleQuestions: z.boolean().default(false),
            showResult: z.boolean().default(true),
            maxAttempts: z.number().default(1),
            isPublic: z.boolean().default(false),
            scheduledAt: z.string().optional(),
            endsAt: z.string().optional(),
            sectionIds: z.array(z.string()).default([]),
            batchIds: z.array(z.string()).default([]),
            orgId: z.string().min(1)
        });

        const body = schema.parse(req.body);
        const orgId = body.orgId;

        // Generate 6-digit Test ID + PIN
        const testId = String(Math.floor(100000 + Math.random() * 900000));
        const pin = String(Math.floor(100000 + Math.random() * 900000));

        const test = await prisma.mockTest.create({
            data: {
                testId,
                pin,
                orgId,
                name: body.name,
                description: body.description,
                durationMins: body.durationMins,
                shuffleQuestions: body.shuffleQuestions,
                showResult: body.showResult,
                maxAttempts: body.maxAttempts,
                isPublic: body.isPublic,
                scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
                endsAt: body.endsAt ? new Date(body.endsAt) : undefined,
                sections: {
                    create: body.sectionIds.map((setId, idx) => ({
                        setId,
                        name: `Section ${idx + 1}`,
                        sortOrder: idx,
                    })),
                },
                batches: {
                    create: body.batchIds.map(batchId => ({ batchId })),
                },
            },
            include: { sections: true, batches: true },
        });

        res.status(201).json({ success: true, data: test });
    } catch (err) { next(err); }
});

// ─── PATCH /api/tests/:id/status ─────────────────────────────
router.patch('/:id/status', async (req, res, next) => {
    try {
        const { status } = z.object({
            status: z.enum(['DRAFT', 'SCHEDULED', 'LIVE', 'ENDED']),
        }).parse(req.body);

        const test = await prisma.mockTest.update({
            where: { id: req.params.id },
            data: { status },
        });
        res.json({ success: true, data: test });
    } catch (err) { next(err); }
});

// ─── POST /api/tests/:id/attempt — Student starts test ───────
router.post('/:id/attempt', async (req, res, next) => {
    try {
        if (req.user?.role !== 'STUDENT') throw new AppError('Student access required', 403);

        const test = await prisma.mockTest.findUniqueOrThrow({ where: { id: req.params.id } });
        if (test.status !== 'LIVE') throw new AppError('Test is not live', 400);

        const student = await prisma.student.findFirstOrThrow({
            where: { studentId: (req.user as any).studentId },
        });

        // Check max attempts (Disabled for unlimited attempts feature)
        /*
        const maxAllowed = test.maxAttempts || 0;
        if (maxAllowed > 0) {
            const existingAttempts = await prisma.testAttempt.count({
                where: { testId: test.id, studentId: student.id, status: 'SUBMITTED' },
            });
            if (existingAttempts >= maxAllowed) {
                throw new AppError(`Maximum attempts (${maxAllowed}) reached`, 400);
            }
        }
        */

        const attempt = await prisma.testAttempt.create({
            data: { testId: test.id, studentId: student.id },
        });

        res.status(201).json({ success: true, data: attempt });
    } catch (err) { next(err); }
});

// ─── GET /api/tests/:id/results ──────────────────────────────
router.get('/:id/results', async (req, res, next) => {
    try {
        const results = await prisma.testAttempt.findMany({
            where: { testId: req.params.id, status: 'SUBMITTED' },
            include: {
                student: { select: { studentId: true, name: true } },
            },
            orderBy: { score: 'desc' },
        });
        res.json({ success: true, data: results });
    } catch (err) { next(err); }
});

export default router;
