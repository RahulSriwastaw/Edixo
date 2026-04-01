import 'package:flutter/material.dart';
import '../../../domain/models/stroke.dart';
import '../../../domain/models/canvas_object_model.dart';
import 'stroke_renderer.dart';

class CanvasPainter extends CustomPainter {
  final List<Stroke> strokes;
  final Stroke? currentStroke;
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
      StrokeRenderer.render(canvas, stroke);
    }

    // 2. Draw finalized objects (shapes, textboxes on annotation layer)
    for (final obj in objects) {
      // TODO: Implement CanvasObjectModel rendering if needed
      // Currently shapes/textboxes might be handled as strokes or individual widgets
    }

    // 3. Draw active stroke (in-progress)
    if (currentStroke != null) {
      StrokeRenderer.render(canvas, currentStroke!);
    }
  }

  @override
  bool shouldRepaint(CanvasPainter oldDelegate) {
    return oldDelegate.strokes != strokes ||
        oldDelegate.currentStroke != currentStroke ||
        oldDelegate.objects != objects;
  }
}
