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
import 'lasso_tool.dart';

/// Unified controller for all drawing tools
class ToolsController {
  final dynamic ref;

  late PenToolHandler _penTool;
  late EraserToolHandler _eraserTool;
  late ShapeToolHandler _shapeTool;
  late TextToolHandler _textTool;
  late LassoToolHandler _lassoTool;

  ToolsController(this.ref) {
    _penTool = PenToolHandler(ref);
    _eraserTool = EraserToolHandler(ref);
    _shapeTool = ShapeToolHandler(ref);
    _textTool = TextToolHandler(ref);
    _lassoTool = LassoToolHandler(ref);
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
      case Tool.laserPointer:
        _penTool.startDrawing(point);
        break;

      case Tool.softEraser:
        _eraserTool.setMode(EraserMode.pointErase);
        _eraserTool.erase(point);
        break;
      case Tool.hardEraser:
        _eraserTool.setMode(EraserMode.strokeErase);
        _eraserTool.erase(point);
        break;
      case Tool.objectEraser:
        _eraserTool.setMode(EraserMode.objectErase);
        _eraserTool.erase(point);
        break;
      case Tool.areaEraser:
        _eraserTool.setMode(EraserMode.areaErase);
        _eraserTool.erase(point);
        break;

      case Tool.line:
        _shapeTool.setShapeType(ShapeType.line);
        _shapeTool.startShape(point);
        break;
      case Tool.arrow:
        _shapeTool.setShapeType(ShapeType.arrow);
        _shapeTool.startShape(point);
        break;
      case Tool.doubleArrow:
        _shapeTool.setShapeType(ShapeType.doubleArrow);
        _shapeTool.startShape(point);
        break;
      case Tool.rectangle:
        _shapeTool.setShapeType(ShapeType.rectangle);
        _shapeTool.startShape(point);
        break;
      case Tool.roundedRect:
        _shapeTool.setShapeType(ShapeType.roundedRect);
        _shapeTool.startShape(point);
        break;
      case Tool.circle:
        _shapeTool.setShapeType(ShapeType.circle);
        _shapeTool.startShape(point);
        break;
      case Tool.triangle:
        _shapeTool.setShapeType(ShapeType.triangle);
        _shapeTool.startShape(point);
        break;
      case Tool.star:
        _shapeTool.setShapeType(ShapeType.star);
        _shapeTool.startShape(point);
        break;
      case Tool.polygon:
        _shapeTool.setShapeType(ShapeType.polygon);
        _shapeTool.startShape(point);
        break;
      case Tool.callout:
        _shapeTool.setShapeType(ShapeType.callout);
        _shapeTool.startShape(point);
        break;

      case Tool.textBox:
      case Tool.stickyNote:
        _textTool.createTextBox(point);
        break;

      case Tool.lassoFreeform:
        ref.read(lassoProvider.notifier).setMode(LassoMode.freeform);
        // pointer handling is done by LassoSelectionOverlay
        break;
      case Tool.lassoRect:
        ref.read(lassoProvider.notifier).setMode(LassoMode.rect);
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
    } else if (tool.isEraserTool) {
      _eraserTool.completeErase();
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
  ref.listen(toolNotifierProvider.select((s) => s.activeTool), (prev, next) {
    const lassoTools = {Tool.lassoFreeform, Tool.lassoRect};
    if (prev != null &&
        lassoTools.contains(prev) &&
        !lassoTools.contains(next)) {
      ref.read(lassoProvider.notifier).clearSelection();
    }
  });
  return ToolsController(ref);
});
