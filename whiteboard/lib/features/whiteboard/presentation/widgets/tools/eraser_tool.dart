// lib/features/whiteboard/presentation/widgets/tools/eraser_tool.dart
// Eraser Tool with 3 modes: Point Erase, Stroke Erase, Clear All

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/canvas_provider.dart';
import '../../providers/session_provider.dart';

// ──────────────────────────────────────────────────────────────────────────
// Eraser Mode Definition
// ──────────────────────────────────────────────────────────────────────────

enum EraserMode {
  pointErase,   // Remove nearby points from strokes
  strokeErase,  // Remove entire strokes
  clearAll,     // Clear all strokes and objects
}

extension EraserModeExt on EraserMode {
  String get displayName {
    switch (this) {
      case EraserMode.pointErase: return 'Point Erase';
      case EraserMode.strokeErase: return 'Stroke Erase';
      case EraserMode.clearAll: return 'Clear All';
    }
  }

  IconData get icon {
    switch (this) {
      case EraserMode.pointErase: return Icons.edit_off;
      case EraserMode.strokeErase: return Icons.delete_sweep;
      case EraserMode.clearAll: return Icons.delete_forever;
    }
  }

  String get description {
    switch (this) {
      case EraserMode.pointErase: return 'Erase points from strokes';
      case EraserMode.strokeErase: return 'Erase entire strokes';
      case EraserMode.clearAll: return 'Clear everything';
    }
  }

  /// Radius for point erase
  double get radius {
    switch (this) {
      case EraserMode.pointErase: return 12.0;
      case EraserMode.strokeErase: return 16.0;
      case EraserMode.clearAll: return 0.0;
    }
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Eraser Settings Provider
// ──────────────────────────────────────────────────────────────────────────

final activEraserModeProvider = StateProvider<EraserMode>(
  (ref) => EraserMode.pointErase
);

final eraserRadiusProvider = StateProvider<double>(
  (ref) => EraserMode.pointErase.radius
);

// ──────────────────────────────────────────────────────────────────────────
// Eraser Tool Handler
// ──────────────────────────────────────────────────────────────────────────

class EraserToolHandler {
  final dynamic ref;

  const EraserToolHandler(this.ref);

  /// Apply eraser at the given position
  void erase(Offset point) {
    final mode = ref.read(activEraserModeProvider);
    final canvas = ref.read(canvasNotifierProvider.notifier);

    switch (mode) {
      case EraserMode.pointErase:
        // Remove individual points from strokes
        canvas.eraseAtPoint(point, mode.radius);
        break;

      case EraserMode.strokeErase:
        // Remove entire stroke that contains the point
        canvas.eraseStrokeAt(point, mode.radius);
        break;

      case EraserMode.clearAll:
        // Clear all - handled via dialog confirmation
        clearAll();
        break;
    }
  }

  /// Clear all strokes and objects
  void clearAll() {
    final canvas = ref.read(canvasNotifierProvider.notifier);
    canvas.clearSlide();
  }

  /// Change eraser mode
  void setMode(EraserMode mode) {
    ref.read(activEraserModeProvider.notifier).state = mode;
    ref.read(eraserRadiusProvider.notifier).state = mode.radius;
  }

  /// Change eraser radius
  void setRadius(double radius) {
    ref.read(eraserRadiusProvider.notifier).state = radius;
  }
}

