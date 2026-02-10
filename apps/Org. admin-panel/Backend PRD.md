Super Admin Panel - Sab kuch control yahan se (Main control center)
Organization Admin - Org level management yahi se teacher class and test apne teaching app par upload and create kar sakta hai matlb koi bhi org. ke liye yahi super admin pannel rahgea jisme apni app ka conten control kar sake
Teaching + Mock Test App - Combined mobile app (Students / users ke liye jaha se students courses purchaheg/free me use kar sakte hai )
Whiteboard - Desktop/Mobile for teaching
Public Website - Marketing, blogs, SEO, tools (Blog write access Super Admin se, whiteboard app ka download link yahi par hoga and or educational tools yahi par rahega free and paid tools)



# Product Requirements Document (PRD)
## Multi-Module EdTech Platform Backend

**Document Version:** 1.0  
**Date:** 2026-02-08  
**Status:** Draft  
**Technology Stack:** Supabase (PostgreSQL + Auth + RLS + Storage + Edge Functions)

---

## 1. Executive Summary

### 1.1 Purpose
Ek centralized, secure aur scalable backend system banana hai jo poore EdTech platform ke sabhi modules ko control aur connect karega. Ye system multi-tenant architecture support karega jisme multiple organizations independently operate kar sakti hain bina ek dusre ke data ko access kiye.

### 1.2 Scope
- **Super Admin Panel:** Global platform control
- **Organization Admin:** Org-level management
- **Teaching + Mock Test App:** Student mobile application
- **Whiteboard App:** Desktop/Mobile teaching tool
- **Public Website:** Marketing, blogs, aur free tools

### 1.3 Success Criteria
Ek backend successfully power karega:
- ✅ Super Admin Panel
- ✅ Org Admin Panel  
- ✅ Student App (Mobile)
- ✅ Web Whiteboard
- ✅ Flutter/Desktop Whiteboard
- ✅ Public Website

---

## 2. System Architecture

### 2.1 High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT APPLICATIONS                      │
├─────────────┬─────────────┬─────────────┬───────────────────┤
│ Super Admin │  Org Admin  │   Student   │   Whiteboard      │
│   Panel     │   Panel     │     App     │   (Web/Mobile)    │
└──────┬──────┴──────┬──────┴──────┬──────┴─────────┬─────────┘
       │             │             │                │
       └─────────────┴─────────────┴────────────────┘
                         │
                    ┌────┴────┐
                    │  SUPABASE │
                    │  BACKEND  │
                    ├───────────┤
                    │ • Auth    │
                    │ • Database│
                    │ • Storage │
                    │ • Edge    │
                    │   Functions
                    └───────────┘
```

### 2.2 Technology Stack
| Component | Technology | Purpose |
|-----------|------------|---------|
| **Database** | PostgreSQL (Supabase) | Primary data store |
| **Authentication** | Supabase Auth | JWT-based auth |
| **Authorization** | Row Level Security (RLS) | Data isolation |
| **File Storage** | Supabase Storage | Media/PDFs |
| **Serverless Functions** | Edge Functions | Business logic |
| **Real-time** | Supabase Realtime | Future: Live features |

---

## 3. User Roles & Permissions

### 3.1 Role Hierarchy
| Role | Level | Scope | Key Capabilities |
|------|-------|-------|------------------|
| **super_admin** | System | Global | Full platform control, all orgs access |
| **org_admin** | Organization | Single Org | Teacher management, content creation |
| **teacher** | Organization | Single Org | Whiteboard access, teaching sets |
| **student** | Organization | Single Org | Courses, tests, mock exams |
| **guest** | Public | Limited | Read-only website content |

### 3.2 Permission Matrix

| Feature | Super Admin | Org Admin | Teacher | Student | Guest |
|---------|-------------|-----------|---------|---------|-------|
| Create/Manage Orgs | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Teachers | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create Courses | ✅ | ✅ | ❌ | ❌ | ❌ |
| Upload Content | ✅ | ✅ | ✅ | ❌ | ❌ |
| Whiteboard Access | ✅ | ✅ | ✅ | ❌ | ❌ |
| Take Tests | ✅ | ✅ | ✅ | ✅ | ❌ |
| View Blogs | ✅ | ✅ | ✅ | ✅ | ✅ |
| Use Free Tools | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 4. Database Schema

### 4.1 Core Tables

#### 4.1.1 organizations
```sql
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
    plan_type VARCHAR(50) DEFAULT 'free',
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

#### 4.1.1.1 organization_domains
```sql
CREATE TABLE organization_domains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    domain_name VARCHAR(255) UNIQUE NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
```

#### 4.1.2 users (Teachers & Admins)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL CHECK (role IN ('super_admin', 'org_admin', 'teacher')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    permissions JSONB DEFAULT '{}',
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(auth_user_id),
    UNIQUE(org_id, email)
);
```

#### 4.1.3 students
```sql
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active',
    profile_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(auth_user_id),
    UNIQUE(org_id, email)
);
```

#### 4.1.4 courses
```sql
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    type VARCHAR(20) CHECK (type IN ('free', 'paid', 'subscription')),
    price DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    thumbnail_url TEXT,
    metadata JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4.1.5 tests
```sql
CREATE TABLE tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    type VARCHAR(20) CHECK (type IN ('mock', 'practice', 'quiz')),
    duration_minutes INTEGER,
    total_marks INTEGER,
    passing_marks INTEGER,
    shuffle_questions BOOLEAN DEFAULT true,
    show_result_immediately BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'draft',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4.1.6 questions
```sql
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) CHECK (question_type IN ('mcq_single', 'mcq_multiple', 'true_false', 'fill_blank', 'subjective')),
    options JSONB, -- For MCQ: [{id: 1, text: "Option A"}, ...]
    correct_answer JSONB, -- Depends on type
    explanation TEXT,
    marks INTEGER DEFAULT 1,
    difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
    order_index INTEGER,
    media_urls TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4.1.7 sets (Whiteboard Teaching Sets)
```sql
CREATE TABLE sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    password_hash VARCHAR(255), -- For whiteboard access
    expires_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
    settings JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4.1.8 set_items
```sql
CREATE TABLE set_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    set_id UUID REFERENCES sets(id) ON DELETE CASCADE,
    type VARCHAR(50) CHECK (type IN ('ppt_slide', 'question', 'pdf_page', 'video', 'interactive')),
    title VARCHAR(500),
    content_json JSONB NOT NULL, -- Flexible content storage
    media_url TEXT,
    order_index INTEGER NOT NULL,
    duration_seconds INTEGER, -- For auto-advance
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4.1.9 test_attempts
```sql
CREATE TABLE test_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id UUID REFERENCES tests(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned', 'timed_out')),
    answers JSONB DEFAULT '{}', -- {question_id: selected_option}
    score INTEGER,
    total_marks INTEGER,
    percentage DECIMAL(5,2),
    result_status VARCHAR(20), -- pass/fail
    time_taken_seconds INTEGER,
    ip_address INET,
    device_info JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4.1.10 blogs
```sql
CREATE TABLE blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image_url TEXT,
    author_id UUID REFERENCES users(id),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    category VARCHAR(100),
    tags TEXT[],
    seo_meta JSONB DEFAULT '{}',
    view_count INTEGER DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4.1.11 tools
```sql
CREATE TABLE tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    type VARCHAR(50) CHECK (type IN ('free', 'premium', 'org_only')),
    config JSONB DEFAULT '{}', -- Tool-specific configuration
    status VARCHAR(20) DEFAULT 'active',
    usage_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 4.1.12 enrollments
```sql
CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'dropped', 'expired')),
    progress_percentage INTEGER DEFAULT 0,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(student_id, course_id)
);
```

---

## 5. Row Level Security (RLS) Policies

### 5.1 Organizations Table
```sql
-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Super Admin: Full access
CREATE POLICY "Super admin full access" ON organizations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND role = 'super_admin'
        )
    );

-- Org Admin/Teacher: Read own org only
CREATE POLICY "Org users read own org" ON organizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND org_id = organizations.id
        )
    );
```

### 5.2 Users Table
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read own profile
CREATE POLICY "Users read own profile" ON users
    FOR SELECT USING (auth_user_id = auth.uid());

-- Super Admin: Full access
CREATE POLICY "Super admin manage users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.role = 'super_admin'
        )
    );

-- Org Admin: Manage own org users
CREATE POLICY "Org admin manage org users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.auth_user_id = auth.uid() 
            AND u.role = 'org_admin' 
            AND u.org_id = users.org_id
        )
    );
```

### 5.3 Students Table
```sql
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Students read own profile
CREATE POLICY "Students read own profile" ON students
    FOR SELECT USING (auth_user_id = auth.uid());

-- Org Admin/Teacher: Read own org students
CREATE POLICY "Org staff read students" ON students
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND org_id = students.org_id
        )
    );
```

### 5.4 Courses Table
```sql
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Public can view published courses
CREATE POLICY "Public view published courses" ON courses
    FOR SELECT USING (status = 'published');

-- Org staff: Full access to own org
CREATE POLICY "Org staff manage courses" ON courses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND org_id = courses.org_id
        )
    );
```

### 5.5 Sets Table (Whiteboard)
```sql
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;

-- Org staff: Full access
CREATE POLICY "Org staff manage sets" ON sets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE auth_user_id = auth.uid() 
            AND org_id = sets.org_id
        )
    );
```

---

## 6. Edge Functions

### 6.1 verify-set (Whiteboard Access)
**Purpose:** Secure whiteboard content access with password verification

**Endpoint:** `POST /functions/v1/verify-set`

**Request:**
```json
{
  "set_id": "uuid",
  "password": "string"
}
```

**Logic:**
1. Validate JWT token (teacher login required)
2. Verify set exists and belongs to teacher's org
3. Hash password and compare with set.password_hash
4. Check if set is expired
5. Return set metadata + ordered set_items

**Response:**
```json
{
  "success": true,
  "set": {
    "id": "uuid",
    "title": "string",
    "status": "active",
    "items": [
      {
        "id": "uuid",
        "type": "ppt_slide",
        "order_index": 1,
        "content_json": {},
        "media_url": "url"
      }
    ]
  }
}
```

### 6.2 start-test (Student App)
**Purpose:** Initialize test attempt with validation

**Endpoint:** `POST /functions/v1/start-test`

**Request:**
```json
{
  "test_id": "uuid"
}
```

**Validation:**
- Check student enrollment
- Verify test is published
- Check no active attempt exists
- Create test_attempt record
- Return test questions (shuffled if enabled)

### 6.3 submit-test
**Purpose:** Submit test answers and calculate results

**Endpoint:** `POST /functions/v1/submit-test`

**Request:**
```json
{
  "attempt_id": "uuid",
  "answers": {
    "question_id_1": "option_a",
    "question_id_2": ["option_a", "option_b"]
  }
}
```

**Logic:**
- Validate attempt belongs to student
- Check time limit not exceeded
- Calculate score
- Update attempt record
- Return result immediately or queue for review

### 6.4 super-admin-stats
**Purpose:** Global platform statistics

**Endpoint:** `GET /functions/v1/super-admin-stats`

**Auth:** Super Admin only

**Response:**
```json
{
  "total_organizations": 100,
  "active_teachers": 500,
  "total_students": 10000,
  "tests_conducted_today": 150,
  "revenue_this_month": 50000
}
```

---

## 7. Storage Structure

### 7.1 Bucket Structure
```
orgs/
  ├── {org_id}/
  │   ├── courses/
  │   │   ├── {course_id}/
  │   │   │   ├── thumbnail.jpg
  │   │   │   └── materials/
  │   ├── sets/
  │   │   ├── {set_id}/
  │   │   │   ├── slides/
  │   │   │   └── media/
  │   └── exports/
  │
public/
  ├── tools/
  │   └── {tool_files}
  ├── website/
  │   ├── images/
  │   └── assets/
  └── whiteboard/
      └── download-metadata.json
```

### 7.2 Storage Policies
- **Org-scoped:** Teachers can only access their org's bucket
- **Public-read:** Website assets publicly accessible
- **Whiteboard:** Read-only access for teaching content

---

## 8. API Endpoints Summary

### 8.1 Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/v1/signup` | User registration |
| POST | `/auth/v1/token?grant_type=password` | Login |
| POST | `/auth/v1/logout` | Logout |
| POST | `/auth/v1/recover` | Password reset |

### 8.2 Super Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rest/v1/organizations` | List all orgs |
| POST | `/rest/v1/organizations` | Create org |
| PATCH | `/rest/v1/organizations?id=eq.{id}` | Update org |
| GET | `/functions/v1/super-admin-stats` | Platform stats |

### 8.3 Org Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rest/v1/users?org_id=eq.{id}` | List teachers |
| POST | `/rest/v1/users` | Create teacher |
| GET | `/rest/v1/courses?org_id=eq.{id}` | List courses |
| POST | `/rest/v1/courses` | Create course |
| POST | `/rest/v1/sets` | Create teaching set |

### 8.4 Whiteboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/functions/v1/verify-set` | Access set with password |
| GET | `/rest/v1/set_items?set_id=eq.{id}` | Get set content |

### 8.5 Student App
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rest/v1/enrollments?student_id=eq.{id}` | My courses |
| POST | `/functions/v1/start-test` | Start test |
| POST | `/functions/v1/submit-test` | Submit answers |
| GET | `/rest/v1/test_attempts?student_id=eq.{id}` | My results |

### 8.6 Public Website
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/rest/v1/blogs?status=eq.published` | List blogs |
| GET | `/rest/v1/blogs?slug=eq.{slug}` | Single blog |
| GET | `/rest/v1/tools?type=eq.free` | Free tools |

---

## 9. Security Requirements

### 9.1 Authentication
- JWT tokens with 1-hour expiry
- Refresh token rotation
- Secure httpOnly cookies for web
- Biometric/PIN for mobile apps

### 9.2 Authorization
- **RLS Mandatory:** All tables must have RLS enabled
- **Role Verification:** Never trust client-provided roles
- **Org Isolation:** Cross-org data access strictly prohibited

### 9.3 Data Protection
- Password hashing: bcrypt (handled by Supabase Auth)
- Sensitive data encryption at rest
- HTTPS only (TLS 1.3)
- API rate limiting: 100 req/min per IP

### 9.4 Organization Identification Logic
- **Mobile Apps (Student/Whiteboard)**: 
  - `org_id` → Resolves via Supabase Auth (JWT custom claims / user_metadata).
- **Public Website / Landing Pages**: 
  - `org_id` → Resolves via `organization_domains` lookup using requested `HOST/DOMAIN`.
  - **Rule**: Frontend kabhi bhi `org_id` parameter pass nahi karega.
- Set access requires both: Valid JWT + Correct Password
- No direct database queries from whiteboard
- All sensitive logic via Edge Functions
- Content URLs time-limited (signed URLs)

---

## 10. Performance Requirements

| Metric | Target | Measurement |
|--------|--------|-------------|
| Whiteboard content load | < 2 seconds | Time to first slide |
| Student test API response | < 1 second | API latency |
| Login/Auth | < 500ms | Authentication time |
| File upload | < 5 seconds | Up to 10MB |
| Concurrent users | 10,000+ | Load testing |

---

## 11. Scalability Considerations

- **Serverless:** Edge Functions auto-scale
- **Database:** Connection pooling via Supabase
- **CDN:** Storage assets served via global CDN
- **Caching:** Redis for session data (future)
- **Read Replicas:** For high-traffic orgs (future)

---

## 12. Development Phases

### Phase 1: MVP (Weeks 1-4)
- [ ] Supabase project setup
- [ ] Core database schema
- [ ] Auth + RLS policies
- [ ] verify-set Edge Function
- [ ] Basic CRUD APIs

### Phase 2: Core Features (Weeks 5-8)
- [ ] Whiteboard integration
- [ ] Student test flow
- [ ] Org admin panel APIs
- [ ] File storage setup
- [ ] Public website APIs

### Phase 3: Advanced (Weeks 9-12)
- [ ] Payment integration
- [ ] Analytics dashboard
- [ ] Advanced tools
- [ ] API rate limiting
- [ ] Performance optimization

---

## 13. Out of Scope (Current Phase)
- ❌ Whiteboard recording/playback
- ❌ Live video classes (WebRTC)
- ❌ Real-time chat system
- ❌ Advanced analytics/ML
- ❌ Mobile app push notifications
- ❌ Multi-language support

---

## 14. Success Metrics
- ✅ Zero cross-org data leaks (security audit)
- ✅ < 2s whiteboard load time
- ✅ 99.9% API uptime
- ✅ Support for 100+ concurrent organizations
- ✅ 10,000+ concurrent students

---

## 15. Appendix

### 15.1 Environment Variables
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
JWT_SECRET=your-jwt-secret
```

### 15.2 Naming Conventions
- Tables: snake_case, plural
- Columns: snake_case
- Edge Functions: kebab-case
- JWT Claims: camelCase

### 15.3 Error Codes
| Code | Description |
|------|-------------|
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden (RLS violation) |
| 404 | Not Found |
| 409 | Conflict (duplicate data) |
| 422 | Validation Error |
| 500 | Internal Server Error |

---

**Document Owner:** Backend Team  
**Reviewers:** Tech Lead, Security Team  
**Next Review Date:** 2026-03-08

---

*End of Backend PRD*