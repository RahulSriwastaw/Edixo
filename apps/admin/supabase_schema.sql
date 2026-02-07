-- Create Questions Table
CREATE TABLE questions (
    id TEXT PRIMARY KEY,
    question_unique_id TEXT,
    question_hin TEXT,
    question_eng TEXT,
    subject TEXT,
    chapter TEXT,
    option1_hin TEXT,
    option1_eng TEXT,
    option2_hin TEXT,
    option2_eng TEXT,
    option3_hin TEXT,
    option3_eng TEXT,
    option4_hin TEXT,
    option4_eng TEXT,
    option5_hin TEXT,
    option5_eng TEXT,
    answer TEXT,
    solution_hin TEXT,
    solution_eng TEXT,
    type TEXT,
    difficulty TEXT,
    language TEXT,
    tags TEXT[],
    "createdDate" TEXT,
    sources JSONB,
    -- Metadata fields
    collection TEXT,
    previous_of TEXT,
    video TEXT,
    airtable_table_name TEXT,
    exam TEXT,
    section TEXT,
    year TEXT,
    date TEXT,
    action TEXT,
    current_status TEXT,
    sync_code TEXT,
    error_report TEXT,
    error_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Sets Table
CREATE TABLE sets (
    "setId" TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    password TEXT,
    "questionIds" TEXT[],
    "createdDate" TEXT,
    status TEXT,
    category TEXT,
    "publishedDate" TEXT,
    tags TEXT[],
    settings JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Migration for existing tables (safe to run even if column exists if handled, but simple here)
-- DO $$ 
-- BEGIN 
--     IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sets' AND column_name='tags') THEN 
--         ALTER TABLE sets ADD COLUMN tags TEXT[]; 
--     END IF; 
-- END $$;
ALTER TABLE sets ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Enable Row Level Security (RLS) is recommended, but for now we allow public access to make the app work immediately.
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;

-- Create Policies to allow public read/write access
CREATE POLICY "Enable all access for all users" ON questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all users" ON sets FOR ALL USING (true) WITH CHECK (true);
