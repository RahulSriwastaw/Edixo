import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:perfect_freehand/perfect_freehand.dart' as pf;
import '../../../domain/models/stroke.dart';
import '../../../providers/tool_provider.dart';

class StrokeRenderer {
  static void render(Canvas canvas, Stroke stroke) {
    if (stroke.points.isEmpty) return;

    switch (stroke.type) {
      case Tool.softPen:
      case Tool.hardPen:
      case Tool.calligraphy:
        _drawPen(canvas, stroke);
        break;
      case Tool.highlighter:
        _drawHighlighter(canvas, stroke);
        break;
      case Tool.chalk:
        _drawChalk(canvas, stroke);
        break;
      case Tool.spray:
        _drawSpray(canvas, stroke);
        break;
      case Tool.line:
      case Tool.arrow:
      case Tool.doubleArrow:
        _drawGeometricLine(canvas, stroke);
        break;
      case Tool.rectangle:
      case Tool.roundedRect:
      case Tool.circle:
      case Tool.triangle:
      case Tool.star:
      case Tool.polygon:
        _drawShape(canvas, stroke);
        break;
      case Tool.softEraser:
      case Tool.hardEraser:
        _drawEraser(canvas, stroke);
        break;
      default:
        _drawPen(canvas, stroke);
    }
  }

  static void _drawPen(Canvas canvas, Stroke stroke) {
    final paint = Paint()
      ..color = stroke.color.withOpacity(stroke.opacity)
      ..style = PaintingStyle.fill;

    // Use perfect_freehand for smooth strokes
    final outlinePoints = pf.getStroke(
      stroke.points.map((p) => pf.PointVector(p.x, p.y, p.pressure)).toList(),
      options: pf.StrokeOptions(
        size: stroke.thickness,
        thinning: stroke.type == Tool.softPen ? 0.5 : 0.0,
        smoothing: 0.5,
        streamline: 0.5,
        simulatePressure: true,
      ),
    );

    if (outlinePoints.isEmpty) return;

    final path = Path();
    path.moveTo(outlinePoints.first.dx, outlinePoints.first.dy);
    for (int i = 1; i < outlinePoints.length; i++) {
      path.lineTo(outlinePoints[i].dx, outlinePoints[i].dy);
    }
    path.close();

    canvas.drawPath(path, paint);
  }

  static void _drawHighlighter(Canvas canvas, Stroke stroke) {
    final paint = Paint()
      ..color = stroke.color.withOpacity(0.3)
      ..strokeWidth = stroke.thickness
      ..strokeCap = StrokeCap.square
      ..strokeJoin = StrokeJoin.round
      ..style = PaintingStyle.stroke;

    final path = Path();
    path.moveTo(stroke.points.first.x, stroke.points.first.y);
    for (int i = 1; i < stroke.points.length; i++) {
      path.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    canvas.drawPath(path, paint);
  }

  static void _drawChalk(Canvas canvas, Stroke stroke) {
    final paint = Paint()
      ..color = stroke.color.withOpacity(stroke.opacity)
      ..strokeWidth = stroke.thickness
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    // TODO: Add texture/noise for chalk effect
    final path = Path();
    path.moveTo(stroke.points.first.x, stroke.points.first.y);
    for (int i = 1; i < stroke.points.length; i++) {
      path.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    canvas.drawPath(path, paint);
  }

  static void _drawSpray(Canvas canvas, Stroke stroke) {
    final paint = Paint()
      ..color = stroke.color.withOpacity(stroke.opacity)
      ..style = PaintingStyle.fill;

    final random = math.Random();
    for (final point in stroke.points) {
      for (int i = 0; i < 10; i++) {
        final r = random.nextDouble() * stroke.thickness;
        final angle = random.nextDouble() * 2 * math.pi;
        canvas.drawCircle(
          Offset(point.x + r * math.cos(angle), point.y + r * math.sin(angle)),
          1.0,
          paint,
        );
      }
    }
  }

  static void _drawGeometricLine(Canvas canvas, Stroke stroke) {
    if (stroke.points.length < 2) return;
    final start = Offset(stroke.points.first.x, stroke.points.first.y);
    final end = Offset(stroke.points.last.x, stroke.points.last.y);

    final paint = Paint()
      ..color = stroke.color.withOpacity(stroke.opacity)
      ..strokeWidth = stroke.thickness
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    canvas.drawLine(start, end, paint);

    if (stroke.type == Tool.arrow || stroke.type == Tool.doubleArrow) {
      _drawArrowHead(canvas, start, end, paint);
    }
    if (stroke.type == Tool.doubleArrow) {
      _drawArrowHead(canvas, end, start, paint);
    }
  }

  static void _drawArrowHead(Canvas canvas, Offset from, Offset to, Paint paint) {
    final angle = math.atan2(to.dy - from.dy, to.dx - from.dx);
    const arrowSize = 15.0;
    const arrowAngle = math.pi / 6;

    final path = Path();
    path.moveTo(to.dx - arrowSize * math.cos(angle - arrowAngle),
        to.dy - arrowSize * math.sin(angle - arrowAngle));
    path.lineTo(to.dx, to.dy);
    path.lineTo(to.dx - arrowSize * math.cos(angle + arrowAngle),
        to.dy - arrowSize * math.sin(angle + arrowAngle));

    canvas.drawPath(path, paint);
  }

  static void _drawShape(Canvas canvas, Stroke stroke) {
    if (stroke.points.length < 2) return;
    final start = Offset(stroke.points.first.x, stroke.points.first.y);
    final end = Offset(stroke.points.last.x, stroke.points.last.y);
    final rect = Rect.fromPoints(start, end);

    final paint = Paint()
      ..color = stroke.color.withOpacity(stroke.opacity)
      ..strokeWidth = stroke.thickness
      ..style = stroke.isFilled ? PaintingStyle.fill : PaintingStyle.stroke;

    switch (stroke.type) {
      case Tool.rectangle:
        canvas.drawRect(rect, paint);
        break;
      case Tool.roundedRect:
        canvas.drawRRect(RRect.fromRectAndRadius(rect, const Radius.circular(12)), paint);
        break;
      case Tool.circle:
        canvas.drawOval(rect, paint);
        break;
      case Tool.triangle:
        final path = Path();
        path.moveTo(rect.centerLeft.dx, rect.bottom);
        path.lineTo(rect.centerRight.dx, rect.bottom);
        path.lineTo(rect.topCenter.dx, rect.topCenter.dy);
        path.close();
        canvas.drawPath(path, paint);
        break;
      default:
        canvas.drawRect(rect, paint);
    }
  }

  static void _drawEraser(Canvas canvas, Stroke stroke) {
    final paint = Paint()
      ..color = Colors.transparent
      ..blendMode = BlendMode.clear
      ..strokeWidth = stroke.thickness
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    final path = Path();
    path.moveTo(stroke.points.first.x, stroke.points.first.y);
    for (int i = 1; i < stroke.points.length; i++) {
      path.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    canvas.drawPath(path, paint);
  }
}
