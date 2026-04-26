import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { authenticate, requireSuperAdmin } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';

const router = Router();

// Zod schema for theme config
const themeConfigSchema = z.object({
    layoutVariant: z.enum(['ssc', 'railway', 'upsc', 'jee', 'testbook', 'testrankking', 'eduquity', 'default']).default('default'),
    paletteColorScheme: z.record(z.string()).default({}),
    paletteStyle: z.enum(['grid', 'list']).default('grid'),
    timerPosition: z.enum(['header-right', 'header-center', 'floating']).default('header-right'),
    timerFormat: z.enum(['countdown', 'countup']).default('countdown'),
    showQuestionMarks: z.boolean().default(true),
    showNegativeMarks: z.boolean().default(true),
    showSectionTabs: z.boolean().default(false),
    showQuestionTypeBadge: z.boolean().default(false),
    fontSize: z.enum(['small', 'medium', 'large']).default('medium'),
    primaryColor: z.string().default('#F4511E'),
    secondaryColor: z.string().default('#1976D2'),
    backgroundColor: z.string().default('#FFFFFF'),
    sidebarBackground: z.string().default('#F8F9FA'),
    headerBackground: z.string().default('#FFFFFF'),
    optionStyle: z.enum(['radio-cards', 'boxed', 'minimal']).default('radio-cards'),
    showLegend: z.boolean().default(true),
    enableAutoSubmit: z.boolean().default(true),
    submitWarningMinutes: z.number().default(5),
    customCss: z.string().optional(),
});

const createThemeSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    layoutVariant: z.enum(['ssc', 'railway', 'upsc', 'jee', 'testbook', 'testrankking', 'eduquity', 'default']).default('default'),
    config: themeConfigSchema.default({}),
    screenshotUrl: z.string().optional().nullable(),
    isDefault: z.boolean().default(false),
    isActive: z.boolean().default(true),
});

const updateThemeSchema = createThemeSchema.partial();

// Authentication required for all routes
router.use(authenticate);

// ─── STUDENT / PUBLIC ACCESSIBLE ROUTES ───────────────────────
// (Must come before generic /:id route)

// GET /exam-interface-themes/default
router.get('/default', async (_req, res, next) => {
    try {
        const theme = await prisma.examInterfaceTheme.findFirst({
            where: { isDefault: true, isActive: true },
        });
        res.json({ success: true, data: theme });
    } catch (err) {
        next(err);
    }
});

// GET /exam-interface-themes/for-exam/:examId
router.get('/for-exam/:examId', async (req, res, next) => {
    try {
        const { examId } = req.params;
        const test = await prisma.mockTest.findFirst({
            where: { OR: [{ testId: examId }, { id: examId }] },
            select: {
                interfaceThemeId: true,
                subCategory: {
                    select: {
                        category: {
                            select: {
                                interfaceThemeId: true,
                                folder: {
                                    select: { interfaceThemeId: true },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!test) throw new AppError('Test not found', 404);

        let theme = null;

        // Priority 1: Test-level theme
        if (test?.interfaceThemeId) {
            theme = await prisma.examInterfaceTheme.findUnique({
                where: { id: test.interfaceThemeId },
            });
        }

        // Priority 2: Category-level theme
        const categoryThemeId = (test as any)?.subCategory?.category?.interfaceThemeId;
        if (!theme && categoryThemeId) {
            theme = await prisma.examInterfaceTheme.findUnique({
                where: { id: categoryThemeId },
            });
        }

        // Priority 3: Folder-level theme
        const folderThemeId = (test as any)?.subCategory?.category?.folder?.interfaceThemeId;
        if (!theme && folderThemeId) {
            theme = await prisma.examInterfaceTheme.findUnique({
                where: { id: folderThemeId },
            });
        }

        // Priority 4: Global default theme
        if (!theme) {
            theme = await prisma.examInterfaceTheme.findFirst({
                where: { isDefault: true, isActive: true },
            });
        }

        res.json({ success: true, data: theme });
    } catch (err) {
        next(err);
    }
});

// ─── ADMIN ONLY ROUTES ────────────────────────────────────────
router.use(requireSuperAdmin);

// GET /exam-interface-themes (list all)
router.get('/', async (_req, res, next) => {
    try {
        const themes = await prisma.examInterfaceTheme.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json({ success: true, data: themes });
    } catch (err) {
        next(err);
    }
});

// GET /exam-interface-themes/:id
router.get('/:id', async (req, res, next) => {
    try {
        const theme = await prisma.examInterfaceTheme.findUnique({
            where: { id: req.params.id },
        });
        if (!theme) throw new AppError('Theme not found', 404);
        res.json({ success: true, data: theme });
    } catch (err) {
        next(err);
    }
});

// POST /exam-interface-themes
router.post('/', async (req, res, next) => {
    try {
        const body = createThemeSchema.parse(req.body);

        // If setting as default, unset any existing default
        if (body.isDefault) {
            await prisma.examInterfaceTheme.updateMany({
                where: { isDefault: true },
                data: { isDefault: false },
            });
        }

        const theme = await prisma.examInterfaceTheme.create({ data: body });
        res.status(201).json({ success: true, data: theme });
    } catch (err) {
        next(err);
    }
});

// PATCH /exam-interface-themes/:id
router.patch('/:id', async (req, res, next) => {
    try {
        const body = updateThemeSchema.parse(req.body);

        // If setting as default, unset any existing default
        if (body.isDefault) {
            await prisma.examInterfaceTheme.updateMany({
                where: { isDefault: true, id: { not: req.params.id } },
                data: { isDefault: false },
            });
        }

        const theme = await prisma.examInterfaceTheme.update({
            where: { id: req.params.id },
            data: body,
        });
        res.json({ success: true, data: theme });
    } catch (err) {
        next(err);
    }
});

// DELETE /exam-interface-themes/:id
router.delete('/:id', async (req, res, next) => {
    try {
        // Check if theme is in use
        const [testsUsingTheme, foldersUsingTheme, categoriesUsingTheme] = await Promise.all([
            prisma.mockTest.count({
                where: { interfaceThemeId: req.params.id },
            }),
            prisma.examFolder.count({
                where: { interfaceThemeId: req.params.id },
            }),
            prisma.examCategory.count({
                where: { interfaceThemeId: req.params.id },
            }),
        ]);

        const totalUsing = testsUsingTheme + foldersUsingTheme + categoriesUsingTheme;
        if (totalUsing > 0) {
            throw new AppError(
                `Cannot delete: theme is assigned to ${testsUsingTheme} test(s), ${foldersUsingTheme} folder(s), ${categoriesUsingTheme} category(s). Reassign them first.`,
                400
            );
        }

        await prisma.examInterfaceTheme.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Theme deleted' });
    } catch (err) {
        next(err);
    }
});

export default router;
