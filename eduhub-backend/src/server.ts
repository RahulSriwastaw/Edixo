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
import organizationsRoutes from './modules/organizations/organizations.routes';
import orgAdminRoutes from './modules/orgAdmin/orgAdmin.routes';
import studentsRoutes from './modules/students/students.routes';
import staffRoutes from './modules/staff/staff.routes';
import batchesRoutes from './modules/batches/batches.routes';
import qbankRoutes from './modules/qbank/qbank.routes';
import testsRoutes from './modules/tests/tests.routes';
import attendanceRoutes from './modules/attendance/attendance.routes';
import feesRoutes from './modules/fees/fees.routes';
import uploadRoutes from './modules/upload/upload.routes';
import notificationsRoutes from './modules/notifications/notifications.routes';
import mockbookRoutes from './modules/mockbook/mockbook.routes';
import blogRoutes from './modules/blog/blog.routes';

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

// CORS
const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map(o => o.trim());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS: ${origin} not allowed`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Org-View-Id', 'X-Org-Id'],
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
      req.path.startsWith('/organizations/public/') ||
      (req.path === '/auth/me' && req.method === 'GET'),
    message: { success: false, message: 'Too many requests — please try again later.' },
});
app.use('/api/', limiter);

// Body Parsing
app.use(express.json({ limit: '10mb' }));
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

// ─── API Routes ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/organizations', organizationsRoutes);
app.use('/api/org-admin', orgAdminRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/batches', batchesRoutes);
app.use('/api/qbank', qbankRoutes);
app.use('/api/tests', testsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/fees', feesRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/mockbook', mockbookRoutes);
app.use('/api/blog', blogRoutes);

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
