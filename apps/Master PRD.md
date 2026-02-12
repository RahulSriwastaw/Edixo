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

2. PLATFORM ARCHITECTURE PRINCIPLES
----------------------------------
System-wide global rules:

- **Backend**: SINGLE (Supabase)
- **Database**: SINGLE
- **Website Codebase**: SINGLE
- **Organizations**: MULTIPLE
- **Domains**: MULTIPLE

**Rule**: Har organization ki apni website aur custom domain support hogi. Ek hi deployment multiple domains ko serve karega.

2. PLATFORM MODULES (HIGH LEVEL)
--------------------------------
Platform 5 major modules me divided hoga:

1. Super Admin Panel (Main Control Center)
2. Organization Admin Panel (Org-level management)
3. Teaching + Mock Test App (Students)
4. Whiteboard App (Desktop / Mobile)
5. Public Website (Multi-tenant Marketing + Blogs)

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

4.5 PUBLIC WEBSITE (Multi-tenant)
----------------------------
Purpose:
Marketing + SEO + tools + downloads for specific organizations.

Core Features:
- SEO pages (Domain dependent)
- Blogs (Platform-global or Org-specific)
- Request resolution based on DOMAIN/HOST
- Lead generation per organization

Important Rule:
Frontend org_id send nahi karega, backend DOMAIN se resolve karega.

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
ADD-ON SECTION – DESIGN SYSTEM & UI/UX ARCHITECTURE
(MERGE INTO EXISTING MASTER PRD – DO NOT CREATE NEW PRD FILE)
====================================================================

IMPORTANT INSTRUCTION
---------------------
Is section ko EXISTING MASTER PRD ke andar add kiya jayega.
Ye platform ke sabhi modules (Super Admin, Org Admin,
Student App, Whiteboard, Public Website) par apply hoga.

Ye document design consistency, UI library selection,
responsiveness aur branding define karta hai.

====================================================================

1. DESIGN PHILOSOPHY
--------------------
Platform ka design:

- Professional
- Clean
- Compact
- SaaS-grade
- Performance optimized
- Consistent across all modules

Primary goals:
- Multi-device responsive
- Minimal clutter
- Clear information hierarchy
- Scalable component system
- Brand-consistent UI

====================================================================

2. GLOBAL COLOR SYSTEM (PROFESSIONAL)
--------------------------------------

Primary Brand Color:
#FF5A1F (Professional SaaS Orange)

Secondary Accent:
#F97316

Background:
#F9FAFB

Card Background:
#FFFFFF

Border Color:
#E5E7EB

Muted Text:
#6B7280

Success:
#16A34A

Warning:
#F59E0B

Error:
#DC2626

Dark Mode (Future Ready):
Background: #0F172A
Card: #1E293B
Text: #F1F5F9

All modules must follow this unified design token system.

====================================================================

3. TYPOGRAPHY SYSTEM
--------------------

Primary Font:
Inter (preferred)
Fallback: Poppins

Heading Scale:
H1 – 28px Bold
H2 – 22px Semibold
H3 – 18px Semibold
Body – 14px Regular
Caption – 12px Muted

Spacing System:
Base spacing unit: 4px
Common spacing:
8px / 12px / 16px / 24px / 32px

Border Radius:
Cards: 16px
Buttons: 12px
Inputs: 10px

Shadow:
Soft SaaS shadow (shadow-md equivalent)

====================================================================

4. UI LIBRARY STACK (ALL PROJECTS)
-----------------------------------

Frontend Web (Super Admin, Org Admin, Website):
- Next.js (App Router)
- Tailwind CSS
- shadcn/ui
- Lucide React Icons
- Framer Motion
- Recharts (analytics)
- React Hook Form (forms)
- Zod (validation)

Mobile App (Student App):
- Flutter (Android-first)
- Material 3 customized with brand theme
- Supabase SDK
- Responsive layout builder

Whiteboard (Native):
- Flutter (Desktop + Android)
- CustomPainter canvas
- Skia rendering
- Supabase SDK

Backend:
- Supabase (Auth + DB + RLS + Edge Functions)

No mixed UI frameworks allowed.
Consistency mandatory.

====================================================================

5. RESPONSIVE DESIGN REQUIREMENTS
----------------------------------

Platform MUST be fully responsive across:

- Desktop (>=1280px)
- Laptop (1024px)
- Tablet (768px)
- Mobile (<=480px)
- Windows Desktop App
- Android Tablet
- Android Phone

Rules:

Desktop:
- Sidebar fixed (240px)
- 3-column card grid

Tablet:
- Sidebar collapsible
- 2-column layout

Mobile:
- Drawer sidebar
- 1-column layout
- Larger touch targets (min 44px height)

Windows Whiteboard:
- Fullscreen-first
- Toolbar floating
- Keyboard shortcuts enabled

Mobile Whiteboard:
- Touch optimized
- Stylus support
- Larger control buttons

====================================================================

6. COMPONENT ARCHITECTURE
--------------------------

All UI must use reusable components:

- Sidebar
- Header
- Card
- Modal
- Drawer
- Data Table
- Form Field
- Badge
- Tabs
- Pagination
- Toast Notification

No inline styling allowed.
All components must follow design tokens.

====================================================================

7. UX PRINCIPLES
----------------

- Clear navigation hierarchy
- No visual clutter
- Consistent spacing
- Soft micro-animations (200ms)
- Loading states for all async calls
- Empty states defined
- Error states defined
- Confirm dialogs for destructive actions

====================================================================

8. DASHBOARD UI STANDARD
-------------------------

All dashboards (Super Admin + Org Admin):

- Page title + subtitle
- Action buttons right aligned
- Card-based summary widgets
- Chart area (optional)
- Data tables with:
    - Search
    - Filters
    - Pagination
    - Status badges

====================================================================

9. WHITEBOARD UI STANDARD
-------------------------

- Minimal interface
- Floating toolbar
- Fullscreen default
- No popups during teaching
- High contrast controls
- Quick access shortcuts

====================================================================

10. WEBSITE UI STANDARD
------------------------

- SEO optimized
- Mobile-first
- Clean typography
- CTA-driven layout
- Fast load (<2 sec)
- Lighthouse score 85+

====================================================================

11. PERFORMANCE REQUIREMENTS
-----------------------------

Web:
- First Contentful Paint < 2s
- Lazy loading images
- Code splitting enabled

Mobile:
- App launch < 2s
- Optimized assets
- Offline cache where needed

Whiteboard:
- 60 FPS drawing
- No lag

====================================================================

12. ACCESSIBILITY REQUIREMENTS
-------------------------------

- Contrast ratio compliant
- Keyboard navigation
- ARIA roles
- Screen reader support (web)

====================================================================

13. MERGE INSTRUCTION
---------------------

This design section must be merged into:

✔ MASTER PRD – under “Platform Standards”
✔ Super Admin PRD – under “UI/UX”
✔ Org Admin PRD – under “UI/UX”
✔ Student App PRD – under “Design System”
✔ Whiteboard PRD – under “UI Standards”
✔ Public Website PRD – under “Design & SEO Standards”

No separate design PRD file to be maintained.

====================================================================
END OF DESIGN SYSTEM ADD-ON
====================================================================

====================================================================
END OF MASTER PRD
====================================================================
