// lib/features/whiteboard/services/keyboard_shortcut_service.dart

import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../presentation/providers/tool_provider.dart';
import '../presentation/providers/canvas_provider.dart';
import '../presentation/providers/slide_provider.dart';
import '../../question_widget/presentation/providers/question_widget_provider.dart';
import '../../question_widget/presentation/providers/selected_widget_provider.dart';
import '../presentation/providers/app_mode_provider.dart';

/// Global keyboard shortcut handler for whiteboard
/// Implements all shortcuts from PRD Appendix C
class KeyboardShortcutService {
  final WidgetRef ref;

  KeyboardShortcutService(this.ref);

  /// Register all keyboard shortcuts
  /// Returns true if the key was handled
  bool handleKeyEvent(KeyEvent event) {
    if (event is! KeyDownEvent) return false;

    // Do not handle shortcuts if focus is on an input field (fixes copy-paste and typing)
    if (FocusManager.instance.primaryFocus?.context?.widget is EditableText) {
      return false;
    }

    final key = event.logicalKey;
    final isCtrl = HardwareKeyboard.instance.isControlPressed;
    final isShift = HardwareKeyboard.instance.isShiftPressed;
    final isAlt = HardwareKeyboard.instance.isAltPressed;

    // ── Tool Selection ─────────────────────────────────────────────
    if (!isCtrl && !isShift && !isAlt) {
      switch (key) {
        case LogicalKeyboardKey.keyV:
          ref.read(toolNotifierProvider.notifier).selectTool(Tool.select);
          return true;
        case LogicalKeyboardKey.keyP:
          ref.read(toolNotifierProvider.notifier).selectTool(Tool.softPen);
          return true;
        case LogicalKeyboardKey.keyH:
          ref.read(toolNotifierProvider.notifier).selectTool(Tool.highlighter);
          return true;
        case LogicalKeyboardKey.keyE:
          ref.read(toolNotifierProvider.notifier).selectTool(Tool.softEraser);
          return true;
        case LogicalKeyboardKey.keyT:
          ref.read(toolNotifierProvider.notifier).selectTool(Tool.textBox);
          return true;
        case LogicalKeyboardKey.keyN:
          ref.read(toolNotifierProvider.notifier).selectTool(Tool.navigate);
          return true;
        case LogicalKeyboardKey.keyQ:
          ref.read(toolNotifierProvider.notifier).toggleInteractionMode();
          return true;
      }
    }

    // ── Canvas Operations ──────────────────────────────────────────
    if (isCtrl) {
      switch (key) {
        case LogicalKeyboardKey.keyZ:
          if (isShift) {
            ref.read(canvasNotifierProvider.notifier).redo();
          } else {
            ref.read(canvasNotifierProvider.notifier).undo();
          }
          return true;
        case LogicalKeyboardKey.keyY:
          ref.read(canvasNotifierProvider.notifier).redo();
          return true;
        case LogicalKeyboardKey.keyA:
          // Select all widgets
          return true;
        case LogicalKeyboardKey.keyS:
          // Force save
          return true;
      }
    }

    // ── Slide Navigation ───────────────────────────────────────────
    if (!isCtrl && !isShift) {
      switch (key) {
        case LogicalKeyboardKey.arrowRight:
        case LogicalKeyboardKey.arrowDown:
        case LogicalKeyboardKey.pageDown:
          final slideState = ref.read(slideNotifierProvider);
          if (slideState.currentPageIndex < slideState.pages.length - 1) {
            ref.read(slideNotifierProvider.notifier).navigateToSlide(
              slideState.currentPageIndex + 1,
            );
          }
          return true;
        case LogicalKeyboardKey.arrowLeft:
        case LogicalKeyboardKey.arrowUp:
        case LogicalKeyboardKey.pageUp:
          final slideState = ref.read(slideNotifierProvider);
          if (slideState.currentPageIndex > 0) {
            ref.read(slideNotifierProvider.notifier).navigateToSlide(
              slideState.currentPageIndex - 1,
            );
          }
          return true;

        case LogicalKeyboardKey.home:
          ref.read(slideNotifierProvider.notifier).navigateToSlide(0);
          return true;
        case LogicalKeyboardKey.end:
          final slideState = ref.read(slideNotifierProvider);
          ref.read(slideNotifierProvider.notifier).navigateToSlide(
            slideState.pages.length - 1,
          );
          return true;

      }
    }

    // ── Widget Operations ──────────────────────────────────────────
    if (!isCtrl && !isShift) {
      switch (key) {
        case LogicalKeyboardKey.delete:
        case LogicalKeyboardKey.backspace:
          final selectedId = ref.read(selectedWidgetNotifierProvider);
          if (selectedId != null) {
            ref.read(questionWidgetNotifierProvider.notifier).remove(selectedId);
            ref.read(selectedWidgetNotifierProvider.notifier).deselect();
            return true;
          }
          final selectedElementId = ref.read(toolNotifierProvider).selectedElementId;
          if (selectedElementId != null) {
            ref.read(canvasNotifierProvider.notifier).deleteObject(selectedElementId);
            ref.read(toolNotifierProvider.notifier).setSelectedElement(null);
            return true;
          }
          return true;
        case LogicalKeyboardKey.escape:
          ref.read(selectedWidgetNotifierProvider.notifier).deselect();
          ref.read(toolNotifierProvider.notifier).setSelectedElement(null);
          return true;
      }
    }

    // ── Z-Index Operations ─────────────────────────────────────────
    if (isCtrl && isShift) {
      final selectedId = ref.read(selectedWidgetNotifierProvider);
      if (selectedId != null) {
        switch (key) {
          case LogicalKeyboardKey.bracketRight:
            ref.read(questionWidgetNotifierProvider.notifier).bringToFront(selectedId);
            return true;
          case LogicalKeyboardKey.bracketLeft:
            ref.read(questionWidgetNotifierProvider.notifier).sendToBack(selectedId);
            return true;
        }
      }

      final selectedElementId = ref.read(toolNotifierProvider).selectedElementId;
      if (selectedElementId != null) {
        switch (key) {
          case LogicalKeyboardKey.bracketRight:
            ref.read(canvasNotifierProvider.notifier).bringObjectToFront(selectedElementId);
            return true;
          case LogicalKeyboardKey.bracketLeft:
            ref.read(canvasNotifierProvider.notifier).sendObjectToBack(selectedElementId);
            return true;
        }
      }
    }

    // ── Presentation Mode ──────────────────────────────────────────
    if (isCtrl && !isShift) {
      switch (key) {
        case LogicalKeyboardKey.f11:
          ref.read(appModeNotifierProvider.notifier).togglePresentation();
          return true;
      }
    }

    return false;
  }
}
