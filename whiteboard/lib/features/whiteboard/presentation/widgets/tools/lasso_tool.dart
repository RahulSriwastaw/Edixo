// lib/features/whiteboard/presentation/widgets/tools/lasso_tool.dart
// Lasso Tool — Free-form + Rect selection, Move, Resize, Rotate, Style edit
// Works with existing CanvasObjectModel + StrokeModel infrastructure

import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../data/models/canvas_object_model.dart';
import '../../../data/models/stroke_model.dart';
import '../../providers/canvas_provider.dart';
import '../../providers/tool_provider.dart';

// ─────────────────────────────────────────────────────────────────────────────
// Lasso Mode
// ─────────────────────────────────────────────────────────────────────────────

enum LassoMode {
  freeform,   // Free-hand polygon lasso
  rect,       // Drag rectangle select
}

// ─────────────────────────────────────────────────────────────────────────────
// Selection Handle Enum — 8 resize + 1 rotate + 1 move (body)
// ─────────────────────────────────────────────────────────────────────────────

enum SelectHandle {
  topLeft, topCenter, topRight,
  middleLeft, middleRight,
  bottomLeft, bottomCenter, bottomRight,
  rotate,   // above top-center
  none,     // hit body → move
}

// ─────────────────────────────────────────────────────────────────────────────
// Lasso Selection State
// ─────────────────────────────────────────────────────────────────────────────

class LassoState {
  // Drawing phase
  final LassoMode mode;
  final bool isDrawing;
  final List<Offset> lassoPath;  // freeform points
  final Offset? rectStart;       // rect mode start
  final Offset? rectEnd;         // rect mode current

  // Selection
  final Set<String> selectedObjectIds;
  final Set<int> selectedStrokeIndices;

  // Transform in progress
  final bool isDragging;
  final bool isResizing;
  final bool isRotating;
  final SelectHandle activeHandle;
  final Offset? dragStart;
  final Rect? initialBounds;    // bounds at transform start
  final double initialAngle;    // rotation at transform start

  // Clipboard
  final List<CanvasObjectModel> clipboard;

  final Rect? currentBounds;

  const LassoState({
    this.mode = LassoMode.rect,
    this.isDrawing = false,
    this.lassoPath = const [],
    this.rectStart,
    this.rectEnd,
    this.selectedObjectIds = const {},
    this.selectedStrokeIndices = const {},
    this.isDragging = false,
    this.isResizing = false,
    this.isRotating = false,
    this.activeHandle = SelectHandle.none,
    this.dragStart,
    this.initialBounds,
    this.initialAngle = 0,
    this.currentBounds,
    this.clipboard = const [],
  });

  bool get hasSelection =>
      selectedObjectIds.isNotEmpty || selectedStrokeIndices.isNotEmpty;

  LassoState copyWith({
    LassoMode? mode,
    bool? isDrawing,
    List<Offset>? lassoPath,
    Offset? rectStart,
    Offset? rectEnd,
    Set<String>? selectedObjectIds,
    Set<int>? selectedStrokeIndices,
    bool? isDragging,
    bool? isResizing,
    bool? isRotating,
    SelectHandle? activeHandle,
    Offset? dragStart,
    Rect? initialBounds,
    double? initialAngle,
    Rect? currentBounds,
    List<CanvasObjectModel>? clipboard,
    // Nullable reset sentinels
    bool clearRectStart = false,
    bool clearRectEnd = false,
    bool clearDragStart = false,
    bool clearBounds = false,
  }) =>
      LassoState(
        mode: mode ?? this.mode,
        isDrawing: isDrawing ?? this.isDrawing,
        lassoPath: lassoPath ?? this.lassoPath,
        rectStart: clearRectStart ? null : rectStart ?? this.rectStart,
        rectEnd: clearRectEnd ? null : rectEnd ?? this.rectEnd,
        selectedObjectIds: selectedObjectIds ?? this.selectedObjectIds,
        selectedStrokeIndices:
            selectedStrokeIndices ?? this.selectedStrokeIndices,
        isDragging: isDragging ?? this.isDragging,
        isResizing: isResizing ?? this.isResizing,
        isRotating: isRotating ?? this.isRotating,
        activeHandle: activeHandle ?? this.activeHandle,
        dragStart: clearDragStart ? null : dragStart ?? this.dragStart,
        initialBounds: clearBounds ? null : initialBounds ?? this.initialBounds,
        initialAngle: initialAngle ?? this.initialAngle,
        currentBounds: currentBounds ?? this.currentBounds,
        clipboard: clipboard ?? this.clipboard,
      );

  LassoState clearTransform() => copyWith(
        isDragging: false,
        isResizing: false,
        isRotating: false,
        activeHandle: SelectHandle.none,
        clearDragStart: true,
        clearBounds: true,
      );

  LassoState clearDrawing() => copyWith(
        isDrawing: false,
        lassoPath: [],
        clearRectStart: true,
        clearRectEnd: true,
      );

  LassoState clearAll() => const LassoState();
}

// ─────────────────────────────────────────────────────────────────────────────
// Lasso Notifier
// ─────────────────────────────────────────────────────────────────────────────

class LassoNotifier extends StateNotifier<LassoState> {
  LassoNotifier() : super(const LassoState());

  void setMode(LassoMode mode) => state = state.copyWith(mode: mode);

  void clearSelection() => state = state.clearAll();

  // ── Drawing phase ──────────────────────────────────────────────────────────

  void startDraw(Offset point) {
    state = state.copyWith(
      isDrawing: true,
      lassoPath: state.mode == LassoMode.freeform ? [point] : [],
      rectStart: state.mode == LassoMode.rect ? point : null,
      rectEnd: state.mode == LassoMode.rect ? point : null,
      selectedObjectIds: {},
      selectedStrokeIndices: {},
    );
  }

  void updateDraw(Offset point) {
    if (!state.isDrawing) return;
    if (state.mode == LassoMode.freeform) {
      // Simplify: only add if moved enough
      final last = state.lassoPath.isEmpty ? null : state.lassoPath.last;
      if (last == null || (point - last).distance > 4) {
        state = state.copyWith(lassoPath: [...state.lassoPath, point]);
      }
    } else {
      state = state.copyWith(rectEnd: point);
    }
  }

  /// Finalize selection — call with current canvas objects + strokes
  void endDraw({
    required List<CanvasObjectModel> objects,
    required List<StrokeModel> strokes,
  }) {
    if (!state.isDrawing) return;

    final selObjs = <String>{};
    final selStrokes = <int>{};

    if (state.mode == LassoMode.freeform && state.lassoPath.length > 2) {
      // Close polygon
      final poly = [...state.lassoPath, state.lassoPath.first];

      for (final obj in objects) {
        final rect = Rect.fromLTWH(obj.x, obj.y, obj.width, obj.height);
        if (_rectIntersectsPolygon(rect, poly)) selObjs.add(obj.id);
      }
      for (int i = 0; i < strokes.length; i++) {
        if (_strokeIntersectsPolygon(strokes[i], poly)) selStrokes.add(i);
      }
    } else if (state.mode == LassoMode.rect &&
        state.rectStart != null &&
        state.rectEnd != null) {
      final selRect = Rect.fromPoints(state.rectStart!, state.rectEnd!);

      for (final obj in objects) {
        final rect = Rect.fromLTWH(obj.x, obj.y, obj.width, obj.height);
        if (selRect.overlaps(rect)) selObjs.add(obj.id);
      }
      for (int i = 0; i < strokes.length; i++) {
        if (_strokeIntersectsRect(strokes[i], selRect)) selStrokes.add(i);
      }
    }

    final currentBounds = _computeBounds(
      objects: objects.where((o) => selObjs.contains(o.id)).toList(),
      strokes: selStrokes.where((i) => i < strokes.length).map((i) => strokes[i]).toList(),
    );

    state = state
        .clearDrawing()
        .copyWith(
          selectedObjectIds: selObjs,
          selectedStrokeIndices: selStrokes,
          currentBounds: currentBounds,
        );
  }

  // ── Transform start ────────────────────────────────────────────────────────

  void startTransform(
    Offset point,
    SelectHandle handle,
    Rect selectionBounds,
  ) {
    state = state.copyWith(
      isDragging: handle == SelectHandle.none,
      isResizing: handle != SelectHandle.none && handle != SelectHandle.rotate,
      isRotating: handle == SelectHandle.rotate,
      activeHandle: handle,
      dragStart: point,
      initialBounds: selectionBounds,
    );
  }

  void updateTransform(
    Offset point, {
    required void Function(double dx, double dy) onMove,
    required void Function(Rect newBounds, Rect oldBounds) onResize,
    required void Function(double angleDelta) onRotate,
  }) {
    if (state.dragStart == null || state.initialBounds == null) return;

    final delta = point - state.dragStart!;

    if (state.isDragging) {
      onMove(delta.dx, delta.dy);
      // Update drag start each frame for smooth incremental move
      state = state.copyWith(dragStart: point);
    } else if (state.isResizing) {
      final nb = _resizedBounds(state.initialBounds!, state.activeHandle, delta);
      onResize(nb, state.initialBounds!);
    } else if (state.isRotating) {
      final center = state.initialBounds!.center;
      final startAngle = math.atan2(
          state.dragStart!.dy - center.dy, state.dragStart!.dx - center.dx);
      final currAngle =
          math.atan2(point.dy - center.dy, point.dx - center.dx);
      onRotate(currAngle - startAngle);
    }
  }

  void endTransform() => state = state.clearTransform();

  void updateCurrentBounds(Rect? bounds) => state = state.copyWith(currentBounds: bounds);

  static Rect? _computeBounds({
    required List<CanvasObjectModel> objects,
    required List<StrokeModel> strokes,
  }) {
    double? minX, minY, maxX, maxY;

    void expand(double x, double y) {
      minX = minX == null ? x : math.min(minX!, x);
      minY = minY == null ? y : math.min(minY!, y);
      maxX = maxX == null ? x : math.max(maxX!, x);
      maxY = maxY == null ? y : math.max(maxY!, y);
    }

    for (final obj in objects) {
      expand(obj.x, obj.y);
      expand(obj.x + obj.width, obj.y + obj.height);
    }
    for (final stroke in strokes) {
      for (final p in stroke.points) {
        expand(p.dx, p.dy);
      }
    }

    if (minX == null) return null;
    return Rect.fromLTRB(minX! - 4, minY! - 4, maxX! + 4, maxY! + 4);
  }

  // ── Clipboard ──────────────────────────────────────────────────────────────

  void copySelected(List<CanvasObjectModel> selected) =>
      state = state.copyWith(clipboard: List.from(selected));

  List<CanvasObjectModel> pasteWithOffset(double dx, double dy) {
    return state.clipboard
        .map((o) => o.copyWith(
              id: _uuid(),
              x: o.x + dx,
              y: o.y + dy,
            ))
        .toList();
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  static Rect _resizedBounds(
      Rect bounds, SelectHandle handle, Offset delta) {
    double l = bounds.left;
    double t = bounds.top;
    double r = bounds.right;
    double b = bounds.bottom;

    switch (handle) {
      case SelectHandle.topLeft:
        l += delta.dx; t += delta.dy; break;
      case SelectHandle.topCenter:
        t += delta.dy; break;
      case SelectHandle.topRight:
        r += delta.dx; t += delta.dy; break;
      case SelectHandle.middleLeft:
        l += delta.dx; break;
      case SelectHandle.middleRight:
        r += delta.dx; break;
      case SelectHandle.bottomLeft:
        l += delta.dx; b += delta.dy; break;
      case SelectHandle.bottomCenter:
        b += delta.dy; break;
      case SelectHandle.bottomRight:
        r += delta.dx; b += delta.dy; break;
      default:
        break;
    }

    // Enforce minimum size
    if (r - l < 20) { if (delta.dx < 0) l = r - 20; else r = l + 20; }
    if (b - t < 20) { if (delta.dy < 0) t = b - 20; else b = t + 20; }

    return Rect.fromLTRB(l, t, r, b);
  }

  static bool _rectIntersectsPolygon(Rect rect, List<Offset> poly) {
    // Check if any polygon point is inside rect
    for (final p in poly) {
      if (rect.contains(p)) return true;
    }
    // Check if rect center is inside polygon
    if (_pointInPolygon(rect.center, poly)) return true;
    // Check edge intersections
    final corners = [
      rect.topLeft, rect.topRight, rect.bottomRight, rect.bottomLeft,
    ];
    for (int i = 0; i < corners.length; i++) {
      final a = corners[i];
      final b = corners[(i + 1) % corners.length];
      for (int j = 0; j < poly.length - 1; j++) {
        if (_segmentsIntersect(a, b, poly[j], poly[j + 1])) return true;
      }
    }
    return false;
  }

  static bool _strokeIntersectsPolygon(
      StrokeModel stroke, List<Offset> poly) {
    for (final p in stroke.points) {
      if (_pointInPolygon(p, poly)) return true;
    }
    return false;
  }

  static bool _strokeIntersectsRect(StrokeModel stroke, Rect rect) {
    for (final p in stroke.points) {
      if (rect.contains(p)) return true;
    }
    return false;
  }

  static bool _pointInPolygon(Offset p, List<Offset> poly) {
    bool inside = false;
    int j = poly.length - 1;
    for (int i = 0; i < poly.length; i++) {
      if (((poly[i].dy > p.dy) != (poly[j].dy > p.dy)) &&
          (p.dx <
              (poly[j].dx - poly[i].dx) *
                      (p.dy - poly[i].dy) /
                      (poly[j].dy - poly[i].dy) +
                  poly[i].dx)) {
        inside = !inside;
      }
      j = i;
    }
    return inside;
  }

  static bool _segmentsIntersect(
      Offset a1, Offset a2, Offset b1, Offset b2) {
    final d1 = _cross(a2 - a1, b1 - a1);
    final d2 = _cross(a2 - a1, b2 - a1);
    final d3 = _cross(b2 - b1, a1 - b1);
    final d4 = _cross(b2 - b1, a2 - b1);
    if (d1 * d2 < 0 && d3 * d4 < 0) return true;
    return false;
  }

  static double _cross(Offset a, Offset b) => a.dx * b.dy - a.dy * b.dx;

  static String _uuid() =>
      DateTime.now().microsecondsSinceEpoch.toRadixString(36) +
      math.Random().nextInt(9999).toString();
}

final lassoProvider =
    StateNotifierProvider<LassoNotifier, LassoState>((_) => LassoNotifier());

// ─────────────────────────────────────────────────────────────────────────────
// Lasso Tool Handler — bridges LassoNotifier ↔ CanvasNotifier
// ─────────────────────────────────────────────────────────────────────────────

class LassoToolHandler {
  final dynamic ref;
  LassoToolHandler(this.ref);

  // ── Pointer events ─────────────────────────────────────────────────────────

  void onPointerDown(Offset point, Rect? selectionBounds) {
    final state = ref.read(lassoProvider);

    if (state.hasSelection && selectionBounds != null) {
      // Check if hit on a handle
      final handle = LassoHandlePainter.checkHit(point, selectionBounds);
      if (handle != null) {
        // Capture state BEFORE transform for undo
        ref.read(canvasNotifierProvider.notifier).saveSnapshot();
        
        ref
            .read(lassoProvider.notifier)
            .startTransform(point, handle, selectionBounds);
        return;
      }
      // Hit inside body → move
      if (selectionBounds.contains(point)) {
        // Capture state BEFORE transform for undo
        ref.read(canvasNotifierProvider.notifier).saveSnapshot();

        ref.read(lassoProvider.notifier).startTransform(
            point, SelectHandle.none, selectionBounds);
        return;
      }
    }

    // Start new selection draw if it's a lasso tool
    final tool = ref.read(toolNotifierProvider).activeTool;
    if (tool == Tool.lassoFreeform || tool == Tool.lassoRect) {
      ref.read(lassoProvider.notifier).startDraw(point);
    }
  }

  void onPointerMove(Offset point, Rect? selectionBounds) {
    final state = ref.read(lassoProvider);

    if (state.isDrawing) {
      ref.read(lassoProvider.notifier).updateDraw(point);
      return;
    }

    if (state.isDragging || state.isResizing || state.isRotating) {
      final canvas = ref.read(canvasNotifierProvider.notifier);

      ref.read(lassoProvider.notifier).updateTransform(
        point,
        onMove: (dx, dy) {
          for (final id in state.selectedObjectIds) {
            canvas.moveObject(id, dx, dy);
          }
          for (final i in state.selectedStrokeIndices) {
            canvas.moveStroke(i, dx, dy);
          }
          if (state.currentBounds != null) {
            ref.read(lassoProvider.notifier).updateCurrentBounds(
                  state.currentBounds!.shift(Offset(dx, dy)),
                );
          }
        },
        onResize: (newBounds, oldBounds) {
          final scaleX = newBounds.width / oldBounds.width;
          final scaleY = newBounds.height / oldBounds.height;
          for (final id in state.selectedObjectIds) {
            canvas.resizeObject(
              id,
              scaleX: scaleX,
              scaleY: scaleY,
              pivot: newBounds.topLeft,
            );
          }
          ref.read(lassoProvider.notifier).updateCurrentBounds(newBounds);
        },
        onRotate: (angleDelta) {
          final center = selectionBounds?.center ?? Offset.zero;
          for (final id in state.selectedObjectIds) {
            canvas.rotateObject(id, angleDelta, center);
          }
          for (final i in state.selectedStrokeIndices) {
            canvas.rotateStroke(i, angleDelta, center);
          }
          // Bounds don't change much during rotation if centered, but we can recompute
        },
      );
    }
  }

  void onPointerUp(Offset point) {
    final state = ref.read(lassoProvider);

    if (state.isDrawing) {
      final canvas = ref.read(canvasNotifierProvider);
      ref.read(lassoProvider.notifier).endDraw(
        objects: canvas.objects,
        strokes: canvas.strokes,
      );
      return;
    }

    if (state.isDragging || state.isResizing || state.isRotating) {
      ref.read(lassoProvider.notifier).endTransform();
      // Finalize the state in undo history
      ref.read(canvasNotifierProvider.notifier).saveSnapshot();
    }
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  void deleteSelected() {
    final state = ref.read(lassoProvider);
    final canvas = ref.read(canvasNotifierProvider.notifier);

    for (final id in state.selectedObjectIds) {
      canvas.removeObject(id);
    }
    final sortedStrokes = state.selectedStrokeIndices.toList()
      ..sort((a, b) => b.compareTo(a));
    for (final i in sortedStrokes) {
      canvas.removeStroke(i);
    }
    ref.read(lassoProvider.notifier).clearSelection();
  }

  void duplicateSelected() {
    final state = ref.read(lassoProvider);
    final canvas = ref.read(canvasNotifierProvider);
    final canvasNotifier = ref.read(canvasNotifierProvider.notifier);

    final selected = canvas.objects
        .where((o) => state.selectedObjectIds.contains(o.id))
        .toList();

    ref.read(lassoProvider.notifier).copySelected(selected);
    final pasted =
        ref.read(lassoProvider.notifier).pasteWithOffset(16, 16);
    for (final obj in pasted) {
      canvasNotifier.addObject(obj);
    }

    // Select the new copies
    ref.read(lassoProvider.notifier)
      ..clearSelection()
      ..state = ref.read(lassoProvider).copyWith(
          selectedObjectIds: pasted.map((o) => o.id).toSet());
  }

  void copySelected() {
    final state = ref.read(lassoProvider);
    final canvas = ref.read(canvasNotifierProvider);
    final selected = canvas.objects
        .where((o) => state.selectedObjectIds.contains(o.id))
        .toList();
    ref.read(lassoProvider.notifier).copySelected(selected);
  }

  void paste() {
    final pasted =
        ref.read(lassoProvider.notifier).pasteWithOffset(24, 24);
    final canvasNotifier = ref.read(canvasNotifierProvider.notifier);
    for (final obj in pasted) {
      canvasNotifier.addObject(obj);
    }
    ref.read(lassoProvider.notifier).state =
        ref.read(lassoProvider).copyWith(
          selectedObjectIds: pasted.map((o) => o.id).toSet(),
          selectedStrokeIndices: {},
        );
  }

  void bringToFront() {
    final state = ref.read(lassoProvider);
    final canvas = ref.read(canvasNotifierProvider.notifier);
    for (final id in state.selectedObjectIds) {
      canvas.bringToFront(id);
    }
  }

  void sendToBack() {
    final state = ref.read(lassoProvider);
    final canvas = ref.read(canvasNotifierProvider.notifier);
    for (final id in state.selectedObjectIds) {
      canvas.sendToBack(id);
    }
  }

  void setFillColor(Color color) {
    final state = ref.read(lassoProvider);
    final canvas = ref.read(canvasNotifierProvider.notifier);
    for (final id in state.selectedObjectIds) {
      canvas.updateObjectFill(id, color.toARGB32());
    }
  }

  void setBorderColor(Color color) {
    final state = ref.read(lassoProvider);
    final canvas = ref.read(canvasNotifierProvider.notifier);
    for (final id in state.selectedObjectIds) {
      canvas.updateObjectBorder(id, color.toARGB32());
    }
  }

  void setOpacity(double opacity) {
    final state = ref.read(lassoProvider);
    final canvas = ref.read(canvasNotifierProvider.notifier);
    for (final id in state.selectedObjectIds) {
      canvas.updateObjectOpacity(id, opacity);
    }
  }

  void flipHorizontal() {
    final state = ref.read(lassoProvider);
    final canvas = ref.read(canvasNotifierProvider.notifier);
    for (final id in state.selectedObjectIds) {
      canvas.flipObjectH(id);
    }
  }

  void flipVertical() {
    final state = ref.read(lassoProvider);
    final canvas = ref.read(canvasNotifierProvider.notifier);
    for (final id in state.selectedObjectIds) {
      canvas.flipObjectV(id);
    }
  }

  void lockSelected() {
    final state = ref.read(lassoProvider);
    final canvas = ref.read(canvasNotifierProvider.notifier);
    for (final id in state.selectedObjectIds) {
      canvas.toggleLock(id);
    }
  }

  void selectAll({
    required List<CanvasObjectModel> objects,
    required List<StrokeModel> strokes,
  }) {
    ref.read(lassoProvider.notifier).state =
        ref.read(lassoProvider).copyWith(
          selectedObjectIds: objects.map((o) => o.id).toSet(),
          selectedStrokeIndices:
              Set.from(List.generate(strokes.length, (i) => i)),
        );
  }
}

// Provider
final lassoToolHandlerProvider = Provider<LassoToolHandler>(
  (ref) => LassoToolHandler(ref),
);

// ─────────────────────────────────────────────────────────────────────────────
// Lasso Handle Painter — drawn as overlay on canvas
// ─────────────────────────────────────────────────────────────────────────────

class LassoHandlePainter extends CustomPainter {
  final LassoState lassoState;
  final Rect? selectionBounds;
  final double rotation;

  static const double _handleSize = 9.0;
  static const double _rotateOffset = 24.0;
  static const double _hitRadius = 14.0;

  static const _accent = Color(0xFFFF6B2B);
  static const _white  = Color(0xFFFFFFFF);
  static const _blue   = Color(0xFF2196F3);

  LassoHandlePainter({
    required this.lassoState,
    required this.selectionBounds,
    this.rotation = 0,
  });

  // ── Hit testing ────────────────────────────────────────────────────────────

  static SelectHandle? checkHit(Offset point, Rect bounds) {
    final positions = _handlePositions(bounds);
    for (final entry in positions.entries) {
      if ((point - entry.value).distance <= _hitRadius) return entry.key;
    }
    // Check rotate handle
    final rotatePos = _rotateHandlePos(bounds);
    if ((point - rotatePos).distance <= _hitRadius) return SelectHandle.rotate;
    return null;
  }

  static Map<SelectHandle, Offset> _handlePositions(Rect r) => {
        SelectHandle.topLeft:      r.topLeft,
        SelectHandle.topCenter:    Offset(r.center.dx, r.top),
        SelectHandle.topRight:     r.topRight,
        SelectHandle.middleLeft:   Offset(r.left, r.center.dy),
        SelectHandle.middleRight:  Offset(r.right, r.center.dy),
        SelectHandle.bottomLeft:   r.bottomLeft,
        SelectHandle.bottomCenter: Offset(r.center.dx, r.bottom),
        SelectHandle.bottomRight:  r.bottomRight,
      };

  static Offset _rotateHandlePos(Rect r) =>
      Offset(r.center.dx, r.top - _rotateOffset);

  // ── Paint ──────────────────────────────────────────────────────────────────

  @override
  void paint(Canvas canvas, Size size) {
    // ── Draw lasso path preview ──────────────────────────────────────────────
    if (lassoState.isDrawing) {
      if (lassoState.mode == LassoMode.freeform &&
          lassoState.lassoPath.length > 1) {
        final path = Path()..moveTo(
            lassoState.lassoPath.first.dx, lassoState.lassoPath.first.dy);
        for (final p in lassoState.lassoPath.skip(1)) {
          path.lineTo(p.dx, p.dy);
        }
        canvas.drawPath(
          path,
          Paint()
            ..color = _accent.withValues(alpha: 0.7)
            ..style = PaintingStyle.stroke
            ..strokeWidth = 1.5
            ..strokeCap = StrokeCap.round
            ..strokeJoin = StrokeJoin.round,
        );
        // Fill preview
        canvas.drawPath(
          path,
          Paint()
            ..color = _accent.withValues(alpha: 0.08)
            ..style = PaintingStyle.fill,
        );
      }

      if (lassoState.mode == LassoMode.rect &&
          lassoState.rectStart != null &&
          lassoState.rectEnd != null) {
        final rect =
            Rect.fromPoints(lassoState.rectStart!, lassoState.rectEnd!);
        canvas.drawRect(
          rect,
          Paint()
            ..color = _accent.withValues(alpha: 0.12)
            ..style = PaintingStyle.fill,
        );
        canvas.drawRect(
          rect,
          Paint()
            ..color = _accent
            ..style = PaintingStyle.stroke
            ..strokeWidth = 1.5,
        );
      }
      return;
    }

    // ── Draw selection bounds + handles ──────────────────────────────────────
    if (selectionBounds == null || !lassoState.hasSelection) return;
    final bounds = selectionBounds!;

    canvas.save();
    if (rotation != 0) {
      final center = bounds.center;
      canvas.translate(center.dx, center.dy);
      canvas.rotate(rotation);
      canvas.translate(-center.dx, -center.dy);
    }

    // Dashed selection rect
    _drawDashedRect(canvas, bounds);

    // Resize handles
    final handlePaint = Paint()
      ..color = _white
      ..style = PaintingStyle.fill;
    final handleBorder = Paint()
      ..color = _accent
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.5;

    for (final pos in _handlePositions(bounds).values) {
      final hr = Rect.fromCenter(
          center: pos, width: _handleSize, height: _handleSize);
      canvas.drawRRect(
          RRect.fromRectAndRadius(hr, const Radius.circular(2)), handlePaint);
      canvas.drawRRect(
          RRect.fromRectAndRadius(hr, const Radius.circular(2)), handleBorder);
    }

    // Rotate handle
    final rotPos = _rotateHandlePos(bounds);
    // Line from top-center to rotate handle
    canvas.drawLine(
      Offset(bounds.center.dx, bounds.top),
      rotPos,
      Paint()
        ..color = _accent.withValues(alpha: 0.6)
        ..strokeWidth = 1,
    );
    canvas.drawCircle(rotPos, _handleSize / 2 + 1, handlePaint);
    canvas.drawCircle(
        rotPos,
        _handleSize / 2 + 1,
        Paint()
          ..color = _blue
          ..style = PaintingStyle.stroke
          ..strokeWidth = 1.5);

    // Center dot
    canvas.drawCircle(
        bounds.center,
        3,
        Paint()
          ..color = _accent.withValues(alpha: 0.5)
          ..style = PaintingStyle.fill);

    canvas.restore();
  }

  void _drawDashedRect(Canvas canvas, Rect rect) {
    final paint = Paint()
      ..color = _accent
      ..strokeWidth = 1.5
      ..style = PaintingStyle.stroke;

    final dashWidth = 6.0;
    final dashGap = 3.0;

    _drawDashedLine(canvas, rect.topLeft, rect.topRight, dashWidth, dashGap, paint);
    _drawDashedLine(canvas, rect.topRight, rect.bottomRight, dashWidth, dashGap, paint);
    _drawDashedLine(canvas, rect.bottomRight, rect.bottomLeft, dashWidth, dashGap, paint);
    _drawDashedLine(canvas, rect.bottomLeft, rect.topLeft, dashWidth, dashGap, paint);
  }

  void _drawDashedLine(Canvas canvas, Offset p1, Offset p2,
      double dashLen, double gapLen, Paint paint) {
    final dx = p2.dx - p1.dx;
    final dy = p2.dy - p1.dy;
    final len = math.sqrt(dx * dx + dy * dy);
    if (len == 0) return;
    final ux = dx / len;
    final uy = dy / len;
    double dist = 0;
    bool drawing = true;
    while (dist < len) {
      final segLen = drawing ? dashLen : gapLen;
      final end = math.min(dist + segLen, len);
      if (drawing) {
        canvas.drawLine(
          Offset(p1.dx + ux * dist, p1.dy + uy * dist),
          Offset(p1.dx + ux * end, p1.dy + uy * end),
          paint,
        );
      }
      dist = end;
      drawing = !drawing;
    }
  }

  @override
  bool shouldRepaint(LassoHandlePainter old) =>
      lassoState != old.lassoState ||
      selectionBounds != old.selectionBounds ||
      rotation != old.rotation;
}