import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { authenticate } from '../../middleware/auth';

const router = Router();
router.use(authenticate);

// ─── Exam Folders (Categories: SSC, Railway, etc.) ────────────
router.get('/folders', async (req, res, next) => {
    try {
        const orgId = req.query.orgId || req.headers['x-org-id'] || req.user?.orgId;
        let org = null;
        if (orgId) {
            org = await prisma.organization.findFirst({ where: { orgId: orgId as string } });
        }
        
        const where: any = {
            OR: [
                { orgId: null } // Global folders
            ]
        };

        if (org) {
            where.OR.push({ orgId: org.id });
        }

        const folders = await prisma.examFolder.findMany({
            where,
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
        const { orgId, ...rest } = req.body;
        const schema = z.object({
            name: z.string().min(1),
            description: z.string().optional(),
            icon: z.string().optional(),
            color: z.string().optional(),
            isFeatured: z.boolean().default(false),
            sortOrder: z.number().default(0),
        });
        const body = schema.parse(rest);
        
        const org = orgId ? await prisma.organization.findFirst({ where: { orgId: orgId as string } }) : null;

        const folder = await prisma.examFolder.create({ 
            data: { 
                ...body, 
                orgId: org?.id || null 
            } 
        });
        res.status(201).json({ success: true, data: folder });
    } catch (err) { next(err); }
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
    } catch (err) { next(err); }
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
    } catch (err) { next(err); }
});

// ─── Exam Categories (Test Series: SSC CGL 2026, etc.) ────────
router.get('/categories', async (req, res, next) => {
    try {
        const { folderId } = req.query;
        const orgId = req.query.orgId || req.headers['x-org-id'] || req.user?.orgId;
        const org = orgId ? await prisma.organization.findFirst({ where: { orgId: orgId as string } }) : null;

        const where: any = {};
        if (folderId) where.folderId = folderId as string;
        
        where.OR = [{ orgId: null }];
        if (org) {
            where.OR.push({ orgId: org.id });
        }

        const categories = await prisma.examCategory.findMany({
            where,
            orderBy: { sortOrder: 'asc' },
        });
        res.json({ success: true, data: categories });
    } catch (err) { next(err); }
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
        res.json({ success: true, data: category });
    } catch (err) { next(err); }
});

router.post('/categories', async (req, res, next) => {
    try {
        const { orgId, ...rest } = req.body;
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
        const body = schema.parse(rest);
        
        const org = orgId ? await prisma.organization.findFirst({ where: { orgId: orgId as string } }) : null;

        const category = await prisma.examCategory.create({ 
            data: { 
                ...body, 
                orgId: org?.id || null 
            } 
        });
        res.status(201).json({ success: true, data: category });
    } catch (err) { next(err); }
});

router.patch('/categories/:id', async (req, res, next) => {
    try {
        const category = await prisma.examCategory.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json({ success: true, data: category });
    } catch (err) { next(err); }
});

router.delete('/categories/:id', async (req, res, next) => {
    try {
        await prisma.examCategory.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Series deleted' });
    } catch (err) { next(err); }
});

// ─── Exam SubCategories (Test Folders: Tier 1, Sectional, etc.)
router.get('/subcategories', async (req, res, next) => {
    try {
        const { categoryId, parentId } = req.query;
        const orgId = req.query.orgId || req.headers['x-org-id'] || req.user?.orgId;
        const org = orgId ? await prisma.organization.findFirst({ where: { orgId: orgId as string } }) : null;

        const subCategories = await prisma.examSubCategory.findMany({
            where: {
                categoryId: categoryId ? (categoryId as string) : undefined,
                parentId: parentId ? (parentId as string) : (parentId === null ? null : undefined),
                OR: [
                    { orgId: null },
                    { orgId: org?.id || undefined }
                ]
            },
            orderBy: { sortOrder: 'asc' },
        });
        res.json({ success: true, data: subCategories });
    } catch (err) { next(err); }
});

router.post('/subcategories', async (req, res, next) => {
    try {
        const { orgId, ...rest } = req.body;
        const schema = z.object({
            categoryId: z.string().min(1),
            parentId: z.string().optional().nullable(),
            name: z.string().min(1),
            description: z.string().optional(),
            sortOrder: z.number().default(0),
        });
        const body = schema.parse(rest);
        
        const org = orgId ? await prisma.organization.findFirst({ where: { orgId: orgId as string } }) : null;

        const subCategory = await prisma.examSubCategory.create({ 
            data: { 
                ...body, 
                orgId: org?.id || null 
            } 
        });
        res.status(201).json({ success: true, data: subCategory });
    } catch (err) { next(err); }
});

router.patch('/subcategories/:id', async (req, res, next) => {
    try {
        const subCategory = await prisma.examSubCategory.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json({ success: true, data: subCategory });
    } catch (err) { next(err); }
});

router.delete('/subcategories/:id', async (req, res, next) => {
    try {
        await prisma.examSubCategory.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Folder deleted' });
    } catch (err) { next(err); }
});

// ─── Exam Folders (PATCH/DELETE) ───────────────────────────
router.patch('/folders/:id', async (req, res, next) => {
    try {
        const folder = await prisma.examFolder.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json({ success: true, data: folder });
    } catch (err) { next(err); }
});

router.delete('/folders/:id', async (req, res, next) => {
    try {
        await prisma.examFolder.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Category deleted' });
    } catch (err) { next(err); }
});

// ─── Public mock tests (MockVeda) ─────────────────────────────
router.get('/public', async (req, res, next) => {
    try {
        const orgId = req.query.orgId || req.headers['x-org-id'] || req.user?.orgId;
        const org = orgId ? await prisma.organization.findFirst({ where: { orgId: orgId as string } }) : null;

        const where: any = { isPublic: true, status: 'LIVE' };
        where.OR = [{ orgId: null }];
        if (org) {
            where.OR.push({ orgId: org.id });
        }

        const tests = await prisma.mockTest.findMany({
            where,
            select: { id: true, testId: true, name: true, description: true, durationMins: true, scheduledAt: true, endsAt: true },
            orderBy: { scheduledAt: 'desc' },
            take: 50,
        });
        res.json({ success: true, data: tests });
    } catch (err) { next(err); }
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
    } catch (err) { next(err); }
});

// ─── Analytics ────────────────────────────────────────────────
router.get('/analytics/stats', async (req, res, next) => {
    try {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        
        const [
            totalTests,
            totalSeries,
            totalAttempts,
            activeStudents,
            totalRevenue
        ] = await Promise.all([
            prisma.mockTest.count({ where: { status: 'LIVE' } }),
            prisma.examCategory.count({ where: { isActive: true } }),
            prisma.testAttempt.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
            prisma.student.count({ where: { isActive: true } }),
            prisma.examCategory.aggregate({
                _sum: { price: true },
                where: { isFree: false }
            }),
        ]);

        res.json({
            success: true,
            data: {
                platformTests: totalTests,
                totalSeries: totalSeries,
                totalAttempts: totalAttempts,
                activeStudents: activeStudents,
                liveNow: Math.floor(Math.random() * 50) + 10, // Mock for now
                revenueMTD: totalRevenue._sum.price || 0,
            }
        });
    } catch (err) { next(err); }
});

// ─── Student Test Flow ─────────────────────────────────────────

// GET /mockbook/tests/:testId — fetch test meta info
router.get('/tests/:testId', async (req, res, next) => {
    try {
        const test = await prisma.mockTest.findFirst({
            where: { testId: req.params.testId },
            include: {
                sections: {
                    include: { set: { select: { name: true } } },
                    orderBy: { sortOrder: 'asc' },
                }
            }
        });
        if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
        res.json({ success: true, data: test });
    } catch (err) { next(err); }
});

// GET /mockbook/tests/:testId/questions — get shuffled/ordered questions for the test
router.get('/tests/:testId/questions', async (req, res, next) => {
    try {
        const test = await prisma.mockTest.findFirst({
            where: { testId: req.params.testId },
            include: {
                sections: {
                    orderBy: { sortOrder: 'asc' },
                    include: {
                        set: {
                            include: {
                                items: {
                                    orderBy: { sortOrder: 'asc' },
                                    include: {
                                        question: {
                                            include: {
                                                options: { orderBy: { sortOrder: 'asc' } }
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

        // Build flat list of questions with section name
        const questions: any[] = [];
        let qNumber = 1;
        for (const section of test.sections) {
            for (const item of section.set.items) {
                const q = item.question;
                questions.push({
                    id: q.id,
                    questionId: q.questionId,
                    number: qNumber++,
                    section: section.set.name || section.name,
                    text: q.textEn || q.textHi || '',
                    textHi: q.textHi,
                    type: q.type,
                    options: q.options.map((o: any) => ({
                        id: o.id,
                        text: o.textEn || o.textHi || '',
                        textHi: o.textHi,
                        isCorrect: false, // Never send correct answer to client
                    })),
                    marks: 1, // Default; TODO: per-section marks
                    negative: -0.33,
                    imageUrl: q.imageUrl,
                });
            }
        }

        // Shuffle if test.shuffleQuestions
        if (test.shuffleQuestions) {
            for (let i = questions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [questions[i], questions[j]] = [questions[j], questions[i]];
            }
        }

        res.json({
            success: true,
            data: {
                testId: test.testId,
                name: test.name,
                durationMins: test.durationMins,
                totalMarks: test.totalMarks,
                questions,
            }
        });
    } catch (err) { next(err); }
});

// POST /mockbook/tests/:testId/attempts — start or submit an attempt
router.post('/tests/:testId/attempts', async (req, res, next) => {
    try {
        const user = (req as any).user;
        const { action, answers } = req.body; // action: 'start' | 'submit'

        const test = await prisma.mockTest.findFirst({ where: { testId: req.params.testId } });
        if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

        // Find the student by userId
        const student = await prisma.student.findFirst({ where: { userId: user.id } });
        if (!student) return res.status(403).json({ success: false, message: 'Student profile not found. Please register as a student.' });

        if (action === 'start') {
            // Check if an IN_PROGRESS attempt already exists
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

            // Save answers and calculate score
            let score = 0;
            const savedAnswers: any[] = [];

            if (answers && Array.isArray(answers)) {
                for (const ans of answers) {
                    // Find correct options for this question
                    const correctOptions = await prisma.questionOption.findMany({
                        where: { questionId: ans.questionId, isCorrect: true },
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
                    });
                }

                await prisma.attemptAnswer.createMany({ data: savedAnswers });
            }

            // Calculate rank among submitted attempts
            const betterAttempts = await prisma.testAttempt.count({
                where: { testId: test.id, score: { gt: score }, status: 'SUBMITTED' }
            });

            const updatedAttempt = await prisma.testAttempt.update({
                where: { id: attempt.id },
                data: {
                    status: 'SUBMITTED',
                    submittedAt: new Date(),
                    score: Math.max(0, score),
                    rank: betterAttempts + 1,
                }
            });

            return res.json({ success: true, data: updatedAttempt });
        }

        return res.status(400).json({ success: false, message: 'Invalid action. Use "start" or "submit".' });
    } catch (err) { next(err); }
});

// GET /mockbook/attempts/:attemptId — get attempt result/analysis
router.get('/attempts/:attemptId', async (req, res, next) => {
    try {
        const user = (req as any).user;
        const student = await prisma.student.findFirst({ where: { userId: user.id } });
        if (!student) return res.status(403).json({ success: false, message: 'Not a student' });

        const attempt = await prisma.testAttempt.findUnique({
            where: { id: req.params.attemptId },
            include: {
                test: { select: { testId: true, name: true, durationMins: true, totalMarks: true } },
                answers: {
                    include: {
                        // Include question details for solutions tab
                    }
                }
            }
        });

        if (!attempt || attempt.studentId !== student.id) {
            return res.status(404).json({ success: false, message: 'Attempt not found' });
        }

        const totalAttempted = attempt.answers.filter((a: any) => a.selectedOptions.length > 0).length;
        const correct = attempt.answers.filter((a: any) => a.isCorrect).length;
        const accuracy = totalAttempted > 0 ? Math.round((correct / totalAttempted) * 100) : 0;

        res.json({
            success: true,
            data: {
                id: attempt.id,
                testId: attempt.test.testId,
                testName: attempt.test.name,
                score: attempt.score,
                totalMarks: attempt.totalMarks,
                rank: attempt.rank,
                attempted: totalAttempted,
                totalQuestions: attempt.answers.length,
                correct,
                accuracy,
                timeTakenSecs: attempt.timeTakenSecs,
                submittedAt: attempt.submittedAt,
            }
        });
    } catch (err) { next(err); }
});

// ─── Admin: Analytics ──────────────────────────────────────────

// GET /mockbook/analytics/stats — platform-wide metrics
router.get('/analytics/stats', async (req, res, next) => {
    try {
        const { orgId } = req.query;
        let orgFilter = {};
        if (orgId) {
            const org = await prisma.organization.findFirst({ where: { orgId: orgId as string } });
            if (org) orgFilter = { orgId: org.id };
        }

        const [platformTests, totalSeries, attemptsCount, studentsCount, liveNow] = await Promise.all([
            prisma.mockTest.count({ where: orgFilter }),
            prisma.examCategory.count({ where: orgFilter }),
            prisma.testAttempt.count({
                where: orgId ? { test: { orgId: (await prisma.organization.findFirst({ where: { orgId: orgId as string } }))?.id } } : {}
            }),
            prisma.user.count({ where: { role: 'STUDENT' } }),
            prisma.mockTest.count({ where: { ...orgFilter, status: 'LIVE' } })
        ]);

        // Mock revenue for now
        const revenueMTD = Math.floor(Math.random() * 50000) + 100000;

        res.json({
            success: true,
            data: {
                platformTests,
                totalSeries,
                totalAttempts: attemptsCount,
                activeStudents: studentsCount,
                liveNow,
                revenueMTD
            }
        });
    } catch (err) { next(err); }
});

// ─── Admin: Mock Test CRUD ─────────────────────────────────────

// GET /mockbook/admin/tests — list all tests (admin view, all orgs or filtered)
router.get('/admin/tests', async (req, res, next) => {
    try {
        const { orgId, subCategoryId, categoryId, status, search } = req.query;
        
        let orgDbId: string | undefined;
        if (orgId) {
            const org = await prisma.organization.findFirst({ where: { orgId: orgId as string } });
            orgDbId = org?.id;
        }

        const where: any = {};
        if (orgDbId) where.orgId = orgDbId;
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
    } catch (err) { next(err); }
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
                                items: { select: { id: true, sortOrder: true } }
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
    } catch (err) { next(err); }
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
    } catch (err) { next(err); }
});

// DELETE /mockbook/admin/tests/:id/sections/:sectionId — remove section
router.delete('/admin/tests/:id/sections/:sectionId', async (req, res, next) => {
    try {
        await prisma.mockTestSection.delete({
            where: { id: req.params.sectionId }
        });
        res.json({ success: true, message: "Section removed" });
    } catch (err) { next(err); }
});

// POST /mockbook/admin/tests — create new mock test
router.post('/admin/tests', async (req, res, next) => {
    try {
        const schema = z.object({
            orgId: z.string().min(1),
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
        
        // Resolve orgId string to db id
        const org = await prisma.organization.findFirst({ where: { orgId: body.orgId } });
        if (!org) return res.status(404).json({ success: false, message: 'Organization not found' });

        // Generate a unique testId
        const testIdBase = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
        const testId = `${testIdBase}-${Date.now()}`;

        const test = await prisma.mockTest.create({
            data: {
                testId,
                pin: Math.floor(100000 + Math.random() * 900000).toString(),
                orgId: org.id,
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
    } catch (err) { next(err); }
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
    } catch (err) { next(err); }
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
    } catch (err) { next(err); }
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
    } catch (err) { next(err); }
});

// GET /mockbook/admin/students — students with attempt stats (admin view)
router.get('/admin/students', async (req, res, next) => {
    try {
        const { orgId, search } = req.query;
        
        let org: any = null;
        if (orgId) {
            org = await prisma.organization.findFirst({ where: { orgId: orgId as string } });
        }

        const where: any = {};
        if (org) where.orgId = org.id;
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
    } catch (err) { next(err); }
});

// GET /mockbook/admin/live-tests — currently live and upcoming scheduled tests
router.get('/admin/live-tests', async (req, res, next) => {
    try {
        const { orgId } = req.query;
        let orgDbId: string | undefined;
        if (orgId) {
            const org = await prisma.organization.findFirst({ where: { orgId: orgId as string } });
            orgDbId = org?.id;
        }

        const [liveTests, scheduledTests] = await Promise.all([
            prisma.mockTest.findMany({
                where: {
                    status: 'LIVE',
                    ...(orgDbId && { orgId: orgDbId }),
                },
                include: { _count: { select: { attempts: true } } },
                orderBy: { scheduledAt: 'asc' }
            }),
            prisma.mockTest.findMany({
                where: {
                    status: 'DRAFT',
                    scheduledAt: { gte: new Date() },
                    ...(orgDbId && { orgId: orgDbId }),
                },
                include: { _count: { select: { attempts: true } } },
                orderBy: { scheduledAt: 'asc' },
                take: 20,
            }),
        ]);

        res.json({ success: true, data: { live: liveTests, scheduled: scheduledTests } });
    } catch (err) { next(err); }
});

// GET /mockbook/analytics/student/:studentId/overall — student 30-day performance
router.get('/analytics/student/:studentId/overall', async (req, res, next) => {
    try {
        const studentId = req.params.studentId;
        const days = parseInt(req.query.days as string) || 30;
        const dateFrom = new Date();
        dateFrom.setDate(dateFrom.getDate() - days);

        const attempts = await prisma.testAttempt.findMany({
            where: {
                studentId,
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

        const student = await prisma.student.findUnique({
            where: { id: studentId },
            select: { name: true, studentId: true }
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
    } catch (err) { next(err); }
});

// GET /mockbook/attempts/:attemptId/report — detailed post-test single attempt report
router.get('/attempts/:attemptId/report', async (req, res, next) => {
    try {
        const attemptId = req.params.attemptId;
        const attempt = await prisma.testAttempt.findUnique({
            where: { id: attemptId },
            include: {
                test: true,
                student: { select: { name: true, studentId: true } },
                answers: true
            }
        });

        if (!attempt) return res.status(404).json({ success: false, message: "Attempt not found" });

        let correct = 0, incorrect = 0, unattempted = 0;
        let totalTime = 0;

        const solutions = attempt.answers.map(ans => {
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

export default router;

