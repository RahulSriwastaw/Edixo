import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { authenticate } from '../../middleware/auth';

const router = Router();

// ─── PUBLIC ROUTES (No auth required) ─────────────────────────

// GET /api/blog/posts - public listing (only published)
router.get('/posts', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status, contentType, authorId, categoryId, search, platform, page = '1', limit = '20' } = req.query as Record<string, string>;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where: any = {};

        // If no auth token provided or from public, only show published posts
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            where.status = 'published';
        } else {
            if (status && status !== 'all') where.status = status;
        }

        if (contentType && contentType !== 'all') where.contentType = contentType;
        if (authorId && authorId !== 'all') where.authorId = authorId;
        if (platform && platform !== 'all') {
            where.platform = platform === 'both' ? 'both' : platform;
        }
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } },
                { contentText: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (categoryId && categoryId !== 'all') {
            where.categories = { some: { categoryId } };
        }

        const [posts, total] = await Promise.all([
            prisma.blogPost.findMany({
                where,
                include: {
                    author: { select: { id: true, name: true, slug: true, photoUrl: true } },
                    categories: { include: { category: { select: { id: true, name: true, slug: true } } } },
                    tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: parseInt(limit),
            }),
            prisma.blogPost.count({ where }),
        ]);

        res.json({ success: true, posts, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } });
    } catch (err) { next(err); }
});

// GET /api/blog/posts/:id - public single post
router.get('/posts/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const post = await prisma.blogPost.findFirst({
            where: { OR: [{ id: req.params.id as string }, { slug: req.params.id as string }] },
            include: {
                author: { select: { id: true, name: true, slug: true, photoUrl: true, bio: true } },
                categories: { include: { category: true } },
                tags: { include: { tag: true } },
                revisions: { orderBy: { createdAt: 'desc' }, take: 10 },
            },
        });
        if (!post) return res.status(404).json({ success: false, error: 'Post not found' });

        // If from public (no auth), only show published posts
        const authHeader = req.headers.authorization;
        if (!authHeader && post.status !== 'published') {
            return res.status(404).json({ success: false, error: 'Post not found' });
        }

        res.json({ success: true, post });
    } catch (err) { next(err); }
});

// ─── PUBLIC STATS ─────────────────────────────────────────────
router.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const [totalPosts, publishedPosts, draftPosts, totalAuthors, totalCategories, totalTags] = await Promise.all([
            prisma.blogPost.count(),
            prisma.blogPost.count({ where: { status: 'published' } }),
            prisma.blogPost.count({ where: { status: 'draft' } }),
            prisma.blogAuthor.count({ where: { isActive: true } }),
            prisma.blogCategory.count(),
            prisma.blogTag.count(),
        ]);
        res.json({ success: true, stats: { totalPosts, publishedPosts, draftPosts, totalAuthors, totalCategories, totalTags } });
    } catch (err) { next(err); }
});

// ─── AUTHENTICATED ROUTES ─────────────────────────────────────
router.use(authenticate);

// ─── POSTS (Admin CRUD) ──────────────────────────────────────

// POST /api/blog/posts
router.post('/posts', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            title, slug, content, contentHtml, contentText, excerpt,
            featuredImageUrl, featuredImageAlt, contentType = 'blog',
            status = 'draft', visibility = 'public', password, authorId,
            platform = 'both',
            categoryIds = [], tagIds = [],
            seoTitle, seoDescription, focusKeyword, secondaryKeywords, canonicalUrl,
            robotsIndex = true, robotsFollow = true, schemaType = 'BlogPosting',
            ogTitle, ogDescription, ogImageUrl, twitterCard = 'summary_large_image',
            allowComments = true, isFeatured = false, publishedAt, scheduledAt,
        } = req.body;

        if (!title || !slug || !authorId) {
            return res.status(400).json({ success: false, error: 'Missing required fields: title, slug, authorId' });
        }

        const existing = await prisma.blogPost.findUnique({ where: { slug } });
        if (existing) return res.status(400).json({ success: false, error: 'A post with this slug already exists' });

        const wordCount = contentText ? contentText.split(/\s+/).length : 0;
        const readingTimeMin = Math.max(1, Math.ceil(wordCount / 200));

        const post = await prisma.blogPost.create({
            data: {
                title, slug, content, contentHtml, contentText, excerpt,
                featuredImageUrl, featuredImageAlt, contentType, status, visibility, password, platform,
                authorId, seoTitle, seoDescription, focusKeyword,
                secondaryKeywords: secondaryKeywords ? JSON.stringify(secondaryKeywords) : null,
                canonicalUrl, robotsIndex, robotsFollow, schemaType,
                ogTitle, ogDescription, ogImageUrl, twitterCard, allowComments, isFeatured,
                wordCount, readingTimeMin,
                publishedAt: publishedAt ? new Date(publishedAt) : (status === 'published' ? new Date() : null),
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
                categories: { create: categoryIds.map((cid: string) => ({ categoryId: cid })) },
                tags: { create: tagIds.map((tid: string) => ({ tagId: tid })) },
            },
            include: {
                author: { select: { id: true, name: true, slug: true, photoUrl: true } },
                categories: { include: { category: { select: { id: true, name: true, slug: true } } } },
                tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
            },
        });

        await prisma.blogRevision.create({ data: { postId: post.id, content, title, revisedBy: authorId } });
        await prisma.blogAuthor.update({ where: { id: authorId }, data: { postCount: { increment: 1 } } });

        res.status(201).json({ success: true, post });
    } catch (err) { next(err); }
});

// PATCH /api/blog/posts/:id
router.patch('/posts/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { categoryIds, tagIds, ...data } = req.body;
        const post = await prisma.blogPost.update({
            where: { id: req.params.id as string },
            data: {
                ...data,
                publishedAt: data.publishedAt ? new Date(data.publishedAt) : undefined,
                scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
                ...(categoryIds !== undefined && {
                    categories: { deleteMany: {}, create: categoryIds.map((cid: string) => ({ categoryId: cid })) },
                }),
                ...(tagIds !== undefined && {
                    tags: { deleteMany: {}, create: tagIds.map((tid: string) => ({ tagId: tid })) },
                }),
            },
            include: {
                author: { select: { id: true, name: true, slug: true, photoUrl: true } },
                categories: { include: { category: { select: { id: true, name: true, slug: true } } } },
                tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
            },
        });
        res.json({ success: true, post });
    } catch (err) { next(err); }
});

// DELETE /api/blog/posts/:id
router.delete('/posts/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.blogPost.delete({ where: { id: req.params.id as string } });
        res.json({ success: true, message: 'Post deleted' });
    } catch (err) { next(err); }
});

// ─── AUTHORS ──────────────────────────────────────────────────

router.get('/authors', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const authors = await prisma.blogAuthor.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
        res.json({ success: true, authors });
    } catch (err) { next(err); }
});

router.post('/authors', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const author = await prisma.blogAuthor.create({ data: req.body });
        res.status(201).json({ success: true, author });
    } catch (err) { next(err); }
});

router.get('/authors/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const author = await prisma.blogAuthor.findFirst({
            where: { OR: [{ id: req.params.id as string }, { slug: req.params.id as string }] },
        });
        if (!author) return res.status(404).json({ success: false, error: 'Author not found' });
        res.json({ success: true, author });
    } catch (err) { next(err); }
});

router.patch('/authors/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const author = await prisma.blogAuthor.update({ where: { id: req.params.id as string }, data: req.body });
        res.json({ success: true, author });
    } catch (err) { next(err); }
});

router.delete('/authors/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.blogAuthor.update({ where: { id: req.params.id as string }, data: { isActive: false } });
        res.json({ success: true, message: 'Author deactivated' });
    } catch (err) { next(err); }
});

// ─── CATEGORIES ───────────────────────────────────────────────

router.get('/categories', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const categories = await prisma.blogCategory.findMany({ orderBy: { sortOrder: 'asc' } });
        res.json({ success: true, categories });
    } catch (err) { next(err); }
});

router.post('/categories', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const category = await prisma.blogCategory.create({ data: req.body });
        res.status(201).json({ success: true, category });
    } catch (err) { next(err); }
});

router.get('/categories/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const category = await prisma.blogCategory.findFirst({
            where: { OR: [{ id: req.params.id as string }, { slug: req.params.id as string }] },
        });
        if (!category) return res.status(404).json({ success: false, error: 'Category not found' });
        res.json({ success: true, category });
    } catch (err) { next(err); }
});

router.patch('/categories/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const category = await prisma.blogCategory.update({ where: { id: req.params.id as string }, data: req.body });
        res.json({ success: true, category });
    } catch (err) { next(err); }
});

router.delete('/categories/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.blogCategory.delete({ where: { id: req.params.id as string } });
        res.json({ success: true, message: 'Category deleted' });
    } catch (err) { next(err); }
});

// ─── TAGS ─────────────────────────────────────────────────────

router.get('/tags', async (_req: Request, res: Response, next: NextFunction) => {
    try {
        const tags = await prisma.blogTag.findMany({ orderBy: { name: 'asc' } });
        res.json({ success: true, tags });
    } catch (err) { next(err); }
});

router.post('/tags', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tag = await prisma.blogTag.create({ data: req.body });
        res.status(201).json({ success: true, tag });
    } catch (err) { next(err); }
});

router.get('/tags/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tag = await prisma.blogTag.findFirst({
            where: { OR: [{ id: req.params.id as string }, { slug: req.params.id as string }] },
        });
        if (!tag) return res.status(404).json({ success: false, error: 'Tag not found' });
        res.json({ success: true, tag });
    } catch (err) { next(err); }
});

router.patch('/tags/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const tag = await prisma.blogTag.update({ where: { id: req.params.id as string }, data: req.body });
        res.json({ success: true, tag });
    } catch (err) { next(err); }
});

router.delete('/tags/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
        await prisma.blogTag.delete({ where: { id: req.params.id as string } });
        res.json({ success: true, message: 'Tag deleted' });
    } catch (err) { next(err); }
});

export default router;