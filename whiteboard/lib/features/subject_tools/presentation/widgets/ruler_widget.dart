// lib/features/subject_tools/presentation/widgets/ruler_widget.dart

import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../whiteboard/presentation/providers/teaching_tools_provider.dart';

class RulerWidget extends ConsumerStatefulWidget {
  const RulerWidget({super.key});

  @override
  ConsumerState<RulerWidget> createState() => _RulerWidgetState();
}

class _RulerWidgetState extends ConsumerState<RulerWidget> {
  Offset _position = const Offset(200, 300);
  double _rotation = 0.0; // In radians
  double _width = 800.0;
  static const double _height = 60.0;

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: _position.dx,
      top: _position.dy,
      child: Transform.rotate(
        angle: _rotation,
        child: GestureDetector(
          onPanUpdate: (details) {
            setState(() {
              _position += details.delta;
            });
          },
          child: Stack(
            children: [
              // The Ruler Body
              Container(
                width: _width,
                height: _height,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: Colors.white38),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.3), blurRadius: 10, offset: const Offset(0, 5)),
                  ],
                ),
                child: CustomPaint(
                  painter: RulerPainter(),
                ),
              ),

              // Close Button
              Positioned(
                top: 2,
                left: 2,
                child: IconButton(
                  icon: const Icon(Icons.close, size: 16, color: Colors.redAccent),
                  onPressed: () => ref.read(teachingToolsNotifierProvider.notifier).toggleMathTool('ruler'),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ),

              // Rotation Handle (Right End)
              Positioned(
                right: 0,
                top: 0,
                bottom: 0,
                child: GestureDetector(
                  onPanUpdate: (details) {
                    final center = _position + Offset(_width / 2, _height / 2);
                    final touch = details.globalPosition;
                    final delta = touch - center;
                    setState(() {
                      _rotation = math.atan2(delta.dy, delta.dx);
                    });
                  },
                  child: Container(
                    width: 40,
                    color: Colors.orange.withOpacity(0.2),
                    child: const Icon(Icons.rotate_right, color: Colors.orange, size: 20),
                  ),
                ),
              ),

              // Resize Handle (Bottom-Right)
              Positioned(
                right: 0,
                bottom: 0,
                child: GestureDetector(
                  onPanUpdate: (details) {
                    setState(() {
                      _width = (_width + details.delta.dx).clamp(200.0, 1600.0);
                    });
                  },
                  child: const Icon(Icons.drag_handle, color: Colors.white54, size: 16),
                ),
              ),
            ],
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
      ..color = Colors.white54
      ..strokeWidth = 1.0;

    const double cmWidth = 40.0; // 1cm = 40 logical pixels
    final int totalCm = (size.width / cmWidth).floor();

    for (int i = 0; i <= totalCm; i++) {
        final x = i * cmWidth;
        
        // Centimeter markings
        canvas.drawLine(Offset(x, 0), Offset(x, 20), paint);
        
        // Draw Number
        final textPainter = TextPainter(
          text: TextSpan(
            text: '$i',
            style: const TextStyle(color: Colors.white70, fontSize: 10),
          ),
          textDirection: TextDirection.ltr,
        )..layout();
        textPainter.paint(canvas, Offset(x - (textPainter.width / 2), 22));

        // Millimeter markings
        if (i < totalCm) {
          for (int j = 1; j < 10; j++) {
            final mmX = x + (j * (cmWidth / 10));
            final height = j == 5 ? 12.0 : 8.0;
            canvas.drawLine(Offset(mmX, 0), Offset(mmX, height), paint);
          }
        }
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}
