import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';

const router = Router();
// Fix: Do not apply requireOrgAccess globally, as it blocks STUDENT role from accessing /me
router.use(authenticate);

// DEBUG: verify router is alive
router.get('/ping', (_req, res) => res.json({ success: true, message: 'students router alive' }));

// ─── GET /api/students?orgId=:orgId ─────────────────────────
router.get('/', async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search, isActive } = req.query;

        const skip = (Number(page) - 1) * Number(limit);
        const where: any = {};
        if (isActive !== undefined) where.isActive = isActive === 'true';
        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { studentId: { contains: search as string, mode: 'insensitive' } },
                { mobile: { contains: search as string } },
            ];
        }

        const [students, total] = await Promise.all([
            prisma.student.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true, studentId: true, name: true, email: true, mobile: true,
                    isActive: true, createdAt: true,
                    _count: { select: { attempts: true } }
                },
            }),
            prisma.student.count({ where }),
        ]);

        res.json({ success: true, data: { students, total, page: Number(page) } });
    } catch (err) { next(err); }
});

// ─── POST /api/students ──────────────────────────────────────
router.post('/', async (req, res, next) => {
    try {
        const schema = z.object({
            name: z.string().min(2),
            email: z.string().email().optional(),
            mobile: z.string().optional(),
            parentMobile: z.string().optional(),
            password: z.string().min(6),
            dateOfBirth: z.string().optional(),
            address: z.string().optional(),
            batchIds: z.array(z.string()).default([]),
        });
        const body = schema.parse(req.body);

        // Generate Student ID: GK-STU-XXXXX (Global unique)
        const globalCount = await prisma.student.count();
        const timestamp = Date.now().toString().slice(-3);
        const studentId = `GK-STU-${String(globalCount + 1).padStart(5, '0')}-${timestamp}`;

        const passwordHash = await bcrypt.hash(body.password, 12);

        const student = await prisma.$transaction(async (tx: any) => {
            const user = await tx.user.create({
                data: {
                    email: body.email,
                    mobile: body.mobile,
                    passwordHash,
                    role: 'STUDENT',
                },
            });

            const newStudent = await tx.student.create({
                data: {
                    studentId,
                    userId: user.id,
                    name: body.name,
                    email: body.email,
                    mobile: body.mobile,
                },
            });

            return newStudent;
        });

        res.status(201).json({ success: true, data: student, message: `Student ${studentId} created` });
    } catch (err) { next(err); }
});

// ─── GET /api/students/me ─────────────────────────────────────
router.get('/me', async (req, res, next) => {
    try {
        if (!req.user) throw new AppError('Unauthorized', 401);

        let student = await prisma.student.findFirst({
            where: { userId: (req.user as any).userId },
            select: {
                id: true, studentId: true, userId: true, name: true, 
                email: true, mobile: true, isActive: true, 
                targetExamId: true,
                createdAt: true, updatedAt: true
            }
        });

        if (!student) {
            // Auto-create student profile if missing
            const user = await prisma.user.findUnique({ where: { id: (req.user as any).userId } });
            if (!user) throw new AppError('User not found', 404);

            const globalCount = await prisma.student.count();
            const timestamp = Date.now().toString().slice(-3);
            const studentId = `GK-STU-${String(globalCount + 1).padStart(5, '0')}-${timestamp}`;

            student = await prisma.student.create({
                data: {
                    studentId,
                    userId: user.id,
                    name: user.email?.split('@')[0] || 'Student',
                    email: user.email,
                    mobile: user.mobile,
                    isActive: true,
                },
                select: {
                    id: true, studentId: true, userId: true, name: true, 
                    email: true, mobile: true, isActive: true, 
                    targetExamId: true,
                    createdAt: true, updatedAt: true
                }
            });
        }

        res.json({ success: true, data: student });
    } catch (err) { next(err); }
});

// ─── PATCH /api/students/me ───────────────────────────────────
router.patch('/me', async (req, res, next) => {
    try {
        if (!req.user) throw new AppError('Unauthorized', 401);

        const schema = z.object({
            name: z.string().min(2).optional(),
            phone: z.string().optional(),
            primaryExam: z.string().optional(),
            targetYear: z.number().optional(),
        });
        const body = schema.parse(req.body);

        const student = await prisma.student.findFirst({ where: { userId: (req.user as any).userId } });
        if (!student) throw new AppError('Student profile not found', 404);

        const updated = await prisma.student.update({
            where: { id: student.id },
            data: {
                name: body.name !== undefined ? body.name : undefined,
                mobile: body.phone !== undefined ? body.phone : undefined,
                targetExamId: body.primaryExam !== undefined ? body.primaryExam : undefined,
            },
        });

        // Also update User mobile if provided
        if (body.phone) {
            await prisma.user.update({
                where: { id: (req.user as any).userId },
                data: { mobile: body.phone }
            });
        }

        res.json({ success: true, data: updated });
    } catch (err) { next(err); }
});

// ─── GET /api/students/:id ───────────────────────────────────
router.get('/:id', async (req, res, next) => {
    try {
        const student = await prisma.student.findUnique({
            where: { id: req.params.id as string },
            include: {
                attempts: { orderBy: { createdAt: 'desc' }, take: 10 }
            },
        });
        if (!student) throw new AppError('Student not found', 404);
        res.json({ success: true, data: student });
    } catch (err) { next(err); }
});

// ─── PATCH /api/students/:id ─────────────────────────────────
router.patch('/:id', async (req, res, next) => {
    try {
        const schema = z.object({
            name: z.string().min(2).optional(),
            email: z.string().email().optional(),
            mobile: z.string().optional(),
            isActive: z.boolean().optional(),
        });
        const body = schema.parse(req.body);

        const student = await prisma.student.update({
            where: { id: req.params.id as string },
            data: body,
        });

        res.json({ success: true, data: student });
    } catch (err) { next(err); }
});

export default router;
