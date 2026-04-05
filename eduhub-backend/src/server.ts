import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';

import { env } from './config/env';
import { logger } from './config/logger';
import { connectRedis } from './config/redis';
import { prisma } from './config/database';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import superAdminRoutes from './modules/superAdmin/superAdmin.routes';
import whiteboardRoutes from './modules/whiteboard/whiteboard.routes';
import whiteboardAccountRoutes from './modules/whiteboardAccount/whiteboardAccount.routes';

// Error handler
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

const app = express();

function sqlQuote(value: string) {
    return `'${value.replace(/'/g, "''")}'`;
}

function nullableSqlValue(value: string | number | null | undefined) {
    if (value === null || value === undefined || value === '') return 'NULL';
    if (typeof value === 'number') return String(value);
    return sqlQuote(String(value));
}

function createCompatId(prefix: string) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function slugify(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'general';
}

type AirtableCompatRecord = {
    id: string;
    fields: Record<string, unknown>;
};

function getFieldValue(fields: Record<string, unknown>, candidates: string[]) {
    const entries = Object.entries(fields);
    for (const candidate of candidates) {
        const normalizedCandidate = candidate.toLowerCase().replace(/[^a-z0-9]/g, '');
        const match = entries.find(([key]) => key.toLowerCase().replace(/[^a-z0-9]/g, '') === normalizedCandidate);
        if (match) return match[1];
    }
    return undefined;
}

function toText(value: unknown) {
    if (value === null || value === undefined) return '';
    if (Array.isArray(value)) return value.join(', ');
    return String(value).trim();
}

function toNumber(value: unknown) {
    if (value === null || value === undefined || value === '') return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
}

function normalizeQuestionType(value: string) {
    const type = value.toLowerCase().trim();
    if (!type) return 'mcq_single';
    if (type.includes('multiple') || type.includes('multi')) return 'multi_select';
    if (type.includes('true') || type.includes('false')) return 'true_false';
    if (type.includes('integer') || type.includes('descriptive') || type.includes('blank')) return 'integer';
    return 'mcq_single';
}

function normalizeDifficulty(value: string) {
    const difficulty = value.toLowerCase().trim();
    if (difficulty === 'easy' || difficulty === 'medium' || difficulty === 'hard') return difficulty;
    return 'medium';
}

function buildQuestionPayloadFromAirtable(record: AirtableCompatRecord, tableName: string) {
    const fields = record.fields || {};
    const questionNo = toNumber(getFieldValue(fields, ['question_no', 'questionNo', 'question no']));
    const questionTextEn = toText(getFieldValue(fields, ['question_eng', 'question_en', 'question', 'question text english']));
    const questionTextHi = toText(getFieldValue(fields, ['question_hin', 'question_hi', 'question hindi', 'question text hindi']));
    const explanationEn = toText(getFieldValue(fields, ['solution_eng', 'explanation_eng', 'solution english']));
    const explanationHi = toText(getFieldValue(fields, ['solution_hin', 'explanation_hin', 'solution hindi']));
    const subjectName = toText(getFieldValue(fields, ['subject', 'subject_name'])) || 'General Awareness';
    const chapterName = toText(getFieldValue(fields, ['chapter', 'chapter_name'])) || 'Miscellaneous';
    const exam = toText(getFieldValue(fields, ['exam', 'related_exam', 'exam category']));
    const collection = toText(getFieldValue(fields, ['collection']));
    const year = toNumber(getFieldValue(fields, ['year', 'exam_year']));
    const pointCost = toNumber(getFieldValue(fields, ['point_cost', 'points', 'point cost'])) ?? 5;
    const usageCount = toNumber(getFieldValue(fields, ['usage_count', 'usage count'])) ?? 0;
    const answer = toText(getFieldValue(fields, ['answer', 'correct_option', 'correct answer']));
    const questionType = normalizeQuestionType(toText(getFieldValue(fields, ['type', 'question_type'])));
    const options = [1, 2, 3, 4, 5, 6]
        .map((index) => ({
            textEn: toText(getFieldValue(fields, [`option${index}_eng`, `option_${index}_eng`, `option${index}`, `option ${index} english`])),
            textHi: toText(getFieldValue(fields, [`option${index}_hin`, `option_${index}_hin`, `option ${index} hindi`])),
            key: String(index),
            sortOrder: index - 1,
        }))
        .filter((option) => option.textEn || option.textHi);

    return {
        questionId: toText(getFieldValue(fields, ['question_id', 'question_unique_id'])) || `Q-AIR-${record.id}`,
        recordId: record.id,
        questionNo,
        textEn: questionTextEn,
        textHi: questionTextHi,
        explanationEn,
        explanationHi,
        type: questionType,
        difficulty: normalizeDifficulty(toText(getFieldValue(fields, ['difficulty']))),
        subjectName,
        chapterName,
        exam,
        collection,
        year,
        pointCost,
        usageCount,
        isApproved: true,
        isGlobal: true,
        airtableTableName: toText(getFieldValue(fields, ['airtable_table_name'])) || tableName,
        options: options.map((option) => ({
            ...option,
            isCorrect: answer === option.key || answer.toUpperCase() === String.fromCharCode(64 + Number(option.key)),
        })),
    };
}

async function fetchAirtableTablesCompat() {
    if (!env.AIRTABLE_API_KEY || !env.AIRTABLE_BASE_ID) {
        throw new Error('Airtable credentials are not configured on the backend');
    }

    const response = await fetch(`https://api.airtable.com/v0/meta/bases/${env.AIRTABLE_BASE_ID}/tables`, {
        headers: { Authorization: `Bearer ${env.AIRTABLE_API_KEY}` },
    });
    const data = await response.json() as { tables?: Array<{ id: string; name: string }>; error?: { message?: string } };

    if (!response.ok) {
        if (response.status === 403) {
            throw new Error('Airtable token me schema.bases:read permission missing hai');
        }
        throw new Error(data.error?.message || 'Failed to fetch Airtable tables');
    }

    return data.tables || [];
}

async function fetchAirtableRecordsCompat(tableName: string) {
    if (!env.AIRTABLE_API_KEY || !env.AIRTABLE_BASE_ID) {
        throw new Error('Airtable credentials are not configured on the backend');
    }

    const records: AirtableCompatRecord[] = [];
    let offset: string | undefined;

    do {
        const url = new URL(`https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID}/${encodeURIComponent(tableName)}`);
        url.searchParams.set('pageSize', '100');
        if (offset) url.searchParams.set('offset', offset);

        const response = await fetch(url.toString(), {
            headers: { Authorization: `Bearer ${env.AIRTABLE_API_KEY}` },
        });
        const data = await response.json() as { records?: AirtableCompatRecord[]; offset?: string; error?: { message?: string } };

        if (!response.ok) {
            throw new Error(data.error?.message || `Failed to fetch records from Airtable table ${tableName}`);
        }

        records.push(...(data.records || []));
        offset = data.offset;
    } while (offset);

    return records;
}

async function syncAirtableTableCompat(tableName: string) {
    const records = await fetchAirtableRecordsCompat(tableName);
    let createdCount = 0;
    let updatedCount = 0;

    for (const record of records) {
        const payload = buildQuestionPayloadFromAirtable(record, tableName);
        const existingRows = await prisma.$queryRawUnsafe<Array<{ id: string }>>(`
            SELECT id FROM questions
            WHERE record_id = ${sqlQuote(payload.recordId)}
               OR question_id = ${sqlQuote(payload.questionId)}
            LIMIT 1
        `);

        const questionPrimaryId = existingRows[0]?.id || createCompatId('q');

        await prisma.$executeRawUnsafe(`
            INSERT INTO questions (
                id, question_id, record_id, question_no, text_en, text_hi, explanation_en, explanation_hi,
                type, difficulty, subject_name, chapter_name, exam, collection, year,
                point_cost, usage_count, is_approved, is_global, airtable_table_name, created_at
            ) VALUES (
                ${sqlQuote(questionPrimaryId)},
                ${sqlQuote(payload.questionId)},
                ${sqlQuote(payload.recordId)},
                ${nullableSqlValue(payload.questionNo)},
                ${sqlQuote(payload.textEn || payload.textHi || 'Untitled question')},
                ${nullableSqlValue(payload.textHi)},
                ${nullableSqlValue(payload.explanationEn)},
                ${nullableSqlValue(payload.explanationHi)},
                ${sqlQuote(payload.type)},
                ${sqlQuote(payload.difficulty)},
                ${nullableSqlValue(payload.subjectName)},
                ${nullableSqlValue(payload.chapterName)},
                ${nullableSqlValue(payload.exam)},
                ${nullableSqlValue(payload.collection)},
                ${nullableSqlValue(payload.year)},
                ${payload.pointCost},
                ${payload.usageCount},
                ${payload.isApproved ? 'TRUE' : 'FALSE'},
                ${payload.isGlobal ? 'TRUE' : 'FALSE'},
                ${sqlQuote(payload.airtableTableName)},
                NOW()
            )
            ON CONFLICT (id) DO UPDATE SET
                question_id = EXCLUDED.question_id,
                record_id = EXCLUDED.record_id,
                question_no = EXCLUDED.question_no,
                text_en = EXCLUDED.text_en,
                text_hi = EXCLUDED.text_hi,
                explanation_en = EXCLUDED.explanation_en,
                explanation_hi = EXCLUDED.explanation_hi,
                type = EXCLUDED.type,
                difficulty = EXCLUDED.difficulty,
                subject_name = EXCLUDED.subject_name,
                chapter_name = EXCLUDED.chapter_name,
                exam = EXCLUDED.exam,
                collection = EXCLUDED.collection,
                year = EXCLUDED.year,
                point_cost = EXCLUDED.point_cost,
                usage_count = EXCLUDED.usage_count,
                is_approved = EXCLUDED.is_approved,
                is_global = EXCLUDED.is_global,
                airtable_table_name = EXCLUDED.airtable_table_name
        `);

        await prisma.$executeRawUnsafe(`DELETE FROM question_options WHERE question_id = ${sqlQuote(questionPrimaryId)}`);

        for (const option of payload.options) {
            await prisma.$executeRawUnsafe(`
                INSERT INTO question_options (id, question_id, text_en, text_hi, is_correct, sort_order)
                VALUES (
                    ${sqlQuote(createCompatId('opt'))},
                    ${sqlQuote(questionPrimaryId)},
                    ${nullableSqlValue(option.textEn)},
                    ${nullableSqlValue(option.textHi)},
                    ${option.isCorrect ? 'TRUE' : 'FALSE'},
                    ${option.sortOrder}
                )
            `);
        }

        if (existingRows.length > 0) updatedCount += 1;
        else createdCount += 1;
    }

    await prisma.$executeRawUnsafe(`
        INSERT INTO airtable_sync_metadata (table_name, total_questions, last_sync_at, status, error)
        VALUES (${sqlQuote(tableName)}, ${records.length}, NOW(), 'SUCCESS', NULL)
        ON CONFLICT (table_name) DO UPDATE SET
            total_questions = EXCLUDED.total_questions,
            last_sync_at = EXCLUDED.last_sync_at,
            status = EXCLUDED.status,
            error = EXCLUDED.error
    `);

    await prisma.$executeRawUnsafe(`
        UPDATE airtable_sync_folders
        SET updated_at = NOW(), total_questions = ${records.length}
        WHERE slug = ${sqlQuote(tableName)}
    `);

    return {
        createdCount,
        updatedCount,
        failedCount: 0,
        total: records.length,
    };
}

async function ensureCompatibilitySetsFromQuestions() {
    const sourceRows = await prisma.$queryRawUnsafe<Array<{ source: string; total: number | string }>>(`
        SELECT
            COALESCE(NULLIF(airtable_table_name, ''), NULLIF(subject_name, ''), 'General') AS source,
            COUNT(*) AS total
        FROM questions
        GROUP BY COALESCE(NULLIF(airtable_table_name, ''), NULLIF(subject_name, ''), 'General')
        ORDER BY COUNT(*) DESC
    `);

    let index = 1;
    for (const row of sourceRows) {
        const source = row.source || 'General';
        const total = Number(row.total || 0);
        if (total <= 0) continue;

        const slug = slugify(source);
        const setPrimaryId = `compat-set-${slug}`;
        const setCode = `CMP-${slug.toUpperCase().slice(0, 24)}`;
        const setName = `${source} Auto Set`;
        const setDescription = `Auto-generated compatibility set for ${source} questions.`;

        await prisma.$executeRawUnsafe(`
            INSERT INTO question_sets (id, set_id, pin, name, description, total_questions, subject, chapter, is_global, created_at)
            VALUES (
                ${sqlQuote(setPrimaryId)},
                ${sqlQuote(setCode)},
                '123456',
                ${sqlQuote(setName)},
                ${sqlQuote(setDescription)},
                ${total},
                ${sqlQuote(source)},
                NULL,
                TRUE,
                NOW()
            )
            ON CONFLICT (id) DO UPDATE SET
                total_questions = EXCLUDED.total_questions,
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                subject = EXCLUDED.subject
        `);

        await prisma.$executeRawUnsafe(`DELETE FROM question_set_items WHERE set_id = ${sqlQuote(setPrimaryId)}`);

        await prisma.$executeRawUnsafe(`
            INSERT INTO question_set_items (set_id, question_id, sort_order)
            SELECT
                ${sqlQuote(setPrimaryId)} AS set_id,
                id AS question_id,
                ROW_NUMBER() OVER (ORDER BY created_at DESC) AS sort_order
            FROM questions
            WHERE COALESCE(NULLIF(airtable_table_name, ''), NULLIF(subject_name, ''), 'General') = ${sqlQuote(source)}
            ORDER BY created_at DESC
            LIMIT 100
        `);

        index += 1;
    }
}

function buildQuestionWhereClause(req: express.Request) {
    const search = String(req.query.search || '').trim();
    const difficulty = String(req.query.difficulty || '').trim().toLowerCase();
    const type = String(req.query.type || '').trim().toLowerCase();
    const exam = String(req.query.exam || '').trim();
    const year = String(req.query.year || '').trim();
    const source = String(req.query.source || '').trim();
    const filtersRaw = String(req.query.filters || '').trim();
    const conditions: string[] = [];

    if (search) {
        const safeSearch = search.replace(/'/g, "''");
        conditions.push(`(
            text_en ILIKE '%${safeSearch}%'
            OR COALESCE(text_hi, '') ILIKE '%${safeSearch}%'
            OR COALESCE(subject_name, '') ILIKE '%${safeSearch}%'
            OR COALESCE(chapter_name, '') ILIKE '%${safeSearch}%'
            OR COALESCE(exam, '') ILIKE '%${safeSearch}%'
            OR COALESCE(collection, '') ILIKE '%${safeSearch}%'
            OR COALESCE(airtable_table_name, '') ILIKE '%${safeSearch}%'
        )`);
    }

    if (difficulty && difficulty !== 'all') conditions.push(`LOWER(difficulty) = ${sqlQuote(difficulty)}`);
    if (type && type !== 'all') {
        const normalized = normalizeQuestionType(type);
        conditions.push(`LOWER(type) = ${sqlQuote(normalized)}`);
    }
    if (exam && exam !== 'all') conditions.push(`COALESCE(exam, '') = ${sqlQuote(exam)}`);
    if (year && year !== 'all') conditions.push(`CAST(COALESCE(year, 0) AS TEXT) = ${sqlQuote(year)}`);
    if (source && source !== 'all') conditions.push(`COALESCE(airtable_table_name, '') = ${sqlQuote(source)}`);

    if (filtersRaw) {
        try {
            const filters = JSON.parse(filtersRaw) as Array<{ field?: string; operator?: string; value?: string }>;
            const fieldMap: Record<string, string> = {
                subjectName: 'subject_name',
                chapterName: 'chapter_name',
                exam: 'exam',
                year: 'year',
                collection: 'collection',
                type: 'type',
                difficulty: 'difficulty',
                pointCost: 'point_cost',
                usageCount: 'usage_count',
                questionUniqueId: 'question_id',
                isApproved: 'is_approved',
                airtableTableName: 'airtable_table_name',
                textEn: 'text_en',
                textHi: 'text_hi',
            };

            for (const filter of filters) {
                if (!filter?.field || !filter.operator) continue;
                const column = fieldMap[filter.field];
                if (!column) continue;

                const value = String(filter.value || '');
                const safeValue = value.replace(/'/g, "''");

                if (filter.operator === 'equals') conditions.push(`CAST(COALESCE(${column}, '') AS TEXT) = ${sqlQuote(value)}`);
                if (filter.operator === 'not_equals') conditions.push(`CAST(COALESCE(${column}, '') AS TEXT) <> ${sqlQuote(value)}`);
                if (filter.operator === 'contains') conditions.push(`CAST(COALESCE(${column}, '') AS TEXT) ILIKE '%${safeValue}%'`);
                if (filter.operator === 'doesNotContain') conditions.push(`CAST(COALESCE(${column}, '') AS TEXT) NOT ILIKE '%${safeValue}%'`);
                if (filter.operator === 'startsWith') conditions.push(`CAST(COALESCE(${column}, '') AS TEXT) ILIKE '${safeValue}%'`);
                if (filter.operator === 'endsWith') conditions.push(`CAST(COALESCE(${column}, '') AS TEXT) ILIKE '%${safeValue}'`);
                if (filter.operator === 'isEmpty') conditions.push(`COALESCE(CAST(${column} AS TEXT), '') = ''`);
                if (filter.operator === 'isNotEmpty') conditions.push(`COALESCE(CAST(${column} AS TEXT), '') <> ''`);
            }
        } catch {
            logger.warn('Ignoring malformed qbank filters payload');
        }
    }

    return conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
}

async function ensureQuestionBankCompatibilityData() {
    await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS questions (
            id TEXT PRIMARY KEY,
            question_id TEXT UNIQUE NOT NULL,
            text_en TEXT NOT NULL,
            text_hi TEXT,
            type TEXT NOT NULL DEFAULT 'mcq',
            difficulty TEXT NOT NULL DEFAULT 'medium',
            subject_name TEXT,
            chapter_name TEXT,
            point_cost INTEGER NOT NULL DEFAULT 5,
            usage_count INTEGER NOT NULL DEFAULT 0,
            is_approved BOOLEAN NOT NULL DEFAULT FALSE,
            is_global BOOLEAN NOT NULL DEFAULT FALSE,
            question_no INTEGER,
            explanation_en TEXT,
            explanation_hi TEXT,
            exam TEXT,
            collection TEXT,
            year INTEGER,
            airtable_table_name TEXT,
            record_id TEXT UNIQUE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);

    await prisma.$executeRawUnsafe(`ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_no INTEGER`);
    await prisma.$executeRawUnsafe(`ALTER TABLE questions ADD COLUMN IF NOT EXISTS explanation_en TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE questions ADD COLUMN IF NOT EXISTS explanation_hi TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE questions ADD COLUMN IF NOT EXISTS exam TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE questions ADD COLUMN IF NOT EXISTS collection TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE questions ADD COLUMN IF NOT EXISTS year INTEGER`);
    await prisma.$executeRawUnsafe(`ALTER TABLE questions ADD COLUMN IF NOT EXISTS airtable_table_name TEXT`);
    await prisma.$executeRawUnsafe(`ALTER TABLE questions ADD COLUMN IF NOT EXISTS record_id TEXT`);

    await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS question_options (
            id TEXT PRIMARY KEY,
            question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
            text_en TEXT,
            text_hi TEXT,
            is_correct BOOLEAN NOT NULL DEFAULT FALSE,
            sort_order INTEGER NOT NULL DEFAULT 0
        )
    `);

    await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS question_sets (
            id TEXT PRIMARY KEY,
            set_id TEXT UNIQUE NOT NULL,
            pin TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            total_questions INTEGER NOT NULL DEFAULT 0,
            subject TEXT,
            chapter TEXT,
            is_global BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);

    await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS question_set_items (
            set_id TEXT NOT NULL REFERENCES question_sets(id) ON DELETE CASCADE,
            question_id TEXT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
            sort_order INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (set_id, question_id)
        )
    `);

    await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS airtable_sync_folders (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            total_questions INTEGER NOT NULL DEFAULT 0,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);

    await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS airtable_sync_metadata (
            table_name TEXT PRIMARY KEY,
            total_questions INTEGER NOT NULL DEFAULT 0,
            last_sync_at TIMESTAMPTZ,
            status TEXT NOT NULL DEFAULT 'NOT_SYNCED',
            error TEXT
        )
    `);

    const questionCountRows = await prisma.$queryRawUnsafe<Array<{ count: number | string }>>(
        `SELECT COUNT(*) AS count FROM questions`
    );
    const questionCount = Number(questionCountRows[0]?.count ?? 0);

    if (questionCount > 0) return;

    await prisma.$executeRawUnsafe(`
        INSERT INTO questions (id, question_id, text_en, text_hi, type, difficulty, subject_name, chapter_name, point_cost, usage_count, is_approved, is_global)
        VALUES
        ('q-1001', 'Q-1001', 'What is the sum of 12 + 15?', '12 aur 15 ka jod kya hai?', 'mcq_single', 'easy', 'Mathematics', 'Arithmetic', 5, 12, TRUE, TRUE),
        ('q-1002', 'Q-1002', 'Identify the verb in the sentence "She runs fast".', 'Vakya "She runs fast" mein kriya pehchaniye.', 'mcq_single', 'medium', 'English', 'Grammar', 5, 8, TRUE, TRUE)
        ON CONFLICT (id) DO NOTHING
    `);

    await prisma.$executeRawUnsafe(`
        INSERT INTO question_options (id, question_id, text_en, text_hi, is_correct, sort_order)
        VALUES
        ('opt-1001-a', 'q-1001', '25', '25', FALSE, 0),
        ('opt-1001-b', 'q-1001', '27', '27', TRUE, 1),
        ('opt-1001-c', 'q-1001', '30', '30', FALSE, 2),
        ('opt-1002-a', 'q-1002', 'Runs', 'Runs', TRUE, 0),
        ('opt-1002-b', 'q-1002', 'Fast', 'Fast', FALSE, 1),
        ('opt-1002-c', 'q-1002', 'She', 'She', FALSE, 2)
        ON CONFLICT (id) DO NOTHING
    `);

    await prisma.$executeRawUnsafe(`
        INSERT INTO question_sets (id, set_id, pin, name, description, total_questions, subject, chapter, is_global)
        VALUES
        ('set-1001', 'SET001', '123456', 'Mathematics Basic Test', 'A basic math assessment for compatibility mode.', 1, 'Mathematics', 'Arithmetic', TRUE),
        ('set-1002', 'SET002', '123456', 'English Grammar Quiz', 'A basic grammar set for compatibility mode.', 1, 'English', 'Grammar', TRUE)
        ON CONFLICT (id) DO NOTHING
    `);

    await prisma.$executeRawUnsafe(`
        INSERT INTO question_set_items (set_id, question_id, sort_order)
        VALUES
        ('set-1001', 'q-1001', 1),
        ('set-1002', 'q-1002', 1)
        ON CONFLICT (set_id, question_id) DO NOTHING
    `);
}

// ─── Global Middleware ───────────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(morgan('combined', {
    stream: { write: (message) => logger.http(message.trim()) }
}));

// CORS logic with DB-backed dynamic origins
const staticOrigins = env.ALLOWED_ORIGINS.split(',')
    .map(o => o.trim().replace(/\/$/, ""));

app.use(cors({
    origin: async (origin, callback) => {
        // 1. Allow if no origin (server-to-server / tools) or in static list
        if (!origin || staticOrigins.includes(origin) || staticOrigins.includes('*')) {
            return callback(null, true);
        }

        // Extra check for subdomains of allowed base domains
        const isPlatformSubdomain = staticOrigins.some(so => {
            try {
                const soUrl = new URL(so);
                const originUrl = new URL(origin);
                // Allow if it's a subdomain of an allowed base domain (e.g. superadmin.mockveda.com of mockveda.com)
                return originUrl.hostname.endsWith(soUrl.hostname);
            } catch {
                return false;
            }
        });

        if (isPlatformSubdomain) {
            return callback(null, true);
        }

        // Single-owner mode: no tenant/domain DB checks.
        logger.warn(`CORS blocked for origin: ${origin}. Add it to ALLOWED_ORIGINS to allow access.`);
        callback(new Error(`CORS: ${origin} not allowed`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control', 'Pragma'],
}));

// Rate Limiter — general API
const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.NODE_ENV === 'development' ? 100000 : env.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    // Skip public/read-only endpoints — they're hit on every page load by HMR
        skip: (req) =>
            env.NODE_ENV === 'development' ||
            (req.path === '/auth/me' && req.method === 'GET'),
    message: { success: false, message: 'Too many requests — please try again later.' },
});
app.use('/api/', limiter);

// Body Parsing
app.use(express.json({ 
    limit: '10mb',
    verify: (req: any, _res, buf) => {
        req.rawBody = buf.toString();
    }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Health Check ────────────────────────────────────────────
app.get('/health', async (_req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'EduHub Backend API',
            version: '2.0.0',
        });
    } catch {
        res.status(503).json({ status: 'error', message: 'Database unreachable' });
    }
});

// ─── Single-Owner Compatibility Endpoints ──────────────────────
app.get('/api/organizations', (_req, res) => {
    res.json({
        success: true,
        data: {
            orgs: [],
        },
    });
});

app.get('/api/qbank/dashboard', async (_req, res, next) => {
    try {
        const [summaryRows, subjectRows, recentRows] = await Promise.all([
            prisma.$queryRawUnsafe<Array<{
                total_questions: number | string;
                public_questions: number | string;
                total_sets: number | string;
                total_points: number | string;
            }>>(`
                SELECT
                    COUNT(*) AS total_questions,
                    COUNT(*) FILTER (WHERE is_approved = TRUE OR is_global = TRUE) AS public_questions,
                    COALESCE((SELECT COUNT(*) FROM question_sets), 0) AS total_sets,
                    COALESCE(SUM(point_cost * usage_count), 0) AS total_points
                FROM questions
            `),
            prisma.$queryRawUnsafe<Array<{ subject: string | null; questions: number | string }>>(`
                SELECT COALESCE(subject_name, 'Uncategorized') AS subject, COUNT(*) AS questions
                FROM questions
                GROUP BY COALESCE(subject_name, 'Uncategorized')
                ORDER BY COUNT(*) DESC, subject ASC
                LIMIT 8
            `),
            prisma.$queryRawUnsafe<Array<{
                id: string;
                question: string;
                created_at: Date | string;
                points: number | string;
            }>>(`
                SELECT id, LEFT(text_en, 140) AS question, created_at, point_cost AS points
                FROM questions
                ORDER BY created_at DESC
                LIMIT 5
            `),
        ]);

        const summary = summaryRows[0] ?? {
            total_questions: 0,
            public_questions: 0,
            total_sets: 0,
            total_points: 0,
        };

        res.json({
            success: true,
            data: {
                totalQuestions: Number(summary.total_questions ?? 0),
                newQuestions: 0,
                publicQuestions: Number(summary.public_questions ?? 0),
                newPublic: 0,
                totalSets: Number(summary.total_sets ?? 0),
                newSets: 0,
                totalPoints: Number(summary.total_points ?? 0),
                newPoints: 0,
                bySubject: subjectRows.map((row) => ({
                    subject: row.subject ?? 'Uncategorized',
                    questions: Number(row.questions ?? 0),
                })),
                usageTrend: [],
                recentUsage: recentRows.map((row) => ({
                    id: row.id,
                    question: row.question,
                    org: 'Single Owner',
                    teacher: 'Super Admin',
                    date: new Date(row.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
                    points: Number(row.points ?? 0),
                })),
            },
        });
    } catch (error) {
        next(error);
    }
});

app.get('/api/qbank/questions', async (req, res, next) => {
    try {
        const page = Math.max(Number(req.query.page || 1), 1);
        const limit = Math.max(Number(req.query.limit || 10), 1);
        const offset = (page - 1) * limit;
        const whereClause = buildQuestionWhereClause(req);

        const questions = await prisma.$queryRawUnsafe<Array<any>>(`
            SELECT id, question_id, text_en, text_hi, explanation_en, explanation_hi, type, difficulty, subject_name, chapter_name, exam, collection, year, airtable_table_name, question_no, point_cost, usage_count, is_approved, is_global, created_at
            FROM questions
            ${whereClause}
            ORDER BY created_at DESC
            LIMIT ${limit}
            OFFSET ${offset}
        `);

        const totalRows = await prisma.$queryRawUnsafe<Array<{ count: number | string }>>(`
            SELECT COUNT(*) AS count
            FROM questions
            ${whereClause}
        `);

        const questionIds = questions.map((question) => question.id);
        const options = questionIds.length > 0
            ? await prisma.$queryRawUnsafe<Array<any>>(`
                SELECT id, question_id, text_en, text_hi, is_correct, sort_order
                FROM question_options
                WHERE question_id IN (${questionIds.map(sqlQuote).join(', ')})
                ORDER BY question_id ASC, sort_order ASC
            `)
            : [];

        const optionsByQuestion = options.reduce<Record<string, any[]>>((acc, option) => {
            acc[option.question_id] ??= [];
            acc[option.question_id].push(option);
            return acc;
        }, {});

        res.json({
            success: true,
            data: {
                questions: questions.map((question) => ({
                    id: question.id,
                    questionId: question.question_id,
                    textEn: question.text_en,
                    textHi: question.text_hi,
                    type: question.type,
                    difficulty: question.difficulty,
                    subjectName: question.subject_name,
                    chapterName: question.chapter_name,
                    exam: question.exam,
                    collection: question.collection,
                    year: question.year,
                    airtableTableName: question.airtable_table_name,
                    questionNo: question.question_no,
                    explanationEn: question.explanation_en,
                    explanationHi: question.explanation_hi,
                    pointCost: Number(question.point_cost ?? 0),
                    usageCount: Number(question.usage_count ?? 0),
                    isApproved: question.is_approved,
                    isGlobal: question.is_global,
                    folder: question.subject_name ? { name: question.subject_name } : null,
                    options: (optionsByQuestion[question.id] || []).map((option) => ({
                        id: option.id,
                        textEn: option.text_en,
                        textHi: option.text_hi,
                        isCorrect: option.is_correct,
                        sortOrder: Number(option.sort_order ?? 0),
                    })),
                })),
                total: Number(totalRows[0]?.count ?? 0),
            },
        });
    } catch (error) {
        next(error);
    }
});

app.get('/api/qbank/questions/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const rows = await prisma.$queryRawUnsafe<Array<any>>(`
            SELECT id, question_id, text_en, text_hi, explanation_en, explanation_hi, type, difficulty, subject_name, chapter_name, exam, collection, year, airtable_table_name, question_no, point_cost, usage_count, is_approved, is_global, created_at
            FROM questions
            WHERE id = ${sqlQuote(id)} OR question_id = ${sqlQuote(id)}
            LIMIT 1
        `);

        const question = rows[0];
        if (!question) {
            res.status(404).json({ success: false, message: 'Question not found' });
            return;
        }

        const options = await prisma.$queryRawUnsafe<Array<any>>(`
            SELECT id, text_en, text_hi, is_correct, sort_order
            FROM question_options
            WHERE question_id = ${sqlQuote(question.id)}
            ORDER BY sort_order ASC
        `);

        res.json({
            success: true,
            data: {
                id: question.id,
                questionId: question.question_id,
                textEn: question.text_en,
                textHi: question.text_hi,
                explanationEn: question.explanation_en,
                explanationHi: question.explanation_hi,
                type: String(question.type || '').toUpperCase(),
                difficulty: String(question.difficulty || '').toUpperCase(),
                chapter: question.chapter_name,
                exam: question.exam,
                collection: question.collection,
                year: question.year,
                pointCost: Number(question.point_cost ?? 0),
                usageCount: Number(question.usage_count ?? 0),
                isApproved: question.is_approved,
                isGlobal: question.is_global,
                folder: question.subject_name ? { name: question.subject_name } : null,
                options: options.map((option) => ({
                    id: option.id,
                    textEn: option.text_en,
                    textHi: option.text_hi,
                    isCorrect: option.is_correct,
                    sortOrder: Number(option.sort_order ?? 0),
                })),
            },
        });
    } catch (error) {
        next(error);
    }
});

app.get('/api/qbank/filter-options', async (_req, res, next) => {
    try {
        const rows = await prisma.$queryRawUnsafe<Array<any>>(`
            SELECT DISTINCT subject_name, chapter_name, exam, year, airtable_table_name
            FROM questions
        `);

        const uniqueStrings = (values: Array<string | null | undefined>) => [...new Set(values.filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b));
        const uniqueNumbers = (values: Array<number | string | null | undefined>) => [...new Set(values.filter((value) => value !== null && value !== undefined && value !== '').map((value) => Number(value)))].sort((a, b) => a - b);

        res.json({
            success: true,
            data: {
                subjects: uniqueStrings(rows.map((row) => row.subject_name)),
                chapters: uniqueStrings(rows.map((row) => row.chapter_name)),
                exams: uniqueStrings(rows.map((row) => row.exam)),
                years: uniqueNumbers(rows.map((row) => row.year)),
                sources: uniqueStrings(rows.map((row) => row.airtable_table_name)),
            },
        });
    } catch (error) {
        next(error);
    }
});

app.get('/api/qbank/sets', async (req, res, next) => {
    try {
        const page = Math.max(Number(req.query.page || 1), 1);
        const limit = Math.max(Number(req.query.limit || 50), 1);
        const offset = (page - 1) * limit;

        const [sets, totalRows] = await Promise.all([
            prisma.$queryRawUnsafe<Array<any>>(`
                SELECT id, set_id, pin, name, description, total_questions, subject, chapter, is_global, created_at
                FROM question_sets
                ORDER BY created_at DESC
                LIMIT ${limit}
                OFFSET ${offset}
            `),
            prisma.$queryRawUnsafe<Array<{ count: number | string }>>(`SELECT COUNT(*) AS count FROM question_sets`),
        ]);

        res.json({
            success: true,
            data: {
                sets: sets.map((set) => ({
                    id: set.id,
                    setId: set.set_id,
                    code: set.set_id,
                    pin: set.pin,
                    name: set.name,
                    description: set.description,
                    totalQuestions: Number(set.total_questions ?? 0),
                    subject: set.subject,
                    chapter: set.chapter,
                    isGlobal: set.is_global,
                    _count: { items: Number(set.total_questions ?? 0) },
                })),
                total: Number(totalRows[0]?.count ?? 0),
            },
        });
    } catch (error) {
        next(error);
    }
});

app.get('/api/qbank/sets/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const rows = await prisma.$queryRawUnsafe<Array<any>>(`
            SELECT id, set_id, pin, name, description, total_questions, subject, chapter, is_global, created_at
            FROM question_sets
            WHERE id = ${sqlQuote(id)} OR set_id = ${sqlQuote(id)}
            LIMIT 1
        `);
        const set = rows[0];

        if (!set) {
            res.status(404).json({ success: false, message: 'Set not found' });
            return;
        }

        const items = await prisma.$queryRawUnsafe<Array<any>>(`
            SELECT
                qsi.sort_order,
                q.id AS question_pk,
                q.question_id,
                q.text_en,
                q.text_hi,
                q.explanation_en,
                q.explanation_hi,
                q.type,
                q.difficulty,
                q.subject_name,
                q.chapter_name,
                q.point_cost,
                q.is_approved,
                q.is_global
            FROM question_set_items qsi
            INNER JOIN questions q ON q.id = qsi.question_id
            WHERE qsi.set_id = ${sqlQuote(set.id)}
            ORDER BY qsi.sort_order ASC
        `);

        const questionIds = items.map((item) => item.question_pk);
        const options = questionIds.length > 0
            ? await prisma.$queryRawUnsafe<Array<any>>(`
                SELECT id, question_id, text_en, text_hi, is_correct, sort_order
                FROM question_options
                WHERE question_id IN (${questionIds.map(sqlQuote).join(', ')})
                ORDER BY question_id ASC, sort_order ASC
            `)
            : [];

        const optionsByQuestion = options.reduce<Record<string, any[]>>((acc, option) => {
            acc[option.question_id] ??= [];
            acc[option.question_id].push(option);
            return acc;
        }, {});

        res.json({
            success: true,
            data: {
                id: set.id,
                setId: set.set_id,
                code: set.set_id,
                pin: set.pin,
                name: set.name,
                description: set.description,
                totalQuestions: Number(set.total_questions ?? 0),
                subject: set.subject,
                chapter: set.chapter,
                isGlobal: set.is_global,
                items: items.map((item) => ({
                    sortOrder: Number(item.sort_order ?? 0),
                    question: {
                        id: item.question_pk,
                        questionId: item.question_id,
                        textEn: item.text_en,
                        textHi: item.text_hi,
                        explanationEn: item.explanation_en,
                        explanationHi: item.explanation_hi,
                        type: String(item.type || '').toUpperCase(),
                        difficulty: String(item.difficulty || '').toUpperCase(),
                        subjectName: item.subject_name,
                        chapterName: item.chapter_name,
                        pointCost: Number(item.point_cost ?? 0),
                        isApproved: item.is_approved,
                        isGlobal: item.is_global,
                        options: (optionsByQuestion[item.question_pk] || []).map((option) => ({
                            id: option.id,
                            textEn: option.text_en,
                            textHi: option.text_hi,
                            isCorrect: option.is_correct,
                            sortOrder: Number(option.sort_order ?? 0),
                        })),
                    },
                })),
            },
        });
    } catch (error) {
        next(error);
    }
});

app.get('/api/qbank/airtable/tables', async (_req, res) => {
    try {
        const tables = await fetchAirtableTablesCompat();
        const metadataRows = await prisma.$queryRawUnsafe<Array<any>>(`
            SELECT table_name, total_questions, last_sync_at, status
            FROM airtable_sync_metadata
        `);
        const metadataByTable = metadataRows.reduce<Record<string, any>>((acc, row) => {
            acc[row.table_name] = row;
            return acc;
        }, {});

        res.json({
            success: true,
            data: tables.map((table) => ({
                id: table.id,
                name: table.name,
                lastSyncAt: metadataByTable[table.name]?.last_sync_at ?? null,
                totalQuestions: Number(metadataByTable[table.name]?.total_questions ?? 0),
                syncStatus: metadataByTable[table.name]?.status ?? 'NOT_SYNCED',
            })),
        });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message || 'Failed to fetch Airtable tables' });
    }
});

app.get('/api/qbank/airtable-folders', async (_req, res, next) => {
    try {
        const rows = await prisma.$queryRawUnsafe<Array<any>>(`
            SELECT id, name, slug, total_questions, created_at, updated_at
            FROM airtable_sync_folders
            ORDER BY updated_at DESC, created_at DESC
        `);

        const metadataRows = await prisma.$queryRawUnsafe<Array<any>>(`
            SELECT table_name, total_questions, last_sync_at
            FROM airtable_sync_metadata
        `);
        const metadataByTable = metadataRows.reduce<Record<string, any>>((acc, row) => {
            acc[row.table_name] = row;
            return acc;
        }, {});

        res.json({
            success: true,
            data: rows.map((row) => ({
                id: row.id,
                name: row.name,
                slug: row.slug,
                totalQuestions: Number(metadataByTable[row.slug]?.total_questions ?? row.total_questions ?? 0),
                updatedAt: metadataByTable[row.slug]?.last_sync_at ?? row.updated_at,
            })),
        });
    } catch (error) {
        next(error);
    }
});

app.post('/api/qbank/airtable-folders', async (req, res, next) => {
    try {
        const name = String(req.body?.name || '').trim();
        const airtableTableName = String(req.body?.airtableTableName || '').trim();
        if (!name || !airtableTableName) {
            res.status(400).json({ success: false, message: 'Both name and airtableTableName are required' });
            return;
        }

        const existingRows = await prisma.$queryRawUnsafe<Array<{ id: string }>>(`
            SELECT id FROM airtable_sync_folders WHERE slug = ${sqlQuote(airtableTableName)} LIMIT 1
        `);
        if (existingRows[0]) {
            res.status(409).json({ success: false, message: 'This Airtable table is already added' });
            return;
        }

        const id = createCompatId('airtable-folder');
        await prisma.$executeRawUnsafe(`
            INSERT INTO airtable_sync_folders (id, name, slug, total_questions, created_at, updated_at)
            VALUES (${sqlQuote(id)}, ${sqlQuote(name)}, ${sqlQuote(airtableTableName)}, 0, NOW(), NOW())
        `);

        res.status(201).json({
            success: true,
            data: {
                id,
                name,
                slug: airtableTableName,
                totalQuestions: 0,
                updatedAt: new Date().toISOString(),
            },
        });
    } catch (error) {
        next(error);
    }
});

app.patch('/api/qbank/airtable-folders/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const name = String(req.body?.name || '').trim();
        if (!name) {
            res.status(400).json({ success: false, message: 'Name is required' });
            return;
        }

        await prisma.$executeRawUnsafe(`
            UPDATE airtable_sync_folders
            SET name = ${sqlQuote(name)}, updated_at = NOW()
            WHERE id = ${sqlQuote(id)}
        `);

        res.json({ success: true, data: { id, name }, message: 'Folder renamed successfully' });
    } catch (error) {
        next(error);
    }
});

app.delete('/api/qbank/airtable-folders/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const rows = await prisma.$queryRawUnsafe<Array<{ slug: string }>>(`
            SELECT slug FROM airtable_sync_folders WHERE id = ${sqlQuote(id)} LIMIT 1
        `);
        const folder = rows[0];

        if (!folder) {
            res.status(404).json({ success: false, message: 'Folder not found' });
            return;
        }

        await prisma.$executeRawUnsafe(`DELETE FROM question_options WHERE question_id IN (SELECT id FROM questions WHERE airtable_table_name = ${sqlQuote(folder.slug)})`);
        await prisma.$executeRawUnsafe(`DELETE FROM question_set_items WHERE question_id IN (SELECT id FROM questions WHERE airtable_table_name = ${sqlQuote(folder.slug)})`);
        await prisma.$executeRawUnsafe(`DELETE FROM questions WHERE airtable_table_name = ${sqlQuote(folder.slug)}`);
        await prisma.$executeRawUnsafe(`DELETE FROM airtable_sync_metadata WHERE table_name = ${sqlQuote(folder.slug)}`);
        await prisma.$executeRawUnsafe(`DELETE FROM airtable_sync_folders WHERE id = ${sqlQuote(id)}`);

        res.json({ success: true, message: 'Airtable sync folder and local questions removed successfully' });
    } catch (error) {
        next(error);
    }
});

app.post('/api/qbank/sync-airtable', async (req, res) => {
    try {
        const tableName = String(req.body?.tableName || '').trim();
        if (!tableName) {
            res.status(400).json({ success: false, message: 'Table name is required' });
            return;
        }

        const result = await syncAirtableTableCompat(tableName);
        await ensureCompatibilitySetsFromQuestions();
        res.json({ success: true, message: 'Airtable synchronization completed', data: result });
    } catch (error: any) {
        logger.error('Airtable sync compatibility error:', error);
        res.status(400).json({ success: false, message: error.message || 'Airtable synchronization failed' });
    }
});

// ─── API Routes ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/whiteboard', whiteboardRoutes);
app.use('/api/whiteboard-accounts', whiteboardAccountRoutes);

// ─── Error Handling ──────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────
async function startServer() {
    try {
        // Connect to Redis (optional in development)
        try {
            await connectRedis();
            logger.info('✅ Redis connected');
        } catch (redisErr) {
            if (env.NODE_ENV === 'production') {
                throw redisErr; // fatal in production
            }
            logger.warn('⚠️  Redis not available — running without cache/queues (dev mode only)');
        }

        // Verify DB
        await prisma.$connect();
        logger.info('✅ PostgreSQL connected');
        await ensureQuestionBankCompatibilityData();
        await ensureCompatibilitySetsFromQuestions();
        logger.info('✅ Question-bank compatibility tables ready');

        const port = env.PORT;
        app.listen(port, () => {
            logger.info(`🚀 EduHub Backend running on port ${port}`);
            logger.info(`   Environment: ${env.NODE_ENV}`);
            logger.info(`   Health: http://localhost:${port}/health`);
        });
    } catch (error) {
        logger.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received — shutting down gracefully');
    await prisma.$disconnect();
    process.exit(0);
});

startServer();

export default app;
