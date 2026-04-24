====================================================================
MASTER PRD — EDUHUB MULTI-ORG EDTECH PLATFORM
Version 2.0 | March 2026 | CONFIDENTIAL
====================================================================

DOCUMENT CONTROL
─────────────────
Version     : 2.0 (Major Update)
Previous    : 1.0 (Supabase-based, basic features)
Updated By  : Product Team
Date        : March 2026
Status      : Final — Active Development Reference

WHAT'S NEW IN V2.0
──────────────────
✅ Backend migrated: Supabase → Node.js + PostgreSQL + AWS
✅ Frontend: Turborepo Monorepo (3 apps, 5 shared packages)
✅ Q-Bank: Folder system (unlimited nesting), Auto Set Generator
✅ Student Personalization: Auto Set, Study Plan, Practice Suggestions
✅ Admin Controls: Curated suggestions, study plan templates
✅ Student History Tracking: Question-level mastery scoring
✅ Full AWS deployment architecture added
✅ All 4 apps fully specified: Super Admin, Org Admin, Student, MockVeda

LINKED PRDs (Children of this Master)
──────────────────────────────────────
EH-BACKEND-PRD-001       → Complete Backend (Node.js + AWS)
PRD-FRONTEND-ARCH-001    → Frontend Monorepo (Turborepo)
PRD-ORG-01               → Super Admin — Organizations Module
PRD-ORG-02               → Org Admin Panel
PRD-QBANK-01             → Student Question History & Mastery
PRD-QBANK-02             → Auto Set Generator (Admin)
PRD-QBANK-03             → Q-Bank Folder System
PRD-MOCKVEDA-01-A        → MockVeda Student App (Personalization)
PRD-MOCKVEDA-01-B        → Admin Panel — Personalization Controls

====================================================================
SECTION 1: PRODUCT VISION
====================================================================

1.1 What We Are Building
─────────────────────────
EduHub ek centralized, multi-tenant EdTech SaaS platform hai jo
coaching institutes aur educational organizations ke liye build
ho raha hai India mein.

Platform 4 applications ka ecosystem hai:

┌──────────────────────────────────────────────────────────────┐
│  APP 1: SUPER ADMIN PANEL                                   │
│  superadmin.eduhub.in                                       │
│  Platform ka full control center — orgs manage karo,        │
│  billing, AI credits, global Q-Bank, MockVeda content       │
├──────────────────────────────────────────────────────────────┤
│  APP 2: ORG ADMIN PANEL                                     │
│  orgadmin.eduhub.in                                         │
│  Coaching institutes ka management panel — students,        │
│  tests, Q-Bank, fees, attendance, staff, notifications      │
├──────────────────────────────────────────────────────────────┤
│  APP 3: STUDENT PORTAL                                      │
│  [slug].eduhub.in                                           │
│  Student ka access point — tests, results, practice,        │
│  progress tracking, fee payment, notifications              │
├──────────────────────────────────────────────────────────────┤
│  APP 4: MOCKVEDA (Public Mock Test Platform)                │
│  mockveda.in                                                │
│  Public-facing competitive exam platform — SSC, NEET,       │
│  JEE, Banking ke free + paid test series                    │
└──────────────────────────────────────────────────────────────┘

1.2 Platform Focus
───────────────────
- Scalability    → AWS par deploy, auto-scaling
- Security       → JWT + RBAC + Row-level org isolation
- Performance    → Redis caching, BullMQ jobs, CDN assets
- Intelligence   → Student mastery tracking, AI-powered features
- Cost Control   → AI credits system, plan-based limits
- Brand Building → Org-branded subdomains, custom domains

1.3 Target Users
─────────────────
- Coaching institutes (SSC, NEET, JEE, Banking prep)
- Individual teachers running online batches
- Students preparing for competitive exams
- Platform administrators

====================================================================
SECTION 2: PLATFORM ARCHITECTURE — HIGH LEVEL
====================================================================

2.1 System Architecture Overview
──────────────────────────────────

CHANGE FROM V1.0:
Previous: Supabase (all-in-one)
Current:  Custom Node.js backend on AWS (production-grade)

Why Changed:
- More control over business logic
- Better AI integration (OpenAI, custom prompts)
- Background job processing (BullMQ)
- Custom ID generation (GK-ORG-XXXXX format)
- AWS ecosystem (S3, SES, CloudFront, RDS)
- Cost optimization at scale

                    ┌─────────────────────────────┐
                    │         INTERNET             │
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │      AWS CloudFront CDN      │
                    │    (Static assets + cache)   │
                    └──────┬────────────┬──────────┘
                           │            │
           ┌───────────────▼───┐    ┌───▼────────────────┐
           │  Next.js Apps     │    │  API Gateway /      │
           │  (3 apps on       │    │  Application LB     │
           │   Vercel/EC2)     │    │  (Routes to backend)│
           └───────────────────┘    └────────┬────────────┘
                                             │
                              ┌──────────────▼─────────────┐
                              │  EduHub Backend             │
                              │  Node.js + TypeScript       │
                              │  Express.js                 │
                              │  (EC2 / ECS Fargate)        │
                              └──────┬───────────┬──────────┘
                                     │           │
                        ┌────────────▼──┐  ┌────▼──────────────┐
                        │  PostgreSQL   │  │  Redis 7           │
                        │  (RDS Aurora) │  │  (ElastiCache)     │
                        │  Primary DB   │  │  Cache + Queue     │
                        └───────────────┘  └───────────────────┘
                                     │
                        ┌────────────▼──────────────┐
                        │  AWS S3                    │
                        │  Files, PDFs, Images,      │
                        │  Receipts, Question Images │
                        └───────────────────────────┘

2.2 Multi-Tenant Architecture
──────────────────────────────
- Ek single backend → multiple organizations serve karta hai
- Har organization ka data orgId se isolated hai
- Super Admin ke paas all-org access hai
- Org Admin sirf apne org ka data dekh sakta hai
- Student sirf apne org ka content access karta hai

Key Principle:
- orgId NEVER trusted from frontend
- Backend ALWAYS validates orgId from JWT token
- No cross-org data leakage possible

2.3 ID System (Platform-Wide)
──────────────────────────────
Har entity ka unique, human-readable ID:

  Organizations  : GK-ORG-00234
  Students       : GK-STU-XXXXX
  Teachers       : GK-TCH-XXXXX
  Staff          : GK-STF-XXXXX
  Questions      : GK-Q-XXXXXXX (7 digits)
  Question Sets  : 6-digit numeric (482931)
  PINs           : 6-digit numeric (different from Set ID)
  Receipts       : 2026-00458 (year-sequential per org)

All generated via PostgreSQL sequences (atomic, no duplicates)

====================================================================
SECTION 3: PLATFORM MODULES
====================================================================

3.1 Module 1 — Super Admin Panel
──────────────────────────────────
URL: superadmin.eduhub.in
Auth: Email + Password (Super Admin JWT — separate secret)
Users: Super Admin only

Responsibilities:
A. Organization Management
   - Create, update, suspend, delete organizations
   - Org ID generation (GK-ORG-XXXXX)
   - Plan management (SMALL / MEDIUM / LARGE / ENTERPRISE)
   - Billing cycle (MONTHLY / YEARLY)
   - Trial period management
   - Password reset for Org Admin

B. Feature Control
   - Per-org feature flags (toggle ON/OFF):
     ai_question_generation, pdf_extraction, video_recordings,
     advanced_analytics, custom_domain, whatsapp_bot,
     parent_portal, certificate_generation, razorpay_integration
   - AI Credits management (topup, limit, monthly reset)

C. Org Admin Control (View-as-Org)
   - Super Admin can view any org's admin panel
   - Context switch — generate org-view token
   - Orange banner shows when in org context
   - Extra controls visible: billing, credits, feature flags, audit

D. Global Q-Bank Management
   - Create/manage global folder structure
     (SSC → CGL → 2024 → Tier-1 → Subject)
   - Global questions (available to all orgs)
   - Approve questions for global bank

E. MockVeda Management
   - Publish/manage public test series
   - Leaderboard management
   - MockVeda analytics

F. Platform Analytics
   - Total orgs, MRR, growth
   - AI usage across platform
   - Students across all orgs
   - Revenue trends

G. Alerts & Monitoring
   - Trial expiring (3 days warning)
   - Payment overdue
   - Orgs approaching plan limits
   - Suspended orgs

──────────────────────────────────────────────────────────────────

3.2 Module 2 — Org Admin Panel
────────────────────────────────
URL: orgadmin.eduhub.in
Auth: Org ID + Password
Users: Org Admin + Staff (6 roles)

Staff Roles & Permissions:
  ORG_ADMIN        → Full access (all permissions)
  TEACHER          → Tests, Q-Bank, Attendance, Notifications
  CONTENT_MANAGER  → Q-Bank full access, Tests view-only
  FEE_MANAGER      → Fees full access
  RECEPTIONIST     → Fees collect/receipt, Attendance mark, Notifications
  ANALYTICS_VIEWER → Results, Attendance report, Fee report

A. Dashboard
   - Today's schedule, upcoming tests
   - Fee collection summary
   - Recent activity feed
   - Quick action buttons

B. Student Management
   - Student CRUD (GK-STU-XXXXX ID generation)
   - Bulk import via CSV
   - Plan limit enforcement (200/1000/5000 per plan)
   - Student profile, documents, photo

C. Batch Management
   - Create batches, assign students + staff
   - Batch-level operations (notifications, tests, fees)

D. Q-Bank — Full System
   D.1 Folder System (Unlimited Nesting)
       - Global folders inherited (SSC, NEET, JEE etc.)
       - Org creates own folders + sub-folders
       - Materialized path for fast subtree queries
       - Drag-drop reorder, folder move
       - Question count badges per folder
       - Max 10 levels deep

   D.2 Question Management
       - Bilingual (Hindi + English)
       - Types: MCQ Single, MCQ Multiple, True/False, Fill-in-blank, Descriptive
       - Difficulty: Easy, Medium, Hard
       - Tags: subject, chapter, topic, exam type
       - Folder assignment (one primary folder)
       - Image upload per question/option
       - AI edit (0.10 credits), AI generate (1.5 credits/question)

   D.3 PDF Question Extraction
       - Upload PDF → S3
       - BullMQ queue → OpenAI GPT-4o extracts questions
       - Bilingual extraction (Hindi + English)
       - Image detection + extraction
       - Bulk tagging (manual + AI)
       - Copy to Q-Bank (extracted → official questions)
       - 0.12 credits per question extracted
       - Folder structure for PDFs

   D.4 Question Sets
       - 6-digit Set ID + PIN
       - Add questions manually OR via Auto Set Generator
       - Live sync with linked MockTests

   D.5 Auto Set Generator
       Step 1: Source → Exam/Folder hierarchy select
       Step 2: Difficulty mix (Easy/Medium/Hard % ratio)
       Step 3: Time config (difficulty-based / exam-standard / manual)
       Step 4: Smart filter (student history, batch-based)
       Step 5: Preview + swap/remove → Save

       Difficulty Presets:
         SSC Standard: 30% Easy, 50% Medium, 20% Hard
         JEE Hard: 10% Easy, 40% Medium, 50% Hard
         NEET Standard: 20% Easy, 50% Medium, 30% Hard
         Easy Practice: 60% Easy, 35% Medium, 5% Hard

       Selection Modes:
         Pure Random    → Fisher-Yates shuffle
         Weighted Random → Weak topic questions 3x weight
         Smart AI       → GPT-4o selects best questions (2 credits)

       Time Auto-calculation:
         Easy = 45s/Q, Medium = 90s/Q, Hard = 120s/Q
         Rounded up to nearest 5 min

       Saved Configs + Scheduled Generation (weekly cron)

E. Tests & Exams
   - Create MockTest: 6-digit testId + PIN
   - Sections (each section = a Question Set)
   - Config: duration, marks, negative marking,
             shuffle, showResult, max attempts
   - Schedule: start/end datetime
   - Status: DRAFT → SCHEDULED → LIVE → ENDED
   - Assign to batches or make public (MockVeda)
   - Results: student scores, rank, question analysis
   - Export results CSV
   - Release results manually

F. Attendance
   - Bulk mark for batch
   - 24-hour edit window for staff (unlimited for Org Admin)
   - Auto-alerts:
     3 consecutive absences → WhatsApp to parent
     Monthly < 75% → weekly warning
     7+ days absent → Org Admin notification
   - Monthly grid report
   - Student-wise attendance history

G. Fee Collection
   - Fee structures (per student / per batch / per enrollment)
   - Collect payment: cash, UPI, cheque, bank transfer
   - Receipt generation (PDF, auto-emailed + WhatsApp)
   - Receipt numbering: 2026-00458 (year-sequential per org)
   - Monthly/yearly reports
   - Bulk WhatsApp/SMS reminders for pending fees

H. Staff Management
   - Staff CRUD (GK-TCH-XXXXX / GK-STF-XXXXX)
   - Role assignment
   - Custom permissions (override role defaults)
   - Activate/deactivate

I. Notifications
   - Channels: App Push, WhatsApp, SMS, Email
   - Target: All students / Batch / Individual student/staff / Parent
   - Scheduling support
   - Templates (global + org-specific)
   - Delivery tracking (delivered/failed count)

J. Analytics
   - Test performance (question-level analysis)
   - Batch weak areas (aggregated mastery)
   - Fee collection trends
   - Attendance patterns
   - Student Practice Analytics (NEW — see Section 5)

K. Personalization Controls (NEW)
   - Unlock threshold configure (default 50 tests, range 10-200)
   - Feature ON/OFF toggle
   - Curated Practice Suggestions Manager
   - Study Plan Templates builder
   - Student unlock management (manual override)
   - Student progress reports

L. Org Settings
   - Profile (name, category, contact)
   - Branding (logo, primary color, subdomain)
   - Custom domain setup
   - Subjects / Chapters / Topics hierarchy
   - WhatsApp Business API connect
   - Security (2FA, session settings)
   - Personalization tab

──────────────────────────────────────────────────────────────────

3.3 Module 3 — Student Portal
───────────────────────────────
URL: [org-slug].eduhub.in
Auth: Student ID + Password (GK-STU-XXXXX)
Users: Students of a specific org

A. Dashboard
   - Today's tests, upcoming schedule
   - Recent results
   - Fee pending alerts
   - Personalized Practice widget (after unlock)
   - Streak tracker (if plan active)

B. Mock Tests
   - Available tests list (batch-assigned + public)
   - Full-screen exam interface
   - Timer, navigation panel, flag questions
   - Section-wise navigation
   - Auto-submit on timeout
   - Resume support (Redis state)
   - Results with detailed analysis

C. My Results
   - All past attempts
   - Score, rank, percentile
   - Question-wise review
   - Correct answer comparison

D. My Progress (NEW — Personalization)
   - Overall mastery: 0-100% score
   - Mastery breakdown: Mastered / Proficient / Developing / Weak
   - Subject-wise mastery bars
   - Topic-wise table with trend arrows
   - Accuracy trend chart (last 30 days)
   - Weak areas quick-action buttons

E. My Practice (NEW — Unlocks at 50 tests)
   E.1 Auto Set Generator (Student-Side)
       4-step wizard:
         Step 1: Time range (7/15/30/60/all days)
         Step 2: Mode (Weak Only / Mixed 70-30)
         Step 3: Size (25/50/100) + Level (Auto/Easy/Med/Hard)
         Step 4: Preview with "Why These Questions" explanation

       Auto Level Detection:
         < 40% accuracy  → Easy
         40-70% accuracy → Easy + Medium
         > 70% accuracy  → Medium + Hard

   E.2 Study Plan
       Setup: daily minutes + plan duration + exam date
       Features:
         - Subject priority based on mastery weakness
         - Daily question targets
         - Focus topic per day
         - Progress tracking (% complete)
         - Streak tracking (🔥 N days)
         - Exam urgency mode (< 7 days → targets 2x)
         - Admin template apply option

   E.3 Practice Set Suggestions
       3 Sources:
         Source 1: Admin Curated (institute recommends)
         Source 2: AI Matched (weak topic → folder match)
         Source 3: Similar Students (collaborative filtering)

   E.4 My Practice Sets
       - Saved generated sets
       - Status: Pending / In Progress / Completed / Expired
       - 7-day expiry for unstarted sets
       - Max 10 active sets

F. Fee Center
   - Pending fees + due dates
   - Payment history
   - Receipt download

G. Attendance
   - Own attendance record
   - Monthly percentage
   - Batch-wise history

H. Notifications
   - Inbox for all channels
   - Mark as read

──────────────────────────────────────────────────────────────────

3.4 Module 4 — MockVeda (Public Platform)
──────────────────────────────────────────
URL: mockveda.in
Auth: Open registration (email/mobile)
Users: Any student preparing for competitive exams

A. Public Features (No Login)
   - Browse test series by exam
   - View test details, syllabus
   - Leaderboard (top 100)

B. Student Features (After Login)
   - Register for test series
   - Attempt tests (full-screen interface, same as Student Portal)
   - Results with rank + percentile
   - Question review

C. Personalized Practice (After 50+ tests — NEW)
   - Same features as Student Portal personalization
   - Auto Set Generator
   - Study Plan
   - Practice Suggestions
   - My Progress

D. Super Admin Controls
   - Publish/unpublish test series
   - Set public test visibility
   - MockVeda analytics dashboard
   - Featured tests management

====================================================================
SECTION 4: STUDENT QUESTION HISTORY & MASTERY TRACKING
====================================================================

4.1 Purpose
────────────
Every question a student attempts — across ALL tests — is tracked
at individual level. This powers:
- Student's "My Progress" page
- Auto Set Generator (weak area targeting)
- Admin batch analytics (weak topic identification)
- Study plan subject prioritization

4.2 What Is Tracked Per Question
──────────────────────────────────
  student_question_history table:
    attempt_count       → kitni baar attempt kiya
    correct_count       → kitni baar sahi
    wrong_count         → kitni baar galat
    skip_count          → kitni baar skip kiya
    avg_time_secs       → average time per attempt
    last_result         → correct / wrong / skipped
    mastery_score       → 0-100 calculated score
    mastery_level       → unattempted/weak/developing/proficient/mastered

4.3 Mastery Score Formula
──────────────────────────
  mastery_score = (
    (correct_count / attempt_count) × 70   ← accuracy weight
    + min(attempt_count / 5, 1) × 20       ← exposure (5+ attempts = full)
    - speed_penalty × 10                   ← slow = small penalty
  )
  Clamped to [0, 100]

  Mastery Levels:
    0          → Unattempted
    1-30       → Weak (❌)
    31-60      → Developing (⚠️)
    61-85      → Proficient (✅)
    86-100     → Mastered (⭐)

4.4 Topic-Level Aggregation
────────────────────────────
  student_topic_mastery table (pre-aggregated):
    avg mastery across all questions in topic
    isWeak flag (avgMastery < 40)
    Used by: Auto Set Generator, Study Plan engine

4.5 When Updated
─────────────────
  Trigger: Every test attempt SUBMIT
  Process: Async via BullMQ (masteryUpdateQueue)
  Time: Within 30 seconds of submission

====================================================================
SECTION 5: Q-BANK FOLDER SYSTEM
====================================================================

5.1 Architecture
─────────────────
  Unlimited nesting, materialized path pattern

  Pattern: /parent_id/child_id/grandchild_id
  Enables: Fast subtree queries (path LIKE '/root%')

  Example Tree:
  📁 SSC
     📁 CGL
        📁 2024
           📁 Tier-1
              📁 Quantitative Aptitude (58 Qs)
              📁 Reasoning (80 Qs)
              📁 English (45 Qs)
              📁 General Awareness (52 Qs)
           📁 Tier-2
        📁 CHSL
  📁 NEET
     📁 Biology / Chemistry / Physics
  📁 JEE Mains / JEE Advanced
  📁 Banking (IBPS PO / SBI / RBI)
  📁 UPSC / Railways / State PSC

5.2 Dual Scope
───────────────
  Global Folders (Super Admin manages):
    - SSC, NEET, JEE, Banking etc.
    - Visible to ALL orgs (read-only for org admin)
    - Contains global questions (isGlobal = true)

  Org Folders (Org Admin manages):
    - Custom folders for their content
    - Can create sub-folders under global folders
    - Not visible to other orgs

5.3 Question Count Cache
─────────────────────────
  questionCount      = questions directly in folder
  totalQuestionCount = questions in folder + all sub-folders
  Updated async via BullMQ (folderCountQueue)

5.4 Seeded Global Structure
────────────────────────────
  7 root exam categories pre-seeded:
  SSC, Banking, NEET, JEE, UPSC, Railways, State PSC
  Each with standard sub-folder hierarchy

====================================================================
SECTION 6: AUTO SET GENERATOR (ADMIN)
====================================================================

6.1 5-Step Wizard
──────────────────
  Step 1: Source — Exam/Folder hierarchy + Subject filter
  Step 2: Difficulty mix (Easy/Medium/Hard % — must sum 100)
  Step 3: Time config (difficulty-based / exam-standard / manual)
  Step 4: Smart filter (student history, batch targeting)
  Step 5: Preview → swap/remove individual questions → Save

6.2 Selection Modes
────────────────────
  Pure Random    → Fisher-Yates shuffle
  Weighted       → Weak topic questions 3× weight
  Smart AI       → GPT-4o best question selection (2 credits)

6.3 Time Calculation Modes
───────────────────────────
  difficulty_based  → Easy=45s, Medium=90s, Hard=120s
  fixed_per_q       → 1 min/Q
  exam_standard     → SSC=36s, JEE=120s, NEET=60s, Banking=48s
  manual            → Admin sets directly

6.4 Insufficient Pool Handling
────────────────────────────────
  If pool < required → error + suggestions:
    "Auto-adjust ratio", "Remove subject filter", "Reduce total"

6.5 Saved Configs + Scheduling
────────────────────────────────
  Admin saves config → reuse anytime
  Schedule: cron pattern (e.g. every Monday 9AM)
  Auto-publish option (needs tests.publish permission)
  Max 5 active schedules per org

====================================================================
SECTION 7: STUDENT PERSONALIZATION SYSTEM
====================================================================

7.1 Feature Unlock
───────────────────
  Unlock after: 50 completed tests (default)
  Admin configurable: 10-200 per org
  Once unlocked: never re-locks

  Pre-unlock: Progress bar (38/50 tests ████░░)
  On unlock: Celebration modal + notification

7.2 Student Auto Set
─────────────────────
  4-step wizard (simplified vs admin wizard):
    Step 1: Time range (7/15/30/60/all days)
    Step 2: Mode (Weak Only / Mixed 70%+30%)
    Step 3: Size + Level (auto-detected)
    Step 4: Preview with explanation

  "Why These Questions" breakdown:
    ❌ Percentage Problems  18 Qs (28% accuracy)
    ❌ Error Spotting       12 Qs (35% accuracy)
    ⚠️ Profit & Loss        10 Qs (52% accuracy)

  Business Rules:
    - Max 10 active sets per student
    - Sets expire after 7 days if not started
    - Visible to admin in analytics
    - Created as internal MockTest for attempt tracking

7.3 Study Plan
───────────────
  Setup: daily minutes + duration + exam date (optional)

  Engine Output:
    - Subject priority based on mastery weakness
    - Days allocated per subject (weakest = more days)
    - Daily focus topics (2 weak topics per day)
    - Target questions/day = floor(daily_mins / 1.5)
    - Urgent mode: exam < 7 days → targets 2×

  Progress Tracking:
    - Daily completion %
    - Streak (consecutive days ≥ 80% target = counted)
    - Plan adherence %
    - Streak resets on missed days

7.4 Practice Suggestions
─────────────────────────
  Source 1: Admin Curated
    → Institute recommends sets for specific weak topics
    → Priority ordered, impression/attempt tracked

  Source 2: AI Matched
    → Weak topic → Q-Bank folder/set topic match
    → Score: topic_match(60%) + priority(bonus) + improvement(bonus)

  Source 3: Collaborative Filtering (optional, org OFF by default)
    → Students with similar accuracy profile (±10%)
    → Sets they attempted → improved score

7.5 Admin Controls for Personalization
────────────────────────────────────────
  Settings Tab:
    - Unlock threshold (10-200)
    - Feature toggle (ON/OFF)
    - Suggestion sources toggle
    - Study plan defaults

  Curated Suggestions:
    - Link any Set/Folder to weak topic keywords
    - Priority, expected improvement %
    - Impression/attempt stats

  Study Plan Templates:
    - Admin builds template (e.g. "SSC CGL 30-Day Crash")
    - Students can apply template or build custom
    - Template usage stats, avg adherence

  Analytics:
    - Platform-wide weak areas (which topics most students fail)
    - Student practice sets visible
    - Study plan completion rates
    - Streak leaderboard

  Manual Unlock:
    - Admin can unlock any student manually
    - Bulk unlock near-threshold students

====================================================================
SECTION 8: BACKEND ARCHITECTURE
====================================================================

8.1 Technology Stack
─────────────────────
  Runtime      : Node.js 20 LTS
  Language     : TypeScript 5.x (strict mode)
  Framework    : Express.js 4.x
  ORM          : Prisma 5.x
  Database     : PostgreSQL 16 (AWS RDS Aurora)
  Cache        : Redis 7 (AWS ElastiCache)
  Queue        : BullMQ (Redis-backed)
  Validation   : Zod 3.x
  Auth         : jsonwebtoken + bcryptjs
  Storage      : AWS S3 (+ CloudFront CDN)
  Email        : AWS SES
  SMS          : Msg91
  AI           : OpenAI SDK (GPT-4o)
  PDF          : PDFKit + pdfjs-dist
  Image        : Sharp.js

  CHANGE FROM V1.0: Supabase replaced with above stack

8.2 Project Structure
──────────────────────
  eduhub-backend/
  ├── prisma/              (schema, migrations, seed)
  ├── src/
  │   ├── config/          (env, database, redis, logger)
  │   ├── middleware/       (auth, rbac, orgContext, planLimit,
  │   │                      featureFlag, rateLimiter, errorHandler)
  │   ├── modules/
  │   │   ├── auth/
  │   │   ├── superAdmin/
  │   │   ├── organizations/
  │   │   ├── orgAdmin/
  │   │   ├── staff/
  │   │   ├── students/
  │   │   ├── batches/
  │   │   ├── qbank/         (questions, sets, folders)
  │   │   ├── autoSet/       (NEW — auto set generator)
  │   │   ├── pdfExtract/
  │   │   ├── tests/
  │   │   ├── testAttempts/
  │   │   ├── studentHistory/ (NEW — mastery tracking)
  │   │   ├── personalization/(NEW — study plan, suggestions)
  │   │   ├── attendance/
  │   │   ├── fees/
  │   │   ├── notifications/
  │   │   ├── mockbook/
  │   │   └── upload/
  │   ├── services/
  │   │   ├── ai/            (OpenAI integration)
  │   │   ├── storage/       (S3 service)
  │   │   ├── notifications/ (WhatsApp, SMS, Email, Push)
  │   │   ├── pdf/
  │   │   ├── history/       (mastery calculation)
  │   │   ├── studyPlan/     (plan generation engine)
  │   │   ├── suggestions/   (recommendation engine)
  │   │   └── idGenerator/
  │   ├── jobs/
  │   │   ├── queues.ts
  │   │   ├── processors/
  │   │   │   ├── pdfExtract.processor.ts
  │   │   │   ├── masteryUpdate.processor.ts   (NEW)
  │   │   │   ├── folderCount.processor.ts     (NEW)
  │   │   │   ├── autoSetSchedule.processor.ts (NEW)
  │   │   │   └── notification.processor.ts
  │   │   └── schedulers/    (cron jobs)
  │   └── types/
  └── [configs...]

8.3 Authentication System
──────────────────────────
  4 JWT Types (separate payloads):

  1. SuperAdminJWT: { userId, role='SUPER_ADMIN', type }
  2. OrgStaffJWT:   { userId, staffId, orgId, role, permissions[] }
  3. StudentJWT:    { userId, studentId, orgId, role='STUDENT' }
  4. OrgViewJWT:    { userId, role='SUPER_ADMIN', orgViewOrgId }
                     ↑ when SA views org panel

  Security:
    - Token blacklisting via Redis (on logout)
    - Failed login tracking (lock after 5 failures, 15 min)
    - Token refresh flow (access + refresh token)
    - Org-view tokens expire in 30 min

8.4 Middleware Chain
─────────────────────
  Global: helmet → cors → json parser → compression → morgan → ratelimiter

  Route-level:
    authenticate      → JWT verify + blacklist check
    requireSuperAdmin → role === SUPER_ADMIN
    requireOrgAccess  → staff belongs to org OR SA in org-view
    requirePermission → specific permission key check
    requireFeature    → feature flag enabled for org
    checkPlanLimit    → student/staff count within plan

8.5 Plan Limits
────────────────
  SMALL      : 200 students, 10 staff, 5GB storage
  MEDIUM     : 1000 students, 50 staff, 50GB storage
  LARGE      : 5000 students, 100 staff, 500GB storage
  ENTERPRISE : Unlimited

8.6 BullMQ Background Queues
──────────────────────────────
  pdfExtractQueue    → PDF question extraction (GPT-4o)
  masteryUpdateQueue → Student question history + mastery recalc (NEW)
  folderCountQueue   → Q-Bank folder question count cache (NEW)
  autoSetScheduleQ   → Scheduled auto set generation (NEW)
  bulkTagAIQueue     → AI bulk question tagging
  bulkEditAIQueue    → AI bulk question editing
  notificationQueue  → Send notifications (all channels)
  receiptQueue       → WhatsApp receipt sending
  testScheduleQueue  → Test status transitions

8.7 Cron Schedulers
────────────────────
  Monthly AI Credits Reset  → '0 0 1 * *' (1st of month)
  Attendance Lock           → Hourly (lockedAt after 24h)
  Trial Expiry Alert        → Daily 9AM (3-day warning)
  Soft Delete Cleanup       → Daily 2AM (30-day old deletes)
  Study Plan Streak Update  → Daily midnight (streak maintenance) NEW
  Practice Set Expiry       → Daily 3AM (7-day unstarted sets) NEW

8.8 AI Credits System
──────────────────────
  Credits consumed per action:
    PDF extraction        → 0.12 credits per question
    AI question edit      → 0.10 credits per question
    AI question generate  → 1.50 credits per question
    Global Q purchase     → 0.50 credits per question
    Bulk AI edit          → 0.08 credits per question
    Auto Set Smart AI     → 2.00 credits per generation

  Monthly reset based on plan:
    SMALL      →  500 credits/month
    MEDIUM     → 2000 credits/month
    LARGE      → 8000 credits/month
    ENTERPRISE → Unlimited (soft limit configurable)

8.9 Third-Party Integrations
──────────────────────────────
  WhatsApp Business API:
    - Meta Graph API
    - Rate limiting per org per day:
        SMALL: 1,000/day, MEDIUM+: 10,000/day
    - Templates: fee_reminder, attendance_alert, test_result,
                 unlock_celebration, study_plan_reminder

  AWS SES (Email):
    - Transactional emails
    - Receipt delivery, notifications, welcome emails

  Msg91 (SMS):
    - OTP + notifications

  OpenAI GPT-4o:
    - PDF question extraction
    - AI question generation + editing
    - Auto Set smart selection
    - Bulk tagging

  Razorpay (Future / Feature Flag):
    - Student fee online payment
    - Subscription billing

====================================================================
SECTION 9: FRONTEND ARCHITECTURE
====================================================================

9.1 Monorepo Structure (Turborepo + pnpm)
──────────────────────────────────────────
  CHANGE FROM V1.0:
  Old: Separate Next.js codebases
  New: Turborepo monorepo — shared components, 3 apps

  eduhub-frontend/
  ├── apps/
  │   ├── super-admin/    (port 3000 — superadmin.eduhub.in)
  │   ├── org-admin/      (port 3001 — orgadmin.eduhub.in)
  │   └── student/        (port 3002 — [slug].eduhub.in)
  └── packages/
      ├── ui/             (@eduhub/ui — ALL shared components)
      ├── hooks/          (@eduhub/hooks — shared React hooks)
      ├── api-client/     (@eduhub/api-client — API functions)
      ├── utils/          (@eduhub/utils — helpers)
      └── types/          (@eduhub/types — TypeScript types)

9.2 Why Monorepo (Not Clone)
─────────────────────────────
  ❌ Clone approach: Bug fixed in one app → other app still broken
  ✅ Monorepo: Fix in packages/ui → ALL apps auto-updated

  Turborepo handles:
    - Build caching (only rebuild changed packages)
    - Parallel app builds
    - Dependency graph management

9.3 Shared Component Library (@eduhub/ui)
──────────────────────────────────────────
  Layout:    Sidebar (theme-aware), TopBar, PageHeader, Breadcrumb
  Data:      DataTable, StatsCard, Badge, Avatar, EmptyState
  Forms:     Input, Select, MultiSelect, DatePicker, FileUpload
  Feedback:  Modal, ConfirmDialog, Toast, Alert, Skeleton, ProgressBar
  Nav:       Tabs, Pagination, Stepper (multi-step wizards)
  Charts:    LineChart, BarChart, DonutChart (Recharts)

  App-Specific (NOT shared):
  Super Admin: OrgViewBanner, ImpersonationBanner, OrgSwitcher
  Org Admin:   SuperAdminBanner, StaffPermissionGate
  Student:     ExamInterface, UnlockProgress, MasteryBadge

9.4 Tech Stack (Frontend)
──────────────────────────
  Framework:      Next.js 14 (App Router)
  Language:       TypeScript 5.x (strict)
  Styling:        Tailwind CSS 3.x
  Components:     shadcn/ui (base) + @eduhub/ui (custom)
  State:          Zustand 4.x (client) + TanStack Query v5 (server)
  HTTP:           Axios 1.x
  Forms:          React Hook Form + Zod
  Charts:         Recharts 2.x
  Icons:          Lucide React
  Animations:     Framer Motion
  Toasts:         Sonner

9.5 App-Specific Auth
──────────────────────
  super-admin/  → Email + Password → SuperAdmin JWT
  org-admin/    → Org ID + Password → OrgStaff JWT
  student/      → Student ID + Password → Student JWT

9.6 Super Admin Viewing Org Admin
───────────────────────────────────
  SA clicks "Org Admin Control" → selects org
  → Orange banner: "Managing: [Org Name] (GK-ORG-00142)"
  → SA stays in SUPER ADMIN app
  → Sidebar shows Org Admin nav items
  → PLUS extra "Super Admin Controls" section
  → URL: superadmin.eduhub.in/org-admin-control/GK-ORG-00142/...

  NOT opening orgadmin.eduhub.in — same app, different context.

====================================================================
SECTION 10: DATABASE SCHEMA OVERVIEW
====================================================================

10.1 Core Models (21 total)
────────────────────────────
  Users & Auth:
    User, Organization, OrgStaff, Student

  Content Hierarchy:
    Subject, Chapter, Topic
    QBankFolder (NEW — unlimited nesting)
    Question, QuestionOption
    QuestionSet, QuestionSetItem

  Tests & Attempts:
    MockTest, MockTestSection, MockTestQuestion
    MockTestBatch, TestAttempt, AttemptAnswer

  Student Intelligence (NEW):
    StudentQuestionHistory
    StudentTopicMastery
    StudentPersonalizationStatus
    StudentPracticeSet
    StudentStudyPlan
    StudyPlanDailyProgress

  PDF Extraction:
    ExtractFolder, ExtractDocument
    ExtractedQuestion, ExtractJob

  Operations:
    AttendanceRecord, FeeStructure, FeeTransaction
    OrgNotification, NotificationLog, NotificationTemplate

  Admin (NEW):
    AdminCuratedSuggestion
    StudyPlanTemplate
    OrgPersonalizationSettings
    AutoSetConfig, AutoSetLog

  Platform:
    OrgFeatureFlag, AiCreditTransaction
    OrgAuditLog, OrgImpersonationLog

10.2 Key Design Decisions
──────────────────────────
  - PostgreSQL sequences for atomic ID generation
  - Materialized path for folder tree (fast subtree queries)
  - UPSERT for student question history (idempotent)
  - Redis for: token blacklist, attempt state, preview cache, 
               feature flag cache, WhatsApp rate limits
  - Soft delete (deletedAt) for organizations + questions
  - OrgAuditLog partitioned by month for performance

====================================================================
SECTION 11: AWS DEPLOYMENT ARCHITECTURE
====================================================================

11.1 AWS Services Used
───────────────────────

  COMPUTE:
    EC2 / ECS Fargate    → Node.js backend application
    EC2 Auto Scaling     → Handle traffic spikes

  DATABASE:
    RDS Aurora PostgreSQL 16 → Primary database
      - Multi-AZ for high availability
      - Automated backups (7-day retention)
      - Read replica for analytics queries

  CACHE & QUEUE:
    ElastiCache Redis 7  → Cache + BullMQ queues
      - Cluster mode for high availability
      - Redis AUTH enabled

  STORAGE:
    S3 Buckets:
      eduhub-assets-prod     → Question images, logos
      eduhub-pdfs-prod       → PDF uploads (private)
      eduhub-receipts-prod   → Fee receipts (private)
      eduhub-exports-prod    → CSV exports (temp)
    CloudFront CDN           → S3 assets delivery
      - Signed URLs for private files
      - Edge caching for public images

  NETWORKING:
    VPC                  → Isolated network
    Public Subnet        → Load Balancer, NAT Gateway
    Private Subnet       → EC2/ECS, RDS, Redis
    Security Groups      → Strict inbound rules
    Application LB       → Routes to backend containers

  SECURITY:
    AWS WAF              → Block malicious requests
    AWS Shield           → DDoS protection (Standard)
    AWS Secrets Manager  → DB passwords, API keys
    AWS KMS              → Encryption keys
    ACM                  → SSL/TLS certificates
    IAM Roles            → Least-privilege service access

  EMAIL:
    AWS SES              → Transactional emails
      - Verified domain (eduhub.in)
      - Bounce/complaint handling

  MONITORING:
    CloudWatch           → Logs, metrics, alarms
    CloudWatch Alarms:
      - API error rate > 5%
      - CPU > 80%
      - DB connections > 80%
      - Redis memory > 80%
      - BullMQ queue depth > 1000
    AWS X-Ray            → Distributed tracing (optional)

  CI/CD:
    GitHub Actions       → Build + test + deploy pipeline
    ECR (Elastic Container Registry) → Docker images
    ECS Fargate          → Container orchestration

11.2 Infrastructure Diagram
────────────────────────────

  Internet
    │
    ├── Route 53 (DNS)
    │     ├── superadmin.eduhub.in → CloudFront/Vercel
    │     ├── orgadmin.eduhub.in   → CloudFront/Vercel
    │     ├── [slug].eduhub.in     → CloudFront/Vercel
    │     ├── mockveda.in          → CloudFront/Vercel
    │     └── api.eduhub.in        → ALB → ECS Fargate
    │
    ├── CloudFront
    │     ├── Next.js static assets (Vercel CDN)
    │     └── S3 CDN (images, files)
    │
    └── VPC (ap-south-1 — Mumbai)
          ├── Public Subnet
          │     ├── Application Load Balancer
          │     └── NAT Gateway
          └── Private Subnet
                ├── ECS Fargate Cluster
                │     ├── Backend Service (Node.js containers)
                │     └── Worker Service (BullMQ processors)
                ├── RDS Aurora (PostgreSQL 16)
                │     ├── Writer instance
                │     └── Reader instance
                └── ElastiCache (Redis 7 cluster)

11.3 Frontend Deployment
─────────────────────────
  Option A: Vercel (Recommended — simpler)
    - Turborepo integration built-in
    - Separate projects per app:
        eduhub-super-admin → superadmin.eduhub.in
        eduhub-org-admin   → orgadmin.eduhub.in
        eduhub-student     → [slug].eduhub.in
    - Build command: turbo build --filter=@eduhub/[app-name]
    - Automatic preview deployments on PR

  Option B: AWS (Self-hosted — more control)
    - S3 + CloudFront for static export
    - Or EC2 with pm2 for SSR

  Recommended: Vercel for frontend + AWS for backend
  (Best of both worlds — managed frontend, controlled backend)

11.4 Environment Variables (Per Environment)
─────────────────────────────────────────────
  3 environments:
    development  → Local, .env.local
    staging      → Staging server, AWS Secrets Manager
    production   → Production AWS, Secrets Manager

  Backend env vars (stored in AWS Secrets Manager):
    DATABASE_URL, REDIS_URL
    JWT_SECRET, JWT_SUPER_ADMIN_SECRET
    AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
    AWS_S3_BUCKET, AWS_SES_FROM_EMAIL
    OPENAI_API_KEY
    WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN
    MSG91_API_KEY, FCM_SERVER_KEY
    RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET

  Frontend env vars:
    NEXT_PUBLIC_API_URL=https://api.eduhub.in
    NEXT_PUBLIC_APP_TYPE=[super-admin|org-admin|student]

11.5 Docker Setup
──────────────────
  Backend Dockerfile:
    FROM node:20-alpine
    WORKDIR /app
    COPY package*.json ./
    RUN npm ci --only=production
    COPY dist/ ./dist/
    EXPOSE 4000
    CMD ["node", "dist/server.js"]

  docker-compose.yml (local development):
    services:
      api:        Node.js backend (port 4000)
      worker:     BullMQ processors
      postgres:   PostgreSQL 16 (port 5432)
      redis:      Redis 7 (port 6379)

11.6 Database Setup on AWS RDS
────────────────────────────────
  Engine:     Aurora PostgreSQL 16
  Class:      db.t4g.medium (start) → db.r6g.large (scale)
  Storage:    100GB (auto-scaling enabled)
  Multi-AZ:   Yes (production)
  Backup:     7-day automated backup
  Encryption: At-rest (KMS)
  VPC:        Private subnet only (no public access)

  Connection Pooling:
    RDS Proxy (recommended) → manages connection pool
    Or: PgBouncer on ECS

  Key PostgreSQL Extensions:
    uuid-ossp   → UUID generation
    pg_trgm     → Full-text search (question search)
    btree_gin   → Array index (permissions, topic IDs)

11.7 Redis Setup on ElastiCache
─────────────────────────────────
  Engine:     Redis 7
  Node type:  cache.t4g.medium (start) → cache.r6g.large (scale)
  Replicas:   1 (production)
  Encryption: In-transit + at-rest
  Auth:       Redis AUTH token

  Key patterns (TTLs):
    token_blacklist:{jti}         → TTL: token expiry
    attempt:{id}:questions        → TTL: test duration
    attempt:{id}:answers          → TTL: test duration
    feature_flags:{orgId}         → TTL: 300s (5 min)
    auto_set_preview:{id}         → TTL: 1800s (30 min)
    student_set_preview:{id}      → TTL: 1800s (30 min)
    whatsapp_count:{date}:{orgId} → TTL: end of day
    credits_lock:{orgId}          → TTL: 5s (mutex)

11.8 S3 Bucket Structure
─────────────────────────
  eduhub-assets-prod/
    orgs/{orgId}/
      logos/              → Org branding
      pdf-extract/{docId}/ → Uploaded PDFs
        images/           → Extracted question images
      receipts/{year}/    → Fee receipt PDFs
      question-images/    → Question/option images
    global/
      questions/images/   → Global question images

  Bucket Policies:
    - Public Read: logos, question images (via CloudFront)
    - Private (Signed URL): PDFs, receipts, exports

11.9 CI/CD Pipeline (GitHub Actions)
──────────────────────────────────────
  On PR:
    1. Run TypeScript type-check
    2. Run ESLint
    3. Run unit tests (Vitest)
    4. Build Docker image (no push)
    5. Preview deployment (Vercel frontend)

  On merge to main (staging):
    1. Run all checks
    2. Build + push Docker image to ECR
    3. Run DB migrations (prisma migrate deploy)
    4. Deploy to ECS staging cluster
    5. Health check
    6. Vercel staging deploy

  On release tag (production):
    1. Same as staging
    2. Manual approval gate
    3. Deploy to ECS production cluster
    4. Vercel production deploy
    5. CloudWatch alarm check

11.10 Monitoring & Alerts
───────────────────────────
  CloudWatch Dashboards:
    - API latency (p50, p95, p99)
    - Error rate per endpoint
    - BullMQ queue depth
    - DB connection count
    - Redis memory usage

  Alerts (SNS → Email/Slack):
    - API error rate > 5% (5 min window)
    - CPU > 80% (sustained 10 min)
    - DB connections > 80% of max
    - Redis memory > 80%
    - Failed BullMQ jobs > 10
    - Disk usage > 85%

  Application Logs:
    - Winston logger → CloudWatch Logs
    - Log groups per service
    - 30-day retention (production)
    - Structured JSON logging

11.11 Cost Estimation (Monthly, Production)
─────────────────────────────────────────────
  ECS Fargate (2 tasks × 1vCPU/2GB)  → ~$60
  RDS Aurora (db.t4g.medium)          → ~$80
  ElastiCache (cache.t4g.medium)      → ~$40
  ALB                                  → ~$20
  S3 (100GB + requests)               → ~$15
  CloudFront                           → ~$10
  SES (10,000 emails/month)           → ~$1
  Data Transfer                        → ~$20
  Route 53 + WAF                       → ~$10
  ─────────────────────────────────────────────
  Total Backend (AWS):                 ~$256/month
  Vercel Frontend (Pro):               ~$20/month
  ─────────────────────────────────────────────
  TOTAL:                               ~$276/month

  Scale estimate (1000 orgs, 100K students):
  → ECS Fargate (auto-scale 4-8 tasks)  → ~$180
  → RDS Aurora (db.r6g.large, 2 readers)→ ~$400
  → ElastiCache (cache.r6g.large)       → ~$150
  → S3 (1TB + CloudFront)               → ~$100
  ─────────────────────────────────────────────
  Total (1000 orgs):                     ~$1000/month

====================================================================
SECTION 12: SECURITY & DATA ISOLATION
====================================================================

12.1 Multi-Tenant Security
───────────────────────────
  - orgId NEVER trusted from frontend (always from JWT)
  - Every DB query includes WHERE orgId = req.user.orgId
  - Super Admin access gated behind separate JWT secret
  - Org-view tokens scoped and short-lived (30 min)

12.2 Authentication Security
──────────────────────────────
  - bcryptjs (cost factor 12) for passwords
  - JWT with short expiry (15 min access, 7 day refresh)
  - Token blacklisting on logout (Redis)
  - Failed login tracking → lockout (5 attempts, 15 min)
  - First login → force password change

12.3 API Security
──────────────────
  - Helmet.js (security headers)
  - CORS (whitelist specific domains)
  - Rate limiting (per IP + per user)
  - Input validation (Zod schemas)
  - SQL injection: impossible (Prisma parameterized)
  - XSS: Next.js escaping + CSP headers
  - CSRF: not applicable (JWT bearer, not cookies)

12.4 Data Encryption
─────────────────────
  - In transit: TLS 1.2+ (ACM certificates)
  - At rest: RDS encryption (KMS), S3 encryption (SSE-S3)
  - Secrets: AWS Secrets Manager (not .env in production)
  - Backups: Encrypted automated RDS backups

12.5 Audit Trail
─────────────────
  OrgAuditLog records:
    - Actor (who), Action (what), Resource (on what)
    - IP address, User agent, Timestamp
    - Partitioned by month for performance
  
  Retention: 1 year in DB, archivable to S3

====================================================================
SECTION 13: DESIGN SYSTEM & UI/UX
====================================================================

13.1 Design Philosophy
───────────────────────
  Professional, Clean, Compact, SaaS-grade
  Multi-device responsive, Minimal clutter
  Consistent across ALL 4 applications

13.2 Color System
──────────────────
  Primary Brand:     #FF5A1F (Professional Orange)
  Secondary:         #F97316 (Orange accent)
  Background:        #F9FAFB
  Card:              #FFFFFF
  Border:            #E5E7EB
  Muted Text:        #6B7280
  Success:           #16A34A
  Warning:           #F59E0B
  Error:             #DC2626

  Per-App Theme (Dark):
    Super Admin: Sidebar #0e1420, Accent #4f8eff (Blue)
    Org Admin:   Sidebar #1e293b, Accent #f97316 (Orange)
    Student:     Sidebar #0f172a, Accent #6366f1 (Indigo)

  Dark Mode: Future-ready tokens defined
    BG: #0F172A, Card: #1E293B, Text: #F1F5F9

13.3 Typography
────────────────
  Font: Inter (primary), Poppins (fallback)
  H1: 28px Bold | H2: 22px Semibold | H3: 18px Semibold
  Body: 14px Regular | Caption: 12px Muted
  Base spacing: 4px | Common: 8/12/16/24/32px
  Border radius: Cards 16px, Buttons 12px, Inputs 10px

13.4 Responsive Breakpoints
─────────────────────────────
  Desktop  (≥1280px): Sidebar fixed 240px, 3-col grid
  Laptop   (1024px):  Sidebar fixed, 2-col
  Tablet   (768px):   Sidebar collapsible, 2-col
  Mobile   (≤480px):  Drawer sidebar, 1-col, touch targets 44px+

13.5 UX Principles
───────────────────
  - Loading states for all async operations
  - Empty states designed (not just blank)
  - Error states with actionable messages
  - Confirm dialogs for all destructive actions
  - Soft micro-animations (200ms transitions)
  - No popup interruptions during exam/whiteboard
  - Keyboard shortcuts for power users

====================================================================
SECTION 14: NON-FUNCTIONAL REQUIREMENTS
====================================================================

14.1 Performance
─────────────────
  Backend:
    API response:         < 500ms (p95)
    Heavy queries (PDF):  < 5s
    Test start (cache):   < 200ms
    BullMQ throughput:    > 100 jobs/min

  Frontend:
    First Contentful Paint: < 2s
    Time to Interactive:    < 3s
    Lighthouse score:       > 85

  Exam Interface:
    Answer save:        < 100ms (optimistic UI)
    State recovery:     < 1s (Redis reconnect)

14.2 Scalability
─────────────────
  - ECS Fargate auto-scaling (CPU/memory triggers)
  - RDS read replica for analytics queries
  - Redis cluster for queue throughput
  - S3 + CloudFront for unlimited file storage
  - BullMQ horizontal scaling (multiple workers)

14.3 Reliability
─────────────────
  - RDS Multi-AZ (99.99% uptime)
  - ECS task auto-restart on failure
  - BullMQ retry with exponential backoff (3 retries)
  - Graceful shutdown (drain in-flight requests)
  - Health check endpoints (/health, /ready)
  - Circuit breaker for external APIs (OpenAI, WhatsApp)

14.4 Availability Target
─────────────────────────
  Backend API:   99.9% (< 9 hours downtime/year)
  Database:      99.99% (RDS Multi-AZ)
  Frontend:      99.99% (Vercel SLA)

====================================================================
SECTION 15: USER ROLES & PERMISSIONS MATRIX
====================================================================

15.1 Platform Roles
────────────────────
  SUPER_ADMIN      → Platform-level (all orgs, all features)
  ORG_ADMIN        → Org-level full access
  TEACHER          → Academic operations
  CONTENT_MANAGER  → Content-only access
  FEE_MANAGER      → Fee operations only
  RECEPTIONIST     → Front-desk operations
  ANALYTICS_VIEWER → Read-only reports
  STUDENT          → Own data only

15.2 Permission Keys
─────────────────────
  TESTS:       view, create, edit, delete, results.view,
               results.export, schedule, publish
  QBANK:       view, create, edit, delete, sets.manage,
               pdf_extract, ai_generate, global_browse
  ATTENDANCE:  view, mark, edit, report
  STAFF:       view, create, edit, delete, roles.manage
  FEES:        view, collect, structure.edit, report, receipt, reminder
  NOTIFICATIONS: view, send, templates
  SETTINGS:    profile, branding, subjects, security, personalization

15.3 Default Role → Permission Mapping
────────────────────────────────────────
  ORG_ADMIN:        ['*'] (wildcard — all permissions)
  TEACHER:          tests.*, qbank.view/create/edit/sets, 
                    attendance.view/mark/edit, notifications.view/send
  CONTENT_MANAGER:  qbank.* (full), tests.view
  FEE_MANAGER:      fees.* (full)
  RECEPTIONIST:     fees.view/collect/receipt, attendance.view/mark,
                    notifications.send
  ANALYTICS_VIEWER: tests.results, attendance.report, fees.report

====================================================================
SECTION 16: FEATURE FLAGS SYSTEM
====================================================================

16.1 Feature Keys
──────────────────
  ai_question_generation  → AI generate questions
  pdf_extraction          → PDF upload + extract
  video_recordings        → (Future) Class recordings
  advanced_analytics      → Deep analytics
  custom_domain           → Own domain for student portal
  whatsapp_bot            → WhatsApp Business integration
  parent_portal           → Parent access to student data
  certificate_generation  → Auto certificates
  razorpay_integration    → Online fee collection
  beta_ai_doubt_solving   → (Beta) AI doubt resolution

16.2 Plan Defaults
───────────────────
  SMALL:      pdf_extraction, certificate_generation
  MEDIUM:     + ai_question_generation, whatsapp_bot, razorpay
  LARGE:      + video_recordings, advanced_analytics, custom_domain
  ENTERPRISE: ALL features (configurable)

16.3 Override
──────────────
  Super Admin can toggle any feature for any org
  Override stored in OrgFeatureFlag table
  Cached in Redis (5 min TTL)

====================================================================
SECTION 17: NOTIFICATION SYSTEM
====================================================================

17.1 Channels
──────────────
  APP   → FCM push notifications (Android/iOS)
  WHATSAPP → Meta Business API
  SMS   → Msg91
  EMAIL → AWS SES

17.2 Notification Types
────────────────────────
  System:
    welcome_org, reset_password, plan_expiry_warning
    personalization_unlocked (NEW)

  Academic:
    test_published, test_result_released, test_reminder

  Attendance:
    consecutive_absence (3 days), low_attendance_monthly,
    extended_absence (7+ days)

  Financial:
    fee_reminder, fee_overdue, receipt_generated,
    payment_confirmed

  Practice (NEW):
    study_plan_reminder, streak_milestone,
    weak_area_alert, practice_set_ready

17.3 WhatsApp Rate Limits
──────────────────────────
  Per org per day:
    SMALL: 1,000 messages
    MEDIUM+: 10,000 messages
  Enforced via Redis counter

====================================================================
SECTION 18: PUBLIC WEBSITE (MULTI-TENANT)
====================================================================

18.1 Architecture
──────────────────
  SAME AS V1.0 — Not changed significantly
  Multi-tenant: Backend resolves org_id from DOMAIN (not frontend)
  
  eduhub.in        → Platform marketing website
  [org].eduhub.in  → Org-specific student portal

18.2 Features
──────────────
  - SEO optimized pages (org-specific)
  - Blog (platform-global + org-specific)
  - Lead generation per organization
  - MockVeda landing page
  - Download links (Whiteboard app)
  - Tool marketplace (future)

18.3 Performance Target
────────────────────────
  Lighthouse score > 85
  FCP < 2s
  Mobile-first design

====================================================================
SECTION 19: WHITEBOARD APP
====================================================================

19.1 Status
────────────
  Web Whiteboard: Built (basic features)
  Flutter Whiteboard: In development

19.2 Platforms
───────────────
  Flutter Native: Windows + Android
  Web: Browser-based (limited features)

19.3 Core Features
───────────────────
  - Secure login (org-bound)
  - Set ID + PIN based content access
  - PPT / PDF / Questions display
  - Drawing + annotation tools
  - Offline teaching support
  - 60 FPS target
  - No recording (per policy)
  - No session data save

19.4 Security
──────────────
  - All sensitive logic via Edge Functions
  - No direct DB access from whiteboard
  - Token-based Set ID validation

====================================================================
SECTION 20: DEVELOPMENT PHASES
====================================================================

PHASE 1 — Foundation (Months 1-2)
────────────────────────────────────
  Backend:
  ☐ Monorepo setup (Turborepo + pnpm)
  ☐ Node.js + TypeScript + Express setup
  ☐ Prisma schema (all 35+ models)
  ☐ AWS infrastructure setup (EC2/ECS, RDS, Redis, S3)
  ☐ Auth module (4 JWT types, refresh, blacklist)
  ☐ ID generator service (all GK-XXX formats)
  ☐ Error handling + logging (Winston + CloudWatch)

  Frontend:
  ☐ Monorepo scaffold (turbo + pnpm workspace)
  ☐ @eduhub/ui package (all shared components)
  ☐ @eduhub/hooks, api-client, utils, types
  ☐ Super Admin app shell (auth + layout)
  ☐ Org Admin app shell (auth + layout)

  CI/CD:
  ☐ GitHub Actions pipeline (test + build + deploy)
  ☐ Docker setup for backend
  ☐ ECR + ECS Fargate deployment

PHASE 2 — Core Features (Months 2-4)
───────────────────────────────────────
  Backend:
  ☐ Organizations module (CRUD + feature flags + credits)
  ☐ Staff + Student management
  ☐ Batch management
  ☐ Q-Bank Folder System (unlimited nesting)
  ☐ Question CRUD (bilingual)
  ☐ Question Sets
  ☐ Mock Tests (create + assign + schedule)
  ☐ Test Attempt Engine (Redis state + submit + scoring)

  Frontend:
  ☐ Super Admin: Org management pages
  ☐ Org Admin: Student, Staff, Batch pages
  ☐ Org Admin: Q-Bank folder tree + question management
  ☐ Org Admin: Test creation + management
  ☐ Student App: Test list + exam interface
  ☐ Student App: Results + review

PHASE 3 — Advanced Features (Months 4-6)
──────────────────────────────────────────
  Backend:
  ☐ PDF Question Extraction (BullMQ + GPT-4o)
  ☐ Auto Set Generator (3 selection modes)
  ☐ Student Question History (upsert + mastery calc)
  ☐ Student Topic Mastery aggregation
  ☐ Fee Collection module
  ☐ Attendance module (with auto-alerts)
  ☐ Notifications (all 4 channels)
  ☐ WhatsApp Business API integration

  Frontend:
  ☐ Org Admin: PDF Extract workflow
  ☐ Org Admin: Auto Set Generator wizard
  ☐ Org Admin: Fee collection + receipts
  ☐ Org Admin: Attendance management
  ☐ Student: My Progress (mastery dashboard)
  ☐ Student: Fee center + attendance view

PHASE 4 — Personalization & Intelligence (Months 6-8)
───────────────────────────────────────────────────────
  Backend:
  ☐ Student Personalization unlock system
  ☐ Student Auto Set Generator (weak-area based)
  ☐ Study Plan engine (daily targets + streak)
  ☐ Practice Suggestions (3 sources)
  ☐ Admin Curated Suggestions CRUD
  ☐ Study Plan Templates
  ☐ Personalization Analytics APIs

  Frontend:
  ☐ Student: My Practice section (unlock + 4-step wizard)
  ☐ Student: Study Plan (calendar view + streak)
  ☐ Student: Practice Suggestions (3 source UI)
  ☐ Org Admin: Personalization Settings tab
  ☐ Org Admin: Curated Suggestions Manager
  ☐ Org Admin: Study Plan Template builder
  ☐ Org Admin: Student Practice Analytics tab

PHASE 5 — MockVeda & Public Platform (Months 8-10)
────────────────────────────────────────────────────
  Backend:
  ☐ MockVeda public APIs
  ☐ Public test series management
  ☐ Leaderboard
  ☐ MockVeda personalization (same engine)
  ☐ Super Admin MockVeda controls

  Frontend:
  ☐ mockveda.in landing + browse
  ☐ MockVeda student portal
  ☐ Public leaderboard
  ☐ Super Admin MockVeda management

PHASE 6 — Billing, Analytics & Scale (Months 10-12)
─────────────────────────────────────────────────────
  ☐ Razorpay integration (online fee collection)
  ☐ Subscription billing (org plans)
  ☐ Advanced analytics (usage trends)
  ☐ Whiteboard Flutter app integration
  ☐ Custom domain setup automation
  ☐ Performance optimization + caching
  ☐ Load testing + scale testing

====================================================================
SECTION 21: SUCCESS METRICS
====================================================================

21.1 Business Metrics
──────────────────────
  - Orgs onboarded: 50+ in first year
  - Students on platform: 10,000+ in Year 1
  - MRR: ₹5L+ by Month 12
  - Churn rate: < 10% monthly

21.2 Product Metrics
─────────────────────
  - Test completion rate: > 85%
  - Personalization unlock rate: > 60% of active students
  - Study plan completion: > 65%
  - PDF extraction accuracy: > 90%
  - App crash rate: < 0.1%

21.3 Technical Metrics
───────────────────────
  - API p95 latency: < 500ms
  - API uptime: > 99.9%
  - DB query time: < 100ms (p95)
  - Error rate: < 0.5%
  - BullMQ job failure rate: < 2%

====================================================================
SECTION 22: OUT OF SCOPE (V1-V2)
====================================================================

- Live video streaming
- Chat system (teacher ↔ student)
- Whiteboard session recording
- AI doubt solving (beta flag exists, not in scope)
- Native mobile app (student Flutter app) — web only first
- Advanced ML recommendations (collaborative filtering Phase 2)
- Parent portal (feature flag exists, Phase 2)

====================================================================
SECTION 23: GLOSSARY
====================================================================

  Org        → A coaching institute on the platform
  Set        → A collection of questions (6-digit ID + PIN)
  MockTest   → A scheduled test using sets
  Attempt    → A student's single run of a MockTest
  Mastery    → 0-100 score representing topic understanding
  AutoSet    → Algorithmically generated question set
  StudyPlan  → AI-generated daily practice schedule
  BullMQ     → Redis-backed job queue for background processing
  Turborepo  → Monorepo build system (frontend)
  ECS        → AWS Elastic Container Service
  RDS        → AWS Relational Database Service
  ElastiCache→ AWS managed Redis service
  CloudFront → AWS CDN for static assets

====================================================================
DOCUMENT HISTORY
====================================================================

  v1.0 (Initial):
    - Supabase backend
    - Basic 5 modules
    - No Q-Bank folder system
    - No personalization
    - No AWS deployment detail

  v2.0 (This document — March 2026):
    - Backend: Supabase → Node.js + AWS
    - Frontend: Turborepo monorepo
    - Q-Bank: Folder system (unlimited nesting)
    - Q-Bank: Auto Set Generator (Admin + Student)
    - Student: Question history + mastery tracking
    - Student: Personalization (50+ tests unlock)
    - Student: Study Plan + Practice Suggestions
    - Admin: Curated suggestions + plan templates
    - AWS: Full deployment architecture
    - AWS: Cost estimates + scaling plan
    - 35+ database models
    - 100+ API endpoints documented
    - CI/CD pipeline defined

====================================================================
END OF MASTER PRD — EDUHUB v2.0
====================================================================

Prepared by: EduHub Product Team
Version: 2.0 | March 2026
Status: Active Development Reference
Next Review: Quarterly (June 2026)
