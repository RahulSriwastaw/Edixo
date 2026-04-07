// lib/features/subject_tools/presentation/widgets/protractor_widget.dart

import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../whiteboard/presentation/providers/teaching_tools_provider.dart';

class ProtractorWidget extends ConsumerStatefulWidget {
  const ProtractorWidget({super.key});

  @override
  ConsumerState<ProtractorWidget> createState() => _ProtractorWidgetState();
}

class _ProtractorWidgetState extends ConsumerState<ProtractorWidget> {
  Offset _position = const Offset(400, 400);
  double _rotation = 0.0; // In radians
  double _radius = 250.0;

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
              // The Protractor Body
              Container(
                width: _radius * 2,
                height: _radius,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.12),
                  borderRadius: BorderRadius.vertical(top: Radius.circular(_radius)),
                  border: Border.all(color: Colors.white30),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withValues(alpha: 0.3), blurRadius: 10),
                  ],
                ),
                child: CustomPaint(
                   painter: ProtractorPainter(),
                ),
              ),

              // Close Button
              Positioned(
                bottom: 5,
                left: _radius - 10,
                child: IconButton(
                  icon: const Icon(Icons.close, size: 20, color: Colors.redAccent),
                  onPressed: () => ref.read(teachingToolsNotifierProvider.notifier).toggleMathTool('protractor'),
                  padding: EdgeInsets.zero,
                  constraints: const BoxConstraints(),
                ),
              ),

              // Rotation Handle (Right Margin)
              Positioned(
                 right: 1,
                 bottom: 1,
                 child: GestureDetector(
                    onPanUpdate: (details) {
                      final center = _position + Offset(_radius, _radius);
                      final touch = details.globalPosition;
                      final delta = touch - center;
                      setState(() {
                         _rotation = math.atan2(delta.dy, delta.dx) + (math.pi / 2);
                      });
                    },
                    child: Container(
                       padding: const EdgeInsets.all(8),
                       decoration: const BoxDecoration(color: Colors.orange, shape: BoxShape.circle),
                       child: const Icon(Icons.rotate_90_degrees_ccw, size: 16, color: Colors.black),
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

class ProtractorPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white54
      ..strokeWidth = 1.0;
    
    final center = Offset(size.width / 2, size.height);
    final radius = size.width / 2;

    for (int i = 0; i <= 180; i++) {
        final angle = i * math.pi / 180;
        final cosVal = math.cos(math.pi - angle);
        final sinVal = math.sin(math.pi - angle);

        double length;
        if (i % 10 == 0) {
           length = 25.0;
           paint.strokeWidth = 1.5;
           
           // Draw degrees
           final tp = TextPainter(
             text: TextSpan(
               text: '$i',
               style: const TextStyle(color: Colors.white70, fontSize: 10),
             ),
             textDirection: TextDirection.ltr,
           )..layout();

           final labelDist = radius - 35.0;
           final lx = center.dx + labelDist * cosVal;
           final ly = center.dy + labelDist * sinVal;
           tp.paint(canvas, Offset(lx - tp.width / 2, ly - tp.height / 2));

           // Inverse Degrees (Outer Ring)
           final itp = TextPainter(
              text: TextSpan(
                text: '${180 - i}', 
                style: const TextStyle(color: Colors.orange, fontSize: 9),
              ),
              textDirection: TextDirection.ltr,
           )..layout();
           final ilabelDist = radius - 15.0;
           final ilx = center.dx + ilabelDist * cosVal;
           final ily = center.dy + ilabelDist * sinVal;
           itp.paint(canvas, Offset(ilx - itp.width / 2, ily - itp.height / 2));

        } else if (i % 5 == 0) {
           length = 15.0;
           paint.strokeWidth = 1.0;
        } else {
           length = 8.0;
           paint.strokeWidth = 0.5;
        }

        final start = center + Offset((radius - length) * cosVal, (radius - length) * sinVal);
        final end = center + Offset(radius * cosVal, radius * sinVal);
        canvas.drawLine(start, end, paint);
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}
