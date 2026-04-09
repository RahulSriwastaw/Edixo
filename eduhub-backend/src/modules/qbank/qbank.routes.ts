import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { authenticate, requireOrgAccess } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';
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
router.use(authenticate, requireOrgAccess);

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
async function getOrCreateExamFolder(orgId: string | null, examName: string, year: number | null): Promise<string> {
    // 1. Check parent folder "Exams"
    let examsFolder = await prisma.qBankFolder.findFirst({
        where: { name: 'Exams', parentId: null, orgId, isActive: true }
    });
    if (!examsFolder) {
        examsFolder = await prisma.qBankFolder.create({
            data: { name: 'Exams', orgId, path: '/', depth: 0, scope: orgId ? 'ORG' : 'GLOBAL', slug: 'exams' }
        });
    }

    // 2. Check Exam Name folder
    let examFolder = await prisma.qBankFolder.findFirst({
        where: { name: examName, parentId: examsFolder.id, orgId, isActive: true }
    });
    if (!examFolder) {
        examFolder = await prisma.qBankFolder.create({
            data: { 
                name: examName, 
                parentId: examsFolder.id, 
                orgId, 
                path: `/${examsFolder.id}`, 
                depth: 1, 
                scope: orgId ? 'ORG' : 'GLOBAL',
                slug: examName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            }
        });
    }

    if (!year) return examFolder.id;

    // 3. Check Year folder
    let yearFolder = await prisma.qBankFolder.findFirst({
        where: { name: String(year), parentId: examFolder.id, orgId, isActive: true }
    });
    if (!yearFolder) {
        yearFolder = await prisma.qBankFolder.create({
            data: { 
                name: String(year), 
                parentId: examFolder.id, 
                orgId, 
                path: `${examFolder.path}/${examFolder.id}`, 
                depth: 2, 
                scope: orgId ? 'ORG' : 'GLOBAL',
                slug: String(year) 
            }
        });
    }

    return yearFolder.id;
}

// ─── GET /api/qbank/folders ──────────────────────────────────
router.get('/folders', async (req, res, next) => {
    try {
        const { includeGlobal = 'true', tree = 'true', orgId: queryOrgId } = req.query;
        const org = (req.user?.orgId && req.user.orgId !== 'undefined') ? await prisma.organization.findFirst({ where: { orgId: req.user.orgId } }) : null;
        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

        const orConditions: any[] = [];

        if (includeGlobal === 'true') {
            orConditions.push({ scope: 'GLOBAL' });
        }

        if (isSuperAdmin && queryOrgId) {
            const targetOrg = await prisma.organization.findFirst({ where: { orgId: queryOrgId as string } });
            if (targetOrg) orConditions.push({ orgId: targetOrg.id, scope: 'ORG' });
        } else if (org) {
            orConditions.push({ orgId: org.id, scope: 'ORG' });
        }

        if (isSuperAdmin && !queryOrgId && includeGlobal !== 'true') {
            orConditions.push({ scope: 'GLOBAL' });
        }

        // Super Admin with no specific org: show everything
        const where: any = orConditions.length > 0
            ? { OR: orConditions, isActive: true }
            : { isActive: true };

        if (isSuperAdmin && !queryOrgId) {
            delete where.OR;
        }

        const folders = await prisma.qBankFolder.findMany({
            where: isSuperAdmin && !queryOrgId ? { isActive: true } : where,
            orderBy: [{ depth: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }],
            include: { _count: { select: { sets: true } } }
        });

        // Map _count.sets to setCount for compatibility if needed, 
        // but frontend SetFoldersManager expects totalSetCount for now.
        // We'll calculate totalSetCount in the tree-building process or just return it.
        const foldersWithCounts = folders.map(f => ({
            ...f,
            setCount: f._count.sets,
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
                children: { orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] },
                _count: { select: { sets: true } }
            }
        });
        if (!folder) throw new AppError('Folder not found', 404);

        // Build breadcrumb
        const breadcrumb = await getBreadcrumb(req.params.id);

        res.json({ success: true, data: { ...folder, breadcrumb } });
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
        const directCount = await prisma.question.count({
            where: { folderId: folder.id, deletedAt: null }
        });

        // Total questions (all subtree)
        const totalCount = await prisma.question.count({
            where: { folderId: { in: allFolderIds }, deletedAt: null }
        });

        // By difficulty
        const [easyQ, mediumQ, hardQ] = await Promise.all([
            prisma.question.count({ where: { folderId: { in: allFolderIds }, difficulty: 'EASY', deletedAt: null } }),
            prisma.question.count({ where: { folderId: { in: allFolderIds }, difficulty: 'MEDIUM', deletedAt: null } }),
            prisma.question.count({ where: { folderId: { in: allFolderIds }, difficulty: 'HARD', deletedAt: null } }),
        ]);

        // By type
        const [mcqSingle, mcqMulti, trueFalse, fillBlank, descriptive] = await Promise.all([
            prisma.question.count({ where: { folderId: { in: allFolderIds }, type: 'MCQ_SINGLE', deletedAt: null } }),
            prisma.question.count({ where: { folderId: { in: allFolderIds }, type: 'MCQ_MULTIPLE', deletedAt: null } }),
            prisma.question.count({ where: { folderId: { in: allFolderIds }, type: 'TRUE_FALSE', deletedAt: null } }),
            prisma.question.count({ where: { folderId: { in: allFolderIds }, type: 'FILL_IN_BLANK', deletedAt: null } }),
            prisma.question.count({ where: { folderId: { in: allFolderIds }, type: 'DESCRIPTIVE', deletedAt: null } }),
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
            scope: z.enum(['GLOBAL', 'ORG']).default('ORG').optional(),
        });
        const body = schema.parse(req.body);
        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
        let orgId = req.user?.orgId;
        let org = (orgId && orgId !== 'undefined') ? await prisma.organization.findFirst({ where: { orgId } }) : null;

        if (!org && isSuperAdmin) {
            org = await prisma.organization.findFirst({ where: { deletedAt: null } });
        }

        if (!org && body.scope !== 'GLOBAL') {
            throw new AppError('Organization context required. Please select or view an organization.', 400);
        }

        let depth = 0;
        let path = '/';

        if (body.parentId) {
            const parent = await prisma.qBankFolder.findUniqueOrThrow({ where: { id: body.parentId } });
            depth = parent.depth + 1;
            if (depth >= 10) throw new AppError('Maximum folder depth (10) reached', 400);
            // Path = parent's path + parent's id
            path = parent.path === '/' ? `/${parent.id}` : `${parent.path}/${parent.id}`;
        }

        const finalScope = (isSuperAdmin && body.scope === 'GLOBAL') ? 'GLOBAL' : 'ORG';
        const slug = body.slug || body.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        const folder = await prisma.qBankFolder.create({
            data: {
                orgId: finalScope === 'GLOBAL' ? null : org?.id,
                name: body.name,
                slug,
                description: body.description,
                icon: body.icon,
                color: body.color,
                parentId: body.parentId,
                path,
                depth,
                scope: finalScope,
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

        const org = req.user?.orgId ? await prisma.organization.findFirst({ where: { orgId: req.user.orgId } }) : null;
        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

        if (!isSuperAdmin && folder.orgId !== org?.id) {
            throw new AppError('Unauthorized: You can only edit your own folders', 403);
        }

        const data: any = {};
        if (body.name !== undefined) data.name = body.name;
        if (body.slug !== undefined) data.slug = body.slug;
        if (body.description !== undefined) data.description = body.description;
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

        const org = req.user?.orgId ? await prisma.organization.findFirst({ where: { orgId: req.user.orgId } }) : null;
        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

        if (!isSuperAdmin && folder.orgId !== org?.id) {
            throw new AppError('Unauthorized', 403);
        }

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

        const folder = await prisma.qBankFolder.findUnique({
            where: { id: req.params.id },
            include: { _count: { select: { children: true, questions: true, sets: true } } }
        });
        if (!folder) throw new AppError('Folder not found', 404);

        const org = req.user?.orgId ? await prisma.organization.findFirst({ where: { orgId: req.user.orgId } }) : null;
        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

        if (!isSuperAdmin && folder.orgId !== org?.id) {
            throw new AppError('Unauthorized: You can only delete your own folders', 403);
        }

        // Get all subtree folders
        const pathPrefix = folder.path === '/' ? `/${folder.id}` : `${folder.path}/${folder.id}`;
        const subFolders = await prisma.qBankFolder.findMany({
            where: { path: { startsWith: pathPrefix } },
            select: { id: true }
        });
        const allFolderIds = [folder.id, ...subFolders.map(f => f.id)];

        // Count affected content
        const [questionsAffected, setsAffected] = await Promise.all([
            prisma.question.count({ where: { folderId: { in: allFolderIds } } }),
            prisma.questionSet.count({ where: { folderId: { in: allFolderIds } } }),
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

            // Soft delete all questions in subtree
            await prisma.question.updateMany({
                where: { folderId: { in: allFolderIds } },
                data: { deletedAt: new Date(), folderId: null }
            });

            // Delete all sets in subtree (Hard delete)
            await prisma.questionSet.deleteMany({
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
            await prisma.question.updateMany({
                where: { folderId: folder.id },
                data: { folderId: targetParentId }
            });

            // Move direct sets to parent
            await prisma.questionSet.updateMany({
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
        const org = req.user?.orgId ? await prisma.organization.findFirst({ where: { orgId: req.user.orgId } }) : null;
        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

        // 1. Basic Stats
        const totalQuestionsRow = await prisma.$queryRawUnsafe<Array<{cnt: bigint}>>('SELECT COUNT(*) AS cnt FROM questions');
        const publicQuestionsRow = await prisma.$queryRawUnsafe<Array<{cnt: bigint}>>('SELECT COUNT(*) AS cnt FROM questions WHERE is_global = true');
        const setCountRow = await prisma.$queryRawUnsafe<Array<{cnt: bigint}>>('SELECT COUNT(*) AS cnt FROM question_sets');
        const totalQuestions = Number(totalQuestionsRow[0]?.cnt ?? 0);
        const publicQuestions = Number(publicQuestionsRow[0]?.cnt ?? 0);
        const setMapCount = Number(setCountRow[0]?.cnt ?? 0);

        // 2. Questions by Subject (Root folders)
        const rootFolders = await prisma.qBankFolder.findMany({
            where: { depth: 0, isActive: true },
            select: { id: true, name: true }
        });

        const bySubject = await Promise.all(rootFolders.map(async (folder) => {
            const count = await prisma.question.count({
                where: {
                    OR: [
                        { folderId: folder.id },
                        { folder: { path: { contains: folder.id } } }
                    ],
                    ...(isSuperAdmin ? {} : { orgId: org?.id })
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

        const usageTrend = await Promise.all(last7Days.map(async (date) => {
            const nextDay = new Date(date);
            nextDay.setDate(nextDay.getDate() + 1);

            const count = await prisma.studentQuestionHistory.count({
                where: {
                    lastAttemptAt: { gte: date, lt: nextDay },
                    ...(isSuperAdmin ? {} : { orgId: org?.id })
                }
            });
            return { day: date.toLocaleDateString('en-IN', { month: '2-digit', day: '2-digit' }), usage: count };
        }));

        // 4. Recent Usage
        const recentHistory = await prisma.studentQuestionHistory.findMany({
            where: isSuperAdmin ? {} : { orgId: org?.id },
            take: 5,
            orderBy: { lastAttemptAt: 'desc' },
            include: {
                question: { select: { textEn: true, textHi: true } },
                student: { select: { name: true, org: { select: { name: true } } } }
            }
        });

        const recentUsage = recentHistory.map(h => ({
            id: h.id,
            question: h.question?.textEn || h.question?.textHi || 'Untitled Question',
            org: h.student?.org?.name || 'Unknown Organization',
            teacher: 'System',
            date: h.lastAttemptAt?.toLocaleDateString('en-IN') || 'N/A',
            points: 1
        }));

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
        const org = await prisma.organization.findFirst({ where: { orgId: req.user!.orgId } });
        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

        const history = await prisma.studentQuestionHistory.findMany({
            where: isSuperAdmin ? {} : { orgId: org?.id },
            orderBy: { lastAttemptAt: 'desc' },
            include: {
                question: { select: { textEn: true, textHi: true, type: true } },
                student: { select: { name: true, org: { select: { name: true } } } }
            }
        });

        const logs = history.map(h => ({
            id: h.id,
            question: h.question?.textEn || h.question?.textHi || 'Untitled Question',
            type: h.question?.type?.toLowerCase()?.includes('mcq') ? 'question' : 'set',
            org: h.student?.org?.name || 'Unknown Organization',
            user: h.student?.name || 'Unknown Student',
            points: 1,
            balanceAfter: 0,
            usedAt: h.lastAttemptAt?.toLocaleString('en-IN') || 'N/A'
        }));

        res.json({ success: true, data: logs });
    } catch (err) { next(err); }
});

// ─── GET /api/qbank/filter-options ──────────────────────────
router.get('/filter-options', async (req, res, next) => {
    try {
        console.log('[QBank] Fetching filter-options for user:', req.user?.userId);
        const [exams, subjects, years, shifts, sources] = await Promise.all([
            prisma.question.groupBy({ where: { deletedAt: null }, by: ['exam'] }),
            prisma.question.groupBy({ where: { deletedAt: null }, by: ['subjectName'] }),
            prisma.question.groupBy({ where: { deletedAt: null }, by: ['year'] }),
            prisma.question.groupBy({ where: { deletedAt: null }, by: ['section'] }),
            prisma.question.groupBy({ where: { deletedAt: null, airtableTableName: { not: null } }, by: ['airtableTableName'] }),
        ]);

        const data = {
            exams: exams.map(e => e.exam).filter(Boolean),
            subjects: subjects.map(s => s.subjectName).filter(Boolean),
            years: years.map(y => y.year).filter(y => y !== null),
            shifts: shifts.map(s => s.section).filter(Boolean),
            sources: sources.map(s => s.airtableTableName).filter(Boolean),
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

        const chapters = await prisma.question.findMany({
            where: { subjectName: subject as string, deletedAt: null },
            select: { chapterName: true },
            distinct: ['chapterName'],
        });

        res.json({ success: true, data: chapters.map(c => c.chapterName).filter(Boolean) });
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
                   (SELECT COUNT(*) FROM question_set_items qsi WHERE qsi.set_id = qs.id) AS "itemCount"
            FROM question_sets qs
            WHERE ${whereClause}
            ORDER BY qs.created_at DESC
            LIMIT ${Number(limit)} OFFSET ${offset}
        `;
        const countQuery = `SELECT COUNT(*) AS cnt FROM question_sets WHERE ${whereClause}`;

        const [rawSets, countRows] = await Promise.all([
            prisma.$queryRawUnsafe<Array<any>>(setsQuery, ...params),
            prisma.$queryRawUnsafe<Array<{cnt: bigint}>>(countQuery, ...params),
        ]);

        const sets = rawSets.map((s: any) => ({
            ...s,
            _count: { items: Number(s.itemCount || 0) },
        }));
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
        const org = await prisma.organization.findFirst({ where: { orgId: req.user!.orgId } });
        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = { deletedAt: null };

        if (scope === 'global') {
            where.isGlobal = true;
        } else if (scope === 'public') {
            where.isApproved = true;
            where.isGlobal = false;
            where.orgId = { not: org?.id };
        } else if (scope === 'mine') {
            where.orgId = org?.id;
        } else if (!isSuperAdmin) {
            where.OR = [
                { isGlobal: true },
                { orgId: org?.id },
                { isApproved: true, isGlobal: false }
            ];
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

        if (source && source !== 'all') where.airtableTableName = source;
        if (search) {
            where.OR = [
                { textEn: { contains: search as string, mode: 'insensitive' } },
                { textHi: { contains: search as string, mode: 'insensitive' } },
                { questionId: { contains: search as string } },
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

        // Use raw SQL against local questions table (question bank)
        const limitNum = Number(limit);
        const skipNum = Number(skip);
        let rawWhere = '1=1';
        const rawParams: any[] = [];

        if (search) {
            rawParams.push(`%${search}%`);
            rawWhere += ` AND (text_en ILIKE $${rawParams.length} OR text_hi ILIKE $${rawParams.length})`;
        }
        if (difficulty && difficulty !== 'all') {
            rawParams.push(String(difficulty).toUpperCase());
            rawWhere += ` AND difficulty = $${rawParams.length}`;
        }
        if (type && type !== 'all') {
            const typeMap: any = { 'mcq': 'MCQ_SINGLE', 'multi_select': 'MCQ_MULTIPLE', 'integer': 'FILL_IN_BLANK', 'true_false': 'TRUE_FALSE' };
            rawParams.push(typeMap[type as string] || type);
            rawWhere += ` AND type = $${rawParams.length}`;
        }

        const questionsRaw = await prisma.$queryRawUnsafe<Array<any>>(`
            SELECT id, question_id AS "questionId", text_en AS "textEn", text_hi AS "textHi",
                   type, difficulty, subject_name AS "subjectName", chapter_name AS "chapterName",
                   exam, year, point_cost AS "pointCost", usage_count AS "usageCount",
                   is_global AS "isGlobal", is_approved AS "isApproved", created_at AS "createdAt"
            FROM questions
            WHERE ${rawWhere}
            ORDER BY created_at DESC
            LIMIT ${limitNum} OFFSET ${skipNum}
        `, ...rawParams);

        const totalRow = await prisma.$queryRawUnsafe<Array<{cnt: bigint}>>(`
            SELECT COUNT(*) AS cnt FROM questions WHERE ${rawWhere}
        `, ...rawParams);

        // Fetch options for loaded questions
        const qIds = questionsRaw.map((q: any) => q.id);
        let optsByQ: Record<string, any[]> = {};
        if (qIds.length > 0) {
            const idsList = qIds.map((id: string) => `'${id.replace(/'/g, "''")}'`).join(',');
            const opts = await prisma.$queryRawUnsafe<Array<any>>(`
                SELECT id, question_id AS "question_id", text_en AS "textEn", text_hi AS "textHi",
                       is_correct AS "isCorrect", sort_order AS "sortOrder"
                FROM question_options WHERE question_id IN (${idsList}) ORDER BY sort_order ASC
            `);
            opts.forEach((o: any) => { optsByQ[o.question_id] = optsByQ[o.question_id] || []; optsByQ[o.question_id].push(o); });
        }

        const questions = questionsRaw.map((q: any) => ({ ...q, options: optsByQ[q.id] || [], folder: null }));
        const total = Number(totalRow[0]?.cnt ?? 0);

        res.json({ success: true, data: { questions, total } });
    } catch (err) { next(err); }
});

export default router;
