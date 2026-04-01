import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../providers/tool_provider.dart';

class OverlayLayer extends ConsumerStatefulWidget {
  const OverlayLayer({super.key});

  @override
  ConsumerState<OverlayLayer> createState() => _OverlayLayerState();
}

class _OverlayLayerState extends ConsumerState<OverlayLayer> with SingleTickerProviderStateMixin {
  final List<_LaserPoint> _laserPoints = [];
  Offset? _mousePos;
  late final Ticker _ticker;

  @override
  void initState() {
    super.initState();
    _ticker = createTicker((_) {
      final now = DateTime.now();
      setState(() {
        _laserPoints.removeWhere((p) => now.difference(p.time).inMilliseconds > 1500);
      });
    })..start();
  }

  @override
  void dispose() {
    _ticker.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final toolState = ref.watch(toolProvider);
    final activeTool = toolState.activeTool;

    if (activeTool != Tool.laserPointer && activeTool != Tool.magicPen) {
        return const SizedBox.shrink();
    }

    return MouseRegion(
      onHover: (event) {
        setState(() {
          _mousePos = event.localPosition;
          if (activeTool == Tool.laserPointer) {
            _laserPoints.add(_LaserPoint(event.localPosition, DateTime.now()));
          }
        });
      },
      child: IgnorePointer(
        child: CustomPaint(
          painter: OverlayPainter(
            tool: activeTool,
            mousePos: _mousePos,
            laserPoints: _laserPoints,
          ),
          child: const SizedBox.expand(),
        ),
      ),
    );
  }
}

class _LaserPoint {
  final Offset pos;
  final DateTime time;
  _LaserPoint(this.pos, this.time);
}

class OverlayPainter extends CustomPainter {
  final Tool tool;
  final Offset? mousePos;
  final List<_LaserPoint> laserPoints;

  OverlayPainter({required this.tool, this.mousePos, required this.laserPoints});

  @override
  void paint(Canvas canvas, Size size) {
    if (tool == Tool.laserPointer) {
      _drawLaserPointer(canvas);
    }
  }

  void _drawLaserPointer(Canvas canvas) {
    final now = DateTime.now();
    for (final p in laserPoints) {
      final elapsed = now.difference(p.time).inMilliseconds;
      final opacity = (1.0 - (elapsed / 1500.0)).clamp(0.0, 1.0);
      
      final paint = Paint()
        ..color = Colors.red.withOpacity(opacity)
        ..maskFilter = MaskFilter.blur(BlurStyle.normal, 4 * (1.0 - opacity + 0.5));
      
      canvas.drawCircle(p.pos, 6.0 * opacity, paint);
      
      // Outer glow
      canvas.drawCircle(p.pos, 10.0 * opacity, Paint()
        ..color = Colors.red.withOpacity(opacity * 0.3)
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 8));
    }
  }

  @override
  bool shouldRepaint(covariant OverlayPainter oldDelegate) => true;
}
