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

app.get('/api/qbank/dashboard', (_req, res) => {
    res.json({
        success: true,
        data: {
            totalQuestions: 0,
            newQuestions: 0,
            publicQuestions: 0,
            newPublic: 0,
            totalSets: 0,
            newSets: 0,
            totalPoints: 0,
            newPoints: 0,
            bySubject: [],
            usageTrend: [],
            recentUsage: [],
        },
    });
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
