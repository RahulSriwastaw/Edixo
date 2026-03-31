# PRD-WB-01 — EduBoard Pro: EduHub Interactive Whiteboard
**Version:** 2.2  
**Date:** 2026-03-31  
**Status:** ✅ Ready for AI IDE Development  
**Platform:** Flutter (Desktop + Tablet)  
**Codename:** EduBoard Pro  
**Backend Status:** ✅ Already Developed — Whiteboard ko sirf connect karna hai  
**Admin Panel Status:** ✅ Already Connected to Backend  

---

> ### 📌 AI IDE Developer — Read This First
> 
> This PRD is written specifically for AI-assisted development using **Flutter + Dart**.
> Every section contains:
> - **WHAT to build** — feature description
> - **HOW to build** — Flutter widget/package/approach
> - **Dart code hints** — snippets where needed
> - **Testsprite task** — what to test after building
>
> **Rule:** After completing each feature → run **Testsprite** → fix all bugs → then move to next feature. Zero bugs policy.
>
> ### 🔗 Backend Connection Status
> ```
> ✅ Backend API    : Already fully developed (Node.js + Express + Prisma + PostgreSQL)
> ✅ Admin Panel    : Already connected to backend
> ⬜ Whiteboard     : Connect karna hai — sirf Flutter API calls likhni hain
>
> Whiteboard ka kaam:
>   1. Questions load karo  → POST /whiteboard/validate-set + GET /whiteboard/sets/:id/questions
>   2. Session shuru karo   → POST /whiteboard/session/start  (returns sessionId)
>   3. Auto-save karo       → PUT  /whiteboard/session/:sessionId  (har 30s + dirty)
>   4. Class end karo       → POST /whiteboard/session/:sessionId/end
>   5. PDF upload karo      → POST /whiteboard/session/:sessionId/upload-pdf
> ```
>
> **Testing Credentials (use these to test live API):**
> ```
> SET_ID      : 505955
> PASSWORD    : 287051
> API_BASE    : https://api.eduhub.in/api/v1
> AUTH        : Teacher JWT (login first → store in flutter_secure_storage)
> ```

---

## 🚨 SECTION 0 — AI IDE Ko Paste Karne Se Pehle Yeh Padho (MANDATORY)

> **Yeh section specifically AI IDE (Cursor / Windsurf / GitHub Copilot) ke liye likha gaya hai.**
> Agar tum AI IDE me is PRD ko paste kar rahe ho toh **pehle yeh poora section padho aur execute karo.**

---

### 0.1 — Is PRD Ko AI IDE Me Kaise Use Karo

```
STEP 1:  Apna existing whiteboard Flutter project AI IDE me kholo
STEP 2:  Is puri PRD file ka content copy karo
STEP 3:  AI IDE me ek naya chat/prompt window kholo
STEP 4:  Paste karo aur niche likha prompt add karo:

─────────────────────────────────────────────────────────────────
"Yeh mera EduBoard Pro whiteboard ka PRD hai. 
Mera whiteboard already partially develop ho chuka hai.

Pehle SECTION 0.2 ke instructions follow karo:
  - Already developed code ka audit karo
  - PRD me jo features/options NAHI hain unhe REMOVE karo
  - Phir PRD ke according jo missing hai usse develop karo

Ek ek section uthao, pehle cleanup karo, phir develop karo.
Har feature ke baad Testsprite se test karo."
─────────────────────────────────────────────────────────────────

STEP 5:  AI IDE shuru karega — Section 0.2 ke cleanup instructions follow karega
STEP 6:  Ek phase complete hone ke baad Testsprite run karo → bugs fix karo → next phase
```

---

### 0.2 — CLEANUP FIRST: Already Developed Code Se Extra Cheezein Remove Karo

> **AI IDE INSTRUCTION — MANDATORY STEP:**
> Pehle existing codebase scan karo. Jo bhi features, widgets, buttons, options, screens,
> ya tools already develop hue hain lekin **is PRD me mention NAHI hain** — unhe **REMOVE karo**.
> Sirf wahi rakho jo is PRD ke sections 1–28 me clearly defined hai.

#### 0.2.1 — Removal Checklist (AI IDE yeh sab check kare)

AI IDE ko existing code me yeh sab dhundhna hai aur **PRD se match** karna hai:

**SCREENS — Sirf yeh screens honi chahiye:**
```
✅ RAKHO:   LoginScreen
✅ RAKHO:   WhiteboardScreen (main screen)
✅ RAKHO:   SetImportDialog (popup/dialog)
✅ RAKHO:   EndClassDialog (popup/dialog)
✅ RAKHO:   SettingsScreen
❌ HATAO:   Koi bhi aur screen jo PRD me mention nahi — jaise DashboardScreen,
            HomeScreen, StudentScreen, ReportScreen, etc.
```

**TOOLBARS — Sirf yeh toolbars honi chahiye:**
```
✅ RAKHO:   TopBar (48px — title, save status, class timer, end class)
✅ RAKHO:   BottomMainToolbar (56px — pinned tools max 10)
✅ RAKHO:   LeftSideToolbar (56px wide, auto-hide)
✅ RAKHO:   ToolLibraryDrawer (left-side slide-out panel)
✅ RAKHO:   SlidePanelDrawer (right-side thumbnails)
❌ HATAO:   Koi bhi extra toolbar / floating menu / popup toolbar jo PRD me nahi
```

**TOOLS — Sirf yeh tools hone chahiye (Tool enum):**
```
✅ RAKHO (Writing):   softPen, hardPen, highlighter, chalk, calligraphy, spray, laserPointer
✅ RAKHO (Erasing):   softEraser, hardEraser, objectEraser, areaEraser
✅ RAKHO (Shapes):    line, arrow, doubleArrow, rectangle, roundedRect, circle,
                      triangle, star, polygon, callout
✅ RAKHO (Text):      textBox, stickyNote
✅ RAKHO (Selection): select, navigate
✅ RAKHO (Special):   magicPen, eyedropper
❌ HATAO:   Koi bhi aur tool jo is list me nahi — jaise freeformLasso, cropTool,
            vectorPen, brushPen (agar calligraphy se alag hai), etc.
```

**CANVAS LAYERS — Sirf yeh layers honi chahiye:**
```
✅ RAKHO:   BackgroundLayer    (color ya image)
✅ RAKHO:   SlideContentLayer  (question + options — read-only)
✅ RAKHO:   AnnotationLayer    (teacher drawings — CustomPainter)
✅ RAKHO:   MathToolOverlay    (ruler, protractor, compass)
✅ RAKHO:   UIOverlayLayer     (spotlight, screen cover, zoom lens, AI panel)
❌ HATAO:   Koi aur layer jo PRD me mention nahi
```

**UI OVERLAYS — Sirf yeh overlays honi chahiye:**
```
✅ RAKHO:   SpotlightOverlay
✅ RAKHO:   ScreenCoverOverlay
✅ RAKHO:   ZoomLensOverlay
✅ RAKHO:   NavigationMapWidget
✅ RAKHO:   AiAssistantPanel
✅ RAKHO:   LaserPointerOverlay
✅ RAKHO:   FloatingAnnotationBar (annotation mode only)
❌ HATAO:   Koi bhi extra overlay — jaise ColorOverlay, GridOverlay (agar 
            separately implemented hai), AnnotationModeOverlay (agar duplicate hai), etc.
```

**COLOR PICKER — Exact 5 tabs hone chahiye, koi zyada nahi:**
```
✅ RAKHO:   Tab 1 — Question Color
✅ RAKHO:   Tab 2 — Question Background Color
✅ RAKHO:   Tab 3 — Option Color
✅ RAKHO:   Tab 4 — Option Background Color
✅ RAKHO:   Tab 5 — Screen Background Color
❌ HATAO:   Koi aur color tab — jaise "Answer Color", "Timer Color", "Badge Color", etc.
            Sirf yahi 5 tabs. Baaki color options agar koi hain to remove karo.
```

**SUBJECT MODES — Sirf yeh 7 modes:**
```
✅ RAKHO:   general, math, physics, chemistry, englishHindi, sscRailway, upsc
❌ HATAO:   Koi aur mode — jaise biology, economics, computerScience, etc.
```

**MATH TOOLS — Sirf yeh math tools:**
```
✅ RAKHO:   Ruler, Protractor, Compass, FunctionPlotter, FormulaLibrary
❌ HATAO:   Koi aur math tool — jaise VectorDrawer, MatrixTool, StatsTool, etc.
```

**TEACHING TOOLS — Sirf yeh:**
```
✅ RAKHO:   Spotlight, ScreenCover, ZoomLens, CountdownTimer, Stopwatch,
            ClassSessionTimer, RandomPicker, Dice, NavigationMap
❌ HATAO:   Koi aur teaching tool — jaise PollWidget, VotingTool, 
            StudentResponseTool, BreakTimer, etc.
```

**EXPORT OPTIONS — Sirf yeh:**
```
✅ RAKHO:   PDF Export (local download)
✅ RAKHO:   PNG ZIP Export
✅ RAKHO:   Cloud Upload (PDF → server via API)
❌ HATAO:   PPTX export (Flutter me native support nahi)
❌ HATAO:   GIF export
❌ HATAO:   Video export
❌ HATAO:   DOCX export
❌ HATAO:   Print option (agar koi special print button hai)
            (Printing package se sirf PDF share karo)
```

**APP MODES — Sirf yeh 5 modes:**
```
✅ RAKHO:   whiteboardFree, slideMode, annotationFloat, presentationClean, preparationEdit
❌ HATAO:   Koi aur mode — jaise collaborationMode, studentViewMode, reviewMode, etc.
```

**BOTTOM TOOLBAR — Strict rules:**
```
✅ RAKHO:   Max 10 tool slots (customizable by teacher)
✅ RAKHO:   Color picker (always visible, slot 0, non-removable)
✅ RAKHO:   Undo / Redo buttons
✅ RAKHO:   [+ Tool Library] button
✅ RAKHO:   [End Class] button
❌ HATAO:   Koi aur fixed button — jaise share, settings shortcut, zoom, etc.
            Agar koi extra button hai toolbar me jo PRD me nahi → REMOVE
```

**TOP BAR — Sirf yeh elements:**
```
✅ RAKHO:   [≡ Menu button]
✅ RAKHO:   [Set Title / Mode indicator]
✅ RAKHO:   [Slide X/Y counter] (slide mode me)
✅ RAKHO:   [Offline badge] (conditional)
✅ RAKHO:   [Save Status indicator] (●unsaved / spinning / ✓saved / ⚠failed)
✅ RAKHO:   [Class Session Timer]
✅ RAKHO:   [End Class button]
❌ HATAO:   Koi aur top bar element — jaise share button, record button,
            student count, notification bell, etc.
```

**SLIDE PANEL (Right Side) — Sirf yeh:**
```
✅ RAKHO:   Thumbnail list (scrollable)
✅ RAKHO:   Active slide highlight (orange border)
✅ RAKHO:   Tap to navigate
✅ RAKHO:   Drag to reorder
✅ RAKHO:   Right-click context menu (insert blank, delete slide)
✅ RAKHO:   Collapse/expand toggle
❌ HATAO:   Koi aur slide panel feature — jaise slide notes panel, 
            presenter view, slide zoom, etc.
```

**SUBJECT TOOL OVERLAYS — Jo rakha jayega:**
```
✅ RAKHO:   RulerWidget (draggable, rotatable)
✅ RAKHO:   ProtractorWidget (semicircle, rotatable)
✅ RAKHO:   CompassWidget (pivot + arm, draws circle)
✅ RAKHO:   PeriodicTableDialog (full screen dialog)
✅ RAKHO:   CircuitSymbolLibrary (SVG symbols placed on canvas)
✅ RAKHO:   IndiaMapOverlay (SVG India map dialog)
❌ HATAO:   Koi aur science/math overlay — jaise oscilloscope, 
            molecule 3D viewer, DNA helix, etc.
```

**SETTINGS SCREEN — Sirf yeh settings:**
```
✅ RAKHO:   Theme (dark only — no light mode toggle in v1)
✅ RAKHO:   Font size (canvas text default size)
✅ RAKHO:   Keyboard shortcut reference (read-only list)
✅ RAKHO:   Toolbar reset to default
✅ RAKHO:   Teacher profile info (name, org — read-only)
✅ RAKHO:   Logout
❌ HATAO:   Koi aur setting — jaise notification settings, language toggle
            (sirf Hindi/English bilingual UI already hai), cloud sync toggle,
            student access settings, etc.
```

---

#### 0.2.2 — Removal Process AI IDE Follow Kare

```
AI IDE ko yeh steps follow karne hain existing code pe:

STEP 1:  SCAN — List karo: kaun sa widget/screen/feature already bana hai
STEP 2:  COMPARE — Match karo: Section 0.2.1 ki checklist se
STEP 3:  IDENTIFY — Mark karo: Jo PRD me nahi hai = REMOVE list
STEP 4:  CONFIRM — (Internal check only, aage badho)
STEP 5:  REMOVE — Delete karo:
           - File puri hatao agar poora file extra hai
           - Specific widget/function hatao agar partially extra hai
           - Toolbar button hatao agar extra button hai
           - Menu item hatao agar extra option hai
           - Import/export karo cleanup ke baad dead code hata do
STEP 6:  VERIFY — App run karo → koi compile error nahi hona chahiye
STEP 7:  TESTSPRITE — cleanup ke baad ek baar run karo → fix errors
STEP 8:  PROCEED — Ab PRD ke sections ke according development/improvement shuru karo
```

---

#### 0.2.3 — Kya NAHI Hatana (Important Safeguards)

```
❌ MAT HATAO:  Koi bhi existing working canvas drawing code (strokes, painter)
❌ MAT HATAO:  Koi bhi API connection jo already working hai
❌ MAT HATAO:  Hive / local storage initialization code
❌ MAT HATAO:  Auth / JWT code
❌ MAT HATAO:  Backend se already connected koi bhi feature
❌ MAT HATAO:  flutter_secure_storage / dio client setup
❌ MAT HATAO:  Koi bhi Riverpod provider jo core state manage kar raha hai
❌ MAT HATAO:  Test files (integration_test/) — sirf update karo

RULE: Agar doubt ho ki hatana chahiye ya nahi → PRD sections 1–28 me dhundho.
      Hai → RAKHO.  Nahi → HATAO.
```

---

### 0.3 — Baad Me: Development Order (Cleanup ke baad)

```
Cleanup complete hone ke baad PRD ke phases follow karo:

Phase 1  → Foundation (canvas, painter, basic tools)     → Section 7, 8, 9
Phase 2  → Pen & Eraser tools (7 pens, 4 erasers)        → Section 8, 9
Phase 3  → Shape & Text tools                             → Section 10, 11, 12
Phase 4  → Tool Library (drawer, pin, profiles)           → Section 13
Phase 5  → Set ID Import (LIVE BACKEND — 505955/287051)   → Section 4, 15
Phase 6  → Color Customization & Backgrounds              → Section 16
Phase 7  → Auto-Save & Session (server + Hive)            → Section 4.4, 17
Phase 8  → End Class + PDF + Cloud Upload                 → Section 4.5, 18
Phase 9  → Teaching Tools (spotlight, cover, zoom, timer) → Section 19
Phase 10 → Subject Tools (math, physics, chemistry)       → Section 14
Phase 11 → Multimedia + AI Assistant                      → Section 20, 22
Phase 12 → Gestures, Keyboard, Offline                    → Section 23, 24
Phase 13 → Final cleanup + Testsprite 100% pass           → Section 25

RULE: Har phase ke baad → Testsprite → 0 bugs → next phase
```

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack & Flutter Architecture](#2-tech-stack--flutter-architecture)
3. [Folder Structure](#3-folder-structure)
4. [Backend Integration — Real API Connection](#4-backend-integration--real-api-connection)
5. [UI/UX Design System](#5-uiux-design-system)
6. [App Layout & Navigation](#6-app-layout--navigation)
7. [Canvas Engine — Core Drawing](#7-canvas-engine--core-drawing)
8. [Pen & Writing Tools](#8-pen--writing-tools)
9. [Eraser Tools](#9-eraser-tools)
10. [Shape Tools](#10-shape-tools)
11. [Text Tools](#11-text-tools)
12. [Selection & Object Manipulation](#12-selection--object-manipulation)
13. [Tool Library System](#13-tool-library-system)
14. [Subject-Specific Tool Modes](#14-subject-specific-tool-modes)
15. [Set ID Import — PPT Slide Mode](#15-set-id-import--ppt-slide-mode)
16. [Slide Color Customization](#16-slide-color-customization)
17. [Auto-Save & Session Management](#17-auto-save--session-management)
18. [End Class — PDF Export & Cloud Upload](#18-end-class--pdf-export--cloud-upload)
19. [Advanced Teaching Tools](#19-advanced-teaching-tools)
20. [Multimedia & Resource Bank](#20-multimedia--resource-bank)
21. [Desktop Annotation Mode](#21-desktop-annotation-mode)
22. [AI Assistant (Claude API)](#22-ai-assistant-claude-api)
23. [Gesture & Keyboard Controls](#23-gesture--keyboard-controls)
24. [Offline Support](#24-offline-support)
25. [Testsprite Integration Plan](#25-testsprite-integration-plan)
26. [Non-Functional Requirements](#26-non-functional-requirements)
27. [Development Phases](#27-development-phases)
28. [Feature Summary](#28-feature-summary)

---

## 1. Project Overview

### What is EduBoard Pro?
EduBoard Pro ek **Flutter-based interactive whiteboard desktop application** hai. Yeh Indian coaching institute teachers ke liye bana hai — SSC, Railway, UPSC, BSSC exam preparation ke liye. Teacher whiteboard pe freely likhte hain, EduHub platform se question sets import karte hain (PPT-style), aur class ke baad annotations PDF me save karke cloud pe upload karte hain.

### Reference Product
**Prestigio Note3 / EasiNote** — sabhi core features inspired hain, but EduBoard Pro me advanced Flutter-specific implementation aur EduHub-exclusive features hain.

### Platform Targets
| Platform | Priority | Flutter Build Command |
|----------|----------|----------------------|
| Windows Desktop | P0 — Primary | `flutter build windows` |
| Android Tablet | P1 | `flutter build apk` |
| Linux Desktop | P2 | `flutter build linux` |

---

## 2. Tech Stack & Flutter Architecture

### 2.1 Core Stack
```yaml
# pubspec.yaml — all required dependencies

flutter_sdk: ">=3.19.0"
dart_sdk:    ">=3.3.0"

dependencies:
  # Canvas & Drawing
  perfect_freehand: ^2.0.1       # Pen smoothing — Catmull-Rom spline pressure simulation
  flutter_drawing_board: ^0.6.0  # Base drawing scaffold reference

  # State Management
  flutter_riverpod: ^2.5.1       # Primary state management
  riverpod_annotation: ^2.3.4    # Code generation for @riverpod annotations

  # API & Networking
  dio: ^5.4.3                    # HTTP client for EduHub REST API
  web_socket_channel: ^2.4.0     # WebSocket for real-time auto-save ping

  # PDF Generation & Import
  pdf: ^3.10.8                   # Generate PDF (dart:pdf)
  printing: ^5.12.0              # PDF preview + local export
  pdfx: ^2.2.0                   # Import PDF pages → render as images

  # Local Storage
  hive_flutter: ^1.1.0           # Local persistent storage (sessions, settings)
  hive: ^2.2.3
  path_provider: ^2.1.3          # File system paths (downloads, temp)
  flutter_secure_storage: ^9.0.0 # Secure JWT token storage

  # UI Components
  flutter_colorpicker: ^1.1.0    # RGBA color picker widget
  google_fonts: ^6.2.1           # DM Sans + Noto Sans Devanagari
  flutter_svg: ^2.0.10           # SVG rendering (maps, circuit symbols)
  gap: ^3.0.1                    # Spacing utility widget
  flutter_animate: ^4.5.0        # UI animations (slide, fade, bounce)
  lottie: ^3.1.2                 # Lottie JSON animations (timer, confetti)

  # Math & Formula Rendering
  flutter_math_fork: ^0.7.2      # KaTeX-style math formula rendering

  # HTML Rendering (for question text)
  flutter_widget_from_html: ^0.15.1 # Render HTML question strings with images

  # Media & File Handling
  image_picker: ^1.1.2           # Pick image from device (tablet camera too)
  file_picker: ^8.0.3            # Pick PDF/image/video files
  cached_network_image: ^3.3.1   # Cache S3 question images from slides
  video_player: ^2.8.3           # Embed video on canvas

  # Desktop Window (Windows only)
  window_manager: ^0.3.8         # Control window (always-on-top, opacity, transparent)

  # Utilities
  uuid: ^4.3.3                   # Generate unique IDs for objects/sessions
  intl: ^0.19.0                  # Date/time formatting (IST)
  connectivity_plus: ^6.0.3      # Detect online/offline status
  shared_preferences: ^2.2.3     # Small key-value storage (toolbar config)
  archive: ^3.4.10               # Create ZIP for PNG batch export

dev_dependencies:
  build_runner: ^2.4.9
  riverpod_generator: ^2.3.9
  flutter_test:
    sdk: flutter
  integration_test:
    sdk: flutter
  mocktail: ^1.0.3               # Mocking in tests
  testsprite: ^1.0.0             # Testsprite automated bug detection
```

### 2.2 Architecture Pattern
```
Pattern:      Feature-based Clean Architecture
State:        Riverpod (AsyncNotifier + StateNotifier + @riverpod annotation)
Data Flow:    UI Widget → Riverpod Notifier → Repository → DataSource (API / Hive)
Canvas:       CustomPainter with RepaintBoundary (performance isolation)
Threading:    compute() Isolate for heavy work (PDF generation, image processing)
```

### 2.3 Key Flutter Patterns Used
- `CustomPainter` — entire canvas drawn using Flutter's `Canvas` API
- `GestureDetector` + `Listener` — pen strokes, touch, multi-finger input
- `RepaintBoundary` — wraps canvas to isolate repaints from UI layer changes
- `InteractiveViewer` — pan and zoom support for canvas
- `Stack` — layers: Background → SlideContent → Annotations → UI Overlays
- `compute()` — run PDF generation on a background isolate
- `Timer.periodic` — auto-save every 30 seconds
- `AnimationController` — smooth tool transitions, spotlight, curtain animations

---

## 3. Folder Structure

```
lib/
├── main.dart                        # Entry point, ProviderScope, window setup
├── app.dart                         # MaterialApp, GoRouter, ThemeData
│
├── core/
│   ├── constants/
│   │   ├── app_colors.dart          # All Color values as static const
│   │   ├── app_text_styles.dart     # All TextStyle values
│   │   └── api_constants.dart       # Base URL, endpoint paths, test credentials
│   ├── theme/
│   │   └── app_theme.dart           # ThemeData.dark() with custom overrides
│   ├── network/
│   │   ├── dio_client.dart          # Dio singleton with interceptors
│   │   └── auth_interceptor.dart    # Attach JWT to every request
│   ├── storage/
│   │   ├── hive_service.dart        # Hive.init + openBox helpers
│   │   └── secure_storage.dart      # flutter_secure_storage for JWT
│   └── utils/
│       ├── canvas_utils.dart        # Offset math, hit testing, path helpers
│       └── pdf_utils.dart           # Stroke → PDF path conversion helpers
│
├── features/
│   │
│   ├── auth/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   │       └── screens/login_screen.dart
│   │
│   ├── whiteboard/
│   │   ├── data/
│   │   │   ├── models/
│   │   │   │   ├── stroke_model.dart          # Single drawn stroke
│   │   │   │   ├── canvas_object_model.dart   # Shapes, textboxes, images
│   │   │   │   └── whiteboard_session_model.dart
│   │   │   ├── repositories/
│   │   │   │   └── whiteboard_repository_impl.dart
│   │   │   └── datasources/
│   │   │       ├── whiteboard_local_ds.dart   # Hive read/write
│   │   │       └── whiteboard_remote_ds.dart  # Dio API calls
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   └── repositories/
│   │   │       └── whiteboard_repository.dart # Abstract interface
│   │   └── presentation/
│   │       ├── providers/
│   │       │   ├── canvas_provider.dart       # All drawing state
│   │       │   ├── tool_provider.dart         # Active tool + settings
│   │       │   ├── slide_provider.dart        # Slide list + current index
│   │       │   └── session_provider.dart      # Auto-save + session data
│   │       ├── widgets/
│   │       │   ├── canvas/
│   │       │   │   ├── whiteboard_canvas.dart      # GestureDetector wrapper
│   │       │   │   ├── canvas_painter.dart         # CustomPainter implementation
│   │       │   │   ├── slide_content_layer.dart    # READ-ONLY question renderer
│   │       │   │   └── background_layer.dart       # Color or image background
│   │       │   ├── toolbar/
│   │       │   │   ├── top_bar.dart                # Title, save status, class timer
│   │       │   │   ├── bottom_main_toolbar.dart    # Pinned tools (max 10)
│   │       │   │   ├── left_side_toolbar.dart      # Auto-hide vertical toolbar
│   │       │   │   ├── tool_library_drawer.dart    # Full tool catalog drawer
│   │       │   │   └── color_picker_panel.dart     # RGBA color picker dialog
│   │       │   ├── slides/
│   │       │   │   ├── slide_panel.dart            # Right-side thumbnail strip
│   │       │   │   ├── slide_thumbnail.dart        # Mini preview of one slide
│   │       │   │   └── question_slide_renderer.dart # HTML question + options
│   │       │   └── overlays/
│   │       │       ├── spotlight_overlay.dart
│   │       │       ├── screen_cover_overlay.dart
│   │       │       ├── zoom_lens_overlay.dart
│   │       │       ├── navigation_map_widget.dart
│   │       │       └── ai_assistant_panel.dart
│   │       └── screens/
│   │           ├── whiteboard_screen.dart      # Main screen
│   │           └── set_import_dialog.dart      # Set ID import popup
│   │
│   ├── set_import/
│   │   ├── data/models/
│   │   │   ├── set_slide_model.dart
│   │   │   └── set_metadata_model.dart
│   │   └── data/repositories/set_repository.dart
│   │
│   ├── export/
│   │   ├── pdf_export_service.dart
│   │   └── local_export_service.dart
│   │
│   ├── ai_assistant/
│   │   └── claude_service.dart
│   │
│   └── settings/
│       └── presentation/settings_screen.dart
│
└── shared/
    ├── widgets/
    │   ├── loading_overlay.dart
    │   ├── error_snackbar.dart
    │   └── offline_banner.dart
    └── extensions/
        ├── color_extensions.dart
        └── offset_extensions.dart
```

---

## 4. Backend Integration — Real API Connection

> ### ⚠️ AI IDE Developer — IMPORTANT
> **EduHub backend already fully developed hai aur Admin Panel se connected hai.**
> Whiteboard ka kaam sirf in APIs ko call karna hai — koi naya backend banana nahi hai.
> Sirf Flutter side ka code likhna hai jo existing endpoints se baat kare.

---

### 4.0 Backend Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    EDUHUB ECOSYSTEM                              │
│                                                                  │
│  ┌───────────────┐    ┌───────────────┐    ┌─────────────────┐ │
│  │  Admin Panel  │    │  EduBoard Pro │    │  Student App    │ │
│  │  (Connected)  │    │  (Whiteboard) │    │  (Consumer)     │ │
│  └──────┬────────┘    └──────┬────────┘    └────────┬────────┘ │
│         │                   │                       │          │
│         └───────────────────┼───────────────────────┘          │
│                             ▼                                    │
│              ┌──────────────────────────┐                       │
│              │   EduHub Backend API     │                       │
│              │   (Already Developed)    │                       │
│              │   Node.js + Express +    │                       │
│              │   Prisma + PostgreSQL    │                       │
│              └──────────────────────────┘                       │
│                             │                                    │
│              ┌──────────────┴────────────┐                      │
│              │      AWS S3 + CloudFront  │                      │
│              │  (Images, PDFs, Media)    │                      │
│              └───────────────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘

Whiteboard connect hoga:  Backend API se (questions load + session save)
Admin Panel dekh sakta:   Whiteboard uploads, session history, teacher activity
Student dekh sakta:       Class notes PDF (uploaded by teacher after class ends)
```

---

### 4.1 API Base Configuration

```dart
// lib/core/constants/api_constants.dart

class ApiConstants {
  // ── Production Base URL ──────────────────────────────────────────
  static const String baseUrl = 'https://api.eduhub.in/api/v1';
  // ────────────────────────────────────────────────────────────────
  // NOTE: If backend runs locally during dev:
  // static const String baseUrl = 'http://localhost:3000/api/v1';
  // Or use ngrok for mobile testing

  // ── Auth Endpoints ───────────────────────────────────────────────
  // POST /auth/teacher/login        → Returns JWT access token + refresh token
  // POST /auth/refresh              → Refresh expired JWT
  // POST /auth/logout               → Invalidate token

  // ── Set / Question Endpoints (READ — Load questions into whiteboard) ──
  // POST /whiteboard/validate-set           → Validate Set ID + Password → get set info
  // GET  /whiteboard/sets/:setId/questions  → Fetch all questions of the set
  // GET  /whiteboard/sets/:setId/metadata   → Set title, subject, total count, org info

  // ── Whiteboard Session Endpoints (WRITE — Save to server) ──────────
  // POST /whiteboard/session/start          → Create new session, get sessionId
  // PUT  /whiteboard/session/:sessionId     → Update/auto-save session state (JSON)
  // GET  /whiteboard/session/:sessionId     → Restore a specific session
  // GET  /whiteboard/sessions?setId=505955  → List all sessions for a set
  // POST /whiteboard/session/:sessionId/end → Mark session as ended

  // ── PDF Upload Endpoint ────────────────────────────────────────────
  // POST /whiteboard/session/:sessionId/upload-pdf → Upload final PDF (multipart)
  //      Linked to Set ID automatically via sessionId

  // ── Admin Panel Visibility Endpoints (already connected) ──────────
  // GET  /admin/whiteboard/sessions         → Admin sees all teacher sessions
  // GET  /admin/whiteboard/session/:id/pdf  → Admin downloads class PDF

  // ── DEV / TEST CREDENTIALS (Remove before production release) ─────
  static const String testSetId       = '505955';
  static const String testSetPassword = '287051';
  // ──────────────────────────────────────────────────────────────────
}
```

---

### 4.2 Authentication Flow (Teacher Login → Whiteboard Access)

```
Teacher opens EduBoard Pro App
          ↓
LoginScreen shows (if no stored JWT):
  [Email/Phone]  [Password]  [Login]
          ↓
POST /auth/teacher/login
  Body: { "email": "teacher@school.com", "password": "..." }
  OR    { "phone": "9876543210",         "password": "..." }
          ↓
Response: {
  "accessToken":  "eyJ...",   // JWT, expires in 24h
  "refreshToken": "eyJ...",   // expires in 30 days
  "teacher": {
    "id":       "teacher_uuid",
    "name":     "Rahul Sir",
    "email":    "...",
    "orgId":    "org_uuid",
    "orgName":  "Ambition Coaching Institute"
  }
}
          ↓
Store in flutter_secure_storage:
  Key: 'access_token'   → accessToken
  Key: 'refresh_token'  → refreshToken
  Key: 'teacher_data'   → JSON string of teacher object
          ↓
WhiteboardScreen opens (teacher is now logged in)
```

```dart
// lib/core/network/auth_interceptor.dart
// Automatically attaches JWT to every API request

class AuthInterceptor extends Interceptor {
  final Ref ref;
  AuthInterceptor(this.ref);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final storage = ref.read(secureStorageProvider);
    final token   = await storage.read(key: 'access_token');
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    // If 401 → auto-refresh token, then retry original request
    if (err.response?.statusCode == 401) {
      final refreshed = await _refreshToken();
      if (refreshed) {
        // Retry the original request with new token
        final storage = ref.read(secureStorageProvider);
        final newToken = await storage.read(key: 'access_token');
        err.requestOptions.headers['Authorization'] = 'Bearer $newToken';
        final response = await ref.read(dioProvider).fetch(err.requestOptions);
        return handler.resolve(response);
      } else {
        // Refresh failed → redirect to login screen
        ref.read(authProvider.notifier).logout();
      }
    }
    handler.next(err);
  }

  Future<bool> _refreshToken() async {
    try {
      final storage      = ref.read(secureStorageProvider);
      final refreshToken = await storage.read(key: 'refresh_token');
      if (refreshToken == null) return false;
      final response = await Dio().post(
        '${ApiConstants.baseUrl}/auth/refresh',
        data: {'refreshToken': refreshToken},
      );
      await storage.write(key: 'access_token',  value: response.data['accessToken']);
      await storage.write(key: 'refresh_token', value: response.data['refreshToken']);
      return true;
    } catch (_) {
      return false;
    }
  }
}
```

---

### 4.3 Set ID + Password Validation API

> **Yeh sabse important API hai** — teacher Set ID + Password daalega, backend validate karega, phir questions load honge.

```dart
// STEP 1: Validate Set ID + Password
// POST /whiteboard/validate-set

// Request Body:
{
  "setId":    "505955",
  "password": "287051"
}

// Success Response (200 OK):
{
  "valid": true,
  "set": {
    "id":          "505955",
    "title":       "SSC CGL Practice Set - August 2017",
    "subject":     "General Intelligence",
    "examType":    "SSC CGL",
    "totalQuestions": 20,
    "orgId":       "org_abc123",
    "createdBy":   "teacher_xyz",
    "createdAt":   "2024-08-01T00:00:00Z"
  }
}

// Error Responses:
// 404: { "error": "SET_NOT_FOUND",   "message": "Set ID does not exist" }
// 401: { "error": "WRONG_PASSWORD",  "message": "Incorrect password" }
// 403: { "error": "NO_ACCESS",       "message": "You don't have access to this set" }
```

```dart
// STEP 2: Fetch All Questions
// GET /whiteboard/sets/505955/questions
// Header: Authorization: Bearer {teacherJWT}

// Response (200 OK):
{
  "setId": "505955",
  "totalQuestions": 20,
  "questions": [
    {
      "id":             "q_001",
      "questionNumber": 1,
      "questionText":   "<p>In the given following question...</p>",  // HTML
      "questionImage":  null,    // or "https://cdn.eduhub.in/images/q001.jpg"
      "options": [
        { "label": "A", "text": "loopholes",  "image": null },
        { "label": "B", "text": "lupholes",   "image": null },
        { "label": "C", "text": "looppholes", "image": null },
        { "label": "D", "text": "luppholes",  "image": null }
      ],
      "correctAnswer":  "A",
      "examSource":     "SSC CGL 6 Aug 2017 Shift-3",
      "subject":        "English",
      "difficulty":     "medium",
      "backgroundImageUrl": null
    },
    // ... 19 more questions
  ]
}
```

```dart
// lib/features/set_import/data/datasources/set_remote_datasource.dart

class SetRemoteDataSource {
  final Dio dio;
  SetRemoteDataSource(this.dio);

  // Step 1: Validate set
  Future<SetMetadataModel> validateSet(String setId, String password) async {
    final response = await dio.post('/whiteboard/validate-set', data: {
      'setId':    setId,
      'password': password,
    });
    return SetMetadataModel.fromJson(response.data['set'] as Map<String, dynamic>);
  }

  // Step 2: Load all questions
  Future<List<SetSlideModel>> fetchQuestions(String setId) async {
    final response = await dio.get('/whiteboard/sets/$setId/questions');
    final questions = response.data['questions'] as List;
    return questions
        .map((q) => SetSlideModel.fromJson(q as Map<String, dynamic>))
        .toList();
  }
}
```

---

### 4.4 Whiteboard Session — Start, Auto-Save, End

#### 4.4.1 Start Session (Class shuru hone par)
```dart
// POST /whiteboard/session/start
// Header: Authorization: Bearer {teacherJWT}

// Request Body:
{
  "setId":     "505955",
  "teacherId": "teacher_uuid",   // from stored teacher data
  "orgId":     "org_abc123",     // from stored teacher data
  "startedAt": "2026-03-30T19:02:00.000Z"
}

// Response (201 Created):
{
  "sessionId": "session_uuid_abc",  // ← SAVE THIS — needed for all subsequent calls
  "message":   "Session started"
}
```

```dart
// lib/features/whiteboard/data/datasources/whiteboard_remote_ds.dart

class WhiteboardRemoteDataSource {
  final Dio dio;
  WhiteboardRemoteDataSource(this.dio);

  Future<String> startSession(String setId, String teacherId, String orgId) async {
    final response = await dio.post('/whiteboard/session/start', data: {
      'setId':     setId,
      'teacherId': teacherId,
      'orgId':     orgId,
      'startedAt': DateTime.now().toUtc().toIso8601String(),
    });
    return response.data['sessionId'] as String; // Store this in sessionProvider
  }
}
```

#### 4.4.2 Auto-Save Session (Har 30 second ya canvas change par)
```dart
// PUT /whiteboard/session/{sessionId}
// Header: Authorization: Bearer {teacherJWT}
// Content-Type: application/json

// Request Body:
{
  "sessionId": "session_uuid_abc",
  "lastSaved": "2026-03-30T19:32:00.000Z",
  "slideIndex": 6,              // current slide index teacher is on
  "slidesCovered": [0,1,2,3,4,5,6],  // which slides teacher has visited
  "annotations": {              // per-slide annotation data
    "q_001": {
      "strokes": [              // array of stroke objects
        {
          "id":          "stroke_uuid",
          "points":      [[120.5, 340.2], [121.0, 341.5], ...],  // [x, y] pairs
          "color":       "#FF0000",         // hex color string
          "strokeWidth": 4.0,
          "type":        "softPen",         // StrokeType enum string
          "opacity":     1.0
        }
      ],
      "objects": [              // shapes, text boxes, sticky notes
        {
          "id":          "obj_uuid",
          "type":        "rectangle",
          "bounds":      { "left": 100, "top": 200, "right": 400, "bottom": 350 },
          "rotation":    0.0,
          "fillColor":   "#FF000033",       // ARGB hex
          "borderColor": "#FF0000FF",
          "borderWidth": 2.0,
          "opacity":     1.0,
          "isLocked":    false,
          "extra":       {}
        }
      ]
    },
    "q_002": { "strokes": [], "objects": [] }
    // ... all slides
  },
  "colorConfigs": {             // per-slide color customization
    "q_001": {
      "questionTextColor": "#FFFFFFFF",
      "questionBgColor":   "#00000000",
      "optionTextColor":   "#FFFFFF00",
      "optionBgColor":     "#00000000",
      "screenBgColor":     "#FF000000"
    }
  },
  "slideBackgrounds": {         // per-slide background image S3 keys (if uploaded)
    "q_001": null,
    "q_002": "backgrounds/session_uuid/slide_2_bg.jpg"
  }
}

// Response (200 OK):
{
  "saved": true,
  "savedAt": "2026-03-30T19:32:00.000Z"
}
```

```dart
// Auto-save implementation in session_provider.dart

Future<void> _performSave() async {
  state = state.copyWith(saveStatus: SaveStatus.saving);
  try {
    final payload = _buildAutoSavePayload();   // builds the JSON body above

    // 1. Always save to Hive first (instant local backup)
    await ref.read(hiveServiceProvider).saveSession(payload);

    // 2. If online → save to server
    if (ref.read(isOnlineProvider).valueOrNull == true) {
      await ref.read(whiteboardRemoteDsProvider)
          .autoSave(state.sessionId, payload);
    } else {
      // Queue for later sync
      await ref.read(hiveServiceProvider).addToPendingSync(payload);
    }

    state = state.copyWith(
      saveStatus:  SaveStatus.saved,
      lastSavedAt: DateTime.now(),
    );
  } catch (e) {
    state = state.copyWith(saveStatus: SaveStatus.failed);
    // Log error, show retry option in UI
  }
}

// Build payload from current canvas + slide state
Map<String, dynamic> _buildAutoSavePayload() {
  final slideAnnotations = <String, Map<String, dynamic>>{};
  final slideState       = ref.read(slideProvider);
  final canvasState      = ref.read(canvasProvider);

  for (final slide in slideState.slides) {
    final annotation = slideState.savedAnnotations[slide.slideId];
    slideAnnotations[slide.slideId] = {
      'strokes': (annotation?.strokes ?? []).map(_strokeToJson).toList(),
      'objects': (annotation?.objects ?? []).map(_objectToJson).toList(),
    };
  }

  return {
    'sessionId':   state.sessionId,
    'lastSaved':   DateTime.now().toUtc().toIso8601String(),
    'slideIndex':  slideState.currentSlideIndex,
    'slidesCovered': state.slidesCoveredIndexes.toList(),
    'annotations': slideAnnotations,
    'colorConfigs': _buildColorConfigPayload(),
    'slideBackgrounds': _buildBackgroundsPayload(),
  };
}

// Stroke → JSON conversion
Map<String, dynamic> _strokeToJson(StrokeModel s) => {
  'id':          s.id,
  'points':      s.points.map((p) => [p.dx, p.dy]).toList(),
  'color':       '#${s.color.value.toRadixString(16).padLeft(8, '0').toUpperCase()}',
  'strokeWidth': s.strokeWidth,
  'type':        s.type.name,  // enum.name gives string
  'opacity':     s.opacity,
};
```

#### 4.4.3 End Session (Class khatam hone par)
```dart
// POST /whiteboard/session/{sessionId}/end
// Header: Authorization: Bearer {teacherJWT}

// Request Body:
{
  "endedAt":        "2026-03-30T20:25:00.000Z",
  "totalDuration":  4980,          // seconds (83 minutes)
  "slidesCovered":  14,            // how many slides teacher covered
  "totalSlides":    20,
  "autoSaveCount":  28,
  "strokeCount":    347
}

// Response (200 OK):
{
  "ended":     true,
  "sessionId": "session_uuid_abc"
}
```

---

### 4.5 PDF Upload to Server (after End Class)

```dart
// POST /whiteboard/session/{sessionId}/upload-pdf
// Header: Authorization: Bearer {teacherJWT}
// Content-Type: multipart/form-data

// Form Fields:
// - pdf:        [binary PDF file]
// - setId:      "505955"
// - sessionId:  "session_uuid_abc"
// - teacherName: "Rahul Sir"
// - uploadedAt:  "2026-03-30T20:25:30.000Z"
// - totalPages:  20

// Success Response (201 Created):
{
  "uploaded": true,
  "pdfUrl":   "https://cdn.eduhub.in/whiteboard-pdfs/505955/session_uuid_abc_class-notes.pdf",
  "setId":    "505955",
  "message":  "Class notes uploaded successfully. Students can access via Set 505955."
}

// This PDF is now:
// 1. Linked to Set ID 505955 on the server
// 2. Visible in Admin Panel under → Sets → 505955 → Class Notes
// 3. Downloadable by students via their app
```

```dart
// lib/features/export/cloud_upload_service.dart

class CloudUploadService {
  final Dio dio;
  CloudUploadService(this.dio);

  Future<String> uploadClassPdf({
    required String   sessionId,
    required String   setId,
    required Uint8List pdfBytes,
    required String   teacherName,
    required int      totalPages,
    void Function(double progress)? onProgress,
  }) async {
    final date     = DateFormat('yyyyMMdd_HHmm').format(DateTime.now());
    final filename = '${setId}_${teacherName.replaceAll(' ', '_')}_$date.pdf';

    final formData = FormData.fromMap({
      'pdf': MultipartFile.fromBytes(pdfBytes,
        filename:    filename,
        contentType: MediaType('application', 'pdf')),
      'setId':       setId,
      'sessionId':   sessionId,
      'teacherName': teacherName,
      'uploadedAt':  DateTime.now().toUtc().toIso8601String(),
      'totalPages':  totalPages.toString(),
    });

    final response = await dio.post(
      '/whiteboard/session/$sessionId/upload-pdf',
      data: formData,
      onSendProgress: (sent, total) {
        if (onProgress != null && total > 0) {
          onProgress(sent / total);
        }
      },
    );

    return response.data['pdfUrl'] as String;
  }
}
```

---

### 4.6 Session Restore (App reopen par)

```dart
// GET /whiteboard/session/{sessionId}
// Header: Authorization: Bearer {teacherJWT}

// Response (200 OK):
{
  "sessionId":   "session_uuid_abc",
  "setId":       "505955",
  "teacherId":   "teacher_uuid",
  "startedAt":   "2026-03-30T19:02:00.000Z",
  "lastSaved":   "2026-03-30T19:32:00.000Z",
  "status":      "active",   // "active" | "ended"
  "slideIndex":  6,
  "annotations": { ... },    // same format as auto-save payload
  "colorConfigs": { ... },
  "slideBackgrounds": { ... }
}
```

```dart
// GET /whiteboard/sessions?setId=505955   (list of sessions for this set)
// Header: Authorization: Bearer {teacherJWT}

// Response:
{
  "sessions": [
    {
      "sessionId":  "session_uuid_abc",
      "setId":      "505955",
      "startedAt":  "2026-03-30T19:02:00.000Z",
      "lastSaved":  "2026-03-30T19:32:00.000Z",
      "status":     "active",
      "slidesCovered": 14
    },
    // ... older sessions
  ]
}
```

---

### 4.7 Complete API Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                    WHITEBOARD ↔ BACKEND FLOW                         │
│                                                                      │
│  1. APP LAUNCH                                                       │
│     EduBoard Pro opens                                               │
│     → Check flutter_secure_storage for JWT                           │
│     → JWT found? → WhiteboardScreen                                  │
│     → No JWT? → LoginScreen → POST /auth/teacher/login → Store JWT  │
│                                                                      │
│  2. SET ID IMPORT (Teacher clicks [Import Set])                      │
│     Teacher enters: Set ID = 505955, Password = 287051              │
│     → POST /whiteboard/validate-set  ← validate credentials         │
│     → GET  /whiteboard/sets/505955/questions  ← load all questions  │
│     → POST /whiteboard/session/start  ← create server session       │
│     → Store sessionId in sessionProvider                             │
│     → Render questions as PPT slides on whiteboard                   │
│                                                                      │
│  3. DURING CLASS (auto-save loop)                                    │
│     Every 30s OR 5s after any annotation:                            │
│     → PUT /whiteboard/session/{sessionId}  ← save all annotations   │
│     → Hive local backup (always, even offline)                       │
│     → TopBar shows: "✓ Saved 7:32 PM"                               │
│                                                                      │
│  4. END CLASS (Teacher clicks [End Class])                           │
│     → PDF generate (dart:pdf, background isolate)                   │
│     → POST /whiteboard/session/{sessionId}/end  ← mark ended        │
│     → POST /whiteboard/session/{sessionId}/upload-pdf  ← upload PDF │
│     → Show success: "Class notes saved to Set 505955"               │
│     → Admin Panel shows the PDF under this Set immediately          │
│                                                                      │
│  5. APP REOPEN (session recovery)                                    │
│     → Check Hive for last active sessionId                           │
│     → GET /whiteboard/session/{sessionId}  ← restore from server    │
│     → Restore all annotations, slide positions, colors              │
└──────────────────────────────────────────────────────────────────────┘
```

---

### 4.8 Dio Client Setup

```dart
// lib/core/network/dio_client.dart

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl:        ApiConstants.baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 30), // 30s for PDF upload
    headers:        {'Content-Type': 'application/json'},
  ));

  dio.interceptors.addAll([
    AuthInterceptor(ref),                      // JWT auto-attach + refresh
    RetryInterceptor(dio, retries: 3,          // 3 retries on timeout/5xx
      retryDelays: [
        Duration(seconds: 1),
        Duration(seconds: 3),
        Duration(seconds: 5),
      ]),
    if (kDebugMode) LogInterceptor(
      requestBody:  true,
      responseBody: true,
    ),
  ]);

  return dio;
});
```

---

### 4.9 Dart Data Models

### 4.2 Dio Client
```dart
// lib/core/network/dio_client.dart

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: ApiConstants.baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 15),
    headers: {'Content-Type': 'application/json'},
  ));
  dio.interceptors.add(AuthInterceptor(ref));   // attach JWT
  dio.interceptors.add(RetryInterceptor(dio, retries: 3)); // auto-retry on timeout
  if (kDebugMode) {
    dio.interceptors.add(LogInterceptor(responseBody: true));
  }
  return dio;
});
```

### 4.3 Dart Data Models

```dart
// lib/features/set_import/data/models/set_slide_model.dart

@HiveType(typeId: 1)
class SetSlideModel extends HiveObject {
  @HiveField(0) final String slideId;
  @HiveField(1) final int    questionNumber;
  @HiveField(2) final String questionText;       // Raw HTML string
                                                  // May contain: <b>,<i>,<sub>,<sup>,<img src="S3_URL">,<span style="">
  @HiveField(3) final String? questionImageUrl;  // S3 image URL (optional, separate from HTML)
  @HiveField(4) final List<SlideOption> options; // Always 4 options: A, B, C, D
  @HiveField(5) final String? correctAnswer;     // 'A' | 'B' | 'C' | 'D' (optional)
  @HiveField(6) final String? examSource;        // e.g. "SSC CGL 6 Aug 2017 Shift-3"
  @HiveField(7) final String? subject;
  @HiveField(8) final String? backgroundImageUrl; // per-slide BG image (S3 URL)

  factory SetSlideModel.fromJson(Map<String, dynamic> json) => SetSlideModel(
    slideId:            json['slideId'] as String,
    questionNumber:     json['questionNumber'] as int,
    questionText:       json['questionText'] as String,
    questionImageUrl:   json['questionImage'] as String?,
    options:            (json['options'] as List)
                            .map((o) => SlideOption.fromJson(o as Map<String, dynamic>))
                            .toList(),
    correctAnswer:      json['correctAnswer'] as String?,
    examSource:         json['examSource'] as String?,
    subject:            json['subject'] as String?,
    backgroundImageUrl: json['backgroundImageUrl'] as String?,
  );
}

@HiveType(typeId: 2)
class SlideOption {
  @HiveField(0) final String  label;    // 'A', 'B', 'C', or 'D'
  @HiveField(1) final String  text;
  @HiveField(2) final String? imageUrl; // option image (optional)

  factory SlideOption.fromJson(Map<String, dynamic> json) => SlideOption(
    label:    json['label'] as String,
    text:     json['text'] as String,
    imageUrl: json['image'] as String?,
  );
}

// ──────────────────────────────────────────────────────────────────

// lib/features/whiteboard/data/models/stroke_model.dart

@HiveType(typeId: 3)
class StrokeModel {
  @HiveField(0) final List<Offset> points;
  @HiveField(1) final Color        color;
  @HiveField(2) final double       strokeWidth;
  @HiveField(3) final StrokeType   type;
  @HiveField(4) final double       opacity;   // 0.1 – 1.0
  @HiveField(5) final String       id;        // uuid
}

enum StrokeType { softPen, hardPen, highlighter, chalk, calligraphy, spray, laser }

// ──────────────────────────────────────────────────────────────────

// lib/features/whiteboard/data/models/canvas_object_model.dart
// Used for: shapes, text boxes, sticky notes, images, videos, math tools

@HiveType(typeId: 4)
class CanvasObjectModel {
  @HiveField(0) final String             id;           // uuid
  @HiveField(1) final ObjectType         type;
  @HiveField(2) final Rect               bounds;       // position + size on canvas
  @HiveField(3) final double             rotation;     // degrees
  @HiveField(4) final Color              fillColor;
  @HiveField(5) final Color              borderColor;
  @HiveField(6) final double             borderWidth;
  @HiveField(7) final double             opacity;
  @HiveField(8) final bool               isLocked;
  @HiveField(9) final Map<String, dynamic> extra;     // type-specific data
}

enum ObjectType {
  rectangle, roundedRect, circle, triangle, star, polygon,
  line, arrow, doubleArrow, callout,
  textBox, stickyNote,
  imageBox, videoBox,
  flowchartProcess, flowchartDecision, flowchartTerminator,
  ruler, protractor, compass,
}

// ──────────────────────────────────────────────────────────────────

// lib/features/whiteboard/data/models/whiteboard_session_model.dart

@HiveType(typeId: 5)
class WhiteboardSessionModel {
  @HiveField(0) final String   sessionId;
  @HiveField(1) final String   setId;
  @HiveField(2) final String   teacherId;
  @HiveField(3) final DateTime startTime;
  @HiveField(4) final DateTime lastSaved;
  // Per-slide annotation data
  @HiveField(5) final Map<String, SlideAnnotationData> slideAnnotations;
  // Per-slide color config
  @HiveField(6) final Map<String, SlideColorConfig> slideColors;
  // Per-slide background image local path
  @HiveField(7) final Map<String, String?> slideBackgrounds;
}

class SlideAnnotationData {
  final String                 slideId;
  final List<StrokeModel>      strokes;   // all drawn strokes on this slide
  final List<CanvasObjectModel> objects;  // shapes, text, images on this slide
}
```

---

## 5. UI/UX Design System

### 5.1 Color Constants
```dart
// lib/core/constants/app_colors.dart

class AppColors {
  // ── Canvas & Backgrounds ──────────────────────────────────────
  static const Color bgPrimary    = Color(0xFF0D0D0D); // Main canvas background
  static const Color bgSecondary  = Color(0xFF1A1A1A); // Toolbar background
  static const Color bgPanel      = Color(0xFF242424); // Side panels
  static const Color bgCard       = Color(0xFF2C2C2C); // Cards, dialogs

  // ── EduHub Brand ─────────────────────────────────────────────
  static const Color accentOrange = Color(0xFFF4511E); // Primary CTA, active tool
  static const Color accentYellow = Color(0xFFFFB300); // Option text (SSC-style)

  // ── Text ──────────────────────────────────────────────────────
  static const Color textPrimary   = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFFB0B0B0);
  static const Color textDisabled  = Color(0xFF555555);

  // ── Status ────────────────────────────────────────────────────
  static const Color success = Color(0xFF22C55E);
  static const Color error   = Color(0xFFEF4444);
  static const Color warning = Color(0xFFFACC15);

  // ── Tool States ───────────────────────────────────────────────
  static const Color toolActive = Color(0x40F4511E);  // 25% orange tint
  static const Color toolHover  = Color(0x20FFFFFF);
  static const Color border     = Color(0xFF333333);

  // ── Slide Defaults (dark coaching style, matches screenshot) ──
  static const Color slideQuestionText = Color(0xFFFFFFFF);  // White
  static const Color slideOptionText   = Color(0xFFFFFF00);  // Yellow (as in screenshot)
  static const Color slideBg           = Color(0xFF000000);  // Black
}
```

### 5.2 Text Styles
```dart
// lib/core/constants/app_text_styles.dart

class AppTextStyles {
  // General UI
  static TextStyle heading1 = GoogleFonts.dmSans(
    fontSize: 24, fontWeight: FontWeight.w700, color: AppColors.textPrimary);

  static TextStyle body = GoogleFonts.dmSans(
    fontSize: 14, fontWeight: FontWeight.w400, color: AppColors.textPrimary);

  static TextStyle toolLabel = GoogleFonts.dmSans(
    fontSize: 11, fontWeight: FontWeight.w500, color: AppColors.textSecondary);

  // Slide question text (large, bold white)
  static TextStyle slideQuestion = GoogleFonts.dmSans(
    fontSize: 22, fontWeight: FontWeight.w700,
    color: AppColors.slideQuestionText, height: 1.5);

  // Slide option text (yellow, matching screenshot)
  static TextStyle slideOption = GoogleFonts.dmSans(
    fontSize: 20, fontWeight: FontWeight.w600, color: AppColors.slideOptionText);

  // Hindi / Devanagari support
  static TextStyle hindi = GoogleFonts.notoSansDevanagari(
    fontSize: 20, fontWeight: FontWeight.w500, color: AppColors.textPrimary);
}
```

---

## 6. App Layout & Navigation

### 6.1 Main Screen Layout
```
WhiteboardScreen (Scaffold, dark background)
├── TopBar (height: 48px)
│   ├── LEFT:   [≡ Menu]  [Set Title]  [Slide X/Y]
│   └── RIGHT:  [Offline Badge]  [● Save Status]  [⏱ Class Timer]  [End Class]
│
├── Body (Row)
│   ├── LeftSideToolbar (width: 56px, auto-hides after 3s inactivity)
│   │   └── Vertical list of ToolIconButton widgets
│   │
│   ├── CanvasArea (Expanded — takes remaining space)
│   │   └── Stack (layers bottom to top):
│   │       ├── BackgroundLayer        (color or image)
│   │       ├── SlideContentLayer      (question + options, READ-ONLY)
│   │       ├── AnnotationLayer        (teacher drawings, WRITABLE — CustomPainter)
│   │       ├── MathToolOverlay        (ruler, protractor, compass — draggable widgets)
│   │       └── UIOverlayLayer         (spotlight, screen cover, zoom lens, AI panel)
│   │
│   └── SlidePanelDrawer (width: 180px, collapsible)
│       └── SlideThumbnailList (vertical scroll)
│
└── BottomMainToolbar (height: 56px)
    ├── Pinned tools (max 10, customizable)
    ├── VerticalDivider
    ├── UndoButton  RedoButton
    └── [+ Tool Library]  [End Class]
```

### 6.2 Flutter Widget Tree
```dart
// lib/features/whiteboard/presentation/screens/whiteboard_screen.dart

class WhiteboardScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      body: Column(
        children: [
          const TopBar(),                           // 48px fixed height
          Expanded(
            child: Row(
              children: [
                const LeftSideToolbar(),            // 56px, AnimatedContainer
                const Expanded(child: CanvasArea()), // All drawing happens here
                const SlidePanelDrawer(),           // 180px, collapsible
              ],
            ),
          ),
          const BottomMainToolbar(),                // 56px fixed height
        ],
      ),
    );
  }
}
```

### 6.3 App Modes
```dart
// lib/features/whiteboard/presentation/providers/canvas_provider.dart

enum AppMode {
  whiteboardFree,    // Blank infinite canvas — free drawing
  slideMode,         // Set ID loaded — PPT slides with questions
  annotationFloat,   // Floating toolbar over desktop (Windows)
  presentationClean, // Full screen — all toolbars hidden
  preparationEdit,   // Pre-class: edit slides before teaching
}

// Riverpod provider
final appModeProvider = StateProvider<AppMode>((ref) => AppMode.whiteboardFree);
```

### 6.4 Left Sidebar Auto-Hide
```dart
// lib/features/whiteboard/presentation/widgets/toolbar/left_side_toolbar.dart
// Behavior: visible on hover, auto-hides 3s after last interaction

class LeftSideToolbar extends ConsumerStatefulWidget {
  // 1. AnimatedContainer: width animates 0 ↔ 56px
  // 2. MouseRegion: onEnter → show; onExit → start 3s Timer → hide
  // 3. On tool tap: reset hide timer
  // 4. On 3-finger swipe up (touch): show toolbar
}
```

---

## 7. Canvas Engine — Core Drawing

### 7.1 Two-Layer Canvas Architecture
```
Stack (CanvasArea)
│
├── Layer 1 — BackgroundLayer
│   └── Container(color) OR Image.file/network
│
├── Layer 2 — SlideContentLayer (READ-ONLY)
│   └── QuestionSlideRenderer widget
│   └── Only visible when AppMode == slideMode
│
├── Layer 3 — AnnotationLayer (WRITABLE)
│   └── RepaintBoundary                    ← IMPORTANT for 60fps
│       └── CustomPaint(painter: CanvasPainter)
│           └── GestureDetector handles pen input
│
└── Layer 4 — MathToolOverlay + UIOverlay
    └── Draggable math tools, spotlight, AI panel
```

### 7.2 CanvasPainter
```dart
// lib/features/whiteboard/presentation/widgets/canvas/canvas_painter.dart

class CanvasPainter extends CustomPainter {
  final List<StrokeModel>       strokes;       // completed strokes
  final StrokeModel?            activeStroke;  // currently being drawn
  final List<CanvasObjectModel> objects;       // shapes, text, images

  @override
  void paint(Canvas canvas, Size size) {
    // Step 1: Draw all completed strokes
    for (final stroke in strokes) {
      _drawStroke(canvas, stroke);
    }
    // Step 2: Draw active (in-progress) stroke for real-time feedback
    if (activeStroke != null) {
      _drawStroke(canvas, activeStroke!);
    }
    // Step 3: Draw all canvas objects (shapes, text boxes, images)
    for (final obj in objects) {
      _drawObject(canvas, obj);
    }
  }

  void _drawStroke(Canvas canvas, StrokeModel stroke) {
    // Use perfect_freehand: getStroke() returns outline points of a calligraphic stroke
    final outlinePoints = getStroke(
      stroke.points.map((p) => [p.dx, p.dy]).toList(),
      options: StrokeOptions(
        size:        stroke.strokeWidth,
        thinning:    0.7,   // taper ends naturally
        smoothing:   0.5,
        streamline:  0.5,
        simulatePressure: true, // simulate pen pressure from speed
      ),
    );
    if (outlinePoints.isEmpty) return;

    final path = Path();
    path.moveTo(outlinePoints.first[0], outlinePoints.first[1]);
    for (final pt in outlinePoints.skip(1)) {
      path.lineTo(pt[0], pt[1]);
    }
    path.close();

    final paint = Paint()
      ..color = stroke.color.withOpacity(stroke.opacity)
      ..style = PaintingStyle.fill;

    // Special blend modes
    if (stroke.type == StrokeType.highlighter) {
      paint.blendMode = BlendMode.multiply;
    }

    canvas.drawPath(path, paint);
  }

  @override
  // Only repaint when strokes or objects actually change
  bool shouldRepaint(CanvasPainter old) =>
    old.strokes != strokes ||
    old.activeStroke != activeStroke ||
    old.objects != objects;
}
```

### 7.3 Canvas State Provider
```dart
// lib/features/whiteboard/presentation/providers/canvas_provider.dart

@riverpod
class CanvasNotifier extends _$CanvasNotifier {
  @override
  CanvasState build() => CanvasState.initial();

  // Called on GestureDetector.onPanStart
  void startStroke(Offset point) {
    final settings = ref.read(toolProvider);
    state = state.copyWith(
      activeStroke: StrokeModel(
        id:          const Uuid().v4(),
        points:      [point],
        color:       settings.color,
        strokeWidth: settings.strokeWidth,
        type:        settings.activeTool.toStrokeType(),
        opacity:     settings.opacity,
      ),
    );
  }

  // Called on GestureDetector.onPanUpdate
  void updateStroke(Offset point) {
    if (state.activeStroke == null) return;
    state = state.copyWith(
      activeStroke: state.activeStroke!.copyWith(
        points: [...state.activeStroke!.points, point],
      ),
    );
  }

  // Called on GestureDetector.onPanEnd
  void endStroke() {
    if (state.activeStroke == null) return;
    final completed = state.activeStroke!;
    state = state.copyWith(
      strokes:      [...state.strokes, completed],
      activeStroke: null,
      undoStack:    [...state.undoStack, state.strokes], // snapshot for undo
      redoStack:    [],  // new stroke clears redo history
    );
    // Notify session provider → start dirty timer → auto-save in 5s
    ref.read(sessionProvider.notifier).markDirty();
  }

  void undo() {
    if (state.undoStack.isEmpty) return;
    state = state.copyWith(
      redoStack: [state.strokes, ...state.redoStack],
      strokes:   state.undoStack.last,
      undoStack: state.undoStack.sublist(0, state.undoStack.length - 1),
    );
  }

  void redo() {
    if (state.redoStack.isEmpty) return;
    state = state.copyWith(
      undoStack: [...state.undoStack, state.strokes],
      strokes:   state.redoStack.first,
      redoStack: state.redoStack.sublist(1),
    );
  }

  // Clear only current slide's annotations (keep objects)
  void clearCurrentSlide() => state = state.copyWith(strokes: [], objects: []);

  // Load strokes from saved session (slide switch restore)
  void loadStrokes(List<StrokeModel> savedStrokes) =>
    state = state.copyWith(strokes: savedStrokes);
}
```

### 7.4 Pan & Zoom (InteractiveViewer)
```dart
// lib/features/whiteboard/presentation/widgets/canvas/whiteboard_canvas.dart
// RULE: Pan/zoom ONLY enabled when active tool is Tool.navigate
//       When drawing tools are active → panEnabled: false (so drag = draw, not pan)

class WhiteboardCanvas extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isNavigating = ref.watch(toolProvider.select((t) => t.activeTool == Tool.navigate));

    return InteractiveViewer(
      panEnabled:   isNavigating,
      scaleEnabled: isNavigating,
      minScale: 0.1,
      maxScale: 5.0,
      transformationController: ref.read(canvasTransformProvider),
      child: Stack(
        fit: StackFit.expand,
        children: const [
          BackgroundLayer(),
          SlideContentLayer(),
          AnnotationLayer(),        // has RepaintBoundary inside
          MathToolOverlay(),
          UIOverlayLayer(),
        ],
      ),
    );
  }
}
```

---

## 8. Pen & Writing Tools

### 8.1 Tool & ToolSettings
```dart
// lib/features/whiteboard/presentation/providers/tool_provider.dart

enum Tool {
  // Writing
  softPen, hardPen, highlighter, chalk, calligraphy, spray, laserPointer,
  // Erasing
  softEraser, hardEraser, objectEraser, areaEraser,
  // Shapes
  line, arrow, doubleArrow, rectangle, roundedRect, circle,
  triangle, star, polygon, callout,
  // Text
  textBox, stickyNote,
  // Selection & Navigation
  select, navigate,
  // Special
  magicPen, eyedropper,
}

class ToolSettings {
  final Tool   activeTool;
  final Color  color;
  final double strokeWidth;  // 1.0 – 50.0 px
  final double opacity;      // 0.1 – 1.0
  final double smoothness;   // 0.0 – 1.0 (maps to perfect_freehand streamline)
  final StrokeTip tip;       // round | flat | brush
}

enum StrokeTip { round, flat, brush }
```

### 8.2 Pen Type Rendering Rules
| StrokeType | Opacity | Width Range | Special Behavior |
|------------|---------|-------------|------------------|
| `softPen` | 1.0 | 2–20px | perfect_freehand with thinning=0.7, simulatePressure=true |
| `hardPen` | 1.0 | 1–15px | perfect_freehand with thinning=0, flat edges |
| `highlighter` | 0.4 | 15–40px | BlendMode.multiply, renders BEHIND text |
| `chalk` | 0.85 | 4–25px | Main stroke + random scatter dots (noise texture) |
| `calligraphy` | 1.0 | 3–30px | Width varies based on stroke direction (thinning=1.0) |
| `spray` | 0.3 | — | drawPoints() in random cluster within spray radius |
| `laserPointer` | 1.0 (red) | 8px | NOT saved to state — fades with AnimationController in 1.5s |

### 8.3 Chalk Effect
```dart
void _drawChalk(Canvas canvas, StrokeModel stroke) {
  final random = Random(42);
  final mainPaint = Paint()
    ..color = stroke.color.withOpacity(0.85)
    ..strokeWidth = 2.0
    ..strokeCap = StrokeCap.round;

  _drawSmoothPath(canvas, stroke.points, mainPaint);  // main stroke

  // Noise: scatter tiny dots around each point for chalk texture
  final noisePaint = Paint()
    ..color = stroke.color.withOpacity(0.4)
    ..strokeWidth = 1.0;
  for (final point in stroke.points) {
    for (int i = 0; i < 3; i++) {
      canvas.drawCircle(
        Offset(
          point.dx + (random.nextDouble() - 0.5) * stroke.strokeWidth,
          point.dy + (random.nextDouble() - 0.5) * stroke.strokeWidth,
        ),
        random.nextDouble() * 1.5,
        noisePaint,
      );
    }
  }
}
```

### 8.4 Laser Pointer (Non-Persistent Overlay)
```dart
// LaserPointerOverlay is a SEPARATE widget on top of AnnotationLayer
// It does NOT write to canvasProvider — strokes are never saved
// Implementation:
//   - Store last 20 points with timestamps
//   - Each point has opacity 1.0 → fades to 0.0 over 1.5s
//   - Use ticker (AnimationController) to update every frame
//   - Clear all points on tool switch

class LaserPointerOverlay extends ConsumerStatefulWidget {
  // AnimationController with vsync
  // List<LaserPoint> trail = []   // LaserPoint has offset + createdAt
  // On each frame: remove points older than 1.5s, rebuild trail
  // Render: drawPath with gradient opacity from red to transparent
}
```

### 8.5 Pen Settings Bottom Sheet
```
Long-press on active pen in toolbar → shows BottomSheet:

┌─────────────────────────────────────────────┐
│  🖊 Pen Settings                            │
│                                             │
│  Stroke Width   [────●──────────]  8 px    │
│  Opacity        [──────●────────]  70 %    │
│  Smoothness     [────────●──────]  60 %    │
│                                             │
│  Tip Style:  [⬤ Round] [━ Flat] [⌒ Brush] │
│                                             │
│  Color: [■ Black] → tap → opens ColorPicker│
└─────────────────────────────────────────────┘
```

---

## 9. Eraser Tools

```dart
// lib/core/utils/canvas_utils.dart — eraser logic helpers

class EraserHandler {
  // SOFT ERASER: draws strokes with BlendMode.clear (semi-transparent erase)
  // HARD ERASER: draws strokes with BlendMode.clear + opacity=1.0 (full erase)

  // OBJECT ERASER: on tap → hitTest each stroke → remove the whole stroke
  bool strokeHitTest(StrokeModel stroke, Offset tapPoint, double eraserRadius) {
    return stroke.points.any((p) => (p - tapPoint).distance < eraserRadius);
  }
  // Usage: on GestureDetector.onTapDown → find & remove strokes that hitTest == true

  // AREA ERASER: drag to draw rectangle → remove everything inside rect
  List<StrokeModel> removeStrokesInRect(List<StrokeModel> strokes, Rect eraseRect) {
    return strokes.where((stroke) {
      // Keep stroke ONLY if NONE of its points are inside the eraseRect
      return !stroke.points.any((p) => eraseRect.contains(p));
    }).toList();
  }

  // AREA ERASER for objects:
  List<CanvasObjectModel> removeObjectsInRect(
    List<CanvasObjectModel> objects, Rect eraseRect) {
    return objects.where((obj) => !eraseRect.overlaps(obj.bounds)).toList();
  }
}
```

---

## 10. Shape Tools

### 10.1 Shape Creation Flow
```
User selects shape tool (e.g., Tool.rectangle)
    ↓
GestureDetector.onPanStart → record startPoint
    ↓
GestureDetector.onPanUpdate → compute bounds = Rect.fromPoints(start, current)
    ↓ (show live preview during drag)
GestureDetector.onPanEnd → create CanvasObjectModel → add to canvasProvider.objects
```

### 10.2 Shape Renderer (inside CanvasPainter._drawObject)
```dart
void _drawObject(Canvas canvas, CanvasObjectModel obj) {
  canvas.save();
  // Apply rotation
  if (obj.rotation != 0) {
    final center = obj.bounds.center;
    canvas.translate(center.dx, center.dy);
    canvas.rotate(obj.rotation * math.pi / 180);
    canvas.translate(-center.dx, -center.dy);
  }

  final fillPaint   = Paint()..color = obj.fillColor.withOpacity(obj.opacity);
  final borderPaint = Paint()
    ..color = obj.borderColor
    ..strokeWidth = obj.borderWidth
    ..style = PaintingStyle.stroke;

  switch (obj.type) {
    case ObjectType.rectangle:
      canvas.drawRect(obj.bounds, fillPaint);
      canvas.drawRect(obj.bounds, borderPaint);

    case ObjectType.roundedRect:
      final rrect = RRect.fromRectAndRadius(obj.bounds, const Radius.circular(12));
      canvas.drawRRect(rrect, fillPaint);
      canvas.drawRRect(rrect, borderPaint);

    case ObjectType.circle:
      canvas.drawOval(obj.bounds, fillPaint);
      canvas.drawOval(obj.bounds, borderPaint);

    case ObjectType.triangle:
      final path = Path()
        ..moveTo(obj.bounds.topCenter.dx, obj.bounds.top)
        ..lineTo(obj.bounds.bottomRight.dx, obj.bounds.bottom)
        ..lineTo(obj.bounds.bottomLeft.dx, obj.bounds.bottom)
        ..close();
      canvas.drawPath(path, fillPaint);
      canvas.drawPath(path, borderPaint);

    case ObjectType.arrow:
      _drawArrow(canvas, obj, borderPaint);

    // ... other types
  }
  canvas.restore();
}
```

### 10.3 Selection Handles
```dart
// When an object is selected, render 8 handles + 1 rotation handle
// Handles: 4 corners + 4 edge midpoints = 8 small squares
// Rotation handle: orange circle 30px above top-center

class SelectionHandlesPainter extends CustomPainter {
  final CanvasObjectModel selectedObject;
  final Color handleColor = Colors.white;
  final Color rotationHandleColor = AppColors.accentOrange;
  final double handleSize = 8.0;

  @override
  void paint(Canvas canvas, Size size) {
    final rect = selectedObject.bounds;

    // Dashed selection border
    _drawDashedRect(canvas, rect);

    // 8 resize handles
    final handlePositions = [
      rect.topLeft, rect.topCenter, rect.topRight,
      rect.centerLeft, rect.centerRight,
      rect.bottomLeft, rect.bottomCenter, rect.bottomRight,
    ];
    for (final pos in handlePositions) {
      canvas.drawRect(
        Rect.fromCenter(center: pos, width: handleSize, height: handleSize),
        Paint()..color = handleColor,
      );
    }

    // Rotation handle (orange circle above top-center)
    canvas.drawCircle(
      Offset(rect.topCenter.dx, rect.top - 30),
      8.0, Paint()..color = rotationHandleColor);
  }
}
```

---

## 11. Text Tools

### 11.1 TextBox — Flutter Overlay Approach
```dart
// Text editing uses a real Flutter TextField overlaid on canvas (NOT drawn with CustomPainter)
// Workflow:
//   1. Tool.textBox selected → user taps canvas
//   2. Insert OverlayEntry with TextField at tap position
//   3. User types text, adjusts font/size/color
//   4. On focus lost OR Enter pressed → serialize to CanvasObjectModel
//   5. Remove OverlayEntry → object now rendered by CanvasPainter

class CanvasTextEditor extends StatefulWidget {
  final Offset    position;    // tap position on canvas
  final TextStyle initialStyle;
  final Function(CanvasObjectModel) onComplete;

  // When complete, creates:
  // CanvasObjectModel(
  //   type: ObjectType.textBox,
  //   bounds: computed from text size + position,
  //   extra: {'text': '...', 'fontSize': 20, 'fontFamily': 'DM Sans',
  //           'bold': false, 'italic': false, 'color': '#FFFFFF'},
  // )
}
```

### 11.2 Hindi Text Support
```dart
// Language toggle button in text format bar: [A English] ↔ [अ Hindi]
// When Hindi mode selected:
//   - TextStyle uses GoogleFonts.notoSansDevanagari()
//   - On Android/Windows: system IME handles Devanagari keyboard
//   - Show hint: "अपना पाठ टाइप करें"

// Example:
TextField(
  style: isHindi
    ? GoogleFonts.notoSansDevanagari(fontSize: 20, color: Colors.white)
    : GoogleFonts.dmSans(fontSize: 20, color: Colors.white),
  textInputAction: TextInputAction.done,
  onSubmitted: (text) => _finalizeText(text),
)
```

### 11.3 Sticky Note
```dart
// StickyNote = colored Container (shadow) + TextField
// Store as: CanvasObjectModel(type: ObjectType.stickyNote, ...)
// Colors: 5 presets — Yellow(0xFFFFF176), Blue(0xFF90CAF9), Pink(0xFFF48FB1), Green(0xFFA5D6A7), Orange(0xFFFFCC80)
// Draggable: wrap entire widget in a Draggable that updates bounds in canvasProvider
// Resizable: drag bottom-right corner → update bounds.size
```

---

## 12. Selection & Object Manipulation

```dart
// lib/core/utils/canvas_utils.dart

class SelectionHandler {
  // Single tap → find topmost object at tap point
  CanvasObjectModel? hitTestSingle(List<CanvasObjectModel> objects, Offset point) {
    for (final obj in objects.reversed) {     // reversed = topmost first
      final inflatedBounds = obj.bounds.inflate(8); // 8px hit tolerance
      if (inflatedBounds.contains(point)) return obj;
    }
    return null;
  }

  // Drag select → all objects inside rubber-band rect
  List<CanvasObjectModel> hitTestRect(
    List<CanvasObjectModel> objects, Rect selectionRect) {
    return objects.where((obj) => selectionRect.overlaps(obj.bounds)).toList();
  }
}

// All manipulation methods in CanvasNotifier:
void moveSelectedObjects(Offset delta) { ... }    // translate bounds
void resizeObject(String id, Rect newBounds) { .. }
void rotateObject(String id, double degrees) { .. }
void flipObjectH(String id) { ... }               // mirror horizontally
void flipObjectV(String id) { ... }               // mirror vertically
void groupObjects(List<String> ids) { ... }        // create compound object
void ungroupObject(String groupId) { ... }
void bringToFront(String id) { ... }              // move to end of objects list
void sendToBack(String id) { ... }                // move to start of objects list
void lockObject(String id, bool locked) { ... }
void deleteSelected() { ... }
void duplicateSelected() { ... }                  // clone with +20,+20 offset
```

---

## 13. Tool Library System

### 13.1 Architecture
```
Tool Library Drawer (left-side AnimatedContainer)
└── Tabs: Writing | Shapes | Subject | Teaching | Media
    └── GridView of ToolTile widgets
        └── Long-press → "Pin to Toolbar"
            OR drag → DragTarget on BottomMainToolbar
```

### 13.2 ToolDefinition
```dart
class ToolDefinition {
  final Tool     tool;
  final String   label;
  final IconData icon;
  final String   category;   // 'writing' | 'shapes' | 'math' | 'teaching' | 'media'
  final bool     isPinned;
  final int?     toolbarSlot; // 0–9 position in bottom toolbar, null = not pinned
  final bool     isPremium;   // future: show lock icon if not subscribed
}

// Complete tool catalog (define ALL tools here)
const List<ToolDefinition> allTools = [
  ToolDefinition(tool: Tool.softPen,      label: 'Soft Pen',    icon: Icons.edit,       category: 'writing'),
  ToolDefinition(tool: Tool.highlighter,  label: 'Highlighter', icon: Icons.highlight,  category: 'writing'),
  ToolDefinition(tool: Tool.chalk,        label: 'Chalk',       icon: Icons.draw,       category: 'writing'),
  ToolDefinition(tool: Tool.laserPointer, label: 'Laser',       icon: Icons.adjust,     category: 'writing'),
  // ... all 40+ tools defined here
];
```

### 13.3 Main Toolbar Customization
```dart
// Bottom toolbar shows only pinned tools (max 10 slots)
// Save/load pinned tools via SharedPreferences:
//   Key: 'toolbar_pinned_{teacherId}'
//   Value: JSON list of Tool names

// Default pinned tools (on first launch):
const List<Tool> defaultPinnedTools = [
  Tool.softPen, Tool.highlighter, Tool.hardEraser,
  Tool.rectangle, Tool.textBox,
];
// Color picker is ALWAYS in toolbar (slot 0, not removable)

// Toolbar Profiles (save named configs):
// Key: 'toolbar_profile_{name}' in Hive
// Example profiles: "Math Class", "GK Class", "Default"

// Drag-to-pin:
// ToolTile → Draggable<ToolDefinition>
// ToolbarSlot → DragTarget<ToolDefinition>
// On accept: update toolProvider pinned list + save to SharedPreferences
```

---

## 14. Subject-Specific Tool Modes

### 14.1 Subject Mode Switch
```dart
enum SubjectMode { general, math, physics, chemistry, englishHindi, sscRailway, upsc }

final subjectModeProvider = StateProvider<SubjectMode>((ref) => SubjectMode.general);

// On mode change:
// - Tool Library filters to show subject-relevant tools first
// - Toolbar profile auto-loads if saved profile exists for this mode
```

### 14.2 Math Tools

**Ruler:**
```dart
// RulerWidget: draggable + rotatable widget in MathToolOverlay layer
// Renders as yellow rectangle (400×40px) with tick marks every 10px
// GestureDetector: pan to move, rotate handle on one end
// When pen is near ruler edge (within 15px): stroke snaps to ruler line
class RulerWidget extends StatefulWidget {
  Offset position;     // center of ruler
  double rotation;     // degrees
  double length;       // px (default 400)
}
```

**Protractor:**
```dart
// Semicircular widget, draggable, shows 0°–180° markings
// Use CustomPainter to draw semicircle + degree labels
class ProtractorWidget extends StatefulWidget {
  Offset position;
  double rotation;
}
```

**Compass:**
```dart
// Shows pivot point + radius arm widget
// Drag arm end → on release: call canvasProvider.addObject(CircleObject)
// Show radius value in a label beside arm
class CompassWidget extends StatefulWidget {
  Offset  pivotPoint;
  double  radiusLength; // px
  // On drag complete: compute radius from pivotPoint to armEnd
  // Add: CanvasObjectModel(type: ObjectType.circle, bounds: Rect.fromCircle(...))
}
```

**Function Plotter:**
```dart
// Bottom panel: TextField "y = " + [Plot] button
// On Plot:
//   1. Parse equation (support: linear ax+b, quadratic ax²+bx+c, sin, cos)
//   2. Generate (x, y) pairs for x in [-10, 10] step 0.1
//   3. Map to canvas coordinates using coordinate grid transform
//   4. Add as StrokeModel (type: special plotCurve, do NOT apply perfect_freehand)

// Coordinate grid drawing:
// Draw X and Y axis lines on canvas as CanvasObjectModel
// Draw grid lines at configurable intervals
```

**Formula Library:**
```dart
// Searchable list of 100+ formulas
// Each formula stored as LaTeX string
// On select: render with flutter_math_fork → place as CanvasObjectModel on canvas
// Categories: Algebra, Geometry, Trigonometry, Calculus, Physics, Chemistry
```

### 14.3 Chemistry Mode — Periodic Table
```dart
// Full-screen dialog: 118 elements in standard grid layout
// Each cell: symbol + atomic number + atomic mass
// Tap cell → show detail card (element name, electron config, group, period)
// [Insert to Canvas] button → adds element info card as CanvasObjectModel
```

### 14.4 Physics Mode — Circuit Builder
```dart
// Pre-loaded SVG symbols library: resistor, capacitor, battery, LED, switch, bulb, ground
// Teacher taps symbol → places on canvas as CanvasObjectModel(type: ObjectType.imageBox)
//   extra: {'svgAsset': 'assets/circuit/resistor.svg'}
// Connect with Tool.line to draw wires
```

### 14.5 Geography/UPSC — India Map
```dart
// SVG of India with states as named paths
// Render with flutter_svg inside a dialog overlay
// Tap state → show state name + capital callout
// [Insert to Canvas] → places map SVG as CanvasObjectModel
// States can be filled with custom color (edit SVG path fill at runtime)
```

---

## 15. Set ID Import — PPT Slide Mode

> **This is EduBoard Pro's most important and unique feature.**

### 15.1 Import Dialog
```dart
// lib/features/whiteboard/presentation/screens/set_import_dialog.dart

class SetImportDialog extends ConsumerStatefulWidget {
  // UI:
  //   Title: "Import Question Set"
  //   TextField: Set ID (keyboardType: number, maxLength: 6)
  //   TextField: Password (obscureText: true, optional)
  //   [Import] ElevatedButton (orange)
  //   [Cancel] TextButton

  // On [Import] tap:
  //   1. Validate: setId != null && setId.length == 6
  //   2. setState → showLoading = true
  //   3. await setRepository.fetchSetMetadata(setId, password)
  //   4. If success → await setRepository.fetchSlides(setId)
  //   5. ref.read(slideProvider.notifier).loadSlides(slides, metadata)
  //   6. ref.read(appModeProvider.notifier).state = AppMode.slideMode
  //   7. Navigator.pop(context)

  // Error handling (show SnackBar with message):
  //   404 → "Set ID not found. Please check the ID."
  //   401 → "Incorrect password."
  //   timeout → "Connection timeout. Check internet and try again."
  //   other → "Failed to load set. Please try again."
}
```

### 15.2 Slide Provider
```dart
// lib/features/whiteboard/presentation/providers/slide_provider.dart

@riverpod
class SlideNotifier extends _$SlideNotifier {
  @override
  SlideState build() => SlideState.empty();

  void loadSlides(List<SetSlideModel> slides, SetMetadataModel metadata) {
    state = SlideState(
      slides:              slides,
      metadata:            metadata,
      currentSlideIndex:   0,
      isSlideMode:         true,
    );
  }

  void goToSlide(int targetIndex) {
    // 1. Save current slide's annotation to sessionProvider
    final currentId = state.currentSlide.slideId;
    final currentStrokes  = ref.read(canvasProvider).strokes;
    final currentObjects  = ref.read(canvasProvider).objects;
    ref.read(sessionProvider.notifier)
      .saveSlideAnnotation(currentId, currentStrokes, currentObjects);

    // 2. Clear canvas
    ref.read(canvasProvider.notifier).clearCurrentSlide();

    // 3. Load target slide's saved annotation (if any)
    final saved = ref.read(sessionProvider).getAnnotation(
      state.slides[targetIndex].slideId
    );
    if (saved != null) {
      ref.read(canvasProvider.notifier).loadStrokes(saved.strokes);
      ref.read(canvasProvider.notifier).loadObjects(saved.objects);
    }

    // 4. Update index
    state = state.copyWith(currentSlideIndex: targetIndex);
  }

  void nextSlide() => goToSlide(
    (state.currentSlideIndex + 1).clamp(0, state.slides.length - 1));

  void prevSlide() => goToSlide(
    (state.currentSlideIndex - 1).clamp(0, state.slides.length - 1));
}
```

### 15.3 Question Slide Renderer
```dart
// lib/features/whiteboard/presentation/widgets/slides/question_slide_renderer.dart
// This is SlideContentLayer — READ-ONLY, no user interaction
// Renders: background → exam badge → question number → question HTML → options

class QuestionSlideRenderer extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final slide  = ref.watch(currentSlideProvider);
    final colors = ref.watch(slideColorConfigProvider(slide.slideId));

    return Stack(
      fit: StackFit.expand,
      children: [
        // 1. Background
        _buildBackground(slide, colors),

        // 2. Exam source badge (top-right pill)
        if (slide.examSource != null)
          Positioned(
            top: 12, right: 12,
            child: _buildExamBadge(slide.examSource!),
          ),

        // 3. Main content (question + options)
        Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Question number
              Text('QN${slide.questionNumber}.',
                style: AppTextStyles.slideQuestion.copyWith(
                  color: colors.questionTextColor)),
              const SizedBox(height: 12),

              // Question text (HTML rendered)
              // flutter_widget_from_html handles: <b>,<i>,<sub>,<sup>,<img>,<br>
              HtmlWidget(
                slide.questionText,
                textStyle: AppTextStyles.slideQuestion.copyWith(
                  color: colors.questionTextColor),
                onLoadingBuilder: (_, __, ___) =>
                  const CircularProgressIndicator(),
              ),

              // Question image (if separate from HTML)
              if (slide.questionImageUrl != null) ...[
                const SizedBox(height: 16),
                CachedNetworkImage(imageUrl: slide.questionImageUrl!,
                  height: 200, fit: BoxFit.contain),
              ],

              const SizedBox(height: 24),

              // Options A, B, C, D (2x2 grid or 4 rows depending on text length)
              ...slide.options.map((option) => _buildOption(option, colors)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildOption(SlideOption option, SlideColorConfig colors) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(children: [
        Text('(${option.label})',
          style: AppTextStyles.slideOption.copyWith(color: colors.optionTextColor)),
        const SizedBox(width: 8),
        Expanded(
          child: Text(option.text,
            style: AppTextStyles.slideOption.copyWith(color: colors.optionTextColor)),
        ),
        if (option.imageUrl != null)
          CachedNetworkImage(imageUrl: option.imageUrl!, height: 60),
      ]),
    );
  }
}
```

### 15.4 Slide Panel (Right Side Thumbnails)
```dart
// lib/features/whiteboard/presentation/widgets/slides/slide_panel.dart
// Shows mini thumbnails of all slides, scrollable
// Current slide: highlighted with orange border
// Tap thumbnail → goToSlide(index)
// Drag to reorder → ReorderableListView
// Context menu (right-click or long-press):
//   [Insert blank slide before] [Insert blank slide after] [Delete slide]

class SlidePanelDrawer extends ConsumerWidget {
  // AnimatedContainer: width 0 ↔ 180px (collapsible)
  // ReorderableListView of SlideThumbnail widgets
}

class SlideThumbnail extends StatelessWidget {
  final SetSlideModel slide;
  final bool          isActive;
  final int           index;
  // Size: 160×90px (16:9 ratio)
  // Shows: question number text + mini preview (just text, no full render)
  // Active border: 2px solid AppColors.accentOrange
}
```

### 15.5 Answer Reveal Mode
```dart
// [Reveal Answer] button hidden during class (only teacher can see/trigger)
// On tap: show correct answer with animation

class AnswerRevealOverlay extends ConsumerWidget {
  // Finds correct option → applies:
  //   Correct: Container(color: AppColors.success.withOpacity(0.3)) + ✓ icon
  //   Wrong options: opacity reduced to 0.4
  // Animation: use flutter_animate → fade in green highlight + bounce ✓
  // Toggle: tap again → hide reveal
}
```

---

## 16. Slide Color Customization

### 16.1 SlideColorConfig
```dart
// lib/features/set_import/data/models/slide_color_config.dart

@HiveType(typeId: 6)
class SlideColorConfig {
  @HiveField(0) final Color questionTextColor; // default: white
  @HiveField(1) final Color questionBgColor;   // default: transparent
  @HiveField(2) final Color optionTextColor;   // default: yellow (#FFFF00) — matches screenshot
  @HiveField(3) final Color optionBgColor;     // default: transparent
  @HiveField(4) final Color screenBgColor;     // default: black (#000000)

  static const SlideColorConfig defaultConfig = SlideColorConfig(
    questionTextColor: Color(0xFFFFFFFF),
    questionBgColor:   Colors.transparent,
    optionTextColor:   Color(0xFFFFFF00),   // Yellow like in screenshot
    optionBgColor:     Colors.transparent,
    screenBgColor:     Color(0xFF000000),
  );
}

// Provider: per-slide, falls back to default
final slideColorConfigProvider = StateProviderFamily<SlideColorConfig, String>(
  (ref, slideId) => SlideColorConfig.defaultConfig
);
```

### 16.2 Color Picker Dialog (Matches Screenshot Exactly)
```dart
// lib/features/whiteboard/presentation/widgets/toolbar/color_picker_panel.dart
// Shown when: teacher taps [Color Customize] button in slide mode

class SlideColorPickerDialog extends ConsumerStatefulWidget {
  final String slideId;

  // STATE:
  // activeTab: 'questionText' | 'questionBg' | 'optionText' | 'optionBg' | 'screenBg'
  // currentColor: Color (starts with the current value of activeTab)
  // applyToAll: bool (false = current slide only, true = all slides)

  // UI Layout:
  // Row of 5 tab buttons at top (teal highlight on active tab)
  //   [QUESTION COLOR] [QUESTION BACKGROUND COLOR] [OPTION COLOR] [OPTION BACKGROUND COLOR] [SCREEN BACKGROUND COLOR]
  //
  // ColorPicker (flutter_colorpicker HSV picker):
  //   - Gradient square picker (saturation/value)
  //   - Hue slider at bottom
  //
  // Hex + RGBA fields:
  //   [Hex: 000000] [R: 0] [G: 0] [B: 0] [A: 100]
  //
  // Color swatches: 16 preset colors (2 rows of 8)
  //
  // "Update Position" toggle → maps to applyToAll
  //
  // [Apply] ElevatedButton → calls ref.read(slideColorConfigProvider(slideId).notifier)
  //         If applyToAll: update all slide configs
  //
  // LIVE PREVIEW: as user drags color picker → update canvas instantly
  //   (use onColorChanging callback, not just onColorChanged)
}
```

### 16.3 Background Image
```dart
// Teacher can set custom background image per slide
// UI: long-press canvas in slide mode → ContextMenu:
//   [Set Background Image] → file_picker → pick image
//   [Remove Background]    → clear background path
//   Background Opacity     → Slider 0.3–1.0

// Storage: slideBackgrounds map in SessionModel
//   Key: slideId, Value: local file path (String)

// Render in BackgroundLayer:
Widget _buildBackground(SetSlideModel slide, SlideColorConfig colors, String? localBgPath) {
  if (localBgPath != null) {
    return Opacity(
      opacity: bgOpacity,     // from provider, default 0.7
      child: Image.file(File(localBgPath), fit: BoxFit.cover),
    );
  }
  // Fallback to S3 URL from slide data
  if (slide.backgroundImageUrl != null) {
    return CachedNetworkImage(
      imageUrl: slide.backgroundImageUrl!,
      fit: BoxFit.cover,
      color: Colors.black.withOpacity(1 - bgOpacity), // darken effect
      colorBlendMode: BlendMode.darken,
    );
  }
  // Default: solid color from SlideColorConfig
  return Container(color: colors.screenBgColor);
}
```

---

## 17. Auto-Save & Session Management

### 17.1 Auto-Save Strategy
```dart
// lib/features/whiteboard/presentation/providers/session_provider.dart

@riverpod
class SessionNotifier extends _$SessionNotifier {
  Timer? _autoSaveTimer;  // fires every 30 seconds
  Timer? _dirtyDebounce;  // fires 5s after last canvas change

  @override
  SessionState build() {
    // Start 30-second periodic auto-save timer immediately
    _autoSaveTimer = Timer.periodic(
      const Duration(seconds: 30), (_) => _performSave());
    // Cancel timer when provider is disposed
    ref.onDispose(() {
      _autoSaveTimer?.cancel();
      _dirtyDebounce?.cancel();
    });
    return SessionState.initial();
  }

  // Called by CanvasNotifier.endStroke() and any canvas change
  void markDirty() {
    state = state.copyWith(saveStatus: SaveStatus.unsaved);
    _dirtyDebounce?.cancel();
    _dirtyDebounce = Timer(const Duration(seconds: 5), _performSave);
  }

  Future<void> _performSave() async {
    state = state.copyWith(saveStatus: SaveStatus.saving);
    try {
      final payload = _buildAutoSavePayload(); // build JSON from Section 4.4.2

      // 1. Always save to Hive first (instant local backup, works offline)
      await ref.read(hiveServiceProvider).saveSession(payload);

      // 2. If online → PUT /whiteboard/session/{sessionId} on backend
      if (ref.read(isOnlineProvider).valueOrNull == true) {
        final sessionId = state.sessionId;  // from startSession response
        if (sessionId != null) {
          await ref.read(whiteboardRemoteDsProvider)
              .autoSave(sessionId, payload);
          // Backend: PUT /whiteboard/session/{sessionId}
          // Body: annotations + colorConfigs + slideBackgrounds JSON
        }
      } else {
        // Add to pending sync queue → will sync when internet returns
        await ref.read(hiveServiceProvider).addToPendingSync(payload);
      }

      state = state.copyWith(
        saveStatus:  SaveStatus.saved,
        lastSavedAt: DateTime.now(),
      );
    } catch (e) {
      state = state.copyWith(saveStatus: SaveStatus.failed);
      // Hive backup already done — data not lost even if API fails
    }
  }
}

enum SaveStatus { idle, unsaved, saving, saved, failed }
```

### 17.2 Save Status Widget (TopBar)
```dart
// TopBar shows save status with icon + text
// Update: watch sessionProvider.saveStatus

Widget buildSaveStatusWidget(SaveStatus status, DateTime? lastSaved) {
  return switch (status) {
    SaveStatus.unsaved => Row(children: [
      Container(width: 8, height: 8, decoration: BoxDecoration(
        color: AppColors.error, shape: BoxShape.circle)),
      const SizedBox(width: 4),
      Text('Unsaved', style: TextStyle(color: AppColors.error, fontSize: 12)),
    ]),
    SaveStatus.saving => const Row(children: [
      SizedBox(width: 12, height: 12, child: CircularProgressIndicator(strokeWidth: 2)),
      SizedBox(width: 4),
      Text('Saving...', style: TextStyle(fontSize: 12)),
    ]),
    SaveStatus.saved => Row(children: [
      Icon(Icons.check_circle, color: AppColors.success, size: 14),
      const SizedBox(width: 4),
      Text('Saved ${_timeAgo(lastSaved)}', style: TextStyle(color: AppColors.success, fontSize: 12)),
    ]),
    SaveStatus.failed => const Row(children: [
      Icon(Icons.warning_amber, color: AppColors.warning, size: 14),
      SizedBox(width: 4),
      Text('Save failed — tap to retry', style: TextStyle(fontSize: 12)),
    ]),
    _ => const SizedBox.shrink(),
  };
}
```

### 17.3 Session Recovery on App Launch
```dart
// In main.dart, before showing WhiteboardScreen, check for saved session
// Priority: Server se restore karo → agar offline to Hive se

Future<void> checkAndRestoreSession(BuildContext context, WidgetRef ref) async {
  // 1. Hive se last active sessionId lo
  final lastSessionId = await ref.read(hiveServiceProvider).getLastSessionId();
  if (lastSessionId == null) return;

  // 2. Server se latest session data fetch karo (most up-to-date)
  Map<String, dynamic>? sessionData;
  if (ref.read(isOnlineProvider).valueOrNull == true) {
    try {
      // GET /whiteboard/session/{sessionId}
      sessionData = await ref.read(whiteboardRemoteDsProvider)
          .fetchSession(lastSessionId);
    } catch (_) {
      // Server fail → fallback to Hive
      sessionData = await ref.read(hiveServiceProvider).getSession(lastSessionId);
    }
  } else {
    // Offline → use Hive
    sessionData = await ref.read(hiveServiceProvider).getSession(lastSessionId);
  }

  if (sessionData == null) return;

  // 3. Show recovery dialog
  final shouldRestore = await showDialog<bool>(
    context: context,
    barrierDismissible: false,
    builder: (_) => AlertDialog(
      backgroundColor: AppColors.bgCard,
      title: const Text('Previous Session Found'),
      content: Text(
        'Set ID: ${sessionData!['setId']}\n'
        'Slides covered: ${sessionData['slidesCovered']}\n'
        'Last saved: ${_formatTime(sessionData['lastSaved'])}',
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context, false),
          child: const Text('Start Fresh')),
        ElevatedButton(
          onPressed: () => Navigator.pop(context, true),
          child: const Text('✓ Restore Session')),
      ],
    ),
  );

  if (shouldRestore == true) {
    // Restore: load questions + restore all annotations + colors + slide index
    await ref.read(sessionProvider.notifier).restoreFromData(sessionData!);
    // Questions reload: GET /whiteboard/sets/{setId}/questions
    // Then apply saved annotations on top of fresh questions
  }
}
```

---

## 18. End Class — PDF Export & Cloud Upload

### 18.1 End Class Dialog (Real Backend API Sequence)
```dart
// Teacher taps [End Class] button in TopBar
// → ShowDialog: EndClassDialog

class EndClassDialog extends ConsumerWidget {
  // Shows:
  //   📊 Class Summary
  //   ──────────────────────
  //   Duration:       1h 23m
  //   Slides Covered: 14 / 20
  //   Strokes Made:   347
  //
  //   Export Options (CheckboxListTile):
  //   [✓] Upload to Cloud (PDF → Set 505955)   ← POST /session/{id}/upload-pdf
  //   [✓] Save Local Copy (PDF to Downloads)
  //
  //   [Confirm & End Class] → ElevatedButton (orange)
  //   [Cancel] → TextButton
  //   [Discard Session] → TextButton (red, confirm dialog)

  // On [Confirm & End Class]:
  //   STEP 1: Final auto-save
  //     PUT /whiteboard/session/{sessionId}  ← last complete state save
  //
  //   STEP 2: End session on server
  //     POST /whiteboard/session/{sessionId}/end
  //     Body: { endedAt, totalDuration, slidesCovered, totalSlides, strokeCount }
  //
  //   STEP 3: Generate PDF (background isolate)
  //     dart:pdf library → all slides + annotations → Uint8List
  //
  //   STEP 4: Upload PDF to server (if [Upload to Cloud] checked)
  //     POST /whiteboard/session/{sessionId}/upload-pdf  (multipart)
  //     → Returns pdfUrl (S3 URL)
  //     → Admin Panel shows this PDF under Set 505955 → Class Notes tab
  //     → Students can download from Student App
  //
  //   STEP 5: Save local copy (if [Save Local Copy] checked)
  //     Downloads folder pe PDF save
  //
  //   STEP 6: Show success SnackBar
  //     "✓ Class notes uploaded! Accessible via Set 505955"
  //     [View PDF] button → opens pdfUrl in browser
}
```

### 18.2 PDF Generation
```dart
// lib/features/export/pdf_export_service.dart
// Run in compute() isolate — NEVER on main thread (will freeze UI)

Future<Uint8List> generateClassPdf(WhiteboardSessionModel session,
    List<SetSlideModel> slides) async {
  return compute(_generatePdfIsolate,
    {'session': session.toJson(), 'slides': slides.map((s) => s.toJson()).toList()});
}

// This function runs in a background isolate
Uint8List _generatePdfIsolate(Map<String, dynamic> data) {
  final session = WhiteboardSessionModel.fromJson(data['session']);
  final slides  = (data['slides'] as List)
      .map((s) => SetSlideModel.fromJson(s)).toList();

  final pdf = pw.Document(
    title:   '${session.setId} Class Notes',
    author:  session.teacherName,
    creator: 'EduBoard Pro',
  );

  for (final slide in slides) {
    final annotation = session.slideAnnotations[slide.slideId];
    final colors     = session.slideColors[slide.slideId] ??
                       SlideColorConfig.defaultConfig;

    pdf.addPage(
      pw.Page(
        pageFormat: const PdfPageFormat(1920, 1080), // 16:9
        build: (pw.Context ctx) => pw.Stack(
          children: [
            // Layer 1: Background
            pw.Container(color: PdfColor.fromInt(colors.screenBgColor.value)),
            // Layer 2: Question content (text)
            _buildPdfSlideContent(slide, colors),
            // Layer 3: Teacher annotations (strokes → PDF paths)
            if (annotation != null) _buildPdfAnnotations(annotation.strokes),
          ],
        ),
      ),
    );
  }

  return pdf.save() as Uint8List;
}

// Convert Flutter strokes to pdf-lib paths
pw.Widget _buildPdfAnnotations(List<StrokeModel> strokes) {
  return pw.CustomPaint(
    painter: (PdfGraphics g, PdfPoint s) {
      for (final stroke in strokes) {
        if (stroke.points.length < 2) continue;
        g.setStrokeColor(PdfColor.fromInt(stroke.color.value));
        g.setLineWidth(stroke.strokeWidth);
        g.moveTo(stroke.points.first.dx, s.y - stroke.points.first.dy); // flip Y (PDF coords)
        for (final pt in stroke.points.skip(1)) {
          g.lineTo(pt.dx, s.y - pt.dy);
        }
        g.strokePath();
      }
    },
    size: const PdfPoint(1920, 1080),
  );
}
```

### 18.3 Cloud Upload
```dart
// lib/features/export/cloud_upload_service.dart

Future<String> uploadPdfToCloud(String setId, Uint8List pdfBytes, String teacherName) async {
  final date     = DateFormat('yyyyMMdd').format(DateTime.now());
  final filename = '${setId}_${teacherName}_${date}_class-notes.pdf';

  final formData = FormData.fromMap({
    'pdf': MultipartFile.fromBytes(
      pdfBytes,
      filename: filename,
      contentType: MediaType('application', 'pdf'),
    ),
    'setId':       setId,
    'teacherName': teacherName,
    'uploadedAt':  DateTime.now().toIso8601String(),
  });

  final response = await ref.read(dioProvider)
      .post('/sets/$setId/whiteboard-pdf', data: formData,
            onSendProgress: (sent, total) {
              // Update upload progress provider
              ref.read(uploadProgressProvider.notifier).state = sent / total;
            });

  return response.data['url'] as String; // S3 URL of uploaded PDF
}
```

### 18.4 Local Export
```dart
// Save PDF to downloads folder
Future<void> saveLocalPdf(Uint8List pdfBytes, String setId) async {
  final dir  = await getDownloadsDirectory();
  final date = DateFormat('yyyyMMdd_HHmm').format(DateTime.now());
  final file = File('${dir!.path}/eduhub_${setId}_$date.pdf');
  await file.writeAsBytes(pdfBytes);
  // Show SnackBar: "PDF saved to Downloads folder"
}

// PNG export: capture each slide as image then ZIP
Future<void> exportAsPngZip(List<GlobalKey> slideKeys, String setId) async {
  final archive = Archive();
  for (int i = 0; i < slideKeys.length; i++) {
    final boundary = slideKeys[i].currentContext!.findRenderObject()!
        as RenderRepaintBoundary;
    final image = await boundary.toImage(pixelRatio: 2.0);
    final bytes = (await image.toByteData(format: ui.ImageByteFormat.png))!
        .buffer.asUint8List();
    archive.addFile(ArchiveFile('slide_${(i+1).toString().padLeft(2,'0')}.png',
        bytes.length, bytes));
  }
  final zipBytes = ZipEncoder().encode(archive)!;
  final dir  = await getDownloadsDirectory();
  await File('${dir!.path}/eduhub_${setId}_slides.zip').writeAsBytes(zipBytes);
}
```

---

## 19. Advanced Teaching Tools

### 19.1 Spotlight Tool
```dart
// lib/features/whiteboard/presentation/widgets/overlays/spotlight_overlay.dart
// CustomPainter that dims everything except a hole around cursor

class SpotlightPainter extends CustomPainter {
  final Offset position;
  final double radius;
  final double darkness;  // 0.0–1.0, default 0.75

  @override
  void paint(Canvas canvas, Size size) {
    // Step 1: fill screen with dark overlay
    canvas.drawRect(
      Offset.zero & size,
      Paint()..color = Colors.black.withOpacity(darkness),
    );
    // Step 2: punch transparent hole at spotlight position
    // Use BlendMode.clear on a layer
    canvas.saveLayer(Offset.zero & size, Paint());
    canvas.drawRect(Offset.zero & size,
      Paint()..color = Colors.black.withOpacity(darkness));
    canvas.drawCircle(position, radius,
      Paint()..blendMode = BlendMode.clear);
    canvas.restore();
  }
  @override
  bool shouldRepaint(SpotlightPainter old) =>
    old.position != position || old.radius != radius;
}

// Spotlight widget:
// MouseRegion → onHover → update spotlightPositionProvider
// Mouse scroll → update spotlightRadiusProvider (100–400px)
// Shape toggle: circle | rectangle | oval
```

### 19.2 Screen Cover (Curtain)
```dart
// lib/features/whiteboard/presentation/widgets/overlays/screen_cover_overlay.dart

class ScreenCoverOverlay extends ConsumerStatefulWidget {
  // State: coverDirection (top|bottom|left|right), revealAmount (0.0–1.0)
  // Render: Container covering (1 - revealAmount) fraction of screen from direction
  // GestureDetector: drag cover edge → update revealAmount
  // Color: configurable, default black
  // Toggle: tap toolbar button → show/hide overlay
}
```

### 19.3 Zoom Lens
```dart
// Magnifier circle that follows cursor, shows zoomed view of canvas underneath

class ZoomLensOverlay extends ConsumerStatefulWidget {
  // Size: 200×200 circle
  // Zoom factor: 2x–5x (configurable via scroll)
  // Implementation:
  //   - Get canvas render object
  //   - Use ClipOval + Transform.scale centered on lens position
  //   - Show magnified portion of canvas
  //   - Position: follows pointer via MouseRegion
}
```

### 19.4 Countdown Timer Widget
```dart
// Draggable widget placed anywhere on canvas as overlay (NOT on canvas layer)
// Styles: [Digital] [Clock Face] [Progress Arc]

class CountdownTimer extends ConsumerStatefulWidget {
  final int initialSeconds;  // configurable: 30s, 1min, 2min, 3min, 5min, custom

  // AnimationController: duration = initialSeconds
  // On complete: shake animation + flash red + play beep sound (AudioPlayer)
  // Controls: [▶ Start] [⏸ Pause] [↺ Reset] [+30s]
  // Draggable: wrap in GestureDetector for drag
}
```

### 19.5 Class Session Timer (Top Bar)
```dart
// Stopwatch that starts when whiteboard opens
// Display: "01:23:45" format
// Tap → show session stats popup:
//   Slides Covered: 14 / 20
//   Total Annotations: 347 strokes
//   Auto-saves: 28 times
//   Started: 7:02 PM
```

### 19.6 Random Picker
```dart
class RandomPickerWidget extends StatefulWidget {
  // Input: multiline TextField (enter names, one per line)
  // [Pick] button → AnimationController (2s spin animation using flutter_animate)
  //   → slow down → stop at random selection
  // Result shown with Lottie confetti animation
  // "Pick Again" button
}
```

### 19.7 Navigation Mini-Map
```dart
// lib/features/whiteboard/presentation/widgets/overlays/navigation_map_widget.dart
// Position: Positioned(bottom: 16, right: 16) in CanvasArea Stack

class NavigationMapWidget extends ConsumerWidget {
  // Size: 160×90px (16:9 ratio)
  // Render: scaled-down version of canvas content (use RepaintBoundary.toImage())
  // Red rectangle: shows current viewport bounds (watch canvasTransformProvider)
  // Tap on map → calculate target canvas position → update InteractiveViewer transform
  // Toggle on/off with button in toolbar
}
```

---

## 20. Multimedia & Resource Bank

### 20.1 Resource Bank Drawer
```dart
// Right-side drawer OR bottom sheet (configurable)
// Tabs: [My Images] [My PDFs] [Templates] [Org Library]

class ResourceBankDrawer extends ConsumerWidget {
  // GridView of resource thumbnails
  // Tap → insert to canvas as CanvasObjectModel
  // Long-press → preview → delete
  // [+ Add] button → file_picker for each tab type
}
```

### 20.2 Image Import
```dart
void importImageFromFile() async {
  final result = await FilePicker.platform.pickFiles(
    type: FileType.image, allowMultiple: false);
  if (result == null || result.files.isEmpty) return;

  final path = result.files.single.path!;
  final imageSize = await _getImageSize(path); // decode image → get width/height

  ref.read(canvasProvider.notifier).addObject(CanvasObjectModel(
    id:          const Uuid().v4(),
    type:        ObjectType.imageBox,
    bounds:      Rect.fromCenter(
      center: _canvasCenter(),
      width:  math.min(imageSize.width, 600),
      height: math.min(imageSize.height, 400)),
    fillColor:   Colors.transparent,
    borderColor: Colors.transparent,
    borderWidth: 0,
    opacity:     1.0,
    isLocked:    false,
    extra:       {'localPath': path},
  ));
}
```

### 20.3 PDF Import
```dart
Future<void> importPdfFile() async {
  final result = await FilePicker.platform.pickFiles(type: FileType.custom, allowedExtensions: ['pdf']);
  if (result == null) return;

  final doc = await PdfDocument.openFile(result.files.single.path!);
  for (int i = 1; i <= doc.pagesCount; i++) {
    final page  = await doc.getPage(i);
    final image = await page.render(width: 1920, height: 1080, backgroundColor: '#000000');
    await page.close();
    // Add as new canvas page with rendered image as background
    ref.read(canvasProvider.notifier).addPageWithBackground(image!.bytes);
  }
  await doc.close();
}
```

### 20.4 Video on Canvas
```dart
// video_player package: VideoPlayerController
// Placed as overlay widget (not inside CustomPainter)
// Container: draggable, resizable

class VideoCanvasWidget extends StatefulWidget {
  final String videoPath;  // local file path or network URL

  // VideoPlayerController.file(File(path)) OR .networkUrl(Uri.parse(url))
  // Controls: play/pause overlay + seek bar
  // "Draw over video" toggle: when ON, annotation layer is active on top
  // Draggable: GestureDetector for drag
  // Resize: corner handle
}
```

### 20.5 Whiteboard Templates
```dart
// Templates stored as JSON files in assets/templates/
// Each template = list of pre-positioned CanvasObjectModel JSON

const List<WhiteboardTemplate> templates = [
  WhiteboardTemplate(id: 'question_solution', name: 'Question + Solution',
    description: 'Question box on top, solution area below'),
  WhiteboardTemplate(id: 'comparison_table',  name: 'Comparison Table'),
  WhiteboardTemplate(id: 'timeline',          name: 'Timeline'),
  WhiteboardTemplate(id: 'mind_map',          name: 'Mind Map'),
  WhiteboardTemplate(id: 'step_by_step',      name: 'Step-by-Step Solution'),
  WhiteboardTemplate(id: 'diagram_notes',     name: 'Diagram + Notes'),
];

// On template select:
// 1. Load JSON from assets
// 2. Deserialize to List<CanvasObjectModel>
// 3. ref.read(canvasProvider.notifier).loadObjects(objects)
```

---

## 21. Desktop Annotation Mode

### 21.1 Windows Desktop Implementation
```dart
// lib/features/whiteboard/presentation/screens/whiteboard_screen.dart

// Enter Annotation Mode (Windows only):
Future<void> enterAnnotationMode() async {
  // Make window transparent (pass-through)
  await windowManager.setAlwaysOnTop(true);
  await windowManager.setIgnoreMouseEvents(true, forward: true);
  // forward: true = mouse clicks still pass through to apps beneath

  ref.read(appModeProvider.notifier).state = AppMode.annotationFloat;
  // Only FloatingAnnotationBar widget is now visible
}

// In annotation mode: only pen strokes visible, canvas transparent
// FloatingAnnotationBar shows (always on top, opaque)
// On pen down: temporarily setIgnoreMouseEvents(false) → capture pen → setIgnoreMouseEvents(true) again

Future<void> exitAnnotationMode() async {
  await windowManager.setAlwaysOnTop(false);
  await windowManager.setIgnoreMouseEvents(false);
  ref.read(appModeProvider.notifier).state = AppMode.whiteboardFree;
}
```

### 21.2 Floating Annotation Bar
```dart
// Always-on-top, semi-transparent, draggable mini toolbar

class FloatingAnnotationBar extends ConsumerStatefulWidget {
  // Draggable: GestureDetector onPanUpdate → update position
  // Tools: [Pen] [Highlight] [Eraser] [Screenshot] [Clear All] [Return to Board]
  // Opacity: 0.4 when not hovered, 1.0 on hover (MouseRegion)
  // Save position to SharedPreferences on drag end
  // Screenshot button: use screenshot package → captures screen → adds to canvas page
}
```

---

## 22. AI Assistant (Claude API)

### 22.1 AI Assistant Panel
```dart
// Right-side AnimatedContainer (width: 0 ↔ 320px)
// Open/close via [AI] button in TopBar

class AiAssistantPanel extends ConsumerStatefulWidget {
  // State: messages (List<ChatMessage>), isLoading, inputText

  // UI Layout:
  //   ─ Header: "AI Assistant" + [X close]
  //   ─ Quick Action Chips (horizontal scroll):
  //       [Explain] [Give Hint] [Solve Steps] [Hindi mein] [5 Questions]
  //   ─ Chat messages list (scrollable)
  //   ─ Input row: [TextField] + [Send] button
}
```

### 22.2 Claude API Call (Streaming)
```dart
// lib/features/ai_assistant/claude_service.dart
// Direct REST call to Anthropic API (no Dart SDK — use Dio)

class ClaudeService {
  static const String _apiUrl = 'https://api.anthropic.com/v1/messages';
  static const String _model  = 'claude-sonnet-4-20250514';

  // System prompt: specialized for Indian competitive exams
  static const String _systemPrompt = '''
You are an expert teaching assistant for Indian competitive exams 
(SSC CGL, SSC CHSL, Railway NTPC/Group-D, BSSC, UPSC, Bihar competitive exams).
- Respond in simple English or Hinglish (Hindi+English mix) based on user preference
- Be concise — teacher is teaching live class, no time for long answers
- For math/science: show step-by-step working
- For GK/Current Affairs: give direct facts with memory tricks
- Keep responses under 200 words unless step-by-step solution is needed
''';

  Future<Stream<String>> streamResponse({
    required String userMessage,
    String? slideContext,          // current slide question text (for context)
    List<Map<String, String>> history = const [],
  }) async {
    final messages = <Map<String, String>>[
      if (slideContext != null)
        {'role': 'user', 'content': 'Current question context:\n$slideContext'},
      if (slideContext != null)
        {'role': 'assistant', 'content': 'I can see the question. How can I help?'},
      ...history,
      {'role': 'user', 'content': userMessage},
    ];

    final response = await ref.read(dioProvider).post(
      _apiUrl,
      data: {
        'model':      _model,
        'max_tokens': 1024,
        'stream':     true,
        'system':     _systemPrompt,
        'messages':   messages,
      },
      options: Options(
        responseType: ResponseType.stream,
        headers: {
          'x-api-key':          AppSecrets.claudeApiKey,  // from .env
          'anthropic-version':  '2023-06-01',
          'Content-Type':       'application/json',
        },
      ),
    );

    // Parse SSE stream: each line is "data: {json}" or "data: [DONE]"
    return _parseSSEStream(response.data as ResponseBody);
  }

  Stream<String> _parseSSEStream(ResponseBody body) async* {
    await for (final chunk in body.stream) {
      final lines = utf8.decode(chunk).split('\n');
      for (final line in lines) {
        if (!line.startsWith('data: ')) continue;
        final data = line.substring(6).trim();
        if (data == '[DONE]') return;
        try {
          final json  = jsonDecode(data) as Map<String, dynamic>;
          final delta = json['delta'] as Map<String, dynamic>?;
          final text  = delta?['text'] as String?;
          if (text != null && text.isNotEmpty) yield text;
        } catch (_) { /* skip malformed chunks */ }
      }
    }
  }
}
```

### 22.3 Quick Action Chips
```dart
// Predefined prompts shown as scrollable chips above chat input

const quickActions = [
  AiQuickAction(
    label:  'Explain',
    prompt: 'Explain this question in simple language: ',
    prependSlideContext: true,
  ),
  AiQuickAction(
    label:  'Give Hint',
    prompt: 'Give a hint for this question without revealing the answer: ',
    prependSlideContext: true,
  ),
  AiQuickAction(
    label:  'Solve Steps',
    prompt: 'Solve this step by step: ',
    prependSlideContext: true,
  ),
  AiQuickAction(
    label:  'Hindi mein',
    prompt: 'Is question ko Hindi mein explain karo: ',
    prependSlideContext: true,
  ),
  AiQuickAction(
    label:  '5 More Questions',
    prompt: 'Give 5 more similar questions on this topic for practice: ',
    prependSlideContext: true,
  ),
];
```

---

## 23. Gesture & Keyboard Controls

### 23.1 Touch Input Disambiguation
```dart
// IMPORTANT: Distinguish pen/stylus from finger touch
// Pen/stylus: PointerDeviceKind.stylus → always draw
// Single finger: draw (if drawing tool active)
// 2 fingers: navigate (zoom/pan)
// 3 fingers: special gestures

class CanvasInputHandler extends ConsumerStatefulWidget {
  int _activePointers = 0;

  void _onPointerDown(PointerDownEvent e) {
    _activePointers++;
    if (e.kind == PointerDeviceKind.stylus || _activePointers == 1) {
      _startDrawing(e.localPosition);
    }
  }

  void _onScaleStart(ScaleStartDetails d) {
    if (d.pointerCount == 2) _enableNavigateMode();
    if (d.pointerCount == 3) _startThreeFingerGesture();
  }

  void _onScaleUpdate(ScaleUpdateDetails d) {
    if (d.pointerCount == 3) _detectThreeFingerGesture(d);
  }

  // 3-finger gesture detection:
  // velocity.x > threshold → left swipe → prevSlide
  // velocity.x < -threshold → right swipe → nextSlide
  // velocity.y > threshold → down swipe → toggle toolbars
  // velocity.y < -threshold → up swipe → show Tool Library
}
```

### 23.2 Keyboard Shortcuts
```dart
// lib/features/whiteboard/presentation/screens/whiteboard_screen.dart
// Use Flutter Shortcuts + Actions widget

final shortcuts = <ShortcutActivator, Intent>{
  // Tool selection
  const SingleActivator(LogicalKeyboardKey.keyP):              SelectToolIntent(Tool.softPen),
  const SingleActivator(LogicalKeyboardKey.keyH):              SelectToolIntent(Tool.highlighter),
  const SingleActivator(LogicalKeyboardKey.keyE):              SelectToolIntent(Tool.hardEraser),
  const SingleActivator(LogicalKeyboardKey.keyS):              SelectToolIntent(Tool.select),
  const SingleActivator(LogicalKeyboardKey.keyT):              SelectToolIntent(Tool.textBox),

  // Canvas operations
  const SingleActivator(LogicalKeyboardKey.keyZ, control: true): UndoIntent(),
  const SingleActivator(LogicalKeyboardKey.keyY, control: true): RedoIntent(),
  const SingleActivator(LogicalKeyboardKey.keyS, control: true): ManualSaveIntent(),
  const SingleActivator(LogicalKeyboardKey.keyN, control: true): NewPageIntent(),
  const SingleActivator(LogicalKeyboardKey.keyA, control: true): SelectAllIntent(),
  const SingleActivator(LogicalKeyboardKey.delete):             DeleteSelectedIntent(),
  const SingleActivator(LogicalKeyboardKey.escape):             DeselectIntent(),

  // Slide navigation
  const SingleActivator(LogicalKeyboardKey.arrowRight): NextSlideIntent(),
  const SingleActivator(LogicalKeyboardKey.arrowLeft):  PrevSlideIntent(),
  const SingleActivator(LogicalKeyboardKey.pageDown):   NextSlideIntent(),
  const SingleActivator(LogicalKeyboardKey.pageUp):     PrevSlideIntent(),

  // Zoom
  const SingleActivator(LogicalKeyboardKey.digit0, control: true): ResetZoomIntent(),
  const SingleActivator(LogicalKeyboardKey.equal, control: true):  ZoomInIntent(),
  const SingleActivator(LogicalKeyboardKey.minus, control: true):  ZoomOutIntent(),

  // Utilities
  const SingleActivator(LogicalKeyboardKey.f1):                 ShowHelpIntent(),
  const SingleActivator(LogicalKeyboardKey.f11):                FullScreenIntent(),
  const SingleActivator(LogicalKeyboardKey.keyE, control: true): ExportIntent(),
};
```

---

## 24. Offline Support

### 24.1 Connectivity Detection
```dart
// lib/features/whiteboard/presentation/providers/canvas_provider.dart (shared)

// Provider: watches connectivity stream
final isOnlineProvider = StreamProvider<bool>((ref) {
  return Connectivity().onConnectivityChanged.map(
    (result) => result != ConnectivityResult.none);
});

// Consumer: show/hide offline banner
Consumer(builder: (ctx, ref, _) {
  final isOnline = ref.watch(isOnlineProvider).valueOrNull ?? true;
  return isOnline ? const SizedBox.shrink() : const OfflineBanner();
})
```

### 24.2 Offline Behavior Rules
```
RULE 1: Auto-save ALWAYS writes to Hive first (local) — even when online
RULE 2: If offline → skip API auto-save → add to Hive 'pending_uploads' box
RULE 3: On reconnect (isOnline becomes true) → process pending_uploads queue
RULE 4: Set ID import requires internet — show clear error if offline
RULE 5: All existing session data accessible offline (Hive)
```

```dart
// OfflineBanner widget (shown in TopBar when offline)
class OfflineBanner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      color: AppColors.warning.withOpacity(0.2),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      child: Row(children: const [
        Icon(Icons.wifi_off, color: AppColors.warning, size: 14),
        SizedBox(width: 6),
        Text('Offline Mode — changes saved locally',
          style: TextStyle(color: AppColors.warning, fontSize: 12)),
      ]),
    );
  }
}
```

---

## 25. Testsprite Integration Plan

> **MANDATORY FOR AI IDE:** After completing EVERY phase, run Testsprite. Fix ALL failures before proceeding to next phase. Zero-bug policy strictly enforced.

### 25.1 Development Cycle Rule
```
EVERY FEATURE FOLLOWS THIS CYCLE:
──────────────────────────────────────────────
Step 1:  Write feature code
Step 2:  Run: flutter test integration_test/
Step 3:  Run: testsprite run --target=<feature_name>
Step 4:  Read bug report → fix ALL issues
Step 5:  Re-run Testsprite → confirm 0 failures
Step 6:  ✅ Commit → move to next feature
──────────────────────────────────────────────
DO NOT SKIP STEP 3–5 FOR ANY FEATURE
```

### 25.2 Integration Tests

```dart
// integration_test/canvas_test.dart
void main() {
  testWidgets('Drawing a stroke saves to canvas state', (tester) async {
    await tester.pumpWidget(const EduBoardApp());
    final canvas = find.byType(AnnotationLayer);
    await tester.dragFrom(tester.getCenter(canvas), const Offset(100, 50));
    await tester.pump();
    final container = ProviderContainer();
    expect(container.read(canvasProvider).strokes.length, 1);
  });

  testWidgets('Undo after drawing removes stroke', (tester) async {
    await tester.pumpWidget(const EduBoardApp());
    await _drawStroke(tester); // helper method
    await tester.tap(find.byKey(const Key('undo_button')));
    await tester.pump();
    final container = ProviderContainer();
    expect(container.read(canvasProvider).strokes.length, 0);
  });

  testWidgets('Undo stack limited to 200 steps (no memory leak)', (tester) async {
    // Draw 250 strokes, verify undoStack.length <= 200
  });
}
```

```dart
// integration_test/set_import_test.dart
void main() {
  late MockSetRepository mockRepo;

  setUp(() {
    mockRepo = MockSetRepository();
    // Override provider for testing
  });

  testWidgets('Set ID 505955 loads 20 slides successfully', (tester) async {
    when(() => mockRepo.fetchSlides('505955')).thenAnswer(
      (_) async => List.generate(20, (i) => buildTestSlide(i)));

    await tester.pumpWidget(const EduBoardApp());
    await tester.tap(find.byKey(const Key('import_set_btn')));
    await tester.pumpAndSettle();
    await tester.enterText(find.byKey(const Key('set_id_field')), '505955');
    await tester.tap(find.byKey(const Key('import_confirm_btn')));
    await tester.pumpAndSettle();

    expect(find.byType(QuestionSlideRenderer), findsOneWidget);
    expect(find.text('Slide 1 / 20'), findsOneWidget);
  });

  testWidgets('Wrong Set ID shows error SnackBar', (tester) async {
    when(() => mockRepo.fetchSlides('000000'))
        .thenThrow(DioException(requestOptions: RequestOptions(),
          response: Response(statusCode: 404, requestOptions: RequestOptions())));
    // ... enter 000000 → expect SnackBar with 'Set ID not found'
  });

  testWidgets('Slide switch saves current and loads target annotations', (tester) async {
    // Draw stroke on slide 1
    // Navigate to slide 2
    // Navigate back to slide 1
    // Verify original stroke is still there
  });
}
```

```dart
// integration_test/auto_save_test.dart
void main() {
  testWidgets('Auto-save fires after 30 seconds', (tester) async {
    await tester.pumpWidget(const EduBoardApp());
    await _drawStroke(tester);
    // Advance fake time by 31 seconds
    await tester.pump(const Duration(seconds: 31));
    // Verify: mockRepository.autoSaveSession was called
    verify(() => mockRepo.autoSaveSession(any())).called(greaterThan(0));
    // Verify: SaveStatus shows 'saved'
    expect(find.text('Saved'), findsOneWidget);
  });

  testWidgets('Save status shows unsaved after drawing', (tester) async { ... });
  testWidgets('Session restores after simulated app restart', (tester) async { ... });
}
```

```dart
// integration_test/pdf_export_test.dart
void main() {
  test('PDF generation produces valid PDF bytes', () async {
    final session = buildTestSession(slideCount: 5);
    final pdfBytes = await generateClassPdf(session, buildTestSlides(5));

    expect(pdfBytes.isNotEmpty, true);
    // Verify PDF magic bytes: %PDF
    expect(pdfBytes.sublist(0, 4), equals([0x25, 0x50, 0x44, 0x46]));
  });

  test('PDF has correct page count', () async {
    final session = buildTestSession(slideCount: 10);
    final pdfBytes = await generateClassPdf(session, buildTestSlides(10));
    // Parse PDF and verify page count == 10
    final doc = PdfDocument.openData(pdfBytes);
    expect(doc.pagesCount, 10);
  });
}
```

### 25.3 Performance Tests
```dart
// test/performance_test.dart
void main() {
  test('100 strokes → canvas state update under 16ms average', () {
    final notifier = CanvasNotifier();
    final stopwatch = Stopwatch()..start();
    for (int i = 0; i < 100; i++) {
      notifier.endStroke(); // simulates completing a stroke
    }
    stopwatch.stop();
    final avgMs = stopwatch.elapsedMilliseconds / 100;
    expect(avgMs, lessThan(16), reason: 'Must maintain 60fps');
  });
}
```

### 25.4 Testsprite Config
```yaml
# testsprite.yaml

project:  EduBoard Pro
platform: windows
flutter_version: ">=3.19.0"

test_suites:
  - name: "Phase 1 — Canvas Drawing"
    files: [integration_test/canvas_test.dart]
    visual_regression: true

  - name: "Phase 5 — Set ID Import"
    files: [integration_test/set_import_test.dart]
    mock_api: true
    test_credentials:
      set_id:   "505955"
      password: "287051"
      api_base: "https://api.eduhub.in/api/v1"

  - name: "Phase 7 — Auto Save"
    files: [integration_test/auto_save_test.dart]
    fake_timers: true

  - name: "Phase 8 — PDF Export"
    files: [integration_test/pdf_export_test.dart]

performance_budgets:
  app_startup_ms:    3000
  slide_switch_ms:   100
  pen_stroke_ms:     16    # 60fps
  pdf_export_ms:     10000
  set_import_ms:     3000

error_policy:
  fail_on_any_warning: false
  fail_on_any_error:   true
  screenshot_on_fail:  true
  retry_on_flaky:      2
```

### 25.5 Testsprite Commands
```bash
# Run all integration tests
flutter test integration_test/

# Run one phase's tests
flutter test integration_test/canvas_test.dart -v

# Run Testsprite full suite
testsprite run --config testsprite.yaml

# Generate HTML bug report
testsprite report --format html --output test_results/

# Run performance benchmarks only
flutter test test/performance_test.dart --reporter json
```

---

## 26. Non-Functional Requirements

### 26.1 Performance Budgets
| Metric | Requirement | Flutter Implementation |
|--------|-------------|----------------------|
| App start time | < 3 seconds | Minimal main.dart, lazy-load features |
| Pen latency | < 16ms | RepaintBoundary, avoid setState in paint |
| Slide switch | < 100ms | Pre-cache next slide, lightweight provider update |
| Set import (20 slides) | < 3s | async dio + loading skeleton |
| PDF export (20 slides) | < 10s | compute() isolate |
| Memory (idle) | < 300MB | Dispose all controllers, LRU image cache |
| Memory (100 strokes) | < 500MB | Simplify path points > 200 using Ramer-Douglas-Peucker |

### 26.2 Error Handling — All API Calls
```
Network timeout (>10s):       → Retry up to 3 times → Show error SnackBar + "Work Offline"
401 Unauthorized:             → Refresh JWT → Retry once → If fails: show login prompt
404 Not Found (Set ID):       → Show: "Set ID not found. Check the ID and try again."
500 Server Error:             → Show: "Server error. Please try again in a moment."
No internet on import:        → Show: "No internet connection. Please connect and try again."
Canvas state corrupt (rare):  → Auto-recover from last Hive backup
PDF generation fails:         → Save raw session to Hive → Show retry button
Cloud upload fails:           → Save PDF locally → Add to pending queue → Retry on reconnect
```

### 26.3 Security
- JWT stored in `flutter_secure_storage` (NOT SharedPreferences — NOT Hive unencrypted)
- All API requests: `Authorization: Bearer {jwt}` header via `AuthInterceptor`
- Set password NOT stored after session ends
- Claude API key in `.env` file, never hardcoded, accessed via `AppSecrets` class
- HTTPS enforced for all network calls

### 26.4 Responsive Layout (Desktop + Tablet)
```dart
// Use LayoutBuilder for responsive adaptations
// Desktop (width > 1024px): full layout with left toolbar + slide panel
// Tablet (600–1024px): collapsed toolbars, swipe gestures prominent
// Min supported resolution: 1280×720
```

---

## 27. Development Phases

> **AI IDE MUST follow phases in order. Run Testsprite after each phase. Fix ALL bugs before next phase.**

### Phase 1 — Foundation (Week 1–2)
```
[ ] flutter create eduhub_whiteboard (Windows target)
[ ] Add all pubspec.yaml dependencies (Section 2.1)
[ ] Create folder structure exactly as Section 3
[ ] app_colors.dart, app_text_styles.dart, api_constants.dart
[ ] AppTheme: dark ThemeData
[ ] Dio client + AuthInterceptor + RetryInterceptor
[ ] Hive init: register all type adapters (StrokeModel, CanvasObjectModel, etc.)
[ ] WhiteboardScreen layout: TopBar + Row(Left toolbar + Canvas + Slide Panel) + BottomToolbar
[ ] CanvasArea: Stack with BackgroundLayer placeholder
[ ] AnnotationLayer: CustomPaint + GestureDetector
[ ] CanvasPainter: draw strokes using perfect_freehand
[ ] CanvasState + CanvasNotifier (Riverpod @riverpod annotation)
[ ] startStroke / updateStroke / endStroke in CanvasNotifier
[ ] Undo / Redo (undoStack max 200 entries)
[ ] AppMode enum + appModeProvider

→ TESTSPRITE: canvas_test.dart — pen draws, undo/redo works
```

### Phase 2 — Pen & Eraser Tools (Week 2–3)
```
[ ] Tool enum (all tools listed in Section 8.1)
[ ] ToolSettings class + toolProvider (Riverpod)
[ ] All 7 pen types rendering (Section 8.2 table)
[ ] Chalk effect (scatter dots — Section 8.3)
[ ] Laser pointer overlay (non-persistent, AnimationController fade — Section 8.4)
[ ] Pen settings BottomSheet (width, opacity, smoothness sliders)
[ ] flutter_colorpicker RGBA color picker
[ ] All 4 eraser types (soft, hard, object, area — Section 9)
[ ] BottomMainToolbar: default 5 tools + color picker

→ TESTSPRITE: pen_tools_test.dart, eraser_test.dart
```

### Phase 3 — Shape & Text Tools (Week 3–4)
```
[ ] CanvasObjectModel + ObjectType enum
[ ] ShapePainter in CanvasPainter._drawObject()
[ ] Shape creation: drag to define Rect bounds → add to objects list
[ ] Live preview during drag (show shape in activeObject before endStroke)
[ ] All shapes: rectangle, roundedRect, circle, triangle, arrow, star, polygon, callout
[ ] SelectionHandlesPainter (8 handles + rotation)
[ ] SelectionHandler: hitTestSingle, hitTestRect
[ ] All manipulation operations in CanvasNotifier: move, resize, rotate, flip, lock, delete, duplicate, group
[ ] TextBox: OverlayEntry + TextField → serialize to CanvasObjectModel
[ ] Hindi text support (Noto Sans Devanagari + language toggle)
[ ] StickyNote widget (5 colors, draggable, resizable)

→ TESTSPRITE: shapes_test.dart, text_test.dart, selection_test.dart
```

### Phase 4 — Tool Library System (Week 4–5)
```
[ ] ToolDefinition model + complete allTools catalog (40+ tools)
[ ] ToolLibraryDrawer: categories + search + GridView
[ ] Tab filter: Writing | Shapes | Subject | Teaching | Media
[ ] ToolTile: icon, label, long-press → pin
[ ] Drag-to-pin: Draggable<ToolDefinition> + DragTarget on bottom toolbar
[ ] Bottom toolbar slot management (max 10, drag to reorder)
[ ] Pinned tools persist to SharedPreferences
[ ] Toolbar profiles: save/load named configs to Hive
[ ] LeftSideToolbar: auto-hide AnimationController + Timer(3s)

→ TESTSPRITE: tool_library_test.dart, toolbar_customization_test.dart
```

### Phase 5 — Set ID Import & Slide Mode — REAL BACKEND CONNECTION (Week 5–7)
```
BACKEND ALREADY DEVELOPED — sirf Flutter side connect karna hai

[ ] SetSlideModel + SlideOption + SetMetadataModel (Dart models + Hive adapters)
[ ] SetRemoteDataSource:
    - validateSet()   → POST /whiteboard/validate-set
    - fetchQuestions() → GET /whiteboard/sets/:setId/questions
[ ] WhiteboardRemoteDataSource:
    - startSession()  → POST /whiteboard/session/start  → returns sessionId
    - autoSave()      → PUT  /whiteboard/session/:sessionId
    - fetchSession()  → GET  /whiteboard/session/:sessionId
    - endSession()    → POST /whiteboard/session/:sessionId/end
    - uploadPdf()     → POST /whiteboard/session/:sessionId/upload-pdf
[ ] SetImportNotifier (3-step flow: validate → fetch → startSession — Section 15.1)
[ ] Test with LIVE BACKEND: Set ID 505955, Password 287051
    - Confirm questions load correctly from server
    - Confirm sessionId received and stored
[ ] QuestionSlideRenderer: HTML rendering with flutter_widget_from_html
[ ] CachedNetworkImage for S3 question images (from API response)
[ ] SlideContentLayer integration in CanvasArea Stack
[ ] Per-slide annotation save/restore on slide switch
[ ] SlidePanelDrawer: thumbnails, highlight active, tap-to-navigate
[ ] SlideThumbnail widget (160×90px mini preview)
[ ] Slide navigation bar (prev/next buttons + slide counter)
[ ] AppMode.slideMode switch on successful import
[ ] Exam source badge (top-right pill — from examSource field in API)
[ ] AnswerRevealOverlay (correct option green highlight)
[ ] Session state wired: markDirty() → debounce → autoSave() → PUT backend

→ TESTSPRITE: set_import_test.dart, live_api_test.dart, annotation_persist_test.dart
→ MANUAL TEST: Open app → Import Set 505955/287051 → Verify 20 questions load → Draw on slide 1 → 
  Switch to slide 3 → Come back to slide 1 → Verify annotations preserved →
  Wait 30s → Check server session updated (check Admin Panel)
```

### Phase 6 — Color Customization & Backgrounds (Week 7–8)
```
[ ] SlideColorConfig model + Hive adapter
[ ] slideColorConfigProvider (StateProviderFamily by slideId)
[ ] SlideColorPickerDialog: 5 tabs, HSV picker, Hex+RGBA fields, swatches (Section 16.2)
[ ] "Apply to all slides" toggle
[ ] Live preview during color picking (onColorChanging callback)
[ ] Background image: file_picker → local path storage in sessionProvider
[ ] Background opacity slider
[ ] BackgroundLayer: renders local image | S3 image | solid color (Section 16.3)
[ ] Long-press canvas context menu: [Set Background Image] [Remove] [Opacity]

→ TESTSPRITE: slide_color_test.dart, background_test.dart
```

### Phase 7 — Auto-Save & Session Management (Week 8–9)
```
[ ] SessionNotifier: 30s periodic timer + 5s dirty debounce (Section 17.1)
[ ] WhiteboardSessionModel + SlideAnnotationData (Hive adapters)
[ ] Hive session storage: saveSession, getLastSession
[ ] API auto-save call (only when online)
[ ] Pending queue: add to Hive when offline, process on reconnect
[ ] SaveStatus widget in TopBar (Section 17.2)
[ ] Session recovery dialog on app launch (Section 17.3)
[ ] Session history list (last 10, accessible from menu)

→ TESTSPRITE: auto_save_test.dart, session_recovery_test.dart
```

### Phase 8 — PDF Export & Cloud Upload — REAL BACKEND (Week 9–10)
```
[ ] EndClassDialog UI with 5-step flow (Section 18.1)
[ ] Step 1: Final PUT /whiteboard/session/{sessionId} (last save)
[ ] Step 2: POST /whiteboard/session/{sessionId}/end (mark ended on server)
[ ] Step 3: PDF generation — dart:pdf in compute() isolate
    - Each slide = 1 page (question content + teacher annotations merged)
    - Strokes → PDF vector paths
    - HTML question → PDF text
[ ] Step 4: POST /whiteboard/session/{sessionId}/upload-pdf (multipart Dio)
    - Upload progress bar in dialog
    - On success: show pdfUrl returned from server
    - Admin Panel will show this PDF immediately under Set 505955
[ ] Step 5: Save local PDF to downloads (path_provider)
[ ] PNG ZIP export (RepaintBoundary.toImage + archive package)
[ ] Post-upload SnackBar: "✓ Class notes uploaded to Set 505955" + [View] button

→ TESTSPRITE: pdf_export_test.dart, cloud_upload_test.dart
→ MANUAL TEST: End class → check Admin Panel → Set 505955 → Class Notes → PDF visible
```

### Phase 9 — Advanced Teaching Tools (Week 10–11)
```
[ ] SpotlightOverlay: SpotlightPainter with BlendMode.clear hole (Section 19.1)
    - Mouse follow, scroll to resize, circle/rect/oval shape
[ ] ScreenCoverOverlay: draggable curtain from 4 directions (Section 19.2)
[ ] ZoomLensOverlay: magnifier circle follows cursor (Section 19.3)
[ ] CountdownTimer widget: 3 styles, drag, beep on zero (Section 19.4)
[ ] Class session timer in TopBar (Section 19.5)
[ ] RandomPickerWidget: spin animation + Lottie confetti (Section 19.6)
[ ] NavigationMapWidget: mini-map bottom-right (Section 19.7)

→ TESTSPRITE: teaching_tools_test.dart
```

### Phase 10 — Subject Tools & Math (Week 11–12)
```
[ ] SubjectMode enum + provider + Tool Library filter
[ ] RulerWidget: draggable, rotatable, tick marks, pen snap (Section 14.2)
[ ] ProtractorWidget: semicircle, rotatable, degree labels
[ ] CompassWidget: pivot + arm, draws circle on release
[ ] FunctionPlotter: equation parser + path generator + canvas rendering
[ ] Formula library: 100+ KaTeX formulas, searchable, insert to canvas
[ ] PeriodicTable dialog: 118 elements, tap → detail, insert to canvas
[ ] Physics circuit symbols SVG library
[ ] India map SVG: state tap → name, color fill, insert to canvas
[ ] SSC/UPSC Timeline tool

→ TESTSPRITE: subject_tools_test.dart, math_tools_test.dart
```

### Phase 11 — Multimedia, Resource Bank & AI (Week 12–13)
```
[ ] Image import: file_picker → CanvasObjectModel (imageBox)
[ ] PDF import: pdfx → pages as background images
[ ] Video on canvas: video_player widget (overlay, draggable)
[ ] ResourceBankDrawer: tabs (My Images, My PDFs, Templates, Org Library)
[ ] Template system: 6+ JSON templates → load to canvas
[ ] AiAssistantPanel: chat UI, quick action chips
[ ] ClaudeService: streaming SSE API call (Section 22.2)
[ ] AI context: inject current slide question text
[ ] Desktop Annotation Mode (window_manager — Windows only, Section 21)
[ ] FloatingAnnotationBar: always-on-top, semi-transparent, draggable

→ TESTSPRITE: multimedia_test.dart, ai_assistant_test.dart
```

### Phase 12 — Gestures, Keyboard & Offline (Week 13–14)
```
[ ] Multi-touch input: pen vs finger vs multi-finger disambiguation (Section 23.1)
[ ] 3-finger gestures: slide switch, toolbar toggle, Tool Library
[ ] Full keyboard shortcut map with Shortcuts + Actions widgets (Section 23.2)
[ ] Keyboard shortcut help dialog (F1 key)
[ ] Connectivity detection: isOnlineProvider (Section 24.1)
[ ] Offline OfflineBanner widget
[ ] Pending upload queue (Hive) + reconnect processing
[ ] Settings screen: theme, font size, shortcut remapping, toolbar reset

→ TESTSPRITE: gesture_test.dart, keyboard_test.dart, offline_test.dart
```

### Phase 13 — Final Polish & Bug Fix (Week 14)
```
[ ] Testsprite full suite — fix ALL failures
[ ] Performance audit: RepaintBoundary on every CustomPainter
[ ] Memory leak check: all AnimationControllers, VideoPlayerControllers disposed
[ ] Large canvas test: 500+ objects → smooth 60fps verified
[ ] Edge cases: empty set, 1-slide set, set with image-only questions
[ ] UI polish: transition animations, loading states, empty states
[ ] Error states: no-internet, API down, invalid PDF, empty canvas
[ ] README.md: setup steps, env variables, first run guide
[ ] Final: flutter build windows → test .exe on clean Windows machine
[ ] Final Testsprite run → 100% pass rate confirmed

→ RELEASE ✅
```

---

## 28. Feature Summary

Complete list of all features in EduBoard Pro PRD v2.0:

| # | Feature | Category |
|---|---------|----------|
| 1 | Soft Pen with perfect_freehand Catmull-Rom smoothing | Drawing |
| 2 | 6 Pen types: Hard, Chalk, Calligraphy, Spray, Highlighter + Laser Pointer | Drawing |
| 3 | 4 Eraser types: Soft, Hard, Object, Area | Drawing |
| 4 | 30+ Shape tools: Basic, Arrow, Flowchart, 3D, Education | Drawing |
| 5 | Text Box + Hindi/Devanagari support | Drawing |
| 6 | Sticky Notes (5 colors, draggable, resizable) | Drawing |
| 7 | Infinite Canvas + Slide Mode (16:9 fixed) | Canvas |
| 8 | Navigation Mini-Map (bottom-right) | Canvas |
| 9 | Pan & Zoom (InteractiveViewer — navigate mode only) | Canvas |
| 10 | Tool Library Drawer (categories, search, all 40+ tools) | UI/UX |
| 11 | Customizable Bottom Toolbar (drag-to-pin, max 10) | UI/UX |
| 12 | Toolbar Profiles per subject (save/load) | UI/UX |
| 13 | Auto-hide Left Sidebar | UI/UX |
| 14 | Math Mode: Ruler, Protractor, Compass, Function Plotter, KaTeX | Subject |
| 15 | Physics Mode: Circuit Builder, Ray Diagram | Subject |
| 16 | Chemistry Mode: Periodic Table, Molecules | Subject |
| 17 | SSC/UPSC Mode: India Map SVG, Timeline | Subject |
| 18 | **Set ID Import** → PPT slides from EduHub API (Test: 505955/287051) | ⭐ EduHub |
| 19 | **Per-slide background image** (local file or S3 URL) | ⭐ EduHub |
| 20 | **5-element Color Customization** per slide (matches screenshot) | ⭐ EduHub |
| 21 | **Answer Reveal Mode** (green highlight, animated) | ⭐ EduHub |
| 22 | **Exam Source Badge** per slide (SSC CGL Shift-3 etc.) | ⭐ EduHub |
| 23 | **Auto-Save** (30s periodic + 5s dirty debounce) | Save |
| 24 | **Session Recovery** (crash-safe Hive storage) | Save |
| 25 | **End Class → PDF → Cloud Upload** to same Set ID | ⭐ EduHub |
| 26 | Local Export: PDF, PNG ZIP | Export |
| 27 | Spotlight (BlendMode.clear hole, shape/size control) | Teaching |
| 28 | Screen Cover / Curtain (4 directions, draggable) | Teaching |
| 29 | Zoom Lens (2x–5x magnifier circle) | Teaching |
| 30 | Countdown Timer (3 visual styles, beep on zero) | Teaching |
| 31 | Random Picker + Dice (spin animation, confetti) | Teaching |
| 32 | Class Session Timer in TopBar | Teaching |
| 33 | Multi-touch Gestures (3-finger slide switch, 2-finger zoom) | UX |
| 34 | Full Keyboard Shortcut Map (20+ shortcuts) | Productivity |
| 35 | Split Screen Mode (dual canvas panels) | UX |
| 36 | Resource Bank (images, PDFs, templates) | Media |
| 37 | PDF Import (pdfx → canvas pages) | Media |
| 38 | Video on Canvas (video_player, draggable widget) | Media |
| 39 | 6+ Whiteboard Templates (JSON-based) | Templates |
| 40 | Desktop Annotation Mode (window_manager, Windows) | Advanced |
| 41 | Floating Annotation Bar (always-on-top, transparent) | Advanced |
| 42 | **AI Assistant** (Claude API streaming, Hinglish, quick actions) | ⭐ AI |
| 43 | Math Formula OCR → KaTeX (flutter_math_fork) | AI |
| 44 | **Multi-Set Support** (multiple Set IDs in one session) | ⭐ EduHub |
| 45 | Offline Mode (Hive local-first, pending upload queue) | Reliability |
| 46 | **Testsprite integration** (every phase, 100% pass rate required) | Quality |
| 47 | Dark coaching-style UI (EduHub orange + black) | Design |
| 48 | Settings Cloud Sync via Teacher JWT | Sync |

**⭐ = EduHub Exclusive Feature (not in Note3)**

---

> ### 📌 Final Checklist for AI IDE Before Starting
>
> ✅ Flutter SDK 3.19+ installed  
> ✅ Windows development enabled (`flutter config --enable-windows-desktop`)  
> ✅ Testsprite CLI installed (`dart pub global activate testsprite`)  
> ✅ `.env` file created with `CLAUDE_API_KEY`, `EDUHUB_API_BASE`  
> ✅ Test Set ID `505955` + Password `287051` configured in api_constants.dart  
> ✅ Start with Phase 1 — do not skip phases  
> ✅ Run Testsprite after every phase — zero bugs policy  

---

*PRD-WB-01 | EduBoard Pro — EduHub Interactive Whiteboard*  
*Version 2.2 | Flutter Desktop (Windows + Android Tablet)*  
*Date: 2026-03-31 | Status: Ready for AI IDE Development*  
*AI IDE me paste karo → Section 0 padho → cleanup karo → phases follow karo → Testsprite se test karo*