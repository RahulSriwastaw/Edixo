import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/database';
import { redis, redisKeys } from '../../config/redis';
import { env } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import { authenticate } from '../../middleware/auth';

const router = Router();

// ─── Schemas ─────────────────────────────────────────────────
const loginSchema = z.object({
    email: z.string().email().optional(),
    orgId: z.string().optional(),
    studentId: z.string().optional(),
    password: z.string().min(1),
    role: z.enum(['SUPER_ADMIN', 'ORG_STAFF', 'STUDENT']),
});

// ─── Helpers ─────────────────────────────────────────────────
function generateToken(payload: object, secret: string, expiresIn: string) {
    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}

async function trackFailedLogin(key: string) {
    if (!redis) return 0;
    const attempts = await redis.incr(key);
    if (attempts === 1) await redis.expire(key, 900); // 15 min window
    return attempts;
}

// ─── POST /api/auth/register ─────────────────────────────────
router.post('/register', async (req, res, next) => {
    try {
        const schema = z.object({
            email: z.string().email(),
            password: z.string().min(6),
            name: z.string().min(2),
            role: z.enum(['SUPER_ADMIN', 'ORG_STAFF', 'STUDENT']).default('ORG_STAFF'),
            orgId: z.string().optional(),
        });
        const body = schema.parse(req.body);

        const exists = await prisma.user.findUnique({ where: { email: body.email } });
        if (exists) throw new AppError('Email already registered', 400);

        const passwordHash = await bcrypt.hash(body.password, 12);

        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: body.email,
                    passwordHash,
                    role: body.role,
                },
            });

            if (body.role === 'STUDENT') {
                if (!body.orgId) throw new AppError('Organization ID is required for student registration', 400);
                
                const org = await tx.organization.findFirst({
                    where: { orgId: body.orgId },
                });
                if (!org) throw new AppError('Organization not found', 404);

                // Generate Student ID
                const globalCount = await tx.student.count();
                const timestamp = Date.now().toString().slice(-3);
                const studentId = `GK-STU-${String(globalCount + 1).padStart(5, '0')}-${timestamp}`;

                await tx.student.create({
                    data: {
                        studentId,
                        userId: user.id,
                        orgId: org.id,
                        name: body.name,
                        email: body.email,
                    },
                });

                // Increment student count
                await tx.organization.update({
                    where: { id: org.id },
                    data: { studentCount: { increment: 1 } },
                });
            }

            return user;
        });

        const tokenPayload = {
            userId: result.id,
            role: result.role,
        };

        const accessToken = generateToken(tokenPayload, env.JWT_SECRET, env.JWT_EXPIRES_IN);

        res.status(201).json({
            success: true,
            data: { accessToken, user: tokenPayload },
            message: 'Registration successful',
        });
    } catch (err) {
        next(err);
    }
});

// ─── POST /api/auth/login ────────────────────────────────────
router.post('/login', async (req, res, next) => {
    try {
        const body = loginSchema.parse(req.body);
        const attemptsKey = `login_attempts:${body.email || body.orgId || body.studentId}`;

        // Check login lock
        const attempts = redis ? parseInt(await redis.get(attemptsKey) || '0') : 0;
        if (attempts >= 5) {
            throw new AppError('Account temporarily locked (5 failed attempts). Try again in 15 minutes.', 429);
        }

        let user: any;
        let tokenPayload: object;
        let secret = env.JWT_SECRET;

        if (body.role === 'SUPER_ADMIN') {
            user = await prisma.superAdmin.findUnique({
                where: { email: body.email },
                include: { user: true },
            });
            if (!user) throw new AppError('Invalid credentials', 401);

            const valid = await bcrypt.compare(body.password, user.user.passwordHash);
            if (!valid) {
                await trackFailedLogin(attemptsKey);
                throw new AppError('Invalid credentials', 401);
            }

            secret = env.JWT_SUPER_ADMIN_SECRET;
            tokenPayload = {
                userId: user.userId, role: 'SUPER_ADMIN', type: 'super_admin'
            };
        } else if (body.role === 'ORG_STAFF') {
            const org = await prisma.organization.findFirst({
                where: { orgId: body.orgId },
            });
            if (!org) throw new AppError('Organization not found', 404);

            // Find staff by email
            const staff = await prisma.orgStaff.findFirst({
                where: { orgId: org.id, user: { email: body.email } },
                include: { user: true },
            });
            if (!staff) throw new AppError('Invalid credentials', 401);

            const valid = await bcrypt.compare(body.password, staff.user.passwordHash);
            if (!valid) {
                await trackFailedLogin(attemptsKey);
                throw new AppError('Invalid credentials', 401);
            }

            tokenPayload = {
                userId: staff.userId,
                staffId: staff.staffId,
                orgId: org.orgId,
                orgDbId: org.id,
                role: 'ORG_STAFF',
                staffRole: staff.role,
                permissions: staff.permissions,
            };
        } else {
            // STUDENT login with Student ID
            const student = await prisma.student.findFirst({
                where: {
                    studentId: body.studentId,
                    org: { orgId: body.orgId },
                },
                include: { user: true, org: true },
            });
            if (!student) throw new AppError('Invalid credentials', 401);

            const valid = await bcrypt.compare(body.password, student.user.passwordHash);
            if (!valid) {
                await trackFailedLogin(attemptsKey);
                throw new AppError('Invalid credentials', 401);
            }

            tokenPayload = {
                userId: student.userId,
                studentId: student.studentId,
                orgId: student.org.orgId,
                orgDbId: student.orgId,
                role: 'STUDENT',
            };
        }

        // Clear failed attempts on success
        if (redis) await redis.del(attemptsKey);

        // Update last login
        await prisma.user.update({
            where: { id: (tokenPayload as any).userId },
            data: { lastLoginAt: new Date() },
        });

        const accessToken = generateToken(tokenPayload, secret, env.JWT_EXPIRES_IN);
        const refreshToken = generateToken(
            { ...tokenPayload, type: 'refresh' },
            secret,
            env.JWT_REFRESH_EXPIRES_IN
        );

        res.json({
            success: true,
            data: { accessToken, refreshToken, user: tokenPayload },
        });
    } catch (err) {
        next(err);
    }
});

// ─── POST /api/auth/logout ───────────────────────────────────
router.post('/logout', authenticate, async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]!;
        const exp = req.user?.exp || 0;
        const ttl = exp - Math.floor(Date.now() / 1000);
        if (ttl > 0 && redis) {
            await redis.setex(redisKeys.tokenBlacklist(token), ttl, '1');
        }
        res.json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
        next(err);
    }
});

// ─── GET /api/auth/me ────────────────────────────────────────
router.get('/me', authenticate, async (req, res, next) => {
    try {
        res.json({ success: true, data: req.user });
    } catch (err) {
        next(err);
    }
});

// ─── POST /api/auth/change-password ─────────────────────────
router.post('/change-password', authenticate, async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = z.object({
            currentPassword: z.string().min(1),
            newPassword: z.string().min(8, 'Must be at least 8 characters'),
        }).parse(req.body);

        const user = await prisma.user.findUniqueOrThrow({
            where: { id: req.user!.userId },
        });

        const valid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!valid) throw new AppError('Current password is incorrect', 400);

        const hash = await bcrypt.hash(newPassword, 12);
        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: hash },
        });

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
        next(err);
    }
});

export default router;
