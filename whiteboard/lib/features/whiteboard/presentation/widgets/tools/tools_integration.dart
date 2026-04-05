// lib/features/whiteboard/presentation/widgets/tools/tools_integration.dart
// Integration layer connecting tools with annotation layer

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../data/models/stroke_model.dart';
import '../../providers/canvas_provider.dart';
import '../../providers/tool_provider.dart';
import 'pen_tool.dart';
import 'eraser_tool.dart';

/// Helper to get the correct stroke type from the active Pen tool
StrokeType getStrokeTypeFromTool(Tool tool, PenType penType) {
  switch (tool) {
    case Tool.softPen:
      return penType.toStrokeType();
    case Tool.hardPen:
      return StrokeType.hardPen;
    case Tool.highlighter:
      return StrokeType.highlighter;
    case Tool.chalk:
      return StrokeType.chalk;
    case Tool.calligraphy:
      return StrokeType.calligraphy;
    case Tool.spray:
      return StrokeType.spray;
    case Tool.laserPointer:
      return StrokeType.laserPointer;
    default:
      return StrokeType.softPen;
  }
}

/// Enhanced annotation layer drawing behavior
class DrawingBehavior {
  final dynamic ref;

  DrawingBehavior(this.ref);

  /// Check if a tool is in drawing mode
  bool isDrawingTool(Tool tool) {
    return tool.isDrawingTool;
  }

  /// Check if a tool is in erasing mode
  bool isErasingTool(Tool tool) {
    return tool.isEraserTool;
  }

  /// Start drawing when pointer down
  void startDraw(Offset point) {
    final toolState = ref.read(toolNotifierProvider);
    final canvas = ref.read(canvasNotifierProvider.notifier);

    if (!toolState.activeTool.isDrawingTool) return;

    // Create a new stroke with proper settings
    canvas.startStroke(point);
  }

  /// Update stroke during pointer movement
  void updateDraw(Offset point) {
    final canvas = ref.read(canvasNotifierProvider.notifier);
    canvas.updateStroke(point);
  }

  /// Finish drawing on pointer up
  void endDraw() {
    final canvas = ref.read(canvasNotifierProvider.notifier);
    canvas.endStroke();
  }

  /// Handle erasing at point
  void erase(Offset point) {
    final eraserMode = ref.read(activEraserModeProvider);
    final canvas = ref.read(canvasNotifierProvider.notifier);

    switch (eraserMode) {
      case EraserMode.pointErase:
        canvas.eraseAtPoint(point, 12.0);
        break;
      case EraserMode.strokeErase:
        canvas.eraseStrokeAt(point, 16.0);
        break;
      case EraserMode.clearAll:
        // Handled via dialog
        break;
    }
  }

  /// Check if we're in a mode that requires selection handling
  bool canSelectElements(Tool tool) {
    return tool == Tool.select || tool == Tool.selectObject;
  }
}

/// Provider for drawing behavior
final drawingBehaviorProvider = Provider<DrawingBehavior>((ref) {
  return DrawingBehavior(ref);
});
