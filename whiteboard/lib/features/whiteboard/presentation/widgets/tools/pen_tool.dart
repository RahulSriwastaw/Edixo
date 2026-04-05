// lib/features/whiteboard/presentation/widgets/tools/pen_tool.dart
// Pen Tool with 7 types: Pencil, Brush, Marker, Calligraphy, Highlighter, Magic, Chalk

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../data/models/stroke_model.dart';
import '../../providers/canvas_provider.dart';

// ──────────────────────────────────────────────────────────────────────────
// Pen Type Definition
// ──────────────────────────────────────────────────────────────────────────

enum PenType {
  pencil,      // Thin, precise, 0.6 thinning
  brush,       // Soft, artistic, 0.4 thinning  
  marker,      // Bold, solid, 0.8 thinning
  calligraphy, // Variable width, 0.2 thinning
  highlighter, // Transparent, 0.9 thinning
  magic,       // Pressure-sensitive with glow
  chalk,       // Textured, grainy
}

extension PenTypeExt on PenType {
  String get displayName {
    switch (this) {
      case PenType.pencil:      return 'Pencil';
      case PenType.brush:       return 'Brush';
      case PenType.marker:      return 'Marker';
      case PenType.calligraphy: return 'Calligraphy';
      case PenType.highlighter: return 'Highlighter';
      case PenType.magic:       return 'Magic';
      case PenType.chalk:       return 'Chalk';
    }
  }

  IconData get icon {
    switch (this) {
      case PenType.pencil:      return Icons.edit;
      case PenType.brush:       return Icons.brush;
      case PenType.marker:      return Icons.format_color_fill;
      case PenType.calligraphy: return Icons.draw;
      case PenType.highlighter: return Icons.highlight;
      case PenType.magic:       return Icons.auto_awesome;
      case PenType.chalk:       return Icons.grain;
    }
  }

  /// Returns stroke type mapped from pen type  
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

  /// Default stroke width for this pen type
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

  /// Default opacity for this pen type
  double get defaultOpacity {
    switch (this) {
      case PenType.pencil:      return 1.0;
      case PenType.brush:       return 0.95;
      case PenType.marker:      return 1.0;
      case PenType.calligraphy: return 1.0;
      case PenType.highlighter: return 0.4; // Semi-transparent
      case PenType.magic:       return 0.8;
      case PenType.chalk:       return 0.85;
    }
  }

  /// Default thinning factor for perfect_freehand
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

  /// Default smoothing factor
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
// Pen Settings Provider
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
  }) {
    return PenSettings(
      type: type,
      color: color,
      strokeWidth: type.defaultStrokeWidth,
      opacity: type.defaultOpacity,
      thinning: type.defaultThinning,
      smoothing: type.defaultSmoothing,
    );
  }

  PenSettings copyWith({
    PenType? type,
    Color? color,
    double? strokeWidth,
    double? opacity,
    double? thinning,
    double? smoothing,
  }) {
    return PenSettings(
      type: type ?? this.type,
      color: color ?? this.color,
      strokeWidth: strokeWidth ?? this.strokeWidth,
      opacity: opacity ?? this.opacity,
      thinning: thinning ?? this.thinning,
      smoothing: smoothing ?? this.smoothing,
    );
  }
}

// Simple provider for active pen type
final activePenTypeProvider = StateProvider<PenType>((ref) => PenType.pencil);

final penSettingsProvider = StateProvider<PenSettings>((ref) {
  final penType = ref.watch(activePenTypeProvider);
  return PenSettings.withDefaults(type: penType);
});

// ──────────────────────────────────────────────────────────────────────────
// Pen Tool Handler
// ──────────────────────────────────────────────────────────────────────────

class PenToolHandler {
  final dynamic ref;

  const PenToolHandler(this.ref);

  /// Start drawing a pen stroke
  void startDrawing(Offset point) {
    final canvas = ref.read(canvasNotifierProvider.notifier);
    canvas.startStroke(point);
  }

  /// Update stroke with new point
  void updateStroke(Offset point) {
    final canvas = ref.read(canvasNotifierProvider.notifier);
    canvas.updateStroke(point);
  }

  /// Complete the stroke
  void completeStroke() {
    final canvas = ref.read(canvasNotifierProvider.notifier);
    canvas.endStroke();
  }

  /// Change pen type
  void setPenType(PenType type) {
    ref.read(activePenTypeProvider.notifier).state = type;
  }

  /// Change pen color
  void setPenColor(Color color) {
    final penSettings = ref.read(penSettingsProvider);
    ref.read(penSettingsProvider.notifier).state = 
        penSettings.copyWith(color: color);
  }

  /// Change stroke width
  void setStrokeWidth(double width) {
    final penSettings = ref.read(penSettingsProvider);
    ref.read(penSettingsProvider.notifier).state = 
        penSettings.copyWith(strokeWidth: width);
  }

  /// Change opacity
  void setOpacity(double opacity) {
    final penSettings = ref.read(penSettingsProvider);
    ref.read(penSettingsProvider.notifier).state = 
        penSettings.copyWith(opacity: opacity);
  }
}
