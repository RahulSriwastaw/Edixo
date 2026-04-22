// lib/features/whiteboard/presentation/widgets/tools/pen_tool.dart
// Models, Enums & Providers only — UI is in pen_picker_dialog.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../data/models/stroke_model.dart';
import '../../providers/canvas_provider.dart';

// ──────────────────────────────────────────────────────────────────────────
// Pen Type Enum
// ──────────────────────────────────────────────────────────────────────────

enum PenType {
  pencil,
  brush,
  marker,
  calligraphy,
  highlighter,
  magic,
  chalk,
}

extension PenTypeExt on PenType {
  String get displayName {
    switch (this) {
      case PenType.pencil:      return 'Pencil';
      case PenType.brush:       return 'Brush';
      case PenType.marker:      return 'Marker';
      case PenType.calligraphy: return 'Calli.';
      case PenType.highlighter: return 'Highlight';
      case PenType.magic:       return 'Magic';
      case PenType.chalk:       return 'Chalk';
    }
  }

  String get subtitle {
    switch (this) {
      case PenType.pencil:      return 'Fixed width';
      case PenType.brush:       return 'Soft artistic';
      case PenType.marker:      return 'Bold solid';
      case PenType.calligraphy: return 'Dynamic width';
      case PenType.highlighter: return 'Transparent';
      case PenType.magic:       return 'Glow effect';
      case PenType.chalk:       return 'Textured';
    }
  }

  IconData get icon {
    switch (this) {
      case PenType.pencil:      return Icons.edit_outlined;
      case PenType.brush:       return Icons.brush_outlined;
      case PenType.marker:      return Icons.format_color_fill_outlined;
      case PenType.calligraphy: return Icons.draw_outlined;
      case PenType.highlighter: return Icons.highlight_outlined;
      case PenType.magic:       return Icons.auto_awesome_outlined;
      case PenType.chalk:       return Icons.grain;
    }
  }

  StrokeType toStrokeType() {
    switch (this) {
      case PenType.pencil:      return StrokeType.softPen;
      case PenType.brush:       return StrokeType.softPen;
      case PenType.marker:      return StrokeType.hardPen;
      case PenType.calligraphy: return StrokeType.calligraphy;
      case PenType.highlighter: return StrokeType.highlighter;
      case PenType.magic:       return StrokeType.laserPointer;
      case PenType.chalk:       return StrokeType.chalk;
    }
  }

  double get defaultStrokeWidth {
    switch (this) {
      case PenType.pencil:      return 2.0;
      case PenType.brush:       return 4.0;
      case PenType.marker:      return 6.0;
      case PenType.calligraphy: return 8.0;
      case PenType.highlighter: return 12.0;
      case PenType.magic:       return 5.0;
      case PenType.chalk:       return 4.5;
    }
  }

  double get defaultOpacity {
    switch (this) {
      case PenType.pencil:      return 1.0;
      case PenType.brush:       return 0.95;
      case PenType.marker:      return 1.0;
      case PenType.calligraphy: return 1.0;
      case PenType.highlighter: return 0.4;
      case PenType.magic:       return 0.8;
      case PenType.chalk:       return 0.85;
    }
  }

  double get defaultThinning {
    switch (this) {
      case PenType.pencil:      return 0.6;
      case PenType.brush:       return 0.4;
      case PenType.marker:      return 0.8;
      case PenType.calligraphy: return 0.2;
      case PenType.highlighter: return 0.9;
      case PenType.magic:       return 0.5;
      case PenType.chalk:       return 0.5;
    }
  }

  double get defaultSmoothing {
    switch (this) {
      case PenType.pencil:      return 0.6;
      case PenType.brush:       return 0.8;
      case PenType.marker:      return 0.5;
      case PenType.calligraphy: return 0.3;
      case PenType.highlighter: return 0.9;
      case PenType.magic:       return 0.7;
      case PenType.chalk:       return 0.4;
    }
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Pen Settings Model
// ──────────────────────────────────────────────────────────────────────────

class PenSettings {
  final PenType type;
  final Color color;
  final double strokeWidth;
  final double opacity;
  final double thinning;
  final double smoothing;

  const PenSettings({
    required this.type,
    required this.color,
    required this.strokeWidth,
    required this.opacity,
    required this.thinning,
    required this.smoothing,
  });

  factory PenSettings.withDefaults({
    required PenType type,
    Color color = Colors.black,
  }) =>
      PenSettings(
        type: type,
        color: color,
        strokeWidth: type.defaultStrokeWidth,
        opacity: type.defaultOpacity,
        thinning: type.defaultThinning,
        smoothing: type.defaultSmoothing,
      );

  PenSettings copyWith({
    PenType? type,
    Color? color,
    double? strokeWidth,
    double? opacity,
    double? thinning,
    double? smoothing,
  }) =>
      PenSettings(
        type: type ?? this.type,
        color: color ?? this.color,
        strokeWidth: strokeWidth ?? this.strokeWidth,
        opacity: opacity ?? this.opacity,
        thinning: thinning ?? this.thinning,
        smoothing: smoothing ?? this.smoothing,
      );
}

// ──────────────────────────────────────────────────────────────────────────
// Smart Inking Settings Model
// ──────────────────────────────────────────────────────────────────────────

class SmartInkSettings {
  final bool inkPressure;
  final bool inkToLine;
  final bool inkToShape;
  final double pressureSensitivity;

  const SmartInkSettings({
    this.inkPressure = true,
    this.inkToLine = false,
    this.inkToShape = false,
    this.pressureSensitivity = 100,
  });

  SmartInkSettings copyWith({
    bool? inkPressure,
    bool? inkToLine,
    bool? inkToShape,
    double? pressureSensitivity,
  }) =>
      SmartInkSettings(
        inkPressure: inkPressure ?? this.inkPressure,
        inkToLine: inkToLine ?? this.inkToLine,
        inkToShape: inkToShape ?? this.inkToShape,
        pressureSensitivity: pressureSensitivity ?? this.pressureSensitivity,
      );
}

// ──────────────────────────────────────────────────────────────────────────
// ✅ BUG FIX: StateNotifierProvider instead of broken StateProvider
//    Old code: StateProvider with ref.watch() inside — factory runs ONCE,
//              so pen type changes never updated penSettings.
// ──────────────────────────────────────────────────────────────────────────

class PenSettingsNotifier extends StateNotifier<PenSettings> {
  PenSettingsNotifier()
      : super(PenSettings.withDefaults(type: PenType.pencil));

  /// Switch pen type — preserves current color, resets other params to defaults
  void setType(PenType type) {
    state = PenSettings.withDefaults(type: type, color: state.color);
  }

  void setColor(Color color) => state = state.copyWith(color: color);

  void setStrokeWidth(double w) => state = state.copyWith(strokeWidth: w);

  void setOpacity(double o) => state = state.copyWith(opacity: o);

  void setThinning(double t) => state = state.copyWith(thinning: t);

  void setSmoothing(double s) => state = state.copyWith(smoothing: s);

  /// Replace entire settings object at once
  void applySettings(PenSettings settings) => state = settings;
}

/// ✅ Fixed provider — reactive, properly updates on pen type change
final penSettingsProvider =
    StateNotifierProvider<PenSettingsNotifier, PenSettings>(
  (_) => PenSettingsNotifier(),
);

/// Derived convenience — current active pen type
final activePenTypeProvider = Provider<PenType>((ref) {
  return ref.watch(penSettingsProvider).type;
});

final smartInkProvider =
    StateProvider<SmartInkSettings>((_) => const SmartInkSettings());

// ──────────────────────────────────────────────────────────────────────────
// Pen Tool Handler
// ──────────────────────────────────────────────────────────────────────────

class PenToolHandler {
  final dynamic ref;
  const PenToolHandler(this.ref);

  void startDrawing(Offset point) =>
      ref.read(canvasNotifierProvider.notifier).startStroke(point);

  void updateStroke(Offset point) =>
      ref.read(canvasNotifierProvider.notifier).updateStroke(point);

  void completeStroke() =>
      ref.read(canvasNotifierProvider.notifier).endStroke();

  void setPenType(PenType type) =>
      ref.read(penSettingsProvider.notifier).setType(type);

  void setPenColor(Color color) =>
      ref.read(penSettingsProvider.notifier).setColor(color);

  void setStrokeWidth(double width) =>
      ref.read(penSettingsProvider.notifier).setStrokeWidth(width);

  void setOpacity(double opacity) =>
      ref.read(penSettingsProvider.notifier).setOpacity(opacity);
}