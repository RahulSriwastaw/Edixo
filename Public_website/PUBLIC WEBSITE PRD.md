====================================================================
PUBLIC WEBSITE – PRODUCT REQUIREMENTS DOCUMENT (PRD)
Q-BANK PRO: Global Question Bank Platform
====================================================================
Updated: May 2026 (v2.0 - Dark Theme Migration + Global Q-Bank)

1. PURPOSE
----------
Q-Bank Pro is the PUBLIC FACE of the question banking platform.
The website serves as:
- Marketing & SEO hub for Q-Bank Pro
- User onboarding platform
- Question marketplace
- Educational content hub
- Teacher tools portal

Website Goals:
- Organic SEO traffic for exam-related queries
- User acquisition for Q-Bank platform
- Question pack marketplace
- Trust building among educators
- Premium content monetization

---------------------------------------------------------------

2. TARGET USERS
---------------
Primary Users:
- Teachers & Educators (content creators)
- Coaching center admins
- Schools & institutions
- Student community

Secondary Users:
- Parents
- General visitors (SEO traffic)
- Education consultants

---------------------------------------------------------------

3. CORE OBJECTIVES
-----------------
- Drive teacher signup and Q-Bank adoption
- Marketplace traction (question pack sales)
- SEO rankings for exam-related keywords
- User engagement & retention
- Premium content monetization
- Community building around questions

---------------------------------------------------------------

4. DESIGN SYSTEM (ALL PAGES)
---------------------------
DARK THEME - Professional & Modern:

Colors (from globals.css CSS variables):
- Body background: var(--bg-body) = #0F0F0F (matte black)
- Sidebar background: var(--bg-sidebar) = #141414
- Main content: var(--bg-main) = #111111
- Card/Panel: var(--bg-card) = #1A1A1A
- Card border: 1px solid var(--border-card) = #252525
- Primary accent: var(--accent) = #FF6B2B (orange) with hover #E55A1A
- Primary text: var(--text-primary) = #EFEFEF
- Secondary text: var(--text-secondary) = #888888
- Muted text: var(--text-muted) = #555555
- Input: bg var(--bg-input) = #1A1A1A, border var(--border-input) = #2A2A2A
- Success badge: bg var(--badge-success-bg) = #1A3A1A, text var(--badge-success-text) = #4CAF50
- Error badge: bg var(--badge-error-bg) = #3A1A1A, text var(--badge-error-text) = #F44336
- Info badge: bg var(--badge-info-bg) = #1A2A3A, text var(--badge-info-text) = #2196F3
- Divider: var(--divider) = #1E1E1E
- Card hover shadow: var(--shadow-card-hover) = 0 2px 8px rgba(0,0,0,0.35)

Typography:
- Font: Inter, system-ui, sans-serif (CSS variable: var(--font))
- Page title: 20px / 700
- Card title: 13px / 600
- Card meta: 11px / 400 / muted color
- Button text: 13px / 500
- Nav labels: 13px / 400
- Section headers: 11px uppercase, letter-spacing 0.8px

Visual Density:
- Padding: 12px-14px (30% reduction from original)
- Border radius: 8px (cards), 6px (buttons), 20px (pills)
- NO gradients — all surfaces flat matte
- NO white backgrounds
- NO shadows except: box-shadow 0 2px 8px rgba(0,0,0,0.35) on card hover only
- Line height: 1.5 for all UI text
- Grid gaps: 12px between cards
- Card padding: 12px-14px
- Sidebar nav item height: 38-40px max

Scrollbar:
- Width: 6px
- Track: #2A2A2A
- Thumb: var(--accent) = #FF6B2B

All pages must follow this centralized theme from globals.css

ALL PAGES UPDATED TO DARK THEME (May 2026):
- ✅ Home page (Hero, Features, Stats, CTA)
- ✅ Login/Register page
- ✅ About page
- ✅ Contact page
- ✅ Privacy Policy
- ✅ Terms of Service
- ✅ Download page
- ✅ Dashboard layout
- ✅ Global Question Bank
- ✅ Marketplace
- ✅ My Question Bank
- ✅ Purchased Packs
- ✅ AI Creator page wrapper
- ✅ Navbar (dark themed)
- ✅ Footer (dark themed)
- ✅ Sidebar (dark themed)

CSS Classes Available (from globals.css):
- .db-card: Card with dark background, border, rounded corners
- .db-card-clickable: Clickable card with hover effect
- .btn, .btn-primary, .btn-secondary, .btn-ghost, .btn-sm, .btn-icon
- .pill, .pill-success, .pill-error, .pill-info, .pill-accent, .pill-muted
- .db-input: Form inputs
- .nav-item, .nav-item-active: Navigation items
- .section-header: Section titles (11px uppercase)
- .page-title: Page headings (20px / 700)
- .card-title: Card titles (13px / 600)
- .card-meta: Card metadata (11px / 400 / muted)
- .db-divider: Horizontal divider
- .animate-fade-in: Fade in animation
- .grid-stats: Stats grid (auto-fill, 200px min)
- .grid-cards: Cards grid (auto-fill, 280px min)
- .db-layout, .db-sidebar, .db-main: Dashboard layout
- .db-topbar: Dashboard top bar

---------------------------------------------------------------

5. MAJOR SECTIONS / MODULES
---------------------------

5.1 HOME PAGE
-------------
Sections:
a) Hero Section
   - Main CTA: "Explore Global Q-Bank"
   - Secondary CTA: "Browse Marketplace"
   - Stats: 10k+ questions, 500+ packs, 5k+ users
   - Dark themed background with subtle orange/blue gradient

b) Platform Features (6-card grid)
   - Global Question Bank
   - AI Paper Generator
   - Interactive PDF Studio
   - Question Bank Management
   - Lightning Fast
   - Enterprise Security

c) Stats Section (dark card bg)
   - 10k+ Questions in Library
   - 500+ Question Packs
   - 5k+ Active Users
   - Free Starting Price

d) Call-to-Action Section
   - "Ready to transform your teaching?"
   - Launch Q-Bank Pro button

e) Footer
   - Dark sidebar background
   - Product links (Global Q-Bank, Marketplace, AI Creator, PDF Studio)
   - Company info
   - Legal links

---------------------------------------------------------------

5.2 GLOBAL QUESTION BANK
-------------------------
Route: /dashboard/global-question-bank
Purpose:
- Display all public question packs from super_admin
- Marketplace for question collections
- Browse & purchase functionality

Features:
a) Search & Filtering
   - Full-text search across pack names/descriptions
   - Subject filter (Math, Science, English, SST, Sanskrit, etc.)
   - Difficulty filter (Easy, Medium, Hard)
   - Price range filter
   - Sort by: popularity, rating, newest, price

b) Question Pack Cards
   - Pack name & description (truncated)
   - Question count
   - Subject badge
   - Rating (stars & count)
   - Download count
   - Price & "Buy" button

c) Pack Detail View
   - Full description
   - Creator name
   - Question preview list (first 5)
   - Individual question difficulty indicators
   - Purchase button with price

d) Access Control
   - Non-logged: Browse only (limited preview)
   - Logged users: Full view + purchase
   - Purchased users: Can view all questions + use in own sets

Data pulled from super_admin's question bank via API:
- Super Admin manages questions from /question-bank/ in super_admin
- Public website fetches from: /api/user-qbank/marketplace
- Questions uploaded by super admin appear in Global Q-Bank
- Packs created in super_admin appear in Marketplace

API Endpoints:
- GET  /user-qbank/marketplace - list all packs
- GET  /user-qbank/marketplace/:packId - pack details
- GET  /user-qbank/marketplace/:packId/questions - view questions
- POST /user-qbank/marketplace/:packId/purchase - buy pack
- POST /user-qbank/purchase/:packId - alternative purchase

---------------------------------------------------------------

5.3 MY QUESTION BANK (UPDATED)
-------------------------------
Tabs:
a) Personal Packs
   - User's own created packs
   - Can EDIT questions
   - Can DELETE entire pack
   - Can make pack public → marketplace

b) Purchased Content
   - Question packs user bought from marketplace
   - Can EDIT questions for personal use
   - CANNOT DELETE questions from marketplace packs

---------------------------------------------------------------

5.4 MARKETPLACE
---------------
Route: /dashboard/marketplace
- Browse & add global question packs
- Purchase tracking
- Pagination (18 per page)
- Sort: Popular, Newest, Name A-Z
- Search & subject filter

---------------------------------------------------------------

5.5 DASHBOARD
-------------
Route: /dashboard
- User hub
- Stats cards (My Packs, My Questions, Purchased Packs, Marketplace)
- Quick Actions (Create Pack, Browse Marketplace, AI Generator)
- Featured Packs from marketplace

---------------------------------------------------------------

5.6 AUTHENTICATION PAGES
------------------------
Route: /login
- Dark themed (no light backgrounds)
- Login / Sign Up toggle
- Email/password authentication
- CSS variables used throughout
- Linked to AuthContext

---------------------------------------------------------------

5.7 TOOLS SECTION
-----------------
Route: /tools/creator, /tools/pdf-studio, /tools/ppt-studio, /tools/refine
- Wrapped in dark themed layout
- Contains CreatorDashboard component (which has its own light theme internally)

---------------------------------------------------------------

5.8 STATIC PAGES (All Dark Themed)
-----------------------------------
- /about - Platform info
- /contact - Contact form
- /privacy - Privacy policy
- /terms - Terms of service
- /blog - Blog listing
- /download - App downloads (Whiteboard)

---------------------------------------------------------------

6. API INTEGRATION
------------------
Base URL: http://localhost:4000/api (from NEXT_PUBLIC_API_URL env variable)
Auth: Bearer token via document.cookie (token)

Key Endpoints:

Question Bank:
- GET  /user-qbank/marketplace - list all packs
- GET  /user-qbank/marketplace/:id - pack details
- GET  /user-qbank/marketplace/:id/questions - view questions
- GET  /user-qbank/dashboard - dashboard stats
- POST /user-qbank/purchase/:packId - buy pack

User Packs:
- GET  /user-qbank/my-packs - list user's packs
- POST /user-qbank/my-packs - create new pack
- DELETE /user-qbank/my-packs/:id - delete pack

Purchased Content:
- GET /user-qbank/purchased - user's purchased packs
- DELETE /user-qbank/purchased/:id - remove from library

Questions:
- GET  /user-qbank/my-packs/:packId/questions
- POST /user-qbank/my-packs/:packId/questions
- PATCH /user-qbank/my-packs/:packId/questions/:id
- DELETE /user-qbank/my-packs/:packId/questions/:id

---------------------------------------------------------------

7. AUTHENTICATION & AUTHORIZATION
----------------------------------
- JWT token stored in cookie
- AuthContext.js handles state
- Public pages: no auth required
- Dashboard pages: auth required
- Purchase: auth required

---------------------------------------------------------------

8. VERSION HISTORY
------------------
v1.0 - May 2024: Initial Q-Bank Pro launch
v2.0 - May 2026:
  - Complete dark theme migration for ALL pages
  - Centralized CSS variables in globals.css
  - Removed light theme hardcoded colors from all public pages
  - Global Question Bank connected to super_admin question data
  - New Dashboard navigation (Global Q-Bank, Marketplace, My Q-Bank)
  - Consistent card/button/input styling across all pages
  - Updated Footer with dark theme and correct links
  - Removed mokebook/Institute references
  - Fade-in animations and responsive grid

====================================================================
END OF PUBLIC WEBSITE PRD
====================================================================