import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:eduhub_whiteboard/core/theme/app_theme.dart';

class OpticsSimulationDialog extends StatefulWidget {
  const OpticsSimulationDialog({super.key});

  @override
  State<OpticsSimulationDialog> createState() => _OpticsSimulationDialogState();
}

class _OpticsSimulationDialogState extends State<OpticsSimulationDialog> {
  double _focalLength = 100.0;
  double _objectPosition = -150.0;
  bool _isConvex = true;
  double _objectHeight = 50.0;

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      child: Container(
        width: 800.w,
        height: 600.h,
        decoration: BoxDecoration(
          color: const Color(0xFF1E1E1E),
          borderRadius: BorderRadius.circular(24.r),
          border: Border.all(color: Colors.white12),
        ),
        child: Column(
          children: [
            _buildHeader(),
            Expanded(
              child: Row(
                children: [
                  Expanded(child: _buildSimulationCanvas()),
                  _buildControls(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 16.h),
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: Colors.white12)),
      ),
      child: Row(
        children: [
          const Icon(Icons.science, color: Colors.blueAccent),
          SizedBox(width: 12.w),
          Text(
            'Physics Simulation: Ray Optics',
            style: TextStyle(color: Colors.white, fontSize: 18.sp, fontWeight: FontWeight.bold),
          ),
          const Spacer(),
          IconButton(
            icon: const Icon(Icons.close, color: Colors.white54),
            onPressed: () => Navigator.pop(context),
          ),
        ],
      ),
    );
  }

  Widget _buildSimulationCanvas() {
    return Container(
      margin: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.circular(16.r),
        border: Border.all(color: Colors.white10),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16.r),
        child: GestureDetector(
          onPanUpdate: (details) {
            setState(() {
              _objectPosition += details.delta.dx;
            });
          },
          child: CustomPaint(
            painter: OpticsPainter(
              focalLength: _focalLength,
              objectPosition: _objectPosition,
              isConvex: _isConvex,
              objectHeight: _objectHeight,
            ),
            size: Size.infinite,
          ),
        ),
      ),
    );
  }

  Widget _buildControls() {
    return Container(
      width: 240.w,
      padding: EdgeInsets.all(20.w),
      decoration: const BoxDecoration(
        border: Border(left: BorderSide(color: Colors.white12)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Settings', style: TextStyle(color: Colors.white, fontSize: 16.sp, fontWeight: FontWeight.bold)),
          SizedBox(height: 24.h),
          
          _label('Lens Type'),
          Row(
            children: [
              _typeBtn('Convex', _isConvex, () => setState(() => _isConvex = true)),
              SizedBox(width: 8.w),
              _typeBtn('Concave', !_isConvex, () => setState(() => _isConvex = false)),
            ],
          ),
          
          SizedBox(height: 24.h),
          _label('Focal Length: ${_focalLength.toInt()}'),
          Slider(
            value: _focalLength,
            min: 50,
            max: 200,
            onChanged: (v) => setState(() => _focalLength = v),
            activeColor: Colors.blueAccent,
          ),
          
          SizedBox(height: 24.h),
          _label('Object height: ${_objectHeight.toInt()}'),
          Slider(
            value: _objectHeight,
            min: 10,
            max: 100,
            onChanged: (v) => setState(() => _objectHeight = v),
            activeColor: Colors.blueAccent,
          ),

          const Spacer(),
          Text(
            'Drag the arrow to move the object.',
            style: TextStyle(color: Colors.white38, fontSize: 11.sp, fontStyle: FontStyle.italic),
          ),
          SizedBox(height: 12.h),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryOrange,
              minimumSize: Size(double.infinity, 44.h),
            ),
            onPressed: () => Navigator.pop(context),
            child: const Text('Insert Simulation'),
          ),
        ],
      ),
    );
  }

  Widget _label(String text) {
    return Padding(
      padding: EdgeInsets.only(bottom: 8.h),
      child: Text(text, style: TextStyle(color: Colors.white70, fontSize: 13.sp)),
    );
  }

  Widget _typeBtn(String label, bool active, VoidCallback onTap) {
    return Expanded(
      child: InkWell(
        onTap: onTap,
        child: Container(
          padding: EdgeInsets.symmetric(vertical: 8.h),
          decoration: BoxDecoration(
            color: active ? Colors.blueAccent.withOpacity(0.2) : Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(8.r),
            border: Border.all(color: active ? Colors.blueAccent : Colors.transparent),
          ),
          child: Center(
            child: Text(label, style: TextStyle(color: active ? Colors.blueAccent : Colors.white54, fontSize: 12.sp)),
          ),
        ),
      ),
    );
  }
}

class OpticsPainter extends CustomPainter {
  final double focalLength;
  final double objectPosition;
  final bool isConvex;
  final double objectHeight;

  OpticsPainter({
    required this.focalLength,
    required this.objectPosition,
    required this.isConvex,
    required this.objectHeight,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final paint = Paint()
      ..color = Colors.white24
      ..strokeWidth = 1;

    // Principal Axis
    canvas.drawLine(Offset(0, center.dy), Offset(size.width, center.dy), paint);

    // Lens
    final lensPaint = Paint()
      ..color = Colors.blueAccent.withOpacity(0.3)
      ..style = PaintingStyle.fill;
    
    final lensPath = Path();
    if (isConvex) {
      lensPath.addOval(Rect.fromCenter(center: center, width: 40, height: 200));
    } else {
      // Concave shape
      lensPath.moveTo(center.dx - 20, center.dy - 100);
      lensPath.quadraticBezierTo(center.dx, center.dy, center.dx - 20, center.dy + 100);
      lensPath.lineTo(center.dx + 20, center.dy + 100);
      lensPath.quadraticBezierTo(center.dx, center.dy, center.dx + 20, center.dy - 100);
      lensPath.close();
    }
    canvas.drawPath(lensPath, lensPaint);
    canvas.drawPath(lensPath, Paint()..color = Colors.blueAccent..style = PaintingStyle.stroke..strokeWidth = 2);

    // Focal Points
    final f = isConvex ? focalLength : -focalLength;
    _drawPoint(canvas, center.dx + f, center.dy, 'F', Colors.yellow);
    _drawPoint(canvas, center.dx - f, center.dy, 'F', Colors.yellow);
    _drawPoint(canvas, center.dx + 2 * f, center.dy, '2F', Colors.orange);
    _drawPoint(canvas, center.dx - 2 * f, center.dy, '2F', Colors.orange);

    // Object
    final objPaint = Paint()..color = Colors.greenAccent..strokeWidth = 3;
    final objBase = Offset(center.dx + objectPosition, center.dy);
    final objTop = Offset(center.dx + objectPosition, center.dy - objectHeight);
    canvas.drawLine(objBase, objTop, objPaint);
    // Arrow head
    canvas.drawCircle(objTop, 4, objPaint);

    // Rays
    final rayPaint = Paint()..color = Colors.redAccent..strokeWidth = 1.5..style = PaintingStyle.stroke;
    
    // Ray 1: Parallel to principal axis
    final ray1Path = Path();
    ray1Path.moveTo(objTop.dx, objTop.dy);
    ray1Path.lineTo(center.dx, objTop.dy);
    if (isConvex) {
        // Refracts through Focus
        final target = Offset(center.dx + focalLength, center.dy);
        final dir = (target - Offset(center.dx, objTop.dy));
        ray1Path.lineTo(center.dx + dir.dx * 10, Offset(center.dx, objTop.dy).dy + dir.dy * 10);
    } else {
        // Diverges from primary focus
        final fPoint = Offset(center.dx - focalLength, center.dy);
        final dir = (Offset(center.dx, objTop.dy) - fPoint);
        ray1Path.lineTo(center.dx + dir.dx * 10, Offset(center.dx, objTop.dy).dy + dir.dy * 10);
        // Deshed virtual ray
        _drawDashedLine(canvas, Offset(center.dx, objTop.dy), fPoint, Colors.redAccent.withOpacity(0.3));
    }
    canvas.drawPath(ray1Path, rayPaint);

    // Ray 2: Through optical center
    final ray2Path = Path();
    ray2Path.moveTo(objTop.dx, objTop.dy);
    final dir2 = (center - objTop);
    ray2Path.lineTo(objTop.dx + dir2.dx * 10, objTop.dy + dir2.dy * 10);
    canvas.drawPath(ray2Path, rayPaint);

    // Image calculation (Simplified 1/v - 1/u = 1/f)
    // u = objectPosition (negative if left)
    // f = f
    final u = objectPosition;
    final v = 1 / ( (1/f) + (1/u) );
    
    if (v.isFinite && v.isFinite) {
        final imgX = center.dx + v;
        final mag = -v / u;
        final imgHeight = objectHeight * mag;
        final imgTop = Offset(imgX, center.dy - imgHeight);

        final imgPaint = Paint()..color = Colors.cyanAccent.withOpacity(0.7)..strokeWidth = 3;
        canvas.drawLine(Offset(imgX, center.dy), imgTop, imgPaint);
        canvas.drawCircle(imgTop, 4, imgPaint);
        
        // Label Image
        _drawText(canvas, Offset(imgX, center.dy + 10), 'Image', Colors.cyanAccent);
    }
  }

  void _drawPoint(Canvas canvas, double x, double y, String label, Color color) {
    canvas.drawCircle(Offset(x, y), 3, Paint()..color = color);
    _drawText(canvas, Offset(x - 5, y + 5), label, color);
  }

  void _drawText(Canvas canvas, Offset offset, String text, Color color) {
    final tp = TextPainter(
      text: TextSpan(text: text, style: TextStyle(color: color, fontSize: 10.sp)),
      textDirection: TextDirection.ltr,
    );
    tp.layout();
    tp.paint(canvas, offset);
  }

  void _drawDashedLine(Canvas canvas, Offset p1, Offset p2, Color color) {
    final paint = Paint()..color = color..strokeWidth = 1;
    const dashWidth = 5.0;
    const dashSpace = 3.0;
    double currentDist = 0;
    final totalDist = (p2 - p1).distance;
    final dir = (p2 - p1) / totalDist;

    while (currentDist < totalDist) {
      canvas.drawLine(
        p1 + dir * currentDist,
        p1 + dir * min(currentDist + dashWidth, totalDist),
        paint,
      );
      currentDist += dashWidth + dashSpace;
    }
  }

  @override
  bool shouldRepaint(covariant OpticsPainter oldDelegate) => true;
}
