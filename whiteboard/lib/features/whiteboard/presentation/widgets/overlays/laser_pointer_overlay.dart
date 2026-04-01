
import 'dart:async';
import 'package:flutter/material.dart';

class LaserPointerOverlay extends StatefulWidget {
  const LaserPointerOverlay({super.key});

  @override
  State<LaserPointerOverlay> createState() => _LaserPointerOverlayState();
}

class _LaserPointerOverlayState extends State<LaserPointerOverlay> {
  final List<Offset> _points = [];
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(milliseconds: 50), (_) {
      if (_points.isNotEmpty) {
        setState(() {
          _points.removeAt(0);
        });
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _addPoint(Offset point) {
    setState(() {
      _points.add(point);
    });
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onPanUpdate: (details) => _addPoint(details.localPosition),
      onPanEnd: (_) => setState(() => _points.clear()),
      child: CustomPaint(
        painter: _LaserPainter(_points),
        child: Container(),
      ),
    );
  }
}

class _LaserPainter extends CustomPainter {
  final List<Offset> points;

  _LaserPainter(this.points);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.red
      ..strokeCap = StrokeCap.round
      ..strokeWidth = 5.0;

    for (int i = 0; i < points.length - 1; i++) {
      if (points[i] != null && points[i + 1] != null) {
        canvas.drawLine(points[i], points[i + 1], paint);
      }
    }
  }

  @override
  bool shouldRepaint(_LaserPainter oldDelegate) => true;
}
