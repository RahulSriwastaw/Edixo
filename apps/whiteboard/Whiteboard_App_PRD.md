====================================================================
WHITEBOARD APP – PRODUCT REQUIREMENTS DOCUMENT (PRD)
(Desktop / Mobile Teaching Software)
====================================================================

1. PURPOSE
----------
Whiteboard App ek PROFESSIONAL TEACHING TOOL hoga
jo teachers ko classroom / online teaching ke liye diya jaayega.

Iska kaam:
- PPT / PDF / Question sets ko load karna
- Digital board par explain karna
- Students ke liye content create karna NAHI
- Recording / video banana NAHI

Whiteboard ek SEPARATE SOFTWARE hoga,
lekin central backend (Supabase) se connected rahega.

---------------------------------------------------------------

2. TARGET USERS
---------------
Primary Users:
- teacher
- org_admin (optional teaching role)

Secondary Users:
- demo users (limited access)

Excluded Users:
- student
- guest (no real teaching access)

---------------------------------------------------------------

3. SUPPORTED PLATFORMS
----------------------
Primary (PRO Whiteboard):
- Windows Desktop (Flutter Native)
- Android Tablet (Flutter Native)

Secondary (Already Built):
- Web Whiteboard (React based, limited features)

Flutter Web explicitly OUT OF SCOPE.

---------------------------------------------------------------

4. ACCESS & LOGIN MODEL
-----------------------
Whiteboard App me LOGIN mandatory hoga
taaki organization-level control enforce ho sake.

Login Method:
- Email + Password (Supabase Auth)
- Org-bound access (org_id backend se)

Access Levels:
- Guest:
  - Blank whiteboard
  - Limited pen tools
- Logged-in Teacher:
  - Full teaching features
  - Set ID access
- Org Admin:
  - Same as teacher (optional override)

---------------------------------------------------------------

5. CORE FUNCTIONAL FLOW
-----------------------

5.1 LOGIN FLOW
--------------
- App open
- Login screen
- Supabase authentication
- JWT token receive
- Role + org resolve
- Features unlock

---------------------------------------------------------------

5.2 SET ID + PASSWORD FLOW (CORE FEATURE)
-----------------------------------------
Purpose:
- Secure teaching content access

Flow:
- Teacher enters Set ID
- Teacher enters Password
- App calls Supabase Edge Function
- Backend verifies:
  - Set exists
  - Org match
  - Password hash
  - Expiry
- Content metadata returned
- PPT / Questions loaded

Rules:
- Whiteboard NEVER directly queries DB
- Password verification ONLY backend side

---------------------------------------------------------------

6. CONTENT TYPES SUPPORTED
--------------------------
Whiteboard sirf CONTENT CONSUME karega.

Supported:
- PPT (converted to PDF / images)
- PDF
- Question sets:
  - MCQ
  - Theory
  - Mixed

Not Supported:
- Video
- Audio
- Live student interaction

---------------------------------------------------------------

7. TEACHING CANVAS & TOOLS
--------------------------
Drawing Layer:
- Pen
- Eraser
- Color picker
- Stroke size
- Undo / Redo
- Clear board

Canvas Rules:
- Content layer (PPT/PDF) separate
- Drawing layer overlay
- Page change par drawing auto-clear (configurable)

Performance Target:
- 60 FPS drawing
- Zero noticeable lag
- Stylus + touch + mouse support

---------------------------------------------------------------

8. QUESTION TEACHING MODE
-------------------------
Features:
- One question at a time
- Question navigation:
  - Next / Previous
  - Jump to number
- Answer hidden by default
- “Show Answer” toggle
- Optional timer display

---------------------------------------------------------------

9. OFFLINE MODE (NATIVE ONLY)
-----------------------------
- Set ek baar load ho jaaye to
  internet disconnect hone par bhi
  teaching continue ho sake

Rules:
- Offline only for already loaded sets
- No new set access offline
- No sync after session

---------------------------------------------------------------

10. DATA HANDLING & STORAGE
---------------------------
Whiteboard session data:
- RAM / local memory only
- App close = data destroyed

Backend:
- ❌ No stroke save
- ❌ No screenshot save
- ❌ No session history

---------------------------------------------------------------

11. SECURITY REQUIREMENTS
-------------------------
- Supabase JWT required for access
- Role-based feature gating
- Org-bound access mandatory
- Max failed attempts on Set ID
- Optional set expiry enforcement

---------------------------------------------------------------

12. BACKEND DEPENDENCIES
------------------------
Whiteboard depends on backend for:
- Authentication
- Role resolution
- Set verification
- Content metadata

Backend Tech:
- Supabase Auth
- Supabase RLS
- Supabase Edge Functions

---------------------------------------------------------------

13. UI / UX PRINCIPLES
----------------------
Design Goals:
- Minimal
- Distraction-free
- Teaching-focused
- Fullscreen first

UX Rules:
- Floating toolbar
- One-click navigation
- No popups during teaching
- Dark / light theme (optional)

---------------------------------------------------------------

14. OUT OF SCOPE (EXPLICIT)
---------------------------
- Recording (screen / audio)
- Cloud save
- Student chat
- Analytics
- Video conferencing

---------------------------------------------------------------

15. MVP DELIVERABLES
--------------------
Phase 1 (MVP):
- Login
- Set ID access
- PPT/PDF rendering
- Basic drawing tools
- Question mode
- Offline support (native)

Phase 2 (Enhancements):
- Shapes
- Laser pointer
- Multi-board tabs
- Configurable shortcuts

---------------------------------------------------------------

16. SUCCESS CRITERIA
-------------------
- Teacher can teach without lag
- Secure content access via Set ID
- Same backend supports:
  - Web whiteboard
  - Flutter whiteboard
- Zero recording / storage risk
- Works reliably in real classrooms

====================================================================
END OF WHITEBOARD APP PRD
====================================================================
