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
    
    const safeSetId = setId.replace(/'/g, "''");
    const setRows = await prisma.$queryRawUnsafe<Array<{ pin: string; id: string }>>(`
        SELECT pin, id FROM question_sets WHERE set_id = '${safeSetId}' OR id = '${safeSetId}' LIMIT 1
    `);
    
    if (setRows.length === 0) {
      return res.json({ success: true, valid: false, reason: 'Set not found' });
    }
    
    if (setRows[0].pin !== password) {
      return res.json({ success: true, valid: false, reason: 'Invalid password' });
    }

    // Check that set actually has linked questions
    const setPrimaryId = setRows[0].id;
    const countRows = await prisma.$queryRawUnsafe<Array<{ cnt: number | string }>>(`
        SELECT COUNT(*) AS cnt FROM question_set_items WHERE set_id = '${setPrimaryId.replace(/'/g, "''")}'
    `);
    const questionCount = Number(countRows[0]?.cnt ?? 0);
    
    if (questionCount === 0) {
      return res.json({ 
        success: true, 
        valid: false, 
        reason: 'This set has no questions. Please add questions from the Super Admin panel → Question Bank → Sets → Edit this set.' 
      });
    }

    res.json({ success: true, valid: true });
  } catch (err) {
    next(err);
  }
});

router.get('/sets/:setId/metadata', async (req, res, next) => {
  try {
    const { setId } = req.params;
    const safeSetId = setId.replace(/'/g, "''");

    // Query the raw SQL question_sets table (used by both compat sets and AdvancedSetBuilder-created sets)
    const setRows = await prisma.$queryRawUnsafe<Array<any>>(`
        SELECT id, name, subject, total_questions,
               (SELECT COUNT(*) FROM question_set_items WHERE set_id = question_sets.id) AS actual_count
        FROM question_sets WHERE set_id = '${safeSetId}' OR id = '${safeSetId}' LIMIT 1
    `);
    
    if (setRows.length === 0) throw new AppError('Set not found', 404);
    const set = setRows[0];

    res.json({
      success: true,
      data: {
        id: setId,
        title: set.name || `Set ${setId}`,
        subject: set.subject || 'General',
        questionCount: Number(set.actual_count || set.total_questions || 0),
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

router.get('/sets/:setId/questions', async (req, res, next) => {
  try {
    const { setId } = req.params;

    // Raw SQL compat tables (used by both compat sets and AdvancedSetBuilder-created sets)
    const safeSetId = setId.replace(/'/g, "''");
    const setRows = await prisma.$queryRawUnsafe<Array<{ id: string }>>(`
        SELECT id FROM question_sets WHERE set_id = '${safeSetId}' OR id = '${safeSetId}' LIMIT 1
    `);
    
    if (setRows.length === 0) throw new AppError('Question set not found', 404);
    const setPrimaryId = setRows[0].id;

    // Get questions from compat tables
    const questions = await prisma.$queryRawUnsafe<Array<any>>(`
        SELECT q.id, q.question_id, q.text_en, q.text_hi, q.type, q.difficulty, q.subject_name, q.chapter_name, q.exam, q.collection, q.year, q.airtable_table_name, q.question_no, q.explanation_en, q.explanation_hi, q.point_cost, q.usage_count, q.is_approved, q.is_global
        FROM questions q
        JOIN question_set_items qsi ON q.id = qsi.question_id
        WHERE qsi.set_id = '${setPrimaryId}'
        ORDER BY qsi.sort_order ASC
    `);

    const questionIds = questions.map((q) => q.id);
    let optionsByQuestion: Record<string, any[]> = {};
    
    if (questionIds.length > 0) {
        const idsList = questionIds.map(id => `'${id.replace(/'/g, "''")}'`).join(',');
        const options = await prisma.$queryRawUnsafe<Array<any>>(`
            SELECT id, question_id, text_en, text_hi, is_correct, sort_order
            FROM question_options
            WHERE question_id IN (${idsList})
            ORDER BY sort_order ASC
        `);
        
        optionsByQuestion = options.reduce((acc, opt) => {
            acc[opt.question_id] = acc[opt.question_id] || [];
            acc[opt.question_id].push(opt);
            return acc;
        }, {});
    }

    const formattedQuestions = questions.map((q, idx) => {
        const opts = optionsByQuestion[q.id] || [];
        const answerLabelIndex = opts.findIndex(o => o.is_correct);
        const correctAnswerLabel = answerLabelIndex >= 0 ? String.fromCharCode(65 + answerLabelIndex) : null;

        return {
            id: q.id,
            questionNumber: idx + 1,
            questionText: q.text_en || q.text_hi || '',
            questionImage: null,
            options: opts.map((o, index) => ({
                label: String.fromCharCode(65 + index),
                text: o.text_en || o.text_hi || '',
                imageUrl: null
            })),
            correctAnswer: correctAnswerLabel,
            examSource: q.exam || 'Practice',
            subject: q.subject_name || 'General',
        };
    });

    res.json({ success: true, data: { questions: formattedQuestions } });
  } catch (err) {
    next(err);
  }
});

export default router;
