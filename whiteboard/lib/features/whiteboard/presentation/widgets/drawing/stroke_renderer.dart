// lib/features/whiteboard/presentation/widgets/drawing/stroke_renderer.dart

import 'dart:math';
import 'package:flutter/material.dart';
import 'package:perfect_freehand/perfect_freehand.dart' as pf;
import '../../../data/models/stroke_model.dart';

/// Renders strokes with different pen types
/// Each pen type has unique visual characteristics
class StrokeRenderer {
  /// Draw a single stroke with the appropriate pen style
  static void drawStroke(Canvas canvas, StrokeModel stroke) {
    if (stroke.points.isEmpty) return;

    switch (stroke.type) {
      case StrokeType.softPen:
        _drawSoftPen(canvas, stroke);
      case StrokeType.hardPen:
        _drawHardPen(canvas, stroke);
      case StrokeType.highlighter:
        _drawHighlighter(canvas, stroke);
      case StrokeType.chalk:
        _drawChalk(canvas, stroke);
      case StrokeType.calligraphy:
        _drawCalligraphy(canvas, stroke);
      case StrokeType.spray:
        _drawSpray(canvas, stroke);
      case StrokeType.laserPointer:
        _drawLaserPointer(canvas, stroke);
    }
  }

  /// Soft pen: smooth, pressure-sensitive lines with rounded caps
  static void _drawSoftPen(Canvas canvas, StrokeModel stroke) {
    final points = stroke.points;
    if (points.length < 2) {
      _drawDot(canvas, points[0], stroke.strokeWidth, stroke.colorARGB, stroke.opacity);
      return;
    }

    // Use perfect_freehand for smooth rendering
    final outlinePoints = pf.getStroke(
      points.map((p) => pf.Point(p.dx, p.dy)).toList(),
      options: pf.StrokeOptions(
        size: 8.0,
        thinning: 0.5,
        smoothing: 0.5,
        streamline: 0.5,
      ),
    );

    if (outlinePoints.isEmpty) return;

    final path = Path();
    if (outlinePoints.isNotEmpty) {
      path.moveTo(outlinePoints[0].dx, outlinePoints[0].dy);
      for (int i = 1; i < outlinePoints.length; i++) {
        path.lineTo(outlinePoints[i].dx, outlinePoints[i].dy);
      }
      path.close();
    }

    final paint = Paint()
      ..color = Color(stroke.colorARGB).withOpacity(stroke.opacity)
      ..style = PaintingStyle.fill
      ..isAntiAlias = true;

    canvas.drawPath(path, paint);
  }

  /// Hard pen: consistent width, no pressure sensitivity
  static void _drawHardPen(Canvas canvas, StrokeModel stroke) {
    final points = stroke.points;
    if (points.length < 2) {
      _drawDot(canvas, points[0], stroke.strokeWidth, stroke.colorARGB, stroke.opacity);
      return;
    }

    final paint = Paint()
      ..color = Color(stroke.colorARGB).withOpacity(stroke.opacity)
      ..strokeWidth = stroke.strokeWidth
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..style = PaintingStyle.stroke
      ..isAntiAlias = true;

    final path = Path()..moveTo(points[0].dx, points[0].dy);
    for (int i = 1; i < points.length; i++) {
      path.lineTo(points[i].dx, points[i].dy);
    }

    canvas.drawPath(path, paint);
  }

  /// Highlighter: semi-transparent, wide stroke
  static void _drawHighlighter(Canvas canvas, StrokeModel stroke) {
    final points = stroke.points;
    if (points.length < 2) return;

    final paint = Paint()
      ..color = Color(stroke.colorARGB).withOpacity(0.3)
      ..strokeWidth = stroke.strokeWidth * 2.5
      ..strokeCap = StrokeCap.square
      ..strokeJoin = StrokeJoin.bevel
      ..style = PaintingStyle.stroke
      ..isAntiAlias = true;

    final path = Path()..moveTo(points[0].dx, points[0].dy);
    for (int i = 1; i < points.length; i++) {
      path.lineTo(points[i].dx, points[i].dy);
    }

    canvas.drawPath(path, paint);
  }

  /// Chalk: textured, slightly rough edges
  static void _drawChalk(Canvas canvas, StrokeModel stroke) {
    final points = stroke.points;
    if (points.length < 2) {
      _drawDot(canvas, points[0], stroke.strokeWidth, stroke.colorARGB, stroke.opacity);
      return;
    }

    // Base stroke
    final paint = Paint()
      ..color = Color(stroke.colorARGB).withOpacity(stroke.opacity * 0.8)
      ..strokeWidth = stroke.strokeWidth
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..style = PaintingStyle.stroke
      ..isAntiAlias = true;

    final path = Path()..moveTo(points[0].dx, points[0].dy);
    for (int i = 1; i < points.length; i++) {
      path.lineTo(points[i].dx, points[i].dy);
    }
    canvas.drawPath(path, paint);

    // Add texture dots along the stroke
    final random = Random(42); // Fixed seed for consistency
    for (int i = 0; i < points.length - 1; i++) {
      final p1 = points[i];
      final p2 = points[i + 1];
      final numDots = (stroke.strokeWidth * 0.5).round();
      
      for (int j = 0; j < numDots; j++) {
        final t = random.nextDouble();
        final x = p1.dx + (p2.dx - p1.dx) * t + (random.nextDouble() - 0.5) * stroke.strokeWidth;
        final y = p1.dy + (p2.dy - p1.dy) * t + (random.nextDouble() - 0.5) * stroke.strokeWidth;
        final dotRadius = random.nextDouble() * stroke.strokeWidth * 0.15;
        
        canvas.drawCircle(
          Offset(x, y),
          dotRadius,
          Paint()
            ..color = Color(stroke.colorARGB).withOpacity(stroke.opacity * 0.4)
            ..isAntiAlias = true,
        );
      }
    }
  }

  /// Calligraphy: angle-dependent stroke width
  static void _drawCalligraphy(Canvas canvas, StrokeModel stroke) {
    final points = stroke.points;
    if (points.length < 2) {
      _drawDot(canvas, points[0], stroke.strokeWidth, stroke.colorARGB, stroke.opacity);
      return;
    }

    const angle = pi / 4; // 45 degree angle
    final paint = Paint()
      ..color = Color(stroke.colorARGB).withOpacity(stroke.opacity)
      ..style = PaintingStyle.fill
      ..isAntiAlias = true;

    for (int i = 0; i < points.length - 1; i++) {
      final p1 = points[i];
      final p2 = points[i + 1];
      
      final dx = p2.dx - p1.dx;
      final dy = p2.dy - p1.dy;
      final len = sqrt(dx * dx + dy * dy);
      
      if (len < 0.1) continue;

      final nx = -dy / len;
      final ny = dx / len;
      
      final cosA = cos(angle);
      final sinA = sin(angle);
      final width = stroke.strokeWidth * 0.5;

      final path = Path()
        ..moveTo(
          p1.dx + (nx * cosA - ny * sinA) * width,
          p1.dy + (nx * sinA + ny * cosA) * width,
        )
        ..lineTo(
          p2.dx + (nx * cosA - ny * sinA) * width,
          p2.dy + (nx * sinA + ny * cosA) * width,
        )
        ..lineTo(
          p2.dx - (nx * cosA - ny * sinA) * width,
          p2.dy - (nx * sinA + ny * cosA) * width,
        )
        ..lineTo(
          p1.dx - (nx * cosA - ny * sinA) * width,
          p1.dy - (nx * sinA + ny * cosA) * width,
        )
        ..close();

      canvas.drawPath(path, paint);
    }
  }

  /// Spray: scattered dots
  static void _drawSpray(Canvas canvas, StrokeModel stroke) {
    final points = stroke.points;
    if (points.isEmpty) return;

    final random = Random(123); // Fixed seed for consistency
    final paint = Paint()
      ..color = Color(stroke.colorARGB).withOpacity(stroke.opacity)
      ..isAntiAlias = true;

    for (final point in points) {
      final numDots = (stroke.strokeWidth * 2).round();
      for (int i = 0; i < numDots; i++) {
        final angle = random.nextDouble() * 2 * pi;
        final radius = random.nextDouble() * stroke.strokeWidth;
        final x = point.dx + cos(angle) * radius;
        final y = point.dy + sin(angle) * radius;
        final dotRadius = random.nextDouble() * 1.5 + 0.5;

        canvas.drawCircle(Offset(x, y), dotRadius, paint);
      }
    }
  }

  /// Laser pointer: bright red, ephemeral (rendered with glow)
  static void _drawLaserPointer(Canvas canvas, StrokeModel stroke) {
    final points = stroke.points;
    if (points.length < 2) return;

    // Glow effect
    final glowPaint = Paint()
      ..color = const Color(0xFFFF0000).withOpacity(0.3)
      ..strokeWidth = stroke.strokeWidth * 3
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..style = PaintingStyle.stroke
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 8)
      ..isAntiAlias = true;

    final path = Path()..moveTo(points[0].dx, points[0].dy);
    for (int i = 1; i < points.length; i++) {
      path.lineTo(points[i].dx, points[i].dy);
    }
    canvas.drawPath(path, glowPaint);

    // Core line
    final corePaint = Paint()
      ..color = const Color(0xFFFF0000).withOpacity(0.9)
      ..strokeWidth = stroke.strokeWidth
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..style = PaintingStyle.stroke
      ..isAntiAlias = true;

    canvas.drawPath(path, corePaint);
  }

  /// Helper: draw a single dot for single-point strokes
  static void _drawDot(
    Canvas canvas,
    Offset point,
    double strokeWidth,
    int colorARGB,
    double opacity,
  ) {
    canvas.drawCircle(
      point,
      strokeWidth / 2,
      Paint()
        ..color = Color(colorARGB).withOpacity(opacity)
        ..isAntiAlias = true,
    );
  }
}
