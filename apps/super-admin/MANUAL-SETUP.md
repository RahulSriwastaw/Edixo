# 🚀 Quick Database Setup Guide

## Problem
Direct PostgreSQL connection se timeout aa raha hai. Supabase Dashboard se SQL run karna padega.

## ✅ Solution: Supabase Dashboard se Setup

### Step 1: Supabase Dashboard Open Karein
```
https://supabase.com/dashboard/project/jwwjjyxdepayjdjlmdmo
```

### Step 2: SQL Editor Open Karein
1. Left sidebar me **SQL Editor** par click karein
2. **New Query** button click karein

### Step 3: Database Schema Create Karein

Copy-paste ye pura SQL (`database-setup.sql` file se):

```sql
-- Run this entire script in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE NOT NULL,
    org_id UUID,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'teacher',
    status TEXT DEFAULT 'active',
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT users_role_check CHECK (role IN ('super_admin', 'org_admin', 'teacher'))
);

CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    plan_type TEXT DEFAULT 'free',
    status TEXT DEFAULT 'active',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id),
    teacher_id UUID REFERENCES users(id),
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID REFERENCES organizations(id),
    email TEXT NOT NULL,
    full_name TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    status TEXT DEFAULT 'draft',
    category TEXT,
    tags TEXT[],
    seo_meta JSONB DEFAULT '{}',
    view_count INT DEFAULT 0,
    author_id UUID REFERENCES users(id),
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT DEFAULT 'whiteboard_app',
    platform TEXT,
    version TEXT,
    download_url TEXT,
    is_active BOOLEAN DEFAULT true,
    force_update BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Super Admin Policy
CREATE POLICY "Super admins full access" ON users FOR ALL
USING (EXISTS (
    SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'super_admin'
));

CREATE POLICY "Super admins org access" ON organizations FOR ALL
USING (EXISTS (
    SELECT 1 FROM users WHERE auth_user_id = auth.uid() AND role = 'super_admin'
));
```

**Click RUN (या Ctrl+Enter)**

### Step 4: Super Admin User Banayein

#### 4a. Auth User Create Karein
1. **Authentication** tab par jaayein (left sidebar)
2. **Users** par click karein
3. **Add User** button click karein
4. Fill karein:
   - **Email:** `admin@qbank.com`
   - **Password:** `Admin@123`
5. **Create User** click karein

#### 4b. Users Table me Add Karein
SQL Editor me phir se jaayein aur ye run karein:

```sql
-- Get the auth user ID
SELECT id, email FROM auth.users WHERE email = 'admin@qbank.com';

-- Copy the ID from above result, then run this:
INSERT INTO public.users (auth_user_id, email, full_name, role, status)
SELECT 
    id,
    'admin@qbank.com',
    'Super Admin',
    'super_admin',
    'active'
FROM auth.users 
WHERE email = 'admin@qbank.com';
```

### Step 5: Verify Setup

SQL Editor me ye query run karein:

```sql
-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check super admin user
SELECT * FROM public.users WHERE role = 'super_admin';
```


### Step 6: Login Karein

```
URL: http://localhost:3000
Email: admin@qbank.com
Password: Admin@123
```

---

## 📝 Quick Checklist

- [ ] Supabase Dashboard open kiya
- [ ] SQL Editor me schema SQL run kiya
- [ ] Auth user create kiya (admin@qbank.com)
- [ ] Users table me super admin add kiya
- [ ] Verification queries run kiye
- [ ] Login test kiya

---

## 🆘 Troubleshooting

**Error: "table already exists"**
- Ignore karein, RLS policies run karwa lein

**Error: "auth user not found"**
- Pehle Auth user create karein (Step 4a)

**Login nahi ho raha**
- Verify karein: `SELECT * FROM users WHERE email = 'admin@qbank.com'`
- Check karein role: `super_admin` hai
====================================================================
ORGANIZATION ADMIN PANEL – EXTENDED ENTERPRISE PRD
(MERGE INTO EXISTING ORG ADMIN PRD – DO NOT CREATE SEPARATE FILE)
====================================================================

IMPORTANT INSTRUCTION
---------------------
Ye document EXISTING "Organization Admin Panel PRD" ka
EXTENDED VERSION hai.

Is document ke saare sections:
- Original Org Admin PRD me ADD kiye jayenge
- Backend PRD me relevant parts merge honge
- Domain Add-on PRD ke rules follow karenge

Isko alag product ya alag PRD file na banaya jaye.

====================================================================

1. OVERALL PURPOSE (EXTENDED)
-----------------------------
Organization Admin Panel ek FULL BUSINESS CONTROL SYSTEM hoga
jahan coaching/institute apna:

- Academic Structure
- Course Management
- Teachers
- Students
- Live Events
- Promotions
- Doubt Management
- OMR Exams
- Quiz Builder
- Banner System
- Blog (if enabled)
- Domain visibility

sab manage karega.

====================================================================

2. DASHBOARD MODULE
-------------------
(Reference: Dashboard screenshot page 1 & 2)

Features:
- Total Students
- Active Courses
- Total Enrollments
- Content Items count
- Registration analytics (daily/weekly/monthly)
- Hourly registration graph
- Monthly performance (revenue + enrollments)
- Popular courses chart
- Recent activity feed
- Key insights panel:
    - Avg daily registrations
    - Peak day
    - Growth rate

Performance Rule:
- Real-time or near real-time data
- Cached analytics allowed

====================================================================

3. CONTENT MANAGEMENT SYSTEM
----------------------------
(Reference: Content screen)

Submodules:
- Course Content
- Ebooks
- Videos
- PDFs
- Online Tests
- Import content
- Folder structure
- Drag & drop support

Rules:
- File upload limits enforced
- Content tied to specific course
- Content access controlled via enrollments

====================================================================

4. COURSE MANAGEMENT SYSTEM
----------------------------
(Reference: Course Management screen)

4.1 Course Types:
- Regular Course
- Ebook Course
- Free Video Course
- Free Notes Course
- Free Test Course

4.2 Basic Course Info:
- Stream selection
- Course name
- Strikeout price
- Selling price
- Product ID
- WhatsApp group link
- Description (rich text)
- Intro video ID
- Feature toggles:
    - Live
    - Video
    - Notes
    - Panel PDF
    - Topper
    - Test

4.3 Media Upload:
- Course thumbnail
- Time table image
- Batch info PDF

4.4 Packages:
- Student packages
- Upgrade packages
- Multiple pricing tiers

Rule:
- Package-based access control
- License limit enforced

====================================================================

5. SUPER STREAM & STREAM MANAGEMENT
------------------------------------
(Reference: Super Stream & Stream screens)

Structure:
Super Stream → Stream → Course

Features:
- Create Super Stream
- Create Stream under Super Stream
- Stream image upload
- Stream description
- Course association count

Purpose:
- Academic categorization
- SEO alignment
- App navigation clarity

====================================================================

6. BANNER MANAGEMENT SYSTEM
----------------------------
(Reference: Banner screen page 1)

Features:
- Add Banner
- Banner type
- Linked course
- Redirect link
- Publish / Draft
- Status filter
- Search
- Pagination

Rules:
- Max banner limit per org
- Scheduled banner support (future)

====================================================================

7. LIVE EVENT SYSTEM
--------------------
(Reference: Add Live Event)

Features:
- Free / Paid event
- Video source selection
- Publish / Draft
- Select courses
- Event name
- Description
- Stream link
- Banner upload
- Viewer count tracking

Rules:
- YouTube/Vimeo support
- Event tied to course access
- Expiry control

====================================================================

8. PROMOTION MANAGEMENT
-----------------------
(Reference: Promotion screen)

Features:
- Promo code
- Linked course
- Promo value
- Discount type (flat / %)
- Valid from / to
- Quantity
- Usage count
- Status

Rules:
- Auto-expire
- Usage limit
- Conflict validation

====================================================================

9. TEACHER MANAGEMENT
---------------------
(Reference: Teacher screen)

Features:
- Add teacher
- Assign courses
- Revenue share %
- Account ID
- Activate / deactivate

Advanced:
- Teacher earnings report (future)

====================================================================

10. TOP STUDENT / TOP TEACHER MODULE
-------------------------------------
(Reference: Add Top Student / Add Top Teacher)

Features:
- Name
- Profile image
- Description / About
- Stream association
- Video link (optional)

Purpose:
- Website showcase
- Marketing

====================================================================

11. OMR SHEET BUILDER
---------------------
(Reference: OMR screen)

Features:
- Exam key
- Exam title
- Description
- Number of questions
- Question type
- Answer options
- Timer
- Marks for correct
- Negative marking
- Duration
- Buffer time
- Start date/time
- Publish / Unpublish
- Generate OMR sheet + Answer key

Rules:
- Auto PDF generation
- Exam scheduling

====================================================================

12. QUIZ BUILDER
----------------
(Reference: Quiz screen)

Features:
- Quiz category
- Quiz name
- Duration
- Category distribution
- Advanced mode toggle
- Negative marking toggle
- Instant solution toggle
- Multiple question categories

====================================================================

13. COURSE DOUBT MANAGEMENT
----------------------------
(Reference: Course Doubt screen)

Features:
- Total doubts count
- Unique doubts
- Resolving count
- Closed count
- Course-wise doubt display
- Ticket management

Future:
- Chat-style thread
- File attachments

====================================================================

14. BLOG MANAGEMENT (IF ENABLED BY SUPER ADMIN)
------------------------------------------------
(Reference: Blog screen)

Features:
- Single blog page per org (optional)
- Edit content
- Preview
- Permanent link
- Rich text support

Rule:
- Can be disabled by Super Admin
- Domain-based rendering

====================================================================

15. DOMAIN VISIBILITY (MERGED FROM DOMAIN ADD-ON PRD)
-----------------------------------------------------
Org Admin:
- View connected domains
- View status
- Cannot edit domains

Super Admin:
- Full control

====================================================================

16. SETTINGS MODULE
-------------------
Features:
- App branding
- Logo upload
- Theme color
- Contact info
- WhatsApp support
- Social links
- Terms & privacy (org-level optional)

====================================================================

17. SECURITY & ACCESS CONTROL
-----------------------------
- Role-based permissions
- Teacher restricted access
- Org-bound RLS
- Activity logs (future)
- Data isolation mandatory

====================================================================

18. PERFORMANCE REQUIREMENTS
----------------------------
- Page load < 2 seconds
- File upload progress tracking
- Large content pagination
- Server-side filtering

====================================================================

19. OUT OF SCOPE
----------------
- Platform-level configuration
- Domain mapping edit
- Backend direct access
- Global feature flags

====================================================================

20. SUCCESS CRITERIA
-------------------
- Org Admin fully independent
- No Super Admin daily dependency
- App + Website auto reflect updates
- No cross-org data leak
- Scalable to 1000+ orgs

====================================================================
END OF EXTENDED ORGANIZATION ADMIN PRD
(MERGE INTO ORIGINAL PRD – DO NOT DUPLICATE FILE)
====================================================================

---

**Ab Supabase Dashboard me jaayein aur ye steps follow karein! 🚀**
