-- Live Streaming Infrastructure Database Migration
-- Creates tables for live class streaming with OBS integration

-- =====================================================
-- 1. Live Streams Table
-- =====================================================
CREATE TABLE IF NOT EXISTS live_streams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Basic Info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Stream Configuration
  stream_key VARCHAR(255) UNIQUE NOT NULL,
  rtmp_url TEXT NOT NULL,
  playback_url TEXT,
  
  -- Status Management
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended')),
  scheduled_at TIMESTAMP NOT NULL,
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  
  -- Recording
  is_recorded BOOLEAN DEFAULT false,
  recording_url TEXT,
  
  -- Limits
  max_viewers INTEGER DEFAULT 500,
  
  -- Analytics
  peak_viewers INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_live_streams_org ON live_streams(org_id);
CREATE INDEX idx_live_streams_teacher ON live_streams(teacher_id);
CREATE INDEX idx_live_streams_status ON live_streams(status);
CREATE INDEX idx_live_streams_scheduled ON live_streams(scheduled_at);

-- =====================================================
-- 2. Stream Viewers Table
-- =====================================================
CREATE TABLE IF NOT EXISTS stream_viewers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stream_id UUID REFERENCES live_streams(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  
  -- Tracking
  joined_at TIMESTAMP DEFAULT NOW(),
  left_at TIMESTAMP,
  watch_duration INTEGER, -- in seconds
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_stream_viewers_stream ON stream_viewers(stream_id);
CREATE INDEX idx_stream_viewers_student ON stream_viewers(student_id);
CREATE INDEX idx_stream_viewers_active ON stream_viewers(stream_id, left_at) WHERE left_at IS NULL;

-- =====================================================
-- 3. Stream Settings Table (Optional)
-- =====================================================
CREATE TABLE IF NOT EXISTS stream_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  
  -- Provider Configuration
  provider VARCHAR(50) DEFAULT 'agora' CHECK (provider IN ('agora', 'aws_ivs', 'custom')),
  rtmp_base_url TEXT DEFAULT 'rtmp://stream.qbank.com/live',
  api_key TEXT,
  api_secret TEXT,
  
  -- Limits
  max_concurrent_streams INTEGER DEFAULT 10,
  max_viewers_per_stream INTEGER DEFAULT 500,
  
  -- Features
  enable_recording BOOLEAN DEFAULT true,
  enable_analytics BOOLEAN DEFAULT true,
  enable_chat BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- 4. Helper Functions
-- =====================================================

-- Function to get current active viewer count
CREATE OR REPLACE FUNCTION get_active_viewers(stream_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM stream_viewers
    WHERE stream_id = stream_uuid
    AND left_at IS NULL
  );
END;
$$ LANGUAGE plpgsql;

-- Function to update stream status automatically
CREATE OR REPLACE FUNCTION update_stream_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-set to 'live' when started_at is set
  IF NEW.started_at IS NOT NULL AND OLD.started_at IS NULL THEN
    NEW.status := 'live';
  END IF;
  
  -- Auto-set to 'ended' when ended_at is set
  IF NEW.ended_at IS NOT NULL AND OLD.ended_at IS NULL THEN
    NEW.status := 'ended';
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto status updates
CREATE TRIGGER trigger_update_stream_status
BEFORE UPDATE ON live_streams
FOR EACH ROW
EXECUTE FUNCTION update_stream_status();

-- =====================================================
-- 5. Row Level Security (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_viewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stream_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Students can view live and scheduled streams
CREATE POLICY "Students can view streams"
ON live_streams FOR SELECT
TO authenticated
USING (status IN ('live', 'scheduled'));

-- Policy: Teachers can manage their own streams
CREATE POLICY "Teachers can manage own streams"
ON live_streams FOR ALL
TO authenticated
USING (teacher_id = auth.uid());

-- Policy: Org admins can manage org streams
CREATE POLICY "Org admins can manage org streams"
ON live_streams FOR ALL
TO authenticated
USING (
  org_id IN (
    SELECT org_id FROM users WHERE auth_user_id = auth.uid() AND role = 'org_admin'
  )
);

-- Policy: Students can track their own viewing
CREATE POLICY "Students can track viewing"
ON stream_viewers FOR INSERT
TO authenticated
WITH CHECK (
  student_id IN (
    SELECT id FROM students WHERE auth_user_id = auth.uid()
  )
);

-- =====================================================
-- 6. Sample Data (for testing)
-- =====================================================

-- Insert sample stream (Optional - Comment out in production)
/*
INSERT INTO live_streams (
  org_id,
  teacher_id,
  title,
  description,
  stream_key,
  rtmp_url,
  playback_url,
  status,
  scheduled_at
) VALUES (
  'your-org-id-here',
  'your-teacher-id-here',
  'Introduction to Calculus',
  'Learn the basics of differentiation and integration',
  'stream_test123',
  'rtmp://stream.qbank.com/live',
  'https://stream.qbank.com/live/stream_test123/index.m3u8',
  'scheduled',
  NOW() + INTERVAL '1 hour'
);
*/

-- =====================================================
-- 7. Useful Queries
-- =====================================================

-- Get all active live streams with viewer count
-- SELECT 
--   ls.*,
--   get_active_viewers(ls.id) as current_viewers
-- FROM live_streams ls
-- WHERE status = 'live'
-- ORDER BY started_at DESC;

-- Get viewer analytics for a stream
-- SELECT 
--   s.name as student_name,
--   sv.joined_at,
--   sv.left_at,
--   EXTRACT(EPOCH FROM (COALESCE(sv.left_at, NOW()) - sv.joined_at)) as watch_seconds
-- FROM stream_viewers sv
-- JOIN students s ON sv.student_id = s.id
-- WHERE sv.stream_id = 'your-stream-id-here'
-- ORDER BY sv.joined_at DESC;
