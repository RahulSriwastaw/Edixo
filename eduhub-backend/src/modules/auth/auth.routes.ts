import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { prisma } from '../../config/database';
import { env } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import { authenticate } from '../../middleware/auth';

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

function generateToken(payload: object, secret: string, expiresIn: string) {
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}

router.post('/super-admin/login', async (req, res, next) => {
  try {
    const body = z.object({
      username: z.string().min(3),
      password: z.string().min(1),
    }).parse(req.body);

    const expectedUsername = env.SUPER_ADMIN_USERNAME || 'admin';
    const expectedPassword = env.SUPER_ADMIN_PASSWORD || 'admin123';

    if (body.username !== expectedUsername || body.password !== expectedPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    const tokenPayload = {
      userId: 'super-admin',
      username: expectedUsername,
      role: 'SUPER_ADMIN',
    };

    const accessToken = generateToken(tokenPayload, env.JWT_SUPER_ADMIN_SECRET, env.JWT_EXPIRES_IN);
    const refreshToken = generateToken({ ...tokenPayload, type: 'refresh' }, env.JWT_SUPER_ADMIN_SECRET, env.JWT_REFRESH_EXPIRES_IN);

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: tokenPayload,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/whiteboard/login', async (req, res, next) => {
  try {
    const schema = z.object({
      username: z.string().min(3).optional(),
      loginId: z.string().min(3).optional(),
      password: z.string().min(6),
    });
    const { username, loginId, password } = schema.parse(req.body);
    const resolvedLoginId = (username ?? loginId ?? '').trim();
    if (!resolvedLoginId) throw new AppError('Username is required', 400);

    let account: any;
    try {
      account = await prismaAny.whiteboardAccount.findUnique({
        where: { loginId: resolvedLoginId },
        select: {
          id: true,
          loginId: true,
          password: true,
          name: true,
          isActive: true,
          maxConcurrentLogins: true,
        },
      });
    } catch (err) {
      if (!isMissingMaxLoginsColumnError(err)) throw err;
      account = await prismaAny.whiteboardAccount.findUnique({
        where: { loginId: resolvedLoginId },
        select: {
          id: true,
          loginId: true,
          password: true,
          name: true,
          isActive: true,
        },
      });
    }

    if (!account || !account.isActive) {
      throw new AppError('Invalid credentials or account disabled', 401);
    }

    const valid = await bcrypt.compare(password, account.password);
    if (!valid) throw new AppError('Invalid credentials', 401);

    const now = new Date();
    const useSessions = hasLoginSessionModel();

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
      } catch (err) {
        if (!isMissingSessionTableError(err)) throw err;
      }
    }

    const maxAllowed = typeof (account as any).maxConcurrentLogins === 'number'
      ? (account as any).maxConcurrentLogins
      : 1;

    let activeLoginCount = 0;
    if (useSessions) {
      try {
        activeLoginCount = await prismaAny.whiteboardLoginSession.count({
          where: {
            accountId: account.id,
            revokedAt: null,
            expiresAt: { gt: now },
          },
        });
      } catch (err) {
        if (!isMissingSessionTableError(err)) throw err;
      }
    }

    if (useSessions && activeLoginCount >= maxAllowed) {
      throw new AppError(
        `Login limit reached. Maximum ${maxAllowed} active whiteboard login(s) allowed for this ID`,
        403,
      );
    }

    const tokenId = randomUUID();

    const tokenPayload = {
      userId: account.id,
      jti: tokenId,
      loginId: account.loginId,
      username: account.loginId,
      name: account.name ?? 'Whiteboard Teacher',
      role: 'WHITEBOARD_USER',
    };

    const accessToken = generateToken(tokenPayload, env.JWT_SECRET, env.JWT_EXPIRES_IN);
    const refreshToken = generateToken({ ...tokenPayload, type: 'refresh' }, env.JWT_SECRET, env.JWT_REFRESH_EXPIRES_IN);

    const decodedAccess = jwt.decode(accessToken) as jwt.JwtPayload | null;
    if (!decodedAccess?.exp) {
      throw new AppError('Failed to create login session', 500);
    }

    if (useSessions) {
      try {
        await prismaAny.whiteboardLoginSession.create({
          data: {
            accountId: account.id,
            tokenId,
            expiresAt: new Date(decodedAccess.exp * 1000),
          },
        });
      } catch (err) {
        if (!isMissingSessionTableError(err)) throw err;
      }
    }

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: tokenPayload,
        activeLoginCount: activeLoginCount + 1,
        maxConcurrentLogins: maxAllowed,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', authenticate, async (_req, res, next) => {
  try {
    if (_req.user?.role === 'WHITEBOARD_USER' && _req.user.jti && hasLoginSessionModel()) {
      try {
        await prismaAny.whiteboardLoginSession.updateMany({
          where: {
            tokenId: _req.user.jti,
            revokedAt: null,
          },
          data: {
            revokedAt: new Date(),
          },
        });
      } catch (err) {
        if (!isMissingSessionTableError(err)) throw err;
      }
    }

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body ?? {};
    if (!refreshToken) throw new AppError('Refresh token required', 400);

    // Decode to pick the right secret
    const decoded = jwt.decode(refreshToken) as any;
    if (!decoded) throw new AppError('Invalid refresh token', 401);

    const secret = decoded.role === 'SUPER_ADMIN'
      ? env.JWT_SUPER_ADMIN_SECRET
      : env.JWT_SECRET;

    const verified = jwt.verify(refreshToken, secret) as any;
    if (verified.type !== 'refresh') throw new AppError('Invalid token type', 401);

    // Session check for whiteboard users
    if (verified.role === 'WHITEBOARD_USER' && verified.jti && hasLoginSessionModel()) {
      try {
        const activeSession = await prismaAny.whiteboardLoginSession.findFirst({
          where: {
            tokenId: verified.jti,
            revokedAt: null,
            expiresAt: { gt: new Date() },
          },
        });
        if (!activeSession) throw new AppError('Session revoked or expired', 401);
      } catch (err) {
        if (!isMissingSessionTableError(err)) throw err;
      }
    }

    const tokenPayload = {
      userId: verified.userId,
      role: verified.role,
      username: verified.username,
      name: verified.name,
      jti: verified.jti,
    };

    const newAccessToken = generateToken(tokenPayload, secret, env.JWT_EXPIRES_IN);
    const newRefreshToken = generateToken({ ...tokenPayload, type: 'refresh' }, secret, env.JWT_REFRESH_EXPIRES_IN);

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: tokenPayload,
      },
    });
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) return next(new AppError('Refresh token expired', 401));
    if (err instanceof jwt.JsonWebTokenError) return next(new AppError('Invalid refresh token', 401));
    next(err);
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const schema = z.object({
      email: z.string().optional(),
      studentId: z.string().optional(),
      password: z.string().min(6),
      name: z.string().min(2).optional(),
      role: z.string().optional()
    });
    const { email, password, name } = schema.parse(req.body);

    const emailVal = req.body.email || req.body.studentId;
    const existingUser = await prismaAny.user.findFirst({ where: { OR: [{ email: emailVal }, { mobile: emailVal }] } });
    if (existingUser) throw new AppError('User already exists', 400);

    const passwordHash = await bcrypt.hash(req.body.password, 12);

    const user = await prismaAny.user.create({
      data: {
        email: emailVal,
        passwordHash,
        role: req.body.role || 'STUDENT',
        isActive: true,
      },
    });

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      name,
      role: user.role,
    };

    const accessToken = generateToken(tokenPayload, env.JWT_SECRET, env.JWT_EXPIRES_IN);
    const refreshToken = generateToken({ ...tokenPayload, type: 'refresh' }, env.JWT_SECRET, env.JWT_REFRESH_EXPIRES_IN);

    res.status(201).json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: tokenPayload,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const schema = z.object({
      email: z.string().optional(),
      studentId: z.string().optional(),
      password: z.string().min(1),
    });
    const parsed = schema.parse(req.body);
    const emailVal = parsed.email || parsed.studentId;

    const user = await prismaAny.user.findFirst({ where: { OR: [{ email: emailVal }, { mobile: emailVal }] } });
    if (!user || !user.isActive) {
      throw new AppError('Invalid credentials or account disabled', 401);
    }

    const valid = await bcrypt.compare(parsed.password, user.passwordHash);
    if (!valid) throw new AppError('Invalid password', 401);

    // Update last login
    await prismaAny.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateToken(tokenPayload, env.JWT_SECRET, env.JWT_EXPIRES_IN);
    const refreshToken = generateToken({ ...tokenPayload, type: 'refresh' }, env.JWT_SECRET, env.JWT_REFRESH_EXPIRES_IN);

    res.json({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: tokenPayload,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/me', authenticate, async (req, res, next) => {
  try {
    res.json({ success: true, data: req.user });
  } catch (err) {
    next(err);
  }
});

export default router;
