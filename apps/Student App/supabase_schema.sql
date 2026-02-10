-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Tests Table
create table if not exists public.tests (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  category text not null, -- 'chapter', 'mock', 'practice', 'previous'
  questions_count integer default 0,
  duration integer default 0, -- in minutes
  difficulty text check (difficulty in ('Easy', 'Medium', 'Hard')),
  tags text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Questions Table (Optional, if we want to store questions in DB)
create table if not exists public.questions (
  id uuid default uuid_generate_v4() primary key,
  test_id uuid references public.tests(id) on delete cascade,
  type text check (type in ('mcq', 'numerical', 'boolean')),
  prompt text not null,
  options jsonb, -- Array of strings for options
  answer_index integer, -- For MCQ
  correct_value text, -- For numerical
  explanation text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Test Attempts Table
create table if not exists public.test_attempts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  test_id uuid references public.tests(id) on delete set null, -- Can be null for ad-hoc practice
  score integer default 0,
  total_questions integer default 0,
  answers jsonb, -- Store user answers
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Profiles Table (Public user info)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  avatar_url text,
  username text unique,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.tests enable row level security;
alter table public.questions enable row level security;
alter table public.test_attempts enable row level security;
alter table public.profiles enable row level security;

-- Policies
-- Tests are readable by everyone (or authenticated users)
create policy "Tests are viewable by everyone" on public.tests
  for select using (true);

-- Questions are readable by everyone
create policy "Questions are viewable by everyone" on public.questions
  for select using (true);

-- Test Attempts: Users can insert their own attempts
create policy "Users can insert their own attempts" on public.test_attempts
  for insert with check (auth.uid() = user_id);

-- Test Attempts: Users can view their own attempts
create policy "Users can view their own attempts" on public.test_attempts
  for select using (auth.uid() = user_id);

-- Profiles: Public profiles are viewable by everyone
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

-- Profiles: Users can insert their own profile
create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Profiles: Users can update own profile
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Seed Data for Tests
insert into public.tests (title, category, questions_count, duration, difficulty, tags) values
('Physics: Kinematics', 'chapter', 15, 20, 'Medium', ARRAY['Mechanics']),
('Chemistry: Thermodynamics', 'chapter', 20, 30, 'Hard', ARRAY['Physical']),
('Math: Calculus Basics', 'chapter', 10, 15, 'Easy', ARRAY['Calculus']),
('JEE Main Mock 1', 'mock', 75, 180, 'Hard', ARRAY['Full Syllabus']),
('NEET Full Syllabus', 'mock', 180, 200, 'Medium', ARRAY['Full Syllabus']);
