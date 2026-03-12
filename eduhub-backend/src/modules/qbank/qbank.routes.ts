import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/database';
import { authenticate, requireOrgAccess } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';

const router = Router();
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
        const [totalQuestions, publicQuestions, setMapCount] = await Promise.all([
            prisma.question.count({ where: isSuperAdmin ? {} : { orgId: org?.id } }),
            prisma.question.count({ where: { isGlobal: true } }),
            prisma.questionSet.count({ where: isSuperAdmin ? {} : { orgId: org?.id } }),
        ]);

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
            question: h.question.textEn || h.question.textHi || 'Untitled Question',
            org: h.student.org.name,
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

// ─── GET /api/qbank/sets ─────────────────────────────────────
router.get('/sets', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirst({ where: { orgId: req.user!.orgId } });
        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

        const sets = await prisma.questionSet.findMany({
            where: isSuperAdmin ? {} : { orgId: org?.id },
            include: { _count: { select: { items: true } } },
            orderBy: { createdAt: 'desc' }
        });

        const formattedSets = sets.map(s => ({
            id: s.id,
            name: s.name,
            code: s.setId,
            password: s.pin,
            subject: 'Multiple',
            questions: s._count.items,
            visibility: 'org_only',
            usedBy: 0,
            created: s.createdAt.toLocaleDateString('en-IN')
        }));

        res.json({ success: true, data: { sets: formattedSets, total: sets.length } });
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
            question: h.question.textEn || h.question.textHi || 'Untitled Question',
            type: h.question.type.toLowerCase().includes('mcq') ? 'question' : 'set',
            org: h.student.org.name,
            user: h.student.name,
            points: 1,
            balanceAfter: 0,
            usedAt: h.lastAttemptAt?.toLocaleString('en-IN') || 'N/A'
        }));

        res.json({ success: true, data: logs });
    } catch (err) { next(err); }
});

// ─── GET /api/qbank/questions ────────────────────────────────
router.get('/questions', async (req, res, next) => {
    try {
        const { page = 1, limit = 20, folderId, includeSubfolders = 'false', difficulty, type, search, scope = 'all', filters, groupBy } = req.query;
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

        if (difficulty && difficulty !== 'all') where.difficulty = difficulty;
        if (type && type !== 'all') where.type = type;
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
                        if (f.operator === 'isEmpty') {
                            where[f.field] = null;
                        } else if (f.operator === 'isNotEmpty') {
                            where[f.field] = { not: null };
                        } else if (f.value !== undefined && f.value !== '') {
                            let val = f.value;
                            if (numFields.includes(f.field)) val = Number(val);
                            if (f.operator === 'equals' || !f.operator) where[f.field] = val;
                            else if (f.operator === 'not_equals') where[f.field] = { not: val };
                            else if (f.operator === 'contains') where[f.field] = { contains: String(val), mode: 'insensitive' };
                            else if (f.operator === 'doesNotContain') where[f.field] = { not: { contains: String(val), mode: 'insensitive' } };
                            else if (f.operator === 'startsWith') where[f.field] = { startsWith: String(val), mode: 'insensitive' };
                            else if (f.operator === 'endsWith') where[f.field] = { endsWith: String(val), mode: 'insensitive' };
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

        const orderBy: any = [];
        if (groupBy && typeof groupBy === 'string' && groupBy !== 'none') {
            orderBy.push({ [groupBy]: 'asc' });
        }
        orderBy.push({ createdAt: 'desc' });

        const [questions, total] = await Promise.all([
            prisma.question.findMany({
                where,
                skip,
                take: Number(limit),
                include: { options: true, folder: { select: { id: true, name: true, path: true } } },
                orderBy,
            }),
            prisma.question.count({ where }),
        ]);

        res.json({ success: true, data: { questions, total } });
    } catch (err) { next(err); }
});

// ─── POST /api/qbank/questions ───────────────────────────────
router.post('/questions', async (req, res, next) => {
    try {
        const optionSchema = z.object({
            textEn: z.string().optional(),
            textHi: z.string().optional(),
            imageUrl: z.string().optional(),
            isCorrect: z.boolean().default(false),
            sortOrder: z.number().default(0),
        });

        const schema = z.object({
            textEn: z.string().optional(),
            textHi: z.string().optional(),
            explanationEn: z.string().optional(),
            explanationHi: z.string().optional(),
            type: z.enum(['MCQ_SINGLE', 'MCQ_MULTIPLE', 'TRUE_FALSE', 'FILL_IN_BLANK', 'DESCRIPTIVE']).default('MCQ_SINGLE'),
            difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
            folderId: z.string().optional(),
            topicId: z.string().optional(),
            tags: z.array(z.string()).default([]),
            imageUrl: z.string().optional(),
            visibility: z.string().default('private'),
            isGlobal: z.boolean().default(false),
            options: z.array(optionSchema).default([]),
        });

        const body = schema.parse(req.body);
        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
        let orgId = req.user?.orgId;
        let org = (orgId && orgId !== 'undefined') ? await prisma.organization.findFirst({ where: { orgId } }) : null;

        if (!org && isSuperAdmin) {
            org = await prisma.organization.findFirst({ where: { deletedAt: null } });
        }

        if (!org && !body.isGlobal) {
            throw new AppError('Organization context required. Please select or view an organization.', 400);
        }

        const globalCount = await prisma.question.count();
        const questionId = `GK-Q-${String(globalCount + 1).padStart(7, '0')}`;

        const isGlobal = isSuperAdmin && body.isGlobal;
        const isApproved = isGlobal || body.visibility === 'public';

        const question = await prisma.question.create({
            data: {
                questionId,
                orgId: isGlobal ? null : org!.id,
                isGlobal,
                isApproved,
                textEn: body.textEn,
                textHi: body.textHi,
                explanationEn: body.explanationEn,
                explanationHi: body.explanationHi,
                type: body.type,
                difficulty: body.difficulty,
                folderId: body.folderId,
                topicId: body.topicId,
                tags: body.tags,
                imageUrl: body.imageUrl,
                options: { create: body.options },
            },
            include: { options: true },
        });

        res.status(201).json({ success: true, data: question });
    } catch (err) { next(err); }
});

// ─── GET /api/qbank/questions/:id ────────────────────────────
router.get('/questions/:id', async (req, res, next) => {
    try {
        const question = await prisma.question.findUnique({
            where: { id: req.params.id },
            include: { options: true, folder: { select: { id: true, name: true } } },
        });
        if (!question) throw new AppError('Question not found', 404);

        const org = await prisma.organization.findFirst({ where: { orgId: req.user!.orgId } });
        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
        if (!isSuperAdmin && !question.isGlobal && !question.isApproved && question.orgId !== org?.id) {
            throw new AppError('Unauthorized access', 403);
        }

        res.json({ success: true, data: question });
    } catch (err) { next(err); }
});

// ─── PATCH /api/qbank/questions/:id ──────────────────────────
router.patch('/questions/:id', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirst({ where: { orgId: req.user!.orgId } });
        const question = await prisma.question.findUnique({ where: { id: req.params.id } });
        if (!question) throw new AppError('Question not found', 404);

        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
        if (!isSuperAdmin && question.orgId !== org?.id) {
            throw new AppError('Unauthorized: Only the creator can edit this question', 403);
        }

        const optionSchema = z.object({
            textEn: z.string().optional(),
            textHi: z.string().optional(),
            imageUrl: z.string().optional(),
            isCorrect: z.boolean().default(false),
            sortOrder: z.number().default(0),
        });

        const schema = z.object({
            textEn: z.string().optional(),
            textHi: z.string().optional(),
            explanationEn: z.string().optional(),
            explanationHi: z.string().optional(),
            type: z.enum(['MCQ_SINGLE', 'MCQ_MULTIPLE', 'TRUE_FALSE', 'FILL_IN_BLANK', 'DESCRIPTIVE']).optional(),
            difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
            folderId: z.string().nullable().optional(),
            topicId: z.string().optional(),
            tags: z.array(z.string()).optional(),
            imageUrl: z.string().optional(),
            visibility: z.string().optional(),
            isGlobal: z.boolean().optional(),
            options: z.array(optionSchema).optional(),
            isApproved: z.boolean().optional(),
        });

        const body = schema.parse(req.body);

        let isApproved = question.isApproved;
        let isGlobal = question.isGlobal;
        if (body.visibility === 'public') isApproved = true;
        if (body.visibility === 'private') isApproved = false;
        if (body.isGlobal !== undefined) isGlobal = body.isGlobal;
        if (body.isApproved !== undefined) isApproved = body.isApproved;

        const updateData: any = {
            textEn: body.textEn,
            textHi: body.textHi,
            explanationEn: body.explanationEn,
            explanationHi: body.explanationHi,
            type: body.type,
            difficulty: body.difficulty,
            folderId: body.folderId,
            topicId: body.topicId,
            tags: body.tags,
            imageUrl: body.imageUrl,
            isGlobal,
            isApproved,
        };

        if (body.options) {
            updateData.options = {
                deleteMany: {},
                create: body.options
            };
        }

        const updated = await prisma.question.update({
            where: { id: req.params.id },
            data: updateData,
            include: { options: true },
        });
        res.json({ success: true, data: updated });
    } catch (err) { next(err); }
});

// ─── DELETE /api/qbank/questions/:id ──────────────────────────
router.delete('/questions/:id', async (req, res, next) => {
    try {
        const org = await prisma.organization.findFirst({ where: { orgId: req.user!.orgId } });
        const question = await prisma.question.findUnique({ where: { id: req.params.id } });
        if (!question) throw new AppError('Question not found', 404);

        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
        if (!isSuperAdmin && question.orgId !== org?.id) {
            throw new AppError('Unauthorized: Only the creator can delete this question', 403);
        }

        await prisma.question.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Question deleted' });
    } catch (err) { next(err); }
});

// ─── DELETE /api/qbank/questions (Bulk) ───────────────────────
router.delete('/questions', async (req, res, next) => {
    try {
        const { ids } = z.object({ ids: z.array(z.string()) }).parse(req.body);
        const org = await prisma.organization.findFirst({ where: { orgId: req.user!.orgId } });
        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

        if (isSuperAdmin) {
            await prisma.question.deleteMany({ where: { id: { in: ids } } });
        } else {
            await prisma.question.deleteMany({ where: { id: { in: ids }, orgId: org?.id } });
        }
        res.json({ success: true, message: 'Requested questions deleted (if authorized)' });
    } catch (err) { next(err); }
});

// ─── POST /api/qbank/questions/bulk-move-to-folder ───────────
router.post('/questions/bulk-move-to-folder', async (req, res, next) => {
    try {
        const schema = z.object({
            questionIds: z.array(z.string()).min(1),
            targetFolderId: z.string().nullable(),
        });
        const { questionIds, targetFolderId } = schema.parse(req.body);

        const org = await prisma.organization.findFirst({ where: { orgId: req.user!.orgId } });
        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

        // Verify target folder exists
        if (targetFolderId) {
            const targetFolder = await prisma.qBankFolder.findUnique({ where: { id: targetFolderId } });
            if (!targetFolder) throw new AppError('Target folder not found', 404);
        }

        const whereClause: any = { id: { in: questionIds } };
        if (!isSuperAdmin) whereClause.orgId = org?.id;

        const result = await prisma.question.updateMany({
            where: whereClause,
            data: { folderId: targetFolderId },
        });

        res.json({ success: true, data: { moved: result.count } });
    } catch (err) { next(err); }
});

// ─── POST /api/qbank/questions/bulk-copy-to-folder ───────────
router.post('/questions/bulk-copy-to-folder', async (req, res, next) => {
    try {
        const schema = z.object({
            questionIds: z.array(z.string()).min(1),
            targetFolderId: z.string().nullable(),
        });
        const { questionIds, targetFolderId } = schema.parse(req.body);

        const org = await prisma.organization.findFirst({ where: { orgId: req.user!.orgId } });
        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

        if (targetFolderId) {
            const targetFolder = await prisma.qBankFolder.findUnique({ where: { id: targetFolderId } });
            if (!targetFolder) throw new AppError('Target folder not found', 404);
        }

        const whereClause: any = { id: { in: questionIds } };
        if (!isSuperAdmin) whereClause.orgId = org?.id;

        const originalQuestions = await prisma.question.findMany({
            where: whereClause,
            include: { options: true }
        });

        let copiedCount = 0;
        await prisma.$transaction(async (tx) => {
            for (const q of originalQuestions) {
                const uniqueSuffix = Math.random().toString(36).substring(2, 7);
                const questionId = `GK-Q-${Date.now().toString().slice(-6)}${uniqueSuffix}`;

                await tx.question.create({
                    data: {
                        questionId,
                        orgId: isSuperAdmin ? null : org?.id,
                        folderId: targetFolderId,
                        textEn: q.textEn,
                        textHi: q.textHi,
                        explanationEn: q.explanationEn,
                        explanationHi: q.explanationHi,
                        type: q.type,
                        difficulty: q.difficulty,
                        pointCost: q.pointCost,
                        isGlobal: q.isGlobal,
                        isApproved: q.isApproved,
                        options: {
                            create: q.options.map(opt => ({
                                textEn: opt.textEn,
                                textHi: opt.textHi,
                                isCorrect: opt.isCorrect,
                                sortOrder: opt.sortOrder
                            }))
                        }
                    }
                });
                copiedCount++;
            }
        });

        res.json({ success: true, data: { copied: copiedCount } });
    } catch (err) { next(err); }
});

// ─── POST /api/qbank/bulk-upload ─────────────────────────────
router.post('/bulk-upload', async (req, res, next) => {
    try {
        const rowSchema = z.object({
            question_eng: z.string().optional().nullable(),
            question_hin: z.string().optional().nullable(),
            type: z.string().optional().default('mcq'),
            subject: z.string().optional().nullable(),
            chapter: z.string().optional().nullable(),
            difficulty: z.string().optional().default('medium'),
            option1_eng: z.string().optional().nullable(),
            option1_hin: z.string().optional().nullable(),
            option2_eng: z.string().optional().nullable(),
            option2_hin: z.string().optional().nullable(),
            option3_eng: z.string().optional().nullable(),
            option3_hin: z.string().optional().nullable(),
            option4_eng: z.string().optional().nullable(),
            option4_hin: z.string().optional().nullable(),
            option5_eng: z.string().optional().nullable(),
            option5_hin: z.string().optional().nullable(),
            answer: z.enum(['A', 'B', 'C', 'D', 'E', '1', '2', '3', '4', '5']).or(z.string()).optional(),
            solution_eng: z.string().optional().nullable(),
            solution_hin: z.string().optional().nullable(),
            record_id: z.string().optional().nullable(),
            question_unique_id: z.union([z.number(), z.string()]).optional().nullable(),
            collection: z.string().optional().nullable(),
            previous_of: z.string().optional().nullable(),
            exam: z.string().optional().nullable(),
            year: z.union([z.number(), z.string()]).optional().nullable(),
            video: z.string().optional().nullable(),
            section: z.string().optional().nullable(),
            date: z.string().optional().nullable(),
            airtable_table_name: z.string().optional().nullable(),
            action: z.string().optional().nullable(),
            current_status: z.string().optional().nullable(),
            sync_code: z.union([z.number(), z.string()]).optional().nullable(),
        });

        const schema = z.object({
            fileName: z.string(),
            rows: z.array(z.any()),
            folderId: z.string().optional().nullable(),
        });

        const body = schema.parse(req.body);
        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
        let userOrgId = req.user?.orgId;
        let org = (userOrgId && userOrgId !== 'undefined') ? await prisma.organization.findFirst({ where: { orgId: userOrgId } }) : null;

        if (!org && isSuperAdmin) {
            org = await prisma.organization.findFirst({ where: { deletedAt: null } });
        }

        if (!org) {
            throw new AppError('Organization context required. Please select or view an organization.', 400);
        }

        const batchId = `UL-${String(Date.now()).slice(-8)}`;
        const batch = await prisma.bulkUploadBatch.create({
            data: {
                batchId,
                orgId: org.id,
                uploadFileName: body.fileName,
                uploadFileType: body.fileName.split('.').pop(),
                totalRowsFound: body.rows.length,
                totalFailedRows: 0,
                uploadStatus: 'Processing',
            },
        });

        let savedCount = 0;
        let failedCount = 0;
        const failedRows = [];

        for (let i = 0; i < body.rows.length; i++) {
            try {
                const row = body.rows[i];
                const parsedRow = rowSchema.parse(row);

                const uniqueSuffix = Math.random().toString(36).substring(2, 7);
                const questionId = `GK-Q-${Date.now().toString().slice(-6)}${uniqueSuffix}`;

                let qType: any = 'MCQ_SINGLE';
                if (parsedRow.type?.toLowerCase() === 'integer') qType = 'FILL_IN_BLANK';
                if (parsedRow.type?.toLowerCase() === 'true_false') qType = 'TRUE_FALSE';

                let qDiff: any = 'MEDIUM';
                const d = parsedRow.difficulty?.toUpperCase();
                if (d === 'EASY') qDiff = 'EASY';
                else if (d === 'HARD') qDiff = 'HARD';

                let qFolderId = body.folderId || null;

                const options = [];
                const optRows = [
                    { en: parsedRow.option1_eng, hi: parsedRow.option1_hin, val: '1', char: 'A' },
                    { en: parsedRow.option2_eng, hi: parsedRow.option2_hin, val: '2', char: 'B' },
                    { en: parsedRow.option3_eng, hi: parsedRow.option3_hin, val: '3', char: 'C' },
                    { en: parsedRow.option4_eng, hi: parsedRow.option4_hin, val: '4', char: 'D' },
                    { en: parsedRow.option5_eng, hi: parsedRow.option5_hin, val: '5', char: 'E' },
                ];

                for (let idx = 0; idx < optRows.length; idx++) {
                    const o = optRows[idx];
                    if (o.en || o.hi) {
                        const isCorrect = parsedRow.answer === o.char || parsedRow.answer === o.val || parsedRow.answer === o.en || parsedRow.answer === o.hi;
                        options.push({ textEn: o.en || null, textHi: o.hi || null, isCorrect: isCorrect || false, sortOrder: idx });
                    }
                }

                await prisma.question.create({
                    data: {
                        questionId,
                        orgId: org.id,
                        folderId: qFolderId,
                        textEn: parsedRow.question_eng || null,
                        textHi: parsedRow.question_hin || null,
                        explanationEn: parsedRow.solution_eng || null,
                        explanationHi: parsedRow.solution_hin || null,
                        type: qType,
                        difficulty: qDiff,
                        isApproved: true,
                        recordId: parsedRow.record_id || null,
                        questionUniqueId: parsedRow.question_unique_id ? Number(parsedRow.question_unique_id) : null,
                        subjectName: parsedRow.subject || null,
                        chapterName: parsedRow.chapter || null,
                        collection: parsedRow.collection || null,
                        previousOf: parsedRow.previous_of || null,
                        exam: parsedRow.exam || 'SSC CGL',
                        year: parsedRow.year ? Number(parsedRow.year) : null,
                        videoUrl: parsedRow.video || null,
                        currentStatus: parsedRow.current_status || 'UPDATED',
                        syncCode: parsedRow.sync_code ? Number(parsedRow.sync_code) : 2,
                        section: parsedRow.section || null,
                        date: parsedRow.date || null,
                        airtableTableName: parsedRow.airtable_table_name || null,
                        action: parsedRow.action || null,
                        options: { create: options },
                    },
                });
                savedCount++;
            } catch (err: any) {
                console.error(`Row ${i + 1} failed to import:`, err);
                failedCount++;
                failedRows.push({
                    batchInternalId: batch.id,
                    rowNumber: i + 1,
                    rawQuestionText: String(body.rows[i].question_eng || body.rows[i].question_hin || 'Error').substring(0, 100),
                    errorMessage: String(err.message || 'Validation failed').substring(0, 255),
                });
            }
        }

        if (failedRows.length > 0) {
            try {
                await prisma.bulkUploadRow.createMany({ data: failedRows });
            } catch (err: any) {
                console.error("Failed to save failed rows:", err);
            }
        }

        await prisma.bulkUploadBatch.update({
            where: { id: batch.id },
            data: { totalQuestionsSaved: savedCount, totalFailedRows: failedCount, uploadStatus: 'Completed' },
        });

        res.json({ success: true, data: { batchId, savedCount, failedCount } });
    } catch (err: any) {
        console.error("Bulk Upload Error:", err);
        next(err);
    }
});

// ─── GET /api/qbank/sets (paginated & filtered) ─────────────────
router.get('/sets', async (req, res, next) => {
    try {
        const { page = 1, limit = 20, folderId, includeSubfolders = 'true', search } = req.query;
        const orgId = req.user?.orgId;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = {};

        if (orgId && orgId !== 'undefined') {
            const org = await prisma.organization.findFirst({ where: { orgId } });
            if (org) where.orgId = org.id;
        } else if (req.user?.role !== 'SUPER_ADMIN') {
            throw new AppError('Organization context required', 400);
        }

        if (folderId) {
            if (includeSubfolders === 'true') {
                const folder = await prisma.qBankFolder.findUnique({ where: { id: folderId as string } });
                if (folder) {
                    where.folder = { path: { startsWith: folder.path } };
                } else {
                    where.folderId = folderId;
                }
            } else {
                where.folderId = folderId;
            }
        }

        if (search) {
            where.OR = [
                { name: { contains: search as string, mode: 'insensitive' } },
                { setId: { contains: search as string, mode: 'insensitive' } },
            ];
        }

        const [sets, total] = await Promise.all([
            prisma.questionSet.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
                include: { _count: { select: { items: true } } },
            }),
            prisma.questionSet.count({ where }),
        ]);

        res.json({ success: true, data: { sets, total } });
    } catch (err: any) {
        next(err);
    }
});

// ─── POST /api/qbank/sets ────────────────────────────────────
router.post('/sets', async (req, res, next) => {
    try {
        const schema = z.object({
            name: z.string().min(1),
            description: z.string().optional(),
            durationMins: z.number().optional(),
            questionIds: z.array(z.string()).default([]),
            folderId: z.string().nullable().optional(),
        });
        const body = schema.parse(req.body);
        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
        let userOrgId = req.user?.orgId;
        let org = (userOrgId && userOrgId !== 'undefined') ? await prisma.organization.findFirst({ where: { orgId: userOrgId } }) : null;

        if (!org && isSuperAdmin) {
            org = await prisma.organization.findFirst({ where: { deletedAt: null } });
        }

        if (!org) {
            throw new AppError('Organization context required. Please select or view an organization.', 400);
        }

        const setId = String(Math.floor(100000 + Math.random() * 900000));
        const pin = String(Math.floor(100000 + Math.random() * 900000));

        const set = await prisma.questionSet.create({
            data: {
                setId,
                pin,
                orgId: org.id,
                name: body.name,
                description: body.description,
                durationMins: body.durationMins,
                folderId: body.folderId || null,
                totalQuestions: body.questionIds.length,
                items: {
                    create: body.questionIds.map((qId, idx) => ({ questionId: qId, sortOrder: idx })),
                },
            },
            include: { items: true },
        });

        res.status(201).json({ success: true, data: set });
    } catch (err) { next(err); }
});

// ─── GET /api/qbank/sets/:id ─────────────────────────────────
router.get('/sets/:id', async (req, res, next) => {
    try {
        const set = await prisma.questionSet.findUniqueOrThrow({
            where: { id: req.params.id },
            include: { items: { include: { question: { include: { options: true } } } } },
        });
        res.json({ success: true, data: set });
    } catch (err) { next(err); }
});

// ─── PATCH /api/qbank/sets/:id ───────────────────────────────
router.patch('/sets/:id', async (req, res, next) => {
    try {
        const schema = z.object({
            name: z.string().min(1).optional(),
            description: z.string().optional(),
            durationMins: z.number().optional().nullable(),
            folderId: z.string().nullable().optional(),
            questionIds: z.array(z.string()).optional(),
        });
        const body = schema.parse(req.body);

        const set = await prisma.questionSet.findUnique({ where: { id: req.params.id } });
        if (!set) throw new AppError('Set not found', 404);

        const updateData: any = {};
        if (body.name !== undefined) updateData.name = body.name;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.durationMins !== undefined) updateData.durationMins = body.durationMins;
        if (body.folderId !== undefined) updateData.folderId = body.folderId;

        if (body.questionIds !== undefined) {
            // Replace all items
            updateData.totalQuestions = body.questionIds.length;
            updateData.items = {
                deleteMany: {},
                create: body.questionIds.map((qId, idx) => ({ questionId: qId, sortOrder: idx })),
            };
        }

        const updated = await prisma.questionSet.update({
            where: { id: req.params.id },
            data: updateData,
            include: { items: { include: { question: { include: { options: true } } } } },
        });

        res.json({ success: true, data: updated });
    } catch (err) { next(err); }
});

// ─── DELETE /api/qbank/sets/:id ──────────────────────────────
router.delete('/sets/:id', async (req, res, next) => {
    try {
        await prisma.questionSet.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Set deleted' });
    } catch (err) { next(err); }
});

// ─── POST /api/qbank/sets/bulk-move ─────────────────────────
router.post('/sets/bulk-move', async (req, res, next) => {
    try {
        const { setIds, targetFolderId } = req.body;
        if (!Array.isArray(setIds) || !targetFolderId) {
            throw new AppError('setIds array and targetFolderId are required', 400);
        }
        await prisma.questionSet.updateMany({
            where: { id: { in: setIds } },
            data: { folderId: targetFolderId },
        });
        res.json({ success: true, message: 'Sets moved successfully' });
    } catch (err) { next(err); }
});

// ─── DELETE /api/qbank/sets (Bulk) ───────────────────────────
router.delete('/sets', async (req, res, next) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            throw new AppError('An array of ids is required', 400);
        }
        await prisma.questionSet.deleteMany({ where: { id: { in: ids } } });
        res.json({ success: true, message: 'Requested sets deleted' });
    } catch (err) { next(err); }
});

// ─── GET /api/qbank/taxonomy ─────────────────────────────────
router.get('/taxonomy', async (req, res, next) => {
    try {
        const subjects = await prisma.subject.findMany({
            where: {
                OR: [
                    { orgId: null },
                    { orgId: req.user?.orgId ? (await prisma.organization.findFirst({ where: { orgId: req.user.orgId } }))?.id : null }
                ]
            },
            include: { chapters: { include: { topics: true } } }
        });
        res.json({ success: true, data: subjects });
    } catch (err) { next(err); }
});

// ─── POST /api/qbank/questions/:id/report ───────────────────
router.post('/questions/:id/report', async (req, res, next) => {
    try {
        const schema = z.object({
            reason: z.string(),
            description: z.string().optional(),
        });
        const body = schema.parse(req.body);
        const org = req.user?.orgId ? await prisma.organization.findFirst({ where: { orgId: req.user.orgId } }) : null;

        const report = await prisma.questionReport.create({
            data: {
                questionId: req.params.id,
                reporterId: org?.id || req.user?.orgId || 'unknown',
                reporterName: org?.name || 'Staff',
                reason: body.reason,
                description: body.description,
            },
        });

        res.status(201).json({ success: true, data: report });
    } catch (err) { next(err); }
});

// ─── GET /api/qbank/reports ──────────────────────────────────
router.get('/reports', async (req, res, next) => {
    try {
        const { status } = req.query;
        const org = req.user?.orgId ? await prisma.organization.findFirst({ where: { orgId: req.user.orgId } }) : null;
        const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

        const where: any = {};
        if (status) where.status = status;
        if (!isSuperAdmin) {
            where.question = { orgId: org?.id };
        }

        const reports = await prisma.questionReport.findMany({
            where,
            include: {
                question: {
                    select: { id: true, questionId: true, textEn: true, textHi: true, orgId: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({ success: true, data: reports });
    } catch (err) { next(err); }
});

// ─── PATCH /api/qbank/reports/:id ────────────────────────────
router.patch('/reports/:id', async (req, res, next) => {
    try {
        const schema = z.object({ status: z.enum(['PENDING', 'RESOLVED', 'REJECTED']) });
        const body = schema.parse(req.body);

        const report = await prisma.questionReport.update({
            where: { id: req.params.id },
            data: { status: body.status },
        });

        res.json({ success: true, data: report });
    } catch (err) { next(err); }
});

export default router;
