import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';
import bcrypt from 'bcryptjs';

const router = Router();
const prismaAny = prisma as any;

function hasLoginSessionModel(): boolean {
  return typeof prismaAny.whiteboardLoginSession?.count === 'function';
}

function isMissingSessionTableError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err ?? '');
  const code = (err as any)?.code;
  return code === 'P2021' || message.includes('whiteboard_login_sessions') || message.includes('does not exist');
}

function isMissingMaxLoginsColumnError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err ?? '');
  const code = (err as any)?.code;
  return code === 'P2022' || message.includes('maxConcurrentLogins') || message.includes('max_concurrent_logins');
}

async function findWhiteboardAccountsWithFallback(now: Date, includeSessions: boolean): Promise<any[]> {
  const baseOrder = { createdAt: 'desc' } as const;

  if (!includeSessions) {
    try {
      return await prismaAny.whiteboardAccount.findMany({
        orderBy: baseOrder,
        select: {
          id: true,
          loginId: true,
          name: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          maxConcurrentLogins: true,
        },
      });
    } catch (err) {
      if (!isMissingMaxLoginsColumnError(err)) throw err;
      return prismaAny.whiteboardAccount.findMany({
        orderBy: baseOrder,
        select: {
          id: true,
          loginId: true,
          name: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }
  }

  try {
    return await prismaAny.whiteboardAccount.findMany({
      orderBy: baseOrder,
      select: {
        id: true,
        loginId: true,
        name: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        maxConcurrentLogins: true,
        loginSessions: {
          where: {
            revokedAt: null,
            expiresAt: { gt: now },
          },
          select: { id: true },
        },
      },
    });
  } catch (err) {
    if (!isMissingMaxLoginsColumnError(err)) throw err;
    return prismaAny.whiteboardAccount.findMany({
      orderBy: baseOrder,
      select: {
        id: true,
        loginId: true,
        name: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        loginSessions: {
          where: {
            revokedAt: null,
            expiresAt: { gt: now },
          },
          select: { id: true },
        },
      },
    });
  }
}

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

    const now = new Date();
    const useSessions = hasLoginSessionModel();

    let accounts: any[] = [];
    if (useSessions) {
      try {
        await prismaAny.whiteboardLoginSession.deleteMany({
          where: {
            OR: [
              { expiresAt: { lte: now } },
              { revokedAt: { not: null } },
            ],
          },
        });

        accounts = await findWhiteboardAccountsWithFallback(now, true);
      } catch (err) {
        if (!isMissingSessionTableError(err)) throw err;
        accounts = await findWhiteboardAccountsWithFallback(now, false);
      }
    } else {
      accounts = await findWhiteboardAccountsWithFallback(now, false);
    }

    res.json({
      success: true,
      data: accounts.map((a: any) => ({
        ...a,
        username: a.loginId,
        maxConcurrentLogins: a.maxConcurrentLogins ?? 1,
        activeLoginCount: Array.isArray((a as any).loginSessions) ? (a as any).loginSessions.length : 0,
      })),
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
      maxConcurrentLogins: z.number().int().min(1).max(10).optional(),
    }).parse(req.body);

    const loginId = (body.username ?? body.loginId ?? '').trim();
    if (!loginId) throw new AppError('Username is required', 400);

    const plainPassword = body.password?.trim() || generateCredentialSecret();

    const exists = await prisma.whiteboardAccount.findUnique({ where: { loginId } });
    if (exists) throw new AppError('Login ID already exists', 400);

    const passwordHash = await bcrypt.hash(plainPassword, 12);

    let account: any;
    try {
      account = await prismaAny.whiteboardAccount.create({
        data: {
          loginId,
          password: passwordHash,
          name: body.name,
          maxConcurrentLogins: body.maxConcurrentLogins ?? 1,
        },
      });
    } catch (err) {
      if (!isMissingMaxLoginsColumnError(err)) throw err;
      account = await prismaAny.whiteboardAccount.create({
        data: {
          loginId,
          password: passwordHash,
          name: body.name,
        },
        select: {
          id: true,
          loginId: true,
          name: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    res.status(201).json({
      success: true,
      data: {
        account: { ...account, username: account.loginId, maxConcurrentLogins: account.maxConcurrentLogins ?? 1 },
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
      maxConcurrentLogins: z.number().int().min(1).max(10).optional(),
    }).parse(req.body);

    const updateData: any = {
      name: body.name,
      isActive: body.isActive,
      loginId: body.username,
      maxConcurrentLogins: body.maxConcurrentLogins,
    };
    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 12);
    }

    const accountId = String(req.params.id);

    let updated: any;
    try {
      updated = await prismaAny.whiteboardAccount.update({
        where: { id: accountId },
        data: updateData,
      });
    } catch (err) {
      if (!isMissingMaxLoginsColumnError(err)) throw err;
      const { maxConcurrentLogins, ...updateDataWithoutLimit } = updateData;
      updated = await prismaAny.whiteboardAccount.update({
        where: { id: accountId },
        data: updateDataWithoutLimit,
        select: {
          id: true,
          loginId: true,
          name: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    }

    if (body.maxConcurrentLogins !== undefined && hasLoginSessionModel()) {
      const now = new Date();
      try {
        const activeSessions = await prismaAny.whiteboardLoginSession.findMany({
          where: {
            accountId,
            revokedAt: null,
            expiresAt: { gt: now },
          },
          orderBy: { createdAt: 'desc' },
        });

        const overflow = activeSessions.slice(body.maxConcurrentLogins);
        if (overflow.length > 0) {
          await prismaAny.whiteboardLoginSession.updateMany({
            where: { id: { in: overflow.map((s: any) => s.id) } },
            data: { revokedAt: now },
          });
        }
      } catch (err) {
        if (!isMissingSessionTableError(err)) throw err;
      }
    }

    let activeLoginCount = 0;
    if (hasLoginSessionModel()) {
      try {
        activeLoginCount = await prismaAny.whiteboardLoginSession.count({
          where: {
            accountId,
            revokedAt: null,
            expiresAt: { gt: new Date() },
          },
        });
      } catch (err) {
        if (!isMissingSessionTableError(err)) throw err;
      }
    }

    res.json({
      success: true,
      data: {
        ...updated,
        username: updated.loginId,
        maxConcurrentLogins: updated.maxConcurrentLogins ?? body.maxConcurrentLogins ?? 1,
        activeLoginCount,
      },
    });
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

    const safeSelect = {
      id: true, loginId: true, name: true,
      isActive: true, createdAt: true, updatedAt: true,
    };

    let updated: any;
    try {
      updated = await prismaAny.whiteboardAccount.update({
        where: { id: accountId },
        data: { password: passwordHash },
        select: { ...safeSelect, maxConcurrentLogins: true },
      });
    } catch (err) {
      if (!isMissingMaxLoginsColumnError(err)) throw err;
      updated = await prismaAny.whiteboardAccount.update({
        where: { id: accountId },
        data: { password: passwordHash },
        select: safeSelect,
      });
    }

    res.json({
      success: true,
      data: {
        account: { ...updated, username: updated.loginId, maxConcurrentLogins: updated.maxConcurrentLogins ?? 1 },
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
