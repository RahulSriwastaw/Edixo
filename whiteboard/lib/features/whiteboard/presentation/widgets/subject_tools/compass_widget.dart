// lib/features/whiteboard/presentation/widgets/subject_tools/compass_widget.dart

import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../core/constants/app_colors.dart';

/// Draggable compass for drawing circles and arcs
class CompassWidget extends ConsumerStatefulWidget {
  const CompassWidget({super.key});

  @override
  ConsumerState<CompassWidget> createState() => _CompassWidgetState();
}

class _CompassWidgetState extends ConsumerState<CompassWidget> {
  Offset _position = const Offset(300, 300);
  double _radius = 100;
  final double _startAngle = 0.0;
  double _sweepAngle = pi;
  bool _isDragging = false;
  bool _isAdjustingRadius = false;


  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: _position.dx - 150,
      top: _position.dy - 150,
      child: GestureDetector(
        onPanStart: (_) => setState(() => _isDragging = true),
        onPanUpdate: (details) {
          if (_isDragging) {
            setState(() {
              _position += details.delta;
            });
          }
        },
        onPanEnd: (_) => setState(() => _isDragging = false),
        child: SizedBox(
          width: 300,
          height: 300,
          child: Stack(
            children: [
              // Compass visualization
              CustomPaint(
                painter: CompassPainter(
                  radius: _radius,
                  startAngle: _startAngle,
                  sweepAngle: _sweepAngle,
                ),
                child: const SizedBox.expand(),
              ),

              // Center point (drag to move compass)
              Positioned(
                left: 150 - 10,
                top: 150 - 10,
                child: GestureDetector(
                  onPanStart: (_) => setState(() => _isDragging = true),
                  onPanUpdate: (details) {
                    setState(() {
                      _position += details.delta;
                    });
                  },
                  onPanEnd: (_) => setState(() => _isDragging = false),
                  child: Container(
                    width: 20,
                    height: 20,
                    decoration: BoxDecoration(
                      color: AppColors.accentOrange,
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 2),
                    ),
                    child: const Icon(Icons.my_location, size: 12, color: Colors.white),
                  ),
                ),
              ),

              // Radius adjustment handle
              Positioned(
                left: 150 + cos(_startAngle) * _radius - 10,
                top: 150 + sin(_startAngle) * _radius - 10,
                child: GestureDetector(
                  onPanStart: (_) => setState(() => _isAdjustingRadius = true),
                  onPanUpdate: (details) {
                    if (_isAdjustingRadius) {
                      setState(() {
                        final dx = details.delta.dx;
                        final dy = details.delta.dy;
                        _radius = (_radius + dx + dy).clamp(50.0, 200.0);
                      });
                    }
                  },
                  onPanEnd: (_) => setState(() => _isAdjustingRadius = false),
                  child: Container(
                    width: 20,
                    height: 20,
                    decoration: BoxDecoration(
                      color: Colors.blue,
                      shape: BoxShape.circle,
                      border: Border.all(color: Colors.white, width: 2),
                    ),
                    child: const Icon(Icons.open_with, size: 12, color: Colors.white),
                  ),
                ),
              ),

              // Controls
              Positioned(
                bottom: 10,
                left: 10,
                right: 10,
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.bgSecondary.withValues(alpha: 0.9),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Radius: ${_radius.toInt()}px',
                        style: const TextStyle(
                          color: AppColors.textPrimary,
                          fontSize: 12,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Expanded(
                            child: Slider(
                              value: _radius,
                              min: 50,
                              max: 200,
                              onChanged: (v) => setState(() => _radius = v),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                          _ControlButton(
                            icon: Icons.add,
                            onTap: () => setState(() => _sweepAngle = (_sweepAngle + pi / 6).clamp(0.0, 2 * pi)),
                          ),
                          _ControlButton(
                            icon: Icons.remove,
                            onTap: () => setState(() => _sweepAngle = (_sweepAngle - pi / 6).clamp(0.0, 2 * pi)),
                          ),
                          _ControlButton(
                            icon: Icons.refresh,
                            onTap: () => setState(() {
                              _radius = 100;
                              _sweepAngle = pi;
                            }),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class CompassPainter extends CustomPainter {
  final double radius;
  final double startAngle;
  final double sweepAngle;

  CompassPainter({
    required this.radius,
    required this.startAngle,
    required this.sweepAngle,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);

    // Draw compass arms
    final armPaint = Paint()
      ..color = AppColors.textPrimary
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.round;

    // Fixed arm (point)
    canvas.drawLine(
      center,
      Offset(center.dx, center.dy - radius),
      armPaint,
    );

    // Adjustable arm (pencil)
    final endX = center.dx + cos(startAngle) * radius;
    final endY = center.dy + sin(startAngle) * radius;
    canvas.drawLine(
      center,
      Offset(endX, endY),
      armPaint,
    );

    // Draw arc
    if (sweepAngle > 0) {
      final arcPaint = Paint()
        ..color = AppColors.accentOrange.withValues(alpha: 0.5)
        ..strokeWidth = 2
        ..style = PaintingStyle.stroke;

      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        startAngle,
        sweepAngle,
        false,
        arcPaint,
      );
    }

    // Draw center point
    canvas.drawCircle(
      center,
      6,
      Paint()..color = AppColors.accentOrange,
    );

    // Draw endpoint
    canvas.drawCircle(
      Offset(endX, endY),
      4,
      Paint()..color = Colors.blue,
    );
  }

  @override
  bool shouldRepaint(CompassPainter oldDelegate) {
    return oldDelegate.radius != radius ||
        oldDelegate.startAngle != startAngle ||
        oldDelegate.sweepAngle != sweepAngle;
  }
}

class _ControlButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onTap;

  const _ControlButton({required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 32,
        height: 32,
        decoration: BoxDecoration(
          color: AppColors.bgPrimary,
          borderRadius: BorderRadius.circular(4),
          border: Border.all(color: AppColors.textTertiary.withValues(alpha: 0.3)),
        ),
        child: Icon(icon, size: 16, color: AppColors.textPrimary),
      ),
    );
  }
}
