-- Content Management System Database Migration
-- Creates table for managing educational content (videos, PDFs, links)

-- =====================================================
-- 1. Content Table
-- =====================================================
CREATE TABLE IF NOT EXISTS content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE, -- Optional: if content belongs to specific org
  
  -- Metadata
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) CHECK (type IN ('video', 'pdf', 'document', 'link')) NOT NULL,
  category VARCHAR(100),
  
  -- Media
  thumbnail_url TEXT,
  file_url TEXT NOT NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_content_type ON content(type);
CREATE INDEX idx_content_category ON content(category);
CREATE INDEX idx_content_created_at ON content(created_at);

-- =====================================================
-- 2. RLS Policies
-- =====================================================
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Policy: Public/Shared content visible to authenticated users
CREATE POLICY "Content visible to authenticated users"
ON content FOR SELECT
TO authenticated
USING (true); -- Or refine based on is_public or organization_id

-- Policy: Only Admins/Editors can manage content
CREATE POLICY "Admins can manage content"
ON content FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.auth_user_id = auth.uid() 
    AND users.role IN ('super_admin', 'admin', 'editor')
  )
);

-- =====================================================
-- 3. Trigger for Updated At
-- =====================================================
CREATE OR REPLACE FUNCTION update_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_content_updated_at
BEFORE UPDATE ON content
FOR EACH ROW
EXECUTE FUNCTION update_content_updated_at();
