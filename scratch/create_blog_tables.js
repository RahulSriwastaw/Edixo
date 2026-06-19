const { PrismaClient } = require('../eduhub-backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

const statements = [
  `CREATE TABLE IF NOT EXISTS blog_authors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    bio TEXT,
    photo_url TEXT,
    email TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    post_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS blog_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT,
    icon TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS blog_tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )`,
  `CREATE TABLE IF NOT EXISTS blog_posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT,
    content_html TEXT,
    content_text TEXT,
    excerpt TEXT,
    featured_image_url TEXT,
    featured_image_alt TEXT,
    content_type TEXT NOT NULL DEFAULT 'blog',
    status TEXT NOT NULL DEFAULT 'draft',
    visibility TEXT NOT NULL DEFAULT 'public',
    password TEXT,
    platform TEXT NOT NULL DEFAULT 'both',
    author_id TEXT NOT NULL,
    seo_title TEXT,
    seo_description TEXT,
    focus_keyword TEXT,
    secondary_keywords TEXT,
    canonical_url TEXT,
    robots_index BOOLEAN NOT NULL DEFAULT TRUE,
    robots_follow BOOLEAN NOT NULL DEFAULT TRUE,
    schema_type TEXT NOT NULL DEFAULT 'BlogPosting',
    og_title TEXT,
    og_description TEXT,
    og_image_url TEXT,
    twitter_card TEXT NOT NULL DEFAULT 'summary_large_image',
    allow_comments BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
    word_count INTEGER NOT NULL DEFAULT 0,
    reading_time_min INTEGER NOT NULL DEFAULT 1,
    view_count INTEGER NOT NULL DEFAULT 0,
    like_count INTEGER NOT NULL DEFAULT 0,
    share_count INTEGER NOT NULL DEFAULT 0,
    published_at TIMESTAMPTZ,
    scheduled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT blog_posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES blog_authors(id)
  )`,
  `CREATE TABLE IF NOT EXISTS blog_post_categories (
    post_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    PRIMARY KEY (post_id, category_id),
    CONSTRAINT blog_post_categories_post_id_fkey FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
    CONSTRAINT blog_post_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES blog_categories(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS blog_post_tags (
    post_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    PRIMARY KEY (post_id, tag_id),
    CONSTRAINT blog_post_tags_post_id_fkey FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
    CONSTRAINT blog_post_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES blog_tags(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS blog_revisions (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    title TEXT,
    content TEXT,
    revised_by TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT blog_revisions_post_id_fkey FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
  )`,
  `CREATE INDEX IF NOT EXISTS blog_posts_status_platform_idx ON blog_posts(status, platform)`,
  `CREATE INDEX IF NOT EXISTS blog_posts_slug_idx ON blog_posts(slug)`,
  `CREATE INDEX IF NOT EXISTS blog_posts_author_id_idx ON blog_posts(author_id)`,
  `CREATE INDEX IF NOT EXISTS blog_posts_published_at_idx ON blog_posts(published_at)`,
  `INSERT INTO blog_authors (id, name, slug, bio, is_active, post_count)
   VALUES ('system-author', 'System Author', 'system-author', 'Auto-created default author', TRUE, 0)
   ON CONFLICT (id) DO NOTHING`,
  `INSERT INTO blog_categories (id, name, slug, description, sort_order, is_active)
   VALUES ('general-category', 'General', 'general', 'Default blog category', 0, TRUE)
   ON CONFLICT (id) DO NOTHING`,
  `INSERT INTO blog_tags (id, name, slug)
   VALUES ('general-tag', 'General', 'general')
   ON CONFLICT (id) DO NOTHING`
];

(async () => {
  try {
    for (const sql of statements) {
      await prisma.$executeRawUnsafe(sql);
    }
    console.log('Blog tables created successfully');
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
