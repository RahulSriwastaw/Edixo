// lib/features/whiteboard/presentation/widgets/tools/tools_controller.dart
// Unified Tools Controller - Orchestrates all tool logic

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/canvas_provider.dart';
import '../../providers/tool_provider.dart';
import 'pen_tool.dart';
import 'eraser_tool.dart';
import 'shape_tool.dart';
import 'text_tool.dart';

/// Unified controller for all drawing tools
class ToolsController {
  final dynamic ref;

  late PenToolHandler _penTool;
  late EraserToolHandler _eraserTool;
  late ShapeToolHandler _shapeTool;
  late TextToolHandler _textTool;

  ToolsController(this.ref) {
    _penTool = PenToolHandler(ref);
    _eraserTool = EraserToolHandler(ref);
    _shapeTool = ShapeToolHandler(ref);
    _textTool = TextToolHandler(ref);
  }

  /// Handle pointer down on canvas - dispatched to appropriate tool
  void handlePointerDown(Offset point) {
    final toolState = ref.read(toolNotifierProvider);
    final tool = toolState.activeTool;

    switch (tool) {
      case Tool.softPen:
      case Tool.hardPen:
      case Tool.highlighter:
      case Tool.chalk:
      case Tool.calligraphy:
      case Tool.spray:
        _penTool.startDrawing(point);
        break;

      case Tool.softEraser:
      case Tool.hardEraser:
      case Tool.objectEraser:
      case Tool.areaEraser:
        _eraserTool.erase(point);
        break;

      case Tool.line:
      case Tool.arrow:
      case Tool.rectangle:
      case Tool.roundedRect:
      case Tool.circle:
      case Tool.triangle:
      case Tool.star:
      case Tool.polygon:
      case Tool.callout:
        _shapeTool.startShape(point);
        break;

      case Tool.textBox:
      case Tool.stickyNote:
        _textTool.createTextBox(point);
        break;

      case Tool.select:
      case Tool.selectObject:
      case Tool.navigate:
      case Tool.magicPen:
      case Tool.eyedropper:
      case Tool.ruler:
      case Tool.protractor:
      case Tool.compass:
      case Tool.laserPointer:
        // These are handled separately in annotation layer
        break;
    }
  }

  /// Handle pointer move on canvas
  void handlePointerMove(Offset point) {
    final toolState = ref.read(toolNotifierProvider);
    final tool = toolState.activeTool;

    if (tool.isDrawingTool) {
      _penTool.updateStroke(point);
    } else if (tool.isShapeTool) {
      _shapeTool.updateShape(point);
    } else if (tool.isEraserTool) {
      _eraserTool.erase(point);
    }
  }

  /// Handle pointer up on canvas
  void handlePointerUp() {
    final toolState = ref.read(toolNotifierProvider);
    final tool = toolState.activeTool;

    if (tool.isDrawingTool) {
      _penTool.completeStroke();
    } else if (tool.isShapeTool) {
      _shapeTool.completeShape();
    }
  }

  /// Get preview rect for shape tool (during dragging)
  Rect? getShapePreview() => _shapeTool.getPreviewRect();

  /// Direct tool settings methods
  void selectTool(Tool tool) {
    ref.read(toolNotifierProvider.notifier).selectTool(tool);
  }

  void setColor(Color color) {
    _penTool.setPenColor(color);
  }

  void setStrokeWidth(double width) {
    _penTool.setStrokeWidth(width);
  }

  void setOpacity(double opacity) {
    _penTool.setOpacity(opacity);
  }

  void setPenType(PenType type) {
    _penTool.setPenType(type);
  }

  void setEraserMode(EraserMode mode) {
    _eraserTool.setMode(mode);
  }

  void setShapeType(ShapeType type) {
    _shapeTool.setShapeType(type);
  }

  void undo() {
    ref.read(canvasNotifierProvider.notifier).undo();
  }

  void redo() {
    ref.read(canvasNotifierProvider.notifier).redo();
  }
}

/// Provider for tools controller
final toolsControllerProvider = Provider<ToolsController>((ref) {
  return ToolsController(ref);
});
