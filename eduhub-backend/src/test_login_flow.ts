import { prisma } from './config/database';
import { safeRedisGet, connectRedis } from './config/redis';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from './config/env';

async function test() {
    try {
        console.log("1. Connecting to Redis...");
        try {
            await connectRedis();
            console.log("✅ Redis connected");
        } catch (e) {
            console.log("⚠️ Redis connection failed (expected in some envs)");
        }

        console.log("2. Connecting to Prisma...");
        await prisma.$connect();
        console.log("✅ Prisma connected");

        const body = {
            email: "rahulcodes88@gmail.com",
            password: "password",
            role: "STUDENT",
            orgId: "GK-ORG-00001"
        };

        const attemptsKey = `login_attempts:${body.email}`;
        console.log("3. Checking Redis attempts...");
        const attemptsStr = await safeRedisGet(attemptsKey);
        console.log(`✅ Attempts check done: ${attemptsStr}`);

        console.log("4. Finding Org...");
        const org = await prisma.organization.findUnique({
            where: { orgId: body.orgId },
            select: { id: true }
        });
        console.log(`✅ Org result: ${org ? 'Found' : 'Not Found'}`);

        if (org) {
            console.log("5. Finding Student...");
            const student = await prisma.student.findFirst({
                where: {
                    email: body.email,
                    orgId: org.id,
                },
                include: { user: true }
            });
            console.log(`✅ Student result: ${student ? 'Found' : 'Not Found'}`);

            if (student && student.user) {
                console.log("6. Comparing Password...");
                const valid = await bcrypt.compare(body.password, student.user.passwordHash);
                console.log(`✅ Password comparison: ${valid}`);
            }
        }

        console.log("🚀 ALL STEPS COMPLETED");

    } catch (err) {
        console.error("❌ Test failed:", err);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

test();
