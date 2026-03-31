import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { env } from '../../config/env';

const router = Router();

// Allow unauthenticated access in development for quick local testing
router.use((req, res, next) => {
  if (!req.headers.authorization && env.NODE_ENV === 'development') {
    (req as any).user = { userId: 'dev-user', role: 'DEV', orgId: 'dev-org' };
    return next();
  }
  return authenticate(req, res, next);
});

// ─── Autosave: Upsert session state ───────────────────────────────────────────
router.post('/autosave', async (req, res, next) => {
  try {
    const body = z.object({
      sessionId: z.string().min(6),
      setId: z.string().optional().nullable(),
      teacherId: z.string().optional().nullable(),
      orgId: z.string().optional().nullable(),
      savedAt: z.string().optional(),
      data: z.record(z.any()),
    }).parse(req.body);

    const saved = await prisma.whiteboardSession.upsert({
      where: { sessionId: body.sessionId },
      create: {
        sessionId: body.sessionId,
        setId: body.setId ?? undefined,
        teacherId: body.teacherId ?? req.user?.userId,
        orgId: body.orgId ?? req.user?.orgId,
        data: body.data,
        savedAt: body.savedAt ? new Date(body.savedAt) : new Date(),
      },
      update: {
        setId: body.setId ?? undefined,
        teacherId: body.teacherId ?? req.user?.userId,
        orgId: body.orgId ?? req.user?.orgId,
        data: body.data,
        savedAt: body.savedAt ? new Date(body.savedAt) : new Date(),
      },
    });

    res.json({ success: true, data: { sessionId: saved.sessionId, savedAt: saved.savedAt } });
  } catch (err) {
    next(err);
  }
});

// ─── Restore session ──────────────────────────────────────────────────────────
router.get('/session/:sessionId', async (req, res, next) => {
  try {
    const session = await prisma.whiteboardSession.findUnique({
      where: { sessionId: req.params.sessionId },
    });
    if (!session) throw new AppError('Session not found', 404);
    res.json({ success: true, data: session });
  } catch (err) { next(err); }
});

// ─── PDF upload ───────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(process.cwd(), 'uploads', 'whiteboard');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
  },
});
const upload = multer({ storage });

router.post('/sets/:setId/whiteboard-pdf', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) throw new AppError('PDF file is required', 400);
    const set = await prisma.questionSet.findUnique({ where: { setId: req.params.setId } });
    if (!set) throw new AppError('Set not found', 404);

    // Placeholder: store path; in production move to S3/CloudFront
    const url = `/uploads/whiteboard/${req.file.filename}`;

    res.status(201).json({ success: true, data: { url } });
  } catch (err) { next(err); }
});

export default router;
