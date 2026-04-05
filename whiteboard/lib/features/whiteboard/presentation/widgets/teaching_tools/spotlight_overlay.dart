// lib/features/whiteboard/presentation/widgets/teaching_tools/spotlight_overlay.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../core/constants/app_colors.dart';

/// Spotlight overlay - dims everything except a circular area
/// Used to focus student attention on a specific part of the canvas
class SpotlightOverlay extends ConsumerStatefulWidget {
  const SpotlightOverlay({super.key});

  @override
  ConsumerState<SpotlightOverlay> createState() => _SpotlightOverlayState();
}

class _SpotlightOverlayState extends ConsumerState<SpotlightOverlay> {
  Offset _spotlightPosition = const Offset(960, 540);
  double _spotlightRadius = 200;
  final bool _isActive = false;

  @override
  Widget build(BuildContext context) {
    if (!_isActive) return const SizedBox.shrink();

    return GestureDetector(
      onPanUpdate: (details) {
        setState(() {
          _spotlightPosition += details.delta;
        });
      },
      onScaleUpdate: (details) {
        setState(() {
          _spotlightRadius = (_spotlightRadius * details.scale).clamp(100.0, 500.0);
        });
      },
      child: CustomPaint(
        painter: SpotlightPainter(
          position: _spotlightPosition,
          radius: _spotlightRadius,
        ),
        child: const SizedBox.expand(),
      ),
    );
  }
}

class SpotlightPainter extends CustomPainter {
  final Offset position;
  final double radius;

  SpotlightPainter({required this.position, required this.radius});

  @override
  void paint(Canvas canvas, Size size) {
    // Create a path for the entire canvas
    final canvasPath = Path()..addRect(Rect.fromLTWH(0, 0, size.width, size.height));
    
    // Create a path for the spotlight circle
    final spotlightPath = Path()
      ..addOval(Rect.fromCircle(center: position, radius: radius));

    // Use PathOperation to subtract the spotlight from the canvas
    final dimmedPath = Path.combine(
      PathOperation.difference,
      canvasPath,
      spotlightPath,
    );

    // Draw the dimmed area
    canvas.drawPath(
      dimmedPath,
      Paint()..color = Colors.black.withValues(alpha: 0.7),
    );

    // Draw a subtle border around the spotlight
    canvas.drawCircle(
      position,
      radius,
      Paint()
        ..color = AppColors.accentOrange.withValues(alpha: 0.5)
        ..strokeWidth = 2
        ..style = PaintingStyle.stroke,
    );
  }

  @override
  bool shouldRepaint(SpotlightPainter oldDelegate) {
    return oldDelegate.position != position || oldDelegate.radius != radius;
  }
}
