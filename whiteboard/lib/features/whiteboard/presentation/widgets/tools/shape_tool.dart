// lib/features/whiteboard/presentation/widgets/tools/shape_tool.dart
// Shape Tool: Rectangle, Circle, Line, Arrow

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';
import '../../../data/models/canvas_object_model.dart';
import '../../providers/canvas_provider.dart';

// ──────────────────────────────────────────────────────────────────────────
// Shape Type Definition
// ──────────────────────────────────────────────────────────────────────────

enum ShapeType {
  rectangle,
  circle,
  line,
  arrow,
}

extension ShapeTypeExt on ShapeType {
  String get displayName {
    switch (this) {
      case ShapeType.rectangle: return 'Rectangle';
      case ShapeType.circle: return 'Circle';
      case ShapeType.line: return 'Line';
      case ShapeType.arrow: return 'Arrow';
    }
  }

  IconData get icon {
    switch (this) {
      case ShapeType.rectangle: return Icons.crop_square;
      case ShapeType.circle: return Icons.circle_outlined;
      case ShapeType.line: return Icons.remove;
      case ShapeType.arrow: return Icons.arrow_forward;
    }
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Shape Settings Provider
// ──────────────────────────────────────────────────────────────────────────

final activeShapeTypeProvider = StateProvider<ShapeType>(
  (ref) => ShapeType.rectangle
);

final shapeSettingsProvider = StateNotifierProvider<ShapeSettingsNotifier, ShapeSettings>(
  (ref) => ShapeSettingsNotifier(),
);

class ShapeSettings {
  final Color fillColor;
  final Color borderColor;
  final double borderWidth;
  final bool hasFill;

  const ShapeSettings({
    this.fillColor = Colors.transparent,
    this.borderColor = Colors.black,
    this.borderWidth = 2.0,
    this.hasFill = false,
  });

  ShapeSettings copyWith({
    Color? fillColor,
    Color? borderColor,
    double? borderWidth,
    bool? hasFill,
  }) {
    return ShapeSettings(
      fillColor: fillColor ?? this.fillColor,
      borderColor: borderColor ?? this.borderColor,
      borderWidth: borderWidth ?? this.borderWidth,
      hasFill: hasFill ?? this.hasFill,
    );
  }
}

class ShapeSettingsNotifier extends StateNotifier<ShapeSettings> {
  ShapeSettingsNotifier() : super(const ShapeSettings());

  void setFillColor(Color color) => state = state.copyWith(fillColor: color);
  void setBorderColor(Color color) => state = state.copyWith(borderColor: color);
  void setBorderWidth(double width) => state = state.copyWith(borderWidth: width);
  void setHasFill(bool hasFill) => state = state.copyWith(hasFill: hasFill);
}

// ──────────────────────────────────────────────────────────────────────────
// Shape Tool Handler
// ──────────────────────────────────────────────────────────────────────────

class ShapeToolHandler {
  final dynamic ref;
  Offset? _shapeStart;
  Offset? _shapeCurrent;

  ShapeToolHandler(this.ref);

  /// Start drawing a shape
  void startShape(Offset point) {
    _shapeStart = point;
    _shapeCurrent = point;
  }

  /// Update shape during dragging
  void updateShape(Offset point) {
    _shapeCurrent = point;
  }

  /// Complete and add the shape to canvas
  void completeShape() {
    if (_shapeStart == null || _shapeCurrent == null) return;

    final shapeType = ref.read(activeShapeTypeProvider);
    final shapeSettings = ref.read(shapeSettingsProvider);
    final rect = _getShapeRect(_shapeStart!, _shapeCurrent!);

    final shape = CanvasObjectModel(
      id: const Uuid().v4(),
      type: _mapShapeTypeToObjectType(shapeType),
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
      slideId: '',
      fillColorARGB: shapeSettings.hasFill ? shapeSettings.fillColor.toARGB32() : 0,
      borderColorARGB: shapeSettings.borderColor.toARGB32(),
      borderWidth: shapeSettings.borderWidth,
      rotation: 0,
      opacity: 1.0,
      isLocked: false,
      zIndex: 0,
      extra: {},
    );

    ref.read(canvasNotifierProvider.notifier).addObject(shape);

    _shapeStart = null;
    _shapeCurrent = null;
  }

  /// Get current shape preview rectangle
  Rect? getPreviewRect() {
    if (_shapeStart == null || _shapeCurrent == null) {
      return null;
    }
    return _getShapeRect(_shapeStart!, _shapeCurrent!);
  }

  /// Change shape type
  void setShapeType(ShapeType type) {
    ref.read(activeShapeTypeProvider.notifier).state = type;
  }

  /// Helper to calculate rectangle from two points (normalized)
  Rect _getShapeRect(Offset start, Offset end) {
    final left = math.min(start.dx, end.dx);
    final top = math.min(start.dy, end.dy);
    final width = (start.dx - end.dx).abs();
    final height = (start.dy - end.dy).abs();
    return Rect.fromLTWH(left, top, width, height);
  }

  /// Map ShapeType to CanvasObjectType
  ObjectType _mapShapeTypeToObjectType(ShapeType type) {
    switch (type) {
      case ShapeType.rectangle: return ObjectType.rectangle;
      case ShapeType.circle: return ObjectType.circle;
      case ShapeType.line: return ObjectType.line;
      case ShapeType.arrow: return ObjectType.arrow;
    }
  }
}
import '../../../data/models/canvas_object_model.dart';
