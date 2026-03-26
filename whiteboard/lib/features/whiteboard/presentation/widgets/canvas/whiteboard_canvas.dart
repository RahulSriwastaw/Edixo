import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:eduhub_whiteboard/core/theme/app_theme.dart';
import 'package:eduhub_whiteboard/features/whiteboard/providers/canvas_provider.dart';
import 'package:eduhub_whiteboard/features/drawing/providers/tool_provider.dart';
import 'package:eduhub_whiteboard/features/drawing/domain/models/drawing_tool.dart';
import 'dart:math' as math;
import 'package:perfect_freehand/perfect_freehand.dart' as pf;
import 'dart:convert';
import 'dart:ui' as ui;
import 'package:eduhub_whiteboard/features/drawing/domain/models/pen_smoothing_engine.dart';
import 'package:eduhub_whiteboard/features/subjects/math/presentation/widgets/shape_3d_painter.dart';
import 'package:eduhub_whiteboard/features/ai/presentation/widgets/ai_assistant_panel.dart';

StrokeType _mapShapeToStroke(ShapeType? shape) {
  if (shape == null) return StrokeType.rectangle;
  switch (shape) {
    case ShapeType.line: return StrokeType.line;
    case ShapeType.arrow: return StrokeType.arrow;
    case ShapeType.rectangle: return StrokeType.rectangle;
    case ShapeType.roundedRectangle: return StrokeType.roundedRectangle;
    case ShapeType.circle: return StrokeType.circle;
    case ShapeType.ellipse: return StrokeType.ellipse;
    case ShapeType.triangle: return StrokeType.triangle;
    case ShapeType.diamond: return StrokeType.diamond;
    case ShapeType.speechBubble: return StrokeType.speechBubble;
    case ShapeType.polygon: return StrokeType.polygon;
    default: return StrokeType.rectangle;
  }
}

class WhiteboardCanvas extends ConsumerStatefulWidget {
  final bool isMainCanvas;
  const WhiteboardCanvas({super.key, this.isMainCanvas = true});

  @override
  ConsumerState<WhiteboardCanvas> createState() => _WhiteboardCanvasState();
}

class _WhiteboardCanvasState extends ConsumerState<WhiteboardCanvas> {
  final TransformationController _transformController = TransformationController();
  List<StrokePoint> _currentPoints = [];
  bool _isDrawing = false;
  bool _isMovingSelection = false;
  int? _activePointerId;
  final Set<int> _activePointers = {};
  int _maxPointersInSequence = 0;
  DateTime? _sequenceStartTime;

  static const double _canvasWidth = 4000;
  static const double _canvasHeight = 3000;

  @override
  Widget build(BuildContext context) {
    final canvasState = ref.watch(canvasStateProvider);
    final drawingState = ref.watch(drawingStateProvider);
    final hideBg = ref.watch(hideCanvasBackgroundProvider);

    return ClipRect(
      child: Focus(
        autofocus: true,
        onKeyEvent: (node, event) {
          if (event is KeyDownEvent) {
            final isCtrl = HardwareKeyboard.instance.isControlPressed;
            if (isCtrl && event.logicalKey == LogicalKeyboardKey.keyZ) {
              ref.read(canvasStateProvider.notifier).undo();
              return KeyEventResult.handled;
            }
            if (isCtrl && event.logicalKey == LogicalKeyboardKey.keyY) {
              ref.read(canvasStateProvider.notifier).redo();
              return KeyEventResult.handled;
            }
            if (isCtrl && event.logicalKey == LogicalKeyboardKey.keyS) {
              ref.read(canvasStateProvider.notifier).save();
              return KeyEventResult.handled;
            }
          }
          return KeyEventResult.ignored;
        },
        child: LayoutBuilder(
          builder: (context, constraints) {
            final selectedStrokes = canvasState.currentPage.strokes.where((s) => s.isSelected).toList();
            Rect? selectionBounds;
            if (selectedStrokes.isNotEmpty) {
              double minX = double.infinity, minY = double.infinity, maxX = -double.infinity, maxY = -double.infinity;
              for (var s in selectedStrokes) {
                for (var p in s.points) {
                  if (p.x < minX) minX = p.x;
                  if (p.x > maxX) maxX = p.x;
                  if (p.y < minY) minY = p.y;
                  if (p.y > maxY) maxY = p.y;
                }
              }
              if (minX != double.infinity) {
                selectionBounds = Rect.fromLTRB(minX, minY, maxX, maxY);
              }
            }

            return Stack(
              children: [
                InteractiveViewer(
                  transformationController: _transformController,
                  boundaryMargin: const EdgeInsets.all(500),
                  minScale: 0.25,
                  maxScale: 4.0,
                  panEnabled: !_isDrawing,
                  scaleEnabled: !_isDrawing,
                  child: Listener(
                    onPointerDown: (event) => _onPointerDown(event, drawingState),
                    onPointerMove: (event) => _onPointerMove(event, drawingState),
                    onPointerUp: (event) => _onPointerUp(event, drawingState),
                    onPointerCancel: (event) => _onPointerUp(event, drawingState),
                    child: Container(
                      width: _canvasWidth,
                      height: _canvasHeight,
                      color: canvasState.backgroundColor,
                      child: RepaintBoundary(
                        key: widget.isMainCanvas ? ref.watch(canvasBoundaryKeyProvider) : null,
                        child: FutureBuilder<ui.Image?>(
                          future: _decodeBgImage(canvasState.currentPage.bgImageBytes),
                          builder: (context, snapshot) {
                            return CustomPaint(
                              painter: CanvasPainter(
                                strokes: canvasState.currentPage.strokes,
                                currentPoints: _currentPoints,
                                currentTool: drawingState.activeTool,
                                currentColor: drawingState.currentSettings.color,
                                currentThickness: drawingState.currentSettings.thickness,
                                currentOpacity: drawingState.currentSettings.opacity,
                                currentShapeType: drawingState.currentSettings.shapeType,
                                currentIsFilled: drawingState.currentSettings.isFilled,
                                template: canvasState.currentPage.template,
                                bgImage: hideBg ? null : snapshot.data,
                              ),
                              child: const SizedBox(width: _canvasWidth, height: _canvasHeight),
                            );
                          },
                        ),
                      ),
                    ),
                  ),
                ),
                // Floating Action Buttons for selection
                if (selectionBounds != null && drawingState.activeTool == ToolType.lasso)
                  Positioned(
                    top: 20,
                    left: MediaQuery.of(context).size.width / 2 - 50,
                    child: Container(
                      padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 8.h),
                      decoration: BoxDecoration(
                        color: const Color(0xFF2D2D3A),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(color: Colors.black.withOpacity(0.3), blurRadius: 10, offset: const Offset(0, 4)),
                        ],
                        border: Border.all(color: AppTheme.primaryOrange.withOpacity(0.5)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          _selectionAction(Icons.auto_awesome, 'Ask AI', () {
                            ref.read(aiSelectedContextProvider.notifier).state = "Selected Content";
                            ref.read(aiPanelOpenProvider.notifier).state = true;
                          }),
                          SizedBox(width: 12.w),
                          _selectionAction(Icons.delete_outline, 'Delete', () {
                            ref.read(canvasStateProvider.notifier).deleteSelection();
                          }),
                          SizedBox(width: 12.w),
                          _selectionAction(Icons.close, 'Clear', () {
                            ref.read(canvasStateProvider.notifier).clearSelection();
                          }),
                        ],
                      ),
                    ),
                  ),
              ],
            );
          },
        ),
      ),
    );
  }

  Future<ui.Image?> _decodeBgImage(Uint8List? bytes) async {
    if (bytes == null) return null;
    final completer = Completer<ui.Image>();
    ui.decodeImageFromList(bytes, (image) => completer.complete(image));
    return completer.future;
  }

  Widget _selectionAction(IconData icon, String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: Colors.white, size: 20.w),
          Text(label, style: TextStyle(color: Colors.white, fontSize: 10.sp)),
        ],
      ),
    );
  }

  void _onPointerDown(PointerDownEvent event, DrawingState drawingState) {
    _activePointers.add(event.pointer);

    if (_activePointers.length == 1) {
      _sequenceStartTime = DateTime.now();
      _maxPointersInSequence = 1;
      _activePointerId = event.pointer;
    } else {
      if (_activePointers.length > _maxPointersInSequence) {
        _maxPointersInSequence = _activePointers.length;
      }
      
      // Multi-touch detected! Cancel any active single-finger drawing sequence.
      if (_isDrawing) {
        setState(() {
          _isDrawing = false;
          _currentPoints = [];
        });
      }
      _activePointerId = null;
    }

    if (_activePointerId == null) return;

    if (drawingState.activeTool == ToolType.lasso) {
      final notifier = ref.read(canvasStateProvider.notifier);
      final canvasState = ref.read(canvasStateProvider);
      final selectedStrokes = canvasState.currentPage.strokes.where((s) => s.isSelected).toList();
      
      bool hitSelection = false;
      if (selectedStrokes.isNotEmpty) {
        double minX = double.infinity, minY = double.infinity, maxX = -double.infinity, maxY = -double.infinity;
        for (var s in selectedStrokes) {
          for (var p in s.points) {
            if (p.x < minX) minX = p.x;
            if (p.x > maxX) maxX = p.x;
            if (p.y < minY) minY = p.y;
            if (p.y > maxY) maxY = p.y;
          }
        }
        if (minX != double.infinity) {
          final rect = Rect.fromLTRB(minX, minY, maxX, maxY).inflate(10.0);
          if (rect.contains(event.localPosition)) {
            hitSelection = true;
          }
        }
      }

      if (hitSelection) {
        setState(() {
          _isMovingSelection = true;
        });
      } else {
        notifier.clearSelection();
        setState(() {
          _isDrawing = true;
          _currentPoints = [StrokePoint(event.localPosition.dx, event.localPosition.dy, pressure: event.pressure, time: DateTime.now())];
        });
      }
      return;
    }

    final pos = event.localPosition;
    setState(() {
      _isDrawing = true;
      _currentPoints = [StrokePoint(pos.dx, pos.dy, pressure: event.pressure, time: DateTime.now())];
    });
  }

  void _onPointerMove(PointerMoveEvent event, DrawingState drawingState) {
    if (event.pointer != _activePointerId) return;

    if (drawingState.activeTool == ToolType.lasso && _isMovingSelection) {
      ref.read(canvasStateProvider.notifier).moveSelection(event.delta);
      return;
    }

    if (!_isDrawing) return;
    final pos = event.localPosition;
    setState(() {
      if (drawingState.activeTool == ToolType.shapes || drawingState.activeTool == ToolType.text) {
        if (_currentPoints.isNotEmpty) {
          _currentPoints = [_currentPoints.first, StrokePoint(pos.dx, pos.dy, pressure: event.pressure, time: DateTime.now())];
        }
      } else {
        _currentPoints = [..._currentPoints, StrokePoint(pos.dx, pos.dy, pressure: event.pressure, time: DateTime.now())];
      }
    });
  }

  void _onPointerUp(PointerEvent event, DrawingState drawingState) {
    _activePointers.remove(event.pointer);

    if (_activePointers.isEmpty) {
      // Evaluate multi-finger tap gesture
      if (_sequenceStartTime != null) {
        final duration = DateTime.now().difference(_sequenceStartTime!);
        if (duration.inMilliseconds < 450) { // Fast tap (under 450ms)
          final notifier = ref.read(canvasStateProvider.notifier);
          final canvasState = ref.read(canvasStateProvider);
          if (_maxPointersInSequence == 2 && canvasState.undoHistory.isNotEmpty) {
            notifier.undo();
          } else if (_maxPointersInSequence == 3 && canvasState.redoHistory.isNotEmpty) {
            notifier.redo();
          }
        }
      }
      _maxPointersInSequence = 0;
      _sequenceStartTime = null;
    }

    if (event.pointer != _activePointerId) return;
    _activePointerId = null;

    if (drawingState.activeTool == ToolType.lasso && _isMovingSelection) {
      ref.read(canvasStateProvider.notifier).commitSelectionMove();
      setState(() {
        _isMovingSelection = false;
      });
      return;
    }

    if (drawingState.activeTool == ToolType.lasso && _isDrawing) {
      if (_currentPoints.length > 2) {
        final path = Path()..moveTo(_currentPoints.first.x, _currentPoints.first.y);
        for (int i = 1; i < _currentPoints.length; i++) {
          path.lineTo(_currentPoints[i].x, _currentPoints[i].y);
        }
        path.close();
        ref.read(canvasStateProvider.notifier).selectStrokesInRegion(path);
      }
      setState(() {
        _currentPoints = [];
        _isDrawing = false;
      });
      return;
    }

    if (!_isDrawing || _currentPoints.isEmpty) return;

    final notifier = ref.read(canvasStateProvider.notifier);
    final settings = drawingState.currentSettings;

    if (drawingState.activeTool == ToolType.text) {
      // Just save the box position. We could open a text dialog here, but for now we'll add dummy text to show it works
      // A full implementation would prompt the user for text here
      final stroke = Stroke(
        id: 'stroke_${DateTime.now().millisecondsSinceEpoch}',
        points: List.from(_currentPoints),
        color: settings.color,
        thickness: settings.thickness,
        opacity: settings.opacity,
        type: StrokeType.text,
        text: 'EduHub Text', // Dummy text placeholder
      );
      notifier.addStroke(stroke);

      if (!settings.isLocked) {
        ref.read(drawingStateProvider.notifier).selectTool(ToolType.pen);
      }

      setState(() {
        _currentPoints = [];
        _isDrawing = false;
      });
      return;
    }

    StrokeType strokeType;
    switch (drawingState.activeTool) {
      case ToolType.pencil: strokeType = StrokeType.pencil; break;
      case ToolType.highlighter: strokeType = StrokeType.highlighter; break;
      case ToolType.eraser: strokeType = StrokeType.eraser; break;
      case ToolType.laserPointer: strokeType = StrokeType.laserPointer; break;
      case ToolType.marker: strokeType = StrokeType.marker; break;
      case ToolType.shapes: strokeType = _mapShapeToStroke(settings.shapeType); break;
      default: strokeType = StrokeType.pen;
    }

    final stroke = Stroke(
      id: 'stroke_${DateTime.now().millisecondsSinceEpoch}',
      points: List.from(_currentPoints),
      color: settings.color,
      thickness: settings.thickness,
      opacity: settings.opacity,
      type: strokeType,
      isFilled: settings.isFilled,
    );

    notifier.addStroke(stroke);

    if (!settings.isLocked) {
      ref.read(drawingStateProvider.notifier).selectTool(ToolType.pen);
    }

    setState(() {
      _currentPoints = [];
      _isDrawing = false;
    });
  }

  @override
  void dispose() {
    _transformController.dispose();
    super.dispose();
  }
}

// ─── Canvas Painter ──────────────────────────────────────────────────────────
class CanvasPainter extends CustomPainter {
  final List<Stroke> strokes;
  final List<StrokePoint> currentPoints;
  final ToolType currentTool;
  final Color currentColor;
  final double currentThickness;
  final double currentOpacity;
  final ShapeType? currentShapeType;
  final bool currentIsFilled;
  final PageTemplate template;
  final ui.Image? bgImage;

  CanvasPainter({
    required this.strokes,
    required this.currentPoints,
    required this.currentTool,
    required this.currentColor,
    required this.currentThickness,
    required this.currentOpacity,
    this.currentShapeType,
    this.currentIsFilled = false,
    required this.template,
    this.bgImage,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (bgImage != null) {
      canvas.drawImage(bgImage!, Offset.zero, Paint());
    }
    _drawTemplate(canvas, size);

    for (final stroke in strokes) {
      _drawStroke(canvas, stroke);
    }

    if (currentPoints.length > 1) {
      if (currentTool == ToolType.lasso) {
        final path = Path();
        path.moveTo(currentPoints[0].x, currentPoints[0].y);
        for (int i = 1; i < currentPoints.length; i++) {
          path.lineTo(currentPoints[i].x, currentPoints[i].y);
        }
        final p = Paint()
          ..color = AppTheme.primaryOrange
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2.0;
        canvas.drawPath(path, p);
        final pFill = Paint()
          ..color = AppTheme.primaryOrange.withOpacity(0.1)
          ..style = PaintingStyle.fill;
        canvas.drawPath(path, pFill);
      } else {
        StrokeType tempType = StrokeType.pen;
        if (currentTool == ToolType.highlighter) tempType = StrokeType.highlighter;
        else if (currentTool == ToolType.eraser) tempType = StrokeType.eraser;
        else if (currentTool == ToolType.shapes) tempType = _mapShapeToStroke(currentShapeType);
        else if (currentTool == ToolType.text) tempType = StrokeType.text;

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
  }

  void _drawStroke(Canvas canvas, Stroke stroke) {
    if (stroke.points.isEmpty) return;

    if (stroke.isSelected) {
      double minX = double.infinity, minY = double.infinity, maxX = -double.infinity, maxY = -double.infinity;
      for (var p in stroke.points) {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      }
      if (minX != double.infinity) {
        final rect = Rect.fromLTRB(minX, minY, maxX, maxY).inflate(4.0);
        final boundPaint = Paint()
          ..color = AppTheme.primaryOrange.withOpacity(0.6)
          ..style = PaintingStyle.stroke
          ..strokeWidth = 2.0;
        canvas.drawRect(rect, boundPaint);
      }
    }

    // Use PenSmoothingEngine for freehand strokes
    if (stroke.type == StrokeType.pen ||
        stroke.type == StrokeType.pencil ||
        stroke.type == StrokeType.marker ||
        stroke.type == StrokeType.highlighter ||
        stroke.type == StrokeType.eraser ||
        stroke.type == StrokeType.laserPointer) {
          
      final engine = PenSmoothingEngine(
        settings: StrokeSmoothing(
          level: 2,
          minWidth: stroke.thickness * 0.5,
          maxWidth: stroke.thickness,
          taperEnabled: stroke.type == StrokeType.pen || stroke.type == StrokeType.pencil,
        ),
      );

      final rawPoints = stroke.points.map((p) => InputPoint(
        position: Offset(p.x, p.y),
        pressure: p.pressure,
        time: p.time ?? DateTime.now(),
      )).toList();

      if (rawPoints.isEmpty) return;
      final path = engine.buildStrokePath(rawPoints);

      final paint = Paint()..style = PaintingStyle.fill;

      switch (stroke.type) {
        case StrokeType.eraser:
          paint.color = Colors.white; // Assumes white background
          break;
        case StrokeType.highlighter:
          paint
            ..color = stroke.color.withOpacity(stroke.opacity * 0.45)
            ..blendMode = BlendMode.srcOver; // Better than srcATop for layered highlights
          break;
        default:
          paint.color = stroke.color.withOpacity(stroke.opacity);
          break;
      }
      canvas.drawPath(path, paint);
      return;
    }

    // Geometry/Shape drawing logic (remains unchanged)
    if (stroke.points.length == 1 && stroke.type != StrokeType.text) {
      final p = Paint()
        ..color = stroke.color.withOpacity(stroke.opacity)
        ..style = PaintingStyle.fill;
      canvas.drawCircle(Offset(stroke.points[0].x, stroke.points[0].y), stroke.thickness / 2, p);
      return;
    }

    final paint = Paint()
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..style = stroke.isFilled ? PaintingStyle.fill : PaintingStyle.stroke
      ..color = stroke.color.withOpacity(stroke.opacity)
      ..strokeWidth = stroke.thickness;

    final p1 = Offset(stroke.points.first.x, stroke.points.first.y);
    final p2 = Offset(stroke.points.last.x, stroke.points.last.y);

    if (stroke.type == StrokeType.rectangle) {
      canvas.drawRect(Rect.fromPoints(p1, p2), paint);
      return;
    } else if (stroke.type == StrokeType.circle) {
      final radius = (p1 - p2).distance / 2;
      final center = Offset((p1.dx + p2.dx) / 2, (p1.dy + p2.dy) / 2);
      canvas.drawCircle(center, radius, paint);
      return;
    } else if (stroke.type == StrokeType.line) {
      paint.style = PaintingStyle.stroke;
      canvas.drawLine(p1, p2, paint);
      return;
    } else if (stroke.type == StrokeType.arrow) {
      paint.style = PaintingStyle.stroke;
      canvas.drawLine(p1, p2, paint);
      // Draw arrow head
      final d = (p1 - p2).direction;
      final arrowSize = stroke.thickness * 3 + 10;
      final p3 = p2 + Offset(math.cos(d + math.pi / 6) * arrowSize, math.sin(d + math.pi / 6) * arrowSize);
      final p4 = p2 + Offset(math.cos(d - math.pi / 6) * arrowSize, math.sin(d - math.pi / 6) * arrowSize);
      final arrowPath = Path()..moveTo(p2.dx, p2.dy)..lineTo(p3.dx, p3.dy)..moveTo(p2.dx, p2.dy)..lineTo(p4.dx, p4.dy);
      canvas.drawPath(arrowPath, paint);
      return;
    } else if (stroke.type == StrokeType.triangle) {
      final path = Path();
      path.moveTo((p1.dx + p2.dx) / 2, p1.dy);
      path.lineTo(p2.dx, p2.dy);
      path.lineTo(p1.dx, p2.dy);
      path.close();
      canvas.drawPath(path, paint);
      return;
    } else if (stroke.type == StrokeType.text) {
      // Draw text box preview or text
      if (stroke.id == 'current') {
        final rect = Rect.fromPoints(p1, p2);
        final boxPaint = Paint()..color = Colors.blue.withOpacity(0.3)..style = PaintingStyle.stroke..strokeWidth = 1.0;
        canvas.drawRect(rect, boxPaint);
      } else {
        final textPainter = TextPainter(
          text: TextSpan(
            text: stroke.text ?? 'Text',
            style: TextStyle(color: stroke.color.withOpacity(stroke.opacity), fontSize: stroke.thickness * 2 + 10),
          ),
          textDirection: TextDirection.ltr,
        );
        textPainter.layout();
        textPainter.paint(canvas, p1);
      }
      return;
    } else if (stroke.type == StrokeType.threeDObject) {
      if (stroke.text == null) return;
      try {
        final metadata = Shape3DMetadata.fromJson(jsonDecode(stroke.text!));
        final painter = Shape3DPainter(
          metadata: metadata,
          color: stroke.color.withOpacity(stroke.opacity),
          isFilled: stroke.isFilled,
          strokeWidth: stroke.thickness,
        );
        
        canvas.save();
        canvas.translate(p1.dx, p1.dy);
        painter.paint(canvas, Size(metadata.scale * 2.5, metadata.scale * 2.5));
        canvas.restore();
      } catch (e) {
        debugPrint('Error drawing 3D shape: $e');
      }
      return;
    }
  }

  void _drawTemplate(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.grey.withOpacity(0.2)
      ..strokeWidth = 1;

    switch (template) {
      case PageTemplate.ruled:
        const lineSpacing = 40.0;
        for (double y = lineSpacing; y < size.height; y += lineSpacing) {
          canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
        }
        break;
      case PageTemplate.grid:
        const gridSpacing = 40.0;
        for (double x = 0; x < size.width; x += gridSpacing) {
          canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
        }
        for (double y = 0; y < size.height; y += gridSpacing) {
          canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
        }
        break;
      case PageTemplate.dotGrid:
        const dotSpacing = 40.0;
        final dotPaint = Paint()
          ..color = Colors.grey.withOpacity(0.4)
          ..strokeWidth = 2;
        for (double x = dotSpacing; x < size.width; x += dotSpacing) {
          for (double y = dotSpacing; y < size.height; y += dotSpacing) {
            canvas.drawCircle(Offset(x, y), 1.5, dotPaint);
          }
        }
        break;
      case PageTemplate.mathGrid:
        const majorSpacing = 100.0;
        const minorSpacing = 20.0;
        final minorPaint = Paint()
          ..color = Colors.blue.withOpacity(0.1)
          ..strokeWidth = 0.5;
        final majorPaint = Paint()
          ..color = Colors.blue.withOpacity(0.25)
          ..strokeWidth = 1;
        for (double x = 0; x < size.width; x += minorSpacing) {
          canvas.drawLine(Offset(x, 0), Offset(x, size.height), minorPaint);
        }
        for (double y = 0; y < size.height; y += minorSpacing) {
          canvas.drawLine(Offset(0, y), Offset(size.width, y), minorPaint);
        }
        for (double x = 0; x < size.width; x += majorSpacing) {
          canvas.drawLine(Offset(x, 0), Offset(x, size.height), majorPaint);
        }
        for (double y = 0; y < size.height; y += majorSpacing) {
          canvas.drawLine(Offset(0, y), Offset(size.width, y), majorPaint);
        }
        break;
      default:
        break;
    }
  }

  @override
  bool shouldRepaint(covariant CanvasPainter oldDelegate) {
    return strokes != oldDelegate.strokes ||
        currentPoints != oldDelegate.currentPoints ||
        template != oldDelegate.template ||
        bgImage != oldDelegate.bgImage;
  }
}
