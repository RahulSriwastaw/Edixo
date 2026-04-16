import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import path from 'path';

import { env } from './config/env';
import { logger } from './config/logger';
import { connectRedis } from './config/redis';
import { prisma } from './config/database';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import superAdminRoutes from './modules/superAdmin/superAdmin.routes';
import whiteboardRoutes from './modules/whiteboard/whiteboard.routes';
import whiteboardAccountRoutes from './modules/whiteboardAccount/whiteboardAccount.routes';
import uploadRoutes from './modules/upload/upload.routes';
import aiRoutes from './modules/ai/ai.routes';
import mockbookRoutes from './modules/mockbook/mockbook.routes';
import studentsRoutes from './modules/students/students.routes';
import qbankRoutes from './modules/qbank/qbank.routes';

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

function sixDigitPin() {
    return String(100000 + Math.floor(Math.random() * 900000));
}

function stableHash(input: string) {
    let hash = 0;
    for (let i = 0; i < input.length; i += 1) {
        hash = ((hash << 5) - hash) + input.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
}

async function generateUniqueSixDigitSetId(seed: string, excludeSetPrimaryId?: string) {
    const base = stableHash(seed);

    for (let attempt = 0; attempt < 300; attempt += 1) {
        const candidate = String(100000 + ((base + attempt * 9973) % 900000));
        const rows = await prisma.$queryRawUnsafe<Array<{ id: string }>>(
            `SELECT id FROM question_sets WHERE set_id = ${sqlQuote(candidate)} LIMIT 1`
        );

        if (!rows[0] || rows[0].id === excludeSetPrimaryId) {
            return candidate;
        }
    }

    throw new Error('Failed to generate unique 6-digit setId');
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

    function deterministicSixDigit(str: string, offset = 0): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i) + offset;
            hash |= 0;
        }
        const abs = Math.abs(hash);
        return String(100000 + (abs % 900000));
    }

    for (const row of sourceRows) {
        const source = row.source || 'General';
        const total = Number(row.total || 0);
        if (total <= 0) continue;

        const slug = slugify(source);
        const setPrimaryId = `compat-set-${slug}`;
        const setCode = deterministicSixDigit(slug, 0);
        const setPin = deterministicSixDigit(slug, 42);
        const setName = `${source} Auto Set`;
        const setDescription = `Auto-generated compatibility set for ${source} questions.`;

        await prisma.$executeRawUnsafe(`
            INSERT INTO question_sets (id, set_id, pin, name, description, total_questions, subject, chapter, is_global, created_at)
            VALUES (
                ${sqlQuote(setPrimaryId)},
                ${sqlQuote(setCode)},
                ${sqlQuote(setPin)},
                ${sqlQuote(setName)},
                ${sqlQuote(setDescription)},
                ${total},
                ${sqlQuote(source)},
                NULL,
                TRUE,
                NOW()
            )
            ON CONFLICT (id) DO UPDATE SET
                set_id = EXCLUDED.set_id,
                pin = CASE WHEN question_sets.pin ~ '^[0-9]{6}$' THEN question_sets.pin ELSE EXCLUDED.pin END,
                total_questions = EXCLUDED.total_questions,
                name = EXCLUDED.name,
                description = EXCLUDED.description,
                subject = EXCLUDED.subject
        `);

        await prisma.$executeRawUnsafe(`DELETE FROM question_set_items WHERE set_id = ${sqlQuote(setPrimaryId)}`);

        await prisma.$executeRawUnsafe(`
            INSERT INTO question_set_items (set_id, question_id, sort_order)
            SELECT set_id, question_id, sort_order FROM (
                SELECT
                    ${sqlQuote(setPrimaryId)} AS set_id,
                    id AS question_id,
                    ROW_NUMBER() OVER (ORDER BY created_at DESC) AS sort_order
                FROM questions
                WHERE COALESCE(NULLIF(airtable_table_name, ''), NULLIF(subject_name, ''), 'General') = ${sqlQuote(source)}
                ORDER BY created_at DESC
                LIMIT 100
            ) sub
            ON CONFLICT (set_id, question_id) DO UPDATE SET sort_order = EXCLUDED.sort_order
        `);
    }
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

// Global Middleware
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
        if (!origin || staticOrigins.includes(origin) || staticOrigins.includes('*')) {
            return callback(null, true);
        }

        const isPlatformSubdomain = staticOrigins.some(so => {
            try {
                const soUrl = new URL(so);
                const originUrl = new URL(origin);
                return originUrl.hostname.endsWith(soUrl.hostname);
            } catch {
                return false;
            }
        });

        if (isPlatformSubdomain) {
            return callback(null, true);
        }

        logger.warn('CORS blocked for origin: ' + origin + '. Add it to ALLOWED_ORIGINS to allow access.');
        callback(new Error('CORS: ' + origin + ' not allowed'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control', 'Pragma'],
}));

// Rate Limiter
const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.NODE_ENV === 'development' ? 100000 : env.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) =>
        env.NODE_ENV === 'development' ||
        (req.path === '/auth/me' && req.method === 'GET'),
    message: { success: false, message: 'Too many requests please try again later.' },
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

// Health Check
app.get('/health', async (_req, res) => {
    try {
        await prisma.$queryRawUnsafe('SELECT 1');
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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/whiteboard', whiteboardRoutes);
app.use('/api/whiteboard-accounts', whiteboardAccountRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/mockbook', mockbookRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/qbank', qbankRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

// Start Server
async function startServer() {
    try {
        try {
            await connectRedis();
            logger.info('Redis connected');
        } catch (redisErr) {
            if (env.NODE_ENV === 'production') throw redisErr;
            logger.warn('Redis not available - running without cache/queues (dev mode only)');
        }

        try {
            await prisma.$connect();
            logger.info('PostgreSQL connected');
            try {
                await ensureQuestionBankCompatibilityData();
                await ensureCompatibilitySetsFromQuestions();
                logger.info('Question-bank compatibility checks complete');
            } catch (compatErr) {
                logger.error('Non-critical compatibility check failed:', compatErr);
            }
        } catch (dbErr) {
            if (env.NODE_ENV === 'production') throw dbErr;
            logger.warn('Database connection failed - server will start without initial compatibility checks (dev mode).');
        }

        const port = env.PORT;
        app.listen(port, () => {
            logger.info('EduHub Backend running on port ' + port);
            logger.info('   Environment: ' + env.NODE_ENV);
            logger.info('   Health: http://localhost:' + port + '/health');
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.info('SIGTERM received - shutting down gracefully');
    await prisma.$disconnect();
    process.exit(0);
});

startServer();

export default app;
