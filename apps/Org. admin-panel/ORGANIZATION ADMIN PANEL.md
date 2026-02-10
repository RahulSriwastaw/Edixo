====================================================================
ORGANIZATION ADMIN PANEL – PRODUCT REQUIREMENTS DOCUMENT (PRD)
(Organization / Coaching Level Management)
====================================================================

1. PURPOSE
----------
Organization Admin Panel ka purpose har coaching / institute
ko apna EDUCATIONAL BUSINESS manage karne ka control dena hai.

Is panel ke through:
- Teachers manage honge
- Courses, classes, tests create honge
- Whiteboard ke liye teaching sets banenge
- Students ke liye content ready hoga

Ye panel:
- Super Admin ke under rahega
- Har organization ke liye logically isolated hoga

---------------------------------------------------------------

2. TARGET USERS
---------------
Primary Users:
- org_admin (coaching owner / manager)

Secondary Users:
- teacher (limited access)

Excluded Users:
- student
- guest

---------------------------------------------------------------

3. ACCESS & AUTHENTICATION
--------------------------
Login:
- Email + Password (Supabase Auth)

Authorization:
- Role based access
- Organization-bound access
- Enforced via Supabase RLS

Rule:
- Org Admin sirf apni organization ka data manage karega

---------------------------------------------------------------

4. CORE RESPONSIBILITIES
------------------------
Organization Admin Panel ke main kaam:

- Teacher & staff management
- Course & content management
- Test & mock exam management
- Whiteboard teaching set creation
- Student access preparation (backend-ready)

---------------------------------------------------------------

5. MODULES & FEATURES
---------------------

5.1 DASHBOARD
-------------
Features:
- Total teachers count
- Total courses count
- Total tests count
- Active teaching sets
- Quick actions:
  - Add teacher
  - Create course
  - Create set

Purpose:
- Org ka quick overview

---------------------------------------------------------------

5.2 TEACHER MANAGEMENT
----------------------
Features:
- Create teacher account
- Assign role & permissions
- Activate / deactivate teacher
- Reset teacher password (via backend flow)

Data Entities:
- users (role = teacher)

Permissions:
- org_admin (full)
- teacher (view only self)

---------------------------------------------------------------

5.3 COURSE MANAGEMENT
---------------------
Features:
- Create course (free / paid)
- Edit course details
- Publish / unpublish course
- Assign teachers to course

Course Types:
- Recorded
- Test-based
- Mixed

Data Entities:
- courses

---------------------------------------------------------------

5.4 TEST & MOCK MANAGEMENT
--------------------------
Features:
- Create tests (practice / mock)
- Add questions (MCQ / theory)
- Set duration & marks
- Publish / unpublish tests

Important:
- Test content used by Student App

Data Entities:
- tests
- questions

---------------------------------------------------------------

5.5 WHITEBOARD TEACHING SETS
----------------------------
Purpose:
Whiteboard ke liye secure teaching content banana.

Features:
- Create teaching set
- Upload PPT / PDF
- Add question sets
- Set Set-ID & password
- Set expiry date (optional)
- Enable / disable set

Important Rules:
- Set sirf whiteboard ke liye
- Students ko direct access nahi

Data Entities:
- sets
- set_items

---------------------------------------------------------------

5.6 CONTENT UPLOAD & STORAGE
----------------------------
Features:
- Upload PPT / PDF
- Preview uploaded files
- Delete / replace files

Storage Rules:
- Files org-specific folders me
- Supabase Storage used
- Access controlled via RLS

---------------------------------------------------------------

5.7 PERMISSIONS & LIMITS
------------------------
Features:
- Teacher-level permissions:
  - Can create sets
  - Can upload PPT
  - Can create tests
- Limits enforced by license:
  - Max teachers
  - Max courses
  - Whiteboard enabled / disabled

Limits defined by:
- Super Admin

---------------------------------------------------------------

6. SECURITY & DATA ISOLATION
----------------------------
Security enforced using:
- Supabase Auth
- JWT tokens
- Row Level Security (RLS)

Rules:
- Org Admin sirf apni org ka data dekhe
- Cross-org data access impossible
- org_id frontend se kabhi trust nahi

---------------------------------------------------------------

7. UI / UX PRINCIPLES
---------------------
Design Goals:
- Simple
- Clean
- Productivity-focused
- Low learning curve

Layout:
- Sidebar navigation
- List + detail pages
- Modal-based create/edit forms

---------------------------------------------------------------

8. NON-FUNCTIONAL REQUIREMENTS
-------------------------------
Performance:
- Page load < 2 seconds
- File upload progress visible

Scalability:
- 100+ teachers per org
- 1000+ students per org

Reliability:
- Stateless frontend
- Backend-enforced rules

---------------------------------------------------------------

9. OUT OF SCOPE
---------------
- Platform-wide settings
- Blog & SEO management
- Student analytics (initial phase)
- Payment configuration (phase-2)

---------------------------------------------------------------

10. MVP DELIVERABLES
--------------------
Phase 1 (MVP):
- Teacher management
- Course creation
- Test creation
- Teaching sets (whiteboard)
- File uploads

Phase 2 (Enhancements):
- Student enrollment view
- Basic reports
- Content reuse tools
- Bulk upload

---------------------------------------------------------------

11. SUCCESS CRITERIA
-------------------
- Org Admin independently manage:
  - Teachers
  - Courses
  - Tests
  - Whiteboard sets
- No Super Admin dependency for daily ops
- Whiteboard works seamlessly with created sets

====================================================================
END OF ORGANIZATION ADMIN PANEL PRD
====================================================================
