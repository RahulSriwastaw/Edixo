====================================================================
MASTER PRD – MULTI-ORG EDTECH PLATFORM
(SUPER ADMIN + ORG ADMIN + STUDENT APP + WHITEBOARD + WEBSITE)
====================================================================

1. PRODUCT VISION
-----------------
Ek centralized EdTech platform banana jahan:

- Multiple coaching / organizations onboard ho sakein
- Har organization apna teaching content manage kare
- Students ek combined app se courses + mock tests access karein
- Teachers ek professional whiteboard software se padha sakein
- Public website se marketing, SEO, blogs aur tools chal sakein
- Sab kuch ek hi backend (Supabase) se securely controlled ho

Platform ka focus:
- Scalability
- Security
- Performance
- Low operational cost
- Long-term brand building

--------------------------------------------------------------------

2. PLATFORM MODULES (HIGH LEVEL)
--------------------------------
Platform 5 major modules me divided hoga:

1. Super Admin Panel (Main Control Center)
2. Organization Admin Panel (Org-level management)
3. Teaching + Mock Test App (Students)
4. Whiteboard App (Desktop / Mobile)
5. Public Website (Marketing + Blogs + Tools)

--------------------------------------------------------------------

3. USER ROLES (GLOBAL)
---------------------
System-wide roles:

- super_admin
- org_admin
- teacher
- student
- guest

Har role ke access rules backend (RLS + Edge Functions) se enforce honge.

--------------------------------------------------------------------

4. MODULE 1 – SUPER ADMIN PANEL
--------------------------------
Purpose:
Platform ka full control ek jagah se.

Core Responsibilities:
- Organization create / update / disable
- Organization plans & licenses manage
- Org-level feature enable/disable
- Global users overview
- Blog & SEO content management
- Public tools management (free / paid)
- Whiteboard app download links & version control

Key Users:
- super_admin only

Data Controlled:
- organizations
- users
- blogs
- tools
- licenses

--------------------------------------------------------------------

5. MODULE 2 – ORGANIZATION ADMIN PANEL
-------------------------------------
Purpose:
Har coaching / org apna content yahin se manage kare.

Core Responsibilities:
- Teacher create / manage
- Courses create (free / paid)
- Classes & mock tests create
- PPT / PDF / question upload
- Teaching Sets (Whiteboard ke liye) create
- Org-specific content isolation

Key Users:
- org_admin
- teacher (limited permissions)

Data Controlled:
- users (teacher)
- courses
- tests
- sets
- set_items

--------------------------------------------------------------------

6. MODULE 3 – TEACHING + MOCK TEST APP (STUDENT APP)
---------------------------------------------------
Purpose:
Students ke liye ek combined mobile app.

Core Features:
- Student login / signup
- Course listing (free + paid)
- Course purchase & access
- Practice tests & mock tests
- Test attempts & results
- Notifications (future)

Key Users:
- student

Important Rules:
- Student sirf enrolled courses access karega
- Content org-wise isolated rahega

--------------------------------------------------------------------

7. MODULE 4 – WHITEBOARD APP (DESKTOP / MOBILE)
-----------------------------------------------
Purpose:
Professional teaching tool (Prestigio / Drawboard class).

Core Features:
- Secure login (Org-bound)
- Role-based feature unlock
- Set ID + Password based content access
- PPT / PDF / Questions display
- Drawing / annotation tools
- Offline teaching support (native app)

Important Rules:
- No recording
- No session data save
- No direct DB access
- Sensitive logic only via Edge Functions

Platforms:
- Flutter Native (Windows / Android)
- Web Whiteboard (already built, limited features)

Key Users:
- teacher
- org_admin (optional)

--------------------------------------------------------------------

8. MODULE 5 – PUBLIC WEBSITE
----------------------------
Purpose:
Marketing + SEO + tools + downloads.

Core Features:
- SEO pages
- Blogs (write access: super_admin only)
- Free & paid educational tools
- Whiteboard app download links
- Public course listings (optional)

Key Users:
- guest
- super_admin (content control)

--------------------------------------------------------------------

9. BACKEND (COMMON FOR ALL MODULES)
----------------------------------
Backend Technology:
- Supabase

Backend Responsibilities:
- Authentication (Auth)
- Authorization (RBAC)
- Data isolation (RLS)
- File storage
- Business logic (Edge Functions)

Core Entities:
- organizations
- users
- students
- courses
- tests
- sets
- set_items
- blogs
- tools

--------------------------------------------------------------------

10. SECURITY & DATA ISOLATION
----------------------------
Principles:
- Multi-tenant by default
- No cross-org data access
- org_id never trusted from frontend
- All checks at DB / Edge Function level

Tools Used:
- Supabase Auth
- JWT
- Row Level Security (RLS)
- Edge Functions

--------------------------------------------------------------------

11. NON-FUNCTIONAL REQUIREMENTS
--------------------------------
Performance:
- Whiteboard set load < 2 seconds
- Student app APIs < 1 second

Scalability:
- Single backend → multiple organizations
- Serverless scaling via Supabase

Reliability:
- Stateless whiteboard sessions
- No critical dependency on client storage

Cost:
- Minimal backend infra
- No custom server maintenance

--------------------------------------------------------------------

12. OUT OF SCOPE (INITIAL PHASE)
--------------------------------
- Whiteboard recording
- Live video streaming
- Chat system
- Advanced analytics

--------------------------------------------------------------------

13. MVP PHASE DEFINITION
------------------------
Phase 1 (Core MVP):
- Supabase backend
- Super Admin Panel (basic)
- Org Admin Panel (content + sets)
- Web Whiteboard integration
- Flutter Whiteboard MVP
- Public website (basic)

Phase 2 (Growth):
- Student app full features
- Payments
- Tools marketplace
- Analytics

--------------------------------------------------------------------

14. SUCCESS METRICS
------------------
- Multiple orgs onboard successfully
- Whiteboard used without performance issues
- Students able to purchase & attempt tests
- SEO traffic via public website
- Single backend supporting all modules

====================================================================
END OF MASTER PRD
====================================================================
