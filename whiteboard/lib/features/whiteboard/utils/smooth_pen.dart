import 'dart:math' as math;
import 'package:flutter/material.dart';
import '../providers/canvas_provider.dart';

/// Decimates a list of points by removing those closer than [minDist].
List<StrokePoint> decimate(List<StrokePoint> pts, {double minDist = 2.0}) {
  if (pts.length < 2) return pts;
  
  final out = <StrokePoint>[pts.first];
  for (int i = 1; i < pts.length; i++) {
    final p = pts[i];
    final prev = out.last;
    final d = math.sqrt(math.pow(p.x - prev.x, 2) + math.pow(p.y - prev.y, 2));
    if (d >= minDist) out.add(p);
  }
  
  if (out.last != pts.last) out.add(pts.last);
  return out;
}

/// Generates a smooth Catmull-Rom spline [Path] from a list of points.
/// Uses explicit sampling (8 steps per segment by default) as requested.
Path catmullRomPath(List<StrokePoint> pts, {double tension = 0.5}) {
  if (pts.length < 2) return Path();
  
  final path = Path();
  path.moveTo(pts[0].x, pts[0].y);
  
  // Tension 0.5 results in 8 steps per segment (tension * 16)
  final steps = math.max(4, (tension * 16).round());

  for (int i = 0; i < pts.length - 1; i++) {
    final p0 = pts[math.max(0, i - 1)];
    final p1 = pts[i];
    final p2 = pts[i + 1];
    final p3 = pts[math.min(pts.length - 1, i + 2)];

    for (int j = 1; j <= steps; j++) {
      final t = j / steps;
      final t2 = t * t;
      final t3 = t2 * t;

      final x = 0.5 * (
        (2 * p1.x) +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
      );

      final y = 0.5 * (
        (2 * p1.y) +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
      );

      path.lineTo(x, y);
    }
  }
  return path;
}

/// Computes velocity-based widths for a natural pen feel.
List<double> getVelocityWidths(List<StrokePoint> pts, double baseSize) {
  if (pts.isEmpty) return [];
  
  final widths = <double>[];
  for (int i = 0; i < pts.length; i++) {
    if (i == 0) {
      widths.add(baseSize * 0.5);
      continue;
    }
    
    final p = pts[i];
    final prev = pts[i - 1];
    final dist = math.sqrt(math.pow(p.x - prev.x, 2) + math.pow(p.y - prev.y, 2));
    
    final t1 = p.time?.millisecondsSinceEpoch ?? (i * 16);
    final t0 = prev.time?.millisecondsSinceEpoch ?? ((i - 1) * 16);
    final dt = math.max(1, t1 - t0);
    
    final vel = dist / dt;
    // Fast stroke = thinner, slow = thicker
    final w = baseSize * math.max(0.3, math.min(1.5, 1.3 - vel * 0.7));
    widths.add(w);
  }
  
  // Smooth the widths array with a simple box blur
  final smoothed = <double>[];
  for (int i = 0; i < widths.length; i++) {
    if (i == 0 || i == widths.length - 1) {
      smoothed.add(widths[i]);
    } else {
      smoothed.add((widths[i - 1] + widths[i] + widths[i + 1]) / 3.0);
    }
  }
  return smoothed;
}
