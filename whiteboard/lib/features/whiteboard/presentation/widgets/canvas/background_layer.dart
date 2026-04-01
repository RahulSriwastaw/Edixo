import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../providers/canvas_provider.dart';

class BackgroundLayer extends ConsumerWidget {
  const BackgroundLayer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final canvasState = ref.watch(canvasStateProvider);
    final currentPage = canvasState.currentPage;

    return Container(
      color: currentPage.backgroundColor,
      child: CustomPaint(
        painter: TemplatePainter(
          template: currentPage.template,
          showGrid: canvasState.showGrid,
        ),
        child: const SizedBox.expand(),
      ),
    );
  }
}

class TemplatePainter extends CustomPainter {
  final PageTemplate template;
  final bool showGrid;

  TemplatePainter({required this.template, required this.showGrid});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.black.withOpacity(0.05)
      ..strokeWidth = 1.0;

    // 1. Draw Global Grid if enabled
    if (showGrid) {
      final gridPaint = Paint()
        ..color = Colors.black12
        ..strokeWidth = 1.0;
      _drawGrid(canvas, size, 40.0, gridPaint);
    }

    // 2. Draw Template-specific patterns
    switch (template) {
      case PageTemplate.ruled:
        _drawRuled(canvas, size, 40.0, paint);
        break;
      case PageTemplate.grid:
        _drawGrid(canvas, size, 40.0, paint);
        break;
      case PageTemplate.dotGrid:
        _drawDotGrid(canvas, size, 40.0, paint);
        break;
      case PageTemplate.mathGrid:
        _drawGrid(canvas, size, 20.0, paint);
        break;
      case PageTemplate.blank:
        break;
    }
  }

  void _drawRuled(Canvas canvas, Size size, double gap, Paint paint) {
    for (double y = gap; y < size.height; y += gap) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  void _drawGrid(Canvas canvas, Size size, double gap, Paint paint) {
    for (double x = 0; x < size.width; x += gap) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y < size.height; y += gap) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  void _drawDotGrid(Canvas canvas, Size size, double gap, Paint paint) {
    for (double x = gap; x < size.width; x += gap) {
      for (double y = gap; y < size.height; y += gap) {
        canvas.drawCircle(Offset(x, y), 1.0, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant TemplatePainter oldDelegate) =>
      oldDelegate.template != template || oldDelegate.showGrid != showGrid;
}
