// lib/features/whiteboard/presentation/widgets/subject_tools/protractor_widget.dart

import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../core/constants/app_colors.dart';

/// Draggable and rotatable protractor for angle measurement
class ProtractorWidget extends ConsumerStatefulWidget {
  const ProtractorWidget({super.key});

  @override
  ConsumerState<ProtractorWidget> createState() => _ProtractorWidgetState();
}

class _ProtractorWidgetState extends ConsumerState<ProtractorWidget> {
  Offset _position = const Offset(200, 200);
  double _rotation = 0.0;
  bool _isDragging = false;
  bool _isRotating = false;
  double _initialRotationAngle = 0.0;

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: _position.dx,
      top: _position.dy,
      child: GestureDetector(
        onPanStart: (_) => setState(() => _isDragging = true),
        onPanUpdate: (details) {
          setState(() {
            _position += details.delta;
          });
        },
        onPanEnd: (_) => setState(() => _isDragging = false),
        child: Transform.rotate(
          angle: _rotation,
          child: Container(
            width: 300,
            height: 150,
            decoration: BoxDecoration(
              color: AppColors.bgSecondary.withValues(alpha: 0.9),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(150),
                topRight: Radius.circular(150),
              ),
              border: Border.all(
                color: _isDragging ? AppColors.accentOrange : AppColors.textDisabled,
                width: 2,
              ),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.3),
                  blurRadius: 8,
                  offset: const Offset(2, 2),
                ),
              ],
            ),
            child: Stack(
              children: [
                CustomPaint(
                  painter: ProtractorPainter(),
                  child: const SizedBox.expand(),
                ),
                // Rotation handle
                Positioned(
                  top: -20,
                  left: 140,
                  child: GestureDetector(
                    onPanStart: (details) {
                      setState(() {
                        _isRotating = true;
                        const center = Offset(150, 150);
                        _initialRotationAngle = (details.localPosition - center).direction;
                      });
                    },
                    onPanUpdate: (details) {
                      if (_isRotating) {
                        setState(() {
                          const center = Offset(150, 150);
                          final newAngle = (details.localPosition - center).direction;
                          _rotation += newAngle - _initialRotationAngle;
                          _initialRotationAngle = newAngle;
                        });
                      }
                    },
                    onPanEnd: (_) => setState(() => _isRotating = false),
                    child: Container(
                      width: 20,
                      height: 20,
                      decoration: const BoxDecoration(
                        color: AppColors.accentOrange,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.rotate_right, size: 14, color: Colors.white),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class ProtractorPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.textPrimary
      ..strokeWidth = 1;

    final center = Offset(size.width / 2, size.height);
    final radius = size.width / 2 - 10;

    // Draw outer arc
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      pi,
      pi,
      false,
      paint..strokeWidth = 2,
    );

    // Draw inner arc
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius - 20),
      pi,
      pi,
      false,
      paint..strokeWidth = 1,
    );

    // Draw degree markings
    for (int degrees = 0; degrees <= 180; degrees += 5) {
      final angle = pi + (degrees * pi / 180);
      final isMajor = degrees % 10 == 0;
      final isMedium = degrees % 5 == 0;
      final innerRadius = isMajor ? radius - 25 : (isMedium ? radius - 20 : radius - 15);

      final x1 = center.dx + cos(angle) * innerRadius;
      final y1 = center.dy + sin(angle) * innerRadius;
      final x2 = center.dx + cos(angle) * radius;
      final y2 = center.dy + sin(angle) * radius;

      canvas.drawLine(
        Offset(x1, y1),
        Offset(x2, y2),
        paint..strokeWidth = isMajor ? 2.0 : 1.0,
      );

      // Draw degree numbers
      if (isMajor) {
        final textRadius = radius - 35;
        final tx = center.dx + cos(angle) * textRadius;
        final ty = center.dy + sin(angle) * textRadius;

        final textPainter = TextPainter(
          text: TextSpan(
            text: '$degrees°',
            style: TextStyle(
              color: AppColors.textPrimary,
              fontSize: 8,
            ),
          ),
          textDirection: TextDirection.ltr,
        );
        textPainter.layout();
        textPainter.paint(
          canvas,
          Offset(tx - textPainter.width / 2, ty - textPainter.height / 2),
        );
      }
    }

    // Draw center point
    canvas.drawCircle(
      center,
      4,
      Paint()..color = AppColors.accentOrange,
    );
  }

  @override
  bool shouldRepaint(ProtractorPainter oldDelegate) => false;
}
