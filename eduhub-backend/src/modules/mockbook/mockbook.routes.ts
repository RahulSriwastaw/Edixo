import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { authenticate, optionalAuthenticate } from '../../middleware/auth';
import { randomBytes } from 'crypto';

const router = Router();
router.use(optionalAuthenticate);


// ─── Exam Folders (Categories: SSC, Railway, etc.) ────────────


router.get('/folders', async (req, res, next) => {
    try {
        const folders = await prisma.examFolder.findMany({
            orderBy: { sortOrder: 'asc' },
        });
        res.json({ success: true, data: folders });
    } catch (err) { 
        console.error("Error in /folders:", err);
        next(err); 
    }
});

router.post('/folders', async (req, res, next) => {
    try {
        const schema = z.object({
            name: z.string().min(1),
            description: z.string().optional(),
            icon: z.string().optional(),
            color: z.string().optional(),
            isFeatured: z.boolean().default(false),
            sortOrder: z.number().default(0),
        });
        const body = schema.parse(req.body);

        const folder = await prisma.examFolder.create({ 
            data: { 
                ...body, 
            } 
        });
        res.status(201).json({ success: true, data: folder });
    } catch (err: any) { next(err); }
});

router.patch('/folders/:id', async (req, res, next) => {
    try {
        const folder = await prisma.examFolder.update({
            where: { id: req.params.id },
            data: {
                name: req.body.name,
                description: req.body.description,
                icon: req.body.icon,
                color: req.body.color,
                isFeatured: req.body.isFeatured,
            }
        });
        res.json({ success: true, data: folder });
    } catch (err: any) { next(err); }
});

router.delete('/folders/:id', async (req, res, next) => {
    try {
        const folderId = req.params.id;

        // Verify folder exists
        const folder = await prisma.examFolder.findUnique({ where: { id: folderId } });
        if (!folder) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        // Get all exam categories (series) inside this folder
        const categories = await prisma.examCategory.findMany({
            where: { folderId },
            select: { id: true }
        });
        const categoryIds = categories.map((c: any) => c.id);

        // Get all subcategories inside those categories
        const subCategoryIds = categoryIds.length > 0
            ? (await prisma.examSubCategory.findMany({
                where: { categoryId: { in: categoryIds } },
                select: { id: true }
            })).map((s: any) => s.id)
            : [];

        if (subCategoryIds.length > 0) {
            // Get mock test IDs in these subcategories
            const mockTests = await prisma.mockTest.findMany({
                where: { subCategoryId: { in: subCategoryIds } },
                select: { id: true }
            });
            const mockTestIds = mockTests.map((t: any) => t.id);

            if (mockTestIds.length > 0) {
                // Delete attempt answers first
                await prisma.attemptAnswer.deleteMany({
                    where: { attempt: { testId: { in: mockTestIds } } }
                });
                // Delete test attempts
                await prisma.testAttempt.deleteMany({
                    where: { testId: { in: mockTestIds } }
                });
                // Delete mock test sections (also auto-cascade but explicit is safer)
                await prisma.mockTestSection.deleteMany({
                    where: { testId: { in: mockTestIds } }
                });
                // Delete mock test batches
                await prisma.mockTestBatch.deleteMany({
                    where: { testId: { in: mockTestIds } }
                });
                // Delete mock tests
                await prisma.mockTest.deleteMany({
                    where: { id: { in: mockTestIds } }
                });
            }

            // Delete subcategories
            await prisma.examSubCategory.deleteMany({
                where: { categoryId: { in: categoryIds } }
            });
        }

        // Delete exam categories (series)
        if (categoryIds.length > 0) {
            await prisma.examCategory.deleteMany({ where: { folderId } });
        }

        // Finally delete the folder
        await prisma.examFolder.delete({ where: { id: folderId } });

        res.json({ success: true, message: 'Category deleted successfully' });
    } catch (err: any) { next(err); }
});

// ─── Exam Categories (Test Series: SSC CGL 2026, etc.) ────────
router.get('/categories', async (req, res, next) => {
    try {
        const { folderId } = req.query;

        const where: any = {};
        if (folderId) where.folderId = folderId as string;

        const categories = await prisma.examCategory.findMany({
            where,
            orderBy: { sortOrder: 'asc' },
        });
        res.json({ success: true, data: categories });
    } catch (err: any) { next(err); }
});

router.get('/categories/:id', async (req, res, next) => {
    try {
        const category = await prisma.examCategory.findUnique({
            where: { id: req.params.id },
            include: {
                subCategories: {
                    include: {
                        mockTests: true
                    },
                    orderBy: { sortOrder: 'asc' }
                }
            }
        });
        if (!category) return res.status(404).json({ success: false, message: 'Series not found' });

        let submittedAttempts: any[] = [];
        let inProgressAttempts: any[] = [];
        const user = (req as any).user;
        if (user?.id || user?.userId) {
            const userId = user.id || user.userId;
            const student = await prisma.student.findFirst({ where: { userId: userId as string } });
            if (student) {
                const allAttempts = await prisma.testAttempt.findMany({
                    where: { studentId: student.id, status: { in: ['SUBMITTED', 'IN_PROGRESS'] } },
                    select: { testId: true, status: true }
                });
                
                allAttempts.forEach(a => {
                    if (a.status === 'SUBMITTED') submittedAttempts.push(a);
                    else if (a.status === 'IN_PROGRESS') inProgressAttempts.push(a);
                });
            }
        }

        const attemptMap = submittedAttempts.reduce<Record<string, number>>((acc, curr) => {
            acc[curr.testId] = (acc[curr.testId] || 0) + 1;
            return acc;
        }, {});

        const inProgressMap = inProgressAttempts.reduce<Record<string, number>>((acc, curr) => {
            acc[curr.testId] = (acc[curr.testId] || 0) + 1;
            return acc;
        }, {});

        const formattedCategory = {
            ...category,
            subCategories: category.subCategories.map(sc => ({
                ...sc,
                mockTests: sc.mockTests.map((test: any) => ({
                    ...test,
                    attempts: attemptMap[test.id] || attemptMap[test.testId] || 0,
                    inProgressAttempts: inProgressMap[test.id] || inProgressMap[test.testId] || 0
                }))
            }))
        };

        res.json({ success: true, data: formattedCategory });
    } catch (err: any) { next(err); }
});

router.post('/categories', async (req, res, next) => {
    try {
        const schema = z.object({
            folderId: z.string().min(1),
            name: z.string().min(1),
            description: z.string().optional(),
            icon: z.string().optional(),
            isFeatured: z.boolean().default(false),
            isFree: z.boolean().default(true),
            price: z.number().optional().nullable(),
            discountPrice: z.number().optional().nullable(),
            sortOrder: z.number().default(0),
        });
        const body = schema.parse(req.body);

        const category = await prisma.examCategory.create({ 
            data: { 
                ...body, 
            } 
        });
        res.status(201).json({ success: true, data: category });
    } catch (err: any) { next(err); }
});

router.patch('/categories/:id', async (req, res, next) => {
    try {
        const category = await prisma.examCategory.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json({ success: true, data: category });
    } catch (err: any) { next(err); }
});

router.delete('/categories/:id', async (req, res, next) => {
    try {
        await prisma.examCategory.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Series deleted' });
    } catch (err: any) { next(err); }
});

// ─── Exam SubCategories (Test Folders: Tier 1, Sectional, etc.)
router.get('/subcategories', async (req, res, next) => {
    try {
        const { categoryId, parentId } = req.query;
        const whereClause: any = {
            categoryId: categoryId ? (categoryId as string) : undefined,
            parentId: parentId ? (parentId as string) : (parentId === null ? null : undefined),
        };

        const subCategories = await prisma.examSubCategory.findMany({
            where: whereClause,
            orderBy: { sortOrder: 'asc' },
        });
        res.json({ success: true, data: subCategories });
    } catch (err: any) { next(err); }
});

router.post('/subcategories', async (req, res, next) => {
    try {
        const schema = z.object({
            categoryId: z.string().min(1),
            parentId: z.string().optional().nullable(),
            name: z.string().min(1),
            description: z.string().optional(),
            sortOrder: z.number().default(0),
        });
        const body = schema.parse(req.body);

        const subCategory = await prisma.examSubCategory.create({ 
            data: { 
                ...body, 
            } 
        });
        res.status(201).json({ success: true, data: subCategory });
    } catch (err: any) { next(err); }
});

router.patch('/subcategories/:id', async (req, res, next) => {
    try {
        const subCategory = await prisma.examSubCategory.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json({ success: true, data: subCategory });
    } catch (err: any) { next(err); }
});

router.delete('/subcategories/:id', async (req, res, next) => {
    try {
        await prisma.examSubCategory.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Folder deleted' });
    } catch (err: any) { next(err); }
});

// ─── Exam Folders (PATCH/DELETE) ───────────────────────────
router.patch('/folders/:id', async (req, res, next) => {
    try {
        const folder = await prisma.examFolder.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json({ success: true, data: folder });
    } catch (err: any) { next(err); }
});

router.delete('/folders/:id', async (req, res, next) => {
    try {
        await prisma.examFolder.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Category deleted' });
    } catch (err: any) { next(err); }
});

// ─── Public mock tests (MockVeda) ─────────────────────────────
router.get('/public', async (req, res, next) => {
    try {
        const where: any = { isPublic: true, status: 'LIVE' };

        const tests = await prisma.mockTest.findMany({
            where,
            select: { id: true, testId: true, name: true, description: true, durationMins: true, scheduledAt: true, endsAt: true },
            orderBy: { scheduledAt: 'desc' },
            take: 50,
        });
        res.json({ success: true, data: tests });
    } catch (err) { 
        console.error("Error in /public route:", err);
        next(err); 
    }
});

// Leaderboard for a test
router.get('/:testId/leaderboard', async (req, res, next) => {
    try {
        const top100 = await prisma.testAttempt.findMany({
            where: { test: { testId: req.params.testId }, status: 'SUBMITTED' },
            orderBy: { score: 'desc' },
            take: 100,
            include: { student: { select: { name: true, studentId: true } } },
        });
        res.json({ success: true, data: top100 });
    } catch (err: any) { next(err); }
});

// ─── Analytics ────────────────────────────────────────────────


// ─── Student Test Flow ─────────────────────────────────────────

// GET /mockbook/tests/:testId — fetch test meta info
router.get('/tests/:testId', async (req, res, next) => {
    try {
        const test = await prisma.mockTest.findFirst({
            where: { OR: [{ testId: req.params.testId }, { id: req.params.testId }] },
            include: {
                sections: {
                    include: { set: { select: { name: true } } },
                    orderBy: { sortOrder: 'asc' },
                }
            }
        });
        if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
        res.json({ success: true, data: test });
    } catch (err: any) { next(err); }
});

// GET /mockbook/tests/:testId/questions — get shuffled/ordered questions for the test
router.get('/tests/:testId/questions', async (req, res, next) => {
    try {
        const test = await prisma.mockTest.findFirst({
            where: { OR: [{ testId: req.params.testId }, { id: req.params.testId }] },
            include: {
                sections: {
                    orderBy: { sortOrder: 'asc' },
                    include: {
                        set: {
                            include: {
                                question_set_items: {
                                    orderBy: { sort_order: 'asc' },
                                    include: {
                                        questions: {
                                            include: {
                                                question_options: { orderBy: { sort_order: 'asc' } }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

        const questionsList: any[] = [];
        let qNumber = 1;
        for (const section of (test as any).sections) {
            const items = (section.set as any)?.question_set_items || [];
            for (const item of items) {
                const q = item.questions;
                if (!q) continue;
                questionsList.push({
                    id: q.id,
                    questionId: q.question_id,
                    number: qNumber++,
                    section: (section.set as any)?.name || section.name,
                    text: q.text_en || q.text_hi || '',
                    textHi: q.text_hi,
                    type: q.type,
                    options: (q.question_options || []).map((o: any) => ({
                        id: o.id,
                        text: o.text_en || o.text_hi || '',
                        textHi: o.text_hi,
                        isCorrect: false, // Never send correct answer to client
                    })),
                    marks: 1, // Default; TODO: per-section marks
                    negative: -0.33,
                    imageUrl: q.image_url,
                });
            }
        }

        // Shuffle if test.shuffleQuestions
        if (test.shuffleQuestions) {
            for (let i = questionsList.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [questionsList[i], questionsList[j]] = [questionsList[j], questionsList[i]];
            }
        }

        res.json({
            success: true,
            data: {
                testId: test.testId,
                name: test.name,
                durationMins: test.durationMins,
                totalMarks: test.totalMarks,
                questions: questionsList,
            }
        });
    } catch (err: any) { next(err); }
});

// GET /mockbook/tests/:testId/my-attempts — list all attempts by this student for a test
router.get('/tests/:testId/my-attempts', authenticate, async (req, res, next) => {
    try {
        const user = (req as any).user;
        const testIdParam = req.params.testId as string;
        const test = await prisma.mockTest.findFirst({ where: { OR: [{ testId: testIdParam }, { id: testIdParam }] } });
        if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

        const userId = user.userId || user.id;
        const student = await prisma.student.findFirst({ where: { userId: userId as string } });
        if (!student) return res.status(403).json({ success: false, message: 'Not a student' });

        const attempts = await prisma.testAttempt.findMany({
            where: { testId: test.id, studentId: student.id },
            orderBy: { createdAt: 'asc' },
            select: { id: true, status: true, score: true, totalMarks: true, rank: true, submittedAt: true, createdAt: true }
        });

        const result = attempts.map((a: any, idx: number) => ({ ...a, attemptNumber: idx + 1 }));
        return res.json({ success: true, data: result });
    } catch (err: any) { next(err); }
});

// POST /mockbook/tests/:testId/attempts — start or submit an attempt
router.post('/tests/:testId/attempts', authenticate, async (req, res, next) => {
    try {
        const user = (req as any).user;
        const { action, answers, timeTakenSecs } = req.body; // action: 'start' | 'submit'

        const testIdParam = req.params.testId as string;
        const test = await prisma.mockTest.findFirst({ where: { OR: [{ testId: testIdParam }, { id: testIdParam }] } });
        if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

        const userId = user.userId || user.id;
        const student = await prisma.student.findFirst({ where: { userId: userId as string } });
        if (!student) return res.status(403).json({ success: false, message: 'Student profile not found. Please register as a student.' });

        if (action === 'start') {
            // Check if an IN_PROGRESS attempt already exists — resume it
            const existing = await prisma.testAttempt.findFirst({
                where: { testId: test.id, studentId: student.id, status: 'IN_PROGRESS' }
            });
            if (existing) return res.json({ success: true, data: existing });

            const attempt = await prisma.testAttempt.create({
                data: {
                    testId: test.id,
                    studentId: student.id,
                    status: 'IN_PROGRESS',
                    totalMarks: test.totalMarks,
                }
            });
            return res.status(201).json({ success: true, data: attempt });
        }

        if (action === 'submit') {
            const attempt = await prisma.testAttempt.findFirst({
                where: { testId: test.id, studentId: student.id, status: 'IN_PROGRESS' }
            });
            if (!attempt) return res.status(404).json({ success: false, message: 'No active attempt found' });

            let score = 0;
            const savedAnswers: any[] = [];

            if (answers && Array.isArray(answers)) {
                for (const ans of answers as any[]) {
                    const correctOptions = await prisma.question_options.findMany({
                        where: { question_id: ans.questionId, is_correct: true },
                        select: { id: true }
                    });
                    const correctIds = correctOptions.map((o: any) => o.id);
                    const selected = ans.selectedOptions || [];
                    const isCorrect = selected.length > 0 && correctIds.length > 0 &&
                        selected.every((id: string) => correctIds.includes(id)) &&
                        correctIds.every((id: string) => selected.includes(id));

                    const marksAwarded = isCorrect ? 1 : (selected.length > 0 ? -0.33 : 0);
                    score += marksAwarded;

                    savedAnswers.push({
                        attemptId: attempt.id,
                        questionId: ans.questionId,
                        selectedOptions: selected,
                        isCorrect,
                        marksAwarded,
                        timeTakenSecs: ans.timeTakenSecs || 0,
                    });
                }
                await prisma.attemptAnswer.createMany({ data: savedAnswers });
            }

            const finalScore = Math.max(0, score);

            // Calculate rank among submitted attempts
            const betterAttempts = await prisma.testAttempt.count({
                where: { testId: test.id, score: { gt: finalScore }, status: 'SUBMITTED' }
            });
            const totalSubmitted = await prisma.testAttempt.count({
                where: { testId: test.id, status: 'SUBMITTED' }
            });
            const rank = betterAttempts + 1;
            const percentile = totalSubmitted > 0 ? parseFloat(((betterAttempts / (totalSubmitted + 1)) * 100).toFixed(1)) : 100;

            const updatedAttempt = await prisma.testAttempt.update({
                where: { id: attempt.id },
                data: {
                    status: 'SUBMITTED',
                    submittedAt: new Date(),
                    score: finalScore,
                    rank,
                    percentile,
                    timeTakenSecs: timeTakenSecs || null,
                }
            });

            // Update ranks of all other attempts for this test
            // (async, fire-and-forget to not delay the response)
            prisma.testAttempt.findMany({
                where: { testId: test.id, status: 'SUBMITTED' },
                orderBy: { score: 'desc' },
                select: { id: true }
            }).then(async (allAttempts: any[]) => {
                const totalNow = allAttempts.length;
                for (let i = 0; i < allAttempts.length; i++) {
                    await prisma.testAttempt.update({
                        where: { id: allAttempts[i].id },
                        data: { rank: i + 1, percentile: parseFloat(((i / totalNow) * 100).toFixed(1)) }
                    });
                }
            }).catch(() => {});

            return res.json({ success: true, data: updatedAttempt });
        }

        return res.status(400).json({ success: false, message: 'Invalid action. Use "start" or "submit".' });
    } catch (err: any) { next(err); }
});

// GET /mockbook/attempts/:attemptId — get attempt result/analysis (enriched)
router.get('/attempts/:attemptId', authenticate, async (req, res, next) => {
    try {
        const user = (req as any).user;
        const student = await prisma.student.findFirst({ where: { userId: user.userId } });
        if (!student) return res.status(403).json({ success: false, message: 'Not a student profile found' });

        const attemptIdParam = req.params.attemptId as string;
        let attemptId = attemptIdParam;

        if (attemptIdParam === 'latest') {
            const latest = await prisma.testAttempt.findFirst({
                where: { studentId: student.id, status: 'SUBMITTED' },
                orderBy: { submittedAt: 'desc' },
                select: { id: true }
            });
            if (!latest) return res.status(404).json({ success: false, message: 'No submitted attempts found' });
            attemptId = latest.id;
        }

        const attempt = await prisma.testAttempt.findUnique({
            where: { id: attemptId },
            include: {
                test: { 
                    include: {
                        sections: {
                            include: { set: { include: { question_set_items: { select: { question_id: true } } } } }
                        }
                    }
                },
                answers: true
            }
        });

        if (!attempt || attempt.studentId !== student.id) {
            return res.status(404).json({ success: false, message: 'Attempt not found' });
        }

        // Map questions to sections
        const qSectionMap: Record<string, string> = {};
        const secTotalQs: Record<string, number> = {};
        const testSections = (attempt.test as any)?.sections || [];
        for (const section of testSections) {
            const secName = section.name || section.set?.name || 'Default';
            if (!secTotalQs[secName]) secTotalQs[secName] = 0;
            if (section.set?.question_set_items) {
                for (const item of section.set.question_set_items) {
                    qSectionMap[item.question_id] = secName;
                    secTotalQs[secName]++;
                }
            }
        }

        const totalAttempted = attempt.answers.filter((a: any) => a.selectedOptions.length > 0).length;
        const correct = attempt.answers.filter((a: any) => a.isCorrect).length;
        const incorrect = attempt.answers.filter((a: any) => !a.isCorrect && a.selectedOptions.length > 0).length;
        const accuracy = totalAttempted > 0 ? Math.round((correct / totalAttempted) * 100) : 0;

        // Calculate section-wise stats
        const secStatsMap: Record<string, any> = {};
        Object.keys(secTotalQs).forEach(sec => {
            secStatsMap[sec] = { name: sec, correct: 0, incorrect: 0, unattempted: secTotalQs[sec] || 0, partial: 0 };
        });

        attempt.answers.forEach((ans: any) => {
            const secName = qSectionMap[ans.questionId] || 'Default';
            if (!secStatsMap[secName]) {
                secStatsMap[secName] = { name: secName, correct: 0, incorrect: 0, unattempted: secTotalQs[secName] || 0, partial: 0 };
            }
            if (ans.selectedOptions && ans.selectedOptions.length > 0) {
                secStatsMap[secName].unattempted = Math.max(0, secStatsMap[secName].unattempted - 1);
                if (ans.isCorrect) secStatsMap[secName].correct++;
                else secStatsMap[secName].incorrect++;
            }
        });
        const sectionStats = Object.values(secStatsMap);

        // Which attempt number is this?
        const priorAttempts = await prisma.testAttempt.count({
            where: { testId: attempt.testId, studentId: student.id, createdAt: { lt: attempt.createdAt } }
        });
        const attemptNumber = priorAttempts + 1;

        // Marks distribution (score histogram for this test)
        const allSubmitted = await prisma.testAttempt.findMany({
            where: { testId: attempt.testId, status: 'SUBMITTED' },
            select: { score: true, studentId: true, student: { select: { name: true } } }
        });
        const totalStudents = allSubmitted.length;

        // Build histogram buckets
        const test = attempt.test as any;
        const maxMarks = test.totalMarks || 100;
        const bucketSize = Math.max(1, Math.ceil(maxMarks / 10));
        const buckets: Record<number, number> = {};
        for (let b = 0; b <= maxMarks; b += bucketSize) { buckets[b] = 0; }
        allSubmitted.forEach((a: any) => {
            const bucket = Math.floor((a.score || 0) / bucketSize) * bucketSize;
            buckets[bucket] = (buckets[bucket] || 0) + 1;
        });
        const marksDistribution = Object.entries(buckets).map(([marks, students]) => ({ marks: Number(marks), students }));

        // Topper & average
        const scores = allSubmitted.map((a: any) => a.score || 0).sort((x: number, y: number) => y - x);
        const avgScore = scores.length > 0 ? parseFloat((scores.reduce((a: number, b: number) => a + b, 0) / scores.length).toFixed(1)) : 0;
        
        const topperAttempt = await prisma.testAttempt.findFirst({
            where: { testId: attempt.testId, status: 'SUBMITTED' },
            orderBy: { score: 'desc' },
            include: { student: { select: { name: true } }, answers: true }
        });

        let topperScore = 0, topperName = 'Topper', topperTimeTakenSecs = 0;
        let topperCorrect = 0, topperIncorrect = 0, topperAccuracy = 0;

        if (topperAttempt) {
            topperScore = topperAttempt.score || 0;
            topperName = topperAttempt.student?.name || 'Topper';
            topperTimeTakenSecs = topperAttempt.timeTakenSecs || 0;
            
            const tAttempted = topperAttempt.answers.filter((a: any) => a.selectedOptions.length > 0).length;
            topperCorrect = topperAttempt.answers.filter((a: any) => a.isCorrect).length;
            topperIncorrect = topperAttempt.answers.filter((a: any) => !a.isCorrect && a.selectedOptions.length > 0).length;
            topperAccuracy = tAttempted > 0 ? Math.round((topperCorrect / tAttempted) * 100) : 0;
        }

        res.json({
            success: true,
            data: {
                id: attempt.id,
                testId: test.testId,
                testName: test.name,
                passingMarks: test.passingMarks,
                score: attempt.score,
                totalMarks: attempt.totalMarks,
                rank: attempt.rank,
                percentile: attempt.percentile,
                attempted: totalAttempted,
                totalQuestions: attempt.answers.length,
                correct,
                incorrect,
                unattempted: attempt.answers.length - totalAttempted,
                accuracy,
                timeTakenSecs: attempt.timeTakenSecs,
                submittedAt: attempt.submittedAt,
                attemptNumber,
                // Analytics
                totalStudents,
                marksDistribution,
                topperScore,
                topperName,
                topperTimeTakenSecs,
                topperCorrect,
                topperIncorrect,
                topperAccuracy,
                avgScore,
                sectionStats
            }
        });
    } catch (err: any) { next(err); }
});

// GET /mockbook/attempts/:attemptId/analytics/chapters — chapter-wise performance
router.get('/attempts/:attemptId/analytics/chapters', authenticate, async (req, res, next) => {
    try {
        const user = (req as any).user;
        const student = await prisma.student.findFirst({ where: { userId: user.userId } });
        if (!student) return res.status(403).json({ success: false, message: 'Not a student profile found' });

        const attempt = await prisma.testAttempt.findUnique({
            where: { id: req.params.attemptId as any },
            include: {
                test: true,
                answers: {
                    include: {
                        questions: true
                    }
                }
            }
        });

        if (!attempt || attempt.studentId !== student.id) {
            return res.status(404).json({ success: false, message: 'Attempt not found' });
        }

        const chapterStats: Record<string, any> = {};

        (attempt as any).answers.forEach((ans: any) => {
            const q = ans.questions as any;
            const chapterName = q.chapter_name || q.chapterName || 'Uncategorized';
            
            if (!chapterStats[chapterName]) {
                chapterStats[chapterName] = { name: chapterName, total: 0, correct: 0, incorrect: 0, timeSpentSecs: 0 };
            }
            
            chapterStats[chapterName].total += 1;
            chapterStats[chapterName].timeSpentSecs += (ans.timeTakenSecs || 0);
            
            if (ans.selectedOptions && ans.selectedOptions.length > 0) {
                if (ans.isCorrect) {
                    chapterStats[chapterName].correct += 1;
                } else {
                    chapterStats[chapterName].incorrect += 1;
                }
            }
        });

        const chapterData = Object.values(chapterStats).map((c: any) => {
            const attempted = c.correct + c.incorrect;
            return {
                ...c,
                accuracy: attempted > 0 ? Math.round((c.correct / attempted) * 100) : 0
            };
        });

        res.json({ success: true, data: chapterData });
    } catch (err: any) { next(err); }
});

// ─── Admin: Analytics ──────────────────────────────────────────

// GET /mockbook/analytics/stats — platform-wide metrics
router.get('/analytics/stats', async (req, res, next) => {
    try {
        const { days } = req.query;
        let dateFilter: any = {};
        if (days) {
            const date = new Date();
            date.setDate(date.getDate() - parseInt(days as string));
            dateFilter = { createdAt: { gte: date } };
        }

        const [platformTests, totalSeries, attemptsCount, studentsCount, liveNow] = await Promise.all([
            prisma.mockTest.count({ }),
            prisma.examCategory.count({ }),
            prisma.testAttempt.count({
                where: {
                    ...dateFilter
                }
            }),
            prisma.user.count({ where: { role: 'STUDENT', ...dateFilter } }),
            prisma.mockTest.count({ where: { status: 'LIVE' } })
        ]);

        // Calculate Top Tests by attempts
        const topTestsRaw = await prisma.testAttempt.groupBy({
            by: ['testId'],
            where: {
                ...dateFilter
            },
            _count: { _all: true },
            orderBy: { _count: { testId: 'desc' } }, // Note: groupBy doesn't directly support sorting by count easily in some versions, but we'll take top results
            take: 10
        });

        const topTests = await Promise.all(topTestsRaw.map(async (item) => {
            const test = await prisma.mockTest.findUnique({ 
                where: { id: item.testId },
                select: { name: true, subCategory: { select: { name: true, category: { select: { name: true } } } } }
            });
            return {
                name: test?.name || 'Unknown Test',
                series: test?.subCategory?.category?.name || 'General',
                count: item._count._all
            };
        }));

        // Calculate Top Series (ExamCategory) by enrollment
        // Note: 'Enrollment' here is defined as unique students who attempted at least one test in that series
        const seriesAttemptCounts = await prisma.testAttempt.findMany({
            where: {
                ...dateFilter
            },
            select: {
                studentId: true,
                test: {
                    select: {
                        subCategory: {
                            select: { categoryId: true }
                        }
                    }
                }
            }
        });

        const seriesStatsMap: Record<string, Set<string>> = {};
        seriesAttemptCounts.forEach(att => {
            const catId = att.test.subCategory?.categoryId;
            if (catId) {
                if (!seriesStatsMap[catId]) seriesStatsMap[catId] = new Set();
                seriesStatsMap[catId].add(att.studentId);
            }
        });

        const topSeriesIds = Object.keys(seriesStatsMap)
            .sort((a, b) => seriesStatsMap[b].size - seriesStatsMap[a].size)
            .slice(0, 5);

        const topSeries = await Promise.all(topSeriesIds.map(async (id) => {
            const cat = await prisma.examCategory.findUnique({ where: { id }, select: { name: true, folder: { select: { name: true } } } });
            return {
                name: cat?.name || 'Unknown Series',
                category: cat?.folder?.name || 'General',
                count: seriesStatsMap[id].size
            };
        }));

        // Mock revenue for now
        const revenueMTD = 0; 

        res.json({
            success: true,
            data: {
                platformTests,
                totalSeries,
                totalAttempts: attemptsCount || 0,
                activeStudents: studentsCount || 0,
                liveNow: liveNow || 0,
                revenueMTD,
                topTests: topTests.sort((a, b) => b.count - a.count),
                topSeries
            }
        });
    } catch (err) {
        console.error('Analytics Error:', err);
        next(err);
    }
});


// ─── Admin: Mock Test CRUD ─────────────────────────────────────

// GET /mockbook/admin/tests — list all tests (admin view, all orgs or filtered)
router.get('/admin/tests', async (req, res, next) => {
    try {
        const { subCategoryId, categoryId, status, search } = req.query;

        const where: any = {};
        if (subCategoryId) where.subCategoryId = subCategoryId as string;
        if (status) where.status = status as string;
        if (search) where.name = { contains: search as string, mode: 'insensitive' };

        // Filter by categoryId (series) via subcategory
        if (categoryId) {
            const subCats = await prisma.examSubCategory.findMany({
                where: { categoryId: categoryId as string },
                select: { id: true }
            });
            where.subCategoryId = { in: subCats.map(s => s.id) };
        }

        const tests = await prisma.mockTest.findMany({
            where,
            include: {
                subCategory: {
                    include: {
                        category: { select: { id: true, name: true } }
                    }
                },
                _count: { select: { attempts: true, sections: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 200,
        });

        res.json({ success: true, data: tests });
    } catch (err: any) { next(err); }

});

// GET /mockbook/admin/tests/:id — single test detail for admin
router.get('/admin/tests/:id', async (req, res, next) => {
    try {
        const test = await prisma.mockTest.findUnique({
            where: { id: req.params.id },
            include: {
                sections: {
                    include: {
                        set: {
                            include: {
                                question_set_items: { select: { question_id: true, sort_order: true } }
                            }
                        }
                    },
                    orderBy: { sortOrder: 'asc' }
                },
                subCategory: {
                    include: { category: { select: { id: true, name: true } } }
                },
                _count: { select: { attempts: true } }
            }
        });
        if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
        res.json({ success: true, data: test });
    } catch (err: any) { next(err); }
});

// POST /mockbook/admin/tests/:id/sections — add a section (question set) to test
router.post('/admin/tests/:id/sections', async (req, res, next) => {
    try {
        const { setId, name, durationMins } = req.body;
        const testId = req.params.id;

        const maxOrderSection = await prisma.mockTestSection.findFirst({
            where: { testId },
            orderBy: { sortOrder: 'desc' },
            select: { sortOrder: true }
        });
        const sortOrder = maxOrderSection ? maxOrderSection.sortOrder + 1 : 0;

        const section = await prisma.mockTestSection.create({
            data: { testId, setId, name, sortOrder, durationMins }
        });
        res.status(201).json({ success: true, data: section });
    } catch (err: any) { next(err); }
});

// DELETE /mockbook/admin/tests/:id/sections/:sectionId — remove section
router.delete('/mockbook/admin/tests/:id/sections/:sectionId', async (req, res, next) => {
    try {
        await prisma.mockTestSection.delete({
            where: { id: req.params.sectionId }
        });
        res.json({ success: true, message: "Section removed" });
    } catch (err: any) { next(err); }
});

// POST /mockbook/admin/tests — create new mock test
router.post('/admin/tests', async (req, res, next) => {
    try {
        const schema = z.object({
            subCategoryId: z.string().optional().nullable(),
            name: z.string().min(1),
            description: z.string().optional(),
            durationMins: z.number().int().min(1),
            totalMarks: z.number().optional().default(0),
            passingMarks: z.number().optional().nullable(),
            shuffleQuestions: z.boolean().default(false),
            showResult: z.boolean().default(true),
            maxAttempts: z.number().int().default(1),
            isPublic: z.boolean().default(false),
            scheduledAt: z.string().optional().nullable(),
            endsAt: z.string().optional().nullable(),
        });

        const body = schema.parse(req.body);

        // Generate a unique testId
        const testIdBase = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
        const testId = `${testIdBase}-${Date.now()}`;

        const test = await prisma.mockTest.create({
            data: {
                testId,
                pin: Math.floor(100000 + Math.random() * 900000).toString(),
                subCategoryId: body.subCategoryId || null,
                name: body.name,
                description: body.description,
                durationMins: body.durationMins,
                totalMarks: body.totalMarks,
                passingMarks: body.passingMarks,
                shuffleQuestions: body.shuffleQuestions,
                showResult: body.showResult,
                maxAttempts: body.maxAttempts,
                isPublic: body.isPublic,
                scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
                endsAt: body.endsAt ? new Date(body.endsAt) : null,
                status: 'DRAFT',
            }
        });
        res.status(201).json({ success: true, data: test });
    } catch (err: any) { next(err); }
});

// PATCH /mockbook/admin/tests/:id — update mock test
router.patch('/admin/tests/:id', async (req, res, next) => {
    try {
        const { name, description, durationMins, totalMarks, passingMarks, 
                shuffleQuestions, showResult, maxAttempts, isPublic, 
                scheduledAt, endsAt, subCategoryId } = req.body;

        const test = await prisma.mockTest.update({
            where: { id: req.params.id },
            data: {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(durationMins !== undefined && { durationMins: Number(durationMins) }),
                ...(totalMarks !== undefined && { totalMarks: Number(totalMarks) }),
                ...(passingMarks !== undefined && { passingMarks: passingMarks ? Number(passingMarks) : null }),
                ...(shuffleQuestions !== undefined && { shuffleQuestions: Boolean(shuffleQuestions) }),
                ...(showResult !== undefined && { showResult: Boolean(showResult) }),
                ...(maxAttempts !== undefined && { maxAttempts: Number(maxAttempts) }),
                ...(isPublic !== undefined && { isPublic: Boolean(isPublic) }),
                ...(scheduledAt !== undefined && { scheduledAt: scheduledAt ? new Date(scheduledAt) : null }),
                ...(endsAt !== undefined && { endsAt: endsAt ? new Date(endsAt) : null }),
                ...(subCategoryId !== undefined && { subCategoryId: subCategoryId || null }),
            }
        });
        res.json({ success: true, data: test });
    } catch (err: any) { next(err); }
});

// PATCH /mockbook/admin/tests/:id/status — change test status
router.patch('/admin/tests/:id/status', async (req, res, next) => {
    try {
        const { status } = req.body;
        const validStatuses = ['DRAFT', 'LIVE', 'ENDED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        }

        const update: any = { status };
        if (status === 'LIVE' && !req.body.scheduledAt) {
            update.scheduledAt = new Date(); // Set live time to now if not already set
        }
        if (status === 'ENDED') {
            update.endsAt = new Date();
        }

        const test = await prisma.mockTest.update({ where: { id: req.params.id }, data: update });
        res.json({ success: true, data: test });
    } catch (err: any) { next(err); }
});

// DELETE /mockbook/admin/tests/:id — delete mock test
router.delete('/admin/tests/:id', async (req, res, next) => {
    try {
        // Delete attempt answers first
        const attempts = await prisma.testAttempt.findMany({
            where: { testId: req.params.id },
            select: { id: true }
        });
        const attemptIds = attempts.map(a => a.id);
        if (attemptIds.length > 0) {
            await prisma.attemptAnswer.deleteMany({ where: { attemptId: { in: attemptIds } } });
            await prisma.testAttempt.deleteMany({ where: { id: { in: attemptIds } } });
        }
        await prisma.mockTestSection.deleteMany({ where: { testId: req.params.id } });
        await prisma.mockTestBatch.deleteMany({ where: { testId: req.params.id } });
        await prisma.mockTest.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Test deleted' });
    } catch (err: any) { next(err); }
});

// GET /mockbook/admin/students — students with attempt stats (admin view)
router.get('/admin/students', async (req, res, next) => {
    try {
        const { search } = req.query;

        const where: any = {};
        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { studentId: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        const students: any[] = await (prisma as any).student.findMany({
            where,
            include: {
                _count: { select: { attempts: true } },
                attempts: { select: { score: true }, take: 100 }
            },
            orderBy: { createdAt: 'desc' },
            take: 500,
        });

        const result = students.map((s: any) => ({
            id: s.id,
            studentId: s.studentId,
            name: s.name,
            phone: s.phone,
            isActive: s.isActive,
            createdAt: s.createdAt,
            totalAttempts: s._count?.attempts || 0,
            avgScore: s.attempts?.length > 0
                ? (s.attempts.reduce((a: number, b: any) => a + (b.score || 0), 0) / s.attempts.length).toFixed(1)
                : null,
            attempts: undefined,
            _count: undefined,
        }));

        res.json({ success: true, data: result });
    } catch (err: any) { next(err); }
});

// GET /mockbook/admin/live-tests — currently live and upcoming scheduled tests
router.get('/admin/live-tests', async (req, res, next) => {
    try {
        const [liveTests, scheduledTests] = await Promise.all([
            prisma.mockTest.findMany({
                where: {
                    status: 'LIVE',
                },
                include: { _count: { select: { attempts: true } } },
                orderBy: { scheduledAt: 'asc' }
            }),
            prisma.mockTest.findMany({
                where: {
                    status: 'DRAFT',
                    scheduledAt: { gte: new Date() },
                },
                include: { _count: { select: { attempts: true } } },
                orderBy: { scheduledAt: 'asc' },
                take: 20,
            }),
        ]);

        res.json({ success: true, data: { live: liveTests, scheduled: scheduledTests } });
    } catch (err: any) { next(err); }
});

// GET /mockbook/admin/tests/:testId/performance — per-test analytics for admin
router.get('/admin/tests/:testId/performance', async (req, res, next) => {
    try {
        const test = await prisma.mockTest.findFirst({
            where: { OR: [{ id: req.params.testId }, { testId: req.params.testId }] },
            select: { id: true, name: true, testId: true, totalMarks: true, durationMins: true }
        });
        if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

        const allAttempts = await prisma.testAttempt.findMany({
            where: { testId: test.id, status: 'SUBMITTED' },
            include: { student: { select: { name: true, studentId: true, mobile: true } } },
            orderBy: { score: 'desc' }
        });

        const scores = allAttempts.map((a: any) => a.score || 0);
        const total = scores.length;
        const topperScore = scores[0] || 0;
        const avgScore = total > 0 ? parseFloat((scores.reduce((a: number, b: number) => a + b, 0) / total).toFixed(1)) : 0;
        const passCount = scores.filter((s: number) => s > 0).length;

        // Marks distribution histogram
        const maxMarks = test.totalMarks || 100;
        const bucketSize = Math.max(1, Math.ceil(maxMarks / 10));
        const buckets: Record<number, number> = {};
        for (let b = 0; b <= maxMarks; b += bucketSize) { buckets[b] = 0; }
        scores.forEach((s: number) => {
            const bucket = Math.floor(s / bucketSize) * bucketSize;
            buckets[bucket] = (buckets[bucket] || 0) + 1;
        });
        const marksDistribution = Object.entries(buckets).map(([marks, count]) => ({ marks: Number(marks), students: count }));

        // Per-student data (ranked)
        const studentRows = allAttempts.map((a: any, idx: number) => ({
            rank: idx + 1,
            studentName: a.student?.name || 'Unknown',
            studentId: a.student?.studentId || '',
            phone: a.student?.mobile || '',
            score: a.score,
            totalMarks: a.totalMarks,
            accuracy: a.answers ? null : null,  // answers not loaded here for perf
            timeTakenSecs: a.timeTakenSecs,
            submittedAt: a.submittedAt,
            attemptId: a.id,
        }));

        res.json({
            success: true,
            data: {
                test,
                summary: { total, topperScore, avgScore, passCount },
                marksDistribution,
                leaderboard: studentRows.slice(0, 100),
            }
        });
    } catch (err: any) { next(err); }
});

// GET /mockbook/admin/student-drilldown/:studentId — student detailed attempt history
router.get('/admin/student-drilldown/:studentId', async (req, res, next) => {
    try {
        const studentParam = req.params.studentId as string;
        const student = await prisma.student.findFirst({
            where: { OR: [{ id: studentParam }, { studentId: studentParam }] },
            select: { id: true, name: true, studentId: true, mobile: true, email: true, createdAt: true }
        });
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        const attempts = await prisma.testAttempt.findMany({
            where: { studentId: student.id, status: 'SUBMITTED' },
            include: { test: { select: { name: true, testId: true, totalMarks: true } } },
            orderBy: { submittedAt: 'asc' },
            take: 100,
        });

        const trend = attempts.map((a: any, idx: number) => ({
            attemptNumber: idx + 1,
            testName: a.test?.name || 'Test',
            testId: a.test?.testId,
            score: a.score || 0,
            totalMarks: a.totalMarks || 0,
            accuracy: a.totalMarks ? parseFloat(((a.score / a.totalMarks) * 100).toFixed(1)) : 0,
            rank: a.rank,
            timeTakenSecs: a.timeTakenSecs,
            submittedAt: a.submittedAt,
            attemptId: a.id,
        }));

        const scores = trend.map((t: any) => t.score);
        const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
        const avgScore = scores.length > 0 ? parseFloat((scores.reduce((a: number, b: number) => a + b, 0) / scores.length).toFixed(1)) : 0;

        res.json({
            success: true,
            data: {
                student,
                summary: { totalAttempts: attempts.length, bestScore, avgScore },
                trend,
            }
        });
    } catch (err: any) { next(err); }
});

// GET /mockbook/analytics/student/:studentId/overall — student 30-day performance
router.get('/analytics/student/:studentId/overall', async (req, res, next) => {
    try {
        const studentIdParam = req.params.studentId;
        const days = parseInt(req.query.days as string) || 30;
        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - days);

        const student = await prisma.student.findFirst({
            where: { OR: [{ id: studentIdParam }, { studentId: studentIdParam }] },
            select: { id: true, name: true, studentId: true }
        });

        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const attempts = await prisma.testAttempt.findMany({
            where: {
                studentId: student.id,
                status: 'SUBMITTED',
                submittedAt: { gte: dateFrom }
            },
            include: {
                test: { select: { name: true, totalMarks: true } }
            },
            orderBy: { submittedAt: 'asc' }
        });

        const totalTests = attempts.length;
        let totalScore = 0;
        let totalPossibleMarks = 0;
        let totalTimeSecs = 0;

        const trend = attempts.map(a => {
            totalScore += (a.score || 0);
            totalPossibleMarks += (a.totalMarks || 0);
            totalTimeSecs += (a.timeTakenSecs || 0);
            return {
                testName: a.test?.name || "Mock Test",
                score: a.score || 0,
                accuracy: a.totalMarks ? ((a.score || 0) / a.totalMarks) * 100 : 0,
                date: a.submittedAt
            };
        });

        const overallAccuracy = totalPossibleMarks > 0 ? (totalScore / totalPossibleMarks) * 100 : 0;

        let recommendation = "Keep taking more tests to generate accurate insights.";
        if (totalTests > 0) {
            if (overallAccuracy > 80) recommendation = "Excellent performance! Focus on time management to perfect your score.";
            else if (overallAccuracy > 50) recommendation = "Good progress. Review your incorrect answers and focus on weak topics to improve accuracy.";
            else recommendation = "Focus on fundamental concepts. Try taking more sectional tests before attempting full-length mocks.";
        }

        res.json({
            success: true,
            data: {
                studentName: student?.name || "Student",
                studentRollId: student?.studentId || "N/A",
                totalTests,
                totalTimeSecs,
                overallAccuracy: overallAccuracy.toFixed(1),
                trend,
                recommendation
            }
        });
    } catch (err: any) { next(err); }
});

// GET /mockbook/attempts/:attemptId/report — detailed post-test single attempt report
router.get('/attempts/:attemptId/report', authenticate, async (req, res, next) => {
    try {
        const user = (req as any).user;
        const student = await prisma.student.findFirst({ where: { userId: user.userId } });
        if (!student) return res.status(403).json({ success: false, message: 'Not a student profile found' });

        const attemptIdParam = req.params.attemptId as string;
        let attemptId = attemptIdParam;

        if (attemptIdParam === 'latest') {
            const latest = await prisma.testAttempt.findFirst({
                where: { studentId: student.id, status: 'SUBMITTED' },
                orderBy: { submittedAt: 'desc' },
                select: { id: true }
            });
            if (!latest) return res.status(404).json({ success: false, message: 'No submitted attempts found' });
            attemptId = latest.id;
        }

        const attempt = await prisma.testAttempt.findUnique({
            where: { id: attemptId },
            include: {
                test: true,
                student: { select: { name: true, studentId: true } },
                answers: {
                    include: {
                        questions: {
                            include: {
                                question_options: true
                            }
                        }
                    }
                }
            }
        }) as any;

        if (!attempt || attempt.studentId !== student.id) return res.status(404).json({ success: false, message: "Attempt not found or unauthorized" });

        let correct = 0, incorrect = 0, unattempted = 0;
        let totalTime = 0;

        const solutions = (attempt.answers as any[]).map((ans: any) => {
            totalTime += (ans.timeTakenSecs || 0);
            if (ans.selectedOptions.length === 0) {
                unattempted++;
                return { ...ans, status: 'UNATTEMPTED' };
            }
            if (ans.isCorrect) {
                correct++;
                return { ...ans, status: 'CORRECT' };
            }
            incorrect++;
            return { ...ans, status: 'INCORRECT' };
        });

        const accuracy = (correct + incorrect) > 0 ? (correct / (correct + incorrect)) * 100 : 0;

        res.json({
            success: true,
            data: {
                attemptInfo: {
                    score: attempt.score,
                    totalMarks: attempt.totalMarks,
                    timeTakenSecs: attempt.timeTakenSecs,
                    accuracy: accuracy.toFixed(1),
                    rank: attempt.rank || null,
                    percentile: attempt.percentile || null,
                    submittedAt: attempt.submittedAt,
                    testName: attempt.test?.name
                },
                ringStats: { correct, incorrect, unattempted },
                avgTimePerQuestion: solutions.length > 0 ? Math.round(totalTime / solutions.length) : 0,
                solutions
            }
        });
    } catch(err) { next(err); }
});

// POST /mockbook/analytics/student/:studentId/study-plan — generate dynamic plan
router.post('/analytics/student/:studentId/study-plan', async (req, res, next) => {
    try {
        const studentId = req.params.studentId;
        const { durationInDays } = req.body;
        const days = Number(durationInDays) || 15;

        // Note: For MVP mock data generation mimicking real analysis
        const plan = [];
        const date = new Date();
        
        const subjects = ['Quantitative Aptitude', 'Logical Reasoning', 'English Language', 'General Awareness'];
        const taskTypes = ['Review Concepts', 'Sectional Mock', 'Full Length Mock', 'Previous Year Questions'];

        for(let i=1; i<=days; i++) {
            const currentDate = new Date(date);
            currentDate.setDate(currentDate.getDate() + i);
            
            const isFullMockDay = i % 5 === 0; // Every 5 days is a full mock
            
            let taskType = isFullMockDay ? 'Full Length Mock' : taskTypes[Math.floor(Math.random() * 3)];
            let subject = subjects[Math.floor(Math.random() * subjects.length)];
            
            plan.push({
                day: i,
                date: currentDate.toISOString().split('T')[0],
                taskType,
                title: taskType === 'Full Length Mock' ? 'Attempt Full Length Mock Test' : `${taskType} - ${subject}`,
                description: isFullMockDay ? 'Simulate exam environment for full duration.' : `Focus on improving your speed and accuracy in ${subject}.`,
                completed: false
            });
        }

        res.json({ success: true, data: { duration: days, plan } });
    } catch(err) { next(err); }
});

// ─── Save individual question response (autosave during test) ──────────────────
router.post('/attempts/:attemptId/response', authenticate, async (req, res, next) => {
    try {
        const user = (req as any).user;
        const student = await prisma.student.findFirst({ where: { userId: user.userId } });
        if (!student) return res.status(403).json({ success: false, message: 'Not a student profile found' });

        const attemptId = req.params.attemptId as string;
        const attempt = await prisma.testAttempt.findUnique({ where: { id: attemptId } });
        if (!attempt || attempt.studentId !== student.id) {
            return res.status(404).json({ success: false, message: 'Attempt not found' });
        }
        if (attempt.status !== 'IN_PROGRESS') {
            return res.status(400).json({ success: false, message: 'Attempt is not in progress' });
        }

        const { questionId, selectedOptions, timeTakenSecs, isMarkedForReview } = req.body;

        const correctOptions = await prisma.question_options.findMany({
            where: { question_id: questionId, is_correct: true },
            select: { id: true }
        });
        const correctIds = correctOptions.map((o: any) => o.id);
        const selected = selectedOptions || [];
        const isCorrect = selected.length > 0 && correctIds.length > 0 &&
            selected.every((id: string) => correctIds.includes(id)) &&
            correctIds.every((id: string) => selected.includes(id));
        const marksAwarded = isCorrect ? 1 : (selected.length > 0 ? -0.33 : 0);

        // Upsert the answer record
        const existing = await prisma.attemptAnswer.findFirst({
            where: { attemptId, questionId }
        });

        let answer;
        if (existing) {
            answer = await prisma.attemptAnswer.update({
                where: { id: existing.id },
                data: { selectedOptions: selected, isCorrect, marksAwarded, timeTakenSecs: timeTakenSecs || 0 }
            });
        } else {
            answer = await prisma.attemptAnswer.create({
                data: { attemptId, questionId, selectedOptions: selected, isCorrect, marksAwarded, timeTakenSecs: timeTakenSecs || 0 }
            });
        }

        res.json({ success: true, data: answer });
    } catch (err: any) { next(err); }
});

// ─── Pause attempt ──────────────────────────────────────────────────────────────
router.post('/attempts/:attemptId/pause', authenticate, async (req, res, next) => {
    try {
        const user = (req as any).user;
        const student = await prisma.student.findFirst({ where: { userId: user.userId } });
        if (!student) return res.status(403).json({ success: false, message: 'Not a student profile found' });

        const attemptId = req.params.attemptId as string;
        const attempt = await prisma.testAttempt.findUnique({ where: { id: attemptId } });
        if (!attempt || attempt.studentId !== student.id) {
            return res.status(404).json({ success: false, message: 'Attempt not found' });
        }

        const { timeRemainingSeconds, durationMins } = req.body;
        // Keep status as IN_PROGRESS since PAUSED is not in schema — just record elapsed time
        const effectiveDuration = durationMins || 60;
        const updatedTimeTaken = timeRemainingSeconds != null
            ? Math.max(0, effectiveDuration * 60 - timeRemainingSeconds)
            : (attempt.timeTakenSecs || 0);
        const updated = await prisma.testAttempt.update({
            where: { id: attemptId },
            data: { timeTakenSecs: updatedTimeTaken }
        });
        res.json({ success: true, data: { ...updated, isPaused: true } });
    } catch (err: any) { next(err); }
});

// ─── Resume attempt ─────────────────────────────────────────────────────────────
router.post('/attempts/:attemptId/resume', authenticate, async (req, res, next) => {
    try {
        const user = (req as any).user;
        const student = await prisma.student.findFirst({ where: { userId: user.userId } });
        if (!student) return res.status(403).json({ success: false, message: 'Not a student profile found' });

        const attemptId = req.params.attemptId as string;
        const attempt = await prisma.testAttempt.findUnique({
            where: { id: attemptId },
            include: { test: { select: { durationMins: true } } }
        });
        if (!attempt || attempt.studentId !== student.id) {
            return res.status(404).json({ success: false, message: 'Attempt not found' });
        }
        if (attempt.status === 'SUBMITTED') {
            return res.status(400).json({ success: false, message: 'Attempt already submitted' });
        }

        const totalSecs = ((attempt as any).test?.durationMins || 60) * 60;
        const usedSecs = attempt.timeTakenSecs || 0;
        const remainingSecs = Math.max(0, totalSecs - usedSecs);

        const updated = await prisma.testAttempt.update({
            where: { id: attemptId },
            data: { status: 'IN_PROGRESS' }
        });
        res.json({ success: true, data: { ...updated, remainingSeconds: remainingSecs } });
    } catch (err: any) { next(err); }
});

// ─── Full attempt review (solutions mode) ──────────────────────────────────────
router.get('/attempts/:attemptId/review', authenticate, async (req, res, next) => {
    try {
        const user = (req as any).user;
        const student = await prisma.student.findFirst({ where: { userId: user.userId } });
        if (!student) return res.status(403).json({ success: false, message: 'Not a student profile found' });

        let attemptId = req.params.attemptId as string;
        if (attemptId === 'latest') {
            const latest = await prisma.testAttempt.findFirst({
                where: { studentId: student.id, status: 'SUBMITTED' },
                orderBy: { submittedAt: 'desc' },
                select: { id: true }
            });
            if (!latest) return res.status(404).json({ success: false, message: 'No submitted attempts found' });
            attemptId = latest.id;
        }

        const attempt = await prisma.testAttempt.findUnique({
            where: { id: attemptId },
            include: {
                test: {
                    include: {
                        sections: {
                            orderBy: { sortOrder: 'asc' },
                            include: {
                                set: {
                                    include: {
                                question_set_items: {
                                    orderBy: { sort_order: 'asc' },
                                    include: {
                                        questions: {
                                            include: {
                                                question_options: { orderBy: { sort_order: 'asc' } }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
                answers: true
            }
        }) as any;

        if (!attempt || attempt.studentId !== student.id) {
            return res.status(404).json({ success: false, message: 'Attempt not found' });
        }

        // Build answer map: questionId -> answer
        const answerMap: Record<string, any> = {};
        for (const ans of attempt.answers) {
            answerMap[ans.questionId] = ans;
        }

        // Build review questions list (test order) with correct answers revealed
        const questions: any[] = [];
        let qNum = 1;
        for (const section of attempt.test.sections) {
            const items = section.set.question_set_items || [];
            for (const item of items) {
                const q = item.questions;
                if (!q) continue;
                const correctOptionIds = q.question_options.filter((o: any) => o.is_correct).map((o: any) => o.id);
                const userAnswer = answerMap[q.id];
                const selectedOptionIds = userAnswer?.selectedOptions || [];

                let status = 'SKIPPED';
                if (selectedOptionIds.length > 0) {
                    status = userAnswer?.isCorrect ? 'CORRECT' : 'INCORRECT';
                }

                questions.push({
                    id: q.id,
                    number: qNum++,
                    section: section.set.name || section.name,
                    textEn: q.text_en,
                    textHi: q.text_hi,
                    type: q.type,
                    options: q.question_options.map((o: any) => ({
                        id: o.id,
                        textEn: o.text_en,
                        textHi: o.text_hi,
                        isCorrect: o.is_correct,
                    })),
                    correctOptionIds,
                    explanation: q.explanation_en,
                    imageUrl: null,
                    topic: q.subject_name,
                    chapter: q.chapter_name,
                    subjectArea: q.subject_name,
                    avgTimeSecs: 60,
                    correctPercentage: 0,
                    // User's response
                    selectedOptionIds,
                    timeTakenSecs: userAnswer?.timeTakenSecs || 0,
                    marksAwarded: userAnswer?.marksAwarded || 0,
                    status,
                });
            }
        }

        // Summary stats
        const correct = questions.filter(q => q.status === 'CORRECT').length;
        const incorrect = questions.filter(q => q.status === 'INCORRECT').length;
        const skipped = questions.filter(q => q.status === 'SKIPPED').length;

        res.json({
            success: true,
            data: {
                attemptId: attempt.id,
                testName: attempt.test.name,
                testId: attempt.test.testId,
                score: attempt.score,
                totalMarks: attempt.totalMarks,
                submittedAt: attempt.submittedAt,
                summary: { correct, incorrect, skipped, total: questions.length },
                questions,
            }
        });
    } catch (err: any) { next(err); }
});

// ─── Leaderboard (also accessible at /tests/:testId/leaderboard path) ──────────
router.get('/tests/:testId/leaderboard', async (req, res, next) => {
    try {
        const testIdParam = req.params.testId as string;
        const top100 = await prisma.testAttempt.findMany({
            where: { test: { OR: [{ testId: testIdParam }, { id: testIdParam }] }, status: 'SUBMITTED' },
            orderBy: { score: 'desc' },
            take: 100,
            include: { student: { select: { name: true, studentId: true } } },
        });
        res.json({ success: true, data: top100 });
    } catch (err: any) { next(err); }
});

/*
// ─── Save / Bookmark a question ─────────────────────────────────────────────────
router.post('/questions/:questionId/save', authenticate, async (req, res, next) => {
    try {
        const user = (req as any).user;
        const questionId = req.params.questionId as string;
        const { attemptId } = req.body;

        // Check question exists
        const q = await prisma.questions.findUnique({ where: { id: questionId }, select: { id: true } });
        if (!q) return res.status(404).json({ success: false, message: 'Question not found' });

        // Upsert saved record
        const existing = await (prisma as any).savedQuestion.findFirst({
            where: { userId: user.userId, questionId }
        });
        if (existing) {
            return res.json({ success: true, data: existing, already: true });
        }

        const saved = await (prisma as any).savedQuestion.create({
            data: { userId: user.userId, questionId, attemptId: attemptId || null }
        });
        res.status(201).json({ success: true, data: saved });
    } catch (err: any) { next(err); }
});

router.delete('/questions/:questionId/save', authenticate, async (req, res, next) => {
    try {
        const user = (req as any).user;
        const questionId = req.params.questionId as string;

        await (prisma as any).savedQuestion.deleteMany({
            where: { userId: user.userId, questionId }
        });
        res.json({ success: true, message: 'Question removed from saved list' });
    } catch (err: any) { next(err); }
});

// ─── My saved questions ─────────────────────────────────────────────────────────
router.get('/user/saved-questions', authenticate, async (req, res, next) => {
    try {
        const user = (req as any).user;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const saved = await (prisma as any).savedQuestion.findMany({
            where: { userId: user.userId },
            include: {
                question: {
                    include: { options: { orderBy: { sortOrder: 'asc' } } }
                }
            },
            orderBy: { savedAt: 'desc' },
            skip,
            take: limit,
        });
        res.json({ success: true, data: saved });
    } catch (err: any) { next(err); }
});
*/

// ─── Report a question ──────────────────────────────────────────────────────────
router.post('/questions/:questionId/report', authenticate, async (req, res, next) => {
    try {
        const user = (req as any).user;
        const { attemptId, reportType, description } = req.body;
        // Log the report (simple version — could be stored in a QuestionReport table)
        console.log(`[QUESTION REPORT] questionId=${req.params.questionId} userId=${user.userId} type=${reportType} desc=${description} attemptId=${attemptId}`);
        res.json({ success: true, message: 'Report submitted. Thank you!' });
    } catch (err: any) { next(err); }
});

// ─── User's all attempts (My Tests dashboard) ──────────────────────────────────
router.get('/user/my-attempts', authenticate, async (req, res, next) => {
    try {
        const user = (req as any).user;
        const student = await prisma.student.findFirst({ where: { userId: user.userId } });
        if (!student) return res.status(403).json({ success: false, message: 'Not a student' });

        const attempts = await prisma.testAttempt.findMany({
            where: { studentId: student.id, status: { in: ['IN_PROGRESS', 'SUBMITTED'] } },
            include: {
                test: { select: { testId: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Enrich with attemptNumber per test
        const testAttemptCount: Record<string, number> = {};
        const enriched = attempts.map((a: any) => {
            const tid = a.testId;
            if (!testAttemptCount[tid]) testAttemptCount[tid] = 0;
            if (a.status === 'SUBMITTED') testAttemptCount[tid]++;
            const answered = a.answers?.length || 0;
            return {
                id: a.id,
                testId: a.test?.testId || tid,
                testName: a.test?.name || 'Unnamed Test',
                status: a.status,
                score: a.score || 0,
                totalMarks: a.totalMarks || 0,
                rank: a.rank || null,
                percentile: a.percentile || 0,
                accuracy: 0, // Will be computed below
                attempted: answered,
                totalQuestions: 0,
                submittedAt: a.submittedAt,
                createdAt: a.createdAt,
                attemptNumber: testAttemptCount[tid],
            };
        });

        res.json({ success: true, data: enriched });
    } catch (err: any) { next(err); }
});

// ─── Chapter/Topic-wise Analytics ──────────────────────────────────────────────
router.get('/attempts/:id/analytics/chapters', authenticate, async (req, res, next) => {
    try {
        const user = (req as any).user;
        const student = await prisma.student.findFirst({ where: { userId: user.userId } });
        if (!student) return res.status(403).json({ success: false, message: 'Not a student' });

        let attemptIdArg = req.params.id as string;
        if (attemptIdArg === 'latest') {
            const latest = await prisma.testAttempt.findFirst({
                where: { studentId: student.id, status: 'SUBMITTED' },
                orderBy: { submittedAt: 'desc' },
                select: { id: true }
            });
            if (!latest) return res.status(404).json({ success: false, message: 'No submitted attempts found' });
            attemptIdArg = latest.id;
        }

        const attempt = await prisma.testAttempt.findUnique({
            where: { id: attemptIdArg },
            include: { answers: true }
        });
        if (!attempt) return res.status(404).json({ success: false, message: 'Attempt not found' });

        // Fetch all questions for this test via MockTestSection -> QuestionSet -> QuestionSetItem -> Question
        const sections = await prisma.mockTestSection.findMany({
            where: { testId: attempt.testId },
            include: {
                set: {
                    include: {
                        question_set_items: {
                            include: { questions: true }
                        }
                    }
                }
            }
        });

        // Collect all questions and map them by questionId
        const testQuestions: any[] = [];
        for (const sec of sections) {
            const items = (sec as any).set?.question_set_items || [];
            for (const item of items) {
                if (item.questions) {
                    testQuestions.push({
                        ...item.questions,
                        _sectionName: sec.name // fallback topic
                    });
                }
            }
        }

        // Group by topic (fallback to chapterName, subjectName, or Section name)
        const chapterStats: Record<string, any> = {};
        const attemptAnswers = (attempt as any).answers || [];
        
        for (const q of testQuestions) {
            const chap = q.chapterName || q.subjectName || q._sectionName || 'General';
            if (!chapterStats[chap]) {
                chapterStats[chap] = { name: chap, total: 0, correct: 0, incorrect: 0, unattempted: 0, timeSpentSecs: 0 };
            }
            chapterStats[chap].total++;
            
            const ans = attemptAnswers.find((a: any) => a.questionId === q.id);
            if (!ans) {
                chapterStats[chap].unattempted++;
            } else {
                if (ans.isCorrect) chapterStats[chap].correct++;
                else chapterStats[chap].incorrect++;
                chapterStats[chap].timeSpentSecs += (ans.timeTakenSecs || 0);
            }
        }

        // Convert to array and calculate accuracy
        const chapters = Object.values(chapterStats).map(c => {
            const attempted = c.correct + c.incorrect;
            c.accuracy = attempted > 0 ? Math.round((c.correct / attempted) * 100) : 0;
            return c;
        }).sort((a, b) => b.total - a.total);

        res.json({ success: true, data: chapters });
    } catch (err: any) { next(err); }
});

export default router;


