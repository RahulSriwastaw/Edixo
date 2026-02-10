====================================================================
STUDENT APP – PRODUCT REQUIREMENTS DOCUMENT (PRD)
(Teaching + Mock Test Combined Mobile App)
====================================================================

1. PURPOSE
----------
Student App ka purpose ek SINGLE, EASY-TO-USE mobile app dena hai
jahan students:

- Free aur paid courses access kar saken
- Practice tests aur mock tests de saken
- Apna progress aur results dekh saken

Ye app MULTI-ORGANIZATION platform ka part hogi,
lekin student ke liye experience SIMPLE aur UNIFIED rahega.

---------------------------------------------------------------

2. TARGET USERS
---------------
Primary Users:
- student (exam aspirants)

Secondary Users:
- guest users (limited free content)

Excluded Users:
- teacher
- org_admin
- super_admin

---------------------------------------------------------------

3. SUPPORTED PLATFORMS
----------------------
Phase 1:
- Android Mobile App

Phase 2 (Future):
- iOS App
- Web App (read-only)

---------------------------------------------------------------

4. ACCESS & AUTHENTICATION
--------------------------
Login Methods:
- Email + Password (Supabase Auth)
- OTP / Social login (future)

Guest Mode:
- Allowed (free content only)

Authorization:
- Student role enforced
- Org-based content isolation via backend

---------------------------------------------------------------

5. CORE USER FLOWS
------------------

5.1 ONBOARDING FLOW
-------------------
- App install
- Welcome screen
- Login / Signup
- Optional guest continue
- Course discovery screen

---------------------------------------------------------------

5.2 COURSE DISCOVERY FLOW
-------------------------
Features:
- Browse courses
- Filter by:
  - Exam type
  - Free / Paid
  - Organization (optional)
- Course detail page:
  - Description
  - Syllabus
  - Price (if paid)

---------------------------------------------------------------

5.3 COURSE ACCESS FLOW
---------------------
Free Course:
- Instant access after login

Paid Course:
- Purchase required
- Backend validates subscription
- Course unlocked

---------------------------------------------------------------

5.4 LEARNING CONTENT FLOW
-------------------------
Supported Content:
- Recorded classes (future)
- PDFs / notes
- Practice questions
- Tests

Rules:
- Student sirf enrolled course content dekhega
- Download restrictions backend se enforced

---------------------------------------------------------------

5.5 TEST & MOCK FLOW
-------------------
Test Types:
- Practice tests
- Full mock tests

Features:
- Timer-based test
- Question navigation
- Auto-submit on time expiry
- Result screen:
  - Score
  - Correct / wrong answers
  - Basic analysis

---------------------------------------------------------------

6. CORE FEATURES
----------------

6.1 DASHBOARD
-------------
- Enrolled courses
- Upcoming tests
- Recent scores

---------------------------------------------------------------

6.2 TEST ENGINE
---------------
- MCQ support (mandatory)
- Theory questions (future)
- Auto evaluation
- Negative marking (configurable)

---------------------------------------------------------------

6.3 RESULTS & HISTORY
---------------------
- Test attempt history
- Score trends (basic)
- Attempt date & duration

---------------------------------------------------------------

6.4 NOTIFICATIONS (FUTURE)
-------------------------
- New course launch
- Test reminders
- Results available

---------------------------------------------------------------

7. BACKEND INTEGRATION
----------------------
Backend: Supabase

Used Services:
- Auth (student login)
- Database (courses, tests, attempts)
- RLS (data isolation)
- Edge Functions (secure test submit)

Key Entities:
- students
- courses
- enrollments
- tests
- questions
- test_attempts

---------------------------------------------------------------

8. SECURITY & DATA RULES
------------------------
- Student cannot access:
  - Teacher content
  - Whiteboard sets
- No cross-org content leakage
- Test answers validated server-side
- Time manipulation blocked via backend checks

---------------------------------------------------------------

9. UI / UX PRINCIPLES
---------------------
Design Goals:
- Simple
- Mobile-first
- Fast navigation
- Low cognitive load

UX Rules:
- Bottom navigation
- Clear CTAs
- Minimal distractions during test

---------------------------------------------------------------

10. NON-FUNCTIONAL REQUIREMENTS
--------------------------------
Performance:
- App launch < 2 seconds
- Test submit < 1 second

Scalability:
- 100k+ students
- Concurrent test attempts supported

Reliability:
- Auto-save answers locally (during test)
- Graceful recovery on app crash

---------------------------------------------------------------

11. OUT OF SCOPE (INITIAL PHASE)
--------------------------------
- Live classes
- Chat / discussion
- Advanced analytics
- Gamification

---------------------------------------------------------------

12. MVP DELIVERABLES
--------------------
Phase 1 (MVP):
- Student login / signup
- Course listing (free / paid)
- Test engine (MCQ)
- Result screen
- Basic dashboard

Phase 2 (Growth):
- Payments
- Recorded videos
- Notifications
- Analytics

---------------------------------------------------------------

13. SUCCESS CRITERIA
-------------------
- Students can:
  - Discover courses easily
  - Attempt tests without lag
  - View results clearly
- Backend successfully enforces:
  - Access control
  - Test integrity
- App usable on low-end Android devices

====================================================================
END OF STUDENT APP PRD
====================================================================
