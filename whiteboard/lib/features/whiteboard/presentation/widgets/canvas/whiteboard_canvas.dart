import 'dart:math' as math;
import 'dart:convert';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../core/theme/app_theme.dart';
import '../../providers/canvas_provider.dart';
import '../../providers/tool_provider.dart';
import '../../utils/smooth_pen.dart';
import 'package:eduhub_whiteboard/features/ai/presentation/widgets/ai_assistant_panel.dart';
import 'package:flutter/scheduler.dart';
import 'slide_content_layer.dart';

StrokeType _mapShapeToStroke(ShapeType? shape) {
  if (shape == null) return StrokeType.rectangle;
  switch (shape) {
    case ShapeType.rectangle: return StrokeType.rectangle;
    case ShapeType.circle: return StrokeType.circle;
    case ShapeType.triangle: return StrokeType.triangle;
    case ShapeType.arrow: return StrokeType.arrow;
    case ShapeType.line: return StrokeType.line;
    case ShapeType.star: return StrokeType.star;
    case ShapeType.roundedRect: return StrokeType.roundedRect;
    case ShapeType.callout: return StrokeType.callout;
    case ShapeType.polygon: return StrokeType.polygon;
    case ShapeType.doubleArrow: return StrokeType.doubleArrow;
  }
}

class WhiteboardCanvas extends ConsumerStatefulWidget {
  final bool isMainCanvas;
  final VoidCallback? onDrawingStart;
  final VoidCallback? onDrawingEnd;

  const WhiteboardCanvas({
    super.key,
    this.isMainCanvas = true,
    this.onDrawingStart,
    this.onDrawingEnd,
  });

  @override
  ConsumerState<WhiteboardCanvas> createState() => _WhiteboardCanvasState();
}

class _WhiteboardCanvasState extends ConsumerState<WhiteboardCanvas> {
  final List<StrokePoint> _currentPoints = [];
  bool _isDrawing = false;
  Rect? selectionBounds;
  final TransformationController _transformController = TransformationController();

  static const double _canvasWidth = 1920; 
  static const double _canvasHeight = 1080;

  @override
  void dispose() {
    _transformController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final canvasState = ref.watch(canvasStateProvider);
    final toolState = ref.watch(toolProvider);
    final toolNotifier = ref.read(toolProvider.notifier);
    final canvasNotifier = ref.read(canvasStateProvider.notifier);

    final hideBg = toolState.activeTool == ToolType.select;

    return LayoutBuilder(
      builder: (context, constraints) {
        return ClipRect(
          child: Container(
            color: const Color(0xFF0D0D0D),
            child: Stack(
              children: [
                InteractiveViewer(
                  transformationController: _transformController,
                  boundaryMargin: const EdgeInsets.all(500),
                  minScale: 0.25,
                  maxScale: 4.0,
                  panEnabled: !_isDrawing,
                  scaleEnabled: !_isDrawing,
                  child: Listener(
                    onPointerDown: (event) => _onPointerDown(event, toolState),
                    onPointerMove: (event) => _onPointerMove(event, toolState),
                    onPointerUp: (event) => _onPointerUp(event, toolState),
                    onPointerCancel: (event) => _onPointerUp(event, toolState),
                    child: Container(
                      width: _canvasWidth,
                      height: _canvasHeight,
                      color: canvasState.backgroundColor,
                      child: Stack(
                         children: [
                            // 1. Background Image Layer
                            FutureBuilder<ui.Image?>(
                              future: _decodeBgImage(canvasState.currentPage.bgImageBytes),
                              builder: (context, snapshot) {
                                if (snapshot.data == null) return const SizedBox.shrink();
                                return CustomPaint(
                                  painter: _BackgroundImagePainter(snapshot.data!),
                                  child: const SizedBox.expand(),
                                );
                              },
                            ),

                            // 2. Slide Content Layer (PRD 15.1)
                            if (canvasState.currentPage.question != null)
                              const SlideContentLayer(),

                            // 3. Drawing / Annotation Layer
                            RepaintBoundary(
                              key: widget.isMainCanvas ? ref.watch(canvasBoundaryKeyProvider) : null,
                              child: CustomPaint(
                                key: ValueKey('painter_${canvasState.currentPageIndex}_${canvasState.currentPage.bgImageBytes.hashCode}'),
                                painter: CanvasPainter(
                                  strokes: canvasState.currentPage.strokes,
                                  currentPoints: _currentPoints,
                                  currentTool: toolState.activeTool,
                                  currentColor: toolState.currentSettings.color,
                                  currentThickness: toolState.currentSettings.thickness,
                                  currentOpacity: toolState.currentSettings.opacity,
                                  currentShapeType: toolState.currentSettings.shapeType,
                                  currentIsFilled: toolState.currentSettings.isFilled,
                                  smoothingSettings: toolState.currentSettings.smoothing,
                                  template: canvasState.currentPage.template,
                                  questionTheme: canvasState.questionTheme,
                                  bgImage: null, // Separated now
                                ),
                                child: const SizedBox.expand(),
                              ),
                            ),
                         ],
                      ),
                    ),
                  ),
                ),
                
                // Laser Pointer Overlay
                if (toolState.activeTool == ToolType.laserPointer)
                  const LaserPointerLayer(),
                
                // Selection controls
                if (selectionBounds != null && toolState.activeTool == ToolType.select)
                  _buildSelectionMenu(context, toolNotifier, canvasNotifier),
              ],
            ),
          ),
        );
      },
    );
  }

  // ── Handlers ─────────────────────────────────────────────────────────────

  void _onPointerDown(PointerDownEvent event, ToolState toolState) {
    if (toolState.activeTool == ToolType.navigate) return;
    if (toolState.activeTool == ToolType.laserPointer) return;

    setState(() {
      _isDrawing = true;
      _currentPoints.add(StrokePoint(event.localPosition.dx, event.localPosition.dy, pressure: event.pressure));
    });
    widget.onDrawingStart?.call();
  }

  void _onPointerMove(PointerMoveEvent event, ToolState toolState) {
    if (!_isDrawing) return;
    setState(() {
      _currentPoints.add(StrokePoint(event.localPosition.dx, event.localPosition.dy, pressure: event.pressure));
      
      if (toolState.activeTool == ToolType.select) {
        // Handle lasso or box selection expansion
      }
    });
  }

  void _onPointerUp(PointerUpEvent event, ToolState toolState) {
    if (!_isDrawing) return;

    final canvasNotifier = ref.read(canvasStateProvider.notifier);
    
    // Convert to finalized stroke
    if (_currentPoints.isNotEmpty) {
      final stroke = Stroke(
        id: DateTime.now().millisecondsSinceEpoch.toString(),
        points: List.from(_currentPoints),
        color: toolState.currentSettings.color,
        thickness: toolState.currentSettings.thickness,
        opacity: toolState.currentSettings.opacity,
        type: _mapToolToStroke(toolState.activeTool, toolState.currentSettings.shapeType),
        isFilled: toolState.currentSettings.isFilled,
      );
      canvasNotifier.addStroke(stroke);
    }

    setState(() {
      _isDrawing = false;
      _currentPoints.clear();
    });
    widget.onDrawingEnd?.call();
  }

  StrokeType _mapToolToStroke(ToolType tool, ShapeType? shape) {
    switch (tool) {
      case ToolType.softPen: return StrokeType.softPen;
      case ToolType.hardPen: return StrokeType.hardPen;
      case ToolType.highlighter: return StrokeType.highlighter;
      case ToolType.chalk: return StrokeType.chalk;
      case ToolType.spray: return StrokeType.spray;
      case ToolType.calligraphy: return StrokeType.calligraphy;
      case ToolType.softEraser: return StrokeType.softEraser;
      case ToolType.hardEraser: return StrokeType.hardEraser;
      case ToolType.rectangle: return _mapShapeToStroke(shape);
      default: return StrokeType.softPen;
    }
  }

  Future<ui.Image?> _decodeBgImage(Uint8List? bytes) async {
    if (bytes == null) return null;
    final codec = await ui.instantiateImageCodec(bytes);
    final frame = await codec.getNextFrame();
    return frame.image;
  }

  Widget _buildSelectionMenu(BuildContext context, ToolStateNotifier toolNotifier, CanvasStateNotifier canvasNotifier) {
    return Positioned(
      top: 20,
      left: MediaQuery.of(context).size.width / 2 - 50,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 8.h),
        decoration: BoxDecoration(
          color: const Color(0xFF2D2D3A),
          borderRadius: BorderRadius.circular(20),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.3), blurRadius: 10)],
          border: Border.all(color: AppTheme.primaryOrange.withOpacity(0.5)),
        ),
        child: Row(
          children: [
            IconButton(icon: const Icon(Icons.delete, color: Colors.white70), onPressed: () {
              canvasNotifier.deleteSelection();
              setState(() => selectionBounds = null);
            }),
            IconButton(icon: const Icon(Icons.close, color: Colors.white70), onPressed: () {
              canvasNotifier.clearSelection();
              setState(() => selectionBounds = null);
            }),
          ],
        ),
      ),
    );
  }
}

// ─── Support Painters ──────────────────────────────────────────────────────

class _BackgroundImagePainter extends CustomPainter {
  final ui.Image image;
  _BackgroundImagePainter(this.image);
  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawImageRect(
      image,
      Rect.fromLTWH(0, 0, image.width.toDouble(), image.height.toDouble()),
      Rect.fromLTWH(0, 0, size.width, size.height),
      Paint()..filterQuality = ui.FilterQuality.high,
    );
  }
  @override
  bool shouldRepaint(covariant _BackgroundImagePainter old) => image != old.image;
}

class CanvasPainter extends CustomPainter {
  final List<Stroke> strokes;
  final List<StrokePoint> currentPoints;
  final ToolType currentTool;
  final Color currentColor;
  final double currentThickness;
  final double currentOpacity;
  final ShapeType? currentShapeType;
  final bool currentIsFilled;
  final SmoothingSettings smoothingSettings;
  final PageTemplate template;
  final QuestionTheme questionTheme;
  final ui.Image? bgImage; // Keeping for compatibility in _drawStroke

  CanvasPainter({
    required this.strokes,
    required this.currentPoints,
    required this.currentTool,
    required this.currentColor,
    required this.currentThickness,
    required this.currentOpacity,
    required this.currentShapeType,
    required this.currentIsFilled,
    required this.smoothingSettings,
    required this.template,
    required this.questionTheme,
    this.bgImage,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // 1. Template Grid
    _drawTemplate(canvas, size);

    // 2. Finalized Strokes
    for (final stroke in strokes) {
      _drawStroke(canvas, stroke);
    }

    // 3. Current Active Stroke
    if (currentPoints.isNotEmpty) {
      StrokeType tempType = StrokeType.softPen;
      if (currentTool == ToolType.highlighter) tempType = StrokeType.highlighter;
      else if (currentTool == ToolType.softEraser) tempType = StrokeType.softEraser;
      else if (currentTool == ToolType.rectangle) tempType = _mapShapeToStroke(currentShapeType);
      else if (currentTool == ToolType.chalk) tempType = StrokeType.chalk;
      else if (currentTool == ToolType.spray) tempType = StrokeType.spray;
      else if (currentTool == ToolType.calligraphy) tempType = StrokeType.calligraphy;
      
      final inProgress = Stroke(
        id: 'current',
        points: currentPoints,
        color: currentColor,
        thickness: currentThickness,
        opacity: currentOpacity,
        type: tempType,
        isFilled: currentIsFilled,
      );
      _drawStroke(canvas, inProgress);
    }
  }

  void _drawStroke(Canvas canvas, Stroke stroke) {
    if (stroke.points.isEmpty) return;

    final paint = Paint()
      ..style = stroke.isFilled ? PaintingStyle.fill : PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..color = stroke.color.withOpacity(stroke.opacity)
      ..strokeWidth = stroke.thickness;

    if (stroke.type == StrokeType.chalk) {
      _drawChalk(canvas, stroke);
      return;
    }
    if (stroke.type == StrokeType.spray) {
      _drawSpray(canvas, stroke);
      return;
    }

    if (stroke.type == StrokeType.softPen || 
        stroke.type == StrokeType.hardPen || 
        stroke.type == StrokeType.highlighter || 
        stroke.type == StrokeType.calligraphy) {
      
      final decimated = decimate(stroke.points, minDist: smoothingSettings.decimationThreshold);
      final path = catmullRomPath(decimated, tension: 0.5);
      
      if (stroke.type == StrokeType.highlighter) {
        paint.color = paint.color.withOpacity(stroke.opacity * 0.4);
        paint.blendMode = BlendMode.multiply;
      }
      
      if (stroke.type == StrokeType.calligraphy) {
        _drawCalligraphy(canvas, stroke, path);
        return;
      }

      canvas.drawPath(path, paint);
      return;
    }

    // Default: draw as path for erasers or other
    final path = catmullRomPath(stroke.points, tension: 0.5);
    canvas.drawPath(path, paint);
  }

  void _drawTemplate(Canvas canvas, Size size) {
     if (template == PageTemplate.blank) return;
     final paint = Paint()..color = Colors.white10..strokeWidth = 1.0;
     if (template == PageTemplate.ruled) {
        for (double y = 40; y < size.height; y += 40) {
           canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
        }
     }
  }

  void _drawChalk(Canvas canvas, Stroke stroke) {
    final random = math.Random(stroke.id.hashCode);
    final paint = Paint()..color = stroke.color.withOpacity(stroke.opacity);
    for (final p in stroke.points) {
      canvas.drawCircle(Offset(p.x, p.y), stroke.thickness / 3, paint);
      for (int i = 0; i < 3; i++) {
        final ox = (random.nextDouble() - 0.5) * stroke.thickness * 1.5;
        final oy = (random.nextDouble() - 0.5) * stroke.thickness * 1.5;
        canvas.drawCircle(Offset(p.x + ox, p.y + oy), random.nextDouble() * 1.5, paint..opacity = 0.4);
      }
    }
  }

  void _drawSpray(Canvas canvas, Stroke stroke) {
    final random = math.Random(stroke.id.hashCode);
    final paint = Paint()..color = stroke.color.withOpacity(stroke.opacity);
    for (final p in stroke.points) {
      for (int i = 0; i < 8; i++) {
        final dist = random.nextDouble() * stroke.thickness;
        final angle = random.nextDouble() * 2 * math.pi;
        canvas.drawCircle(
          Offset(p.x + math.cos(angle) * dist, p.y + math.sin(angle) * dist),
          random.nextDouble() * 1.2,
          paint..opacity = random.nextDouble() * 0.5,
        );
      }
    }
  }

  void _drawCalligraphy(Canvas canvas, Stroke stroke, ui.Path path) {
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.butt
      ..color = stroke.color.withOpacity(stroke.opacity)
      ..strokeWidth = stroke.thickness;
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CanvasPainter old) => true;
}

// ─── Laser Pointer Layer ──────────────────────────────────────────────────
class LaserPointerLayer extends StatefulWidget {
  const LaserPointerLayer({super.key});
  @override
  State<LaserPointerLayer> createState() => _LaserPointerLayerState();
}

class _LaserPointerLayerState extends State<LaserPointerLayer> with SingleTickerProviderStateMixin {
  final List<_LaserPoint> _points = [];
  late final Ticker _ticker;

  @override
  void initState() {
    super.initState();
    _ticker = createTicker((elapsed) {
      final now = DateTime.now();
      setState(() {
        _points.removeWhere((p) => now.difference(p.time).inMilliseconds > 1500);
      });
    })..start();
  }

  @override
  Widget build(BuildContext context) {
    return Listener(
      onPointerMove: (e) {
        setState(() => _points.add(_LaserPoint(e.localPosition, DateTime.now())));
      },
      child: CustomPaint(
        painter: _LaserPainter(_points),
        child: const SizedBox.expand(),
      ),
    );
  }

  @override
  void dispose() {
    _ticker.dispose();
    super.dispose();
  }
}

class _LaserPoint {
  final Offset pos;
  final DateTime time;
  _LaserPoint(this.pos, this.time);
}

class _LaserPainter extends CustomPainter {
  final List<_LaserPoint> points;
  _LaserPainter(this.points);
  @override
  void paint(Canvas canvas, Size size) {
    if (points.isEmpty) return;
    final now = DateTime.now();
    for (final p in points) {
        final elapsed = now.difference(p.time).inMilliseconds;
        final opacity = (1.0 - (elapsed / 1500.0)).clamp(0.0, 1.0);
        final paint = Paint()
          ..color = Colors.red.withOpacity(opacity)
          ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 4);
        canvas.drawCircle(p.pos, 5.0 * opacity, paint);
    }
  }
  @override
  bool shouldRepaint(covariant _LaserPainter old) => true;
}
