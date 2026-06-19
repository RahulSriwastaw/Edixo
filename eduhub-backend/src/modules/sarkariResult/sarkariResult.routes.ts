import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/database';
import { authenticate } from '../../middleware/auth';

const router = Router();

// ─── PUBLIC ROUTES ────────────────────────────────────────────

// GET /api/sarkari/posts - public listing (only published)
router.get('/posts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { postType, categoryId, search, state, qualification, page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: any = { status: 'published' };

    if (postType && postType !== 'all') where.postType = postType;
    if (categoryId) where.categoryId = categoryId;
    if (state) where.stateName = state;
    if (qualification) where.qualification = qualification;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { organization: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.sarkariPost.findMany({
        where,
        include: { category: { select: { id: true, name: true, slug: true, color: true } }, tags: { include: { tag: true } } },
        orderBy: { publishedAt: 'desc' },
        skip, take: parseInt(limit),
      }),
      prisma.sarkariPost.count({ where }),
    ]);

    res.json({ success: true, posts, pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { next(err); }
});

// GET /api/sarkari/posts/:slug - public single post
router.get('/posts/:slug', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const post = await prisma.sarkariPost.findFirst({
      where: { OR: [{ id: req.params.slug }, { slug: req.params.slug }] },
      include: { category: true, tags: { include: { tag: true } } },
    });
    if (!post || (post.status !== 'published')) return res.status(404).json({ success: false, error: 'Post not found' });
    res.json({ success: true, post });
  } catch (err) { next(err); }
});

// GET /api/sarkari/categories
router.get('/categories', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await prisma.sarkariCategory.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
    res.json({ success: true, categories });
  } catch (err) { next(err); }
});

// GET /api/sarkari/tags
router.get('/tags', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const tags = await prisma.sarkariTag.findMany({ orderBy: { name: 'asc' } });
    res.json({ success: true, tags });
  } catch (err) { next(err); }
});

// GET /api/sarkari/stats
router.get('/stats', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const [jobs, results, admitCards, answerKeys, admissions] = await Promise.all([
      prisma.sarkariPost.count({ where: { status: 'published', postType: 'job' } }),
      prisma.sarkariPost.count({ where: { status: 'published', postType: 'result' } }),
      prisma.sarkariPost.count({ where: { status: 'published', postType: 'admit_card' } }),
      prisma.sarkariPost.count({ where: { status: 'published', postType: 'answer_key' } }),
      prisma.sarkariPost.count({ where: { status: 'published', postType: 'admission' } }),
    ]);
    res.json({ success: true, stats: { jobs, results, admitCards, answerKeys, admissions } });
  } catch (err) { next(err); }
});

// ─── AUTHENTICATED ROUTES (Admin) ────────────────────────────
router.use(authenticate);

// POST /api/sarkari/posts
router.post('/posts', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tags: tagIds, ...data } = req.body;
    if (!data.title || !data.slug) return res.status(400).json({ success: false, error: 'Title and slug required' });

    const existing = await prisma.sarkariPost.findUnique({ where: { slug: data.slug } });
    if (existing) return res.status(400).json({ success: false, error: 'Slug already exists' });

    const post = await prisma.sarkariPost.create({
      data: {
        ...data,
        publishedAt: data.status === 'published' ? new Date() : undefined,
        tags: tagIds ? { create: tagIds.map((tid: string) => ({ tagId: tid })) } : undefined,
      },
      include: { category: true, tags: { include: { tag: true } } },
    });
    res.status(201).json({ success: true, post });
  } catch (err) { next(err); }
});

// PATCH /api/sarkari/posts/:id
router.patch('/posts/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tags: tagIds, ...data } = req.body;
    const post = await prisma.sarkariPost.update({
      where: { id: req.params.id },
      data: {
        ...data,
        ...(tagIds !== undefined && { tags: { deleteMany: {}, create: tagIds.map((tid: string) => ({ tagId: tid })) } }),
      },
      include: { category: true, tags: { include: { tag: true } } },
    });
    res.json({ success: true, post });
  } catch (err) { next(err); }
});

// DELETE /api/sarkari/posts/:id
router.delete('/posts/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.sarkariPost.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
});

// CRUD for categories
router.post('/categories', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cat = await prisma.sarkariCategory.create({ data: req.body });
    res.status(201).json({ success: true, category: cat });
  } catch (err) { next(err); }
});

router.patch('/categories/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cat = await prisma.sarkariCategory.update({ where: { id: req.params.id }, data: req.body });
    res.json({ success: true, category: cat });
  } catch (err) { next(err); }
});

router.delete('/categories/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.sarkariCategory.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
});

// CRUD for tags
router.post('/tags', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tag = await prisma.sarkariTag.create({ data: req.body });
    res.status(201).json({ success: true, tag });
  } catch (err) { next(err); }
});

router.delete('/tags/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await prisma.sarkariTag.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) { next(err); }
});

export default router;