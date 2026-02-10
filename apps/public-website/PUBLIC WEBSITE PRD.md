====================================================================
PUBLIC WEBSITE – PRODUCT REQUIREMENTS DOCUMENT (PRD)
(Marketing + Blogs + SEO + Tools)
====================================================================

1. PURPOSE
----------
Public Website platform ka PUBLIC FACE hoga.
Is website ka role sirf information dena nahi,
balki TRAFFIC, TRUST aur USERS generate karna hoga.

Website ke through:
- Platform ka branding hoga
- SEO traffic aayega
- Blogs publish honge
- Free / paid educational tools milenge
- Whiteboard app ka download hoga
- Student app ke liye users funnel honge

---------------------------------------------------------------

2. TARGET USERS
---------------
Primary Users:
- Students (exam aspirants)
- Teachers (platform explore karne ke liye)

Secondary Users:
- Parents
- General visitors (SEO traffic)

Excluded Users:
- Direct teaching / admin users

---------------------------------------------------------------

3. CORE OBJECTIVES
-----------------
- High SEO performance
- Fast page load
- Trust building
- Lead generation
- App installs (Student App + Whiteboard)

---------------------------------------------------------------

4. MAJOR SECTIONS / MODULES
---------------------------

4.1 HOME PAGE
-------------
Features:
- Platform overview
- Key highlights:
  - Multi-coaching platform
  - Mock tests
  - Whiteboard teaching
- CTA buttons:
  - Download Student App
  - Download Whiteboard
  - Explore Courses

---------------------------------------------------------------

4.2 BLOGS & CONTENT HUB
-----------------------
Purpose:
- SEO traffic
- Exam-related content

Features:
- Blog listing page
- Category-wise blogs
- Blog detail page
- SEO fields:
  - Meta title
  - Meta description
  - Slug
- Draft / publish system

Access Rules:
- WRITE access: Super Admin only
- READ access: Public

---------------------------------------------------------------

4.3 FREE & PAID TOOLS
---------------------
Purpose:
- Daily-use educational tools
- Traffic retention
- Monetization (future)

Examples:
- PDF tools
- Exam calculators
- Rank predictors
- Name generators
- Current affairs tools

Features:
- Tool listing
- Tool detail page
- Access type:
  - Free
  - Paid (future)

---------------------------------------------------------------

4.4 COURSE DISCOVERY (PUBLIC)
------------------------------
Features:
- Public course listing
- Free courses highlighted
- Paid courses preview
- CTA:
  - Open Student App
  - Login to enroll

Important Rule:
- No direct course consumption on website

---------------------------------------------------------------

4.5 WHITEBOARD APP DOWNLOAD
----------------------------
Features:
- Whiteboard app landing page
- Download links:
  - Windows
  - Android
- System requirements
- Installation guide (basic)

Controlled by:
- Super Admin Panel

---------------------------------------------------------------

4.6 SEO PAGES & LANDING PAGES
------------------------------
Features:
- Exam-specific landing pages
- Location-based pages (optional)
- Static SEO pages:
  - About
  - Contact
  - Privacy Policy
  - Terms

SEO Control:
- Slugs
- Meta data
- Index / no-index flags

---------------------------------------------------------------

5. CONTENT MANAGEMENT RULES
---------------------------
- Blog & SEO content controlled centrally
- Organization Admin / Teacher:
  ❌ No access
- All content served via backend APIs

---------------------------------------------------------------

6. BACKEND INTEGRATION
----------------------
Backend: Supabase

Used Entities:
- blogs
- seo_pages
- tools
- public_courses

Rules:
- Public users → read-only access
- Write operations → super_admin only
- RLS enforced

---------------------------------------------------------------

7. UI / UX PRINCIPLES
---------------------
Design Goals:
- Clean
- Trustworthy
- Fast
- Mobile-first

UX Rules:
- Minimal popups
- Clear CTAs
- Simple navigation
- Breadcrumbs for SEO

---------------------------------------------------------------

8. NON-FUNCTIONAL REQUIREMENTS
-------------------------------
Performance:
- Page load < 2 seconds
- Lighthouse score 85+

Scalability:
- Handle high SEO traffic
- CDN-friendly structure

Reliability:
- Stateless frontend
- Backend-driven content

---------------------------------------------------------------

9. OUT OF SCOPE
---------------
- Teaching activities
- Student dashboards
- Payments (initial phase)
- Community forums

---------------------------------------------------------------

10. MVP DELIVERABLES
--------------------
Phase 1 (MVP):
- Home page
- Blog system
- Whiteboard download page
- Free tools section
- Static SEO pages

Phase 2 (Growth):
- Paid tools
- Advanced SEO landing pages
- Lead capture forms
- Newsletter

---------------------------------------------------------------

11. SUCCESS CRITERIA
-------------------
- Consistent organic traffic growth
- High app download conversion
- Low bounce rate
- Website acts as main traffic funnel

====================================================================
END OF PUBLIC WEBSITE PRD
====================================================================
