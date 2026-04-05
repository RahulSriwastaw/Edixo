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

router.use((req, res, next) => {
  if (!req.headers.authorization && env.NODE_ENV === 'development') {
    (req as any).user = { userId: 'dev-user', role: 'DEV' };
    return next();
  }
  return authenticate(req, res, next);
});

router.post('/autosave', async (req, res, next) => {
  try {
    const body = z.object({
      sessionId: z.string().min(6),
      setId: z.string().optional().nullable(),
      teacherId: z.string().optional().nullable(),
      savedAt: z.string().optional(),
      data: z.record(z.any()),
    }).parse(req.body);

    const saved = await prisma.whiteboardSession.upsert({
      where: { sessionId: body.sessionId },
      create: {
        sessionId: body.sessionId,
        setId: body.setId ?? undefined,
        teacherId: body.teacherId ?? req.user?.userId,
        data: body.data,
        savedAt: body.savedAt ? new Date(body.savedAt) : new Date(),
      },
      update: {
        setId: body.setId ?? undefined,
        teacherId: body.teacherId ?? req.user?.userId,
        data: body.data,
        savedAt: body.savedAt ? new Date(body.savedAt) : new Date(),
      },
    });

    res.json({ success: true, data: { sessionId: saved.sessionId, savedAt: saved.savedAt } });
  } catch (err) {
    next(err);
  }
});

router.get('/session/:sessionId', async (req, res, next) => {
  try {
    const session = await prisma.whiteboardSession.findUnique({ where: { sessionId: req.params.sessionId } });
    if (!session) throw new AppError('Session not found', 404);
    res.json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
});

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
    const url = `/uploads/whiteboard/${req.file.filename}`;
    res.status(201).json({ success: true, data: { url } });
  } catch (err) {
    next(err);
  }
});

router.post('/validate-set', async (req, res, next) => {
  try {
    const { setId, password } = req.body ?? {};
    if (!setId || !password) throw new AppError('Set ID and password are required', 400);
    res.json({ success: true, valid: true });
  } catch (err) {
    next(err);
  }
});

router.get('/sets/:setId/metadata', async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        id: req.params.setId,
        title: `Set ${req.params.setId}`,
        subject: 'General',
        questionCount: 2,
      },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/session/start', async (req, res, next) => {
  try {
    const body = z.object({
      setId: z.string().min(1),
      teacherId: z.string().optional().nullable(),
    }).parse(req.body ?? {});

    const sessionId = `wb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    await prisma.whiteboardSession.create({
      data: {
        sessionId,
        setId: body.setId,
        teacherId: body.teacherId ?? req.user?.userId,
        data: {
          version: 1,
          slides: [],
          elements: [],
        },
        savedAt: new Date(),
      },
    });

    res.status(201).json({ success: true, data: { sessionId } });
  } catch (err) {
    next(err);
  }
});

router.get('/sets/:setId/questions', async (_req, res, next) => {
  try {
    const questions = [
      {
        id: 'mock-1',
        questionNumber: 1,
        questionText: 'What is the sum of 12 + 15?',
        questionImage: null,
        options: [
          { label: 'A', text: '25', imageUrl: null },
          { label: 'B', text: '27', imageUrl: null },
          { label: 'C', text: '30', imageUrl: null },
        ],
        correctAnswer: 'B',
        examSource: 'Practice',
        subject: 'Mathematics',
      },
      {
        id: 'mock-2',
        questionNumber: 2,
        questionText: 'Identify the verb in the sentence "She runs fast".',
        questionImage: null,
        options: [
          { label: 'A', text: 'Runs', imageUrl: null },
          { label: 'B', text: 'Fast', imageUrl: null },
          { label: 'C', text: 'She', imageUrl: null },
        ],
        correctAnswer: 'A',
        examSource: 'Practice',
        subject: 'English',
      },
    ];

    res.json({ success: true, data: { questions } });
  } catch (err) {
    next(err);
  }
});

export default router;
