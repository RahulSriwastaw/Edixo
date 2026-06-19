-- Migration: Add Sarkari Result Models
-- Run this SQL in your Supabase SQL Editor

-- Sarkari Categories
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
);

-- Sarkari Tags
CREATE TABLE IF NOT EXISTS sarkari_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sarkari Posts
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
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_sarkari_posts_type_status ON sarkari_posts(post_type, status);
CREATE INDEX IF NOT EXISTS idx_sarkari_posts_slug ON sarkari_posts(slug);
CREATE INDEX IF NOT EXISTS idx_sarkari_posts_category ON sarkari_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_sarkari_posts_published ON sarkari_posts(published_at);

-- Sarkari Post Tags (Many-to-Many)
CREATE TABLE IF NOT EXISTS sarkari_post_tags (
    post_id UUID NOT NULL REFERENCES sarkari_posts(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES sarkari_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);