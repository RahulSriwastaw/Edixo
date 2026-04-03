import 'package:flutter/material.dart';
import '../../../data/models/stroke_model.dart';
import '../../../domain/models/canvas_object_model.dart';
import 'stroke_renderer.dart';

class CanvasPainter extends CustomPainter {
  final List<StrokeModel> strokes;
  final StrokeModel? currentStroke;
  final List<CanvasObjectModel> objects;

  const CanvasPainter({
    required this.strokes,
    this.currentStroke,
    required this.objects,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // 1. Draw finalized strokes
    for (final stroke in strokes) {
      StrokeRenderer.drawStroke(canvas, stroke);
    }

    // 2. Draw finalized objects (shapes, textboxes on annotation layer)
    for (final obj in objects) {
      // TODO: Implement CanvasObjectModel rendering if needed
      // Currently shapes/textboxes might be handled as strokes or individual widgets
    }

    // 3. Draw active stroke (in-progress)
    if (currentStroke != null) {
      StrokeRenderer.drawStroke(canvas, currentStroke!);
    }
  }

  @override
  bool shouldRepaint(CanvasPainter oldDelegate) {
    return oldDelegate.strokes != strokes ||
        oldDelegate.currentStroke != currentStroke ||
        oldDelegate.objects != objects;
  }
}
