# PRD-WB-02 — EduBoard Pro: Complete System Rebuild
**Version:** 3.1 (AI-IDE Refined — All Stubs Completed)
**Date:** 2026-04-02
**Status:** 🏗️ Architecture Complete — Ready for Implementation
**Platform:** Flutter (Desktop + Android Tablet)
**Codename:** EduBoard Pro v3
**Supersedes:** PRD-WB-02 v3.0 (incomplete stubs — do not use)

---

> ### ⚠️ REBUILD NOTICE — Read Before Anything Else
>
> This document is a **ground-up rewrite**. Old codebase is discarded entirely.
> Do NOT port, patch, or reference any existing widget, provider, or screen.
>
> **What stays:** Backend API contracts (Node.js endpoints unchanged).
> **What goes:** All Flutter UI, state, and drawing code.

---

## 🤖 AI IDE INSTRUCTIONS — Read This First

This section tells the AI IDE exactly what changed in v3.1 and what to watch out for.

### Critical Fixes from v3.0 (These Were Causing All Errors)

| # | Problem in v3.0 | Fix in v3.1 |
|---|-----------------|-------------|
| 1 | `Result<T,E>` type used but never defined | Added `result_dart: ^1.1.0` to pubspec + usage shown |
| 2 | `CanvasState` class never defined | Full definition in Section 7.4 |
| 3 | `CanvasSnapshot` class never defined | Full definition in Section 7.4 |
| 4 | `currentSlideIdProvider` referenced but undefined | Defined in Section 7.5 |
| 5 | `canvasSizeProvider` referenced but undefined | Defined in Section 7.5 |
| 6 | `ObjectRenderer` referenced but undefined | Full implementation in Section 10.4 |
| 7 | `ToolSettings.copyWith()` was `{ ... }` stub | Complete in Section 8.1 |
| 8 | `_pointsToPath()` / `_drawPathFromPoints()` undefined | Defined in Section 10.1 |
| 9 | `perfect_freehand` API mismatch (wrong input type) | Fixed in Section 10.1 |
| 10 | `BoxFit` in Hive field — Flutter type not serializable | Changed to `int bgImageFitIndex` in Section 5.3 |
| 11 | `Offset` in Hive field — needs custom adapter | `OffsetAdapter` added in Section 14.4 |
| 12 | `StrokeTip` enum never defined | Defined in Section 8.1 |
| 13 | `SlideNotifier` never implemented | Full implementation in Section 7.6 |
| 14 | `SessionNotifier` auto-save logic missing | Full implementation in Section 7.7 |
| 15 | `ToolNotifier` never implemented | Full implementation in Section 8.1 |
| 16 | `TeacherModel` never defined | Defined in Section 19 |
| 17 | `SetMetadataModel` never defined | Defined in Section 19 |
| 18 | `AuthInterceptor` just described, never coded | Full implementation in Section 13.1 |
| 19 | `StrokeModel.copyWith()` missing | Added in Section 5.2 |
| 20 | `SlideState` class never defined | Full definition in Section 7.6 |
| 21 | `SessionState` class never defined | Full definition in Section 7.7 |
| 22 | `SaveStatus` enum never defined | Defined in Section 7.7 |
| 23 | `AppModeNotifier` never implemented | Defined in Section 7.8 |
| 24 | Hive typeId 1 (`SetSlideModel`) registered after others | Fixed order in Section 14.2 |

### File Creation Order for AI IDEs
Build files in this exact order to avoid circular dependency errors:

```
1.  pubspec.yaml
2.  lib/main.dart
3.  lib/core/constants/app_colors.dart
4.  lib/core/constants/app_text_styles.dart
5.  lib/core/constants/app_dimensions.dart
6.  lib/core/constants/api_constants.dart
7.  lib/core/error/failure.dart                   ← Result<T,E> defined here
8.  lib/core/storage/hive_adapters.dart            ← OffsetAdapter, BoxFitAdapter
9.  lib/features/whiteboard/data/models/stroke_model.dart
10. lib/features/whiteboard/data/models/canvas_object_model.dart
11. lib/features/whiteboard/data/models/slide_model.dart        (SlideOption too)
12. lib/features/whiteboard/data/models/slide_annotation.dart
13. lib/features/question_widget/data/models/question_widget_style.dart
14. lib/features/question_widget/data/models/question_widget_model.dart
15. lib/features/whiteboard/data/models/session_model.dart
16. lib/core/storage/hive_service.dart
17. lib/core/storage/secure_storage.dart
18. lib/core/network/dio_client.dart
19. lib/core/network/auth_interceptor.dart
20. lib/core/network/retry_interceptor.dart
21. lib/core/error/error_handler.dart
22. lib/core/providers/auth_provider.dart           ← TeacherModel defined here
23. lib/features/auth/data/datasources/auth_remote_ds.dart
24. lib/features/auth/presentation/providers/login_provider.dart
25. lib/features/whiteboard/presentation/providers/tool_provider.dart
26. lib/features/whiteboard/presentation/providers/canvas_provider.dart
27. lib/features/whiteboard/presentation/providers/slide_provider.dart
28. lib/features/whiteboard/presentation/providers/session_provider.dart
29. lib/features/whiteboard/presentation/providers/app_mode_provider.dart
30. lib/features/question_widget/presentation/providers/question_widget_provider.dart
31. lib/features/question_widget/presentation/providers/selected_widget_provider.dart
32. [All widgets / screens]
```

---

## Table of Contents

1. [Project Vision](#1-project-vision)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [System Architecture Diagram](#4-system-architecture-diagram)
5. [Data Models](#5-data-models)
6. [Canvas Engine Architecture](#6-canvas-engine-architecture)
7. [State Management Architecture](#7-state-management-architecture)
8. [Toolbar & Tool System](#8-toolbar--tool-system)
9. [Question Widget System](#9-question-widget-system)
10. [Drawing System](#10-drawing-system)
11. [Interaction Flow](#11-interaction-flow)
12. [UI/UX Design System](#12-uiux-design-system)
13. [API Integration Flow](#13-api-integration-flow)
14. [Persistence Strategy](#14-persistence-strategy)
15. [Performance Architecture](#15-performance-architecture)
16. [Error Handling Strategy](#16-error-handling-strategy)
17. [Development Phases](#17-development-phases)
18. [Testing Strategy](#18-testing-strategy)
19. [Missing Type Definitions (v3.1 Additions)](#19-missing-type-definitions)

---

## 1. Project Vision

### 1.1 What We Are Building

EduBoard Pro v3 is a **professional interactive whiteboard + teaching system** for Indian coaching institute teachers. Think of it as **Figma × Excalidraw × PowerPoint** — designed specifically for live classroom teaching with question sets, annotations, and session capture.

**Core Value Proposition:**
- Teachers import exam question sets (SSC, UPSC, Railway) by Set ID
- Questions render as interactive, styleable slides on a canvas
- Teacher annotates freely with pen tools on top
- At class end, everything exports as PDF and syncs to backend
- Admin panel shows all sessions and uploaded PDFs

### 1.2 Who Uses This

| User | Usage |
|------|-------|
| Coaching Institute Teacher | Primary user — draws, annotates, teaches |
| Admin | Views session history, downloads PDFs (via Admin Panel — already built) |

### 1.3 Platform Targets

| Platform | Priority | Command |
|----------|----------|---------|
| Windows Desktop | P0 — Primary | `flutter build windows` |
| Android Tablet (10"+) | P1 | `flutter build apk` |
| Linux Desktop | P2 | `flutter build linux` |

---

## 2. Tech Stack

```yaml
# pubspec.yaml — canonical dependency list

name: eduboard_pro
description: EduBoard Pro v3 — Interactive Whiteboard for Coaching Institutes

environment:
  sdk: ">=3.3.0 <4.0.0"
  flutter: ">=3.19.0"

dependencies:
  flutter:
    sdk: flutter

  # ── State Management ──────────────────────────────────────────────
  flutter_riverpod: ^2.5.1
  riverpod_annotation: ^2.3.5

  # ── Canvas & Drawing ──────────────────────────────────────────────
  perfect_freehand: ^2.0.1        # Smooth pen stroke rendering

  # ── Data & Persistence ────────────────────────────────────────────
  hive_flutter: ^1.1.0
  hive: ^2.2.3
  uuid: ^4.3.3

  # ── Networking ────────────────────────────────────────────────────
  dio: ^5.4.3
  flutter_secure_storage: ^9.0.0
  connectivity_plus: ^6.0.3

  # ── UI & Fonts ────────────────────────────────────────────────────
  google_fonts: ^6.2.1
  flutter_colorpicker: ^1.1.0
  flutter_html: ^3.0.0-beta.2     # Use Html() widget from this package

  # ── Export ────────────────────────────────────────────────────────
  pdf: ^3.10.8
  printing: ^5.12.0
  archive: ^3.4.10
  path_provider: ^2.1.3
  file_picker: ^8.0.3

  # ── Result Type ───────────────────────────────────────────────────
  result_dart: ^1.1.0             # Result<Success, Failure> — import as: import 'package:result_dart/result_dart.dart';

  # ── Routing ───────────────────────────────────────────────────────
  go_router: ^13.2.0

  # ── AI Integration ────────────────────────────────────────────────
  http: ^1.2.1

  # ── Desktop Utilities ─────────────────────────────────────────────
  hotkey_manager: ^0.2.2
  window_manager: ^0.3.9
  screen_retriever: ^0.1.9

dev_dependencies:
  riverpod_generator: ^2.4.3
  build_runner: ^2.4.9
  hive_generator: ^2.0.1
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0
```

> **AI IDE NOTE — `result_dart` usage:**
> ```dart
> import 'package:result_dart/result_dart.dart';
> // Usage: AsyncResult<String> = ResultDart.Success(value) or ResultDart.Failure(failure)
> // In methods: return Success(value); or return Failure(someFailure);
> // Consuming: result.fold(onSuccess: (v) => ..., onFailure: (f) => ...);
> ```

---

## 3. Folder Structure

```
lib/
│
├── main.dart
├── app.dart
│
├── core/
│   ├── constants/
│   │   ├── app_colors.dart
│   │   ├── app_text_styles.dart
│   │   ├── app_dimensions.dart
│   │   └── api_constants.dart
│   │
│   ├── network/
│   │   ├── dio_client.dart
│   │   ├── auth_interceptor.dart
│   │   └── retry_interceptor.dart
│   │
│   ├── error/
│   │   ├── failure.dart           ← Failure sealed class + Result typedef
│   │   └── error_handler.dart
│   │
│   ├── storage/
│   │   ├── hive_service.dart
│   │   ├── hive_adapters.dart     ← OffsetAdapter, BoxFitIndexAdapter (NEW in v3.1)
│   │   └── secure_storage.dart
│   │
│   ├── utils/
│   │   ├── canvas_utils.dart
│   │   ├── color_utils.dart
│   │   └── extensions.dart
│   │
│   └── providers/
│       ├── dio_provider.dart
│       ├── auth_provider.dart
│       └── connectivity_provider.dart
│
├── features/
│   │
│   ├── auth/
│   │   ├── data/
│   │   │   ├── models/
│   │   │   │   └── teacher_model.dart
│   │   │   └── datasources/
│   │   │       └── auth_remote_ds.dart
│   │   ├── domain/
│   │   │   └── auth_repository.dart
│   │   └── presentation/
│   │       ├── screens/
│   │       │   └── login_screen.dart
│   │       └── providers/
│   │           └── login_provider.dart
│   │
│   ├── whiteboard/
│   │   ├── data/
│   │   │   ├── models/
│   │   │   │   ├── canvas_object_model.dart
│   │   │   │   ├── stroke_model.dart
│   │   │   │   ├── slide_model.dart           ← SetSlideModel + SlideOption
│   │   │   │   ├── set_metadata_model.dart
│   │   │   │   ├── slide_annotation.dart      ← SlideAnnotationData + SlideColorConfig
│   │   │   │   └── session_model.dart
│   │   │   └── datasources/
│   │   │       ├── whiteboard_remote_ds.dart
│   │   │       └── whiteboard_local_ds.dart
│   │   │
│   │   ├── domain/
│   │   │   ├── canvas_repository.dart
│   │   │   └── session_repository.dart
│   │   │
│   │   └── presentation/
│   │       ├── screens/
│   │       │   └── whiteboard_screen.dart
│   │       │
│   │       ├── providers/
│   │       │   ├── tool_provider.dart
│   │       │   ├── canvas_provider.dart
│   │       │   ├── slide_provider.dart
│   │       │   ├── session_provider.dart
│   │       │   ├── app_mode_provider.dart
│   │       │   └── canvas_size_provider.dart  ← NEW in v3.1
│   │       │
│   │       └── widgets/
│   │           ├── top_bar/
│   │           │   └── top_bar.dart
│   │           ├── toolbar/
│   │           │   ├── bottom_main_toolbar.dart
│   │           │   ├── left_side_toolbar.dart
│   │           │   ├── tool_icon_button.dart
│   │           │   └── tool_library_drawer.dart
│   │           ├── canvas/
│   │           │   ├── whiteboard_canvas.dart
│   │           │   ├── background_layer.dart
│   │           │   ├── slide_content_layer.dart
│   │           │   ├── editable_question_layer.dart
│   │           │   ├── annotation_layer.dart
│   │           │   ├── math_tool_overlay.dart
│   │           │   └── ui_overlay_layer.dart
│   │           ├── drawing/
│   │           │   ├── canvas_painter.dart
│   │           │   └── stroke_renderer.dart
│   │           └── overlays/
│   │               ├── spotlight_overlay.dart
│   │               ├── screen_cover_overlay.dart
│   │               ├── zoom_lens_overlay.dart
│   │               └── laser_pointer_overlay.dart
│   │
│   ├── question_widget/
│   │   ├── data/
│   │   │   └── models/
│   │   │       ├── question_widget_model.dart
│   │   │       └── question_widget_style.dart
│   │   └── presentation/
│   │       ├── providers/
│   │       │   ├── question_widget_provider.dart
│   │       │   └── selected_widget_provider.dart
│   │       └── widgets/
│   │           ├── draggable_resizable_question_widget.dart
│   │           ├── question_widget_body.dart
│   │           ├── resize_handle.dart
│   │           ├── selection_border.dart
│   │           └── floating_style_panel.dart
│   │
│   ├── set_import/
│   │   ├── data/
│   │   │   ├── models/
│   │   │   │   └── set_metadata_model.dart    ← also in whiteboard/data/models/
│   │   │   └── datasources/
│   │   │       └── set_remote_ds.dart
│   │   └── presentation/
│   │       ├── dialogs/
│   │       │   └── set_import_dialog.dart
│   │       └── providers/
│   │           └── set_import_provider.dart
│   │
│   ├── session/
│   │   ├── data/
│   │   │   └── datasources/
│   │   │       └── session_remote_ds.dart
│   │   └── presentation/
│   │       └── providers/
│   │           └── session_notifier.dart
│   │
│   ├── export/
│   │   └── presentation/
│   │       ├── providers/
│   │       │   └── export_provider.dart
│   │       └── dialogs/
│   │           └── end_class_dialog.dart
│   │
│   ├── teaching_tools/
│   │   └── presentation/
│   │       └── widgets/
│   │           ├── spotlight_controller.dart
│   │           ├── countdown_timer_widget.dart
│   │           ├── stopwatch_widget.dart
│   │           ├── random_picker_widget.dart
│   │           ├── dice_widget.dart
│   │           └── navigation_map_widget.dart
│   │
│   ├── subject_tools/
│   │   └── presentation/
│   │       └── widgets/
│   │           ├── ruler_widget.dart
│   │           ├── protractor_widget.dart
│   │           ├── compass_widget.dart
│   │           ├── periodic_table_dialog.dart
│   │           ├── circuit_symbol_library.dart
│   │           └── india_map_overlay.dart
│   │
│   ├── color_picker/
│   │   └── presentation/
│   │       └── widgets/
│   │           └── slide_color_picker.dart
│   │
│   ├── ai_assistant/
│   │   └── presentation/
│   │       └── widgets/
│   │           └── ai_assistant_panel.dart
│   │
│   └── settings/
│       └── presentation/
│           └── screens/
│               └── settings_screen.dart
│
└── router/
    └── app_router.dart
```

---

## 4. System Architecture Diagram

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                     EDUBOARD PRO v3 — SYSTEM ARCHITECTURE                   ║
╠══════════════════════════════════════════════════════════════════════════════╣
║                                                                              ║
║  ┌─────────────────────────────────────────────────────────────────────┐    ║
║  │                        PRESENTATION LAYER                           │    ║
║  │                                                                     │    ║
║  │  ┌──────────┐  ┌──────────────────────────────────────────────┐    │    ║
║  │  │LoginScreen│  │              WhiteboardScreen                │    │    ║
║  │  └──────────┘  │  ┌─────────┐  ┌──────────────────────────┐  │    │    ║
║  │                │  │ TopBar  │  │       CanvasArea          │  │    │    ║
║  │  ┌───────────┐ │  └─────────┘  │  ┌────────────────────┐  │  │    │    ║
║  │  │Settings   │ │  ┌──────────┐ │  │ Layer 1: Background │  │  │    │    ║
║  │  │Screen     │ │  │LeftSide  │ │  ├────────────────────┤  │  │    │    ║
║  │  └───────────┘ │  │ Toolbar  │ │  │ Layer 2: SlideRead  │  │  │    │    ║
║  │                │  └──────────┘ │  ├────────────────────┤  │  │    │    ║
║  │  ┌───────────┐ │  ┌──────────┐ │  │ Layer 3: EditQ-Wdg  │  │  │    │    ║
║  │  │SetImport  │ │  │SlidePanel│ │  ├────────────────────┤  │  │    │    ║
║  │  │Dialog     │ │  │Drawer    │ │  │ Layer 4: Annotation │  │  │    │    ║
║  │  └───────────┘ │  └──────────┘ │  ├────────────────────┤  │  │    │    ║
║  │                │  ┌──────────┐ │  │ Layer 5: UI Overlay │  │  │    │    ║
║  │  ┌───────────┐ │  │ Bottom   │ │  └────────────────────┘  │  │    │    ║
║  │  │EndClass   │ │  │ Toolbar  │ └──────────────────────────┘  │    │    ║
║  │  │Dialog     │ │  └──────────┘                               │    │    ║
║  │  └───────────┘ └─────────────────────────────────────────────┘    │    ║
║  └─────────────────────────────────────────────────────────────────────┘    ║
║                                   │                                          ║
║  ┌─────────────────────────────────▼─────────────────────────────────────┐  ║
║  │                        STATE LAYER (Riverpod)                         │  ║
║  │                                                                       │  ║
║  │  toolProvider        canvasProvider       slideProvider               │  ║
║  │  appModeProvider     sessionProvider      questionWidgetProvider       │  ║
║  │  interactionMode     selectedWidget       canvasSizeProvider          │  ║
║  │  Provider            Provider             currentSlideIdProvider      │  ║
║  └────────────────┬──────────────────────────┬────────────────────────┘  ║
║                   │                          │                              ║
║  ┌────────────────▼──────┐  ┌───────────────▼────────────────────────────┐ ║
║  │   LOCAL DATA LAYER    │  │           REMOTE DATA LAYER                 │ ║
║  │  Hive (Fast K/V)      │  │  Dio + AuthInterceptor + RetryInterceptor   │ ║
║  │  SecureStorage        │  │  EduHub Backend: https://api.eduhub.in/api/v1│ ║
║  │  pendingSync box      │  │                                             │ ║
║  └───────────────────────┘  └─────────────────────────────────────────────┘ ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 5. Data Models

### 5.1 CanvasObjectModel

```dart
// lib/features/whiteboard/data/models/canvas_object_model.dart

import 'package:hive/hive.dart';
import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';

part 'canvas_object_model.g.dart';

// Hive typeId: 4
@HiveType(typeId: 4)
class CanvasObjectModel extends HiveObject {
  @HiveField(0)  final String   id;
  @HiveField(1)  final ObjectType type;
  @HiveField(2)  final double   x;
  @HiveField(3)  final double   y;
  @HiveField(4)  final double   width;
  @HiveField(5)  final double   height;
  @HiveField(6)  final double   rotation;       // degrees 0–360
  @HiveField(7)  final int      fillColorARGB;
  @HiveField(8)  final int      borderColorARGB;
  @HiveField(9)  final double   borderWidth;
  @HiveField(10) final double   opacity;
  @HiveField(11) final bool     isLocked;
  @HiveField(12) final int      zIndex;
  @HiveField(13) final String   slideId;
  @HiveField(14) final Map<String, dynamic> extra; // type-specific (see below)

  CanvasObjectModel({
    String? id,
    required this.type,
    required this.x,
    required this.y,
    required this.width,
    required this.height,
    this.rotation       = 0.0,
    this.fillColorARGB  = 0x00000000,
    this.borderColorARGB= 0xFFFFFFFF,
    this.borderWidth    = 1.0,
    this.opacity        = 1.0,
    this.isLocked       = false,
    this.zIndex         = 0,
    required this.slideId,
    Map<String, dynamic>? extra,
  })  : id    = id ?? const Uuid().v4(),
        extra = extra ?? {};

  Color get fillColor   => Color(fillColorARGB);
  Color get borderColor => Color(borderColorARGB);
  Rect  get bounds      => Rect.fromLTWH(x, y, width, height);

  CanvasObjectModel copyWith({
    double? x, double? y, double? width, double? height,
    double? rotation, int? fillColorARGB, int? borderColorARGB,
    double? borderWidth, double? opacity, bool? isLocked,
    int? zIndex, Map<String, dynamic>? extra,
  }) => CanvasObjectModel(
    id:              id,
    type:            type,
    x:               x              ?? this.x,
    y:               y              ?? this.y,
    width:           width          ?? this.width,
    height:          height         ?? this.height,
    rotation:        rotation       ?? this.rotation,
    fillColorARGB:   fillColorARGB  ?? this.fillColorARGB,
    borderColorARGB: borderColorARGB?? this.borderColorARGB,
    borderWidth:     borderWidth    ?? this.borderWidth,
    opacity:         opacity        ?? this.opacity,
    isLocked:        isLocked       ?? this.isLocked,
    zIndex:          zIndex         ?? this.zIndex,
    slideId:         slideId,
    extra:           extra          ?? Map.from(this.extra),
  );

  Map<String, dynamic> toJson() => {
    'id': id, 'type': type.name,
    'x': x, 'y': y, 'width': width, 'height': height,
    'rotation': rotation,
    'fillColorARGB': fillColorARGB, 'borderColorARGB': borderColorARGB,
    'borderWidth': borderWidth, 'opacity': opacity,
    'isLocked': isLocked, 'zIndex': zIndex,
    'slideId': slideId, 'extra': extra,
  };

  factory CanvasObjectModel.fromJson(Map<String, dynamic> json) => CanvasObjectModel(
    id:              json['id'] as String,
    type:            ObjectType.values.byName(json['type'] as String),
    x:               (json['x'] as num).toDouble(),
    y:               (json['y'] as num).toDouble(),
    width:           (json['width'] as num).toDouble(),
    height:          (json['height'] as num).toDouble(),
    rotation:        (json['rotation'] as num?)?.toDouble() ?? 0.0,
    fillColorARGB:   json['fillColorARGB'] as int? ?? 0x00000000,
    borderColorARGB: json['borderColorARGB'] as int? ?? 0xFFFFFFFF,
    borderWidth:     (json['borderWidth'] as num?)?.toDouble() ?? 1.0,
    opacity:         (json['opacity'] as num?)?.toDouble() ?? 1.0,
    isLocked:        json['isLocked'] as bool? ?? false,
    zIndex:          json['zIndex'] as int? ?? 0,
    slideId:         json['slideId'] as String,
    extra:           Map<String, dynamic>.from(json['extra'] as Map? ?? {}),
  );
}

// "extra" field contents by ObjectType:
// textBox    → { "text": "Hello", "fontSize": 18.0, "fontFamily": "DM Sans",
//               "textColorARGB": 0xFFFFFFFF, "textAlign": "left" }
// stickyNote → { "text": "...", "fontSize": 14.0 }
// arrow      → { "arrowStart": true, "arrowEnd": true }
// imageBox   → { "imagePath": "/local/path/img.png", "imageUrl": "https://..." }
// rectangle/circle/triangle → {} (all style in top-level fields)

// Hive typeId: 8
@HiveType(typeId: 8)
enum ObjectType {
  @HiveField(0)  rectangle,
  @HiveField(1)  roundedRect,
  @HiveField(2)  circle,
  @HiveField(3)  triangle,
  @HiveField(4)  star,
  @HiveField(5)  polygon,
  @HiveField(6)  line,
  @HiveField(7)  arrow,
  @HiveField(8)  doubleArrow,
  @HiveField(9)  callout,
  @HiveField(10) textBox,
  @HiveField(11) stickyNote,
  @HiveField(12) imageBox,
  @HiveField(13) ruler,
  @HiveField(14) protractor,
  @HiveField(15) compass,
}
```

### 5.2 StrokeModel

```dart
// lib/features/whiteboard/data/models/stroke_model.dart
// IMPORTANT: Offset stored via custom OffsetAdapter (typeId: 20) — see Section 14.4

import 'package:flutter/material.dart';
import 'package:hive/hive.dart';

part 'stroke_model.g.dart';

// Hive typeId: 3
@HiveType(typeId: 3)
class StrokeModel extends HiveObject {
  @HiveField(0) final String         id;
  @HiveField(1) final List<Offset>   points;   // Uses OffsetAdapter (typeId: 20)
  @HiveField(2) final int            colorARGB;
  @HiveField(3) final double         strokeWidth;
  @HiveField(4) final StrokeType     type;
  @HiveField(5) final double         opacity;
  @HiveField(6) final String         slideId;

  Color get color => Color(colorARGB);

  StrokeModel({
    required this.id,
    required this.points,
    required this.colorARGB,
    required this.strokeWidth,
    required this.type,
    required this.opacity,
    required this.slideId,
  });

  // ✅ copyWith — was missing in v3.0
  StrokeModel copyWith({
    String?       id,
    List<Offset>? points,
    int?          colorARGB,
    double?       strokeWidth,
    StrokeType?   type,
    double?       opacity,
    String?       slideId,
  }) => StrokeModel(
    id:          id          ?? this.id,
    points:      points      ?? this.points,
    colorARGB:   colorARGB   ?? this.colorARGB,
    strokeWidth: strokeWidth ?? this.strokeWidth,
    type:        type        ?? this.type,
    opacity:     opacity     ?? this.opacity,
    slideId:     slideId     ?? this.slideId,
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'points': points.map((p) => [p.dx, p.dy]).toList(),
    'colorARGB':   colorARGB,
    'strokeWidth': strokeWidth,
    'type':        type.name,
    'opacity':     opacity,
    'slideId':     slideId,
  };

  factory StrokeModel.fromJson(Map<String, dynamic> json, String slideId) =>
    StrokeModel(
      id:          json['id'] as String,
      points:      (json['points'] as List)
                     .map((p) => Offset(
                       (p as List)[0] as double,
                       p[1] as double,
                     ))
                     .toList(),
      colorARGB:   json['colorARGB'] as int,
      strokeWidth: (json['strokeWidth'] as num).toDouble(),
      type:        StrokeType.values.byName(json['type'] as String),
      opacity:     (json['opacity'] as num).toDouble(),
      slideId:     slideId,
    );
}

// Hive typeId: 9
@HiveType(typeId: 9)
enum StrokeType {
  @HiveField(0) softPen,
  @HiveField(1) hardPen,
  @HiveField(2) highlighter,
  @HiveField(3) chalk,
  @HiveField(4) calligraphy,
  @HiveField(5) spray,
  @HiveField(6) laserPointer,  // NOT saved — ephemeral
}
```

### 5.3 QuestionWidgetModel & QuestionWidgetStyle

```dart
// lib/features/question_widget/data/models/question_widget_style.dart
// IMPORTANT: BoxFit cannot be stored directly in Hive.
// We store bgImageFitIndex (int) and expose bgImageFit as a getter.

import 'package:flutter/material.dart';
import 'package:hive/hive.dart';

part 'question_widget_style.g.dart';

// Hive typeId: 11
@HiveType(typeId: 11)
class QuestionWidgetStyle extends HiveObject {
  @HiveField(0)  final int    questionTextColorARGB;
  @HiveField(1)  final int    questionBgColorARGB;
  @HiveField(2)  final int    optionTextColorARGB;
  @HiveField(3)  final int    optionBgColorARGB;
  @HiveField(4)  final double questionFontSize;
  @HiveField(5)  final double optionFontSize;
  @HiveField(6)  final String fontFamily;       // 'DM Sans' | 'Noto Sans Devanagari'
  @HiveField(7)  final double borderRadius;
  @HiveField(8)  final double borderWidth;
  @HiveField(9)  final int    borderColorARGB;
  @HiveField(10) final bool   hasShadow;
  @HiveField(11) final double padding;
  @HiveField(12) final String? bgImagePath;
  @HiveField(13) final String? bgImageUrl;
  @HiveField(14) final double bgImageOpacity;
  // ✅ v3.1 FIX: Store as int index instead of BoxFit (Flutter type not Hive-serializable)
  @HiveField(15) final int   bgImageFitIndex;

  // Getter for convenient access
  BoxFit get bgImageFit => BoxFit.values[bgImageFitIndex];

  const QuestionWidgetStyle({
    required this.questionTextColorARGB,
    required this.questionBgColorARGB,
    required this.optionTextColorARGB,
    required this.optionBgColorARGB,
    required this.questionFontSize,
    required this.optionFontSize,
    required this.fontFamily,
    required this.borderRadius,
    required this.borderWidth,
    required this.borderColorARGB,
    required this.hasShadow,
    required this.padding,
    this.bgImagePath,
    this.bgImageUrl,
    required this.bgImageOpacity,
    required this.bgImageFitIndex,
  });

  // Default coaching aesthetic: black bg, white question, yellow options
  static const QuestionWidgetStyle defaults = QuestionWidgetStyle(
    questionTextColorARGB: 0xFFFFFFFF,
    questionBgColorARGB:   0xFF000000,
    optionTextColorARGB:   0xFFFFFF00,
    optionBgColorARGB:     0x00000000,
    questionFontSize:      22.0,
    optionFontSize:        20.0,
    fontFamily:            'DM Sans',
    borderRadius:          8.0,
    borderWidth:           0.0,
    borderColorARGB:       0xFF444444,
    hasShadow:             false,
    padding:               16.0,
    bgImagePath:           null,
    bgImageUrl:            null,
    bgImageOpacity:        1.0,
    bgImageFitIndex:       0,  // BoxFit.fill = index 0
  );

  // BoxFit.cover = 2, BoxFit.contain = 1, BoxFit.fill = 0, BoxFit.fitWidth = 3, BoxFit.fitHeight = 4
  // Full list: BoxFit.values = [fill, contain, cover, fitWidth, fitHeight, none, scaleDown]

  QuestionWidgetStyle copyWith({
    int? questionTextColorARGB, int? questionBgColorARGB,
    int? optionTextColorARGB, int? optionBgColorARGB,
    double? questionFontSize, double? optionFontSize,
    String? fontFamily, double? borderRadius, double? borderWidth,
    int? borderColorARGB, bool? hasShadow, double? padding,
    String? bgImagePath, String? bgImageUrl,
    double? bgImageOpacity, int? bgImageFitIndex,
  }) => QuestionWidgetStyle(
    questionTextColorARGB: questionTextColorARGB ?? this.questionTextColorARGB,
    questionBgColorARGB:   questionBgColorARGB   ?? this.questionBgColorARGB,
    optionTextColorARGB:   optionTextColorARGB   ?? this.optionTextColorARGB,
    optionBgColorARGB:     optionBgColorARGB     ?? this.optionBgColorARGB,
    questionFontSize:      questionFontSize      ?? this.questionFontSize,
    optionFontSize:        optionFontSize        ?? this.optionFontSize,
    fontFamily:            fontFamily            ?? this.fontFamily,
    borderRadius:          borderRadius          ?? this.borderRadius,
    borderWidth:           borderWidth           ?? this.borderWidth,
    borderColorARGB:       borderColorARGB       ?? this.borderColorARGB,
    hasShadow:             hasShadow             ?? this.hasShadow,
    padding:               padding               ?? this.padding,
    bgImagePath:           bgImagePath           ?? this.bgImagePath,
    bgImageUrl:            bgImageUrl            ?? this.bgImageUrl,
    bgImageOpacity:        bgImageOpacity        ?? this.bgImageOpacity,
    bgImageFitIndex:       bgImageFitIndex       ?? this.bgImageFitIndex,
  );

  Map<String, dynamic> toJson() => {
    'questionTextColorARGB': questionTextColorARGB,
    'questionBgColorARGB':   questionBgColorARGB,
    'optionTextColorARGB':   optionTextColorARGB,
    'optionBgColorARGB':     optionBgColorARGB,
    'questionFontSize':      questionFontSize,
    'optionFontSize':        optionFontSize,
    'fontFamily':            fontFamily,
    'borderRadius':          borderRadius,
    'borderWidth':           borderWidth,
    'borderColorARGB':       borderColorARGB,
    'hasShadow':             hasShadow,
    'padding':               padding,
    'bgImagePath':           bgImagePath,
    'bgImageUrl':            bgImageUrl,
    'bgImageOpacity':        bgImageOpacity,
    'bgImageFitIndex':       bgImageFitIndex,
  };
}
```

```dart
// lib/features/question_widget/data/models/question_widget_model.dart

import 'package:hive/hive.dart';
import 'package:flutter/material.dart';

part 'question_widget_model.g.dart';

// Hive typeId: 10
@HiveType(typeId: 10)
class QuestionWidgetModel extends HiveObject {
  @HiveField(0)  final String            id;
  @HiveField(1)  final String            slideId;
  @HiveField(2)  final int               questionNumber;
  @HiveField(3)  final String            questionText;    // HTML string
  @HiveField(4)  final String?           questionImageUrl;
  @HiveField(5)  final List<SlideOption> options;
  @HiveField(6)  final String?           correctAnswer;
  @HiveField(7)  final double            x;
  @HiveField(8)  final double            y;
  @HiveField(9)  final double            width;
  @HiveField(10) final double            height;
  @HiveField(11) final int               zIndex;
  @HiveField(12) final bool              isLocked;
  @HiveField(13) final QuestionWidgetStyle style;

  static const double kMinWidth  = 200.0;
  static const double kMaxWidth  = 1800.0;
  static const double kMinHeight = 100.0;
  static const double kMaxHeight = 900.0;

  const QuestionWidgetModel({
    required this.id,
    required this.slideId,
    required this.questionNumber,
    required this.questionText,
    this.questionImageUrl,
    required this.options,
    this.correctAnswer,
    required this.x,
    required this.y,
    required this.width,
    required this.height,
    required this.zIndex,
    required this.isLocked,
    required this.style,
  });

  QuestionWidgetModel copyWith({
    double? x, double? y, double? width, double? height,
    int? zIndex, bool? isLocked, QuestionWidgetStyle? style,
    String? questionText,
  }) => QuestionWidgetModel(
    id:              id,
    slideId:         slideId,
    questionNumber:  questionNumber,
    questionText:    questionText    ?? this.questionText,
    questionImageUrl: questionImageUrl,
    options:         options,
    correctAnswer:   correctAnswer,
    x:       x      ?? this.x,
    y:       y      ?? this.y,
    width:   width  ?? this.width,
    height:  height ?? this.height,
    zIndex:  zIndex ?? this.zIndex,
    isLocked: isLocked ?? this.isLocked,
    style:   style  ?? this.style,
  );

  Map<String, dynamic> toJson() => {
    'x': x, 'y': y, 'width': width, 'height': height,
    'zIndex': zIndex, 'isLocked': isLocked,
    'style': style.toJson(),
  };
}
```

### 5.4 SlideOption

```dart
// Part of lib/features/whiteboard/data/models/slide_model.dart

// Hive typeId: 2
@HiveType(typeId: 2)
class SlideOption extends HiveObject {
  @HiveField(0) final String  label;       // 'A' | 'B' | 'C' | 'D'
  @HiveField(1) final String  text;
  @HiveField(2) final String? imageUrl;

  SlideOption({required this.label, required this.text, this.imageUrl});

  factory SlideOption.fromJson(Map<String, dynamic> json) => SlideOption(
    label:    json['label'] as String,
    text:     json['text'] as String,
    imageUrl: json['imageUrl'] as String?,
  );

  Map<String, dynamic> toJson() => {'label': label, 'text': text, 'imageUrl': imageUrl};
}
```

### 5.5 SetSlideModel

```dart
// lib/features/whiteboard/data/models/slide_model.dart

// Hive typeId: 1
@HiveType(typeId: 1)
class SetSlideModel extends HiveObject {
  @HiveField(0) final String            slideId;
  @HiveField(1) final int               questionNumber;
  @HiveField(2) final String            questionText;       // HTML
  @HiveField(3) final String?           questionImageUrl;
  @HiveField(4) final List<SlideOption> options;
  @HiveField(5) final String?           correctAnswer;
  @HiveField(6) final String?           examSource;
  @HiveField(7) final String?           subject;
  @HiveField(8) final String?           backgroundImageUrl;

  SetSlideModel({
    required this.slideId,
    required this.questionNumber,
    required this.questionText,
    this.questionImageUrl,
    required this.options,
    this.correctAnswer,
    this.examSource,
    this.subject,
    this.backgroundImageUrl,
  });

  factory SetSlideModel.fromJson(Map<String, dynamic> json) => SetSlideModel(
    slideId:            json['id'] as String,
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
```

### 5.6 SlideAnnotationData & SlideColorConfig

```dart
// lib/features/whiteboard/data/models/slide_annotation.dart

// Hive typeId: 5
@HiveType(typeId: 5)
class SlideAnnotationData extends HiveObject {
  @HiveField(0) final String                 slideId;
  @HiveField(1) final List<StrokeModel>      strokes;
  @HiveField(2) final List<CanvasObjectModel> objects;
  @HiveField(3) final SlideColorConfig?      colorConfig;
  @HiveField(4) final String?                bgImagePath;

  SlideAnnotationData({
    required this.slideId,
    List<StrokeModel>?      strokes,
    List<CanvasObjectModel>? objects,
    this.colorConfig,
    this.bgImagePath,
  })  : strokes = strokes ?? [],
        objects = objects ?? [];

  Map<String, dynamic> toJson() => {
    'strokes': strokes.map((s) => s.toJson()).toList(),
    'objects': objects.map((o) => o.toJson()).toList(),
  };
}

// Hive typeId: 6
@HiveType(typeId: 6)
class SlideColorConfig extends HiveObject {
  @HiveField(0) final int questionTextColorARGB;
  @HiveField(1) final int questionBgColorARGB;
  @HiveField(2) final int optionTextColorARGB;
  @HiveField(3) final int optionBgColorARGB;
  @HiveField(4) final int screenBgColorARGB;

  SlideColorConfig({
    required this.questionTextColorARGB,
    required this.questionBgColorARGB,
    required this.optionTextColorARGB,
    required this.optionBgColorARGB,
    required this.screenBgColorARGB,
  });

  Map<String, dynamic> toJson() => {
    'questionTextColorARGB': questionTextColorARGB,
    'questionBgColorARGB':   questionBgColorARGB,
    'optionTextColorARGB':   optionTextColorARGB,
    'optionBgColorARGB':     optionBgColorARGB,
    'screenBgColorARGB':     screenBgColorARGB,
  };
}
```

### 5.7 WhiteboardSessionModel

```dart
// lib/features/whiteboard/data/models/session_model.dart
// NOTE: Map<String, SlideAnnotationData> is stored by serializing to JSON string.
// Do NOT try to use Map directly as a HiveField for complex types.

// Hive typeId: 7
@HiveType(typeId: 7)
class WhiteboardSessionModel extends HiveObject {
  @HiveField(0) final String   sessionId;
  @HiveField(1) final String   setId;
  @HiveField(2) final String   teacherId;
  @HiveField(3) final String   orgId;
  @HiveField(4) final DateTime startTime;
  @HiveField(5) final DateTime lastSaved;
  @HiveField(6) final int      currentSlideIndex;
  @HiveField(7) final List<int> slidesCovered;
  @HiveField(8) final String   annotationsJson; // JSON-encoded Map<slideId, annotation>

  WhiteboardSessionModel({
    required this.sessionId,
    required this.setId,
    required this.teacherId,
    required this.orgId,
    required this.startTime,
    required this.lastSaved,
    required this.currentSlideIndex,
    required this.slidesCovered,
    required this.annotationsJson,
  });
}
```

---

## 6. Canvas Engine Architecture

### 6.1 Five-Layer Stack

```
WhiteboardCanvas (InteractiveViewer — pan/zoom only when Tool.navigate active)
│
└── LayoutBuilder → updates canvasSizeProvider on every build
    └── Stack(fit: StackFit.expand, children: [
        │
        ├── [0] BackgroundLayer             ← Layer 1 — static, always rendered
        │        Container(color) OR Image.file / Image.network
        │
        ├── [1] SlideContentLayer           ← Layer 2 — READ-ONLY, slideMode only
        │        QuestionSlideRenderer(slide)
        │        AbsorbPointer(absorbing: true) ← blocks ALL gestures
        │        Visibility(visible: isSlideMode)
        │
        ├── [2] EditableQuestionLayer       ← Layer 3 — Figma-style objects
        │        RepaintBoundary
        │        Stack of DraggableResizableQuestionWidget
        │        AbsorbPointer(absorbing: isDrawMode)
        │
        ├── [3] AnnotationLayer             ← Layer 4 — teacher pen strokes
        │        RepaintBoundary ← CRITICAL: never remove
        │        GestureDetector → canvasProvider
        │        CustomPaint(painter: CanvasPainter(...))
        │        AbsorbPointer(absorbing: isSelectMode)
        │
        ├── [4] MathToolOverlay             ← Layer 5a
        │
        └── [5] UIOverlayLayer              ← Layer 5b
    ])
```

### 6.2 WhiteboardCanvas Implementation

```dart
// lib/features/whiteboard/presentation/widgets/canvas/whiteboard_canvas.dart

class WhiteboardCanvas extends ConsumerWidget {
  const WhiteboardCanvas({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final appMode    = ref.watch(appModeProvider);
    final interMode  = ref.watch(toolProvider.select((s) => s.interactionMode));
    final isSlide    = appMode == AppMode.slideMode;
    final isDrawMode = interMode == InteractionMode.drawMode;

    return LayoutBuilder(
      builder: (context, constraints) {
        // ✅ Update canvasSizeProvider after layout
        WidgetsBinding.instance.addPostFrameCallback((_) {
          ref.read(canvasSizeProvider.notifier).state = constraints.biggest;
        });

        return Stack(
          fit: StackFit.expand,
          children: [
            const BackgroundLayer(),
            if (isSlide) const SlideContentLayer(),
            if (isSlide || appMode == AppMode.preparationEdit)
              EditableQuestionLayer(absorbPointer: isDrawMode),
            AnnotationLayer(absorbPointer: !isDrawMode),
            const MathToolOverlay(),
            const UIOverlayLayer(),
          ],
        );
      },
    );
  }
}
```

### 6.3 CanvasPainter

```dart
// lib/features/whiteboard/presentation/widgets/drawing/canvas_painter.dart

class CanvasPainter extends CustomPainter {
  final List<StrokeModel>      strokes;
  final StrokeModel?           activeStroke;
  final List<CanvasObjectModel> objects;

  const CanvasPainter({
    required this.strokes,
    this.activeStroke,
    required this.objects,
  });

  @override
  void paint(Canvas canvas, Size size) {
    for (final stroke in strokes) {
      StrokeRenderer.render(canvas, stroke);
    }
    if (activeStroke != null) {
      StrokeRenderer.render(canvas, activeStroke!);
    }
    final sorted = [...objects]..sort((a, b) => a.zIndex.compareTo(b.zIndex));
    for (final obj in sorted) {
      ObjectRenderer.render(canvas, obj);
    }
  }

  @override
  bool shouldRepaint(CanvasPainter old) =>
    !identical(old.strokes,      strokes)      ||
    !identical(old.activeStroke, activeStroke) ||
    !identical(old.objects,      objects);
}
```

### 6.4 Gesture Routing

```dart
// AnnotationLayer (Layer 4):
AbsorbPointer(
  absorbing: absorbPointer,   // true when interactionMode == selectMode
  child: GestureDetector(
    onPanStart:  (d) => ref.read(canvasProvider.notifier).startStroke(d.localPosition),
    onPanUpdate: (d) => ref.read(canvasProvider.notifier).updateStroke(d.localPosition),
    onPanEnd:    (_) => ref.read(canvasProvider.notifier).endStroke(),
    child: RepaintBoundary(
      child: CustomPaint(
        painter: CanvasPainter(
          strokes:      ref.watch(canvasProvider.select((s) => s.strokes)),
          activeStroke: ref.watch(canvasProvider.select((s) => s.activeStroke)),
          objects:      ref.watch(canvasProvider.select((s) => s.objects)),
        ),
        child: const SizedBox.expand(),
      ),
    ),
  ),
)
```

---

## 7. State Management Architecture

### 7.1 Provider Map

```
authProvider            → TeacherModel? (null = logged out)
appModeProvider         → AppMode
toolProvider            → ToolSettings { activeTool, color, strokeWidth, ... }
interactionMode         → derived from toolProvider.interactionMode
canvasProvider          → CanvasState { strokes, activeStroke, objects, undo, redo }
slideProvider           → SlideState { slides, currentSlideIndex, setMetadata, annotations }
questionWidgetProvider  → Map<String, QuestionWidgetModel>   (slideId → widget)
selectedWidgetProvider  → String?  (null = nothing selected)
sessionProvider         → SessionState { sessionId, saveStatus, isDirty, ... }
canvasSizeProvider      → Size  (updated by LayoutBuilder in WhiteboardCanvas)
currentSlideIdProvider  → String?  (derived from slideProvider)
isOnlineProvider        → AsyncValue<bool>  (stream from connectivity_plus)
```

### 7.2 CanvasNotifier

```dart
// lib/features/whiteboard/presentation/providers/canvas_provider.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'canvas_provider.g.dart';

@riverpod
class CanvasNotifier extends _$CanvasNotifier {
  @override
  CanvasState build() => CanvasState.initial();

  void startStroke(Offset point) {
    final settings  = ref.read(toolProvider);
    final slideId   = ref.read(currentSlideIdProvider) ?? '';
    state = state.copyWith(
      activeStroke: StrokeModel(
        id:          const Uuid().v4(),
        points:      [point],
        colorARGB:   settings.color.value,
        strokeWidth: settings.strokeWidth,
        type:        settings.activeTool.toStrokeType(),
        opacity:     settings.opacity,
        slideId:     slideId,
      ),
    );
  }

  void updateStroke(Offset point) {
    final active = state.activeStroke;
    if (active == null) return;
    state = state.copyWith(
      activeStroke: active.copyWith(points: [...active.points, point]),
    );
  }

  void endStroke() {
    final completed = state.activeStroke;
    if (completed == null) return;
    final newStrokes = [...state.strokes, completed];
    state = state.copyWith(
      strokes:          newStrokes,
      clearActiveStroke: true,
      undoStack: [
        ...state.undoStack.takeLast50(),
        CanvasSnapshot(strokes: state.strokes, objects: state.objects),
      ],
      redoStack: [],
    );
    ref.read(sessionProvider.notifier).markDirty();
  }

  void undo() {
    if (state.undoStack.isEmpty) return;
    final prev = state.undoStack.last;
    state = state.copyWith(
      strokes:   prev.strokes,
      objects:   prev.objects,
      undoStack: state.undoStack.sublist(0, state.undoStack.length - 1),
      redoStack: [
        CanvasSnapshot(strokes: state.strokes, objects: state.objects),
        ...state.redoStack,
      ],
    );
  }

  void redo() {
    if (state.redoStack.isEmpty) return;
    final next = state.redoStack.first;
    state = state.copyWith(
      strokes:   next.strokes,
      objects:   next.objects,
      undoStack: [
        ...state.undoStack,
        CanvasSnapshot(strokes: state.strokes, objects: state.objects),
      ],
      redoStack: state.redoStack.sublist(1),
    );
  }

  void addObject(CanvasObjectModel obj) {
    _pushUndoAndUpdate(objects: [...state.objects, obj]);
    ref.read(sessionProvider.notifier).markDirty();
  }

  void updateObjectPosition(String id, Offset newPos) {
    final updated = state.objects.map((o) =>
      o.id == id ? o.copyWith(x: newPos.dx, y: newPos.dy) : o
    ).toList();
    _pushUndoAndUpdate(objects: updated);
    ref.read(sessionProvider.notifier).markDirty();
  }

  void deleteObject(String id) {
    _pushUndoAndUpdate(
      objects: state.objects.where((o) => o.id != id).toList(),
    );
    ref.read(sessionProvider.notifier).markDirty();
  }

  void clearSlide() {
    _pushUndoAndUpdate(strokes: [], objects: []);
    ref.read(sessionProvider.notifier).markDirty();
  }

  void loadFromAnnotation(SlideAnnotationData data) {
    state = CanvasState(
      strokes:      List.from(data.strokes),
      objects:      List.from(data.objects),
      activeStroke: null,
      undoStack:    [],
      redoStack:    [],
    );
  }

  void _pushUndoAndUpdate({List<StrokeModel>? strokes, List<CanvasObjectModel>? objects}) {
    state = state.copyWith(
      strokes:   strokes ?? state.strokes,
      objects:   objects ?? state.objects,
      undoStack: [
        ...state.undoStack.takeLast50(),
        CanvasSnapshot(strokes: state.strokes, objects: state.objects),
      ],
      redoStack: [],
    );
  }
}

// Helper extension to keep undo stack bounded at 50
extension _ListBound<T> on List<T> {
  List<T> takeLast50() => length >= 50 ? sublist(length - 49) : this;
}
```

### 7.3 QuestionWidgetNotifier

```dart
// lib/features/question_widget/presentation/providers/question_widget_provider.dart

@riverpod
class QuestionWidgetNotifier extends _$QuestionWidgetNotifier {
  @override
  Map<String, QuestionWidgetModel> build() => {};

  void populateFromSlides(List<SetSlideModel> slides) {
    final initial = <String, QuestionWidgetModel>{};
    for (int i = 0; i < slides.length; i++) {
      final slide = slides[i];
      initial[slide.slideId] = QuestionWidgetModel(
        id:              slide.slideId,
        slideId:         slide.slideId,
        questionNumber:  slide.questionNumber,
        questionText:    slide.questionText,
        questionImageUrl: slide.questionImageUrl,
        options:         slide.options,
        correctAnswer:   slide.correctAnswer,
        x:       100,
        y:       80,
        width:   900,
        height:  480,
        zIndex:  i,
        isLocked: false,
        style:   QuestionWidgetStyle.defaults,
      );
    }
    state = initial;
  }

  void updatePosition(String id, Offset pos) {
    final widget = state[id];
    if (widget == null || widget.isLocked) return;
    state = {...state, id: widget.copyWith(x: pos.dx, y: pos.dy)};
    ref.read(sessionProvider.notifier).markDirty();
  }

  void updateSize(String id, Size size) {
    final widget = state[id];
    if (widget == null || widget.isLocked) return;
    state = {...state, id: widget.copyWith(width: size.width, height: size.height)};
    ref.read(sessionProvider.notifier).markDirty();
  }

  void updateStyle(String id, QuestionWidgetStyle style) {
    final widget = state[id];
    if (widget == null) return;
    state = {...state, id: widget.copyWith(style: style)};
    ref.read(sessionProvider.notifier).markDirty();
  }

  void updateText(String id, String newText) {
    final widget = state[id];
    if (widget == null) return;
    state = {...state, id: widget.copyWith(questionText: newText)};
    ref.read(sessionProvider.notifier).markDirty();
  }

  void toggleLock(String id) {
    final widget = state[id];
    if (widget == null) return;
    state = {...state, id: widget.copyWith(isLocked: !widget.isLocked)};
  }

  void remove(String id) {
    final newState = Map<String, QuestionWidgetModel>.from(state)..remove(id);
    state = newState;
    ref.read(sessionProvider.notifier).markDirty();
  }

  void bringToFront(String id) {
    if (state.isEmpty) return;
    final maxZ = state.values.map((w) => w.zIndex).reduce((a, b) => a > b ? a : b);
    final widget = state[id];
    if (widget == null) return;
    state = {...state, id: widget.copyWith(zIndex: maxZ + 1)};
    _normalizeZIndex();
  }

  void sendToBack(String id) {
    final widget = state[id];
    if (widget == null) return;
    state = {...state, id: widget.copyWith(zIndex: -1)};
    _normalizeZIndex();
  }

  void _normalizeZIndex() {
    final sorted = state.values.toList()
      ..sort((a, b) => a.zIndex.compareTo(b.zIndex));
    final normalized = <String, QuestionWidgetModel>{};
    for (int i = 0; i < sorted.length; i++) {
      normalized[sorted[i].id] = sorted[i].copyWith(zIndex: i);
    }
    state = normalized;
  }
}

// Simple provider for selected widget id
@riverpod
class SelectedWidgetNotifier extends _$SelectedWidgetNotifier {
  @override
  String? build() => null;

  void select(String id) => state = id;
  void deselect()         => state = null;
}
```

### 7.4 CanvasState & CanvasSnapshot (NEW in v3.1)

```dart
// lib/features/whiteboard/presentation/providers/canvas_provider.dart
// (add these classes above CanvasNotifier)

class CanvasSnapshot {
  final List<StrokeModel>      strokes;
  final List<CanvasObjectModel> objects;

  const CanvasSnapshot({required this.strokes, required this.objects});
}

class CanvasState {
  final List<StrokeModel>      strokes;
  final StrokeModel?           activeStroke;
  final List<CanvasObjectModel> objects;
  final List<CanvasSnapshot>   undoStack;
  final List<CanvasSnapshot>   redoStack;

  const CanvasState({
    required this.strokes,
    this.activeStroke,
    required this.objects,
    required this.undoStack,
    required this.redoStack,
  });

  factory CanvasState.initial() => const CanvasState(
    strokes:      [],
    activeStroke: null,
    objects:      [],
    undoStack:    [],
    redoStack:    [],
  );

  CanvasState copyWith({
    List<StrokeModel>?       strokes,
    StrokeModel?             activeStroke,
    bool                     clearActiveStroke = false,
    List<CanvasObjectModel>? objects,
    List<CanvasSnapshot>?    undoStack,
    List<CanvasSnapshot>?    redoStack,
  }) => CanvasState(
    strokes:      strokes      ?? this.strokes,
    activeStroke: clearActiveStroke ? null : (activeStroke ?? this.activeStroke),
    objects:      objects      ?? this.objects,
    undoStack:    undoStack    ?? this.undoStack,
    redoStack:    redoStack    ?? this.redoStack,
  );
}
```

### 7.5 canvasSizeProvider & currentSlideIdProvider (NEW in v3.1)

```dart
// lib/features/whiteboard/presentation/providers/canvas_size_provider.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Updated by WhiteboardCanvas via LayoutBuilder on every build.
/// Default size matches a 1920×1080 canvas.
final canvasSizeProvider = StateProvider<Size>((ref) => const Size(1920, 1080));

/// Derived from slideProvider — always gives current slide's ID or null.
@riverpod
String? currentSlideId(CurrentSlideIdRef ref) {
  final state  = ref.watch(slideProvider);
  final slides = state.slides;
  final idx    = state.currentSlideIndex;
  if (slides.isEmpty || idx < 0 || idx >= slides.length) return null;
  return slides[idx].slideId;
}
```

### 7.6 SlideNotifier & SlideState (NEW in v3.1)

```dart
// lib/features/whiteboard/presentation/providers/slide_provider.dart

import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'slide_provider.g.dart';

// ── SlideState ──────────────────────────────────────────────────────────────

class SlideState {
  final List<SetSlideModel>              slides;
  final int                              currentSlideIndex;
  final SetMetadataModel?                setMetadata;
  final Map<String, SlideAnnotationData> savedAnnotations;

  const SlideState({
    required this.slides,
    required this.currentSlideIndex,
    this.setMetadata,
    required this.savedAnnotations,
  });

  factory SlideState.initial() => const SlideState(
    slides:            [],
    currentSlideIndex: 0,
    savedAnnotations:  {},
  );

  SetSlideModel? get currentSlide =>
    slides.isEmpty ? null : slides[currentSlideIndex];

  bool get hasSlides => slides.isNotEmpty;

  SlideState copyWith({
    List<SetSlideModel>?              slides,
    int?                              currentSlideIndex,
    SetMetadataModel?                 setMetadata,
    Map<String, SlideAnnotationData>? savedAnnotations,
  }) => SlideState(
    slides:            slides            ?? this.slides,
    currentSlideIndex: currentSlideIndex ?? this.currentSlideIndex,
    setMetadata:       setMetadata       ?? this.setMetadata,
    savedAnnotations:  savedAnnotations  ?? this.savedAnnotations,
  );
}

// ── SlideNotifier ───────────────────────────────────────────────────────────

@riverpod
class SlideNotifier extends _$SlideNotifier {
  @override
  SlideState build() => SlideState.initial();

  /// Called after successful Set import.
  void loadSlides(List<SetSlideModel> slides, SetMetadataModel metadata) {
    state = SlideState(
      slides:            slides,
      currentSlideIndex: 0,
      setMetadata:       metadata,
      savedAnnotations:  {},
    );
    // Load first slide canvas
    _activateSlide(0);
  }

  /// Navigate to a different slide by index.
  void navigateToSlide(int index) {
    if (index < 0 || index >= state.slides.length) return;
    if (index == state.currentSlideIndex) return;

    // 1. Persist current canvas annotations before leaving
    _persistCurrentCanvas();
    // 2. Update index
    state = state.copyWith(currentSlideIndex: index);
    // 3. Load new slide canvas
    _activateSlide(index);
    // 4. Deselect any selected widget
    ref.read(selectedWidgetProvider.notifier).deselect();
  }

  void _persistCurrentCanvas() {
    final canvas  = ref.read(canvasProvider);
    final slideId = state.currentSlide?.slideId;
    if (slideId == null) return;
    final annotation = SlideAnnotationData(
      slideId: slideId,
      strokes: List.from(canvas.strokes),
      objects: List.from(canvas.objects),
    );
    state = state.copyWith(
      savedAnnotations: {...state.savedAnnotations, slideId: annotation},
    );
  }

  void _activateSlide(int index) {
    final slide  = state.slides[index];
    final saved  = state.savedAnnotations[slide.slideId];
    ref.read(canvasProvider.notifier).loadFromAnnotation(
      saved ?? SlideAnnotationData(slideId: slide.slideId),
    );
  }
}
```

### 7.7 SessionNotifier & SessionState (NEW in v3.1)

```dart
// lib/features/whiteboard/presentation/providers/session_provider.dart
// lib/features/session/presentation/providers/session_notifier.dart

import 'dart:async';
import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'session_provider.g.dart';

// ── Enums & State ───────────────────────────────────────────────────────────

enum SaveStatus { idle, saving, saved, failed }

class SessionState {
  final String?    sessionId;
  final SaveStatus saveStatus;
  final DateTime?  lastSavedAt;
  final bool       isDirty;
  final Duration   classDuration;
  final List<int>  slidesCovered;

  const SessionState({
    this.sessionId,
    required this.saveStatus,
    this.lastSavedAt,
    required this.isDirty,
    required this.classDuration,
    required this.slidesCovered,
  });

  factory SessionState.initial() => const SessionState(
    sessionId:     null,
    saveStatus:    SaveStatus.idle,
    lastSavedAt:   null,
    isDirty:       false,
    classDuration: Duration.zero,
    slidesCovered: [],
  );

  SessionState copyWith({
    String?    sessionId,
    SaveStatus? saveStatus,
    DateTime?  lastSavedAt,
    bool?      isDirty,
    Duration?  classDuration,
    List<int>? slidesCovered,
  }) => SessionState(
    sessionId:     sessionId     ?? this.sessionId,
    saveStatus:    saveStatus    ?? this.saveStatus,
    lastSavedAt:   lastSavedAt   ?? this.lastSavedAt,
    isDirty:       isDirty       ?? this.isDirty,
    classDuration: classDuration ?? this.classDuration,
    slidesCovered: slidesCovered ?? this.slidesCovered,
  );
}

// ── SessionNotifier ─────────────────────────────────────────────────────────

@riverpod
class SessionNotifier extends _$SessionNotifier {
  Timer? _periodicTimer;
  Timer? _debounceTimer;
  Timer? _classTimer;

  @override
  SessionState build() {
    ref.onDispose(() {
      _periodicTimer?.cancel();
      _debounceTimer?.cancel();
      _classTimer?.cancel();
    });
    return SessionState.initial();
  }

  void startSession(String sessionId) {
    state = state.copyWith(
      sessionId:     sessionId,
      saveStatus:    SaveStatus.saved,
      lastSavedAt:   DateTime.now(),
      isDirty:       false,
      classDuration: Duration.zero,
    );
    _startTimers();
  }

  void _startTimers() {
    // Periodic auto-save every 30 seconds
    _periodicTimer = Timer.periodic(
      const Duration(seconds: 30),
      (_) => _autoSave(),
    );
    // Class duration timer — ticks every second
    _classTimer = Timer.periodic(
      const Duration(seconds: 1),
      (_) => state = state.copyWith(
        classDuration: state.classDuration + const Duration(seconds: 1),
      ),
    );
  }

  /// Called after any canvas change. Debounces 5 seconds then saves.
  void markDirty() {
    if (state.sessionId == null) return;
    state = state.copyWith(isDirty: true);
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(seconds: 5), _autoSave);
  }

  Future<void> _autoSave() async {
    if (!state.isDirty || state.sessionId == null) return;
    state = state.copyWith(saveStatus: SaveStatus.saving);

    final payload = _buildPayload();

    // 1. Always save to Hive first (offline-safe)
    final hiveBox = Hive.box<String>('pendingSync');
    await hiveBox.put(state.sessionId, jsonEncode(payload));

    // 2. If online → sync to server
    final isOnline = ref.read(isOnlineProvider).valueOrNull ?? false;
    if (isOnline) {
      final result = await ref
          .read(sessionRemoteDsProvider)
          .saveSession(state.sessionId!, payload);
      result.fold(
        (success) => state = state.copyWith(
          saveStatus:  SaveStatus.saved,
          isDirty:     false,
          lastSavedAt: DateTime.now(),
        ),
        (failure) {
          // Server failed — data is safe in Hive, will retry
          state = state.copyWith(saveStatus: SaveStatus.failed);
        },
      );
    } else {
      // Offline — already in Hive, mark saved locally
      state = state.copyWith(saveStatus: SaveStatus.saved, isDirty: false);
    }
  }

  /// Force immediate save (Ctrl+S)
  Future<void> forceSave() async {
    _debounceTimer?.cancel();
    await _autoSave();
  }

  /// Drain pending sync queue when connection is restored.
  Future<void> drainPendingSync() async {
    final box  = Hive.box<String>('pendingSync');
    final keys = box.keys.toList();
    for (final key in keys) {
      final jsonStr = box.get(key);
      if (jsonStr == null) continue;
      try {
        final payload = jsonDecode(jsonStr) as Map<String, dynamic>;
        final sid     = payload['sessionId'] as String;
        final result  = await ref
            .read(sessionRemoteDsProvider)
            .saveSession(sid, payload);
        result.fold(
          (_)  => box.delete(key),
          (_)  => null,  // leave in queue
        );
      } catch (_) {
        // Corrupted entry — remove it
        await box.delete(key);
      }
    }
  }

  Map<String, dynamic> _buildPayload() {
    final canvas      = ref.read(canvasProvider);
    final slideState  = ref.read(slideProvider);
    final widgetState = ref.read(questionWidgetProvider);
    final currentIdx  = slideState.currentSlideIndex;
    final covered     = List<int>.from(state.slidesCovered);
    if (!covered.contains(currentIdx)) covered.add(currentIdx);

    // Build annotations map — include current canvas (not yet persisted)
    final annotations = Map<String, SlideAnnotationData>.from(slideState.savedAnnotations);
    final currentSlide = slideState.currentSlide;
    if (currentSlide != null) {
      annotations[currentSlide.slideId] = SlideAnnotationData(
        slideId: currentSlide.slideId,
        strokes: canvas.strokes,
        objects: canvas.objects,
      );
    }

    return {
      'sessionId':     state.sessionId,
      'lastSaved':     DateTime.now().toIso8601String(),
      'slideIndex':    currentIdx,
      'slidesCovered': covered,
      'annotations':   annotations.map(
        (k, v) => MapEntry(k, v.toJson()),
      ),
      'questionWidgets': widgetState.map(
        (k, v) => MapEntry(k, v.toJson()),
      ),
    };
  }
}
```

### 7.8 AppModeNotifier (NEW in v3.1)

```dart
// lib/features/whiteboard/presentation/providers/app_mode_provider.dart

import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'app_mode_provider.g.dart';

enum AppMode {
  whiteboardFree,     // Blank canvas — no slides — free drawing
  slideMode,          // Set loaded — slides visible — annotation enabled
  annotationFloat,    // Floating toolbar over desktop
  presentationClean,  // Full screen — all UI hidden — student view
  preparationEdit,    // Pre-class — edit question widgets — no annotation
}

@riverpod
class AppModeNotifier extends _$AppModeNotifier {
  @override
  AppMode build() => AppMode.whiteboardFree;

  void setMode(AppMode mode) => state = mode;
  void enterSlideMode()       => state = AppMode.slideMode;
  void enterFreeMode()        => state = AppMode.whiteboardFree;
  void togglePresentation()   => state = state == AppMode.presentationClean
      ? AppMode.slideMode
      : AppMode.presentationClean;
}
```

### 7.9 isOnlineProvider

```dart
// lib/core/providers/connectivity_provider.dart

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'connectivity_provider.g.dart';

@riverpod
Stream<bool> isOnline(IsOnlineRef ref) {
  return Connectivity().onConnectivityChanged.map(
    (result) => result != ConnectivityResult.none,
  );
}
```

---

## 8. Toolbar & Tool System

### 8.1 Tool Enum & ToolSettings (COMPLETE in v3.1)

```dart
// lib/features/whiteboard/presentation/providers/tool_provider.dart

import 'package:flutter/material.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'tool_provider.g.dart';

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
  // Selection
  select,        // Selects canvas objects (shapes, textboxes)
  selectObject,  // Selects QuestionWidgets on EditableQuestionLayer
  navigate,      // Pan/zoom canvas
  // Special
  magicPen, eyedropper,
}

// ✅ v3.1: StrokeTip was missing in v3.0
enum StrokeTip { round, flat, brush }

enum InteractionMode { drawMode, selectMode }

extension ToolExt on Tool {
  StrokeType toStrokeType() {
    switch (this) {
      case Tool.softPen:     return StrokeType.softPen;
      case Tool.hardPen:     return StrokeType.hardPen;
      case Tool.highlighter: return StrokeType.highlighter;
      case Tool.chalk:       return StrokeType.chalk;
      case Tool.calligraphy: return StrokeType.calligraphy;
      case Tool.spray:       return StrokeType.spray;
      case Tool.laserPointer: return StrokeType.laserPointer;
      default:               return StrokeType.softPen;
    }
  }

  bool get isDrawingTool => const {
    Tool.softPen, Tool.hardPen, Tool.highlighter, Tool.chalk,
    Tool.calligraphy, Tool.spray, Tool.laserPointer,
  }.contains(this);

  bool get isEraserTool => const {
    Tool.softEraser, Tool.hardEraser, Tool.objectEraser, Tool.areaEraser,
  }.contains(this);

  bool get isShapeTool => const {
    Tool.line, Tool.arrow, Tool.doubleArrow, Tool.rectangle, Tool.roundedRect,
    Tool.circle, Tool.triangle, Tool.star, Tool.polygon, Tool.callout,
  }.contains(this);
}

// ── ToolSettings ─────────────────────────────────────────────────────────

class ToolSettings {
  final Tool            activeTool;
  final Color           color;
  final double          strokeWidth;     // 1.0–50.0
  final double          opacity;         // 0.1–1.0
  final double          smoothness;      // 0.0–1.0
  final StrokeTip       tip;
  final InteractionMode interactionMode;

  const ToolSettings({
    this.activeTool    = Tool.softPen,
    this.color         = const Color(0xFFFFFFFF),
    this.strokeWidth   = 4.0,
    this.opacity       = 1.0,
    this.smoothness    = 0.5,
    this.tip           = StrokeTip.round,
    this.interactionMode = InteractionMode.drawMode,
  });

  // ✅ v3.1: copyWith was { ... } stub in v3.0
  ToolSettings copyWith({
    Tool?            activeTool,
    Color?           color,
    double?          strokeWidth,
    double?          opacity,
    double?          smoothness,
    StrokeTip?       tip,
    InteractionMode? interactionMode,
  }) => ToolSettings(
    activeTool:      activeTool      ?? this.activeTool,
    color:           color           ?? this.color,
    strokeWidth:     strokeWidth     ?? this.strokeWidth,
    opacity:         opacity         ?? this.opacity,
    smoothness:      smoothness      ?? this.smoothness,
    tip:             tip             ?? this.tip,
    interactionMode: interactionMode ?? this.interactionMode,
  );
}

// ── ToolNotifier ──────────────────────────────────────────────────────────

@riverpod
class ToolNotifier extends _$ToolNotifier {
  @override
  ToolSettings build() => const ToolSettings();

  void selectTool(Tool tool) {
    final mode = _autoInteractionMode(tool);
    state = state.copyWith(activeTool: tool, interactionMode: mode);
  }

  void setColor(Color color)           => state = state.copyWith(color: color);
  void setStrokeWidth(double w)        => state = state.copyWith(strokeWidth: w);
  void setOpacity(double o)            => state = state.copyWith(opacity: o);
  void setSmoothness(double s)         => state = state.copyWith(smoothness: s);
  void setTip(StrokeTip tip)           => state = state.copyWith(tip: tip);

  void toggleInteractionMode() {
    final next = state.interactionMode == InteractionMode.drawMode
        ? InteractionMode.selectMode
        : InteractionMode.drawMode;
    state = state.copyWith(interactionMode: next);
  }

  InteractionMode _autoInteractionMode(Tool tool) {
    if (tool == Tool.select || tool == Tool.selectObject) {
      return InteractionMode.selectMode;
    }
    if (tool.isDrawingTool || tool.isEraserTool || tool.isShapeTool
        || tool == Tool.textBox || tool == Tool.stickyNote) {
      return InteractionMode.drawMode;
    }
    return state.interactionMode;
  }
}
```

### 8.2 Toolbar Layout Rules

```
TopBar (48px)
├── LEFT:  [≡ Menu]  [Set Title]  [Slide X/Y — slideMode only]  [Offline Badge]
└── RIGHT: [Save Status indicator]  [⏱ Class Timer]  [End Class]

BottomMainToolbar (56px) — pinned across full width
├── Slot 0:  Color Picker (always visible, non-removable)
├── Slots 1–9: Teacher-pinned tools (max 9 from Tool Library)
├── [─]  VerticalDivider
├── [↩] Undo  [↪] Redo
├── [+ Tool Library]  — opens ToolLibraryDrawer
└── [End Class]  — opens EndClassDialog

LeftSideToolbar (56px wide, vertical)
├── Auto-hides: MouseRegion.onExit + 3-second Timer
├── Shows: MouseRegion.onEnter
└── Contains: subject-mode, teaching tools, view options

SlidePanelDrawer (180px, right side, collapsible)
├── Slide thumbnails (vertical scrollable)
├── Active slide: orange border
├── Tap → navigateToSlide(index)
├── Right-click → context menu (insert blank, delete)
└── Mutually exclusive with FloatingStylePanel
```

### 8.3 UX Rules for Toolbar

```
Single click → select tool ONLY
Double click → open tool settings for that tool

Color Picker:
  → Single click → inline overlay (NO dialog)
  → 5 tabs: Question Color | Q.Background | Option Color | Opt.Background | Screen BG

Draw ↔ Select Toggle:
  → Button in BottomToolbar: [✏️ Draw] / [↖ Select]
  → Keyboard shortcut: Q key
  → Any pen/eraser/shape → auto drawMode
  → selectObject tool → auto selectMode
```

---

## 9. Question Widget System

### 9.1 DraggableResizableQuestionWidget

```
DraggableResizableQuestionWidget (ConsumerStatefulWidget)
│
├── RepaintBoundary
│
└── Stack
    ├── QuestionWidgetBody (question text + options + background)
    │   └── flutter_html Html() widget for questionText
    │
    ├── SelectionBorder (orange dashed — visible when selected)
    │   ├── 4 ResizeHandle (corners: NW, NE, SW, SE)
    │   ├── DeleteButton (top-right)
    │   └── LockIcon (top-left)
    │
    └── GestureDetectors
        ├── onTap       → selectedWidgetProvider.select(id)
        ├── onDoubleTap → setState(() => isEditing = true)
        ├── onPanStart  → _isDragging = true; setState
        ├── onPanUpdate → _currentPos update (local setState ONLY)
        └── onPanEnd    → questionWidgetProvider.updatePosition(id, pos)
```

### 9.2 Drag & Resize — Performance Pattern

```dart
class _DRQWState extends ConsumerState<DraggableResizableQuestionWidget> {
  late Offset _currentPos;
  late Size   _currentSize;
  bool _isDragging = false;
  bool _isEditing  = false;

  @override
  void initState() {
    super.initState();
    _currentPos  = Offset(widget.model.x, widget.model.y);
    _currentSize = Size(widget.model.width, widget.model.height);
  }

  @override
  void didUpdateWidget(DraggableResizableQuestionWidget old) {
    super.didUpdateWidget(old);
    // Sync local state if provider updated from outside (e.g., style panel)
    if (!_isDragging) {
      _currentPos  = Offset(widget.model.x, widget.model.y);
      _currentSize = Size(widget.model.width, widget.model.height);
    }
  }

  void _onPanStart(DragStartDetails _) {
    if (widget.model.isLocked) return;
    setState(() => _isDragging = true);
    ref.read(selectedWidgetProvider.notifier).select(widget.model.id);
  }

  void _onPanUpdate(DragUpdateDetails d) {
    if (widget.model.isLocked || !_isDragging) return;
    final canvas = ref.read(canvasSizeProvider);
    setState(() {
      _currentPos = Offset(
        (_currentPos.dx + d.delta.dx).clamp(0.0, canvas.width  - _currentSize.width),
        (_currentPos.dy + d.delta.dy).clamp(0.0, canvas.height - _currentSize.height),
      );
    });
    // DO NOT call provider here — too expensive at 60fps
  }

  void _onPanEnd(DragEndDetails _) {
    if (widget.model.isLocked) return;
    setState(() => _isDragging = false);
    ref.read(questionWidgetProvider.notifier).updatePosition(
      widget.model.id, _currentPos,
    );
  }

  void _onResizeUpdate(ResizeDirection dir, DragUpdateDetails d) {
    if (widget.model.isLocked) return;
    setState(() {
      double newW = _currentSize.width;
      double newH = _currentSize.height;
      switch (dir) {
        case ResizeDirection.se: newW += d.delta.dx; newH += d.delta.dy; break;
        case ResizeDirection.sw: newW -= d.delta.dx; newH += d.delta.dy; break;
        case ResizeDirection.ne: newW += d.delta.dx; newH -= d.delta.dy; break;
        case ResizeDirection.nw: newW -= d.delta.dx; newH -= d.delta.dy; break;
      }
      _currentSize = Size(
        newW.clamp(QuestionWidgetModel.kMinWidth,  QuestionWidgetModel.kMaxWidth),
        newH.clamp(QuestionWidgetModel.kMinHeight, QuestionWidgetModel.kMaxHeight),
      );
    });
  }

  void _onResizeEnd(DragEndDetails _) {
    ref.read(questionWidgetProvider.notifier).updateSize(
      widget.model.id, _currentSize,
    );
  }
}

enum ResizeDirection { nw, ne, sw, se }
```

### 9.3 FloatingStylePanel

```dart
// Shown when selectedWidgetProvider != null
// Width: 280px, AnimatedPositioned(right: 0, top: 56)
// Mutually exclusive with SlidePanelDrawer

// Contents:
// Question Text Color  [●]
// Question BG Color    [●]
// Option Text Color    [●]
// Option BG Color      [●]
// Q Font Size          [slider 16–40]
// Opt Font Size        [slider 14–32]
// Font Family          [dropdown: DM Sans | Noto Sans Devanagari]
// Border Radius        [slider 0–24]
// Border Width         [slider 0–4]
// Border Color         [●]
// Shadow Toggle        [switch]
// Background Image     [Pick Local] [Enter URL]
// Opacity              [slider 0.1–1.0]
// Fit                  [dropdown: fill|contain|cover|fitWidth|fitHeight]
// [Bring to Front]     [Send to Back]
// [🔒 Lock/Unlock]

// All changes → immediate via questionWidgetProvider.updateStyle()
// NO "Apply" button — live preview only
```

---

## 10. Drawing System

### 10.1 StrokeRenderer (COMPLETE in v3.1)

```dart
// lib/features/whiteboard/presentation/widgets/drawing/stroke_renderer.dart
//
// IMPORTANT — perfect_freehand v2.0.1 API:
// Input: List<List<double>> where each inner list = [x, y] or [x, y, pressure]
// Output: List<List<double>> outline points
// Use getStroke() from: import 'package:perfect_freehand/perfect_freehand.dart';

import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:perfect_freehand/perfect_freehand.dart';

class StrokeRenderer {
  static void render(Canvas canvas, StrokeModel stroke) {
    switch (stroke.type) {
      case StrokeType.softPen:     _drawSoftPen(canvas, stroke);    break;
      case StrokeType.hardPen:     _drawHardPen(canvas, stroke);    break;
      case StrokeType.highlighter: _drawHighlighter(canvas, stroke); break;
      case StrokeType.chalk:       _drawChalk(canvas, stroke);      break;
      case StrokeType.calligraphy: _drawCalligraphy(canvas, stroke); break;
      case StrokeType.spray:       _drawSpray(canvas, stroke);      break;
      case StrokeType.laserPointer: break; // Handled by LaserPointerOverlay — NEVER here
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────

  /// Convert Offset list to perfect_freehand input format [x, y, pressure]
  static List<List<double>> _toInput(List<Offset> offsets) =>
    offsets.map((o) => [o.dx, o.dy, 0.5]).toList();

  /// Convert perfect_freehand output (outline points) to a closed Flutter Path
  static Path _outlineToPath(List<List<double>> outline) {
    if (outline.isEmpty) return Path();
    final path = Path()..moveTo(outline[0][0], outline[0][1]);
    for (int i = 1; i < outline.length; i++) {
      path.lineTo(outline[i][0], outline[i][1]);
    }
    path.close();
    return path;
  }

  /// Draw a simple open path from raw Offset points (for non-freehand strokes)
  static void _drawRawPath(Canvas canvas, List<Offset> points, Paint paint) {
    if (points.length < 2) return;
    final path = Path()..moveTo(points[0].dx, points[0].dy);
    for (int i = 1; i < points.length; i++) {
      path.lineTo(points[i].dx, points[i].dy);
    }
    canvas.drawPath(path, paint);
  }

  // ── Pen Types ──────────────────────────────────────────────────────────

  static void _drawSoftPen(Canvas canvas, StrokeModel stroke) {
    final outline = getStroke(
      _toInput(stroke.points),
      options: StrokeOptions(
        size:              stroke.strokeWidth,
        thinning:          0.7,
        smoothing:         0.5,
        streamline:        0.5,
        simulatePressure:  true,
        isComplete:        true,
      ),
    );
    canvas.drawPath(
      _outlineToPath(outline),
      Paint()
        ..color   = stroke.color.withOpacity(stroke.opacity)
        ..style   = PaintingStyle.fill,
    );
  }

  static void _drawHardPen(Canvas canvas, StrokeModel stroke) {
    final outline = getStroke(
      _toInput(stroke.points),
      options: StrokeOptions(
        size:             stroke.strokeWidth,
        thinning:         0.0,    // no thinning → uniform width
        smoothing:        0.1,
        streamline:       0.3,
        simulatePressure: false,
        isComplete:       true,
      ),
    );
    canvas.drawPath(
      _outlineToPath(outline),
      Paint()
        ..color = stroke.color.withOpacity(stroke.opacity)
        ..style = PaintingStyle.fill,
    );
  }

  static void _drawHighlighter(Canvas canvas, StrokeModel stroke) {
    final paint = Paint()
      ..color      = stroke.color.withOpacity(0.4)
      ..strokeWidth = stroke.strokeWidth * 1.5
      ..strokeCap  = StrokeCap.square
      ..blendMode  = BlendMode.multiply
      ..style      = PaintingStyle.stroke;
    _drawRawPath(canvas, stroke.points, paint);
  }

  static void _drawChalk(Canvas canvas, StrokeModel stroke) {
    final rng = math.Random(42); // fixed seed = deterministic appearance
    // Main chalk line
    _drawRawPath(canvas, stroke.points, Paint()
      ..color      = stroke.color.withOpacity(0.85)
      ..strokeWidth = stroke.strokeWidth * 0.6
      ..strokeCap  = StrokeCap.round
      ..style      = PaintingStyle.stroke);
    // Noise dots for chalk texture
    final noisePaint = Paint()
      ..color = stroke.color.withOpacity(0.3)
      ..style = PaintingStyle.fill;
    for (final pt in stroke.points) {
      for (int i = 0; i < 3; i++) {
        canvas.drawCircle(
          Offset(
            pt.dx + (rng.nextDouble() - 0.5) * stroke.strokeWidth,
            pt.dy + (rng.nextDouble() - 0.5) * stroke.strokeWidth,
          ),
          rng.nextDouble() * 1.5,
          noisePaint,
        );
      }
    }
  }

  static void _drawCalligraphy(Canvas canvas, StrokeModel stroke) {
    // Width varies based on stroke direction — simulate calligraphy nib
    if (stroke.points.length < 2) return;
    for (int i = 1; i < stroke.points.length; i++) {
      final prev = stroke.points[i - 1];
      final curr = stroke.points[i];
      final delta  = curr - prev;
      final angle  = math.atan2(delta.dy, delta.dx);
      // Width proportional to perpendicular angle (nib at 45°)
      final factor = (math.sin(angle - math.pi / 4)).abs().clamp(0.2, 1.0);
      canvas.drawLine(prev, curr, Paint()
        ..color      = stroke.color.withOpacity(stroke.opacity)
        ..strokeWidth = stroke.strokeWidth * factor
        ..strokeCap  = StrokeCap.round
        ..style      = PaintingStyle.stroke);
    }
  }

  static void _drawSpray(Canvas canvas, StrokeModel stroke) {
    final rng = math.Random();
    final radius = stroke.strokeWidth * 2;
    final paint  = Paint()
      ..color = stroke.color.withOpacity(stroke.opacity * 0.4)
      ..style = PaintingStyle.fill;
    for (final pt in stroke.points) {
      for (int i = 0; i < 8; i++) {
        final angle = rng.nextDouble() * 2 * math.pi;
        final dist  = rng.nextDouble() * radius;
        canvas.drawCircle(
          Offset(pt.dx + dist * math.cos(angle), pt.dy + dist * math.sin(angle)),
          rng.nextDouble() * 2,
          paint,
        );
      }
    }
  }
}
```

### 10.2 ObjectRenderer (NEW in v3.1)

```dart
// lib/features/whiteboard/presentation/widgets/drawing/object_renderer.dart
// Called from CanvasPainter.paint() for non-stroke canvas objects.

import 'dart:math' as math;
import 'package:flutter/material.dart';

class ObjectRenderer {
  static void render(Canvas canvas, CanvasObjectModel obj) {
    canvas.save();

    // Apply rotation around center
    if (obj.rotation != 0) {
      final center = obj.bounds.center;
      canvas.translate(center.dx, center.dy);
      canvas.rotate(obj.rotation * math.pi / 180);
      canvas.translate(-center.dx, -center.dy);
    }

    switch (obj.type) {
      case ObjectType.rectangle:   _drawRect(canvas, obj);          break;
      case ObjectType.roundedRect: _drawRoundedRect(canvas, obj);   break;
      case ObjectType.circle:      _drawCircle(canvas, obj);        break;
      case ObjectType.triangle:    _drawTriangle(canvas, obj);      break;
      case ObjectType.line:        _drawLine(canvas, obj);          break;
      case ObjectType.arrow:       _drawArrow(canvas, obj, end: true, start: false); break;
      case ObjectType.doubleArrow: _drawArrow(canvas, obj, end: true, start: true);  break;
      case ObjectType.textBox:     _drawTextBox(canvas, obj);       break;
      case ObjectType.stickyNote:  _drawStickyNote(canvas, obj);    break;
      default:                     _drawRect(canvas, obj);          break;
    }

    canvas.restore();
  }

  static Paint _fillPaint(CanvasObjectModel obj) =>
    Paint()
      ..color = obj.fillColor.withOpacity(obj.opacity)
      ..style = PaintingStyle.fill;

  static Paint _borderPaint(CanvasObjectModel obj) =>
    Paint()
      ..color       = obj.borderColor.withOpacity(obj.opacity)
      ..strokeWidth = obj.borderWidth
      ..style       = PaintingStyle.stroke;

  static void _drawRect(Canvas canvas, CanvasObjectModel obj) {
    canvas.drawRect(obj.bounds, _fillPaint(obj));
    if (obj.borderWidth > 0) canvas.drawRect(obj.bounds, _borderPaint(obj));
  }

  static void _drawRoundedRect(Canvas canvas, CanvasObjectModel obj) {
    final rr = RRect.fromRectAndRadius(obj.bounds, const Radius.circular(8));
    canvas.drawRRect(rr, _fillPaint(obj));
    if (obj.borderWidth > 0) canvas.drawRRect(rr, _borderPaint(obj));
  }

  static void _drawCircle(Canvas canvas, CanvasObjectModel obj) {
    canvas.drawOval(obj.bounds, _fillPaint(obj));
    if (obj.borderWidth > 0) canvas.drawOval(obj.bounds, _borderPaint(obj));
  }

  static void _drawTriangle(Canvas canvas, CanvasObjectModel obj) {
    final path = Path()
      ..moveTo(obj.bounds.center.dx, obj.bounds.top)
      ..lineTo(obj.bounds.right, obj.bounds.bottom)
      ..lineTo(obj.bounds.left,  obj.bounds.bottom)
      ..close();
    canvas.drawPath(path, _fillPaint(obj));
    if (obj.borderWidth > 0) canvas.drawPath(path, _borderPaint(obj));
  }

  static void _drawLine(Canvas canvas, CanvasObjectModel obj) {
    canvas.drawLine(
      Offset(obj.x, obj.y),
      Offset(obj.x + obj.width, obj.y + obj.height),
      _borderPaint(obj)..strokeWidth = obj.borderWidth.clamp(1, 20),
    );
  }

  static void _drawArrow(Canvas canvas, CanvasObjectModel obj,
      {required bool start, required bool end}) {
    final from = Offset(obj.x, obj.y);
    final to   = Offset(obj.x + obj.width, obj.y + obj.height);
    final paint = _borderPaint(obj)..strokeWidth = obj.borderWidth.clamp(1, 20);
    canvas.drawLine(from, to, paint);
    if (end)   _drawArrowHead(canvas, from, to,   paint);
    if (start) _drawArrowHead(canvas, to,   from, paint);
  }

  static void _drawArrowHead(Canvas canvas, Offset from, Offset to, Paint paint) {
    final angle = math.atan2(to.dy - from.dy, to.dx - from.dx);
    const size  = 12.0;
    final path  = Path()
      ..moveTo(to.dx, to.dy)
      ..lineTo(
        to.dx - size * math.cos(angle - math.pi / 6),
        to.dy - size * math.sin(angle - math.pi / 6),
      )
      ..lineTo(
        to.dx - size * math.cos(angle + math.pi / 6),
        to.dy - size * math.sin(angle + math.pi / 6),
      )
      ..close();
    canvas.drawPath(path, paint..style = PaintingStyle.fill);
  }

  static void _drawTextBox(Canvas canvas, CanvasObjectModel obj) {
    // Background
    canvas.drawRect(obj.bounds, _fillPaint(obj));
    // Text
    final text    = obj.extra['text'] as String? ?? '';
    final color   = Color(obj.extra['textColorARGB'] as int? ?? 0xFFFFFFFF);
    final fontSize = (obj.extra['fontSize'] as num?)?.toDouble() ?? 18.0;
    final span    = TextSpan(text: text, style: TextStyle(color: color, fontSize: fontSize));
    final painter = TextPainter(text: span, textDirection: TextDirection.ltr)
      ..layout(maxWidth: obj.width - 16);
    painter.paint(canvas, Offset(obj.x + 8, obj.y + 8));
  }

  static void _drawStickyNote(Canvas canvas, CanvasObjectModel obj) {
    // Yellow background
    canvas.drawRect(obj.bounds, Paint()
      ..color = const Color(0xFFFFF176)
      ..style = PaintingStyle.fill);
    _drawTextBox(canvas, obj);
  }
}
```

### 10.3 Eraser Types

| Eraser | Behavior |
|--------|----------|
| `softEraser` | Path intersection — surgically removes points from strokes |
| `hardEraser` | Removes entire strokes whose path intersects eraser path |
| `objectEraser` | Deletes CanvasObjectModel under eraser position via bounds hit test |
| `areaEraser` | Rubber-band rect → delete all strokes/objects inside rect |

### 10.4 LaserPointer (Non-Persistent)

```dart
// Does NOT write to canvasProvider — purely visual, never saved
// Stores recent N points with timestamps
// Each point fades: opacity 1.0 → 0.0 over 1.5 seconds
// Driven by Ticker for smooth 60fps animation
// All points cleared on tool switch
class LaserPointerOverlay extends ConsumerStatefulWidget { ... }
```

---

## 11. Interaction Flow

### 11.1 Complete User Journey (Slide Mode)

```
1. APP LAUNCH
   App opens → check SecureStorage for access_token
   ├── Token found → WhiteboardScreen (whiteboardFree mode)
   └── No token   → LoginScreen → POST /auth/teacher/login → store JWT → WhiteboardScreen

2. SET IMPORT
   Teacher taps [Import Set] in TopBar Menu
   → SetImportDialog opens
   → Teacher enters: Set ID + Password
   → [Import] tapped:
       POST /whiteboard/validate-set       ← validate
       GET  /whiteboard/sets/:id/questions ← fetch questions
       GET  /whiteboard/sets/:id/metadata  ← fetch title, subject
       POST /whiteboard/session/start      ← create session
       → slideProvider.loadSlides(questions, metadata)
       → questionWidgetProvider.populateFromSlides(questions)
       → appModeProvider.enterSlideMode()
       → sessionProvider.startSession(sessionId)
       → Dialog closes

3. TEACHING (Draw Mode — default)
   Gestures → AnnotationLayer → canvasProvider startStroke/updateStroke/endStroke
   → sessionProvider.markDirty() → 5s debounce → auto-save

4. SELECT MODE (Q key or selectObject tool)
   Gestures → EditableQuestionLayer
   Tap widget → selectedWidgetProvider.select(id)
             → FloatingStylePanel slides in
             → SlidePanelDrawer auto-hides
   Drag → local setState → onPanEnd → questionWidgetProvider.updatePosition()

5. SLIDE NAVIGATION
   SlidePanelDrawer tap OR arrow keys
   → slideProvider.navigateToSlide(index)
     → _persistCurrentCanvas()
     → canvasProvider.loadFromAnnotation(saved or empty)

6. AUTO-SAVE (two triggers)
   a) Every 30 seconds (periodic Timer)
   b) 5 seconds after any markDirty()
   → Hive.save(payload) ← always first
   → if online: PUT /whiteboard/session/:id
   → TopBar: "● Saving..." → "✓ Saved 7:32 PM"

7. END CLASS
   Teacher taps [End Class]
   → EndClassDialog opens
   → compute() isolate: generate PDF (one page per slide)
   → POST /whiteboard/session/:id/end
   → POST /whiteboard/session/:id/upload-pdf
   → "✓ Class notes saved to Set 505955"
```

### 11.2 Gesture Routing Decision Tree

```
User gesture on canvas
        │
Is Tool.navigate active?
    YES → InteractiveViewer handles (pan/zoom)
    NO  ↓
Is interactionMode == selectMode?
    YES → EditableQuestionLayer
    NO  ↓
Is tool a drawing/eraser/shape tool?
    YES → AnnotationLayer (CustomPainter)
    NO  → no-op
```

---

## 12. UI/UX Design System

### 12.1 Color Tokens

```dart
// lib/core/constants/app_colors.dart

class AppColors {
  static const Color bgPrimary    = Color(0xFF0D0D0D); // canvas background
  static const Color bgSecondary  = Color(0xFF1A1A1A); // toolbar background
  static const Color bgPanel      = Color(0xFF242424); // side panels
  static const Color bgCard       = Color(0xFF2C2C2C); // dialogs

  static const Color accentOrange = Color(0xFFF4511E); // active tool, CTA
  static const Color accentYellow = Color(0xFFFFB300); // highlights

  static const Color textPrimary   = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFFB0B0B0);
  static const Color textDisabled  = Color(0xFF555555);

  static const Color success = Color(0xFF22C55E);
  static const Color error   = Color(0xFFEF4444);
  static const Color warning = Color(0xFFFACC15);
  static const Color info    = Color(0xFF3B82F6);

  static const Color toolActive   = Color(0x40F4511E);
  static const Color toolHover    = Color(0x20FFFFFF);
  static const Color border       = Color(0xFF333333);
  static const Color borderFocus  = Color(0xFFF4511E);

  // Slide defaults (Indian coaching aesthetic)
  static const Color slideQuestionText = Color(0xFFFFFFFF);
  static const Color slideOptionText   = Color(0xFFFFFF00);
  static const Color slideBg           = Color(0xFF000000);
}
```

### 12.2 Dimension Tokens

```dart
// lib/core/constants/app_dimensions.dart

class AppDimensions {
  static const double topBarHeight      = 48.0;
  static const double bottomBarHeight   = 56.0;
  static const double leftToolbarWidth  = 56.0;
  static const double slidePanelWidth   = 180.0;
  static const double stylePanelWidth   = 280.0;
  static const double toolLibraryWidth  = 320.0;

  static const double toolIconSize      = 24.0;
  static const double toolButtonSize    = 44.0;
  static const double toolButtonRadius  = 8.0;
  static const double resizeHandleSize  = 10.0;
  static const double borderRadiusS     = 4.0;
  static const double borderRadiusM     = 8.0;
  static const double borderRadiusL     = 12.0;

  static const double qwMinWidth   = 200.0;
  static const double qwMaxWidth   = 1800.0;
  static const double qwMinHeight  = 100.0;
  static const double qwMaxHeight  = 900.0;
}
```

### 12.3 Animation Standards

```
Panel slide-in (FloatingStylePanel, ToolLibraryDrawer):
  Duration: 220ms, Curve: Curves.easeOut

Tool selection:
  Duration: 100ms (near-instant)

Save status:
  "Saving..." → spinner (800ms loop)
  "✓ Saved"   → 300ms fade-in green dot

Sidebar auto-hide:
  Show: 0ms delay
  Hide: 3000ms inactivity → 200ms AnimatedContainer width: 56→0

Overlay activation (Spotlight, ScreenCover):
  Fade-in: 150ms
```

---

## 13. API Integration Flow

### 13.1 AuthInterceptor (COMPLETE in v3.1)

```dart
// lib/core/network/auth_interceptor.dart

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AuthInterceptor extends Interceptor {
  final Ref _ref;
  AuthInterceptor(this._ref);

  @override
  void onRequest(
    RequestOptions options, RequestInterceptorHandler handler) async {
    final token = await _ref.read(secureStorageProvider).readAccessToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      final refreshed = await _tryRefresh();
      if (refreshed) {
        // Retry original request with new token
        final token = await _ref.read(secureStorageProvider).readAccessToken();
        err.requestOptions.headers['Authorization'] = 'Bearer $token';
        try {
          final dio      = _ref.read(dioProvider);
          final response = await dio.fetch(err.requestOptions);
          handler.resolve(response);
          return;
        } catch (_) {}
      }
      // Refresh failed — logout user
      _ref.read(authProvider.notifier).logout();
    }
    handler.next(err);
  }

  Future<bool> _tryRefresh() async {
    try {
      final storage      = _ref.read(secureStorageProvider);
      final refreshToken = await storage.readRefreshToken();
      if (refreshToken == null) return false;

      final bare = Dio(); // bare Dio — no interceptors to avoid infinite loop
      final res  = await bare.post(
        '${ApiConstants.baseUrl}/auth/refresh',
        data: {'refreshToken': refreshToken},
      );
      await storage.writeAccessToken(res.data['accessToken'] as String);
      await storage.writeRefreshToken(res.data['refreshToken'] as String);
      return true;
    } catch (_) {
      return false;
    }
  }
}
```

### 13.2 Dio Client Setup

```dart
// lib/core/network/dio_client.dart

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl:        ApiConstants.baseUrl,  // https://api.eduhub.in/api/v1
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 30),
    headers:        {'Content-Type': 'application/json'},
  ));

  dio.interceptors.addAll([
    AuthInterceptor(ref),
    RetryInterceptor(dio,
      retries: 3,
      retryDelays: [
        const Duration(seconds: 1),
        const Duration(seconds: 3),
        const Duration(seconds: 5),
      ],
    ),
    if (kDebugMode) LogInterceptor(requestBody: true, responseBody: true),
  ]);

  return dio;
});
```

### 13.3 Full API Endpoint Reference

```
BASE: https://api.eduhub.in/api/v1

AUTH
  POST /auth/teacher/login    → { email, password } → { accessToken, refreshToken, teacher }
  POST /auth/refresh          → { refreshToken }    → { accessToken, refreshToken }
  POST /auth/logout           → invalidate server-side

SET IMPORT
  POST /whiteboard/validate-set         → { setId, password } → { valid, set: { id, title, ... } }
  GET  /whiteboard/sets/:id/questions   → [ ...questions ]
  GET  /whiteboard/sets/:id/metadata    → { id, title, subject, questionCount, orgId }

SESSION
  POST /whiteboard/session/start   → { setId, teacherId, orgId, startedAt } → { sessionId }
  PUT  /whiteboard/session/:id     → full session payload → { saved: true, savedAt }
  GET  /whiteboard/session/:id     → restore a session
  POST /whiteboard/session/:id/end → { endedAt } → { status: "ended" }

UPLOAD
  POST /whiteboard/session/:id/upload-pdf → multipart/form-data → { pdfUrl, uploadedAt }

ERROR CODES — NEVER crash on these, always handle gracefully:
  400 → "Invalid request"
  401 → JWT expired → auto-refresh → retry
  403 → "You don't have access to this Set"
  404 → "Set ID not found"
  422 → "Incorrect password"
  500 → "Server error — data saved locally" + queue for retry
  timeout → show offline badge → save to Hive → retry on reconnect
```

### 13.4 Auto-Save Payload Structure

```json
// PUT /whiteboard/session/:id
{
  "sessionId":    "session_uuid",
  "lastSaved":    "2026-04-02T10:32:00.000Z",
  "slideIndex":   4,
  "slidesCovered": [0, 1, 2, 3, 4],
  "annotations": {
    "q_001": {
      "strokes": [
        {
          "id": "stroke_uuid",
          "points": [[120.5, 340.2], [121.0, 341.5]],
          "colorARGB": -65536,
          "strokeWidth": 4.0,
          "type": "softPen",
          "opacity": 1.0
        }
      ],
      "objects": [
        {
          "id": "obj_uuid",
          "type": "rectangle",
          "x": 100, "y": 200, "width": 300, "height": 150,
          "rotation": 0.0,
          "fillColorARGB": -16711681,
          "borderWidth": 2.0,
          "opacity": 1.0,
          "isLocked": false,
          "zIndex": 0,
          "slideId": "q_001",
          "extra": {}
        }
      ]
    }
  },
  "questionWidgets": {
    "q_001": {
      "x": 100, "y": 80, "width": 900, "height": 480,
      "zIndex": 0, "isLocked": false,
      "style": { "...QuestionWidgetStyle fields..." }
    }
  }
}
```

---

## 14. Persistence Strategy

### 14.1 Hive Box Layout

```
Box name       Type                  Contents
─────────────────────────────────────────────────────────────────────
'sessions'     Box<WhiteboardSessionModel>   One per class session
'slides'       Box<SetSlideModel>            Cached questions for offline use
'settings'     Box<dynamic>                  Key-value: toolbar config, defaults
'pendingSync'  Box<String>                   JSON payloads pending server sync
                                             Key = sessionId, Value = JSON string
```

### 14.2 Hive Adapter Registration Order (main.dart)

```dart
// IMPORTANT: Register adapters BEFORE opening boxes. Order matters for typeIds.

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Hive.initFlutter();

  // Register adapters in typeId order — do NOT change order
  Hive.registerAdapter(SlideOptionAdapter());             // typeId: 2
  Hive.registerAdapter(StrokeModelAdapter());             // typeId: 3
  Hive.registerAdapter(CanvasObjectModelAdapter());       // typeId: 4
  Hive.registerAdapter(SlideAnnotationDataAdapter());     // typeId: 5
  Hive.registerAdapter(SlideColorConfigAdapter());        // typeId: 6
  Hive.registerAdapter(WhiteboardSessionModelAdapter());  // typeId: 7
  Hive.registerAdapter(ObjectTypeAdapter());              // typeId: 8
  Hive.registerAdapter(StrokeTypeAdapter());              // typeId: 9
  Hive.registerAdapter(QuestionWidgetModelAdapter());     // typeId: 10
  Hive.registerAdapter(QuestionWidgetStyleAdapter());     // typeId: 11
  Hive.registerAdapter(SetSlideModelAdapter());           // typeId: 1 (last is fine)
  Hive.registerAdapter(OffsetAdapter());                  // typeId: 20 (custom)

  // Open boxes
  await Future.wait([
    Hive.openBox<WhiteboardSessionModel>('sessions'),
    Hive.openBox<SetSlideModel>('slides'),
    Hive.openBox('settings'),
    Hive.openBox<String>('pendingSync'),
  ]);

  runApp(const ProviderScope(child: EduBoardApp()));
}
```

### 14.3 Offline Sync Strategy

```
Teacher teaching + internet drops:
  → Every save: write to Hive 'pendingSync' box (always)
  → Skip server PUT call
  → TopBar: "● Offline — saving locally"

Internet returns (connectivity_plus detects reconnect):
  → sessionProvider.drainPendingSync()
  → Send each payload: PUT /whiteboard/session/:id
  → On success: remove from 'pendingSync' box
  → TopBar: "✓ Synced"

No data loss: Hive is primary write, server is secondary.
```

### 14.4 Custom Hive Adapters (NEW in v3.1)

```dart
// lib/core/storage/hive_adapters.dart
//
// These adapters are required because Hive cannot serialize Flutter types.
// Register both in main.dart BEFORE opening boxes.

import 'package:flutter/material.dart';
import 'package:hive/hive.dart';

// ── OffsetAdapter ────────────────────────────────────────────────────────────
// Required by StrokeModel which stores List<Offset> as HiveField.

class OffsetAdapter extends TypeAdapter<Offset> {
  @override
  final int typeId = 20;

  @override
  Offset read(BinaryReader reader) =>
    Offset(reader.readDouble(), reader.readDouble());

  @override
  void write(BinaryWriter writer, Offset obj) {
    writer.writeDouble(obj.dx);
    writer.writeDouble(obj.dy);
  }
}

// NOTE: BoxFit is NOT stored via Hive adapter.
// QuestionWidgetStyle stores bgImageFitIndex (int) instead.
// Use: BoxFit.values[bgImageFitIndex] to get the BoxFit value.
// BoxFit.values indices: fill=0, contain=1, cover=2, fitWidth=3, fitHeight=4, none=5, scaleDown=6
```

---

## 15. Performance Architecture

### 15.1 RepaintBoundary Placement (CRITICAL)

```
1. AnnotationLayer (Layer 4)
   → Every pen stroke repaints ONLY inside this boundary
   → Slide content, question widgets, background = NOT repainted

2. EditableQuestionLayer (Layer 3)
   → Isolates question widgets from annotation repaints

3. Each DraggableResizableQuestionWidget
   → Moving one widget does NOT repaint others

4. SlideThumbnailList items
   → Each thumbnail wrapped in RepaintBoundary + const where possible
```

### 15.2 State Update Frequency

```
Drag/Resize (60fps):
  → LOCAL setState ONLY during gesture
  → Provider update ONLY on gesture end (onPanEnd / onResizeEnd)
  → NEVER call Riverpod notifier during pan gesture

Style Panel changes:
  → Immediate provider update (acceptable — intentional action)

Auto-save:
  → Debounced 5s after markDirty()
  → Periodic 30s timer
  → Hive write: fast, sync

Slide navigation:
  → SaveAnnotation → switch index → LoadAnnotation
  → canvasProvider.loadFromAnnotation() = O(1) state replacement
```

### 15.3 shouldRepaint Optimization

```dart
// CanvasPainter uses reference equality — avoids deep list comparison
@override
bool shouldRepaint(CanvasPainter old) =>
  !identical(old.strokes,      strokes)      ||
  !identical(old.activeStroke, activeStroke) ||
  !identical(old.objects,      objects);
// Note: Riverpod always creates new list objects on state update,
// so identical() correctly triggers repaint when data actually changed.
```

---

## 16. Error Handling Strategy

### 16.1 Result Type

```dart
// lib/core/error/failure.dart
// Uses result_dart package: import 'package:result_dart/result_dart.dart';
// AsyncResult<T> = Future<Result<T, Failure>>

sealed class Failure {
  final String message;
  const Failure(this.message);
}

class NetworkFailure       extends Failure { const NetworkFailure(super.m); }
class ServerFailure        extends Failure { const ServerFailure(super.m); }
class UnauthorizedFailure  extends Failure { const UnauthorizedFailure(super.m); }
class NotFoundFailure      extends Failure { const NotFoundFailure(super.m); }
class WrongPasswordFailure extends Failure { const WrongPasswordFailure(super.m); }
class LocalStorageFailure  extends Failure { const LocalStorageFailure(super.m); }
```

### 16.2 Error Mapping

```dart
// lib/core/error/error_handler.dart

import 'package:dio/dio.dart';

Failure mapDioException(DioException e) {
  return switch (e.type) {
    DioExceptionType.connectionTimeout => const NetworkFailure("Connection timed out"),
    DioExceptionType.receiveTimeout    => const NetworkFailure("Server took too long"),
    DioExceptionType.badResponse       => switch (e.response?.statusCode) {
      401   => const UnauthorizedFailure("Session expired — please log in again"),
      403   => const UnauthorizedFailure("You don't have access to this set"),
      404   => const NotFoundFailure("Set ID not found"),
      422   => const WrongPasswordFailure("Incorrect password"),
      500   => const ServerFailure("Server error — your data is saved locally"),
      _     => ServerFailure("Error ${e.response?.statusCode}"),
    },
    _ => const NetworkFailure("No internet connection"),
  };
}
```

### 16.3 Data Source Pattern

```dart
// Every data source method returns AsyncResult<T> — never throws raw exceptions

Future<AsyncResult<String>> startSession(String setId) async {
  try {
    final response = await dio.post('/whiteboard/session/start',
      data: {'setId': setId, ...});
    return Success(response.data['sessionId'] as String);
  } on DioException catch (e) {
    return Failure(mapDioException(e));
  } catch (e) {
    return Failure(ServerFailure('Unexpected error: $e'));
  }
}

// Consuming in notifier:
final result = await ref.read(sessionRemoteDsProvider).startSession(setId);
result.fold(
  (sessionId) => state = state.copyWith(sessionId: sessionId),
  (failure)   => _handleFailure(failure),
);
```

### 16.4 UI Error Presentation

```
NetworkFailure   → TopBar badge: "⚠ Offline — saving locally"
ServerFailure    → SnackBar: "Server error — data saved locally. Will retry."
WrongPassword    → Dialog: "Incorrect password. Try again."
NotFound         → Dialog: "Set ID not found. Check and try again."
UnauthorizedF.   → Auto-refresh → fail: redirect to LoginScreen
PDF upload fail  → SnackBar + [Retry] button

Rules:
  ✅ NEVER show raw Dart exception or stack trace to user
  ✅ NEVER crash on API 4xx/5xx
  ✅ ALWAYS save locally before server write
  ✅ ALWAYS provide retry for failed uploads
  ✅ ALWAYS debugPrint errors in debug mode
```

---

## 17. Development Phases

```
Phase 0 — Foundation (Week 1)
  [ ] Flutter project init — clean slate
  [ ] Folder structure per Section 3
  [ ] AppColors, AppTextStyles, AppDimensions
  [ ] main.dart: Hive init + all adapters registered + boxes opened
  [ ] Dio client + AuthInterceptor + RetryInterceptor
  [ ] ProviderScope + GoRouter: /login, /whiteboard
  [ ] Basic WhiteboardScreen scaffold

Phase 1 — Auth (Week 1)
  [ ] LoginScreen UI
  [ ] POST /auth/teacher/login
  [ ] JWT stored in SecureStorage
  [ ] AuthInterceptor: attach + 401 refresh + retry
  [ ] Auto-navigate based on token presence

Phase 2 — Canvas Engine (Week 2)
  [ ] Five-layer Stack in WhiteboardCanvas
  [ ] BackgroundLayer
  [ ] AnnotationLayer with RepaintBoundary + CanvasPainter
  [ ] CanvasPainter shouldRepaint with reference equality
  [ ] GestureDetector → canvasProvider
  [ ] CanvasState + CanvasSnapshot classes
  [ ] CanvasNotifier: startStroke/updateStroke/endStroke
  [ ] StrokeRenderer: softPen, hardPen
  [ ] toolProvider + ToolSettings + ToolNotifier
  [ ] Undo/Redo working
  [ ] canvasSizeProvider + currentSlideIdProvider

Phase 3 — Drawing Tools (Week 2–3)
  [ ] All 7 pen types (StrokeRenderer complete)
  [ ] All 4 eraser types
  [ ] ObjectRenderer: rectangle, circle, triangle, line, arrow, textBox
  [ ] LaserPointerOverlay (ephemeral)
  [ ] SlideColorPicker (5 tabs, inline — no dialog)
  [ ] Stroke width slider
  [ ] BottomMainToolbar with tool slots + undo/redo

Phase 4 — Set Import & Slides (Week 3)
  [ ] SetImportDialog UI
  [ ] POST /whiteboard/validate-set
  [ ] GET /whiteboard/sets/:id/questions + metadata
  [ ] SlideState + SlideNotifier (navigateToSlide with persist/restore)
  [ ] SlideContentLayer (flutter_html Html() widget)
  [ ] SlidePanelDrawer with thumbnails
  [ ] Slide navigation (tap thumbnail + arrow keys)
  [ ] Per-slide annotation save/restore on navigation

Phase 5 — Question Widget System (Week 4)
  [ ] QuestionWidgetModel + QuestionWidgetStyle (with Hive adapters)
  [ ] questionWidgetProvider.populateFromSlides()
  [ ] EditableQuestionLayer with RepaintBoundary
  [ ] DraggableResizableQuestionWidget (local setState drag, provider commit on end)
  [ ] ResizeDirection enum + 4 corner handles
  [ ] Canvas boundary clamping with canvasSizeProvider
  [ ] SelectionBorder + ResizeHandles + DeleteButton + LockIcon
  [ ] Draw ↔ Select mode (Q key + ToolNotifier.toggleInteractionMode())

Phase 6 — Style Panel (Week 4–5)
  [ ] FloatingStylePanel (AnimatedPositioned, 280px)
  [ ] All style controls with live preview
  [ ] bgImageFitIndex → BoxFit.values[index]
  [ ] Background image picker (local + URL)
  [ ] Z-Index: bringToFront / sendToBack / normalizeZIndex
  [ ] SlidePanelDrawer ↔ FloatingStylePanel mutual exclusion
  [ ] Inline double-tap edit mode

Phase 7 — Session & Auto-Save (Week 5)
  [ ] SessionState + SaveStatus enum
  [ ] SessionNotifier: startSession, markDirty, _autoSave
  [ ] Periodic timer (30s) + debounce timer (5s)
  [ ] Hive 'pendingSync' box write
  [ ] PUT /whiteboard/session/:id (when online)
  [ ] drainPendingSync() on reconnect
  [ ] TopBar save status indicator: idle / saving... / ✓ Saved / ⚠ Failed

Phase 8 — End Class & Export (Week 6)
  [ ] PDF generation in compute() isolate (never on main thread)
  [ ] POST /whiteboard/session/:id/end
  [ ] POST /whiteboard/session/:id/upload-pdf (multipart)
  [ ] EndClassDialog with progress indicator
  [ ] PNG ZIP export option

Phase 9 — Teaching Tools (Week 6–7)
  [ ] SpotlightOverlay
  [ ] ScreenCoverOverlay
  [ ] ZoomLensOverlay
  [ ] CountdownTimer, Stopwatch, ClassSessionTimer (class duration in SessionState)
  [ ] RandomPicker, Dice
  [ ] NavigationMapWidget

Phase 10 — Subject Tools (Week 7)
  [ ] RulerWidget (draggable, rotatable)
  [ ] ProtractorWidget
  [ ] CompassWidget
  [ ] PeriodicTableDialog
  [ ] CircuitSymbolLibrary
  [ ] IndiaMapOverlay

Phase 11 — Shape & Text Tools (Week 7–8)
  [ ] All shape tools (ObjectRenderer already built in Phase 3)
  [ ] TextBox (tap to place, double-tap to edit)
  [ ] StickyNote
  [ ] Object select (select tool — canvas objects)
  [ ] Object move/resize/rotate/delete

Phase 12 — AI Assistant (Week 8)
  [ ] AiAssistantPanel (slide-out, right side, 320px)
  [ ] Claude API integration (http package)
  [ ] Context: send current question text to Claude

Phase 13 — Polish & Testing (Week 9)
  [ ] All keyboard shortcuts (see Appendix C)
  [ ] Gesture shortcuts (touch)
  [ ] SettingsScreen
  [ ] Performance audit (profile mode — 60fps target)
  [ ] Error boundary testing (kill server, disconnect network)
  [ ] All Hive boxes verified (no corrupt state)

Phase 14 — QA & Release (Week 10)
  [ ] Widget tests for all providers
  [ ] Integration test: Set 505955 / 287051 full flow
  [ ] Windows Desktop build: flutter build windows
  [ ] Android Tablet build: flutter build apk
  [ ] Zero known bugs — release build
```

---

## 18. Testing Strategy

### 18.1 Unit Tests — Providers

```dart
// Test: canvasProvider — stroke lifecycle
test('stroke starts, updates, commits, and is undoable', () {
  final container = ProviderContainer();
  final notifier  = container.read(canvasProvider.notifier);

  notifier.startStroke(const Offset(10, 10));
  notifier.updateStroke(const Offset(20, 20));
  notifier.endStroke();

  expect(container.read(canvasProvider).strokes.length, 1);
  expect(container.read(canvasProvider).activeStroke, isNull);

  notifier.undo();
  expect(container.read(canvasProvider).strokes.length, 0);
});

// Test: canvasSizeProvider — boundary clamping
test('widget cannot be dragged outside canvas bounds', () {
  // Set canvas to 1920×1080
  // Attempt drag to (-50, -50) → clamp to (0, 0)
  // Attempt drag to (2000, 1200) → clamp to (1920 - width, 1080 - height)
});

// Test: sessionProvider — dirty flag + debounce
test('markDirty triggers auto-save after 5 seconds', () async {
  final container = ProviderContainer();
  container.read(sessionProvider.notifier).startSession('test-session-id');
  container.read(sessionProvider.notifier).markDirty();
  expect(container.read(sessionProvider).isDirty, true);
  await Future.delayed(const Duration(seconds: 6));
  expect(container.read(sessionProvider).isDirty, false);
});

// Test: slideProvider — annotation persist/restore on navigation
test('annotation is saved when navigating away from slide', () {
  // Load 3 slides
  // Draw stroke on slide 0
  // Navigate to slide 1
  // Navigate back to slide 0
  // Verify stroke is restored
});
```

### 18.2 Integration Test — Full Import Flow

```dart
// test/integration/set_import_test.dart
// Live test credentials: Set ID 505955 / Password 287051

testWidgets('Full set import flow', (tester) async {
  // 1. Login
  // 2. Open SetImportDialog
  // 3. Enter 505955 / 287051 → tap [Import]
  // 4. Verify: slideProvider.slides.length == 20
  // 5. Verify: questionWidgetProvider.state.length == 20
  // 6. Verify: sessionProvider.sessionId != null
  // 7. Navigate to slide 3 → verify canvasProvider reset
  // 8. Draw stroke → verify committed to canvasProvider
  // 9. Wait 35s → verify auto-save PUT called
  // 10. End class → verify PDF generated + uploaded
});
```

### 18.3 Performance Targets

```
Canvas pen stroke:     < 2ms per frame (budget: 16.6ms at 60fps)
Slide navigation:      < 100ms (feels instant)
Widget drag:           0 provider rebuilds during gesture (local setState only)
Auto-save (Hive):      < 50ms (main thread — must not jank)
PDF generation:        compute() isolate — 0ms UI thread impact
App cold start:        < 2 seconds to WhiteboardScreen
```

---

## 19. Missing Type Definitions

### 19.1 TeacherModel

```dart
// lib/features/auth/data/models/teacher_model.dart

class TeacherModel {
  final String id;
  final String name;
  final String email;
  final String orgId;
  final String orgName;
  final String role;       // 'teacher'

  const TeacherModel({
    required this.id,
    required this.name,
    required this.email,
    required this.orgId,
    required this.orgName,
    required this.role,
  });

  factory TeacherModel.fromJson(Map<String, dynamic> json) => TeacherModel(
    id:      json['id'] as String,
    name:    json['name'] as String,
    email:   json['email'] as String,
    orgId:   json['orgId'] as String,
    orgName: json['orgName'] as String? ?? '',
    role:    json['role'] as String? ?? 'teacher',
  );
}
```

### 19.2 SetMetadataModel

```dart
// lib/features/whiteboard/data/models/set_metadata_model.dart

class SetMetadataModel {
  final String  setId;
  final String  title;
  final String? subject;
  final int     questionCount;
  final String? orgId;

  const SetMetadataModel({
    required this.setId,
    required this.title,
    this.subject,
    required this.questionCount,
    this.orgId,
  });

  factory SetMetadataModel.fromJson(Map<String, dynamic> json) => SetMetadataModel(
    setId:         json['id'] as String,
    title:         json['title'] as String,
    subject:       json['subject'] as String?,
    questionCount: json['questionCount'] as int? ?? 0,
    orgId:         json['orgId'] as String?,
  );
}
```

### 19.3 ApiConstants

```dart
// lib/core/constants/api_constants.dart

class ApiConstants {
  static const String baseUrl = 'https://api.eduhub.in/api/v1';

  // Auth
  static const String teacherLogin = '/auth/teacher/login';
  static const String refreshToken = '/auth/refresh';
  static const String logout       = '/auth/logout';

  // Set Import
  static const String validateSet  = '/whiteboard/validate-set';
  static String setQuestions(String id) => '/whiteboard/sets/$id/questions';
  static String setMetadata(String id)  => '/whiteboard/sets/$id/metadata';

  // Session
  static const String sessionStart = '/whiteboard/session/start';
  static String sessionSave(String id) => '/whiteboard/session/$id';
  static String sessionEnd(String id)  => '/whiteboard/session/$id/end';
  static String sessionUploadPdf(String id) => '/whiteboard/session/$id/upload-pdf';
}
```

### 19.4 AppMode & SubjectMode Enums

```dart
// lib/features/whiteboard/presentation/providers/app_mode_provider.dart

enum AppMode {
  whiteboardFree,     // Blank canvas, no slides, free drawing
  slideMode,          // Set loaded, slides visible, annotation enabled
  annotationFloat,    // Floating toolbar over desktop
  presentationClean,  // Full screen, no UI, student-facing view
  preparationEdit,    // Pre-class, edit question widgets, no annotation
}

enum SubjectMode {
  general,       // Default — no special tools
  math,          // Ruler, protractor, compass, formula library
  physics,       // Circuit symbols, vector diagrams
  chemistry,     // Periodic table, molecular structures
  englishHindi,  // Devanagari font, grammar tools
  sscRailway,    // SSC/Railway exam format
  upsc,          // Maps, constitution, timeline tools
}
```

### 19.5 GoRouter Configuration

```dart
// lib/router/app_router.dart

import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/whiteboard',
    redirect: (context, state) {
      final teacher = ref.read(authProvider);
      final isLogin = state.matchedLocation == '/login';
      if (teacher == null && !isLogin) return '/login';
      if (teacher != null && isLogin)  return '/whiteboard';
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (_, __) => const LoginScreen(),
      ),
      GoRoute(
        path: '/whiteboard',
        builder: (_, __) => const WhiteboardScreen(),
      ),
      GoRoute(
        path: '/settings',
        builder: (_, __) => const SettingsScreen(),
      ),
    ],
  );
});
```

### 19.6 AuthProvider

```dart
// lib/core/providers/auth_provider.dart

@riverpod
class AuthNotifier extends _$AuthNotifier {
  @override
  TeacherModel? build() => null;

  void setTeacher(TeacherModel teacher) => state = teacher;
  void logout() {
    state = null;
    ref.read(secureStorageProvider).deleteAll();
  }
}
```

### 19.7 SecureStorage Wrapper

```dart
// lib/core/storage/secure_storage.dart

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final secureStorageProvider = Provider<SecureStorageService>(
  (ref) => SecureStorageService(),
);

class SecureStorageService {
  final _storage = const FlutterSecureStorage();

  Future<String?> readAccessToken()    => _storage.read(key: 'access_token');
  Future<String?> readRefreshToken()   => _storage.read(key: 'refresh_token');
  Future<void> writeAccessToken(String t)  => _storage.write(key: 'access_token',  value: t);
  Future<void> writeRefreshToken(String t) => _storage.write(key: 'refresh_token', value: t);
  Future<void> deleteAll()             => _storage.deleteAll();
}
```

---

## Appendix A — App Mode Reference

```dart
enum AppMode {
  whiteboardFree,    // No slides — free drawing
  slideMode,         // Set loaded — slides visible — annotation enabled
  annotationFloat,   // Floating toolbar over desktop
  presentationClean, // Full screen — all UI hidden — student view
  preparationEdit,   // Pre-class — edit question widgets — no annotation
}
```

## Appendix B — Keyboard Shortcuts (Full List)

```
Ctrl+Z     → Undo
Ctrl+Y     → Redo
Ctrl+S     → Force save now (sessionProvider.forceSave())
Ctrl+C     → Copy selected object
Ctrl+V     → Paste
Delete     → Delete selected object/widget
Escape     → Deselect / exit edit mode / close panel
Q          → Toggle Draw ↔ Select mode
P          → Soft Pen tool
H          → Highlighter tool
E          → Eraser tool
T          → Text Box tool
Arrow Keys → Navigate slides (left/right)
Space      → Navigate tool (hold = pan mode)
F          → Toggle presentation clean (fullscreen)
L          → Toggle laser pointer
1–9        → Select tool slot 1–9 from bottom toolbar
```

## Appendix C — Hive TypeId Registry (Complete)

```
typeId  Class
──────  ─────────────────────────────
1       SetSlideModel
2       SlideOption
3       StrokeModel
4       CanvasObjectModel
5       SlideAnnotationData
6       SlideColorConfig
7       WhiteboardSessionModel
8       ObjectType (enum)
9       StrokeType (enum)
10      QuestionWidgetModel
11      QuestionWidgetStyle
20      Offset (custom OffsetAdapter)

DO NOT use typeIds: 12–19 (reserved for future models)
DO NOT reuse a typeId once assigned — Hive will corrupt stored data
```

---

*PRD-WB-02 — EduBoard Pro v3 Complete System Rebuild*
*Version 3.1 (AI-IDE Refined) | Flutter Desktop (Windows + Android Tablet)*
*Date: 2026-04-02 | Status: Architecture Complete — Ready for Phase 0*
*Supersedes: PRD-WB-02 v3.0 — All incomplete stubs replaced with full implementations*
*Backend: Node.js + Express + Prisma + PostgreSQL (unchanged — API contracts preserved)*
