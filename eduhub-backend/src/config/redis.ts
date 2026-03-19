import Redis from 'ioredis';
import { env } from './env';


export let redis: Redis;

export async function connectRedis(): Promise<void> {
    return new Promise((resolve, reject) => {
        const isTls = env.REDIS_URL.startsWith('rediss://');

        const client = new Redis(env.REDIS_URL, {
            retryStrategy: () => null, // don't retry — fail fast
            maxRetriesPerRequest: 1,
            lazyConnect: true,
            connectTimeout: 10000, // 10s for remote connections
            ...(isTls && {
                tls: {
                    rejectUnauthorized: false, // required for Upstash
                },
            }),
        });

        client.once('ready', () => {
            redis = client;
            resolve();
        });

        client.once('error', (err) => {
            client.disconnect();
            reject(err);
        });

        client.connect().catch(reject);
    });
}

// Helper utilities
export const redisKeys = {
    tokenBlacklist: (token: string) => `blacklist:${token}`,
    loginAttempts: (email: string) => `login_attempts:${email}`,
    orgViewToken: (userId: string) => `org_view:${userId}`,
    testAttemptState: (attemptId: string) => `attempt:${attemptId}`,
    featureFlags: (orgId: string) => `feature_flags:${orgId}`,
    orgData: (orgId: string) => `org:${orgId}`,
    userSession: (userId: string) => `session:${userId}`,
};

// Safe Redis get/set that silently skips if Redis unavailable
export async function safeRedisGet(key: string): Promise<string | null> {
    if (!redis) return null;
    try { return await redis.get(key); } catch { return null; }
}
export async function safeRedisSet(key: string, value: string, ttl?: number): Promise<void> {
    if (!redis) return;
    try {
        if (ttl) await redis.setex(key, ttl, value);
        else await redis.set(key, value);
    } catch { /* noop */ }
}
