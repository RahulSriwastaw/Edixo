import { Router, Request, Response, NextFunction } from "express";
import { prisma } from "../../config/database";
import { authenticate } from "../../middleware/auth";

const router = Router();

let sarkariInitPromise: Promise<void> | null = null;

async function ensureSarkariResultTables() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS sarkari_categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      type TEXT NOT NULL DEFAULT 'job',
      icon TEXT,
      color TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS sarkari_tags (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS sarkari_posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      content TEXT,
      excerpt TEXT,
      post_type TEXT NOT NULL DEFAULT 'job',
      status TEXT NOT NULL DEFAULT 'draft',
      is_featured BOOLEAN NOT NULL DEFAULT false,
      is_pinned BOOLEAN NOT NULL DEFAULT false,
      view_count INTEGER NOT NULL DEFAULT 0,
      featured_image_url TEXT,
      featured_image_alt TEXT,
      last_updated_date TIMESTAMPTZ,
      application_start_date TIMESTAMPTZ,
      application_end_date TIMESTAMPTZ,
      exam_date TIMESTAMPTZ,
      result_date TIMESTAMPTZ,
      admit_card_date TIMESTAMPTZ,
      objection_last_date TIMESTAMPTZ,
      release_date TIMESTAMPTZ,
      organization TEXT,
      university TEXT,
      course_name TEXT,
      total_posts INTEGER,
      application_fee JSONB,
      age_limit JSONB,
      vacancy_details JSONB,
      eligibility JSONB,
      selection_process JSONB,
      how_to_apply TEXT,
      important_links JSONB,
      faq_data JSONB,
      important_dates JSONB,
      job_type TEXT,
      state_name TEXT,
      qualification TEXT,
      seo_title TEXT,
      seo_description TEXT,
      focus_keyword TEXT,
      canonical_url TEXT,
      robots_index BOOLEAN NOT NULL DEFAULT true,
      robots_follow BOOLEAN NOT NULL DEFAULT true,
      schema_type TEXT NOT NULL DEFAULT 'NewsArticle',
      category_id UUID REFERENCES sarkari_categories(id),
      published_at TIMESTAMPTZ,
      scheduled_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS idx_sarkari_posts_type_status ON sarkari_posts(post_type, status)
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS idx_sarkari_posts_slug ON sarkari_posts(slug)
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS idx_sarkari_posts_category ON sarkari_posts(category_id)
  `);
  await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS idx_sarkari_posts_published ON sarkari_posts(published_at)
  `);

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS sarkari_post_tags (
      post_id UUID NOT NULL REFERENCES sarkari_posts(id) ON DELETE CASCADE,
      tag_id UUID NOT NULL REFERENCES sarkari_tags(id) ON DELETE CASCADE,
      PRIMARY KEY (post_id, tag_id)
    )
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO sarkari_categories (name, slug, description, type, color, sort_order)
    VALUES
      ('Latest Jobs', 'latest-jobs', 'Government job notifications and recruitments', 'job', '#2563eb', 1),
      ('Results', 'results', 'Exam and recruitment results', 'result', '#16a34a', 2),
      ('Admit Cards', 'admit-cards', 'Admit card and hall ticket updates', 'admit_card', '#ea580c', 3),
      ('Admissions', 'admissions', 'Admission and counselling updates', 'admission', '#7c3aed', 4),
      ('Syllabus', 'syllabus', 'Syllabus and exam pattern updates', 'syllabus', '#0891b2', 5)
    ON CONFLICT (slug) DO NOTHING
  `);

  await prisma.$executeRawUnsafe(`
    INSERT INTO sarkari_tags (name, slug)
    VALUES
      ('Government Job', 'government-job'),
      ('Online Form', 'online-form'),
      ('Latest Update', 'latest-update'),
      ('Result', 'result'),
      ('Admit Card', 'admit-card')
    ON CONFLICT (slug) DO NOTHING
  `);
}

async function ensureSarkariReady() {
  if (!sarkariInitPromise) {
    sarkariInitPromise = ensureSarkariResultTables().catch((error) => {
      sarkariInitPromise = null;
      throw error;
    });
  }
  await sarkariInitPromise;
}

// ─── PUBLIC ROUTES ────────────────────────────────────────────

// GET /api/sarkari/posts - public listing (only published)
router.get(
  "/posts",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await ensureSarkariReady();
      const {
        postType,
        categoryId,
        search,
        state,
        qualification,
        page = "1",
        limit = "20",
      } = req.query as Record<string, string>;
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const where: any = { status: "published" };

      if (postType && postType !== "all") where.postType = postType;
      if (categoryId) where.categoryId = categoryId;
      if (state) where.stateName = state;
      if (qualification) where.qualification = qualification;
      if (search) {
        where.OR = [
          { title: { contains: search, mode: "insensitive" } },
          { excerpt: { contains: search, mode: "insensitive" } },
          { organization: { contains: search, mode: "insensitive" } },
        ];
      }

      const [posts, total] = await Promise.all([
        prisma.sarkariPost.findMany({
          where,
          include: {
            category: {
              select: { id: true, name: true, slug: true, color: true },
            },
            tags: { include: { tag: true } },
          },
          orderBy: { publishedAt: "desc" },
          skip,
          take: parseInt(limit),
        }),
        prisma.sarkariPost.count({ where }),
      ]);

      res.json({
        success: true,
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/sarkari/posts/:slug - public single post
router.get(
  "/posts/:slug",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await ensureSarkariReady();
      const slug = req.params.slug as string;
      const post = await prisma.sarkariPost.findFirst({
        where: { OR: [{ id: slug }, { slug }] },
        include: { category: true, tags: { include: { tag: true } } },
      });
      if (!post || post.status !== "published")
        return res
          .status(404)
          .json({ success: false, error: "Post not found" });
      res.json({ success: true, post });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/sarkari/categories
router.get(
  "/categories",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      await ensureSarkariReady();
      const categories = await prisma.sarkariCategory.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      });
      res.json({ success: true, categories });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/sarkari/tags
router.get(
  "/tags",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      await ensureSarkariReady();
      const tags = await prisma.sarkariTag.findMany({
        orderBy: { name: "asc" },
      });
      res.json({ success: true, tags });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/sarkari/stats
router.get(
  "/stats",
  async (_req: Request, res: Response, next: NextFunction) => {
    try {
      await ensureSarkariReady();
      const [jobs, results, admitCards, answerKeys, admissions] =
        await Promise.all([
          prisma.sarkariPost.count({
            where: { status: "published", postType: "job" },
          }),
          prisma.sarkariPost.count({
            where: { status: "published", postType: "result" },
          }),
          prisma.sarkariPost.count({
            where: { status: "published", postType: "admit_card" },
          }),
          prisma.sarkariPost.count({
            where: { status: "published", postType: "answer_key" },
          }),
          prisma.sarkariPost.count({
            where: { status: "published", postType: "admission" },
          }),
        ]);
      res.json({
        success: true,
        stats: { jobs, results, admitCards, answerKeys, admissions },
      });
    } catch (err) {
      next(err);
    }
  },
);

// ─── AUTHENTICATED ROUTES (Admin) ────────────────────────────
router.use(authenticate);

// POST /api/sarkari/posts
router.post(
  "/posts",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await ensureSarkariReady();
      const { tags: tagIds, ...data } = req.body;
      if (!data.title || !data.slug)
        return res
          .status(400)
          .json({ success: false, error: "Title and slug required" });

      const existing = await prisma.sarkariPost.findUnique({
        where: { slug: data.slug },
      });
      if (existing)
        return res
          .status(400)
          .json({ success: false, error: "Slug already exists" });

      const post = await prisma.sarkariPost.create({
        data: {
          ...data,
          publishedAt: data.status === "published" ? new Date() : undefined,
          tags: tagIds
            ? { create: tagIds.map((tid: string) => ({ tagId: tid })) }
            : undefined,
        },
        include: { category: true, tags: { include: { tag: true } } },
      });
      res.status(201).json({ success: true, post });
    } catch (err) {
      next(err);
    }
  },
);

// PATCH /api/sarkari/posts/:id
router.patch(
  "/posts/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await ensureSarkariReady();
      const { tags: tagIds, ...data } = req.body;
      const id = req.params.id as string;
      const post = await prisma.sarkariPost.update({
        where: { id },
        data: {
          ...data,
          ...(tagIds !== undefined && {
            tags: {
              deleteMany: {},
              create: tagIds.map((tid: string) => ({ tagId: tid })),
            },
          }),
        },
        include: { category: true, tags: { include: { tag: true } } },
      });
      res.json({ success: true, post });
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /api/sarkari/posts/:id
router.delete(
  "/posts/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await ensureSarkariReady();
      await prisma.sarkariPost.delete({
        where: { id: req.params.id as string },
      });
      res.json({ success: true, message: "Deleted" });
    } catch (err) {
      next(err);
    }
  },
);

// CRUD for categories
router.post(
  "/categories",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await ensureSarkariReady();
      const cat = await prisma.sarkariCategory.create({ data: req.body });
      res.status(201).json({ success: true, category: cat });
    } catch (err) {
      next(err);
    }
  },
);

router.patch(
  "/categories/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await ensureSarkariReady();
      const cat = await prisma.sarkariCategory.update({
        where: { id: req.params.id as string },
        data: req.body,
      });
      res.json({ success: true, category: cat });
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  "/categories/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await ensureSarkariReady();
      await prisma.sarkariCategory.delete({
        where: { id: req.params.id as string },
      });
      res.json({ success: true, message: "Deleted" });
    } catch (err) {
      next(err);
    }
  },
);

// CRUD for tags
router.post(
  "/tags",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await ensureSarkariReady();
      const tag = await prisma.sarkariTag.create({ data: req.body });
      res.status(201).json({ success: true, tag });
    } catch (err) {
      next(err);
    }
  },
);

router.delete(
  "/tags/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await ensureSarkariReady();
      await prisma.sarkariTag.delete({
        where: { id: req.params.id as string },
      });
      res.json({ success: true, message: "Deleted" });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
