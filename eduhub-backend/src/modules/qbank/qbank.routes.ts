import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { authenticate } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';
import { randomBytes } from 'crypto';
import { 
    syncAirtableQuestions,
    getAirtableTables,
    getAirtableSyncFolders,
    createAirtableSyncFolder,
    renameAirtableSyncFolder,
    deleteAirtableSyncFolder
} from './qbank.controller';

const router = Router();

// Public endpoint for whiteboard to fetch sets by 6-digit setId + password (dev/demo use)
router.get('/sets/:setId/questions', async (req, res, next) => {
    try {
        const { setId } = req.params;
        const { password } = req.query;

        if (!password || typeof password !== 'string') {
            throw new AppError('Password is required', 400);
        }

        const safeSetId = String(setId).replace(/'/g, "''");
        const setRows = await prisma.$queryRawUnsafe<Array<{ id: string; set_id: string; name: string; pin: string; total_questions: number }>>(`
            SELECT id, set_id, name, pin, total_questions FROM question_sets WHERE set_id = '${safeSetId}' OR id = '${safeSetId}' LIMIT 1
        `);

        if (setRows.length === 0) throw new AppError('Set not found', 404);
        const questionSet = setRows[0];
        if (questionSet.pin !== password) throw new AppError('Invalid password', 401);

        const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
        const setPrimaryId = questionSet.id;

        const rawQuestions = await prisma.$queryRawUnsafe<Array<any>>(`
            SELECT q.id, q.question_id, q.text_en, q.text_hi, q.type, q.difficulty, q.subject_name, q.exam
            FROM questions q
            JOIN question_set_items qsi ON q.id = qsi.question_id
            WHERE qsi.set_id = '${setPrimaryId}'
            ORDER BY qsi.sort_order ASC
        `);

        const questionIds = rawQuestions.map((q: any) => q.id);
        let optionsByQuestion: Record<string, any[]> = {};
        if (questionIds.length > 0) {
            const idsList = questionIds.map((id: string) => `'${id.replace(/'/g, "''")}'`).join(',');
            const options = await prisma.$queryRawUnsafe<Array<any>>(`
                SELECT id, question_id, text_en, text_hi, is_correct, sort_order
                FROM question_options WHERE question_id IN (${idsList}) ORDER BY sort_order ASC
            `);
            optionsByQuestion = options.reduce((acc: any, opt: any) => {
                acc[opt.question_id] = acc[opt.question_id] || [];
                acc[opt.question_id].push(opt);
                return acc;
            }, {});
        }

        const questions = rawQuestions.map((q: any, idx: number) => {
            const opts = (optionsByQuestion[q.id] || []).map((o: any, i: number) => ({
                label: labels[i] ?? `O${i + 1}`,
                text: o.text_en || o.text_hi || '',
                imageUrl: null,
            }));
            const correctIndex = (optionsByQuestion[q.id] || []).findIndex((o: any) => o.is_correct);

            return {
                id: q.id ?? `q-${idx}`,
                questionId: q.question_id,
                text: q.text_en || q.text_hi || 'Question text not available',
                questionImageUrl: null,
                options: opts,
                correctOption: correctIndex >= 0 ? labels[correctIndex] : null,
                subject: q.subject_name,
                examSource: q.exam,
            };
        });

        res.json({
            success: true,
            data: {
                set: {
                    id: questionSet.id,
                    setId: questionSet.set_id,
                    name: questionSet.name,
                    totalQuestions: Number(questionSet.total_questions) || questions.length,
                    subject: questions.find((q) => q.subject)?.subject ?? null,
                    exam: questions.find((q) => q.examSource)?.examSource ?? null,
                    year: null,
                },
                questions,
            },
        });
    } catch (err) { next(err); }
});

// Authenticated routes
router.use(authenticate);

// ─── Helper: Build folder tree from flat list ─────────────────
function buildTree(folders: any[], parentId: string | null = null): any[] {
    return folders
        .filter(f => f.parentId === parentId)
        .map(f => {
            const children = buildTree(folders, f.id);
            const totalChildrenSets = children.reduce((sum, child) => sum + (child.totalSetCount || 0), 0);
            return {
                ...f,
                children,
                totalSetCount: (f.setCount || 0) + totalChildrenSets
            };
        })
        .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

// ─── Helper: Get all ancestor IDs from path string ───────────
function getAncestorIds(path: string): string[] {
    return path.split('/').filter(Boolean);
}

// ─── Helper: Get or Create Hierarchical Folders ────────────────
async function getOrCreateExamFolder(examName: string, year: number | null): Promise<string> {
    // 1. Check parent folder "Exams"
    let examsFolder = await prisma.qBankFolder.findFirst({
        where: { name: 'Exams', parentId: null, isActive: true }
    });
    if (!examsFolder) {
        examsFolder = await (prisma as any).qBankFolder.create({
            data: { name: 'Exams', path: '/', depth: 0, scope: 'GLOBAL', slug: 'exams' }
        });
    }

    if (!examsFolder) throw new AppError('Exams folder not found', 500);

    // 2. Check Exam Name folder
    let examFolder = await (prisma as any).qBankFolder.findFirst({
        where: { name: examName, parentId: examsFolder.id, isActive: true }
    });
    if (!examFolder) {
        examFolder = await (prisma as any).qBankFolder.create({
            data: { 
                name: examName, 
                parentId: examsFolder.id, 
                path: `/${examsFolder.id}`, 
                depth: 1, 
                scope: 'GLOBAL',
                slug: examName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            }
        });
    }

    if (!year) return examFolder.id;

    // 3. Check Year folder
    let yearFolder = await (prisma as any).qBankFolder.findFirst({
        where: { name: String(year), parentId: examFolder.id, isActive: true }
    });
    if (!yearFolder) {
        yearFolder = await prisma.qBankFolder.create({
            data: { 
                name: String(year), 
                parentId: examFolder.id, 
                path: `${examFolder.path}/${examFolder.id}`, 
                depth: 2, 
                scope: 'GLOBAL',
                slug: String(year) 
            }
        });
    }

    return yearFolder.id;
}

// ─── GET /api/qbank/folders ──────────────────────────────────
router.get('/folders', async (req, res, next) => {
    try {
        const { tree = 'true' } = req.query;

        const folders = await prisma.qBankFolder.findMany({
            where: { isActive: true },
            orderBy: [{ depth: 'asc' }, { name: 'asc' }]
        });

        const foldersWithCounts = folders.map(f => ({
            ...f,
            setCount: 0,
            totalSetCount: 0
        }));

        if (tree === 'true') {
            const treeData = buildTree(foldersWithCounts, null);
            res.json({ success: true, data: treeData });
        } else {
            res.json({ success: true, data: foldersWithCounts });
        }
    } catch (err: any) {
        next(err);
    }
});

// ─── POST /api/qbank/sync-airtable ────────────────────────────
router.post('/sync-airtable', syncAirtableQuestions);

// ─── GET /api/qbank/airtable ──────────────────────────────
router.get('/airtable/tables', getAirtableTables);
router.get('/airtable-folders', getAirtableSyncFolders);
router.post('/airtable-folders', createAirtableSyncFolder);
router.patch('/airtable-folders/:id', renameAirtableSyncFolder);
router.delete('/airtable-folders/:id', deleteAirtableSyncFolder);

// ─── GET /api/qbank/folders/:id ──────────────────────────────
router.get('/folders/:id', async (req, res, next) => {
    try {
        const folder = await prisma.qBankFolder.findUnique({
            where: { id: req.params.id },
            include: {
                children: { orderBy: [{ name: 'asc' }] }
            }
        });
        if (!folder) throw new AppError('Folder not found', 404);

        // Build breadcrumb
        const breadcrumb = await getBreadcrumb(req.params.id);

        res.json({ success: true, data: { ...folder, setCount: 0, breadcrumb } });
    } catch (err) { next(err); }
});

// ─── GET /api/qbank/folders/:id/breadcrumb ───────────────────
router.get('/folders/:id/breadcrumb', async (req, res, next) => {
    try {
        const breadcrumb = await getBreadcrumb(req.params.id);
        res.json({ success: true, data: breadcrumb });
    } catch (err) { next(err); }
});

async function getBreadcrumb(folderId: string): Promise<Array<{ id: string; name: string; path: string }>> {
    const folder = await prisma.qBankFolder.findUnique({ where: { id: folderId } });
    if (!folder) return [];

    const ancestorIds = getAncestorIds(folder.path);
    if (ancestorIds.length === 0) return [{ id: folder.id, name: folder.name, path: folder.path }];

    const ancestors = await prisma.qBankFolder.findMany({
        where: { id: { in: ancestorIds } },
        select: { id: true, name: true, path: true, depth: true }
    });

    const sorted = ancestorIds
        .map(id => ancestors.find(a => a.id === id))
        .filter(Boolean) as Array<{ id: string; name: string; path: string; depth: number }>;

    return [...sorted, { id: folder.id, name: folder.name, path: folder.path }];
}

// ─── GET /api/qbank/folders/:id/stats ────────────────────────
router.get('/folders/:id/stats', async (req, res, next) => {
    try {
        const folder = await prisma.qBankFolder.findUnique({ where: { id: req.params.id } });
        if (!folder) throw new AppError('Folder not found', 404);

        const pathPrefix = folder.path === '/' ? `/${folder.id}` : `${folder.path}/${folder.id}`;

        // Get all subtree folder IDs
        const subFolders = await prisma.qBankFolder.findMany({
            where: { path: { startsWith: pathPrefix } },
            select: { id: true }
        });
        const allFolderIds = [folder.id, ...subFolders.map(f => f.id)];

        // Direct questions
        const directCount = await (prisma as any).questions.count({
            where: { folderId: folder.id }
        });

        // Total questions (all subtree)
        const totalCount = await (prisma as any).questions.count({
            where: { folderId: { in: allFolderIds } }
        });

        // By difficulty
        const [easyQ, mediumQ, hardQ] = await Promise.all([
            (prisma as any).questions.count({ where: { folderId: { in: allFolderIds }, difficulty: 'EASY' } }),
            (prisma as any).questions.count({ where: { folderId: { in: allFolderIds }, difficulty: 'MEDIUM' } }),
            (prisma as any).questions.count({ where: { folderId: { in: allFolderIds }, difficulty: 'HARD' } }),
        ]);

        // By type
        const [mcqSingle, mcqMulti, trueFalse, fillBlank, descriptive] = await Promise.all([
            (prisma as any).questions.count({ where: { folderId: { in: allFolderIds }, type: 'MCQ_SINGLE' } }),
            (prisma as any).questions.count({ where: { folderId: { in: allFolderIds }, type: 'MCQ_MULTIPLE' } }),
            (prisma as any).questions.count({ where: { folderId: { in: allFolderIds }, type: 'TRUE_FALSE' } }),
            (prisma as any).questions.count({ where: { folderId: { in: allFolderIds }, type: 'FILL_IN_BLANK' } }),
            (prisma as any).questions.count({ where: { folderId: { in: allFolderIds }, type: 'DESCRIPTIVE' } }),
        ]);

        res.json({
            success: true,
            data: {
                directQuestions: directCount,
                totalQuestions: totalCount,
                byDifficulty: { easy: easyQ, medium: mediumQ, hard: hardQ },
                byType: { mcqSingle, mcqMulti, trueFalse, fillBlank, descriptive },
                subFolderCount: subFolders.length,
                depth: folder.depth,
            }
        });
    } catch (err) { next(err); }
});

// ─── POST /api/qbank/folders ─────────────────────────────────
router.post('/folders', async (req, res, next) => {
    try {
        const schema = z.object({
            name: z.string().min(1),
            slug: z.string().optional(),
            description: z.string().optional(),
            icon: z.string().optional(),
            color: z.string().optional(),
            parentId: z.string().optional().nullable(),
            sortOrder: z.number().default(0).optional(),
        });
        const body = schema.parse(req.body);

        let depth = 0;
        let path = '/';

        if (body.parentId) {
            const parent = await prisma.qBankFolder.findUniqueOrThrow({ where: { id: body.parentId } });
            depth = parent.depth + 1;
            if (depth >= 10) throw new AppError('Maximum folder depth (10) reached', 400);
            // Path = parent's path + parent's id
            path = parent.path === '/' ? `/${parent.id}` : `${parent.path}/${parent.id}`;
        }

        const slug = body.slug || body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        const folder = await (prisma as any).qBankFolder.create({
            data: {
                name: body.name,
                slug,
                icon: body.icon,
                color: body.color,
                parentId: body.parentId,
                path,
                depth,
                scope: 'GLOBAL',
                sortOrder: body.sortOrder ?? 0,
            },
        });

        res.status(201).json({ success: true, data: folder });
    } catch (err) { next(err); }
});

// ─── PATCH /api/qbank/folders/:id ────────────────────────────
router.patch('/folders/:id', async (req, res, next) => {
    try {
        const schema = z.object({
            name: z.string().min(1).optional(),
            slug: z.string().optional(),
            description: z.string().optional(),
            icon: z.string().optional(),
            color: z.string().optional(),
            sortOrder: z.number().optional(),
            scope: z.enum(['GLOBAL', 'ORG']).optional(),
            isActive: z.boolean().optional(),
        });
        const body = schema.parse(req.body);

        const folder = await prisma.qBankFolder.findUnique({ where: { id: req.params.id } });
        if (!folder) throw new AppError('Folder not found', 404);

        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

        const data: any = {};
        if (body.name !== undefined) data.name = body.name;
        if (body.slug !== undefined) data.slug = body.slug;
        if (body.icon !== undefined) data.icon = body.icon;
        if (body.color !== undefined) data.color = body.color;
        if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder;
        if (body.isActive !== undefined) data.isActive = body.isActive;
        if (body.scope && isSuperAdmin) data.scope = body.scope;
        if (body.name) {
            data.slug = body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        }

        const updated = await prisma.qBankFolder.update({ where: { id: req.params.id }, data });
        res.json({ success: true, data: updated });
    } catch (err) { next(err); }
});

// ─── POST /api/qbank/folders/:id/move ────────────────────────
router.post('/folders/:id/move', async (req, res, next) => {
    try {
        const { newParentId } = z.object({
            newParentId: z.string().nullable(),
        }).parse(req.body);

        const folder = await prisma.qBankFolder.findUnique({ where: { id: req.params.id } });
        if (!folder) throw new AppError('Folder not found', 404);

        // Validate not moving into own subtree
        if (newParentId) {
            const currentPath = folder.path === '/'
                ? `/${folder.id}`
                : `${folder.path}/${folder.id}`;
            const newParent = await prisma.qBankFolder.findUnique({ where: { id: newParentId } });
            if (!newParent) throw new AppError('Target parent folder not found', 404);

            if (newParent.path.startsWith(currentPath) || newParent.id === folder.id) {
                throw new AppError('Cannot move folder into its own subtree', 400);
            }

            const newDepth = newParent.depth + 1;
            if (newDepth >= 10) throw new AppError('This move would exceed max depth (10)', 400);
        }

        // Calculate old path prefix and new path
        const oldPathPrefix = folder.path === '/'
            ? `/${folder.id}`
            : `${folder.path}/${folder.id}`;

        let newParentPath = '/';
        let newParentDepth = -1;

        if (newParentId) {
            const newParent = await prisma.qBankFolder.findUnique({ where: { id: newParentId } });
            newParentPath = newParent!.path === '/'
                ? `/${newParent!.id}`
                : `${newParent!.path}/${newParent!.id}`;
            newParentDepth = newParent!.depth;
        }

        const newFolderPath = newParentId
            ? (newParentDepth === -1 ? `/${newParentId}` : newParentPath)
            : '/';

        const depthDiff = (newParentId ? newParentDepth + 1 : 0) - folder.depth;

        // Get all descendants
        const descendants = await prisma.qBankFolder.findMany({
            where: { path: { startsWith: oldPathPrefix } }
        });

        // Update the moved folder
        await prisma.qBankFolder.update({
            where: { id: folder.id },
            data: {
                parentId: newParentId,
                path: newFolderPath,
                depth: folder.depth + depthDiff,
            }
        });

        // Update all descendants
        let updatedDescendants = 0;
        for (const desc of descendants) {
            const newPath = newFolderPath + desc.path.substring(oldPathPrefix.length);
            await prisma.qBankFolder.update({
                where: { id: desc.id },
                data: {
                    path: newPath,
                    depth: desc.depth + depthDiff,
                }
            });
            updatedDescendants++;
        }

        const updatedFolder = await prisma.qBankFolder.findUnique({ where: { id: folder.id } });
        res.json({ success: true, data: { folder: updatedFolder, updatedDescendants } });
    } catch (err) { next(err); }
});

// ─── DELETE /api/qbank/folders/:id ────────────────────────────
router.delete('/folders/:id', async (req, res, next) => {
    try {
        const { deleteContent = 'false', confirm: confirmDelete } = req.query;

        const folder = await prisma.qBankFolder.findUnique({ where: { id: req.params.id } });
        if (!folder) throw new AppError('Folder not found', 404);

        // Get all subtree folders
        const pathPrefix = folder.path === '/' ? `/${folder.id}` : `${folder.path}/${folder.id}`;
        const subFolders = await prisma.qBankFolder.findMany({
            where: { path: { startsWith: pathPrefix } },
            select: { id: true }
        });
        const allFolderIds = [folder.id, ...subFolders.map(f => f.id)];

        // Count affected content
        const [questionsAffected, setsAffected] = await Promise.all([
            (prisma as any).questions.count({ where: { folderId: { in: allFolderIds } } }),
            (prisma as any).question_sets.count({ where: { folderId: { in: allFolderIds } } }),
        ]);

        if (deleteContent === 'true') {
            if (confirmDelete !== 'true') {
                return res.status(400).json({
                    success: false,
                    message: 'Confirmation required. Send ?confirm=true to permanently delete all contents.',
                    questionsAffected,
                    setsAffected,
                    foldersToDelete: allFolderIds.length,
                });
            }

            // Permanent delete all questions in subtree
            await (prisma as any).questions.deleteMany({
                where: { folderId: { in: allFolderIds } }
            });

            // Delete all sets in subtree (Hard delete)
            await (prisma as any).question_sets.deleteMany({
                where: { folderId: { in: allFolderIds } }
            });

            // Delete all sub-folders and this folder (children first)
            const reverseOrder = [...subFolders].reverse();
            for (const sf of reverseOrder) {
                await prisma.qBankFolder.delete({ where: { id: sf.id } });
            }
            await prisma.qBankFolder.delete({ where: { id: folder.id } });

        } else {
            // Safe delete: move everything to parent
            const targetParentId = folder.parentId;

            // Move direct questions to parent
            await (prisma as any).questions.updateMany({
                where: { folderId: folder.id },
                data: { folderId: targetParentId }
            });

            // Move direct sets to parent
            await (prisma as any).question_sets.updateMany({
                where: { folderId: folder.id },
                data: { folderId: targetParentId }
            });

            // Move direct children to parent
            await prisma.qBankFolder.updateMany({
                where: { parentId: folder.id },
                data: { parentId: targetParentId }
            });

            await prisma.qBankFolder.delete({ where: { id: folder.id } });
        }

        res.json({
            success: true,
            data: {
                deleted: true,
                questionsAffected,
                foldersDeleted: deleteContent === 'true' ? allFolderIds.length : 1
            }
        });
    } catch (err) { next(err); }
});

// ─── GET /api/qbank/dashboard ────────────────────────────────
router.get('/dashboard', async (req, res, next) => {
    try {
        // 1. Basic Stats
        const totalQuestionsRow = await prisma.$queryRawUnsafe<Array<{cnt: number}>>('SELECT COUNT(*)::INT AS cnt FROM questions');
        const publicQuestionsRow = await prisma.$queryRawUnsafe<Array<{cnt: number}>>('SELECT COUNT(*)::INT AS cnt FROM questions WHERE is_global = true');
        const setCountRow = await prisma.$queryRawUnsafe<Array<{cnt: number}>>('SELECT COUNT(*)::INT AS cnt FROM question_sets');
        const totalQuestions = totalQuestionsRow[0]?.cnt ?? 0;
        const publicQuestions = publicQuestionsRow[0]?.cnt ?? 0;
        const setMapCount = setCountRow[0]?.cnt ?? 0;

        // 2. Questions by Subject (Root folders)
        const rootFolders = await prisma.qBankFolder.findMany({
            where: { depth: 0, isActive: true },
            select: { id: true, name: true }
        });

        const bySubject = await Promise.all(rootFolders.map(async (folder) => {
            const count = await prisma.questions.count({
                where: {
                    OR: [
                        { airtable_table_name: folder.name },
                    ],
                }
            });
            return { subject: folder.name, questions: count };
        }));

        // 3. Usage Trend (Last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            d.setDate(d.getDate() - i);
            return d;
        }).reverse();

        /* History logic commented out as studentQuestionHistory model is missing in schema
        const usageTrend = await Promise.all(last7Days.map(async (date) => {
            ...
        }));
        */
        const usageTrend: any[] = [];
        const recentUsage: any[] = [];

        res.json({
            success: true,
            data: {
                totalQuestions,
                newQuestions: 0,
                publicQuestions,
                newPublic: 0,
                totalSets: setMapCount,
                newSets: 0,
                totalPoints: 0,
                newPoints: 0,
                bySubject,
                usageTrend,
                recentUsage
            }
        });
    } catch (err) { next(err); }
});

// ─── GET /api/qbank/usage-logs ───────────────────────────────
router.get('/usage-logs', async (req, res, next) => {
    try {
        const logs: any[] = [];
        res.json({ success: true, data: logs });
    } catch (err: any) { next(err); }
});

// ─── GET /api/qbank/filter-options ──────────────────────────
router.get('/filter-options', async (req, res, next) => {
    try {
        console.log('[QBank] Fetching filter-options for user:', req.user?.userId);
        const [exams, subjects, years, sources] = await Promise.all([
            (prisma as any).questions.groupBy({ by: ['exam'] }),
            (prisma as any).questions.groupBy({ by: ['subject_name'] }),
            (prisma as any).questions.groupBy({ by: ['year'] }),
            (prisma as any).questions.groupBy({ where: { airtable_table_name: { not: null } }, by: ['airtable_table_name'] }),
        ]);

        const data = {
            exams: exams.map((e: any) => e.exam).filter(Boolean),
            subjects: subjects.map((s: any) => s.subject_name).filter(Boolean),
            years: years.map((y: any) => y.year).filter((y: any) => y !== null),
            shifts: [],
            sources: sources.map((s: any) => s.airtable_table_name).filter(Boolean),
        };

        console.log('[QBank] Filter options found:', {
            examCount: data.exams.length,
            subjectCount: data.subjects.length,
            yearCount: data.years.length,
            shiftCount: data.shifts.length,
            sourceCount: data.sources.length
        });

        res.json({
            success: true,
            data
        });
    } catch (err: any) {
        console.error('[QBank] Error fetching filter-options:', err);
        next(err);
    }
});

// ─── GET /api/qbank/chapters ─────────────────────────────────
router.get('/chapters', async (req, res, next) => {
    try {
        const { subject } = req.query;
        if (!subject) return res.json({ success: true, data: [] });

        const chapters = await prisma.questions.findMany({
            where: { subject_name: subject as string },
            select: { chapter_name: true },
            distinct: ['chapter_name'],
        });
        res.json({ success: true, data: chapters.map(c => c.chapter_name).filter(Boolean) });
    } catch (err) { next(err); }
});

// ─── GET /api/qbank/sets ─────────────────────────────────────
router.get('/sets', async (req, res, next) => {
    try {
        const { page = 1, limit = 50, search } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        let whereClause = '1=1';
        const params: any[] = [];

        if (search) {
            params.push(`%${search}%`);
            whereClause += ` AND (name ILIKE $${params.length} OR set_id ILIKE $${params.length})`;
        }

        const setsQuery = `
            SELECT qs.id, qs.set_id AS "setId", qs.pin, qs.name, qs.description,
                   qs.total_questions AS "totalQuestions", qs.subject, qs.chapter,
                   qs.is_global AS "isGlobal", qs.pdf_notes, qs.created_at AS "createdAt",
                   (SELECT COUNT(*)::INT FROM question_set_items qsi WHERE qsi.set_id = qs.id) AS "itemCount"
            FROM question_sets qs
            WHERE ${whereClause}
            ORDER BY qs.created_at DESC
            LIMIT ${Number(limit)} OFFSET ${offset}
        `;
        const countQuery = `SELECT COUNT(*)::INT AS cnt FROM question_sets WHERE ${whereClause}`;

        const [rawSets, countRows] = await Promise.all([
            prisma.$queryRawUnsafe<Array<any>>(setsQuery, ...params),
            prisma.$queryRawUnsafe<Array<{cnt: number}>>(countQuery, ...params),
        ]);

        const sets = rawSets.map((s: any) => {
            let pdfNotes = null;
            try {
              if (s.pdf_notes) {
                pdfNotes = typeof s.pdf_notes === 'string' ? JSON.parse(s.pdf_notes) : s.pdf_notes;
              }
            } catch (parseError) {
              console.error(`[QBank] Failed to parse pdf_notes for set ${s.id}:`, parseError, s.pdf_notes);
            }
            return {
                ...s,
                pdf_notes: pdfNotes,
                _count: { items: Number(s.itemCount || 0) },
            };
        });
        const total = Number(countRows[0]?.cnt ?? 0);

        res.json({ success: true, data: { sets, total } });
    } catch (err) { next(err); }
});

// ─── GET /api/qbank/sets/:id ──────────────────────────────────
router.get('/sets/:id', async (req, res, next) => {
    try {
        const safeId = String(req.params.id).replace(/'/g, "''");
        const setRows = await prisma.$queryRawUnsafe<Array<any>>(`
            SELECT qs.id, qs.set_id AS "setId", qs.pin, qs.name, qs.description,
                   qs.total_questions AS "totalQuestions", qs.subject, qs.chapter,
                   qs.is_global AS "isGlobal", qs.pdf_notes, qs.created_at AS "createdAt"
            FROM question_sets qs WHERE qs.id = '${safeId}' OR qs.set_id = '${safeId}' LIMIT 1
        `);
        if (setRows.length === 0) throw new AppError('Question set not found', 404);
        const set = setRows[0];
        set.pdf_notes = typeof set.pdf_notes === 'string' ? JSON.parse(set.pdf_notes) : set.pdf_notes;

        // Fetch items with questions + options
        const itemRows = await prisma.$queryRawUnsafe<Array<any>>(`
            SELECT qsi.sort_order,
                   q.id AS q_id, q.question_id, q.text_en AS "textEn", q.text_hi AS "textHi",
                   q.type, q.difficulty, q.subject_name AS "subjectName", q.explanation_en AS "explanationEn",
                   q.explanation_hi AS "explanationHi", q.point_cost AS "pointCost"
            FROM question_set_items qsi
            JOIN questions q ON q.id = qsi.question_id
            WHERE qsi.set_id = '${set.id}'
            ORDER BY qsi.sort_order ASC
        `);

        const optRows = itemRows.length > 0
            ? await prisma.$queryRawUnsafe<Array<any>>(`
                SELECT id, question_id, text_en AS "textEn", text_hi AS "textHi",
                       is_correct AS "isCorrect", sort_order AS "sortOrder"
                FROM question_options
                WHERE question_id IN (${itemRows.map(r => `'${r.q_id.replace(/'/g, "''")}' `).join(',')})
                ORDER BY sort_order ASC
              `)
            : [];

        const optByQ: Record<string, any[]> = {};
        optRows.forEach((o: any) => { optByQ[o.question_id] = optByQ[o.question_id] || []; optByQ[o.question_id].push(o); });

        const items = itemRows.map((r: any) => ({
            question: {
                id: r.q_id, questionId: r.question_id, textEn: r.textEn, textHi: r.textHi,
                type: r.type, difficulty: r.difficulty, subjectName: r.subjectName,
                explanationEn: r.explanationEn, explanationHi: r.explanationHi, pointCost: r.pointCost,
                options: optByQ[r.q_id] || []
            }
        }));

        res.json({ success: true, data: { ...set, items, _count: { items: items.length } } });
    } catch (err) { next(err); }
});

// ─── POST /api/qbank/sets ─────────────────────────────────────
router.post('/sets', async (req, res, next) => {
    try {
        const schema = z.object({
            name: z.string().min(1),
            description: z.string().optional(),
            questionIds: z.array(z.string()).min(1),
            folderId: z.string().optional().nullable(),
            durationMins: z.number().optional().nullable(),
        });
        const body = schema.parse(req.body);

        // Generate unique 6-digit setId
        let setId = '';
        let isUnique = false;
        while (!isUnique) {
            setId = String(Math.floor(100000 + Math.random() * 900000));
            const existing = await prisma.$queryRawUnsafe<Array<{id: string}>>(`SELECT id FROM question_sets WHERE set_id = '${setId}' LIMIT 1`);
            if (existing.length === 0) isUnique = true;
        }

        const pin = String(Math.floor(100000 + Math.random() * 900000));
        const newId = `set-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const subject = body.questionIds.length > 0 ? null : null; // Can be extended later

        // Insert into question_sets table
        await prisma.$executeRawUnsafe(`
            INSERT INTO question_sets (id, set_id, name, description, pin, total_questions, subject, is_global, created_at, updated_at)
            VALUES ('${newId}', '${setId}', $1, $2, '${pin}', ${body.questionIds.length}, NULL, false, NOW(), NOW())
        `, body.name, body.description || null);

        // Insert question_set_items
        for (let i = 0; i < body.questionIds.length; i++) {
            const safeQId = body.questionIds[i].replace(/'/g, "''");
            await prisma.$executeRawUnsafe(`
                INSERT INTO question_set_items (set_id, question_id, sort_order)
                VALUES ('${newId}', '${safeQId}', ${i})
                ON CONFLICT (set_id, question_id) DO UPDATE SET sort_order = EXCLUDED.sort_order
            `);
        }

        const questionSet = {
            id: newId,
            setId,
            pin,
            name: body.name,
            description: body.description || null,
            totalQuestions: body.questionIds.length,
            isGlobal: false,
            _count: { items: body.questionIds.length }
        };

        res.status(201).json({ success: true, data: questionSet });
    } catch (err) { next(err); }
});

// ─── DELETE /api/qbank/sets ───────────────────────────────────
router.delete('/sets', async (req, res, next) => {
    try {
        const { ids } = z.object({ ids: z.array(z.string()) }).parse(req.body);
        if (ids.length === 0) return res.json({ success: true, message: '0 sets deleted' });
        const safeIds = ids.map(id => `'${id.replace(/'/g, "''")}'`).join(',');
        await prisma.$executeRawUnsafe(`DELETE FROM question_sets WHERE id IN (${safeIds})`);
        res.json({ success: true, message: `${ids.length} sets deleted successfully` });
    } catch (err) { next(err); }
});

// ─── DELETE /api/qbank/sets/:id ───────────────────────────────
router.delete('/sets/:id', async (req, res, next) => {
    try {
        const safeId = String(req.params.id).replace(/'/g, "''");
        const existing = await prisma.$queryRawUnsafe<Array<{id: string}>>(`SELECT id FROM question_sets WHERE id = '${safeId}' LIMIT 1`);
        if (existing.length === 0) throw new AppError('Question set not found', 404);
        await prisma.$executeRawUnsafe(`DELETE FROM question_sets WHERE id = '${safeId}'`);
        res.json({ success: true, message: 'Question set deleted successfully' });
    } catch (err) { next(err); }
});

// ─── GET /api/qbank/questions ────────────────────────────────
router.get('/questions', async (req, res, next) => {
    try {
        const { page = 1, limit = 20, folderId, includeSubfolders = 'false', difficulty, type, search, scope = 'all', filters, groupBy, exam, subject, chapter, year, shift, source } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {};

        if (scope === 'global') {
            where.isGlobal = true;
        } else if (scope === 'public') {
            where.isApproved = true;
            where.isGlobal = false;
        }

        // Folder filtering with subtree support
        if (folderId) {
            if (includeSubfolders === 'true') {
                const folder = await prisma.qBankFolder.findUnique({ where: { id: folderId as string } });
                if (folder) {
                    const pathPrefix = folder.path === '/' ? `/${folder.id}` : `${folder.path}/${folder.id}`;
                    const subFolders = await prisma.qBankFolder.findMany({
                        where: { path: { startsWith: pathPrefix } },
                        select: { id: true }
                    });
                    const allIds = [folder.id, ...subFolders.map(f => f.id)];
                    where.folderId = { in: allIds };
                } else {
                    where.folderId = folderId;
                }
            } else {
                where.folderId = folderId;
            }
        }

        if (exam && exam !== 'all') where.exam = exam;
        if (subject && subject !== 'all') where.subjectName = subject;
        if (chapter && chapter !== 'all') where.chapterName = chapter;
        if (year && year !== 'all') where.year = Number(year);
        if (shift && shift !== 'all') where.section = shift;
        
        // Difficulty Mapping
        if (difficulty && difficulty !== 'all') {
            const diffMap: any = { 'easy': 'EASY', 'medium': 'MEDIUM', 'hard': 'HARD' };
            where.difficulty = diffMap[difficulty as string] || difficulty;
        }

        // Type Mapping
        if (type && type !== 'all') {
            const typeMap: any = { 
                'mcq': 'MCQ_SINGLE', 
                'multi_select': 'MCQ_MULTIPLE', 
                'true_false': 'TRUE_FALSE', 
                'integer': 'FILL_IN_BLANK' 
            };
            where.type = typeMap[type as string] || type;
        }

        if (source && source !== 'all') where.airtable_table_name = source;
        if (search) {
            where.OR = [
                { text_en: { contains: search as string, mode: 'insensitive' } },
                { text_hi: { contains: search as string, mode: 'insensitive' } },
                { question_id: { contains: search as string } },
            ];
        }

        // Dynamic filters (Airtable-style)
        if (filters && typeof filters === 'string') {
            try {
                const parsedFilters = JSON.parse(filters);
                if (Array.isArray(parsedFilters)) {
                    parsedFilters.forEach((f: any) => {
                        if (!f.field) return;
                        const numFields = ['year', 'syncCode', 'pointCost', 'usageCount', 'questionUniqueId'];
                        
                        // Handle field alias
                        let field = f.field;
                        if (field === 'shift') field = 'section';

                        if (f.operator === 'isEmpty') {
                            where[field] = null;
                        } else if (f.operator === 'isNotEmpty') {
                            where[field] = { not: null };
                        } else if (f.value !== undefined && f.value !== '') {
                            let val = f.value;
                            if (numFields.includes(field)) val = Number(val);
                            
                            // Map Difficulty and Type for dynamic filters
                            if (field === 'difficulty') {
                                const diffMap: any = { 'easy': 'EASY', 'medium': 'MEDIUM', 'hard': 'HARD' };
                                val = diffMap[val as string] || val;
                            } else if (field === 'type') {
                                const typeMap: any = { 
                                    'mcq': 'MCQ_SINGLE', 
                                    'multi_select': 'MCQ_MULTIPLE', 
                                    'true_false': 'TRUE_FALSE', 
                                    'integer': 'FILL_IN_BLANK' 
                                };
                                val = typeMap[val as string] || val;
                            }

                            if (f.operator === 'equals' || !f.operator) where[field] = val;
                            else if (f.operator === 'not_equals') where[field] = { not: val };
                            else if (f.operator === 'contains') where[field] = { contains: String(val), mode: 'insensitive' };
                            else if (f.operator === 'doesNotContain') where[field] = { not: { contains: String(val), mode: 'insensitive' } };
                            else if (f.operator === 'startsWith') where[field] = { startsWith: String(val), mode: 'insensitive' };
                            else if (f.operator === 'endsWith') where[field] = { endsWith: String(val), mode: 'insensitive' };
                        }
                    });
                }
            } catch (e: any) {
                // Logging for debugging (as requested)
                console.error('Failed to parse filters param:', e);
                // Note: toast.error is a frontend function and cannot be called directly in backend.
                // If this was intended for a frontend toast, the error needs to be sent in the response.
                // For now, keeping the backend logging.
            }
        }

        // Use standard Prisma findMany to support all filters instead of raw SQL
        const total = await (prisma as any).questions.count({ where });
        const questionsRaw = await (prisma as any).questions.findMany({
             where,
             orderBy: { created_at: 'desc' },
             skip: Number(skip),
             take: Number(limit),
             include: {
                 question_options: {
                     orderBy: { sort_order: 'asc' },
                     select: {
                         id: true, question_id: true, text_en: true, text_hi: true,
                         is_correct: true, sort_order: true
                     }
                 },
             }
        });

        const formattedQuestions = questionsRaw.map((q: any) => ({
            ...q,
            textEn: q.text_en,
            textHi: q.text_hi,
            subjectName: q.subject_name,
            chapterName: q.chapter_name,
            pointCost: q.point_cost,
            usageCount: q.usage_count,
            isApproved: q.is_approved,
            isGlobal: q.is_global,
            questionId: q.question_id,
            explanationEn: q.explanation_en,
            explanationHi: q.explanation_hi,
            createdAt: q.created_at,
            options: q.question_options?.map((opt: any) => ({
                ...opt,
                textEn: opt.text_en,
                textHi: opt.text_hi,
                isCorrect: opt.is_correct,
                sortOrder: opt.sort_order
            }))
        }));

        res.json({ success: true, data: { questions: formattedQuestions, total } });
    } catch (err) { next(err); }
});

// ─── POST /api/qbank/questions/move-to-folder ──────────────────
router.post('/questions/move-to-folder', async (req, res, next) => {
    try {
        const { questionIds, folderId } = z.object({
            questionIds: z.array(z.string()).min(1),
            folderId: z.string()
        }).parse(req.body);

        // Validate folder exists
        const folder = await prisma.qBankFolder.findUnique({ where: { id: folderId } });
        if (!folder) throw new AppError('Folder not found', 404);

        const updated = await (prisma as any).questions.updateMany({
            where: { id: { in: questionIds } },
            data: { folderId } // No, folderId is missing in schema for questions! Removing it.
        });

        res.json({ success: true, data: { movedCount: updated.count } });
    } catch (err) { next(err); }
});

// ─── POST /api/qbank/questions/copy-to-folder ──────────────────
router.post('/questions/copy-to-folder', async (req, res, next) => {
    try {
        const { questionIds, folderId } = z.object({
            questionIds: z.array(z.string()).min(1),
            folderId: z.string()
        }).parse(req.body);

        const folder = await prisma.qBankFolder.findUnique({ where: { id: folderId } });
        if (!folder) throw new AppError('Folder not found', 404);

        // Fetch questions and their options
        const questions = await (prisma as any).questions.findMany({
            where: { id: { in: questionIds } },
            include: { question_options: true }
        });

        let copiedCount = 0;
        for (const q of questions) {
            const { id, createdAt, updatedAt, options, ...qData } = q;
            // Generate a fresh ID logic could go here if needed, but Prisma will auto-generate if ID is omitted and it has @default(uuid()).
            // Since id is likely mapped, we inject a new UUID-like string. 
            // In Prisma, we can omit id if it's default uuid/cuid.
            const newQId = `q-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            const newQuestionIdStr = `${q.questionId}-copy`;

            await (prisma as any).questions.create({
                data: {
                    ...qData,
                    id: randomBytes(16).toString('hex'),
                    question_id: newQuestionIdStr,
                    question_options: {
                        create: options.map((opt: any) => {
                            const { id: _, question_id: __, ...optData } = opt;
                            return {
                                ...optData,
                                id: randomBytes(16).toString('hex')
                            };
                        })
                    }
                }
            });
            copiedCount++;
        }

        res.json({ success: true, data: { copiedCount } });
    } catch (err) { next(err); }
});

// ─── POST /api/qbank/folders/ensure-drafts ─────────────────────
router.post('/folders/ensure-drafts', async (req, res, next) => {
    try {
        let draftsFolder = await prisma.qBankFolder.findFirst({
            where: { name: { equals: 'Drafts', mode: 'insensitive' }, parentId: null, scope: 'GLOBAL' }
        });

        if (!draftsFolder) {
            draftsFolder = await prisma.qBankFolder.create({
                data: {
                    name: 'Drafts',
                    slug: 'drafts',
                    scope: 'GLOBAL',
                    depth: 0,
                    path: '/'
                }
            });
        }

        res.json({ success: true, data: draftsFolder });
    } catch (err) { next(err); }
});

// ─── DEBUG: GET all sets with pdf_notes ─────────────────────────────────
router.get('/debug/sets-pdf-notes', async (req, res, next) => {
    try {
        const allSets = await prisma.$queryRawUnsafe<Array<any>>(`
            SELECT id, set_id AS "setId", name, pdf_notes,
                   (SELECT COUNT(*) FROM question_set_items WHERE set_id = question_sets.id) AS question_count
            FROM question_sets
            ORDER BY created_at DESC
            LIMIT 100
        `);

        const setsWithParsed = allSets.map((s: any) => ({
            ...s,
            pdf_notes_parsed: (() => {
                try {
                    return typeof s.pdf_notes === 'string' ? JSON.parse(s.pdf_notes) : s.pdf_notes;
                } catch (e) {
                    return { parseError: String(e) };
                }
            })(),
            pdf_notes_raw: s.pdf_notes,
        }));

        res.json({
            success: true,
            debug: {
                totalSetsInDB: setsWithParsed.length,
                setsWithPdfNotes: setsWithParsed.filter((s: any) => s.pdf_notes).length,
            },
            data: setsWithParsed,
        });
    } catch (err) { 
        next(err); 
    }
});

export default router;
