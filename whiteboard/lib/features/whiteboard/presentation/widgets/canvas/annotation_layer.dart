import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../domain/models/stroke.dart';
import '../../../providers/canvas_provider.dart';
import '../../../providers/tool_provider.dart';
import '../drawing/canvas_painter.dart';

class AnnotationLayer extends ConsumerStatefulWidget {
  const AnnotationLayer({super.key});

  @override
  ConsumerState<AnnotationLayer> createState() => _AnnotationLayerState();
}

class _AnnotationLayerState extends ConsumerState<AnnotationLayer> {
  final List<StrokePoint> _currentPoints = [];
  bool _isDrawing = false;
  String? _activeStrokeId;

  void _onPointerDown(PointerDownEvent event, ToolState toolState) {
    if (toolState.interactionMode != InteractionMode.drawMode) return;
    if (toolState.activeTool == Tool.navigate || toolState.activeTool == Tool.select) return;

    setState(() {
      _isDrawing = true;
      _activeStrokeId = DateTime.now().millisecondsSinceEpoch.toString();
      _currentPoints.clear();
      _currentPoints.add(StrokePoint(
        event.localPosition.dx,
        event.localPosition.dy,
        pressure: event.pressure,
      ));
    });
  }

  void _onPointerMove(PointerMoveEvent event, ToolState toolState) {
    if (!_isDrawing) return;

    setState(() {
      _currentPoints.add(StrokePoint(
        event.localPosition.dx,
        event.localPosition.dy,
        pressure: event.pressure,
      ));
    });
  }

  void _onPointerUp(PointerUpEvent event, ToolState toolState) {
    if (!_isDrawing) return;

    final canvasNotifier = ref.read(canvasStateProvider.notifier);
    final settings = toolState.currentSettings;

    if (_currentPoints.isNotEmpty) {
      final stroke = Stroke(
        id: _activeStrokeId!,
        points: List.from(_currentPoints),
        color: settings.color,
        thickness: settings.strokeWidth,
        opacity: settings.opacity,
        type: toolState.activeTool,
        isFilled: settings.isFilled,
      );
      canvasNotifier.addStroke(stroke);
    }

    setState(() {
      _isDrawing = false;
      _currentPoints.clear();
      _activeStrokeId = null;
    });
  }

  void _onPointerCancel(PointerCancelEvent event, ToolState toolState) {
    setState(() {
      _isDrawing = false;
      _currentPoints.clear();
      _activeStrokeId = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    final canvasState = ref.watch(canvasStateProvider);
    final toolState = ref.watch(toolProvider);
    final settings = toolState.currentSettings;

    // Use local state for in-progress stroke to ensure 60fps
    Stroke? currentStroke;
    if (_isDrawing && _activeStrokeId != null) {
      currentStroke = Stroke(
        id: _activeStrokeId!,
        points: _currentPoints,
        color: settings.color,
        thickness: settings.strokeWidth,
        opacity: settings.opacity,
        type: toolState.activeTool,
        isFilled: settings.isFilled,
      );
    }

    // Ignore gestures if in selectMode to allow widgets below to catch them
    final ignoreGestures = toolState.interactionMode == InteractionMode.selectMode;

    return IgnorePointer(
      ignoring: ignoreGestures,
      child: Listener(
        onPointerDown: (event) => _onPointerDown(event, toolState),
        onPointerMove: (event) => _onPointerMove(event, toolState),
        onPointerUp: (event) => _onPointerUp(event, toolState),
        onPointerCancel: (event) => _onPointerCancel(event, toolState),
        child: RepaintBoundary(
          child: CustomPaint(
            painter: CanvasPainter(
              strokes: canvasState.currentPage.strokes,
              currentStroke: currentStroke,
              objects: canvasState.currentPage.objects,
            ),
            child: const SizedBox.expand(),
          ),
        ),
      ),
    );
  }
}
