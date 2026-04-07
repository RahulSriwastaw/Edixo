// lib/features/whiteboard/presentation/widgets/teaching_tools/spotlight_overlay.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../core/constants/app_colors.dart';

import '../../providers/teaching_tools_provider.dart';

/// Spotlight overlay - dims everything except a circular area
/// Used to focus student attention on a specific part of the canvas
class SpotlightOverlay extends ConsumerWidget {
  const SpotlightOverlay({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(teachingToolsNotifierProvider);
    if (!state.isSpotlightEnabled) return const SizedBox.shrink();

    return GestureDetector(
      onPanUpdate: (details) {
        final nextPos = state.spotlightPosition + details.delta;
        ref.read(teachingToolsNotifierProvider.notifier).updateSpotlight(nextPos, state.spotlightRadius);
      },
      onScaleUpdate: (details) {
        if (details.scale == 1.0) return;
        final nextRadius = (state.spotlightRadius * details.scale).clamp(100.0, 500.0);
        ref.read(teachingToolsNotifierProvider.notifier).updateSpotlight(state.spotlightPosition, nextRadius);
      },
      child: CustomPaint(
        painter: SpotlightPainter(
          position: state.spotlightPosition,
          radius: state.spotlightRadius,
        ),
        child: Stack(
          children: [
            const SizedBox.expand(),
            // Close button overlayed on the spotlight
            Positioned(
              left: state.spotlightPosition.dx + state.spotlightRadius - 20,
              top: state.spotlightPosition.dy - state.spotlightRadius - 20,
              child: MouseRegion(
                cursor: SystemMouseCursors.click,
                child: GestureDetector(
                  onTap: () => ref.read(teachingToolsNotifierProvider.notifier).toggleSpotlight(),
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(color: Colors.redAccent, shape: BoxShape.circle),
                    child: const Icon(Icons.close, size: 20, color: Colors.white),
                  ),
                ),
              ),
            ),
          ],
        ),
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
