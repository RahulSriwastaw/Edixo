// lib/features/whiteboard/presentation/widgets/subject_tools/ruler_widget.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../core/constants/app_colors.dart';

/// Draggable and rotatable ruler for measurement
class RulerWidget extends ConsumerStatefulWidget {
  const RulerWidget({super.key});

  @override
  ConsumerState<RulerWidget> createState() => _RulerWidgetState();
}

class _RulerWidgetState extends ConsumerState<RulerWidget> {
  Offset _position = const Offset(100, 100);
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
            width: 400,
            height: 60,
            decoration: BoxDecoration(
              color: AppColors.bgSecondary.withValues(alpha: 0.9),
              borderRadius: BorderRadius.circular(4),
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
            child: CustomPaint(
              painter: RulerPainter(),
              child: Stack(
                children: [
                  // Rotation handle
                  Positioned(
                    top: -20,
                    right: 10,
                    child: GestureDetector(
                      onPanStart: (details) {
                        setState(() {
                          _isRotating = true;
                          const center = Offset(200, 30);
                          _initialRotationAngle = (details.localPosition - center).direction;
                        });
                      },
                      onPanUpdate: (details) {
                        if (_isRotating) {
                          setState(() {
                            const center = Offset(200, 30);
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
      ),
    );
  }
}

class RulerPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.textPrimary
      ..strokeWidth = 1;

    // Draw ruler markings
    for (int i = 0; i <= 40; i++) {
      final x = i * 10.0;
      final isMajor = i % 10 == 0;
      final isMedium = i % 5 == 0;
      final height = isMajor ? 20.0 : (isMedium ? 15.0 : 10.0);

      canvas.drawLine(
        Offset(x, size.height - height),
        Offset(x, size.height.toDouble()),
        paint..strokeWidth = isMajor ? 2.0 : 1.0,
      );

      // Draw numbers for major marks
      if (isMajor) {
        final textPainter = TextPainter(
          text: TextSpan(
            text: '${i ~/ 10}',
            style: const TextStyle(
              color: AppColors.textPrimary,
              fontSize: 10,
            ),
          ),
          textDirection: TextDirection.ltr,
        );
        textPainter.layout();
        textPainter.paint(
          canvas,
          Offset(x - textPainter.width / 2, size.height - height - 12),
        );
      }
    }

    // Draw "cm" label
    final cmPainter = TextPainter(
      text: const TextSpan(
        text: 'cm',
        style: TextStyle(
          color: AppColors.textSecondary,
          fontSize: 12,
          fontWeight: FontWeight.bold,
        ),
      ),
      textDirection: TextDirection.ltr,
    );
    cmPainter.layout();
    cmPainter.paint(canvas, Offset(size.width - 30, 10));
  }

  @override
  bool shouldRepaint(RulerPainter oldDelegate) => false;
}
