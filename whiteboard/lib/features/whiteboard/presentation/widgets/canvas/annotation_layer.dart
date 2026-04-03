import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';
import '../../../data/models/stroke_model.dart';
import '../../../data/models/canvas_object_model.dart';
import '../../providers/canvas_provider.dart';
import '../../providers/tool_provider.dart';
import '../../providers/session_provider.dart';
import '../drawing/stroke_renderer.dart';

class AnnotationLayer extends ConsumerStatefulWidget {
  const AnnotationLayer({super.key});

  @override
  ConsumerState<AnnotationLayer> createState() => _AnnotationLayerState();
}

class _AnnotationLayerState extends ConsumerState<AnnotationLayer> {
  final List<Offset> _currentPoints = [];
  bool _isDrawing = false;
  late String _activeStrokeId;

  void _onPointerDown(PointerDownEvent event) {
    final toolState = ref.read(toolNotifierProvider);
    
    // Only allow drawing in draw mode with a drawing tool
    if (toolState.interactionMode != InteractionMode.drawMode) return;
    if (toolState.activeTool == Tool.navigate || toolState.activeTool == Tool.select) return;

    setState(() {
      _isDrawing = true;
      _activeStrokeId = const Uuid().v4();
      _currentPoints.clear();
      _currentPoints.add(event.localPosition);
    });
  }

  void _onPointerMove(PointerMoveEvent event) {
    if (!_isDrawing) return;
    setState(() {
      _currentPoints.add(event.localPosition);
    });
  }

  void _onPointerUp(PointerUpEvent event) {
    if (!_isDrawing || _currentPoints.isEmpty) {
      setState(() {
        _isDrawing = false;
        _currentPoints.clear();
      });
      return;
    }

    final toolState = ref.read(toolNotifierProvider);
    final canvasNotifier = ref.read(canvasNotifierProvider.notifier);
    final sessionNotifier = ref.read(sessionNotifierProvider.notifier);

    // Create stroke with Phase 0 model
    final stroke = StrokeModel(
      id: _activeStrokeId,
      points: List.from(_currentPoints),
      colorARGB: toolState.color.value,
      strokeWidth: toolState.strokeWidth,
      type: _mapToolToStrokeType(toolState.activeTool),
      opacity: toolState.opacity,
      slideId: '', // Will be set by canvasProvider context
    );

    // Apply stroke to canvas
    canvasNotifier.endStroke();
    
    // Mark session as dirty for auto-save
    sessionNotifier.markDirty();

    setState(() {
      _isDrawing = false;
      _currentPoints.clear();
    });
  }

  StrokeType _mapToolToStrokeType(Tool tool) {
    return switch (tool) {
      Tool.softPen      => StrokeType.softPen,
      Tool.hardPen      => StrokeType.hardPen,
      Tool.highlighter  => StrokeType.highlighter,
      Tool.chalk        => StrokeType.chalk,
      Tool.calligraphy  => StrokeType.calligraphy,
      Tool.spray        => StrokeType.spray,
      Tool.laserPointer => StrokeType.laserPointer,
      _                 => StrokeType.softPen,
    };
  }

  @override
  Widget build(BuildContext context) {
    final canvasState = ref.watch(canvasNotifierProvider);
    final toolState = ref.watch(toolNotifierProvider);

    // Current in-progress stroke for 60fps local feedback
    StrokeModel? currentStroke;
    if (_isDrawing && _currentPoints.isNotEmpty) {
      currentStroke = StrokeModel(
        id: _activeStrokeId,
        points: _currentPoints,
        colorARGB: toolState.color.value,
        strokeWidth: toolState.strokeWidth,
        type: _mapToolToStrokeType(toolState.activeTool),
        opacity: toolState.opacity,
        slideId: '',
      );
    }

    return Listener(
      onPointerDown: _onPointerDown,
      onPointerMove: _onPointerMove,
      onPointerUp: _onPointerUp,
      child: RepaintBoundary(
        child: CustomPaint(
          painter: AnnotationPainter(
            strokes: [...canvasState.strokes, if (currentStroke != null) currentStroke],
            objects: canvasState.objects,
          ),
          child: const SizedBox.expand(),
        ),
      ),
    );
  }
}

// ── Painter for strokes and objects ────────────────────────────────────────

class AnnotationPainter extends CustomPainter {
  final List<StrokeModel> strokes;
  final List<CanvasObjectModel> objects;

  AnnotationPainter({required this.strokes, required this.objects});

  @override
  void paint(Canvas canvas, Size size) {
    // Draw all strokes
    for (final stroke in strokes) {
      _drawStroke(canvas, stroke);
    }

    // Draw all objects (shapes, textboxes, etc.)
    for (final obj in objects) {
      _drawObject(canvas, obj);
    }
  }

  void _drawStroke(Canvas canvas, StrokeModel stroke) {
    // Use StrokeRenderer for proper pen type rendering
    StrokeRenderer.drawStroke(canvas, stroke);
  }

  void _drawObject(Canvas canvas, CanvasObjectModel obj) {
    final rect = Rect.fromLTWH(obj.x, obj.y, obj.width, obj.height);
    final paint = Paint()
      ..color = obj.fillColor.withOpacity(obj.opacity)
      ..style = PaintingStyle.fill;

    final borderPaint = Paint()
      ..color = obj.borderColor.withOpacity(obj.opacity)
      ..strokeWidth = obj.borderWidth
      ..style = PaintingStyle.stroke;

    // Draw object based on type
    switch (obj.type) {
      case ObjectType.rectangle:
        canvas.drawRect(rect, paint);
        if (obj.borderWidth > 0) canvas.drawRect(rect, borderPaint);

      case ObjectType.roundedRect:
        final rrect = RRect.fromRectAndRadius(rect, Radius.circular(obj.height * 0.1));
        canvas.drawRRect(rrect, paint);
        if (obj.borderWidth > 0) canvas.drawRRect(rrect, borderPaint);

      case ObjectType.circle:
        final center = Offset(obj.x + obj.width / 2, obj.y + obj.height / 2);
        final radius = (obj.width + obj.height) / 4;
        canvas.drawCircle(center, radius, paint);
        if (obj.borderWidth > 0) {
          canvas.drawCircle(center, radius, borderPaint);
        }

      case ObjectType.line:
        canvas.drawLine(
          Offset(obj.x, obj.y),
          Offset(obj.x + obj.width, obj.y + obj.height),
          borderPaint..style = PaintingStyle.stroke,
        );

      case ObjectType.triangle:
        final path = Path()
          ..moveTo(obj.x + obj.width / 2, obj.y)
          ..lineTo(obj.x + obj.width, obj.y + obj.height)
          ..lineTo(obj.x, obj.y + obj.height)
          ..close();
        canvas.drawPath(path, paint);
        if (obj.borderWidth > 0) canvas.drawPath(path, borderPaint);

      default:
        // Render as rectangle for unknown types
        canvas.drawRect(rect, paint);
        if (obj.borderWidth > 0) canvas.drawRect(rect, borderPaint);
    }
  }

  @override
  bool shouldRepaint(AnnotationPainter oldDelegate) {
    // Use reference equality to ensure repaints only when actually needed
    return identical(strokes, oldDelegate.strokes) == false ||
        identical(objects, oldDelegate.objects) == false;
  }
}
