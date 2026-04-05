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
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);

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

    const questionCountRows = await prisma.$queryRawUnsafe<Array<{ count: number | string }>>(
        `SELECT COUNT(*) AS count FROM questions`
    );
    const questionCount = Number(questionCountRows[0]?.count ?? 0);

    if (questionCount > 0) return;

    await prisma.$executeRawUnsafe(`
        INSERT INTO questions (id, question_id, text_en, text_hi, type, difficulty, subject_name, chapter_name, point_cost, usage_count, is_approved, is_global)
        VALUES
        ('q-1001', 'Q-1001', 'What is the sum of 12 + 15?', '12 aur 15 ka jod kya hai?', 'mcq', 'easy', 'Mathematics', 'Arithmetic', 5, 12, TRUE, TRUE),
        ('q-1002', 'Q-1002', 'Identify the verb in the sentence "She runs fast".', 'Vakya "She runs fast" mein kriya pehchaniye.', 'mcq', 'medium', 'English', 'Grammar', 5, 8, TRUE, TRUE)
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
        const search = String(req.query.search || '').trim();
        const difficulty = String(req.query.difficulty || '').trim().toLowerCase();
        const type = String(req.query.type || '').trim().toLowerCase();
        const page = Math.max(Number(req.query.page || 1), 1);
        const limit = Math.max(Number(req.query.limit || 10), 1);
        const offset = (page - 1) * limit;

        const conditions: string[] = [];
        if (search) {
            const safeSearch = search.replace(/'/g, "''");
            conditions.push(`(text_en ILIKE '%${safeSearch}%' OR COALESCE(text_hi, '') ILIKE '%${safeSearch}%')`);
        }
        if (difficulty && difficulty !== 'all') conditions.push(`LOWER(difficulty) = ${sqlQuote(difficulty)}`);
        if (type && type !== 'all') conditions.push(`LOWER(type) = ${sqlQuote(type)}`);

        const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const questions = await prisma.$queryRawUnsafe<Array<any>>(`
            SELECT id, question_id, text_en, text_hi, type, difficulty, subject_name, chapter_name, point_cost, usage_count, is_approved, is_global, created_at
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
