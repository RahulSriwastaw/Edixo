import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
    NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
    PORT: z.coerce.number().default(4000),

    // Database
    DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

    // Redis
    REDIS_URL: z.string().min(1, 'REDIS_URL is required'),

    // JWT
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 chars'),
    JWT_SUPER_ADMIN_SECRET: z.string().min(32, 'JWT_SUPER_ADMIN_SECRET must be at least 32 chars'),
    JWT_EXPIRES_IN: z.string().default('7d'),
    JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

    // AWS
    AWS_REGION: z.string().default('ap-south-1'),
    AWS_ACCESS_KEY_ID: z.string().optional(),
    AWS_SECRET_ACCESS_KEY: z.string().optional(),
    AWS_S3_ASSETS_BUCKET: z.string().default('eduhub-assets-prod'),
    AWS_S3_PDFS_BUCKET: z.string().default('eduhub-pdfs-prod'),
    AWS_S3_RECEIPTS_BUCKET: z.string().default('eduhub-receipts-prod'),
    AWS_S3_EXPORTS_BUCKET: z.string().default('eduhub-exports-prod'),
    AWS_CLOUDFRONT_DOMAIN: z.string().optional(),
    AWS_SES_FROM_EMAIL: z.string().email().optional(),
    AWS_SES_REGION: z.string().default('ap-south-1'),

    // OpenAI
    OPENAI_API_KEY: z.string().optional(),
    OPENAI_MODEL: z.string().default('gpt-4o'),

    // WhatsApp
    WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
    WHATSAPP_ACCESS_TOKEN: z.string().optional(),

    // SMS
    MSG91_API_KEY: z.string().optional(),
    MSG91_SENDER_ID: z.string().default('EDUHUB'),

    // Razorpay
    RAZORPAY_KEY_ID: z.string().optional(),
    RAZORPAY_KEY_SECRET: z.string().optional(),

    // FCM
    FCM_SERVER_KEY: z.string().optional(),

    // Whiteboard / Sync
    WS_WHITEBOARD_URL: z.string().default('ws://localhost:5000/api/whiteboard/sync'),

    // CORS
    ALLOWED_ORIGINS: z.string().default('http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:3004,http://127.0.0.1:3000,http://127.0.0.1:3001,http://127.0.0.1:3002,http://127.0.0.1:3003,http://127.0.0.1:3004'),

    // Rate limiting
    RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
    RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

    // Airtable (Source of Truth for QBank)
    AIRTABLE_API_KEY: z.string().optional(),
    AIRTABLE_BASE_ID: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.format());
    process.exit(1);
}

export const env = parsed.data;
export type Env = typeof env;
