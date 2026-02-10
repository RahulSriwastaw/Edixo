====================================================================
SUPER ADMIN PANEL – PRODUCT REQUIREMENTS DOCUMENT (PRD)
(Main Control Center of Platform)
====================================================================

1. PURPOSE
----------
Super Admin Panel platform ka CENTRAL CONTROL CENTER hoga.
Yahin se poore ecosystem ko manage kiya jaayega:

- Organizations (coaching / institutes)
- Platform users (high-level)
- Content visibility rules
- Public website (blogs, tools)
- Whiteboard app access & downloads
- Feature flags & licenses

Super Admin Panel ka direct use:
- Teachers
- Students
- Public users

ke liye nahi hoga.

---------------------------------------------------------------

2. TARGET USER
--------------
Primary User:
- super_admin (platform owner / internal team)

Secondary User:
- platform moderator (future)

---------------------------------------------------------------

3. CORE RESPONSIBILITIES
------------------------
Super Admin Panel ke through following control possible hona chahiye:

- Organization lifecycle management
- Org-level feature & license control
- Platform-wide content governance
- Public website content control
- Whiteboard app distribution control
- Monitoring & enforcement

---------------------------------------------------------------

4. MODULES & FEATURES
---------------------

4.1 ORGANIZATION MANAGEMENT
---------------------------
Features:
- Create new organization
- Edit organization details
- Enable / suspend organization
- Assign plan / license
- Set organization limits:
  - No. of teachers
  - No. of courses
  - Whiteboard access (yes/no)
- **Domain Management**:
  - Add / Verify custom domains
  - Activate / Deactivate domains
  - Set Primary domain

Data Entities:
- organizations
- licenses

Permissions:
- super_admin only

---------------------------------------------------------------

4.2 ORGANIZATION OVERRIDE & CONTROL
----------------------------------
Features:
- View org-level data (read-only)
- Force disable specific features
- Emergency org lock (security / misuse)
- Reset org credentials (if required)

Important Rule:
- Super Admin content edit kar sakta hai,
  lekin default behavior READ-ONLY rahega
  (to avoid accidental changes)

---------------------------------------------------------------

4.3 USER OVERVIEW (GLOBAL)
--------------------------
Features:
- View all users across organizations
- Filter by:
  - Org
  - Role
  - Status
- Block / unblock users
- Force logout (token revoke)

Data Entities:
- users
- auth.users

---------------------------------------------------------------

4.4 BLOG & SEO MANAGEMENT (PUBLIC WEBSITE)
------------------------------------------
Features:
- Create / edit / publish blogs
- SEO fields:
  - meta title
  - meta description
  - slug
- Draft / publish control
- Category & tag management

Important Rule:
- Blog WRITE access = super_admin only
- Org Admin / Teacher = NO access

Data Entities:
- blogs
- seo_pages

---------------------------------------------------------------

4.5 PUBLIC TOOLS MANAGEMENT
----------------------------
Features:
- Create educational tools:
  - free tools
  - paid tools
- Tool visibility control
- Pricing & access type
- Enable / disable tools

Examples:
- PDF tools
- Exam calculators
- Name generators

Data Entities:
- tools
- tool_access

---------------------------------------------------------------

4.6 WHITEBOARD APP CONTROL
--------------------------
Features:
- Whiteboard app download links
- Version metadata (current / deprecated)
- Platform availability:
  - Windows
  - Android
- Force update flag (future)
- Enable / disable whiteboard access per org

Important Rule:
- Whiteboard binaries NOT stored here
- Only metadata & links controlled

---------------------------------------------------------------

4.7 FEATURE FLAGS (PLATFORM LEVEL)
----------------------------------
Features:
- Enable / disable features globally:
  - Whiteboard
  - Mock tests
  - Paid courses
- Emergency feature shutdown
- Gradual rollout support (future)

Data Entities:
- feature_flags

---------------------------------------------------------------

5. ACCESS CONTROL & SECURITY
----------------------------
Authentication:
- Supabase Auth (email + password)

Authorization:
- Role = super_admin only
- Enforced via:
  - Supabase RLS
  - Backend role checks

Security Rules:
- No org_id trusted from frontend
- All writes logged (future audit)
- Sensitive actions confirmation required

---------------------------------------------------------------

6. UI/UX PRINCIPLES
-------------------
Design Goals:
- Clean
- Minimal
- Admin-first (not student-style)
- Fast navigation

Layout:
- Sidebar navigation
- Module-based pages
- Tables + detail views
- Confirmation dialogs for destructive actions

---------------------------------------------------------------

7. NON-FUNCTIONAL REQUIREMENTS
-------------------------------
Performance:
- Page load < 1.5 seconds
- Search & filters < 500ms

Scalability:
- Handle 1000+ organizations
- Handle 100k+ users

Reliability:
- Stateless frontend
- Backend-driven rules

---------------------------------------------------------------

8. OUT OF SCOPE
---------------
- Org-level content creation
- Teaching activities
- Student operations
- Whiteboard drawing

---------------------------------------------------------------

9. MVP DELIVERABLES
-------------------
Phase 1:
- Organization management
- Blog & SEO management
- Whiteboard app links
- Feature flags (basic)

Phase 2:
- Advanced analytics
- Audit logs
- Role delegation
- Automation rules

---------------------------------------------------------------

10. SUCCESS CRITERIA
-------------------
- Super Admin can:
  - Fully control org lifecycle
  - Manage public website content
  - Control whiteboard access
- No direct backend access needed
- All platform rules enforced centrally

====================================================================
END OF SUPER ADMIN PANEL PRD
====================================================================
