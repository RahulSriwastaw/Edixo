# EduBoard Pro - Interactive Whiteboard for Coaching Institutes

## Overview

EduBoard Pro is a comprehensive interactive whiteboard application built with Flutter, designed specifically for Indian coaching institutes. It enables teachers to conduct engaging online classes with professional teaching tools, question management, and seamless session handling.

## Features

### ✅ Completed Features (Phases 0-13)

#### Core Infrastructure
- **Authentication System** - JWT-based login with token persistence and auto-login
- **Session Management** - Auto-save with 30s periodic + 5s debounce triggers
- **Data Persistence** - Hive local storage with 4 named boxes
- **Network Layer** - Dio with auth interceptor, retry logic, and error handling

#### Canvas & Drawing
- **Five-Layer Canvas** - Background, slide content, question widgets, annotations, overlays
- **7 Pen Types** - Soft pen, hard pen, highlighter, chalk, calligraphy, spray, laser pointer
- **Shape Tools** - Rectangle, circle, triangle, line, arrow, textbox, sticky notes
- **Undo/Redo** - 50-item snapshot stack for canvas operations

#### Teaching Tools
- **Set Import** - Validate and import question sets from backend
- **Slide Navigation** - Per-slide annotation save/restore with thumbnail drawer
- **Question Widgets** - Draggable, resizable question cards with style customization
- **Style Panel** - 280px floating panel with colors, fonts, borders, shadows, z-index
- **Class Timer** - Session duration tracker with pause/reset
- **Countdown Timer** - Activity timer with circular progress indicator
- **Random Picker** - Student selection with animation
- **Screen Cover** - Hide content from students with custom messages
- **Spotlight** - Focus attention on specific canvas areas
- **Navigation Map** - Slide thumbnails for quick navigation

#### Subject Tools
- **Ruler** - Draggable and rotatable measurement tool
- **Protractor** - Angle measurement with degree markings
- **Compass** - Circle drawing with adjustable radius
- **Periodic Table** - Chemistry reference dialog

#### Export & AI
- **PDF Export** - Generate PDF from session annotations
- **PNG Export** - Export individual slides as images
- **ZIP Archive** - Package all exports together
- **AI Assistant** - Claude API integration for teaching assistance (placeholder)

#### Keyboard Shortcuts
- **V** - Select tool
- **P** - Pen tool
- **H** - Highlighter
- **E** - Eraser
- **T** - Text box
- **N** - Navigate mode
- **Q** - Toggle draw/select mode
- **Ctrl+Z** - Undo
- **Ctrl+Shift+Z / Ctrl+Y** - Redo
- **Delete/Backspace** - Remove selected widget
- **Arrow Keys** - Navigate slides
- **Ctrl+[ / Ctrl+]** - Send to back / Bring to front
- **F11** - Toggle presentation mode

## Project Structure

```
whiteboard/
├── lib/
│   ├── core/
│   │   ├── constants/          # App colors, text styles, dimensions, API constants
│   │   ├── error/              # Failure types and error handling
│   │   ├── network/            # Dio client and interceptors
│   │   ├── providers/          # Core Riverpod providers (auth, connectivity)
│   │   └── storage/            # Hive adapters and secure storage
│   ├── features/
│   │   ├── auth/
│   │   │   ├── data/
│   │   │   │   ├── datasources/    # Remote auth datasource
│   │   │   │   └── models/         # Teacher model, auth response
│   │   │   └── presentation/
│   │   │       ├── providers/      # Login provider, startup provider
│   │   │       └── screens/        # Login screen
│   │   └── whiteboard/
│   │       ├── data/
│   │       │   ├── datasources/    # Set remote datasource
│   │       │   └── models/         # Stroke, canvas object, slide, session models
│   │       ├── presentation/
│   │       │   ├── providers/      # Canvas, tool, slide, session, app mode providers
│   │       │   ├── screens/        # Whiteboard screen
│   │       │   └── widgets/
│   │       │       ├── canvas/         # 5-layer canvas components
│   │       │       ├── toolbar/        # Top toolbar, bottom toolbar, style panel
│   │       │       ├── overlays/       # Slide panel drawer
│   │       │       ├── teaching_tools/ # Timers, picker, spotlight, screen cover
│   │       │       ├── subject_tools/  # Ruler, protractor, compass, periodic table
│   │       │       ├── shapes/         # Shape tools palette
│   │       │       └── ai/             # AI assistant panel
│   │       └── services/
│   │           ├── export_service.dart         # PDF/PNG/ZIP export
│   │           └── keyboard_shortcut_service.dart
│   ├── router/
│   │   └── app_router.dart         # GoRouter configuration
│   ├── app.dart                    # Main app widget
│   └── main.dart                   # App entry point
├── pubspec.yaml
└── README.md
```

## Getting Started

### Prerequisites

- Flutter SDK >= 3.19.0
- Dart SDK >= 3.3.0 < 4.0.0
- Windows, macOS, or Linux (desktop support)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd whiteboard
   ```

2. Install dependencies:
   ```bash
   flutter pub get
   ```

3. Generate code (Riverpod providers, Hive adapters):
   ```bash
   flutter pub run build_runner build
   ```

4. Run the application:
   ```bash
   flutter run -d windows   # For Windows
   flutter run -d macos     # For macOS
   flutter run -d linux     # For Linux
   ```

### Development

- **Watch mode** (auto-regenerate on file changes):
  ```bash
  flutter pub run build_runner watch
  ```

- **Clean and rebuild**:
  ```bash
  flutter pub run build_runner clean
  flutter pub run build_runner build
  ```

- **Run tests**:
  ```bash
  flutter test
  ```

- **Analyze code**:
  ```bash
  flutter analyze
  ```

## Configuration

### API Endpoints

The application connects to `https://api.eduhub.in/api/v1` by default. Update `lib/core/constants/api_constants.dart` to change the base URL.

### Authentication

- Login endpoint: `POST /auth/teacher/login`
- Refresh endpoint: `POST /auth/refresh`
- Logout endpoint: `POST /auth/logout`
- Current user: `GET /auth/me`

### Hive Storage

The app uses 4 Hive boxes:
- `sessions` - Whiteboard session data
- `slides` - Slide annotations
- `settings` - User preferences
- `pendingSync` - Offline changes awaiting sync

## Architecture

### State Management

- **Riverpod** with `@riverpod` annotated notifiers
- Code generation via `riverpod_generator`
- Auto-dispose providers where appropriate

### Data Flow

```
User Action → Provider Notifier → State Update → UI Rebuild
                    ↓
            Mark Session Dirty
                    ↓
            Auto-Save (5s debounce + 30s periodic)
                    ↓
            Hive Write → Server PUT (if online)
```

### Canvas Rendering

- **RepaintBoundary** for each layer to optimize performance
- **Reference equality** checks in `shouldRepaint()` to minimize redraws
- **Local setState** for 60fps drawing feedback, provider commit on completion

## Deployment

### Windows

```bash
flutter build windows --release
```

Output: `build/windows/x64/runner/Release/`

### macOS

```bash
flutter build macos --release
```

Output: `build/macos/Build/Products/Release/`

### Linux

```bash
flutter build linux --release
```

Output: `build/linux/x64/release/bundle/`

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary software for EduHub. All rights reserved.

## Support

For issues and feature requests, please contact the development team.

---

**Built with ❤️ for Indian coaching institutes**
