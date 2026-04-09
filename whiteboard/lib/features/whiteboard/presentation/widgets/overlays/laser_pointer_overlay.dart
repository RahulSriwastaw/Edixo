import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/tool_provider.dart';

class LaserPointerOverlay extends ConsumerStatefulWidget {
  const LaserPointerOverlay({super.key});

  @override
  ConsumerState<LaserPointerOverlay> createState() => _LaserPointerOverlayState();
}

class _LaserPointerOverlayState extends ConsumerState<LaserPointerOverlay> {
  final List<_PointWithTimestamp> _points = [];
  Timer? _cleanupTimer;

  @override
  void initState() {
    super.initState();
    // Cleanup timer to remove old points
    _cleanupTimer = Timer.periodic(const Duration(milliseconds: 32), (_) {
      if (_points.isNotEmpty) {
        setState(() {
          final now = DateTime.now();
          final laserSettings = ref.read(toolNotifierProvider).laserSettings;
          final trailMs = (laserSettings.trailDuration * 1000).toInt();
          
          _points.removeWhere((p) {
            return now.difference(p.timestamp).inMilliseconds > trailMs;
          });
        });
      }
    });
  }

  @override
  void dispose() {
    _cleanupTimer?.cancel();
    super.dispose();
  }

  void _addPoint(Offset point) {
    setState(() {
      _points.add(_PointWithTimestamp(point, DateTime.now()));
    });
  }

  @override
  Widget build(BuildContext context) {
    final laserSettings = ref.watch(toolNotifierProvider).laserSettings;
    final toolColor = ref.watch(toolNotifierProvider).color;

    return GestureDetector(
      onPanUpdate: (details) => _addPoint(details.localPosition),
      onPanEnd: (_) => setState(() => _points.clear()),
      child: CustomPaint(
        painter: _LaserPainter(
          points: _points,
          color: toolColor,
          trailMode: laserSettings.trailMode,
          effect: laserSettings.effect,
          glowEnabled: laserSettings.glowEnabled,
          glowIntensity: laserSettings.glowIntensity,
          glowBlur: laserSettings.glowBlur,
          trailSize: laserSettings.trailSize,
          trailDuration: laserSettings.trailDuration,
          highlightMode: laserSettings.highlightMode,
        ),
        child: Container(),
      ),
    );
  }
}

class _PointWithTimestamp {
  final Offset offset;
  final DateTime timestamp;

  _PointWithTimestamp(this.offset, this.timestamp);
}

class _LaserPainter extends CustomPainter {
  final List<_PointWithTimestamp> points;
  final Color color;
  final LaserTrailMode trailMode;
  final LaserEffect effect;
  final bool glowEnabled;
  final double glowIntensity;
  final double glowBlur;
  final double trailSize;
  final double trailDuration;
  final bool highlightMode;

  _LaserPainter({
    required this.points,
    required this.color,
    required this.trailMode,
    required this.effect,
    required this.glowEnabled,
    required this.glowIntensity,
    required this.glowBlur,
    required this.trailSize,
    required this.trailDuration,
    required this.highlightMode,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (points.isEmpty) return;

    final now = DateTime.now();
    final trailMs = (trailDuration * 1000).toInt();

    if (trailMode == LaserTrailMode.point) {
      // Draw only the most recent point
      if (points.isNotEmpty) {
        _drawPoint(canvas, points.last.offset);
      }
    } else {
      // Draw trail
      for (int i = 0; i < points.length - 1; i++) {
        final p1 = points[i];
        final p2 = points[i + 1];
        
        final ageMs1 = now.difference(p1.timestamp).inMilliseconds;
        final ageMs2 = now.difference(p2.timestamp).inMilliseconds;
        
        final progress1 = 1.0 - (ageMs1 / trailMs).clamp(0.0, 1.0);
        final progress2 = 1.0 - (ageMs2 / trailMs).clamp(0.0, 1.0);

        if (effect == LaserEffect.standard) {
          _drawStandardTrail(canvas, p1.offset, p2.offset, progress1, progress2);
        } else {
          _drawWhiteBurnTrail(canvas, p1.offset, p2.offset, progress1, progress2);
        }
      }

      // Draw the most recent point
      _drawPoint(canvas, points.last.offset);
    }
  }

  void _drawStandardTrail(Canvas canvas, Offset p1, Offset p2, double progress1, double progress2) {
    final baseWidth = 2.0 * trailSize;
    
    // Glow effect
    if (glowEnabled) {
      final glowPaint = Paint()
        ..color = color.withValues(alpha: progress2 * 0.3 * glowIntensity)
        ..strokeWidth = (baseWidth + 6.0) * progress2
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round
        ..maskFilter = MaskFilter.blur(BlurStyle.normal, glowBlur * glowIntensity)
        ..isAntiAlias = true;

      canvas.drawLine(p1, p2, glowPaint);
    }

    // Core line with fade
    final corePaint = Paint()
      ..color = color.withValues(alpha: progress2 * 0.95)
      ..strokeWidth = baseWidth * progress2
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..isAntiAlias = true;

    canvas.drawLine(p1, p2, corePaint);

    // Additional highlight line if highlight mode is enabled
    if (highlightMode) {
      final highlightPaint = Paint()
        ..color = color.withValues(alpha: progress2 * 0.2)
        ..strokeWidth = (baseWidth + 4.0) * progress2
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round
        ..isAntiAlias = true;

      canvas.drawLine(p1, p2, highlightPaint);
    }
  }

  void _drawWhiteBurnTrail(Canvas canvas, Offset p1, Offset p2, double progress1, double progress2) {
    final baseWidth = 2.0 * trailSize;
    
    // Core white line
    final whitePaint = Paint()
      ..color = Colors.white.withValues(alpha: progress2 * 0.9)
      ..strokeWidth = baseWidth * progress2
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..isAntiAlias = true;

    canvas.drawLine(p1, p2, whitePaint);

    // Strong glow effect for burn
    final glowPaint = Paint()
      ..color = color.withValues(alpha: progress2 * 0.5 * glowIntensity)
      ..strokeWidth = (baseWidth + 8.0) * progress2
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..maskFilter = MaskFilter.blur(BlurStyle.normal, glowBlur * glowIntensity * 1.5)
      ..isAntiAlias = true;

    canvas.drawLine(p1, p2, glowPaint);

    // Outer glow for burn effect
    if (glowEnabled) {
      final outerGlow = Paint()
        ..color = Colors.white.withValues(alpha: progress2 * 0.15)
        ..strokeWidth = (baseWidth + 12.0) * progress2
        ..strokeCap = StrokeCap.round
        ..strokeJoin = StrokeJoin.round
        ..maskFilter = MaskFilter.blur(BlurStyle.normal, glowBlur * glowIntensity * 2.0)
        ..isAntiAlias = true;

      canvas.drawLine(p1, p2, outerGlow);
    }
  }

  void _drawPoint(Canvas canvas, Offset point) {
    final pointRadius = 3.0 * trailSize;
    
    // Main point
    final pointPaint = Paint()
      ..color = color
      ..isAntiAlias = true;

    canvas.drawCircle(point, pointRadius, pointPaint);

    // Glow for point
    if (glowEnabled) {
      final glowPaint = Paint()
        ..color = color.withValues(alpha: 0.3 * glowIntensity)
        ..maskFilter = MaskFilter.blur(BlurStyle.normal, glowBlur * glowIntensity)
        ..isAntiAlias = true;

      canvas.drawCircle(point, pointRadius * 2.5, glowPaint);
    }
  }

  @override
  bool shouldRepaint(_LaserPainter oldDelegate) => true;
}
