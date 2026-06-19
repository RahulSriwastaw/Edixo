const { PrismaClient } = require('../eduhub-backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

const statements = [
  `ALTER TABLE blog_authors ADD COLUMN IF NOT EXISTS "photoUrl" TEXT`,
  `ALTER TABLE blog_authors ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT TRUE`,
  `ALTER TABLE blog_authors ADD COLUMN IF NOT EXISTS "postCount" INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE blog_authors ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()`,
  `ALTER TABLE blog_authors ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()`,
  `UPDATE blog_authors SET "photoUrl" = COALESCE("photoUrl", photo_url), "isActive" = COALESCE("isActive", is_active), "postCount" = COALESCE("postCount", post_count), "createdAt" = COALESCE("createdAt", created_at), "updatedAt" = COALESCE("updatedAt", updated_at)`,

  `ALTER TABLE blog_categories ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE blog_categories ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT TRUE`,
  `ALTER TABLE blog_categories ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()`,
  `ALTER TABLE blog_categories ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()`,
  `UPDATE blog_categories SET "sortOrder" = COALESCE("sortOrder", sort_order), "isActive" = COALESCE("isActive", is_active), "createdAt" = COALESCE("createdAt", created_at), "updatedAt" = COALESCE("updatedAt", updated_at)`,

  `ALTER TABLE blog_tags ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()`,
  `UPDATE blog_tags SET "createdAt" = COALESCE("createdAt", created_at)`,

  `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "contentHtml" TEXT`,
  `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "contentText" TEXT`,
  `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "featuredImageUrl" TEXT`,
  `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "featuredImageAlt" TEXT`,
  `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "contentType" TEXT NOT NULL DEFAULT 'blog'`,
  `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "authorId" TEXT`,
  `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "seoTitle" TEXT`,
  `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "seoDescription" TEXT`,
  `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "focusKeyword" TEXT`,
  `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "secondaryKeywords" TEXT`,
  `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "canonicalUrl" TEXT`,
  `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "robotsIndex" BOOLEAN NOT NULL DEFAULT TRUE`,
  `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "robotsFollow" BOOLEAN NOT NULL DEFAULT TRUE`,
  `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "schemaType" TEXT NOT NULL DEFAULT 'BlogPosting'`,
  `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "ogTitle" TEXT`,
  `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "ogDescription" TEXT`,
  `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "ogImageUrl" TEXT`,
  `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "twitterCard" TEXT NOT NULL DEFAULT 'summary_large_image'`,
  `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "allowComments" BOOLEAN NOT NULL DEFAULT TRUE`,
  `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "isFeatured" BOOLEAN NOT NULL DEFAULT FALSE`,
  `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "isPinned" BOOLEAN NOT NULL DEFAULT FALSE`,
  `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "wordCount" INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "readingTimeMin" INTEGER NOT NULL DEFAULT 1`,
  `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "viewCount" INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "likeCount" INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "shareCount" INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMPTZ`,
  `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "scheduledAt" TIMESTAMPTZ`,
  `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()`,
  `ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()`,
  `UPDATE blog_posts SET "contentHtml" = COALESCE("contentHtml", content_html), "contentText" = COALESCE("contentText", content_text), "featuredImageUrl" = COALESCE("featuredImageUrl", featured_image_url), "featuredImageAlt" = COALESCE("featuredImageAlt", featured_image_alt), "contentType" = COALESCE("contentType", content_type), "authorId" = COALESCE("authorId", author_id), "seoTitle" = COALESCE("seoTitle", seo_title), "seoDescription" = COALESCE("seoDescription", seo_description), "focusKeyword" = COALESCE("focusKeyword", focus_keyword), "secondaryKeywords" = COALESCE("secondaryKeywords", secondary_keywords), "canonicalUrl" = COALESCE("canonicalUrl", canonical_url), "robotsIndex" = COALESCE("robotsIndex", robots_index), "robotsFollow" = COALESCE("robotsFollow", robots_follow), "schemaType" = COALESCE("schemaType", schema_type), "ogTitle" = COALESCE("ogTitle", og_title), "ogDescription" = COALESCE("ogDescription", og_description), "ogImageUrl" = COALESCE("ogImageUrl", og_image_url), "twitterCard" = COALESCE("twitterCard", twitter_card), "allowComments" = COALESCE("allowComments", allow_comments), "isFeatured" = COALESCE("isFeatured", is_featured), "isPinned" = COALESCE("isPinned", is_pinned), "wordCount" = COALESCE("wordCount", word_count), "readingTimeMin" = COALESCE("readingTimeMin", reading_time_min), "viewCount" = COALESCE("viewCount", view_count), "likeCount" = COALESCE("likeCount", like_count), "shareCount" = COALESCE("shareCount", share_count), "publishedAt" = COALESCE("publishedAt", published_at), "scheduledAt" = COALESCE("scheduledAt", scheduled_at), "createdAt" = COALESCE("createdAt", created_at), "updatedAt" = COALESCE("updatedAt", updated_at)`,

  `ALTER TABLE blog_post_categories ADD COLUMN IF NOT EXISTS "postId" TEXT`,
  `ALTER TABLE blog_post_categories ADD COLUMN IF NOT EXISTS "categoryId" TEXT`,
  `UPDATE blog_post_categories SET "postId" = COALESCE("postId", post_id), "categoryId" = COALESCE("categoryId", category_id)`,

  `ALTER TABLE blog_post_tags ADD COLUMN IF NOT EXISTS "postId" TEXT`,
  `ALTER TABLE blog_post_tags ADD COLUMN IF NOT EXISTS "tagId" TEXT`,
  `UPDATE blog_post_tags SET "postId" = COALESCE("postId", post_id), "tagId" = COALESCE("tagId", tag_id)`,

  `ALTER TABLE blog_revisions ADD COLUMN IF NOT EXISTS "postId" TEXT`,
  `ALTER TABLE blog_revisions ADD COLUMN IF NOT EXISTS "revisedBy" TEXT`,
  `ALTER TABLE blog_revisions ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()`,
  `UPDATE blog_revisions SET "postId" = COALESCE("postId", post_id), "revisedBy" = COALESCE("revisedBy", revised_by), "createdAt" = COALESCE("createdAt", created_at)`
];

(async () => {
  try {
    for (const sql of statements) {
      await prisma.$executeRawUnsafe(sql);
    }
    console.log('Blog columns aligned successfully');
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
