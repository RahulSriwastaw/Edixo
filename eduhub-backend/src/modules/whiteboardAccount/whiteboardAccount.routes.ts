import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';
import bcrypt from 'bcryptjs';

const router = Router();

function generateCredentialSecret(length = 10): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#';
  let out = '';
  for (let i = 0; i < length; i += 1) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

// ─── CRUD for Whiteboard Accounts (Super Admin only) ─────────────

// List all whiteboard accounts
router.get('/', authenticate, async (req, res, next) => {
  try {
    if (req.user?.role !== 'SUPER_ADMIN') throw new AppError('Unauthorized access', 403);
    const accounts = await prisma.whiteboardAccount.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({
      success: true,
      data: accounts.map((a) => ({ ...a, username: a.loginId })),
    });
  } catch (err) { next(err); }
});

// Create a new whiteboard account
router.post('/', authenticate, async (req, res, next) => {
  try {
    if (req.user?.role !== 'SUPER_ADMIN') throw new AppError('Unauthorized access', 403);
    const body = z.object({
      username: z.string().min(3).optional(),
      loginId: z.string().min(3).optional(),
      password: z.string().min(6).optional(),
      name: z.string().optional(),
    }).parse(req.body);

    const loginId = (body.username ?? body.loginId ?? '').trim();
    if (!loginId) throw new AppError('Username is required', 400);

    const plainPassword = body.password?.trim() || generateCredentialSecret();

    const exists = await prisma.whiteboardAccount.findUnique({ where: { loginId } });
    if (exists) throw new AppError('Login ID already exists', 400);

    const passwordHash = await bcrypt.hash(plainPassword, 12);

    const account = await prisma.whiteboardAccount.create({
      data: {
        loginId,
        password: passwordHash,
        name: body.name,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        account: { ...account, username: account.loginId },
        credentials: {
          username: account.loginId,
          password: plainPassword,
        },
      },
    });
  } catch (err) { next(err); }
});

// Update a whiteboard account
router.patch('/:id', authenticate, async (req, res, next) => {
  try {
    if (req.user?.role !== 'SUPER_ADMIN') throw new AppError('Unauthorized access', 403);
    const body = z.object({
      password: z.string().min(6).optional(),
      username: z.string().min(3).optional(),
      name: z.string().optional(),
      isActive: z.boolean().optional(),
    }).parse(req.body);

    const updateData: any = {
      name: body.name,
      isActive: body.isActive,
      loginId: body.username,
    };
    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 12);
    }

    const accountId = String(req.params.id);

    const updated = await prisma.whiteboardAccount.update({
      where: { id: accountId },
      data: updateData,
    });

    res.json({ success: true, data: { ...updated, username: updated.loginId } });
  } catch (err) { next(err); }
});

router.post('/:id/reset-password', authenticate, async (req, res, next) => {
  try {
    if (req.user?.role !== 'SUPER_ADMIN') throw new AppError('Unauthorized access', 403);
    const body = z.object({
      password: z.string().min(6).optional(),
    }).parse(req.body ?? {});

    const accountId = String(req.params.id);

    const plainPassword = body.password?.trim() || generateCredentialSecret();
    const passwordHash = await bcrypt.hash(plainPassword, 12);

    const updated = await prisma.whiteboardAccount.update({
      where: { id: accountId },
      data: { password: passwordHash },
    });

    res.json({
      success: true,
      data: {
        account: { ...updated, username: updated.loginId },
        credentials: {
          username: updated.loginId,
          password: plainPassword,
        },
      },
    });
  } catch (err) { next(err); }
});

// Delete a whiteboard account
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    if (req.user?.role !== 'SUPER_ADMIN') throw new AppError('Unauthorized access', 403);
    const accountId = String(req.params.id);
    await prisma.whiteboardAccount.delete({ where: { id: accountId } });
    res.json({ success: true, message: 'Account deleted' });
  } catch (err) { next(err); }
});

export default router;
