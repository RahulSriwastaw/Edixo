import { Router } from 'express';
import { authenticate, requireSuperAdmin } from '../../middleware/auth';
import { prisma } from '../../config/database';

const router = Router();
router.use(authenticate, requireSuperAdmin);

function isMissingTableError(error: unknown): boolean {
  const message = String((error as { message?: string })?.message || '');
  return message.includes('does not exist in the current database');
}

async function safeQuery<T>(query: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await query();
  } catch (error) {
    if (isMissingTableError(error)) return fallback;
    throw error;
  }
}

router.get('/dashboard', async (_req, res, next) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalWhiteboardAccounts,
      activeWhiteboardAccounts,
      inactiveWhiteboardAccounts,
      recentWhiteboardAccounts,
      totalSessions30d,
      liveSessions,
      platformActivity,
    ] = await Promise.all([
      safeQuery(() => prisma.whiteboardAccount.count(), 0),
      safeQuery(() => prisma.whiteboardAccount.count({ where: { isActive: true } }), 0),
      safeQuery(() => prisma.whiteboardAccount.count({ where: { isActive: false } }), 0),
      safeQuery(() => prisma.whiteboardAccount.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, loginId: true, isActive: true, createdAt: true },
      }), []),
      safeQuery(() => prisma.whiteboardSession.count({ where: { createdAt: { gte: thirtyDaysAgo } } }), 0),
      safeQuery(() => prisma.whiteboardSession.count({
        where: { savedAt: { gte: new Date(Date.now() - 15 * 60 * 1000) } },
      }), 0),
      safeQuery(() => prisma.platformAuditLog.findMany({ take: 10, orderBy: { createdAt: 'desc' } }), []),
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalWhiteboardAccounts,
          activeWhiteboardAccounts,
          inactiveWhiteboardAccounts,
          totalSessions30d,
          liveSessions,
          mrr: 0,
          totalStudents: 0,
          totalStaff: 0,
          testAttemptCount: 0,
          globalQuestionCount: 0,
          activeUserCount: activeWhiteboardAccounts,
          suspendedOrgs: inactiveWhiteboardAccounts,
        },
        recentAccounts: recentWhiteboardAccounts.map((a) => ({
          ...a,
          status: a.isActive ? 'Active' : 'Inactive',
        })),
        planDistribution: [
          { name: 'Active', value: activeWhiteboardAccounts },
          { name: 'Inactive', value: inactiveWhiteboardAccounts },
        ],
        alerts: { trialExpiringSoon: [] },
        recentActivity: platformActivity,
        revenueHistory: [
          { month: 'Jan', mrr: 0 },
          { month: 'Feb', mrr: 0 },
          { month: 'Mar', mrr: 0 },
        ],
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
