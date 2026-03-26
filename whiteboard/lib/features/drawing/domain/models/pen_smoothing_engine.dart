import 'dart:math' as math;
import 'package:flutter/material.dart';

// ─── Input Point with metadata ───────────────────────────────────────────────
class InputPoint {
  final Offset position;
  final double pressure; // 0.0 – 1.0 (from stylus or simulated via velocity)
  final DateTime time;

  const InputPoint({
    required this.position,
    this.pressure = 1.0,
    required this.time,
  });
}

// ─── Smoothing Settings ───────────────────────────────────────────────────────
class StrokeSmoothing {
  final int level; // 0=Off, 1=Low, 2=Medium, 3=High
  final bool stabilizerEnabled;
  final bool taperEnabled;
  final double minWidth; // dp
  final double maxWidth; // dp

  const StrokeSmoothing({
    this.level = 2,
    this.stabilizerEnabled = true,
    this.taperEnabled = true,
    this.minWidth = 1.0,
    this.maxWidth = 6.0,
  });

  int get stabilizerWindowSize {
    switch (level) {
      case 1: return 3;
      case 2: return 6;
      case 3: return 10;
      default: return 0;
    }
  }

  double get decimationThreshold {
    switch (level) {
      case 1: return 1.0;
      case 2: return 2.0;
      case 3: return 3.0;
      default: return 0.0;
    }
  }
}

// ─── Pen Smoothing Engine ─────────────────────────────────────────────────────
class PenSmoothingEngine {
  final StrokeSmoothing settings;

  PenSmoothingEngine({this.settings = const StrokeSmoothing()});

  // ── Step 1: Input Decimation ────────────────────────────────────────────────
  // Remove points that are too close together (noise reduction)
  List<InputPoint> decimate(List<InputPoint> points) {
    if (settings.level == 0 || points.isEmpty) return points;
    final threshold = settings.decimationThreshold;
    final result = <InputPoint>[points.first];
    for (var i = 1; i < points.length; i++) {
      final dist = (points[i].position - result.last.position).distance;
      if (dist >= threshold) {
        result.add(points[i]);
      }
    }
    return result;
  }

  // ── Step 2: Stabilizer (Weighted average of last N points) ─────────────────
  // Reduces hand tremor by smoothing positions over a sliding window
  List<InputPoint> stabilize(List<InputPoint> points) {
    if (!settings.stabilizerEnabled || settings.level == 0) return points;
    final window = settings.stabilizerWindowSize;
    if (points.length < window) return points;

    final result = <InputPoint>[];
    for (var i = 0; i < points.length; i++) {
      final start = math.max(0, i - window + 1);
      var wx = 0.0, wy = 0.0, totalWeight = 0.0;
      for (var j = start; j <= i; j++) {
        final weight = (j - start + 1).toDouble(); // Linear weighting — recent points matter more
        wx += points[j].position.dx * weight;
        wy += points[j].position.dy * weight;
        totalWeight += weight;
      }
      result.add(InputPoint(
        position: Offset(wx / totalWeight, wy / totalWeight),
        pressure: points[i].pressure,
        time: points[i].time,
      ));
    }
    return result;
  }

  // ── Step 3: Catmull-Rom Spline → Smooth Path ───────────────────────────────
  // Generates a smooth bezier path through all control points
  Path catmullRomPath(List<InputPoint> points) {
    if (points.isEmpty) return Path();
    if (points.length == 1) {
      final p = points[0].position;
      return Path()
        ..addOval(Rect.fromCircle(center: p, radius: settings.minWidth / 2));
    }
    if (points.length == 2) {
      return Path()
        ..moveTo(points[0].position.dx, points[0].position.dy)
        ..lineTo(points[1].position.dx, points[1].position.dy);
    }

    final path = Path();
    path.moveTo(points[0].position.dx, points[0].position.dy);

    // Duplicate first and last point for Catmull-Rom boundary condition
    final pts = [points[0], ...points, points.last];

    for (var i = 1; i < pts.length - 2; i++) {
      final p0 = pts[i - 1].position;
      final p1 = pts[i].position;
      final p2 = pts[i + 1].position;
      final p3 = pts[i + 2].position;

      // Catmull-Rom → Cubic Bezier control points
      final cp1 = Offset(
        p1.dx + (p2.dx - p0.dx) / 6.0,
        p1.dy + (p2.dy - p0.dy) / 6.0,
      );
      final cp2 = Offset(
        p2.dx - (p3.dx - p1.dx) / 6.0,
        p2.dy - (p3.dy - p1.dy) / 6.0,
      );

      path.cubicTo(cp1.dx, cp1.dy, cp2.dx, cp2.dy, p2.dx, p2.dy);
    }

    return path;
  }

  // ── Step 4: Variable-width stroke (velocity-based) ─────────────────────────
  // Returns width at each point based on pressure or velocity
  List<double> computeWidths(List<InputPoint> points) {
    if (points.length < 2) {
      return List.filled(points.length, settings.maxWidth);
    }

    final widths = <double>[];
    final maxVelocity = 1500.0; // dp/s — calibrated threshold

    for (var i = 0; i < points.length; i++) {
      double pressure = points[i].pressure;

      if (i > 0) {
        final delta = (points[i].position - points[i - 1].position).distance;
        final dt = points[i].time.difference(points[i - 1].time).inMicroseconds / 1000000.0;
        if (dt > 0) {
          final velocity = delta / dt;
          // Fast stroke = thinner, slow stroke = thicker (natural pen feel)
          final velocityFactor = (1.0 - (velocity / maxVelocity).clamp(0.0, 1.0));
          pressure = (pressure + velocityFactor) / 2.0;
        }
      }

      final width = settings.minWidth + (settings.maxWidth - settings.minWidth) * pressure;
      widths.add(width.clamp(settings.minWidth, settings.maxWidth));
    }

    // Taper at start and end
    if (settings.taperEnabled && widths.length > 4) {
      const taperCount = 4;
      for (var i = 0; i < taperCount && i < widths.length; i++) {
        widths[i] = widths[i] * (i + 1) / taperCount;
      }
      for (var i = 0; i < taperCount && i < widths.length; i++) {
        final idx = widths.length - 1 - i;
        widths[idx] = widths[idx] * (i + 1) / taperCount;
      }
    }

    return widths;
  }

  // ── Step 5: Full pipeline → Paint as filled outline stroke ─────────────────
  Path buildStrokePath(List<InputPoint> rawPoints) {
    if (rawPoints.isEmpty) return Path();

    // Pipeline: Decimate → Stabilize → Smooth
    var pts = decimate(rawPoints);
    pts = stabilize(pts);

    if (pts.length < 2) {
      final p = pts.isEmpty ? rawPoints.first : pts.first;
      return Path()
        ..addOval(Rect.fromCircle(center: p.position, radius: settings.maxWidth / 2));
    }

    final widths = computeWidths(pts);
    final positions = pts.map((p) => p.position).toList();

    // Build filled outline path (left side + right side)
    return _buildOutlinePath(positions, widths);
  }

  Path _buildOutlinePath(List<Offset> points, List<double> widths) {
    if (points.length < 2) return Path();

    final leftSide = <Offset>[];
    final rightSide = <Offset>[];

    for (var i = 0; i < points.length; i++) {
      final halfWidth = widths[i] / 2.0;

      // Calculate perpendicular direction at this point
      Offset tangent;
      if (i == 0) {
        tangent = points[1] - points[0];
      } else if (i == points.length - 1) {
        tangent = points.last - points[points.length - 2];
      } else {
        tangent = points[i + 1] - points[i - 1];
      }

      final len = tangent.distance;
      if (len == 0) continue;
      final normal = Offset(-tangent.dy / len, tangent.dx / len);

      leftSide.add(Offset(
        points[i].dx + normal.dx * halfWidth,
        points[i].dy + normal.dy * halfWidth,
      ));
      rightSide.add(Offset(
        points[i].dx - normal.dx * halfWidth,
        points[i].dy - normal.dy * halfWidth,
      ));
    }

    final path = Path();
    if (leftSide.isEmpty) return path;

    path.moveTo(leftSide[0].dx, leftSide[0].dy);
    _addCatmullRomToPath(path, leftSide);
    path.lineTo(rightSide.last.dx, rightSide.last.dy);
    _addCatmullRomToPath(path, rightSide.reversed.toList());
    path.close();

    return path;
  }

  void _addCatmullRomToPath(Path path, List<Offset> pts) {
    if (pts.length < 2) return;
    final all = [pts[0], ...pts, pts.last];
    for (var i = 1; i < all.length - 2; i++) {
      final p0 = all[i - 1];
      final p1 = all[i];
      final p2 = all[i + 1];
      final p3 = all[i + 2];
      final cp1 = Offset(p1.dx + (p2.dx - p0.dx) / 6, p1.dy + (p2.dy - p0.dy) / 6);
      final cp2 = Offset(p2.dx - (p3.dx - p1.dx) / 6, p2.dy - (p3.dy - p1.dy) / 6);
      path.cubicTo(cp1.dx, cp1.dy, cp2.dx, cp2.dy, p2.dx, p2.dy);
    }
  }

  // ── Douglas-Peucker point simplification (call on stroke end/lift) ─────────
  // Removes redundant points to reduce memory footprint
  static List<InputPoint> simplify(List<InputPoint> points, {double epsilon = 1.5}) {
    if (points.length <= 2) return points;
    return _douglasPeucker(points, epsilon);
  }

  static List<InputPoint> _douglasPeucker(List<InputPoint> points, double epsilon) {
    if (points.length <= 2) return points;

    double maxDist = 0;
    int maxIdx = 0;
    final start = points.first.position;
    final end = points.last.position;

    for (var i = 1; i < points.length - 1; i++) {
      final dist = _perpendicularDistance(points[i].position, start, end);
      if (dist > maxDist) {
        maxDist = dist;
        maxIdx = i;
      }
    }

    if (maxDist > epsilon) {
      final left = _douglasPeucker(points.sublist(0, maxIdx + 1), epsilon);
      final right = _douglasPeucker(points.sublist(maxIdx), epsilon);
      return [...left.sublist(0, left.length - 1), ...right];
    }
    return [points.first, points.last];
  }

  static double _perpendicularDistance(Offset point, Offset lineStart, Offset lineEnd) {
    final dx = lineEnd.dx - lineStart.dx;
    final dy = lineEnd.dy - lineStart.dy;
    final len = math.sqrt(dx * dx + dy * dy);
    if (len == 0) return (point - lineStart).distance;
    return ((point.dx - lineStart.dx) * dy - (point.dy - lineStart.dy) * dx).abs() / len;
  }
}
