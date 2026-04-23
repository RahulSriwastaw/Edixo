import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../question_widget/presentation/providers/selected_widget_provider.dart';
import '../../../data/models/stroke_model.dart';
import '../../../data/models/canvas_object_model.dart';
import '../../providers/canvas_provider.dart';
import '../../providers/tool_provider.dart';
import '../drawing/stroke_renderer.dart';


// ── Selection handle types ──────────────────────────────────────────────────
enum _SelectionHandle { move, topLeft, topRight, bottomLeft, bottomRight, rotate }

// ── AnnotationLayer ─────────────────────────────────────────────────────────
class AnnotationLayer extends ConsumerStatefulWidget {
  const AnnotationLayer({super.key});
  @override
  ConsumerState<AnnotationLayer> createState() => _AnnotationLayerState();
}

class _AnnotationLayerState extends ConsumerState<AnnotationLayer> {
  // ── Drawing state ─────────────────────────────────────────────────────
  bool _isDrawing = false;
  bool _isCreatingObject = false;
  Offset? _objectStart;
  Offset? _objectCurrent;
  Tool? _objectTool;

  // ── Object selection/transform ────────────────────────────────────────
  String? _editingObjectId;
  Rect? _editStartRect;
  Rect? _liveEditRect;
  Offset? _dragAnchor;
  _SelectionHandle? _activeHandle;
  bool _movedDuringSelect = false;
  DateTime? _lastTapTime;
  String? _lastTappedObjectId;

  // ── Rotation ──────────────────────────────────────────────────────────
  bool _isRotating = false;
  double _liveRotation = 0.0;
  double _rotationStartAngle = 0.0;
  double _startObjRotation = 0.0;
  Offset _rotationCenter = Offset.zero;

  // ── Stroke drag ───────────────────────────────────────────────────────
  String? _editingStrokeId;
  Offset _liveStrokeOffset = Offset.zero;
  _SelectionHandle? _activeStrokeHandle;
  List<Offset>? _strokeStartPoints;
  Offset _strokeCenter = Offset.zero;
  double _strokeStartAngle = 0.0;
  double _strokeStartDistance = 1.0;
  double _liveStrokeRotation = 0.0;
  double _liveStrokeScale = 1.0;
  bool _isStrokePinchTransform = false;
  bool _pinchArmed = false;
  double _pinchBaseScale = 1.0;
  double _pinchBaseRotation = 0.0;

  // ── Lasso selection ───────────────────────────────────────────────────
  bool _isLassoSelecting = false;
  List<Offset> _lassoPoints = [];

  // ── Group (multi-element) selection ─────────────────────────────────
  final Set<String> _groupObjectIds = <String>{};
  final Set<String> _groupStrokeIds = <String>{};
  final Map<String, Rect> _groupStartObjectRects = <String, Rect>{};
  final Map<String, double> _groupStartObjectRotations = <String, double>{};
  final Map<String, List<Offset>> _groupStartStrokePoints = <String, List<Offset>>{};
  Rect? _groupSelectionRect;
  _SelectionHandle? _groupActiveHandle;
  Offset? _groupDragAnchor;
  Offset _groupCenter = Offset.zero;
  double _groupStartAngle = 0.0;
  double _groupStartDistance = 1.0;
  Offset _groupLiveOffset = Offset.zero;
  double _groupLiveScale = 1.0;
  double _groupLiveRotation = 0.0;

  // ── Pointer down ──────────────────────────────────────────────────────
  void _onPointerDown(PointerDownEvent event) {
    final toolState = ref.read(toolNotifierProvider);
    final canvasState = ref.read(canvasNotifierProvider);

    if (_canSelectElements(toolState)) {
      _movedDuringSelect = false;
      ref.read(selectedWidgetNotifierProvider.notifier).deselect();

      if (_hasGroupSelection && _groupSelectionRect != null) {
        final rect = _groupSelectionRect!;
        if (rect.inflate(12).contains(event.localPosition)) {
          final handle = _hitHandle(event.localPosition, rect);
          setState(() => _beginGroupTransform(handle, event.localPosition, canvasState));
          return;
        }
        setState(() => _clearGroupSelection());
      }

      final selectedId = toolState.selectedElementId;
      if (selectedId != null) {
        final selectedStrokeMatches = canvasState.strokes.where((s) => s.id == selectedId);
        if (selectedStrokeMatches.isNotEmpty) {
          final selectedStroke = selectedStrokeMatches.first;
          final strokeRect = _strokeSelectionRect(selectedStroke);
          if (strokeRect.inflate(14).contains(event.localPosition)) {
            final handle = _hitHandle(event.localPosition, strokeRect);
            setState(() {
              _editingStrokeId = selectedStroke.id;
              _dragAnchor = event.localPosition;
              _liveStrokeOffset = Offset.zero;
              _activeStrokeHandle = handle;
              _strokeStartPoints = selectedStroke.points;
              _strokeCenter = strokeRect.center;
              _liveStrokeRotation = 0.0;
              _liveStrokeScale = 1.0;
              _strokeStartAngle = math.atan2(
                event.localPosition.dy - _strokeCenter.dy,
                event.localPosition.dx - _strokeCenter.dx,
              ) * 180 / math.pi;
              _strokeStartDistance = math.max((event.localPosition - _strokeCenter).distance, 1.0);
            });
            return;
          }
        }
      }

      final hitObj = _hitTestTopObject(event.localPosition);
      if (hitObj != null) {
        setState(() => _clearGroupSelection());
        ref.read(toolNotifierProvider.notifier).setSelectedElement(hitObj.id);
        final rect = Rect.fromLTWH(hitObj.x, hitObj.y, hitObj.width, hitObj.height);
        final handle = _hitHandle(event.localPosition, rect);
        setState(() {
          _editingObjectId = hitObj.id;
          _editStartRect = rect;
          _liveEditRect = rect;
          _liveRotation = hitObj.rotation;
          _dragAnchor = event.localPosition;
          _activeHandle = handle;
          _isRotating = handle == _SelectionHandle.rotate;
          if (_isRotating) {
            _rotationCenter = rect.center;
            _rotationStartAngle = math.atan2(
              event.localPosition.dy - rect.center.dy,
              event.localPosition.dx - rect.center.dx,
            ) * 180 / math.pi;
            _startObjRotation = hitObj.rotation;
          }
        });
        return;
      }

      final hitStroke = _hitTestTopStroke(event.localPosition);
      if (hitStroke != null) {
        setState(() => _clearGroupSelection());
        ref.read(toolNotifierProvider.notifier).setSelectedElement(hitStroke.id);
        final strokeRect = _strokeSelectionRect(hitStroke);
        final handle = _hitHandle(event.localPosition, strokeRect);
        setState(() {
          _editingStrokeId = hitStroke.id;
          _dragAnchor = event.localPosition;
          _liveStrokeOffset = Offset.zero;
          _activeStrokeHandle = handle;
          _strokeStartPoints = hitStroke.points;
          _strokeCenter = strokeRect.center;
          _liveStrokeRotation = 0.0;
          _liveStrokeScale = 1.0;
          _strokeStartAngle = math.atan2(
            event.localPosition.dy - _strokeCenter.dy,
            event.localPosition.dx - _strokeCenter.dx,
          ) * 180 / math.pi;
          _strokeStartDistance = math.max((event.localPosition - _strokeCenter).distance, 1.0);
          _movedDuringSelect = false;
        });
        return;
      }

      ref.read(toolNotifierProvider.notifier).setSelectedElement(null);
      _editingObjectId = null;
      _editingStrokeId = null;
      setState(() {
        _isLassoSelecting = true;
        _lassoPoints = [event.localPosition];
      });
      return;
    }

    ref.read(toolNotifierProvider.notifier).setSelectedElement(null);
    if (toolState.interactionMode != InteractionMode.drawMode) return;

    if (toolState.activeTool.isDrawingTool) {
      setState(() => _isDrawing = true);
      ref.read(canvasNotifierProvider.notifier).startStroke(event.localPosition);
      return;
    }
    if (toolState.activeTool.isEraserTool) {
      setState(() => _isDrawing = true);
      _applyEraser(event.localPosition, toolState);
      return;
    }
    if (_isObjectTool(toolState.activeTool)) {
      setState(() {
        _isCreatingObject = true;
        _objectTool = toolState.activeTool;
        _objectStart = event.localPosition;
        _objectCurrent = event.localPosition;
      });
    }
  }

  // ── Pointer move ──────────────────────────────────────────────────────
  void _onPointerMove(PointerMoveEvent event) {
    if (_isStrokePinchTransform) return;


    if (_isLassoSelecting) {
      setState(() => _lassoPoints = [..._lassoPoints, event.localPosition]);
      return;
    }

    if (_hasGroupSelection && _groupActiveHandle != null) {
      _movedDuringSelect = true;
      if (_groupActiveHandle == _SelectionHandle.move && _groupDragAnchor != null) {
        final delta = event.localPosition - _groupDragAnchor!;
        setState(() {
          _groupLiveOffset = _groupLiveOffset + delta;
          _groupDragAnchor = event.localPosition;
        });
      } else if (_groupActiveHandle == _SelectionHandle.rotate) {
        final currentAngle = math.atan2(
          event.localPosition.dy - _groupCenter.dy,
          event.localPosition.dx - _groupCenter.dx,
        ) * 180 / math.pi;
        setState(() => _groupLiveRotation = currentAngle - _groupStartAngle);
      } else {
        final currentDistance = math.max((event.localPosition - _groupCenter).distance, 1.0);
        setState(() => _groupLiveScale = (currentDistance / _groupStartDistance).clamp(0.35, 4.0));
      }
      return;
    }
    if (_isRotating && _editingObjectId != null) {
      final currentAngle = math.atan2(
        event.localPosition.dy - _rotationCenter.dy,
        event.localPosition.dx - _rotationCenter.dx,
      ) * 180 / math.pi;
      _movedDuringSelect = true;
      setState(() => _liveRotation = (_startObjRotation + (currentAngle - _rotationStartAngle)) % 360);
      return;
    }

    if (_editingObjectId != null && _activeHandle != null &&
        _dragAnchor != null && _editStartRect != null &&
        _activeHandle != _SelectionHandle.rotate) {
      final delta = event.localPosition - _dragAnchor!;
      final next = _applyHandleDelta(start: _editStartRect!, handle: _activeHandle!, delta: delta);
      _movedDuringSelect = true;
      setState(() => _liveEditRect = _clampRect(next));
      return;
    }

    if (_editingStrokeId != null && _activeStrokeHandle != null && _activeStrokeHandle != _SelectionHandle.move) {
      _movedDuringSelect = true;
      if (_activeStrokeHandle == _SelectionHandle.rotate) {
        final currentAngle = math.atan2(
          event.localPosition.dy - _strokeCenter.dy,
          event.localPosition.dx - _strokeCenter.dx,
        ) * 180 / math.pi;
        setState(() => _liveStrokeRotation = currentAngle - _strokeStartAngle);
      } else {
        final currentDistance = math.max((event.localPosition - _strokeCenter).distance, 1.0);
        final nextScale = (currentDistance / _strokeStartDistance).clamp(0.35, 4.0);
        setState(() => _liveStrokeScale = nextScale);
      }
      return;
    }

    if (_editingStrokeId != null && _dragAnchor != null) {
      final delta = event.localPosition - _dragAnchor!;
      _movedDuringSelect = true;
      setState(() {
        _liveStrokeOffset = _liveStrokeOffset + delta;
        _dragAnchor = event.localPosition;
      });
      return;
    }

    if (_isDrawing) {
      final toolState = ref.read(toolNotifierProvider);
      if (toolState.activeTool.isEraserTool) {
        _applyEraser(event.localPosition, toolState);
        return;
      }
      ref.read(canvasNotifierProvider.notifier).updateStroke(event.localPosition);
      return;
    }

    if (_isCreatingObject) setState(() => _objectCurrent = event.localPosition);
  }

  void _applyEraser(Offset pos, ToolSettings toolState) {
    final notifier = ref.read(canvasNotifierProvider.notifier);
    final radius = toolState.currentSettings.strokeWidth * 1.5;
    switch (toolState.activeTool) {
      case Tool.softEraser:
      case Tool.areaEraser:
        notifier.eraseAtPoint(pos, radius);
      case Tool.hardEraser:
        notifier.eraseStrokeAt(pos, radius);
      case Tool.objectEraser:
        notifier.eraseObjectAt(pos);
      default:
        break;
    }
  }

  // ── Pointer up ────────────────────────────────────────────────────────
  void _onPointerUp(PointerUpEvent event) {
    if (_isStrokePinchTransform) return;


    if (_isLassoSelecting) {
      _applyLassoSelection();
      return;
    }
    if (_hasGroupSelection && _groupActiveHandle != null) {
      _commitGroupTransform();
      return;
    }
    if (_isRotating && _editingObjectId != null) {
      ref.read(canvasNotifierProvider.notifier)
          .updateObjectTransform(_editingObjectId!, rotation: _liveRotation % 360);
      setState(() { _isRotating = false; _activeHandle = null; });
      return;
    }

    if (_editingObjectId != null && _liveEditRect != null) {
      final rect = _liveEditRect!;
      final objectId = _editingObjectId!;
      ref.read(canvasNotifierProvider.notifier).updateObjectTransform(
          objectId, x: rect.left, y: rect.top, width: rect.width, height: rect.height);

      final now = DateTime.now();
      final isTap = !_movedDuringSelect;
      final isDoubleTap = isTap &&
          _lastTapTime != null &&
          now.difference(_lastTapTime!).inMilliseconds < 300 &&
          _lastTappedObjectId == objectId;
      _lastTapTime = now;
      _lastTappedObjectId = objectId;
      _clearLiveEdit(keepSelection: true);

      if (isDoubleTap) {
        final hits = ref.read(canvasNotifierProvider).objects.where((o) => o.id == objectId);
        if (hits.isNotEmpty) {
          final obj = hits.first;
          if (obj.type == ObjectType.textBox || obj.type == ObjectType.stickyNote) {
            _openTextEditDialog(obj);
          } else {
            _openObjectPropertiesSheet(obj);
          }
        }
      }
      return;
    }

    if (_editingStrokeId != null) {
      final strokeId = _editingStrokeId!;
      if (_activeStrokeHandle != null && _activeStrokeHandle != _SelectionHandle.move) {
        if ((_liveStrokeScale - 1.0).abs() > 0.001 || _liveStrokeRotation.abs() > 0.001) {
          ref.read(canvasNotifierProvider.notifier).transformStroke(
            strokeId,
            scale: _liveStrokeScale,
            rotationDeg: _liveStrokeRotation,
            center: _strokeCenter,
          );
        }
      } else if (_liveStrokeOffset != Offset.zero) {
        ref.read(canvasNotifierProvider.notifier).translateStroke(strokeId, _liveStrokeOffset);
      }
      setState(() {
        _editingStrokeId = null;
        _liveStrokeOffset = Offset.zero;
        _activeStrokeHandle = null;
        _strokeStartPoints = null;
        _liveStrokeRotation = 0.0;
        _liveStrokeScale = 1.0;
        _dragAnchor = null;
        _movedDuringSelect = false;
      });
      ref.read(toolNotifierProvider.notifier).setSelectedElement(strokeId);
      return;
    }

    if (_isDrawing) {
      final toolState = ref.read(toolNotifierProvider);
      if (!toolState.activeTool.isEraserTool) {
        ref.read(canvasNotifierProvider.notifier).endStroke();
      }
      setState(() => _isDrawing = false);
      return;
    }

    if (!_isCreatingObject || _objectStart == null || _objectCurrent == null || _objectTool == null) return;
    final toolState = ref.read(toolNotifierProvider);
    final obj = _buildObjectFromDrag(tool: _objectTool!, start: _objectStart!, end: _objectCurrent!, toolState: toolState);
    if (obj != null) ref.read(canvasNotifierProvider.notifier).addObject(obj);
    setState(() { _isCreatingObject = false; _objectStart = null; _objectCurrent = null; _objectTool = null; });
  }

  // ── Helpers ───────────────────────────────────────────────────────────
  bool _canSelectElements(ToolSettings s) =>
      s.interactionMode == InteractionMode.selectMode &&
      (s.activeTool == Tool.select || s.activeTool == Tool.selectObject);

  CanvasObjectModel? _hitTestTopObject(Offset point) {
    final objects = ref.read(canvasNotifierProvider).objects;
    for (final obj in objects.reversed) {
      if (obj.bounds.inflate(10).contains(point)) return obj;
    }
    return null;
  }

  StrokeModel? _hitTestTopStroke(Offset point) {
    final strokes = ref.read(canvasNotifierProvider).strokes;
    for (final stroke in strokes.reversed) {
      final hitR = math.max(stroke.strokeWidth * 0.8, 8.0);
      for (final p in stroke.points) {
        if ((p - point).distance <= hitR) return stroke;
      }
    }
    return null;
  }

  _SelectionHandle _hitHandle(Offset point, Rect rect) {
    const d = 16.0;
    final rotPos = Offset(rect.center.dx, rect.top - 42);
    if ((point - rotPos).distance <= 14) return _SelectionHandle.rotate;
    if ((point - rect.topLeft).distance <= d) return _SelectionHandle.topLeft;
    if ((point - rect.topRight).distance <= d) return _SelectionHandle.topRight;
    if ((point - rect.bottomLeft).distance <= d) return _SelectionHandle.bottomLeft;
    if ((point - rect.bottomRight).distance <= d) return _SelectionHandle.bottomRight;
    return _SelectionHandle.move;
  }

  Rect _applyHandleDelta({required Rect start, required _SelectionHandle handle, required Offset delta}) {
    double l = start.left, t = start.top, r = start.right, b = start.bottom;
    switch (handle) {
      case _SelectionHandle.move: l += delta.dx; r += delta.dx; t += delta.dy; b += delta.dy;
      case _SelectionHandle.topLeft: l += delta.dx; t += delta.dy;
      case _SelectionHandle.topRight: r += delta.dx; t += delta.dy;
      case _SelectionHandle.bottomLeft: l += delta.dx; b += delta.dy;
      case _SelectionHandle.bottomRight: r += delta.dx; b += delta.dy;
      case _SelectionHandle.rotate: break;
    }
    const minW = 24.0, minH = 24.0;
    if ((r - l) < minW) { if (handle == _SelectionHandle.topLeft || handle == _SelectionHandle.bottomLeft) { l = r - minW; } else { r = l + minW; } }
    if ((b - t) < minH) { if (handle == _SelectionHandle.topLeft || handle == _SelectionHandle.topRight) { t = b - minH; } else { b = t + minH; } }
    return Rect.fromLTRB(l, t, r, b);
  }

  Rect _clampRect(Rect rect) {
    const cw = 1920.0, ch = 1080.0;
    var l = rect.left, t = rect.top, w = rect.width, h = rect.height;
    if (l < 0) l = 0; if (t < 0) t = 0;
    if (l + w > cw) l = cw - w; if (t + h > ch) t = ch - h;
    return Rect.fromLTWH(l, t, w, h);
  }

  bool get _hasGroupSelection => _groupObjectIds.isNotEmpty || _groupStrokeIds.isNotEmpty;

  void _clearGroupSelection() {
    _groupObjectIds.clear();
    _groupStrokeIds.clear();
    _groupStartObjectRects.clear();
    _groupStartObjectRotations.clear();
    _groupStartStrokePoints.clear();
    _groupSelectionRect = null;
    _groupActiveHandle = null;
    _groupDragAnchor = null;
    _groupLiveOffset = Offset.zero;
    _groupLiveScale = 1.0;
    _groupLiveRotation = 0.0;
  }

  Rect? _computeGroupBounds(CanvasState canvasState) {
    double? minX, minY, maxX, maxY;

    for (final obj in canvasState.objects) {
      if (!_groupObjectIds.contains(obj.id)) continue;
      final r = Rect.fromLTWH(obj.x, obj.y, obj.width, obj.height);
      minX = minX == null ? r.left : math.min(minX, r.left);
      minY = minY == null ? r.top : math.min(minY, r.top);
      maxX = maxX == null ? r.right : math.max(maxX, r.right);
      maxY = maxY == null ? r.bottom : math.max(maxY, r.bottom);
    }

    for (final stroke in canvasState.strokes) {
      if (!_groupStrokeIds.contains(stroke.id) || stroke.points.isEmpty) continue;
      for (final p in stroke.points) {
        minX = minX == null ? p.dx : math.min(minX, p.dx);
        minY = minY == null ? p.dy : math.min(minY, p.dy);
        maxX = maxX == null ? p.dx : math.max(maxX, p.dx);
        maxY = maxY == null ? p.dy : math.max(maxY, p.dy);
      }
    }

    if (minX == null || minY == null || maxX == null || maxY == null) return null;
    return Rect.fromLTRB(minX, minY, maxX, maxY).inflate(6);
  }

  Offset _applyPointTransformToGroupStart(Offset p) {
    final c = _groupCenter;
    final angle = _groupLiveRotation * math.pi / 180.0;
    final cosA = math.cos(angle);
    final sinA = math.sin(angle);
    final dx = (p.dx - c.dx) * _groupLiveScale;
    final dy = (p.dy - c.dy) * _groupLiveScale;
    final rx = (dx * cosA) - (dy * sinA);
    final ry = (dx * sinA) + (dy * cosA);
    return Offset(c.dx + rx, c.dy + ry) + _groupLiveOffset;
  }

  Rect _transformGroupRect(Rect startRect) {
    final newCenter = _applyPointTransformToGroupStart(startRect.center);
    final w = math.max(24.0, startRect.width * _groupLiveScale);
    final h = math.max(24.0, startRect.height * _groupLiveScale);
    return Rect.fromCenter(center: newCenter, width: w, height: h);
  }

  void _beginGroupTransform(_SelectionHandle handle, Offset pointerPos, CanvasState canvasState) {
    _groupStartObjectRects.clear();
    _groupStartObjectRotations.clear();
    _groupStartStrokePoints.clear();

    for (final obj in canvasState.objects) {
      if (_groupObjectIds.contains(obj.id)) {
        _groupStartObjectRects[obj.id] = Rect.fromLTWH(obj.x, obj.y, obj.width, obj.height);
        _groupStartObjectRotations[obj.id] = obj.rotation;
      }
    }
    for (final stroke in canvasState.strokes) {
      if (_groupStrokeIds.contains(stroke.id)) {
        _groupStartStrokePoints[stroke.id] = List<Offset>.from(stroke.points);
      }
    }

    final bounds = _computeGroupBounds(canvasState);
    if (bounds == null) return;

    _groupSelectionRect = bounds;
    _groupCenter = bounds.center;
    _groupStartAngle = math.atan2(pointerPos.dy - _groupCenter.dy, pointerPos.dx - _groupCenter.dx) * 180 / math.pi;
    _groupStartDistance = math.max((pointerPos - _groupCenter).distance, 1.0);
    _groupActiveHandle = handle;
    _groupDragAnchor = pointerPos;
    _groupLiveOffset = Offset.zero;
    _groupLiveScale = 1.0;
    _groupLiveRotation = 0.0;
  }

  void _commitGroupTransform() {
    final notifier = ref.read(canvasNotifierProvider.notifier);

    for (final entry in _groupStartObjectRects.entries) {
      final id = entry.key;
      final startRect = entry.value;
      final nextRect = _transformGroupRect(startRect);
      final startRot = _groupStartObjectRotations[id] ?? 0.0;
      notifier.updateObjectTransform(
        id,
        x: nextRect.left,
        y: nextRect.top,
        width: nextRect.width,
        height: nextRect.height,
        rotation: (startRot + _groupLiveRotation) % 360,
      );
    }

    for (final entry in _groupStartStrokePoints.entries) {
      final id = entry.key;
      final startPts = entry.value;
      final transformed = startPts.map(_applyPointTransformToGroupStart).toList();
      notifier.updateStrokePoints(id, transformed);
    }

    _groupActiveHandle = null;
    _groupDragAnchor = null;
    _groupLiveOffset = Offset.zero;
    _groupLiveScale = 1.0;
    _groupLiveRotation = 0.0;
  }

  void _clearLiveEdit({bool keepSelection = false}) {
    setState(() {
      _editingObjectId = null; _editStartRect = null; _liveEditRect = null;
      _dragAnchor = null; _activeHandle = null; _movedDuringSelect = false;
      _isRotating = false; _editingStrokeId = null; _liveStrokeOffset = Offset.zero;
      _activeStrokeHandle = null; _strokeStartPoints = null;
      _liveStrokeRotation = 0.0; _liveStrokeScale = 1.0;
      _isStrokePinchTransform = false; _pinchArmed = false;
      _isLassoSelecting = false; _lassoPoints = [];
      _clearGroupSelection();
    });
    if (!keepSelection) ref.read(toolNotifierProvider.notifier).setSelectedElement(null);
  }

  Rect _strokeSelectionRect(StrokeModel stroke) {
    if (stroke.points.isEmpty) return Rect.zero;
    double minX = stroke.points.first.dx;
    double maxX = stroke.points.first.dx;
    double minY = stroke.points.first.dy;
    double maxY = stroke.points.first.dy;
    for (final p in stroke.points) {
      if (p.dx < minX) minX = p.dx;
      if (p.dx > maxX) maxX = p.dx;
      if (p.dy < minY) minY = p.dy;
      if (p.dy > maxY) maxY = p.dy;
    }
    return Rect.fromLTRB(minX, minY, maxX, maxY).inflate(stroke.strokeWidth / 2 + 6);
  }

  void _onScaleStart(ScaleStartDetails details) {
    _pinchArmed = true;
  }

  void _onScaleUpdate(ScaleUpdateDetails details) {
    if (!_pinchArmed) return;

    if (!_isStrokePinchTransform) {
      if (details.pointerCount < 2) return;
      final toolState = ref.read(toolNotifierProvider);
      if (!_canSelectElements(toolState)) return;
      final selectedId = toolState.selectedElementId;
      if (selectedId == null) return;

      final canvasState = ref.read(canvasNotifierProvider);
      final matches = canvasState.strokes.where((s) => s.id == selectedId);
      if (matches.isEmpty) return;
      final stroke = matches.first;

      setState(() {
        _isStrokePinchTransform = true;
        _editingStrokeId = stroke.id;
        _activeStrokeHandle = _SelectionHandle.rotate;
        _strokeStartPoints = stroke.points;
        _strokeCenter = details.focalPoint;
        _pinchBaseScale = details.scale == 0 ? 1.0 : details.scale;
        _pinchBaseRotation = details.rotation;
        _liveStrokeScale = 1.0;
        _liveStrokeRotation = 0.0;
        _movedDuringSelect = true;
      });
      return;
    }

    if (_editingStrokeId == null) return;
    setState(() {
      _strokeCenter = details.focalPoint;
      _liveStrokeScale = (details.scale / _pinchBaseScale).clamp(0.35, 4.0);
      _liveStrokeRotation = (details.rotation - _pinchBaseRotation) * 180.0 / math.pi;
    });
  }

  void _onScaleEnd(ScaleEndDetails details) {
    _pinchArmed = false;
    if (!_isStrokePinchTransform || _editingStrokeId == null) return;
    final strokeId = _editingStrokeId!;
    if ((_liveStrokeScale - 1.0).abs() > 0.001 || _liveStrokeRotation.abs() > 0.001) {
      ref.read(canvasNotifierProvider.notifier).transformStroke(
        strokeId,
        scale: _liveStrokeScale,
        rotationDeg: _liveStrokeRotation,
        center: _strokeCenter,
      );
    }
    setState(() {
      _isStrokePinchTransform = false;
      _editingStrokeId = null;
      _activeStrokeHandle = null;
      _strokeStartPoints = null;
      _liveStrokeScale = 1.0;
      _liveStrokeRotation = 0.0;
      _pinchBaseScale = 1.0;
      _pinchBaseRotation = 0.0;
    });
  }

  void _applyLassoSelection() {
    final points = List<Offset>.from(_lassoPoints);
    setState(() {
      _isLassoSelecting = false;
      _lassoPoints = [];
    });
    if (points.length < 3) return;

    final canvasState = ref.read(canvasNotifierProvider);

    final objectHits = <String>{};
    final strokeHits = <String>{};

    for (final obj in canvasState.objects) {
      final rect = Rect.fromLTWH(obj.x, obj.y, obj.width, obj.height);
      if (_rectIntersectsPolygon(rect, points)) {
        objectHits.add(obj.id);
      }
    }

    for (final stroke in canvasState.strokes) {
      final hit = stroke.points.any((p) => _isPointInPolygon(p, points));
      if (hit) strokeHits.add(stroke.id);
    }

    if (objectHits.isEmpty && strokeHits.isEmpty) {
      setState(() => _clearGroupSelection());
      ref.read(toolNotifierProvider.notifier).setSelectedElement(null);
      return;
    }

    if (objectHits.length + strokeHits.length == 1) {
      setState(() => _clearGroupSelection());
      final id = objectHits.isNotEmpty ? objectHits.first : strokeHits.first;
      ref.read(toolNotifierProvider.notifier).setSelectedElement(id);
      return;
    }

    setState(() {
      _clearGroupSelection();
      _groupObjectIds.addAll(objectHits);
      _groupStrokeIds.addAll(strokeHits);
      _groupSelectionRect = _computeGroupBounds(canvasState);
    });
    ref.read(toolNotifierProvider.notifier).setSelectedElement(null);
  }

  bool _rectIntersectsPolygon(Rect rect, List<Offset> polygon) {
    if (_isPointInPolygon(rect.center, polygon)) return true;
    if (_isPointInPolygon(rect.topLeft, polygon)) return true;
    if (_isPointInPolygon(rect.topRight, polygon)) return true;
    if (_isPointInPolygon(rect.bottomLeft, polygon)) return true;
    if (_isPointInPolygon(rect.bottomRight, polygon)) return true;
    return false;
  }

  bool _isPointInPolygon(Offset point, List<Offset> polygon) {
    var inside = false;
    for (int i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      final xi = polygon[i].dx;
      final yi = polygon[i].dy;
      final xj = polygon[j].dx;
      final yj = polygon[j].dy;
      final intersect = ((yi > point.dy) != (yj > point.dy)) &&
          (point.dx < (xj - xi) * (point.dy - yi) / ((yj - yi) == 0 ? 0.00001 : (yj - yi)) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  List<Offset> _transformPoints({
    required List<Offset> points,
    required Offset center,
    required double scale,
    required double rotationDeg,
  }) {
    final angle = rotationDeg * math.pi / 180.0;
    final cosA = math.cos(angle);
    final sinA = math.sin(angle);
    return points.map((p) {
      final dx = (p.dx - center.dx) * scale;
      final dy = (p.dy - center.dy) * scale;
      final rx = (dx * cosA) - (dy * sinA);
      final ry = (dx * sinA) + (dy * cosA);
      return Offset(center.dx + rx, center.dy + ry);
    }).toList();
  }

  // ── Dialogs ───────────────────────────────────────────────────────────
  Future<void> _openTextEditDialog(CanvasObjectModel obj) async {
    final initial = (obj.extra['text'] as String?) ?? (obj.type == ObjectType.stickyNote ? 'Note' : 'Text');
    final controller = TextEditingController(text: initial);
    final updated = await showDialog<String>(
      context: context,
      builder: (_) => AlertDialog(
        backgroundColor: const Color(0xFF1B1B32),
        title: const Text('Edit Text', style: TextStyle(color: Colors.white)),
        content: TextField(controller: controller, maxLines: 4,
            style: const TextStyle(color: Colors.white),
            decoration: const InputDecoration(hintText: 'Enter text', hintStyle: TextStyle(color: Colors.white38))),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
          ElevatedButton(onPressed: () => Navigator.pop(context, controller.text.trim()), child: const Text('Save')),
        ],
      ),
    );
    controller.dispose();
    if (updated == null || updated.isEmpty) return;
    ref.read(canvasNotifierProvider.notifier).updateObjectText(obj.id, updated);
  }

  void _openObjectPropertiesSheet(CanvasObjectModel obj) {
    showModalBottomSheet<void>(
      context: context, useRootNavigator: true, isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _ObjectPropertiesSheet(
        object: obj,
        onChanged: (u) => ref.read(canvasNotifierProvider.notifier).updateObjectTransform(
          obj.id,
          fillColorARGB: u['fillColorARGB'] as int?,
          borderColorARGB: u['borderColorARGB'] as int?,
          borderWidth: u['borderWidth'] as double?,
          opacity: u['opacity'] as double?,
          rotation: u['rotation'] as double?,
        ),
        onDelete: () {
          Navigator.pop(context);
          ref.read(canvasNotifierProvider.notifier).deleteElement(obj.id);
          ref.read(toolNotifierProvider.notifier).setSelectedElement(null);
          _clearLiveEdit();
        },
        onDuplicate: () {
          Navigator.pop(context);
          ref.read(canvasNotifierProvider.notifier).duplicateObject(obj.id);
        },
      ),
    );
  }

  void _openStrokePropertiesSheet(StrokeModel stroke) {
    showModalBottomSheet<void>(
      context: context,
      useRootNavigator: true,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _StrokePropertiesSheet(
        stroke: stroke,
        onApply: ({required Color color, required double strokeWidth, required double opacity, required double scale, required double rotation}) {
          ref.read(canvasNotifierProvider.notifier).updateStrokeStyle(
            stroke.id,
            colorARGB: color.toARGB32(),
            strokeWidth: strokeWidth,
            opacity: opacity,
          );
          if ((scale - 1.0).abs() > 0.001 || rotation.abs() > 0.001) {
            ref.read(canvasNotifierProvider.notifier).transformStroke(
              stroke.id,
              scale: scale,
              rotationDeg: rotation,
            );
          }
        },
      ),
    );
  }

  // ── Object building ───────────────────────────────────────────────────
  bool _isObjectTool(Tool tool) =>
      tool.isShapeTool || tool == Tool.textBox || tool == Tool.stickyNote;

  ObjectType? _mapToolToObjectType(Tool tool) => switch (tool) {
    Tool.rectangle => ObjectType.rectangle,
    Tool.roundedRect => ObjectType.roundedRect,
    Tool.circle => ObjectType.circle,
    Tool.triangle => ObjectType.triangle,
    Tool.star => ObjectType.star,
    Tool.polygon => ObjectType.polygon,
    Tool.line => ObjectType.line,
    Tool.arrow => ObjectType.arrow,
    Tool.doubleArrow => ObjectType.doubleArrow,
    Tool.callout => ObjectType.callout,
    Tool.textBox => ObjectType.textBox,
    Tool.stickyNote => ObjectType.stickyNote,
    _ => null,
  };

  CanvasObjectModel? _buildObjectFromDrag({required Tool tool, required Offset start, required Offset end, required ToolSettings toolState}) {
    final objectType = _mapToolToObjectType(tool);
    if (objectType == null) return null;
    final left = math.min(start.dx, end.dx), top = math.min(start.dy, end.dy);
    double x = left, y = top, width = (end.dx - start.dx).abs(), height = (end.dy - start.dy).abs();
    if (width < 8 && height < 8) {
      switch (objectType) {
        case ObjectType.textBox: width = 260; height = 120; x = start.dx; y = start.dy;
        case ObjectType.stickyNote: width = 220; height = 180; x = start.dx; y = start.dy;
        case ObjectType.line || ObjectType.arrow || ObjectType.doubleArrow: width = 140; height = 0; x = start.dx; y = start.dy;
        default: width = 140; height = 90; x = start.dx; y = start.dy;
      }
    }
    final isLineLike = objectType == ObjectType.line || objectType == ObjectType.arrow || objectType == ObjectType.doubleArrow;
    final defaultFill = switch (objectType) {
      ObjectType.stickyNote => const Color(0xFFFFF59D).toARGB32(),
      ObjectType.textBox => const Color(0x33000000).toARGB32(),
      _ when isLineLike => 0x00000000,
      _ => const Color(0x1AFFFFFF).toARGB32(),
    };
    return CanvasObjectModel(
      type: objectType, x: x, y: y, width: width, height: height,
      fillColorARGB: defaultFill,
      borderColorARGB: toolState.currentSettings.color.toARGB32(),
      borderWidth: math.max(1.0, toolState.currentSettings.strokeWidth),
      opacity: toolState.currentSettings.opacity,
      slideId: '',
      extra: {
        if (objectType == ObjectType.textBox) 'text': 'Text',
        if (objectType == ObjectType.stickyNote) 'text': 'Note',
      },
    );
  }

  CanvasObjectModel? _buildPreviewObject(ToolSettings toolState) {
    if (!_isCreatingObject || _objectStart == null || _objectCurrent == null || _objectTool == null) return null;
    return _buildObjectFromDrag(tool: _objectTool!, start: _objectStart!, end: _objectCurrent!, toolState: toolState);
  }

  // ── Build ─────────────────────────────────────────────────────────────
  @override
  Widget build(BuildContext context) {
    final canvasState = ref.watch(canvasNotifierProvider);
    final toolState = ref.watch(toolNotifierProvider);
    final previewObject = _buildPreviewObject(toolState);
    final selectedId = toolState.selectedElementId;
    final canSelect = _canSelectElements(toolState);

    final objects = canvasState.objects.map((obj) {
      if (obj.id == _editingObjectId) {
        if (_liveEditRect != null) {
          return obj.copyWith(x: _liveEditRect!.left, y: _liveEditRect!.top,
              width: _liveEditRect!.width, height: _liveEditRect!.height, rotation: _liveRotation);
        }
        if (_isRotating) return obj.copyWith(rotation: _liveRotation);
      }
      if (_hasGroupSelection && _groupObjectIds.contains(obj.id) && _groupStartObjectRects.containsKey(obj.id)) {
        final startRect = _groupStartObjectRects[obj.id]!;
        final nextRect = _transformGroupRect(startRect);
        final startRot = _groupStartObjectRotations[obj.id] ?? obj.rotation;
        return obj.copyWith(
          x: nextRect.left,
          y: nextRect.top,
          width: nextRect.width,
          height: nextRect.height,
          rotation: (startRot + _groupLiveRotation) % 360,
        );
      }
      return obj;
    }).toList();
    if (previewObject != null) objects.add(previewObject);

    final strokes = canvasState.strokes.map((s) {
      if (_hasGroupSelection && _groupStrokeIds.contains(s.id) && _groupStartStrokePoints.containsKey(s.id)) {
        return s.copyWith(points: _groupStartStrokePoints[s.id]!.map(_applyPointTransformToGroupStart).toList());
      }
      if (s.id == _editingStrokeId && _activeStrokeHandle != null && _activeStrokeHandle != _SelectionHandle.move && _strokeStartPoints != null) {
        return s.copyWith(
          points: _transformPoints(
            points: _strokeStartPoints!,
            center: _strokeCenter,
            scale: _liveStrokeScale,
            rotationDeg: _liveStrokeRotation,
          ),
        );
      }
      if (s.id == _editingStrokeId && _liveStrokeOffset != Offset.zero) {
        return s.copyWith(points: s.points.map((p) => p + _liveStrokeOffset).toList());
      }
      return s;
    }).toList();

    final isSelectedStroke = selectedId != null && strokes.any((s) => s.id == selectedId);

    Rect? selectionRect;
    Rect? groupSelectionRect;
    if (_hasGroupSelection && _groupSelectionRect != null) {
      groupSelectionRect = _transformGroupRect(_groupSelectionRect!);
    }
    if (canSelect && selectedId != null) {
      if (!isSelectedStroke) {
        final m = objects.where((o) => o.id == selectedId);
        if (m.isNotEmpty) { final o = m.first; selectionRect = Rect.fromLTWH(o.x, o.y, o.width, o.height); }
      } else {
        final m = strokes.where((s) => s.id == selectedId);
        if (m.isNotEmpty) {
          final pts = m.first.points;
          if (pts.isNotEmpty) {
            double minX = pts.first.dx, maxX = pts.first.dx, minY = pts.first.dy, maxY = pts.first.dy;
            for (final p in pts) { if (p.dx < minX) minX = p.dx; if (p.dx > maxX) maxX = p.dx; if (p.dy < minY) minY = p.dy; if (p.dy > maxY) maxY = p.dy; }
            selectionRect = Rect.fromLTRB(minX, minY, maxX, maxY);
          }
        }
      }
    }

    final blockPointers = toolState.activeTool == Tool.selectObject;

    return IgnorePointer(
      ignoring: blockPointers,
      child: Stack(
        children: [
          GestureDetector(
            behavior: HitTestBehavior.translucent,
            onScaleStart: _onScaleStart,
            onScaleUpdate: _onScaleUpdate,
            onScaleEnd: _onScaleEnd,
            child: Listener(
              behavior: HitTestBehavior.translucent,
              onPointerDown: _onPointerDown,
              onPointerMove: _onPointerMove,
              onPointerUp: _onPointerUp,
              child: RepaintBoundary(
                child: CustomPaint(
                  painter: AnnotationPainter(
                    strokes: [...strokes, if (canvasState.activeStroke != null) canvasState.activeStroke!],
                    objects: objects,
                    selectedObjectId: canSelect && !isSelectedStroke ? selectedId : null,
                    showSelectionHandles: canSelect,
                    selectedStrokeId: canSelect && isSelectedStroke ? selectedId : null,
                    lassoPoints: _isLassoSelecting ? _lassoPoints : const <Offset>[],
                    groupSelectionRect: canSelect ? groupSelectionRect : null,
                  ),
                  child: const SizedBox.expand(),
                ),
              ),
            ),
          ),
          if (canSelect && _hasGroupSelection && groupSelectionRect != null)
            _buildGroupSelectionOverlay(context, groupSelectionRect),
          if (canSelect && selectedId != null && selectionRect != null)
            _buildSelectionOverlay(
              context,
              selectedId,
              selectionRect,
              isStroke: isSelectedStroke,
              objects: objects,
              strokes: strokes,
            ),
        ],
      ),
    );
  }

  Widget _buildGroupSelectionOverlay(BuildContext context, Rect selectionRect) {
    final barTop = (selectionRect.top - 56).clamp(0.0, 950.0);
    final barCenterX = selectionRect.center.dx.clamp(110.0, 1810.0);
    return Positioned(
      left: barCenterX - 110,
      top: barTop,
      child: _SelectionActionBar(
        isStroke: false,
        selectedObj: null,
        selectedStroke: null,
        onDelete: () {
          final notifier = ref.read(canvasNotifierProvider.notifier);
          for (final id in _groupStrokeIds) {
            notifier.deleteElement(id);
          }
          for (final id in _groupObjectIds) {
            notifier.deleteElement(id);
          }
          _clearLiveEdit();
        },
        onSettings: null,
      ),
    );
  }

  Widget _buildSelectionOverlay(BuildContext context, String selectedId, Rect selectionRect,
      {required bool isStroke, required List<CanvasObjectModel> objects, required List<StrokeModel> strokes}) {
    final m = objects.where((o) => o.id == selectedId);
    final selectedObj = m.isNotEmpty ? m.first : null;
    final sm = strokes.where((s) => s.id == selectedId);
    final selectedStroke = sm.isNotEmpty ? sm.first : null;
    final barTop = (selectionRect.top - 56).clamp(0.0, 950.0);
    final barCenterX = selectionRect.center.dx.clamp(110.0, 1810.0);
    return Positioned(
      left: barCenterX - 110, top: barTop,
      child: _SelectionActionBar(
        isStroke: isStroke, selectedObj: selectedObj, selectedStroke: selectedStroke,
        onDelete: () {
          ref.read(canvasNotifierProvider.notifier).deleteElement(selectedId);
          ref.read(toolNotifierProvider.notifier).setSelectedElement(null);
          _clearLiveEdit();
        },
        onDuplicate: isStroke
            ? () => ref.read(canvasNotifierProvider.notifier).duplicateStroke(selectedId)
            : (!isStroke && selectedObj != null)
                ? () => ref.read(canvasNotifierProvider.notifier).duplicateObject(selectedId)
                : null,
        onSettings: isStroke
            ? (selectedStroke != null ? () => _openStrokePropertiesSheet(selectedStroke) : null)
            : (!isStroke && selectedObj != null)
                ? () => _openObjectPropertiesSheet(selectedObj)
                : null,
      ),
    );
  }
}

// ── Selection action bar ────────────────────────────────────────────────────
class _SelectionActionBar extends StatelessWidget {
  final bool isStroke;
  final CanvasObjectModel? selectedObj;
  final StrokeModel? selectedStroke;
  final VoidCallback onDelete;
  final VoidCallback? onDuplicate;
  final VoidCallback? onSettings;

  const _SelectionActionBar({
    required this.isStroke, required this.selectedObj, required this.selectedStroke, required this.onDelete,
    this.onDuplicate, this.onSettings,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: Container(
        height: 42,
        decoration: BoxDecoration(
          color: const Color(0xFF1E1E38),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white.withValues(alpha: 0.12)),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.55), blurRadius: 14, offset: const Offset(0, 5))],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(width: 8),
            if (onSettings != null) _BarBtn(icon: Icons.tune, tooltip: 'Properties', onTap: onSettings!),
            if (onDuplicate != null) _BarBtn(icon: Icons.file_copy_outlined, tooltip: 'Duplicate', onTap: onDuplicate!),
            _BarBtn(icon: Icons.delete_outline, tooltip: 'Delete', color: const Color(0xFFFF5252), onTap: onDelete),
            const SizedBox(width: 6),
          ],
        ),
      ),
    );
  }
}

class _BarBtn extends StatelessWidget {
  final IconData icon;
  final String tooltip;
  final Color color;
  final VoidCallback onTap;
  const _BarBtn({required this.icon, required this.tooltip, this.color = Colors.white70, required this.onTap});
  @override
  Widget build(BuildContext context) => Tooltip(
        message: tooltip,
        child: GestureDetector(onTap: onTap,
          child: Padding(padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
              child: Icon(icon, size: 20, color: color))));
}

// ── Object properties sheet ──────────────────────────────────────────────────
class _ObjectPropertiesSheet extends StatefulWidget {
  final CanvasObjectModel object;
  final void Function(Map<String, dynamic>) onChanged;
  final VoidCallback onDelete;
  final VoidCallback onDuplicate;
  const _ObjectPropertiesSheet({required this.object, required this.onChanged, required this.onDelete, required this.onDuplicate});
  @override
  State<_ObjectPropertiesSheet> createState() => _ObjectPropertiesSheetState();
}

class _ObjectPropertiesSheetState extends State<_ObjectPropertiesSheet> {
  late Color _fillColor;
  late Color _borderColor;
  late double _borderWidth;
  late double _opacity;
  late double _rotation;

  @override
  void initState() {
    super.initState();
    _fillColor = widget.object.fillColor;
    _borderColor = widget.object.borderColor;
    _borderWidth = widget.object.borderWidth;
    _opacity = widget.object.opacity;
    _rotation = widget.object.rotation;
  }

  void _apply() => widget.onChanged({
    'fillColorARGB': _fillColor.toARGB32(),
    'borderColorARGB': _borderColor.toARGB32(),
    'borderWidth': _borderWidth,
    'opacity': _opacity,
    'rotation': _rotation,
  });

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Container(
        margin: const EdgeInsets.fromLTRB(10, 0, 10, 16),
        decoration: BoxDecoration(color: const Color(0xFF1B1B32), borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.white.withValues(alpha: 0.08))),
        child: SingleChildScrollView(
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Center(child: Container(width: 36, height: 4, margin: const EdgeInsets.only(top: 10, bottom: 6),
                decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(2)))),
            Padding(padding: const EdgeInsets.fromLTRB(16, 4, 12, 0),
              child: Row(children: [
                const Icon(Icons.tune, color: Color(0xFFF4511E), size: 20),
                const SizedBox(width: 10),
                const Text('Object Properties', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 15)),
                const Spacer(),
                IconButton(icon: const Icon(Icons.close, color: Colors.white38, size: 20),
                    onPressed: () => Navigator.pop(context), padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(minWidth: 36, minHeight: 36)),
              ])),
            const Divider(color: Colors.white12, height: 16),
            Padding(padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const _PropLabel('Fill Color'),
                _ColorRow(selected: _fillColor, includeTransparent: true, onSelect: (c) { setState(() => _fillColor = c); _apply(); }),
                const SizedBox(height: 14),
                const _PropLabel('Border / Stroke Color'),
                _ColorRow(selected: _borderColor, onSelect: (c) { setState(() => _borderColor = c); _apply(); }),
                const SizedBox(height: 14),
                _PropLabel('Border Width  ${_borderWidth.toStringAsFixed(1)} px'),
                _StyledSlider(value: _borderWidth.clamp(0.0, 20.0), min: 0, max: 20,
                    onChanged: (v) { setState(() => _borderWidth = v); _apply(); }),
                _PropLabel('Opacity  ${(_opacity * 100).toInt()}%'),
                _StyledSlider(value: _opacity.clamp(0.1, 1.0), min: 0.1, max: 1.0,
                    onChanged: (v) { setState(() => _opacity = v); _apply(); }),
                _PropLabel('Rotation  ${_rotation.toStringAsFixed(0)} deg'),
                _StyledSlider(value: _rotation, min: 0, max: 360,
                    onChanged: (v) { setState(() => _rotation = v); _apply(); }),
                const SizedBox(height: 12),
                Row(children: [
                  Expanded(child: OutlinedButton.icon(onPressed: widget.onDuplicate,
                      icon: const Icon(Icons.file_copy_outlined, size: 16), label: const Text('Duplicate'),
                      style: OutlinedButton.styleFrom(foregroundColor: Colors.white70,
                          side: BorderSide(color: Colors.white.withValues(alpha: 0.15)),
                          padding: const EdgeInsets.symmetric(vertical: 10)))),
                  const SizedBox(width: 8),
                  Expanded(child: ElevatedButton.icon(onPressed: widget.onDelete,
                      icon: const Icon(Icons.delete_outline, size: 16), label: const Text('Delete'),
                      style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFB71C1C),
                          foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 10)))),
                ]),
              ])),
          ]),
        ),
      ),
    );
  }
}

class _PropLabel extends StatelessWidget {
  final String label;
  const _PropLabel(this.label);
  @override
  Widget build(BuildContext context) => Padding(padding: const EdgeInsets.only(bottom: 6),
      child: Text(label, style: const TextStyle(color: Colors.white54, fontSize: 11, fontWeight: FontWeight.w600)));
}

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader(this.title);
  @override
  Widget build(BuildContext context) => Text(
    title,
    style: TextStyle(
      color: Colors.white.withValues(alpha: 0.4),
      fontSize: 10,
      fontWeight: FontWeight.w700,
      letterSpacing: 1.2,
    ),
  );
}

// ── Smooth Property Section Widget ──────────────────────────────────────────
class _SmoothPropertySection extends StatelessWidget {
  final String title;
  final String description;
  final IconData icon;
  final Widget child;

  const _SmoothPropertySection({
    required this.title,
    required this.description,
    required this.icon,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.03),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.06),
          width: 1,
        ),
      ),
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFFF4511E).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  icon,
                  size: 16,
                  color: const Color(0xFFF4511E),
                ),
              ),
              const SizedBox(width: 10),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.8),
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1,
                    ),
                  ),
                  Text(
                    description,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.35),
                      fontSize: 9,
                      fontWeight: FontWeight.w400,
                    ),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }
}

// ── Enhanced Styled Slider ──────────────────────────────────────────────────
class _EnhancedStyledSlider extends StatefulWidget {
  final double value;
  final double min;
  final double max;
  final ValueChanged<double> onChanged;

  const _EnhancedStyledSlider({
    required this.value,
    required this.min,
    required this.max,
    required this.onChanged,
  });

  @override
  State<_EnhancedStyledSlider> createState() => _EnhancedStyledSliderState();
}

class _EnhancedStyledSliderState extends State<_EnhancedStyledSlider> {
  late double _currentValue;

  @override
  void initState() {
    super.initState();
    _currentValue = widget.value;
  }

  @override
  Widget build(BuildContext context) {
    return SliderTheme(
      data: SliderThemeData(
        trackHeight: 6,
        thumbShape: const RoundSliderThumbShape(
          enabledThumbRadius: 10,
          elevation: 4,
        ),
        overlayShape: const RoundSliderOverlayShape(overlayRadius: 16),
        activeTrackColor: const Color(0xFFF4511E),
        inactiveTrackColor: Colors.white.withValues(alpha: 0.1),
        thumbColor: const Color(0xFFF4511E),
        overlayColor: const Color(0xFFF4511E).withValues(alpha: 0.2),
      ),
      child: Slider(
        value: _currentValue,
        min: widget.min,
        max: widget.max,
        onChanged: (value) {
          setState(() => _currentValue = value);
          widget.onChanged(value);
        },
      ),
    );
  }
}

class _StyledSlider extends StatelessWidget {
  final double value, min, max;
  final ValueChanged<double> onChanged;
  const _StyledSlider({required this.value, required this.min, required this.max, required this.onChanged});
  @override
  Widget build(BuildContext context) => SliderTheme(
      data: SliderTheme.of(context).copyWith(
        activeTrackColor: const Color(0xFFF4511E), inactiveTrackColor: Colors.white12,
        thumbColor: const Color(0xFFF4511E), overlayColor: const Color(0x33F4511E), trackHeight: 3),
      child: Slider(value: value, min: min, max: max, onChanged: onChanged));
}

class _ColorRow extends StatelessWidget {
  final Color selected;
  final ValueChanged<Color> onSelect;
  final bool includeTransparent;
  const _ColorRow({required this.selected, required this.onSelect, this.includeTransparent = false});
  static const _palette = <Color>[
    Color(0xFFFFFFFF), Color(0xFF000000), Color(0xFFFF5252), Color(0xFFFF7043),
    Color(0xFFFFAB40), Color(0xFFFFEB3B), Color(0xFF69F0AE), Color(0xFF26C6DA),
    Color(0xFF40C4FF), Color(0xFF448AFF), Color(0xFFE040FB), Color(0xFF8D6E63),
  ];
  @override
  Widget build(BuildContext context) {
    final all = [if (includeTransparent) Colors.transparent, ..._palette];
    return Wrap(spacing: 8, runSpacing: 8, children: all.map((c) {
      final sel = c == selected;
      return GestureDetector(onTap: () => onSelect(c),
        child: Container(width: 30, height: 30,
          decoration: BoxDecoration(color: c, shape: BoxShape.circle,
            border: Border.all(color: sel ? const Color(0xFFF4511E) : Colors.white.withValues(alpha: 0.22), width: sel ? 2.5 : 1.5)),
          child: c == Colors.transparent ? const Icon(Icons.block, size: 16, color: Colors.white38) : null));
    }).toList());
  }
}

// ── Compact color grid for stroke properties ────────────────────────────────
class _CompactColorGrid extends StatelessWidget {
  final Color selected;
  final ValueChanged<Color> onSelect;

  const _CompactColorGrid({required this.selected, required this.onSelect});

  static const _palette = <Color>[
    Color(0xFFFFFFFF), Color(0xFF000000), Color(0xFFFF5252), Color(0xFFFF7043),
    Color(0xFFFFAB40), Color(0xFFFFEB3B), Color(0xFF69F0AE), Color(0xFF26C6DA),
    Color(0xFF40C4FF), Color(0xFF448AFF), Color(0xFFE040FB), Color(0xFF8D6E63),
  ];

  @override
  Widget build(BuildContext context) {
    final selectedARGB = selected.toARGB32();
    return Wrap(
      spacing: 6,
      runSpacing: 6,
      children: _palette.map((c) {
        final sel = c.toARGB32() == selectedARGB;
        return GestureDetector(
          onTap: () => onSelect(c),
          child: Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: c,
              shape: BoxShape.circle,
              border: Border.all(
                color: sel ? const Color(0xFFF4511E) : Colors.white.withValues(alpha: 0.2),
                width: sel ? 2 : 1,
              ),
              boxShadow: sel
                  ? [
                      BoxShadow(
                        color: const Color(0xFFF4511E).withValues(alpha: 0.3),
                        blurRadius: 4,
                      )
                    ]
                  : null,
            ),
            child: sel
                ? Icon(
                    Icons.check,
                    size: 14,
                    color: c.computeLuminance() > 0.5 ? Colors.black87 : Colors.white,
                  )
                : null,
          ),
        );
      }).toList(),
    );
  }
}

// ── Compact property row ────────────────────────────────────────────────────
class _CompactPropRow extends StatelessWidget {
  final String label;
  final String value;
  final Widget slider;

  const _CompactPropRow(this.label, this.value, this.slider);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: const TextStyle(
                color: Colors.white54,
                fontSize: 11,
                fontWeight: FontWeight.w500,
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color: const Color(0xFFF4511E).withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                value,
                style: const TextStyle(
                  color: Color(0xFFF4511E),
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        slider,
      ],
    );
  }
}

class _StrokePropertiesSheet extends StatefulWidget {
  final StrokeModel stroke;
  final void Function({
    required Color color,
    required double strokeWidth,
    required double opacity,
    required double scale,
    required double rotation,
  }) onApply;

  const _StrokePropertiesSheet({
    required this.stroke,
    required this.onApply,
  });

  @override
  State<_StrokePropertiesSheet> createState() => _StrokePropertiesSheetState();
}

class _StrokePropertiesSheetState extends State<_StrokePropertiesSheet>
    with SingleTickerProviderStateMixin {
  late Color _color;
  late double _strokeWidth;
  late double _opacity;
  double _scale = 1.0;
  double _rotation = 0.0;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _color = widget.stroke.color;
    _strokeWidth = widget.stroke.strokeWidth;
    _opacity = widget.stroke.opacity;

    // Initialize animations
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 400),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOut),
    );

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.1),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeOut),
    );

    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _applyAndClose() {
    _animationController.reverse().then((_) {
      widget.onApply(
        color: _color,
        strokeWidth: _strokeWidth,
        opacity: _opacity,
        scale: _scale,
        rotation: _rotation,
      );
      Navigator.pop(context);
    });
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _fadeAnimation,
      child: SlideTransition(
        position: _slideAnimation,
        child: Dialog(
          backgroundColor: Colors.transparent,
          insetPadding: const EdgeInsets.all(16),
          elevation: 0,
          child: ConstrainedBox(
            constraints: const BoxConstraints(
              maxWidth: 440,
              maxHeight: 800,
            ),
            child: Container(
              decoration: BoxDecoration(
                color: const Color(0xFF0F0F1E),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(
                  color: Colors.white.withValues(alpha: 0.12),
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.7),
                    blurRadius: 48,
                    offset: const Offset(0, 20),
                    spreadRadius: 4,
                  ),
                  BoxShadow(
                    color: const Color(0xFFF4511E).withValues(alpha: 0.12),
                    blurRadius: 32,
                    offset: const Offset(0, 0),
                    spreadRadius: 0,
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(24),
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Premium Header
                      Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [
                              const Color(0xFF1A1A2E),
                              const Color(0xFF0F0F1E),
                            ],
                          ),
                          border: Border(
                            bottom: BorderSide(
                              color: const Color(0xFFF4511E).withValues(alpha: 0.15),
                              width: 1,
                            ),
                          ),
                        ),
                        padding: const EdgeInsets.fromLTRB(24, 20, 20, 20),
                        child: Row(
                          children: [
                            TweenAnimationBuilder<double>(
                              tween: Tween(begin: 0, end: 1),
                              duration: const Duration(milliseconds: 600),
                              builder: (context, value, child) {
                                return Transform.scale(
                                  scale: value,
                                  child: Container(
                                    width: 48,
                                    height: 48,
                                    decoration: BoxDecoration(
                                      gradient: LinearGradient(
                                        begin: Alignment.topLeft,
                                        end: Alignment.bottomRight,
                                        colors: [
                                          const Color(0xFFF4511E).withValues(alpha: 0.3),
                                          const Color(0xFFF4511E).withValues(alpha: 0.05),
                                        ],
                                      ),
                                      borderRadius: BorderRadius.circular(14),
                                      border: Border.all(
                                        color: const Color(0xFFF4511E).withValues(alpha: 0.2),
                                        width: 1,
                                      ),
                                    ),
                                    child: const Icon(
                                      Icons.brush,
                                      color: Color(0xFFF4511E),
                                      size: 24,
                                    ),
                                  ),
                                );
                              },
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  const Text(
                                    'Stroke Properties',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w800,
                                      fontSize: 18,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Customize your pen stroke',
                                    style: TextStyle(
                                      color: Colors.white.withValues(alpha: 0.45),
                                      fontSize: 12,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Material(
                              color: Colors.transparent,
                              child: IconButton(
                                onPressed: () => Navigator.pop(context),
                                icon: const Icon(Icons.close, color: Colors.white38, size: 22),
                                padding: EdgeInsets.zero,
                                constraints: const BoxConstraints(minWidth: 44, minHeight: 44),
                                style: IconButton.styleFrom(
                                  backgroundColor: Colors.white.withValues(alpha: 0.05),
                                  hoverColor: Colors.white.withValues(alpha: 0.1),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      // Content with smooth spacing
                      Padding(
                        padding: const EdgeInsets.fromLTRB(24, 24, 24, 24),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Color Section with smooth transition
                            _SmoothPropertySection(
                              title: 'COLOR',
                              description: 'Choose your stroke color',
                              icon: Icons.palette,
                              child: _CompactColorGrid(
                                selected: _color,
                                onSelect: (c) => setState(() => _color = c),
                              ),
                            ),
                            const SizedBox(height: 24),
                            // Width Section
                            _SmoothPropertySection(
                              title: 'STROKE WIDTH',
                              description: 'Adjust pen thickness',
                              icon: Icons.line_weight,
                              child: _CompactPropRow('Width', '${_strokeWidth.toStringAsFixed(1)}px',
                                _EnhancedStyledSlider(
                                  value: _strokeWidth.clamp(1.0, 30.0),
                                  min: 1,
                                  max: 30,
                                  onChanged: (v) => setState(() => _strokeWidth = v),
                                ),
                              ),
                            ),
                            const SizedBox(height: 24),
                            // Appearance Section
                            _SmoothPropertySection(
                              title: 'APPEARANCE',
                              description: 'Control transparency',
                              icon: Icons.opacity,
                              child: _CompactPropRow('Opacity', '${(_opacity * 100).toInt()}%',
                                _EnhancedStyledSlider(
                                  value: _opacity.clamp(0.1, 1.0),
                                  min: 0.1,
                                  max: 1.0,
                                  onChanged: (v) => setState(() => _opacity = v),
                                ),
                              ),
                            ),
                            const SizedBox(height: 24),
                            // Transform Section
                            _SmoothPropertySection(
                              title: 'TRANSFORM',
                              description: 'Scale and rotate',
                              icon: Icons.transform,
                              child: Column(
                                children: [
                                  _CompactPropRow('Scale', '${_scale.toStringAsFixed(2)}x',
                                    _EnhancedStyledSlider(
                                      value: _scale,
                                      min: 0.5,
                                      max: 2.5,
                                      onChanged: (v) => setState(() => _scale = v),
                                    ),
                                  ),
                                  const SizedBox(height: 16),
                                  _CompactPropRow('Rotate', '${_rotation.toStringAsFixed(0)}°',
                                    _EnhancedStyledSlider(
                                      value: _rotation,
                                      min: -180,
                                      max: 180,
                                      onChanged: (v) => setState(() => _rotation = v),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 28),
                            // Action Buttons with smooth effects
                            Row(
                              children: [
                                Expanded(
                                  child: Material(
                                    color: Colors.transparent,
                                    child: InkWell(
                                      onTap: () => Navigator.pop(context),
                                      borderRadius: BorderRadius.circular(12),
                                      highlightColor: Colors.white.withValues(alpha: 0.05),
                                      splashColor: Colors.white.withValues(alpha: 0.08),
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(vertical: 14),
                                        decoration: BoxDecoration(
                                          border: Border.all(
                                            color: Colors.white.withValues(alpha: 0.15),
                                            width: 1.5,
                                          ),
                                          borderRadius: BorderRadius.circular(12),
                                          color: Colors.white.withValues(alpha: 0.03),
                                        ),
                                        child: const Center(
                                          child: Text(
                                            'Cancel',
                                            style: TextStyle(
                                              color: Colors.white70,
                                              fontWeight: FontWeight.w600,
                                              fontSize: 14,
                                              letterSpacing: 0.5,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Material(
                                    color: Colors.transparent,
                                    child: InkWell(
                                      onTap: _applyAndClose,
                                      borderRadius: BorderRadius.circular(12),
                                      splashColor: Colors.white.withValues(alpha: 0.1),
                                      highlightColor: const Color(0xFFE63D00),
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(vertical: 14),
                                        decoration: BoxDecoration(
                                          gradient: LinearGradient(
                                            begin: Alignment.topLeft,
                                            end: Alignment.bottomRight,
                                            colors: [
                                              const Color(0xFFF4511E),
                                              const Color(0xFFE63D00),
                                            ],
                                          ),
                                          borderRadius: BorderRadius.circular(12),
                                          boxShadow: [
                                            BoxShadow(
                                              color: const Color(0xFFF4511E).withValues(alpha: 0.35),
                                              blurRadius: 20,
                                              offset: const Offset(0, 8),
                                              spreadRadius: 2,
                                            ),
                                          ],
                                        ),
                                        child: Row(
                                          mainAxisAlignment: MainAxisAlignment.center,
                                          children: [
                                            const Icon(Icons.check, size: 18, color: Colors.white),
                                            const SizedBox(width: 6),
                                            const Text(
                                              'Apply Changes',
                                              style: TextStyle(
                                                color: Colors.white,
                                                fontWeight: FontWeight.w700,
                                                fontSize: 14,
                                                letterSpacing: 0.5,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ── Annotation Painter ────────────────────────────────────────────────────────
class AnnotationPainter extends CustomPainter {
  final List<StrokeModel> strokes;
  final List<CanvasObjectModel> objects;
  final String? selectedObjectId;
  final bool showSelectionHandles;
  final String? selectedStrokeId;
  final List<Offset> lassoPoints;
  final Rect? groupSelectionRect;

  AnnotationPainter({
    required this.strokes,
    required this.objects,
    this.selectedObjectId,
    this.showSelectionHandles = false,
    this.selectedStrokeId,
    this.lassoPoints = const <Offset>[],
    this.groupSelectionRect,
  });

  @override
  void paint(Canvas canvas, Size size) {
    for (final stroke in strokes) { StrokeRenderer.drawStroke(canvas, stroke); }
    for (final obj in objects) { _drawObject(canvas, obj); }
    if (showSelectionHandles) {
      if (selectedObjectId != null) {
        final hits = objects.where((o) => o.id == selectedObjectId);
        if (hits.isNotEmpty) { final o = hits.first; _drawObjectSelection(canvas, Rect.fromLTWH(o.x, o.y, o.width, o.height)); }
      }
      if (selectedStrokeId != null) {
        final hits = strokes.where((s) => s.id == selectedStrokeId);
        if (hits.isNotEmpty) _drawStrokeSelection(canvas, hits.first);
      }
      if (groupSelectionRect != null) {
        _drawObjectSelection(canvas, groupSelectionRect!);
      }
    }
    if (lassoPoints.length > 1) {
      _drawLasso(canvas);
    }
  }

  void _drawLasso(Canvas canvas) {
    final path = Path()..moveTo(lassoPoints.first.dx, lassoPoints.first.dy);
    for (int i = 1; i < lassoPoints.length; i++) {
      path.lineTo(lassoPoints[i].dx, lassoPoints[i].dy);
    }

    if (lassoPoints.length > 2) {
      final closed = Path.from(path)..close();
      canvas.drawPath(
        closed,
        Paint()
          ..color = const Color(0xFFF4511E).withValues(alpha: 0.12)
          ..style = PaintingStyle.fill,
      );
    }

    canvas.drawPath(
      path,
      Paint()
        ..color = const Color(0xFFF4511E)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.8,
    );
  }

  void _drawObject(Canvas canvas, CanvasObjectModel obj) {
    final rot = obj.rotation;
    if (rot != 0.0) {
      final cx = obj.x + obj.width / 2, cy = obj.y + obj.height / 2;
      canvas.save();
      canvas.translate(cx, cy);
      canvas.rotate(rot * math.pi / 180);
      canvas.translate(-cx, -cy);
    }
    _drawObjectShape(canvas, obj);
    if (rot != 0.0) canvas.restore();
  }

  void _drawObjectShape(Canvas canvas, CanvasObjectModel obj) {
    final rect = Rect.fromLTWH(obj.x, obj.y, obj.width, obj.height);
    final fill = Paint()..color = obj.fillColor.withValues(alpha: obj.opacity)..style = PaintingStyle.fill;
    final bord = Paint()..color = obj.borderColor.withValues(alpha: obj.opacity)..strokeWidth = obj.borderWidth..style = PaintingStyle.stroke;
    switch (obj.type) {
      case ObjectType.rectangle:
        canvas.drawRect(rect, fill); if (obj.borderWidth > 0) canvas.drawRect(rect, bord);
      case ObjectType.roundedRect:
        final rr = RRect.fromRectAndRadius(rect, Radius.circular(obj.height * 0.1));
        canvas.drawRRect(rr, fill); if (obj.borderWidth > 0) canvas.drawRRect(rr, bord);
      case ObjectType.circle:
        final c = rect.center, r = (obj.width + obj.height) / 4;
        canvas.drawCircle(c, r, fill); if (obj.borderWidth > 0) canvas.drawCircle(c, r, bord);
      case ObjectType.line:
        canvas.drawLine(Offset(obj.x, obj.y), Offset(obj.x + obj.width, obj.y + obj.height), bord..style = PaintingStyle.stroke);
      case ObjectType.arrow:
        _drawArrow(canvas, Offset(obj.x, obj.y), Offset(obj.x + obj.width, obj.y + obj.height), bord);
      case ObjectType.doubleArrow:
        final s = Offset(obj.x, obj.y), e = Offset(obj.x + obj.width, obj.y + obj.height);
        _drawArrow(canvas, s, e, bord); _drawArrow(canvas, e, s, bord);
      case ObjectType.callout:
        final bubble = RRect.fromRectAndRadius(rect, const Radius.circular(12));
        canvas.drawRRect(bubble, fill); if (obj.borderWidth > 0) canvas.drawRRect(bubble, bord);
        final tail = Path()..moveTo(rect.left + rect.width * 0.18, rect.bottom)..lineTo(rect.left + rect.width * 0.28, rect.bottom)..lineTo(rect.left + rect.width * 0.22, rect.bottom + 18)..close();
        canvas.drawPath(tail, fill); if (obj.borderWidth > 0) canvas.drawPath(tail, bord);
      case ObjectType.triangle:
        final tp = Path()..moveTo(obj.x + obj.width / 2, obj.y)..lineTo(obj.x + obj.width, obj.y + obj.height)..lineTo(obj.x, obj.y + obj.height)..close();
        canvas.drawPath(tp, fill); if (obj.borderWidth > 0) canvas.drawPath(tp, bord);
      case ObjectType.textBox:
        canvas.drawRect(rect, fill); if (obj.borderWidth > 0) canvas.drawRect(rect, bord);
        _paintText(canvas, rect, (obj.extra['text'] as String?) ?? 'Text', obj.borderColor.withValues(alpha: obj.opacity), 20);
      case ObjectType.stickyNote:
        final nr = RRect.fromRectAndRadius(rect, const Radius.circular(10));
        canvas.drawRRect(nr, fill); if (obj.borderWidth > 0) canvas.drawRRect(nr, bord);
        final fold = Path()..moveTo(rect.right - 22, rect.top)..lineTo(rect.right, rect.top)..lineTo(rect.right, rect.top + 22)..close();
        canvas.drawPath(fold, Paint()..color = obj.borderColor.withValues(alpha: obj.opacity * 0.22)..style = PaintingStyle.fill);
        _paintText(canvas, rect, (obj.extra['text'] as String?) ?? 'Note', Colors.brown.shade900.withValues(alpha: obj.opacity), 18);
      case ObjectType.star:
        final sp = _starPath(rect, 5); canvas.drawPath(sp, fill); if (obj.borderWidth > 0) canvas.drawPath(sp, bord);
      case ObjectType.polygon:
        final pp = _polygonPath(rect, 6); canvas.drawPath(pp, fill); if (obj.borderWidth > 0) canvas.drawPath(pp, bord);
      default:
        canvas.drawRect(rect, fill); if (obj.borderWidth > 0) canvas.drawRect(rect, bord);
    }
  }

  void _paintText(Canvas canvas, Rect rect, String text, Color color, double size) {
    final tp = TextPainter(
      text: TextSpan(text: text, style: TextStyle(color: color, fontSize: size, fontWeight: FontWeight.w500)),
      textDirection: TextDirection.ltr, maxLines: 2, ellipsis: '...',
    )..layout(maxWidth: rect.width - 16);
    tp.paint(canvas, Offset(rect.left + 8, rect.top + 8));
  }

  Path _starPath(Rect rect, int points) {
    final cx = rect.center.dx, cy = rect.center.dy;
    final outerR = math.min(rect.width, rect.height) / 2, innerR = outerR * 0.45;
    final path = Path();
    for (int i = 0; i < points * 2; i++) {
      final angle = (math.pi / points) * i - math.pi / 2;
      final r = i.isEven ? outerR : innerR;
      i == 0 ? path.moveTo(cx + r * math.cos(angle), cy + r * math.sin(angle)) : path.lineTo(cx + r * math.cos(angle), cy + r * math.sin(angle));
    }
    return path..close();
  }

  Path _polygonPath(Rect rect, int sides) {
    final cx = rect.center.dx, cy = rect.center.dy, r = math.min(rect.width, rect.height) / 2;
    final path = Path();
    for (int i = 0; i < sides; i++) {
      final angle = (2 * math.pi / sides) * i - math.pi / 2;
      i == 0 ? path.moveTo(cx + r * math.cos(angle), cy + r * math.sin(angle)) : path.lineTo(cx + r * math.cos(angle), cy + r * math.sin(angle));
    }
    return path..close();
  }

  void _drawArrow(Canvas canvas, Offset start, Offset end, Paint paint) {
    canvas.drawLine(start, end, paint);
    final angle = math.atan2(end.dy - start.dy, end.dx - start.dx);
    const h = 12.0;
    canvas.drawLine(end, Offset(end.dx - h * math.cos(angle - math.pi / 6), end.dy - h * math.sin(angle - math.pi / 6)), paint);
    canvas.drawLine(end, Offset(end.dx - h * math.cos(angle + math.pi / 6), end.dy - h * math.sin(angle + math.pi / 6)), paint);
  }

  void _drawObjectSelection(Canvas canvas, Rect rect) {
    const orange = Color(0xFFF4511E);
    canvas.drawRect(rect.inflate(1), Paint()..color = orange..style = PaintingStyle.stroke..strokeWidth = 2);
    for (final pt in [rect.topLeft, rect.topRight, rect.bottomLeft, rect.bottomRight]) {
      canvas.drawCircle(pt, 5.5, Paint()..color = orange..style = PaintingStyle.fill);
      canvas.drawCircle(pt, 7.5, Paint()..color = Colors.white.withValues(alpha: 0.9)..style = PaintingStyle.stroke..strokeWidth = 1.2);
    }
    final rotPos = Offset(rect.center.dx, rect.top - 42);
    canvas.drawLine(Offset(rect.center.dx, rect.top), rotPos, Paint()..color = orange.withValues(alpha: 0.7)..strokeWidth = 1.5);
    canvas.drawCircle(rotPos, 9, Paint()..color = orange..style = PaintingStyle.fill);
    canvas.drawCircle(rotPos, 9, Paint()..color = Colors.white.withValues(alpha: 0.88)..style = PaintingStyle.stroke..strokeWidth = 1.5);
    canvas.drawArc(Rect.fromCenter(center: rotPos, width: 12, height: 12), -math.pi * 0.9, math.pi * 1.4, false,
        Paint()..color = Colors.white..style = PaintingStyle.stroke..strokeWidth = 1.8..strokeCap = StrokeCap.round);
  }

  void _drawStrokeSelection(Canvas canvas, StrokeModel stroke) {
    if (stroke.points.isEmpty) return;
    double minX = stroke.points.first.dx, maxX = stroke.points.first.dx, minY = stroke.points.first.dy, maxY = stroke.points.first.dy;
    for (final p in stroke.points) { if (p.dx < minX) minX = p.dx; if (p.dx > maxX) maxX = p.dx; if (p.dy < minY) minY = p.dy; if (p.dy > maxY) maxY = p.dy; }
    final rect = Rect.fromLTRB(minX, minY, maxX, maxY).inflate(stroke.strokeWidth / 2 + 6);
    canvas.drawRRect(
      RRect.fromRectAndRadius(rect, const Radius.circular(6)),
      Paint()
        ..color = const Color(0xFFF4511E).withValues(alpha: 0.65)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.8
        ..strokeCap = StrokeCap.round,
    );

    const orange = Color(0xFFF4511E);
    for (final pt in [rect.topLeft, rect.topRight, rect.bottomLeft, rect.bottomRight]) {
      canvas.drawCircle(pt, 5.5, Paint()..color = orange..style = PaintingStyle.fill);
      canvas.drawCircle(pt, 7.5, Paint()..color = Colors.white.withValues(alpha: 0.9)..style = PaintingStyle.stroke..strokeWidth = 1.2);
    }
    final rotPos = Offset(rect.center.dx, rect.top - 42);
    canvas.drawLine(Offset(rect.center.dx, rect.top), rotPos, Paint()..color = orange.withValues(alpha: 0.7)..strokeWidth = 1.5);
    canvas.drawCircle(rotPos, 9, Paint()..color = orange..style = PaintingStyle.fill);
    canvas.drawCircle(rotPos, 9, Paint()..color = Colors.white.withValues(alpha: 0.88)..style = PaintingStyle.stroke..strokeWidth = 1.5);
    canvas.drawArc(
      Rect.fromCenter(center: rotPos, width: 12, height: 12),
      -math.pi * 0.9,
      math.pi * 1.4,
      false,
      Paint()
        ..color = Colors.white
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.8
        ..strokeCap = StrokeCap.round,
    );
  }

  @override
  bool shouldRepaint(AnnotationPainter old) =>
      !identical(strokes, old.strokes) || !identical(objects, old.objects) ||
      selectedObjectId != old.selectedObjectId || showSelectionHandles != old.showSelectionHandles ||
      selectedStrokeId != old.selectedStrokeId || !identical(lassoPoints, old.lassoPoints) ||
      groupSelectionRect != old.groupSelectionRect;
}
