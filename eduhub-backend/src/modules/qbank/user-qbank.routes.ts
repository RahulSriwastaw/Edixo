import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';

const router = Router();

function generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function logUsage(userId: string, questionId: string, action: string) {
    try {
        const id = generateId('ulog');
        const safeUid = userId.replace(/'/g, "''");
        const safeQid = questionId.replace(/'/g, "''");
        await prisma.$executeRawUnsafe(`
            INSERT INTO user_usage_logs (id, user_id, question_id, action)
            VALUES ('${id}', '${safeUid}', '${safeQid}', '${action.replace(/'/g, "''")}')
        `).catch(() => null);
    } catch { /* noop */ }
}

// ─── Helper: Ensure all needed tables exist ───────────────────
async function ensureTables() {
    await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS user_questions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            pack_id TEXT,
            text_en TEXT NOT NULL,
            text_hi TEXT,
            type TEXT NOT NULL DEFAULT 'MCQ_SINGLE',
            difficulty TEXT NOT NULL DEFAULT 'MEDIUM',
            subject TEXT,
            answer TEXT,
            explanation TEXT,
            explanation_hi TEXT,
            options_json JSONB,
            source TEXT NOT NULL DEFAULT 'self_created',
            visibility TEXT NOT NULL DEFAULT 'PRIVATE',
            source_pack_id TEXT,
            source_pack_name TEXT,
            original_question_id TEXT,
            overlay_changes JSONB,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `).catch(() => null);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_uq_user_id ON user_questions(user_id)`).catch(() => null);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_uq_visibility ON user_questions(visibility)`).catch(() => null);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_uq_source ON user_questions(source)`).catch(() => null);

    await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS user_question_packs (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            subject TEXT,
            is_public BOOLEAN NOT NULL DEFAULT FALSE,
            question_count INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `).catch(() => null);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_uqp_user_id ON user_question_packs(user_id)`).catch(() => null);

    await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS user_purchased_packs (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            pack_id TEXT NOT NULL,
            purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            UNIQUE(user_id, pack_id)
        )
    `).catch(() => null);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_upp_user_id ON user_purchased_packs(user_id)`).catch(() => null);

    await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS user_question_sets (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            question_count INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `).catch(() => null);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_uqs_user_id ON user_question_sets(user_id)`).catch(() => null);

    await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS user_question_set_items (
            id TEXT PRIMARY KEY,
            set_id TEXT NOT NULL,
            user_question_id TEXT NOT NULL,
            sort_order INTEGER NOT NULL DEFAULT 0
        )
    `).catch(() => null);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_uqsi_set_id ON user_question_set_items(set_id)`).catch(() => null);

    await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS user_usage_logs (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            question_id TEXT,
            action TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `).catch(() => null);
    await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS idx_ul_user_id ON user_usage_logs(user_id)`).catch(() => null);
}

// ─── PUBLIC: Browse Global Question Packs (Marketplace) ───────
router.get('/marketplace', async (req, res, next) => {
    try {
        const { page = 1, limit = 20, search, subject, sort = 'popular' } = req.query;
        const take = Math.min(Number(limit), 50);
        const skip = (Number(page) - 1) * take;

        let whereClause = `WHERE qs.is_global = TRUE`;
        const params: any[] = [];
        let paramIdx = 1;

        if (search) {
            whereClause += ` AND (qs.name ILIKE $${paramIdx} OR qs.description ILIKE $${paramIdx})`;
            params.push(`%${search}%`);
            paramIdx++;
        }
        if (subject && subject !== 'all') {
            whereClause += ` AND qs.subject = $${paramIdx}`;
            params.push(subject);
            paramIdx++;
        }

        const orderClause = sort === 'newest' ? 'ORDER BY qs.created_at DESC'
            : sort === 'name' ? 'ORDER BY qs.name ASC'
                : 'ORDER BY qs.total_questions DESC, qs.created_at DESC';

        const sets = await prisma.$queryRawUnsafe<any[]>(`
            SELECT qs.id, qs.set_id AS "setId", qs.name, qs.description,
                   qs.total_questions AS "totalQuestions", qs.subject, qs.chapter,
                   qs.is_global AS "isGlobal", qs.created_at AS "createdAt"
            FROM question_sets qs ${whereClause} ${orderClause}
            LIMIT ${take} OFFSET ${skip}
        `, ...params);

        const countRows = await prisma.$queryRawUnsafe<[{ cnt: string }]>(`
            SELECT COUNT(*)::TEXT AS cnt FROM question_sets qs ${whereClause}
        `, ...params);

        const subjects = await prisma.$queryRawUnsafe<any[]>(`
            SELECT DISTINCT subject FROM question_sets WHERE is_global = TRUE AND subject IS NOT NULL ORDER BY subject ASC
        `);

        res.json({ success: true, data: { packs: sets, total: Number(countRows[0]?.cnt ?? 0), subjects: subjects.map((s: any) => s.subject) } });
    } catch (err) { next(err); }
});

// ─── PUBLIC: Get single pack details ──────────────────────────
router.get('/marketplace/:setId', async (req, res, next) => {
    try {
        const { setId } = req.params;
        const safe = setId.replace(/'/g, "''");
        const rows = await prisma.$queryRawUnsafe<any[]>(`
            SELECT qs.id, qs.set_id AS "setId", qs.name, qs.description, qs.total_questions AS "totalQuestions", qs.subject, qs.chapter, qs.is_global AS "isGlobal", qs.created_at AS "createdAt"
            FROM question_sets qs WHERE (qs.id = '${safe}' OR qs.set_id = '${safe}') AND qs.is_global = TRUE LIMIT 1
        `);
        if (!rows.length) throw new AppError('Pack not found', 404);

        const preview = await prisma.$queryRawUnsafe<any[]>(`
            SELECT q.id, q.text_en AS "textEn", q.text_hi AS "textHi", q.type, q.difficulty, q.subject_name AS "subjectName"
            FROM question_set_items qsi JOIN questions q ON q.id = qsi.question_id
            WHERE qsi.set_id = '${rows[0].id}' ORDER BY qsi.sort_order ASC LIMIT 5
        `);
        res.json({ success: true, data: { ...rows[0], previewQuestions: preview } });
    } catch (err) { next(err); }
});

// ─── ALL BELOW REQUIRE AUTH ────────────────────────────────────
router.use(authenticate);

// ─── GET /api/user-qbank/dashboard ───────────────────────────
router.get('/dashboard', async (req, res, next) => {
    try {
        const userId = req.user!.userId;
        const safeUid = userId.replace(/'/g, "''");
        await ensureTables();

        const myQuestions = await prisma.$queryRawUnsafe<[{ cnt: string }]>(`SELECT COUNT(*)::TEXT AS cnt FROM user_questions WHERE user_id = '${safeUid}'`).catch(() => ([{ cnt: '0' }]));
        const selfCreated = await prisma.$queryRawUnsafe<[{ cnt: string }]>(`SELECT COUNT(*)::TEXT AS cnt FROM user_questions WHERE user_id = '${safeUid}' AND source = 'self_created'`).catch(() => ([{ cnt: '0' }]));
        const fromMarketplace = await prisma.$queryRawUnsafe<[{ cnt: string }]>(`SELECT COUNT(*)::TEXT AS cnt FROM user_questions WHERE user_id = '${safeUid}' AND source = 'marketplace'`).catch(() => ([{ cnt: '0' }]));
        const imported = await prisma.$queryRawUnsafe<[{ cnt: string }]>(`SELECT COUNT(*)::TEXT AS cnt FROM user_questions WHERE user_id = '${safeUid}' AND source = 'imported'`).catch(() => ([{ cnt: '0' }]));
        const publicQ = await prisma.$queryRawUnsafe<[{ cnt: string }]>(`SELECT COUNT(*)::TEXT AS cnt FROM user_questions WHERE user_id = '${safeUid}' AND visibility = 'PUBLIC'`).catch(() => ([{ cnt: '0' }]));
        const mySets = await prisma.$queryRawUnsafe<[{ cnt: string }]>(`SELECT COUNT(*)::TEXT AS cnt FROM user_question_sets WHERE user_id = '${safeUid}'`).catch(() => ([{ cnt: '0' }]));
        const purchased = await prisma.$queryRawUnsafe<[{ cnt: string }]>(`SELECT COUNT(*)::TEXT AS cnt FROM user_purchased_packs WHERE user_id = '${safeUid}'`).catch(() => ([{ cnt: '0' }]));
        const usage = await prisma.$queryRawUnsafe<[{ cnt: string }]>(`SELECT COUNT(*)::TEXT AS cnt FROM user_usage_logs WHERE user_id = '${safeUid}' AND created_at >= DATE_TRUNC('month', NOW())`).catch(() => ([{ cnt: '0' }]));

        res.json({
            success: true, data: {
                myQuestionsCount: Number(myQuestions[0]?.cnt ?? 0),
                selfCreatedCount: Number(selfCreated[0]?.cnt ?? 0),
                fromMarketplaceCount: Number(fromMarketplace[0]?.cnt ?? 0),
                importedCount: Number(imported[0]?.cnt ?? 0),
                publicQuestionsCount: Number(publicQ[0]?.cnt ?? 0),
                mySetsCount: Number(mySets[0]?.cnt ?? 0),
                purchasedPacksCount: Number(purchased[0]?.cnt ?? 0),
                usageThisMonth: Number(usage[0]?.cnt ?? 0),
            }
        });
    } catch (err) { next(err); }
});

// ─── GET /api/user-qbank/my-packs ─────────────────────────────
router.get('/my-packs', async (req, res, next) => {
    try {
        const userId = req.user!.userId;
        const { page = 1, limit = 20, search } = req.query;
        const take = Math.min(Number(limit), 50);
        const skip = (Number(page) - 1) * take;
        const safeUid = userId.replace(/'/g, "''");
        await ensureTables();

        let whereClause = `WHERE uqp.user_id = '${safeUid}'`;
        if (search) whereClause += ` AND uqp.name ILIKE '%${String(search).replace(/'/g, "''")}%'`;

        const packs = await prisma.$queryRawUnsafe<any[]>(`
            SELECT uqp.id, uqp.name, uqp.description, uqp.subject, uqp.is_public AS "isPublic",
                   uqp.question_count AS "questionCount", uqp.created_at AS "createdAt", uqp.updated_at AS "updatedAt", 'owned' AS source
            FROM user_question_packs uqp ${whereClause} ORDER BY uqp.updated_at DESC NULLS LAST LIMIT ${take} OFFSET ${skip}
        `).catch(() => [] as any[]);
        const countRows = await prisma.$queryRawUnsafe<[{ cnt: string }]>(`SELECT COUNT(*)::TEXT AS cnt FROM user_question_packs uqp ${whereClause}`).catch(() => [{ cnt: String(packs.length) }]);
        res.json({ success: true, data: { packs, total: Number(countRows[0]?.cnt ?? packs.length) } });
    } catch (err) { next(err); }
});

// ─── POST /api/user-qbank/my-packs ────────────────────────────
router.post('/my-packs', async (req, res, next) => {
    try {
        const userId = req.user!.userId;
        const body = z.object({ name: z.string().min(1), description: z.string().optional(), subject: z.string().optional(), isPublic: z.boolean().default(false) }).parse(req.body);
        await ensureTables();
        const id = generateId('upack');
        const safeUid = userId.replace(/'/g, "''");
        await prisma.$executeRawUnsafe(`INSERT INTO user_question_packs (id, user_id, name, description, subject, is_public) VALUES ('${id}', '${safeUid}', $1, $2, $3, ${body.isPublic})`, body.name, body.description ?? null, body.subject ?? null);
        res.status(201).json({ success: true, data: { id, name: body.name, description: body.description, subject: body.subject, isPublic: body.isPublic, questionCount: 0 } });
    } catch (err) { next(err); }
});

// ─── PATCH /api/user-qbank/my-packs/:id ───────────────────────
router.patch('/my-packs/:id', async (req, res, next) => {
    try {
        const userId = req.user!.userId;
        const safeUid = userId.replace(/'/g, "''");
        const safeId = req.params.id.replace(/'/g, "''");
        await ensureTables();

        const existing = await prisma.$queryRawUnsafe<any[]>(`SELECT id FROM user_question_packs WHERE id = '${safeId}' AND user_id = '${safeUid}'`).catch(() => [] as any[]);
        if (!existing.length) throw new AppError('Pack not found or not yours', 404);

        const body = z.object({ name: z.string().min(1).optional(), description: z.string().optional(), subject: z.string().optional(), isPublic: z.boolean().optional() }).parse(req.body);
        const setParts: string[] = ['updated_at = NOW()'];
        const vals: any[] = []; let idx = 1;
        if (body.name !== undefined) { setParts.push(`name = $${idx++}`); vals.push(body.name); }
        if (body.description !== undefined) { setParts.push(`description = $${idx++}`); vals.push(body.description); }
        if (body.subject !== undefined) { setParts.push(`subject = $${idx++}`); vals.push(body.subject); }
        if (body.isPublic !== undefined) { setParts.push(`is_public = ${body.isPublic}`); }
        await prisma.$executeRawUnsafe(`UPDATE user_question_packs SET ${setParts.join(', ')} WHERE id = '${safeId}'`, ...vals);
        res.json({ success: true, message: 'Pack updated' });
    } catch (err) { next(err); }
});

// ─── DELETE /api/user-qbank/my-packs/:id ──────────────────────
router.delete('/my-packs/:id', async (req, res, next) => {
    try {
        const userId = req.user!.userId;
        const safeUid = userId.replace(/'/g, "''");
        const safeId = req.params.id.replace(/'/g, "''");
        await ensureTables();

        const existing = await prisma.$queryRawUnsafe<any[]>(`SELECT id FROM user_question_packs WHERE id = '${safeId}' AND user_id = '${safeUid}'`).catch(() => [] as any[]);
        if (!existing.length) throw new AppError('Pack not found or not yours', 404);
        await prisma.$executeRawUnsafe(`DELETE FROM user_questions WHERE pack_id = '${safeId}'`).catch(() => null);
        await prisma.$executeRawUnsafe(`DELETE FROM user_question_packs WHERE id = '${safeId}'`);
        res.json({ success: true, message: 'Pack deleted' });
    } catch (err) { next(err); }
});

// ─── GET /api/user-qbank/my-questions ──────────────────────────
router.get('/my-questions', async (req, res, next) => {
    try {
        const userId = req.user!.userId;
        const safeUid = userId.replace(/'/g, "''");
        const { page = 1, limit = 20, search, source, visibility, packId } = req.query;
        const take = Math.min(Number(limit), 100);
        const skip = (Number(page) - 1) * take;
        await ensureTables();

        let whereClause = `WHERE uq.user_id = '${safeUid}'`;
        if (search) whereClause += ` AND (uq.text_en ILIKE '%${String(search).replace(/'/g, "''")}%' OR uq.text_hi ILIKE '%${String(search).replace(/'/g, "''")}%')`;
        if (source && source !== 'all') whereClause += ` AND uq.source = '${String(source).replace(/'/g, "''")}'`;
        if (visibility && visibility !== 'all') whereClause += ` AND uq.visibility = '${String(visibility).replace(/'/g, "''")}'`;
        if (packId) whereClause += ` AND uq.pack_id = '${String(packId).replace(/'/g, "''")}'`;

        const questions = await prisma.$queryRawUnsafe<any[]>(`
            SELECT uq.id, uq.text_en AS "textEn", uq.text_hi AS "textHi", uq.type, uq.difficulty, uq.subject AS "subjectName",
                   uq.options_json AS "optionsJson", uq.answer, uq.explanation AS "explanationEn", uq.explanation_hi AS "explanationHi",
                   uq.source, uq.visibility, uq.pack_id AS "packId", uq.source_pack_id AS "sourcePackId",
                   uq.source_pack_name AS "sourcePackName", uq.original_question_id AS "originalQuestionId",
                   uq.overlay_changes AS "overlayChanges", uq.created_at AS "createdAt", uq.updated_at AS "updatedAt"
            FROM user_questions uq ${whereClause} ORDER BY uq.updated_at DESC NULLS LAST LIMIT ${take} OFFSET ${skip}
        `).catch(() => [] as any[]);

        const parsed = questions.map((q: any) => ({
            ...q,
            options: typeof q.optionsJson === 'string' ? JSON.parse(q.optionsJson) : (q.optionsJson || []),
            overlayChanges: typeof q.overlayChanges === 'string' ? JSON.parse(q.overlayChanges) : (q.overlayChanges || null),
        }));

        const cntRow = await prisma.$queryRawUnsafe<[{ cnt: string }]>(`SELECT COUNT(*)::TEXT AS cnt FROM user_questions uq ${whereClause}`).catch(() => [{ cnt: '0' }]);
        res.json({ success: true, data: { questions: parsed, total: Number(cntRow[0]?.cnt ?? 0) } });
    } catch (err) { next(err); }
});

// ─── GET /api/user-qbank/my-questions/:id ───────────────────────
router.get('/my-questions/:id', async (req, res, next) => {
    try {
        const userId = req.user!.userId;
        const safeUid = userId.replace(/'/g, "''");
        const safeId = req.params.id.replace(/'/g, "''");
        await ensureTables();

        const rows = await prisma.$queryRawUnsafe<any[]>(`
            SELECT uq.id, uq.text_en AS "textEn", uq.text_hi AS "textHi", uq.type, uq.difficulty, uq.subject AS "subjectName",
                   uq.options_json AS "optionsJson", uq.answer, uq.explanation AS "explanationEn", uq.explanation_hi AS "explanationHi",
                   uq.source, uq.visibility, uq.pack_id AS "packId", uq.source_pack_id AS "sourcePackId",
                   uq.source_pack_name AS "sourcePackName", uq.original_question_id AS "originalQuestionId",
                   uq.overlay_changes AS "overlayChanges", uq.created_at AS "createdAt", uq.updated_at AS "updatedAt"
            FROM user_questions uq WHERE uq.id = '${safeId}' AND uq.user_id = '${safeUid}' LIMIT 1
        `).catch(() => [] as any[]);
        if (!rows.length) throw new AppError('Question not found', 404);

        const q = rows[0];
        res.json({
            success: true, data: {
                ...q,
                options: typeof q.optionsJson === 'string' ? JSON.parse(q.optionsJson) : (q.optionsJson || []),
                overlayChanges: typeof q.overlayChanges === 'string' ? JSON.parse(q.overlayChanges) : (q.overlayChanges || null),
            }
        });
    } catch (err) { next(err); }
});

// ─── POST /api/user-qbank/my-questions ─────────────────────────
router.post('/my-questions', async (req, res, next) => {
    try {
        const userId = req.user!.userId;
        const safeUid = userId.replace(/'/g, "''");
        await ensureTables();

        const body = z.object({
            textEn: z.string().min(1), textHi: z.string().optional(),
            type: z.string().default('MCQ_SINGLE'), difficulty: z.string().default('MEDIUM'),
            subject: z.string().optional(), answer: z.string().optional(),
            explanationEn: z.string().optional(), explanationHi: z.string().optional(),
            options: z.array(z.object({ textEn: z.string(), textHi: z.string().optional(), isCorrect: z.boolean().default(false), sortOrder: z.number().default(0) })).optional().default([]),
            visibility: z.enum(['PRIVATE', 'PUBLIC']).default('PRIVATE'),
            packId: z.string().optional().nullable(),
        }).parse(req.body);

        const qId = generateId('uq');
        const optionsJson = JSON.stringify(body.options);
        await prisma.$executeRawUnsafe(`
            INSERT INTO user_questions (id, user_id, text_en, text_hi, type, difficulty, subject, answer, explanation, explanation_hi, options_json, source, visibility, pack_id)
            VALUES ('${qId}', '${safeUid}', $1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, 'self_created', $10, $11)
        `, body.textEn, body.textHi ?? null, body.type, body.difficulty, body.subject ?? null, body.answer ?? null, body.explanationEn ?? null, body.explanationHi ?? null, optionsJson, body.visibility, body.packId ?? null);

        if (body.packId) {
            await prisma.$executeRawUnsafe(`UPDATE user_question_packs SET question_count = question_count + 1, updated_at = NOW() WHERE id = '${body.packId.replace(/'/g, "''")}'`).catch(() => null);
        }
        await logUsage(userId, qId, 'created');
        res.status(201).json({ success: true, data: { id: qId } });
    } catch (err) { next(err); }
});

// ─── PATCH /api/user-qbank/my-questions/:id ───────────────────
router.patch('/my-questions/:id', async (req, res, next) => {
    try {
        const userId = req.user!.userId;
        const safeUid = userId.replace(/'/g, "''");
        const safeId = req.params.id.replace(/'/g, "''");
        await ensureTables();

        const existing = await prisma.$queryRawUnsafe<any[]>(`SELECT id, source, overlay_changes FROM user_questions WHERE id = '${safeId}' AND user_id = '${safeUid}'`).catch(() => [] as any[]);
        if (!existing.length) throw new AppError('Question not found or not yours', 404);

        const body = z.object({
            textEn: z.string().optional(), textHi: z.string().optional(),
            type: z.string().optional(), difficulty: z.string().optional(),
            subject: z.string().optional(), answer: z.string().optional(),
            explanationEn: z.string().optional(), explanationHi: z.string().optional(),
            options: z.array(z.object({ textEn: z.string(), textHi: z.string().optional(), isCorrect: z.boolean().default(false), sortOrder: z.number().default(0) })).optional(),
            visibility: z.enum(['PRIVATE', 'PUBLIC']).optional(),
        }).parse(req.body);

        const parts: string[] = ['updated_at = NOW()'];
        const vals: any[] = []; let idx = 1;
        if (body.textEn !== undefined) { parts.push(`text_en = $${idx++}`); vals.push(body.textEn); }
        if (body.textHi !== undefined) { parts.push(`text_hi = $${idx++}`); vals.push(body.textHi); }
        if (body.type !== undefined) { parts.push(`type = $${idx++}`); vals.push(body.type); }
        if (body.difficulty !== undefined) { parts.push(`difficulty = $${idx++}`); vals.push(body.difficulty); }
        if (body.subject !== undefined) { parts.push(`subject = $${idx++}`); vals.push(body.subject); }
        if (body.answer !== undefined) { parts.push(`answer = $${idx++}`); vals.push(body.answer); }
        if (body.explanationEn !== undefined) { parts.push(`explanation = $${idx++}`); vals.push(body.explanationEn); }
        if (body.explanationHi !== undefined) { parts.push(`explanation_hi = $${idx++}`); vals.push(body.explanationHi); }
        if (body.visibility !== undefined) parts.push(`visibility = '${body.visibility}'`);

        // For marketplace questions, save edits as overlay
        if (existing[0].source === 'marketplace' && body.options !== undefined) {
            const overlayChanges = JSON.stringify(body);
            parts.push(`overlay_changes = $${idx++}::jsonb`);
            vals.push(overlayChanges);
        } else if (body.options !== undefined) {
            parts.push(`options_json = $${idx++}::jsonb`);
            vals.push(JSON.stringify(body.options));
        }

        await prisma.$executeRawUnsafe(`UPDATE user_questions SET ${parts.join(', ')} WHERE id = '${safeId}'`, ...vals);
        await logUsage(userId, safeId, 'edited');
        res.json({ success: true, message: 'Question updated' });
    } catch (err) { next(err); }
});

// ─── DELETE /api/user-qbank/my-questions/:id ────────────────────
router.delete('/my-questions/:id', async (req, res, next) => {
    try {
        const userId = req.user!.userId;
        const safeUid = userId.replace(/'/g, "''");
        const safeId = req.params.id.replace(/'/g, "''");
        await ensureTables();

        const existing = await prisma.$queryRawUnsafe<any[]>(`SELECT id, pack_id FROM user_questions WHERE id = '${safeId}' AND user_id = '${safeUid}'`).catch(() => [] as any[]);
        if (!existing.length) throw new AppError('Question not found or not yours', 404);

        const packId = existing[0].pack_id;
        await prisma.$executeRawUnsafe(`DELETE FROM user_questions WHERE id = '${safeId}' AND user_id = '${safeUid}'`);
        if (packId) {
            await prisma.$executeRawUnsafe(`UPDATE user_question_packs SET question_count = GREATEST(0, question_count - 1), updated_at = NOW() WHERE id = '${packId.replace(/'/g, "''")}'`).catch(() => null);
        }
        await logUsage(userId, safeId, 'deleted');
        res.json({ success: true, message: 'Question deleted from your bank' });
    } catch (err) { next(err); }
});

// ─── POST /api/user-qbank/purchase/:packId ────────────────────
router.post('/purchase/:packId', async (req, res, next) => {
    try {
        const userId = req.user!.userId;
        const safeUid = userId.replace(/'/g, "''");
        const safePack = req.params.packId.replace(/'/g, "''");
        await ensureTables();

        const pack = await prisma.$queryRawUnsafe<any[]>(`SELECT id, name, subject FROM question_sets WHERE id = '${safePack}' AND is_global = TRUE LIMIT 1`);
        if (!pack.length) throw new AppError('Pack not found or not available', 404);

        const already = await prisma.$queryRawUnsafe<any[]>(`SELECT id FROM user_purchased_packs WHERE user_id = '${safeUid}' AND pack_id = '${pack[0].id}' LIMIT 1`).catch(() => [] as any[]);
        if (already.length) throw new AppError('You already have access to this pack', 400);

        const purchaseId = generateId('purchase');
        await prisma.$executeRawUnsafe(`INSERT INTO user_purchased_packs (id, user_id, pack_id) VALUES ('${purchaseId}', '${safeUid}', '${pack[0].id}')`);

        // Copy questions from pack into user bank
        const packQuestions = await prisma.$queryRawUnsafe<any[]>(`
            SELECT q.id, q.text_en AS "textEn", q.text_hi AS "textHi", q.type, q.difficulty, q.subject_name AS "subjectName",
                   q.explanation_en AS "explanationEn", q.explanation_hi AS "explanationHi"
            FROM question_set_items qsi JOIN questions q ON q.id = qsi.question_id
            WHERE qsi.set_id = '${pack[0].id}' ORDER BY qsi.sort_order ASC
        `);

        let optionsMap: Record<string, any[]> = {};
        if (packQuestions.length > 0) {
            const qIds = packQuestions.map((q: any) => `'${q.id.replace(/'/g, "''")}'`).join(',');
            const options = await prisma.$queryRawUnsafe<any[]>(`
                SELECT question_id AS "questionId", text_en AS "textEn", text_hi AS "textHi", is_correct AS "isCorrect", sort_order AS "sortOrder"
                FROM question_options WHERE question_id IN (${qIds}) ORDER BY sort_order
            `).catch(() => [] as any[]);
            options.forEach((o: any) => { if (!optionsMap[o.questionId]) optionsMap[o.questionId] = []; optionsMap[o.questionId].push(o); });
        }

        let copiedCount = 0;
        for (const q of packQuestions) {
            const uqId = generateId('uq');
            const opts = optionsMap[q.id] || [];
            const optionsJson = JSON.stringify(opts.map((o: any) => ({ textEn: o.textEn, textHi: o.textHi, isCorrect: o.isCorrect, sortOrder: o.sortOrder })));
            const correctOpt = opts.find((o: any) => o.isCorrect);
            const answer = correctOpt ? String.fromCharCode(65 + (correctOpt.sortOrder || 0)) : '';

            await prisma.$executeRawUnsafe(`
                INSERT INTO user_questions (id, user_id, text_en, text_hi, type, difficulty, subject, answer, explanation, explanation_hi, options_json, source, visibility, source_pack_id, source_pack_name, original_question_id)
                VALUES ('${uqId}', '${safeUid}', $1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, 'marketplace', 'PRIVATE', '${pack[0].id}', $10, '${q.id.replace(/'/g, "''")}')
            `, q.textEn, q.textHi ?? '', q.type, q.difficulty, q.subjectName ?? pack[0].subject ?? '', answer, q.explanationEn ?? null, q.explanationHi ?? null, optionsJson, pack[0].name);
            copiedCount++;
        }

        res.json({ success: true, message: `Access granted to "${pack[0].name}"`, data: { copiedCount } });
    } catch (err) { next(err); }
});

// ─── GET /api/user-qbank/purchased ────────────────────────────
router.get('/purchased', async (req, res, next) => {
    try {
        const userId = req.user!.userId;
        const safeUid = userId.replace(/'/g, "''");
        await ensureTables();

        const packs = await prisma.$queryRawUnsafe<any[]>(`
            SELECT qs.id, qs.set_id AS "setId", qs.name, qs.description, qs.total_questions AS "totalQuestions",
                   qs.subject, qs.created_at AS "createdAt", upp.purchased_at AS "purchasedAt", 'purchased' AS source
            FROM user_purchased_packs upp JOIN question_sets qs ON qs.id = upp.pack_id
            WHERE upp.user_id = '${safeUid}' ORDER BY upp.purchased_at DESC
        `).catch(() => [] as any[]);
        res.json({ success: true, data: { packs, total: packs.length } });
    } catch (err) { next(err); }
});

// ─── DELETE /api/user-qbank/purchased/:id ──────────────────────
router.delete('/purchased/:id', async (req, res, next) => {
    try {
        const userId = req.user!.userId;
        const safeUid = userId.replace(/'/g, "''");
        const safeId = req.params.id.replace(/'/g, "''");
        await ensureTables();

        await prisma.$executeRawUnsafe(`DELETE FROM user_purchased_packs WHERE pack_id = '${safeId}' AND user_id = '${safeUid}'`);
        res.json({ success: true, message: 'Pack removed from your library' });
    } catch (err) { next(err); }
});

// ─── PUBLIC QUESTIONS ───────────────────────────────────────────
router.get('/public-questions', async (req, res, next) => {
    try {
        const userId = req.user!.userId;
        const { page = 1, limit = 20, search, subject } = req.query;
        const take = Math.min(Number(limit), 50);
        const skip = (Number(page) - 1) * take;
        await ensureTables();

        let whereClause = `WHERE uq.visibility = 'PUBLIC' AND uq.user_id != '${userId.replace(/'/g, "''")}'`;
        if (search) whereClause += ` AND (uq.text_en ILIKE '%${String(search).replace(/'/g, "''")}%' OR uq.text_hi ILIKE '%${String(search).replace(/'/g, "''")}%')`;
        if (subject && subject !== 'all') whereClause += ` AND uq.subject = '${String(subject).replace(/'/g, "''")}'`;

        const questions = await prisma.$queryRawUnsafe<any[]>(`
            SELECT uq.id, uq.text_en AS "textEn", uq.text_hi AS "textHi", uq.type, uq.difficulty, uq.subject AS "subjectName",
                   uq.options_json AS "optionsJson", uq.source, uq.created_at AS "createdAt", uq.user_id AS "ownerUserId"
            FROM user_questions uq ${whereClause} ORDER BY uq.created_at DESC LIMIT ${take} OFFSET ${skip}
        `).catch(() => [] as any[]);

        const parsed = questions.map((q: any) => ({ ...q, options: typeof q.optionsJson === 'string' ? JSON.parse(q.optionsJson) : (q.optionsJson || []) }));
        const cntRow = await prisma.$queryRawUnsafe<[{ cnt: string }]>(`SELECT COUNT(*)::TEXT AS cnt FROM user_questions uq ${whereClause}`).catch(() => [{ cnt: '0' }]);
        const subjects = await prisma.$queryRawUnsafe<any[]>(`SELECT DISTINCT subject FROM user_questions WHERE visibility = 'PUBLIC' AND subject IS NOT NULL ORDER BY subject ASC`).catch(() => [] as any[]);

        res.json({ success: true, data: { questions: parsed, total: Number(cntRow[0]?.cnt ?? 0), subjects: subjects.map((s: any) => s.subject) } });
    } catch (err) { next(err); }
});

// ─── POST /api/user-qbank/public-questions/:id/copy ────────────
router.post('/public-questions/:id/copy', async (req, res, next) => {
    try {
        const userId = req.user!.userId;
        const safeUid = userId.replace(/'/g, "''");
        const safeId = req.params.id.replace(/'/g, "''");
        await ensureTables();

        const source = await prisma.$queryRawUnsafe<any[]>(`
            SELECT id, text_en AS "textEn", text_hi AS "textHi", type, difficulty, subject, answer,
                   explanation AS "explanationEn", explanation_hi AS "explanationHi", options_json AS "optionsJson", user_id AS "ownerUserId"
            FROM user_questions WHERE id = '${safeId}' AND visibility = 'PUBLIC' LIMIT 1
        `).catch(() => [] as any[]);
        if (!source.length) throw new AppError('Question not found or not public', 404);
        if (source[0].ownerUserId === safeUid) throw new AppError('This is already your question', 400);

        const q = source[0];
        const uqId = generateId('uq');
        await prisma.$executeRawUnsafe(`
            INSERT INTO user_questions (id, user_id, text_en, text_hi, type, difficulty, subject, answer, explanation, explanation_hi, options_json, source, visibility, original_question_id)
            VALUES ('${uqId}', '${safeUid}', $1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, 'imported', 'PRIVATE', '${safeId}')
        `, q.textEn, q.textHi ?? '', q.type, q.difficulty, q.subject ?? '', q.answer ?? null, q.explanationEn ?? null, q.explanationHi ?? null, q.optionsJson || '[]');

        await logUsage(userId, uqId, 'copied_from_public');
        res.json({ success: true, data: { id: uqId }, message: 'Question copied to your bank' });
    } catch (err) { next(err); }
});

// ─── USER QUESTION SETS ─────────────────────────────────────────
router.get('/my-sets', async (req, res, next) => {
    try {
        const userId = req.user!.userId;
        const safeUid = userId.replace(/'/g, "''");
        const { page = 1, limit = 50, search } = req.query;
        const take = Math.min(Number(limit), 50);
        const skip = (Number(page) - 1) * take;
        await ensureTables();

        let whereClause = `WHERE uqs.user_id = '${safeUid}'`;
        if (search) whereClause += ` AND (uqs.name ILIKE '%${String(search).replace(/'/g, "''")}%')`;

        const sets = await prisma.$queryRawUnsafe<any[]>(`
            SELECT uqs.id, uqs.name, uqs.description, uqs.question_count AS "questionCount", uqs.created_at AS "createdAt", uqs.updated_at AS "updatedAt"
            FROM user_question_sets uqs ${whereClause} ORDER BY uqs.updated_at DESC NULLS LAST LIMIT ${take} OFFSET ${skip}
        `).catch(() => [] as any[]);
        const cntRow = await prisma.$queryRawUnsafe<[{ cnt: string }]>(`SELECT COUNT(*)::TEXT AS cnt FROM user_question_sets uqs ${whereClause}`).catch(() => [{ cnt: String(sets.length) }]);
        res.json({ success: true, data: { sets, total: Number(cntRow[0]?.cnt ?? 0) } });
    } catch (err) { next(err); }
});

// ─── POST /api/user-qbank/my-sets ──────────────────────────────
router.post('/my-sets', async (req, res, next) => {
    try {
        const userId = req.user!.userId;
        const safeUid = userId.replace(/'/g, "''");
        await ensureTables();

        const body = z.object({ name: z.string().min(1), description: z.string().optional(), questionIds: z.array(z.string()).default([]) }).parse(req.body);
        const setId = generateId('uset');
        await prisma.$executeRawUnsafe(`INSERT INTO user_question_sets (id, user_id, name, description, question_count) VALUES ('${setId}', '${safeUid}', $1, $2, ${body.questionIds.length})`, body.name, body.description ?? null);

        if (body.questionIds.length > 0) {
            for (let i = 0; i < body.questionIds.length; i++) {
                const safeQId = body.questionIds[i].replace(/'/g, "''");
                const itemId = generateId('usetitem');
                await prisma.$executeRawUnsafe(`INSERT INTO user_question_set_items (id, set_id, user_question_id, sort_order) VALUES ('${itemId}', '${setId}', '${safeQId}', ${i})`).catch(() => null);
            }
        }
        res.status(201).json({ success: true, data: { id: setId, name: body.name, description: body.description, questionCount: body.questionIds.length } });
    } catch (err) { next(err); }
});

// ─── GET /api/user-qbank/my-sets/:id ───────────────────────────
router.get('/my-sets/:id', async (req, res, next) => {
    try {
        const userId = req.user!.userId;
        const safeUid = userId.replace(/'/g, "''");
        const safeId = req.params.id.replace(/'/g, "''");
        await ensureTables();

        const setRows = await prisma.$queryRawUnsafe<any[]>(`SELECT uqs.id, uqs.name, uqs.description, uqs.question_count AS "questionCount", uqs.created_at AS "createdAt" FROM user_question_sets uqs WHERE uqs.id = '${safeId}' AND uqs.user_id = '${safeUid}' LIMIT 1`).catch(() => [] as any[]);
        if (!setRows.length) throw new AppError('Set not found', 404);

        const items = await prisma.$queryRawUnsafe<any[]>(`
            SELECT uqsi.sort_order, uq.id AS "uqId", uq.text_en AS "textEn", uq.text_hi AS "textHi", uq.type, uq.difficulty,
                   uq.subject, uq.source, uq.visibility, uq.options_json AS "optionsJson", uq.answer
            FROM user_question_set_items uqsi JOIN user_questions uq ON uq.id = uqsi.user_question_id
            WHERE uqsi.set_id = '${safeId}' ORDER BY uqsi.sort_order ASC
        `).catch(() => [] as any[]);

        const parsed = items.map((q: any) => ({ ...q, options: typeof q.optionsJson === 'string' ? JSON.parse(q.optionsJson) : (q.optionsJson || []) }));
        res.json({ success: true, data: { ...setRows[0], questions: parsed } });
    } catch (err) { next(err); }
});

// ─── PUT /api/user-qbank/my-sets/:id/questions ──────────────────
router.put('/my-sets/:id/questions', async (req, res, next) => {
    try {
        const userId = req.user!.userId;
        const safeUid = userId.replace(/'/g, "''");
        const safeId = req.params.id.replace(/'/g, "''");
        await ensureTables();

        const existing = await prisma.$queryRawUnsafe<any[]>(`SELECT id FROM user_question_sets WHERE id = '${safeId}' AND user_id = '${safeUid}' LIMIT 1`).catch(() => [] as any[]);
        if (!existing.length) throw new AppError('Set not found or not yours', 404);

        const body = z.object({ questionIds: z.array(z.string()) }).parse(req.body);
        await prisma.$executeRawUnsafe(`DELETE FROM user_question_set_items WHERE set_id = '${safeId}'`).catch(() => null);
        for (let i = 0; i < body.questionIds.length; i++) {
            const safeQId = body.questionIds[i].replace(/'/g, "''");
            const itemId = generateId('usetitem');
            await prisma.$executeRawUnsafe(`INSERT INTO user_question_set_items (id, set_id, user_question_id, sort_order) VALUES ('${itemId}', '${safeId}', '${safeQId}', ${i})`).catch(() => null);
        }
        await prisma.$executeRawUnsafe(`UPDATE user_question_sets SET question_count = ${body.questionIds.length}, updated_at = NOW() WHERE id = '${safeId}'`);
        res.json({ success: true, message: 'Set updated', data: { questionCount: body.questionIds.length } });
    } catch (err) { next(err); }
});

// ─── DELETE /api/user-qbank/my-sets/:id ────────────────────────
router.delete('/my-sets/:id', async (req, res, next) => {
    try {
        const userId = req.user!.userId;
        const safeUid = userId.replace(/'/g, "''");
        const safeId = req.params.id.replace(/'/g, "''");
        await ensureTables();

        const existing = await prisma.$queryRawUnsafe<any[]>(`SELECT id FROM user_question_sets WHERE id = '${safeId}' AND user_id = '${safeUid}'`).catch(() => [] as any[]);
        if (!existing.length) throw new AppError('Set not found or not yours', 404);
        await prisma.$executeRawUnsafe(`DELETE FROM user_question_set_items WHERE set_id = '${safeId}'`).catch(() => null);
        await prisma.$executeRawUnsafe(`DELETE FROM user_question_sets WHERE id = '${safeId}'`);
        res.json({ success: true, message: 'Set deleted' });
    } catch (err) { next(err); }
});

// ─── USAGE LOG ─────────────────────────────────────────────────
router.get('/usage-logs', async (req, res, next) => {
    try {
        const userId = req.user!.userId;
        const safeUid = userId.replace(/'/g, "''");
        const { page = 1, limit = 20 } = req.query;
        const take = Math.min(Number(limit), 100);
        const skip = (Number(page) - 1) * take;
        await ensureTables();

        const logs = await prisma.$queryRawUnsafe<any[]>(`
            SELECT ul.id, ul.question_id AS "questionId", ul.action, ul.created_at AS "createdAt"
            FROM user_usage_logs ul WHERE ul.user_id = '${safeUid}' ORDER BY ul.created_at DESC LIMIT ${take} OFFSET ${skip}
        `).catch(() => [] as any[]);
        const cntRow = await prisma.$queryRawUnsafe<[{ cnt: string }]>(`SELECT COUNT(*)::TEXT AS cnt FROM user_usage_logs WHERE user_id = '${safeUid}'`).catch(() => [{ cnt: '0' }]);
        res.json({ success: true, data: { logs, total: Number(cntRow[0]?.cnt ?? 0) } });
    } catch (err) { next(err); }
});

// ─── AI: Save generated/extracted questions to user bank ──────
router.post('/ai-save-questions', async (req, res, next) => {
    try {
        const userId = req.user!.userId;
        const safeUid = userId.replace(/'/g, "''");
        await ensureTables();

        const body = z.object({
            questions: z.array(z.object({
                textEn: z.string().min(1), textHi: z.string().optional(),
                type: z.string().default('MCQ_SINGLE'), difficulty: z.string().default('MEDIUM'),
                subject: z.string().optional(), answer: z.string().optional(),
                explanationEn: z.string().optional(), explanationHi: z.string().optional(),
                options: z.array(z.object({ textEn: z.string(), textHi: z.string().optional(), isCorrect: z.boolean().default(false), sortOrder: z.number().default(0) })).default([]),
            })),
        }).parse(req.body);

        const savedIds: string[] = [];
        for (const q of body.questions) {
            const qId = generateId('uq');
            const optionsJson = JSON.stringify(q.options);
            await prisma.$executeRawUnsafe(`
                INSERT INTO user_questions (id, user_id, text_en, text_hi, type, difficulty, subject, answer, explanation, explanation_hi, options_json, source, visibility)
                VALUES ('${qId}', '${safeUid}', $1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, 'imported', 'PRIVATE')
            `, q.textEn, q.textHi ?? null, q.type, q.difficulty, q.subject ?? null, q.answer ?? null, q.explanationEn ?? null, q.explanationHi ?? null, optionsJson);
            savedIds.push(qId);
        }
        res.status(201).json({ success: true, data: { ids: savedIds, count: savedIds.length }, message: `${savedIds.length} questions saved to your bank` });
    } catch (err) { next(err); }
});

export default router;