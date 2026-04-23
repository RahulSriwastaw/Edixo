// lib/features/whiteboard/presentation/providers/canvas_provider.dart

import 'dart:math' as math;
import 'dart:math' as dart_math;
import 'package:flutter/material.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';
import '../../data/models/stroke_model.dart';
import '../../data/models/canvas_object_model.dart';
import '../../data/models/slide_annotation.dart';
import 'tool_provider.dart';
import 'session_provider.dart';
import 'current_slide_id_provider.dart';

part 'canvas_provider.g.dart';
final canvasTransformationProvider = StateProvider<Matrix4>((ref) => Matrix4.identity());

// ── CanvasSnapshot & CanvasState ────────────────────────────────────────────

class CanvasSnapshot {
  final List<StrokeModel>      strokes;
  final List<CanvasObjectModel> objects;

  const CanvasSnapshot({required this.strokes, required this.objects});
}

class CanvasState {
  final List<StrokeModel>      strokes;
  final StrokeModel?           activeStroke;
  final List<CanvasObjectModel> objects;
  final List<CanvasSnapshot>   undoStack;
  final List<CanvasSnapshot>   redoStack;
  final bool                   showGrid;
  final bool                   isFullscreen;

  const CanvasState({
    required this.strokes,
    this.activeStroke,
    required this.objects,
    required this.undoStack,
    required this.redoStack,
    this.showGrid = false,
    this.isFullscreen = false,
  });

  factory CanvasState.initial() => const CanvasState(
    strokes:      [],
    activeStroke: null,
    objects:      [],
    undoStack:    [],
    redoStack:    [],
    showGrid:     false,
    isFullscreen: false,
  );

  CanvasState copyWith({
    List<StrokeModel>?       strokes,
    StrokeModel?             activeStroke,
    bool                     clearActiveStroke = false,
    List<CanvasObjectModel>? objects,
    List<CanvasSnapshot>?    undoStack,
    List<CanvasSnapshot>?    redoStack,
    bool?                    showGrid,
    bool?                    isFullscreen,
  }) => CanvasState(
    strokes:      strokes      ?? this.strokes,
    activeStroke: clearActiveStroke ? null : (activeStroke ?? this.activeStroke),
    objects:      objects      ?? this.objects,
    undoStack:    undoStack    ?? this.undoStack,
    redoStack:    redoStack    ?? this.redoStack,
    showGrid:     showGrid     ?? this.showGrid,
    isFullscreen: isFullscreen ?? this.isFullscreen,
  );
}

// ── CanvasNotifier ──────────────────────────────────────────────────────────

@riverpod
class CanvasNotifier extends _$CanvasNotifier {
  @override
  CanvasState build() => CanvasState.initial();

  void toggleGrid() => state = state.copyWith(showGrid: !state.showGrid);
  void toggleFullscreen() => state = state.copyWith(isFullscreen: !state.isFullscreen);

  void startStroke(Offset point) {
    final settings  = ref.read(toolNotifierProvider);
    final strokeType = _mapToolToStrokeType(settings.activeTool);
    if (strokeType == null) return;
    final slideId = ref.read(currentSlideIdProvider) ?? '';
    state = state.copyWith(
      activeStroke: StrokeModel(
        id:          const Uuid().v4(),
        points:      [point],
          colorARGB:   settings.currentSettings.color.toARGB32(),
          strokeWidth: settings.currentSettings.strokeWidth,
          type:        strokeType,
          opacity:     settings.currentSettings.opacity,
        slideId:     slideId,
      ),
    );
  }

  /// Soft eraser — removes individual points from strokes within [radius] of [point].
  void eraseAtPoint(Offset point, double radius, {bool pushUndo = true}) {
    final updated = <StrokeModel>[];
    bool changed = false;
    for (final stroke in state.strokes) {
      final kept = stroke.points
          .where((p) => math.sqrt(math.pow(p.dx - point.dx, 2) + math.pow(p.dy - point.dy, 2)) > radius)
          .toList();
      if (kept.length == stroke.points.length) {
        updated.add(stroke);
      } else if (kept.length >= 2) {
        updated.add(stroke.copyWith(points: kept));
        changed = true;
      } else {
        changed = true; // stroke fully erased
      }
    }
    if (changed) {
      if (pushUndo) {
        _pushUndoAndUpdate(strokes: updated);
      } else {
        state = state.copyWith(strokes: updated);
      }
      ref.read(sessionNotifierProvider.notifier).markDirty();
    }
  }

  /// Hard eraser — removes the entire stroke whose path the pointer touched.
  void eraseStrokeAt(Offset point, double radius, {bool pushUndo = true}) {
    final toRemove = state.strokes.where((stroke) {
      return stroke.points.any((p) =>
          math.sqrt(math.pow(p.dx - point.dx, 2) + math.pow(p.dy - point.dy, 2)) <= radius);
    }).map((s) => s.id).toSet();
    if (toRemove.isEmpty) return;
    final updated = state.strokes.where((s) => !toRemove.contains(s.id)).toList();
    if (pushUndo) {
      _pushUndoAndUpdate(strokes: updated);
    } else {
      state = state.copyWith(strokes: updated);
    }
    ref.read(sessionNotifierProvider.notifier).markDirty();
  }

  /// Object eraser — removes canvas objects whose bounds contain [point].
  void eraseObjectAt(Offset point, {bool pushUndo = true}) {
    final toRemove = state.objects
        .where((obj) => obj.bounds.inflate(4).contains(point))
        .map((o) => o.id)
        .toSet();
    if (toRemove.isEmpty) return;
    final updated = state.objects.where((o) => !toRemove.contains(o.id)).toList();
    if (pushUndo) {
      _pushUndoAndUpdate(objects: updated);
    } else {
      state = state.copyWith(objects: updated);
    }
    ref.read(sessionNotifierProvider.notifier).markDirty();
  }

  void updateStroke(Offset point) {
    final active = state.activeStroke;
    if (active == null) return;
    state = state.copyWith(
      activeStroke: active.copyWith(points: [...active.points, point]),
    );
  }

  void endStroke() {
    final completed = state.activeStroke;
    if (completed == null) return;
    
    // Laser pointers don't persist on canvas
    if (completed.type == StrokeType.laserPointer) {
      state = state.copyWith(clearActiveStroke: true);
      return;
    }

    final newStrokes = [...state.strokes, completed];
    state = state.copyWith(
      strokes:          newStrokes,
      clearActiveStroke: true,
      undoStack: [
        ...state.undoStack.takeLast50(),
        CanvasSnapshot(strokes: state.strokes, objects: state.objects),
      ],
      redoStack: [],
    );
    ref.read(sessionNotifierProvider.notifier).markDirty();
  }

  void undo() {
    if (state.undoStack.isEmpty) return;
    final prev = state.undoStack.last;
    state = state.copyWith(
      strokes:   prev.strokes,
      objects:   prev.objects,
      undoStack: state.undoStack.sublist(0, state.undoStack.length - 1),
      redoStack: [
        CanvasSnapshot(strokes: state.strokes, objects: state.objects),
        ...state.redoStack,
      ],
    );
  }

  void redo() {
    if (state.redoStack.isEmpty) return;
    final next = state.redoStack.first;
    state = state.copyWith(
      strokes:   next.strokes,
      objects:   next.objects,
      undoStack: [
        ...state.undoStack,
        CanvasSnapshot(strokes: state.strokes, objects: state.objects),
      ],
      redoStack: state.redoStack.sublist(1),
    );
  }

  void addObject(CanvasObjectModel obj) {
    _pushUndoAndUpdate(objects: [...state.objects, obj]);
    ref.read(sessionNotifierProvider.notifier).markDirty();
  }

  void updateObjectPosition(String id, Offset newPos) {
    final updated = state.objects.map((o) =>
      o.id == id ? o.copyWith(x: newPos.dx, y: newPos.dy) : o
    ).toList();
    _pushUndoAndUpdate(objects: updated);
    ref.read(sessionNotifierProvider.notifier).markDirty();
  }

  void updateObjectTransform(
    String id, {
    double? x,
    double? y,
    double? width,
    double? height,
    double? borderWidth,
    double? opacity,
    int? borderColorARGB,
    int? fillColorARGB,
    double? rotation,
  }) {
    final matches = state.objects.where((o) => o.id == id);
    if (matches.isEmpty) return;
    final existing = matches.first;
    if (existing.isLocked) return;

    final changed = existing.copyWith(
      x: x,
      y: y,
      width: width,
      height: height,
      borderWidth: borderWidth,
      opacity: opacity,
      borderColorARGB: borderColorARGB,
      fillColorARGB: fillColorARGB,
      rotation: rotation,
    );

    final updated = state.objects
        .map((o) => o.id == id ? changed : o)
        .toList();
    _pushUndoAndUpdate(objects: updated);
    ref.read(sessionNotifierProvider.notifier).markDirty();
  }

  void updateObjectExtra(String id, Map<String, dynamic> extra) {
    final matches = state.objects.where((o) => o.id == id);
    if (matches.isEmpty) return;
    final existing = matches.first;
    if (existing.isLocked) return;

    final updated = state.objects
        .map((o) => o.id == id ? o.copyWith(extra: extra) : o)
        .toList();
    _pushUndoAndUpdate(objects: updated);
    ref.read(sessionNotifierProvider.notifier).markDirty();
  }

  void updateObjectText(String id, String text) {
    final matches = state.objects.where((o) => o.id == id);
    if (matches.isEmpty) return;
    final existing = matches.first;
    if (existing.isLocked) return;

    final nextExtra = Map<String, dynamic>.from(existing.extra);
    nextExtra['text'] = text;
    updateObjectExtra(id, nextExtra);
  }

  void toggleObjectLock(String id) {
    final matches = state.objects.where((o) => o.id == id);
    if (matches.isEmpty) return;

    final updated = state.objects
        .map((o) => o.id == id ? o.copyWith(isLocked: !o.isLocked) : o)
        .toList();
    _pushUndoAndUpdate(objects: updated);
    ref.read(sessionNotifierProvider.notifier).markDirty();
  }

  void bringObjectToFront(String id) {
    final matches = state.objects.where((o) => o.id == id);
    if (matches.isEmpty) return;
    final maxZ = state.objects.fold<int>(0, (m, o) => o.zIndex > m ? o.zIndex : m);
    final updated = state.objects
        .map((o) => o.id == id ? o.copyWith(zIndex: maxZ + 1) : o)
        .toList();
    _pushUndoAndUpdate(objects: updated);
    ref.read(sessionNotifierProvider.notifier).markDirty();
  }

  void sendObjectToBack(String id) {
    final matches = state.objects.where((o) => o.id == id);
    if (matches.isEmpty) return;
    final minZ = state.objects.fold<int>(0, (m, o) => o.zIndex < m ? o.zIndex : m);
    final updated = state.objects
        .map((o) => o.id == id ? o.copyWith(zIndex: minZ - 1) : o)
        .toList();
    _pushUndoAndUpdate(objects: updated);
    ref.read(sessionNotifierProvider.notifier).markDirty();
  }

  void deleteObject(String id) {
    _pushUndoAndUpdate(
      objects: state.objects.where((o) => o.id != id).toList(),
    );
    ref.read(sessionNotifierProvider.notifier).markDirty();
  }

  /// Translates all points of a stroke by [delta] (for stroke dragging).
  void translateStroke(String id, Offset delta) {
    final idx = state.strokes.indexWhere((s) => s.id == id);
    if (idx < 0) return;
    final s = state.strokes[idx];
    final moved = s.copyWith(points: s.points.map((p) => p + delta).toList());
    final updated = List<StrokeModel>.from(state.strokes);
    updated[idx] = moved;
    _pushUndoAndUpdate(strokes: updated);
    ref.read(sessionNotifierProvider.notifier).markDirty();
  }

  /// Updates visual style properties of a stroke.
  void updateStrokeStyle(
    String id, {
    int? colorARGB,
    double? strokeWidth,
    double? opacity,
    StrokeType? type,
  }) {
    final idx = state.strokes.indexWhere((s) => s.id == id);
    if (idx < 0) return;
    final existing = state.strokes[idx];
    final changed = existing.copyWith(
      colorARGB: colorARGB,
      strokeWidth: strokeWidth,
      opacity: opacity,
      type: type,
    );
    final updated = List<StrokeModel>.from(state.strokes);
    updated[idx] = changed;
    _pushUndoAndUpdate(strokes: updated);
    ref.read(sessionNotifierProvider.notifier).markDirty();
  }

  /// Replaces stroke points directly.
  void updateStrokePoints(String id, List<Offset> points, {bool pushUndo = true}) {
    final idx = state.strokes.indexWhere((s) => s.id == id);
    if (idx < 0) return;
    final existing = state.strokes[idx];
    final updated = List<StrokeModel>.from(state.strokes);
    updated[idx] = existing.copyWith(points: points);
    
    if (pushUndo) {
      _pushUndoAndUpdate(strokes: updated);
      ref.read(sessionNotifierProvider.notifier).markDirty();
    } else {
      state = state.copyWith(strokes: updated);
    }
  }

  /// Updates multiple strokes simultaneously (e.g. for lasso transform)
  void updateMultipleStrokePoints(Map<String, List<Offset>> updates, {bool pushUndo = true}) {
    final updated = List<StrokeModel>.from(state.strokes);
    bool changed = false;
    for (int i = 0; i < updated.length; i++) {
      final s = updated[i];
      if (updates.containsKey(s.id)) {
        updated[i] = s.copyWith(points: updates[s.id]!);
        changed = true;
      }
    }
    if (!changed) return;
    
    if (pushUndo) {
      _pushUndoAndUpdate(strokes: updated);
      ref.read(sessionNotifierProvider.notifier).markDirty();
    } else {
      state = state.copyWith(strokes: updated);
    }
  }

  /// Applies scale + rotation transform around stroke center.
  void transformStroke(
    String id, {
    double scale = 1.0,
    double rotationDeg = 0.0,
    Offset? center,
  }) {
    final idx = state.strokes.indexWhere((s) => s.id == id);
    if (idx < 0) return;
    final existing = state.strokes[idx];
    if (existing.points.isEmpty) return;

    final c = center ?? _strokeCenter(existing.points);
    final angle = rotationDeg * math.pi / 180.0;
    final cosA = math.cos(angle);
    final sinA = math.sin(angle);

    final transformed = existing.points.map((p) {
      final dx = (p.dx - c.dx) * scale;
      final dy = (p.dy - c.dy) * scale;
      final rx = (dx * cosA) - (dy * sinA);
      final ry = (dx * sinA) + (dy * cosA);
      return Offset(c.dx + rx, c.dy + ry);
    }).toList();

    final updated = List<StrokeModel>.from(state.strokes);
    updated[idx] = existing.copyWith(points: transformed);
    _pushUndoAndUpdate(strokes: updated);
    ref.read(sessionNotifierProvider.notifier).markDirty();
  }

  /// Duplicates a stroke with a small offset for quick editing.
  void duplicateStroke(String id) {
    final idx = state.strokes.indexWhere((s) => s.id == id);
    if (idx < 0) return;
    final existing = state.strokes[idx];
    final dup = existing.copyWith(
      id: const Uuid().v4(),
      points: existing.points.map((p) => p + const Offset(24, 24)).toList(),
    );
    _pushUndoAndUpdate(strokes: [...state.strokes, dup]);
    ref.read(sessionNotifierProvider.notifier).markDirty();
  }

  /// Deletes either a stroke or an object by id.
  void deleteElement(String id) {
    final hasStroke = state.strokes.any((s) => s.id == id);
    if (hasStroke) {
      _pushUndoAndUpdate(strokes: state.strokes.where((s) => s.id != id).toList());
    } else {
      _pushUndoAndUpdate(objects: state.objects.where((o) => o.id != id).toList());
    }
    ref.read(sessionNotifierProvider.notifier).markDirty();
  }

  /// Duplicates a canvas object (shapes/textboxes), placing the copy 24px offset.
  void duplicateObject(String id) {
    final matches = state.objects.where((o) => o.id == id);
    if (matches.isEmpty) return;
    final obj = matches.first;
    final dup = CanvasObjectModel(
      type: obj.type,
      x: obj.x + 24,
      y: obj.y + 24,
      width: obj.width,
      height: obj.height,
      rotation: obj.rotation,
      fillColorARGB: obj.fillColorARGB,
      borderColorARGB: obj.borderColorARGB,
      borderWidth: obj.borderWidth,
      opacity: obj.opacity,
      isLocked: obj.isLocked,
      zIndex: obj.zIndex,
      slideId: obj.slideId,
      extra: Map<String, dynamic>.from(obj.extra),
    );
    _pushUndoAndUpdate(objects: [...state.objects, dup]);
    ref.read(sessionNotifierProvider.notifier).markDirty();
  }

  void clearSlide() {
    _pushUndoAndUpdate(strokes: [], objects: []);
    ref.read(sessionNotifierProvider.notifier).markDirty();
  }

  Offset _strokeCenter(List<Offset> pts) {
    double minX = pts.first.dx;
    double maxX = pts.first.dx;
    double minY = pts.first.dy;
    double maxY = pts.first.dy;
    for (final p in pts) {
      if (p.dx < minX) minX = p.dx;
      if (p.dx > maxX) maxX = p.dx;
      if (p.dy < minY) minY = p.dy;
      if (p.dy > maxY) maxY = p.dy;
    }
    return Offset((minX + maxX) / 2, (minY + maxY) / 2);
  }

  void loadFromAnnotation(SlideAnnotationData data) {
    state = CanvasState(
      strokes:      List.from(data.strokes),
      objects:      List.from(data.objects),
      activeStroke: null,
      undoStack:    [],
      redoStack:    [],
    );
  }

  void _pushUndoAndUpdate({List<StrokeModel>? strokes, List<CanvasObjectModel>? objects}) {
    state = state.copyWith(
      strokes:   strokes ?? state.strokes,
      objects:   objects ?? state.objects,
      undoStack: [
        ...state.undoStack.takeLast50(),
        CanvasSnapshot(strokes: state.strokes, objects: state.objects),
      ],
      redoStack: [],
    );
  }

  StrokeType? _mapToolToStrokeType(Tool tool) {
    return switch (tool) {
      Tool.softPen => StrokeType.softPen,
      Tool.hardPen => StrokeType.hardPen,
      Tool.highlighter => StrokeType.highlighter,
      Tool.chalk => StrokeType.chalk,
      Tool.calligraphy => StrokeType.calligraphy,
      Tool.spray => StrokeType.spray,
      Tool.laserPointer => StrokeType.laserPointer,
      _ => null,
    };
  }
  // --- Lasso selection prompt methods ---
  
  /// Save a snapshot for undo
  void saveSnapshot() {
    state = state.copyWith(
      undoStack: [
        ...state.undoStack.takeLast50(),
        CanvasSnapshot(strokes: state.strokes, objects: state.objects),
      ],
      redoStack: [],
    );
  }

  /// Move an object by delta
  void moveObject(String id, double dx, double dy, {bool pushUndo = false}) {
    final next = state.objects.map((o) {
        if (o.id != id) return o;
        return o.copyWith(x: o.x + dx, y: o.y + dy);
      }).toList();
    
    if (pushUndo) {
      _pushUndoAndUpdate(objects: next);
    } else {
      state = state.copyWith(objects: next);
    }
  }

  /// Move a stroke by delta (all points)
  void moveStroke(int index, double dx, double dy, {bool pushUndo = false}) {
    if (index >= state.strokes.length) return;
    final strokes = List<StrokeModel>.from(state.strokes);
    final s = strokes[index];
    strokes[index] = s.copyWith(
      points: s.points.map((p) => Offset(p.dx + dx, p.dy + dy)).toList(),
    );
    
    if (pushUndo) {
      _pushUndoAndUpdate(strokes: strokes);
    } else {
      state = state.copyWith(strokes: strokes);
    }
  }

  /// Resize an object by scale factors from a pivot point
  void resizeObject(String id, {required double scaleX, required double scaleY, required Offset pivot, bool pushUndo = false}) {
    final next = state.objects.map((o) {
        if (o.id != id) return o;
        final newX = pivot.dx + (o.x - pivot.dx) * scaleX;
        final newY = pivot.dy + (o.y - pivot.dy) * scaleY;
        return o.copyWith(
          x: newX,
          y: newY,
          width: (o.width * scaleX).clamp(20, double.infinity),
          height: (o.height * scaleY).clamp(20, double.infinity),
        );
      }).toList();
    
    if (pushUndo) {
      _pushUndoAndUpdate(objects: next);
    } else {
      state = state.copyWith(objects: next);
    }
  }

  /// Rotate an object around a center point
  void rotateObject(String id, double angleDelta, Offset center, {bool pushUndo = false}) {
    final next = state.objects.map((o) {
        if (o.id != id) return o;
        return o.copyWith(rotation: (o.rotation + angleDelta) % (2 * 3.14159265));
      }).toList();
    
    if (pushUndo) {
      _pushUndoAndUpdate(objects: next);
    } else {
      state = state.copyWith(objects: next);
    }
  }

  /// Rotate a stroke around a center point
  void rotateStroke(int index, double angleDelta, Offset center, {bool pushUndo = false}) {
    if (index >= state.strokes.length) return;
    final strokes = List<StrokeModel>.from(state.strokes);
    final s = strokes[index];
    strokes[index] = s.copyWith(
      points: s.points.map((p) {
        final dx = p.dx - center.dx;
        final dy = p.dy - center.dy;
        final cos = dart_math.cos(angleDelta);
        final sin = dart_math.sin(angleDelta);
        return Offset(
          center.dx + dx * cos - dy * sin,
          center.dy + dx * sin + dy * cos,
        );
      }).toList(),
    );
    
    if (pushUndo) {
      _pushUndoAndUpdate(strokes: strokes);
    } else {
      state = state.copyWith(strokes: strokes);
    }
  }

  /// Update object fill color
  void updateObjectFill(String id, int colorARGB) {
    final next = state.objects.map((o) =>
        o.id == id ? o.copyWith(fillColorARGB: colorARGB) : o).toList();
    _pushUndoAndUpdate(objects: next);
    ref.read(sessionNotifierProvider.notifier).markDirty();
  }

  /// Update object border color
  void updateObjectBorder(String id, int colorARGB) {
    final next = state.objects.map((o) =>
        o.id == id ? o.copyWith(borderColorARGB: colorARGB) : o).toList();
    _pushUndoAndUpdate(objects: next);
    ref.read(sessionNotifierProvider.notifier).markDirty();
  }

  /// Update object opacity
  void updateObjectOpacity(String id, double opacity) {
    final next = state.objects.map((o) =>
        o.id == id ? o.copyWith(opacity: opacity.clamp(0.05, 1.0)) : o).toList();
    _pushUndoAndUpdate(objects: next);
    ref.read(sessionNotifierProvider.notifier).markDirty();
  }

  /// Flip object horizontally (negate scaleX via extra map)
  void flipObjectH(String id) {
    final next = state.objects.map((o) {
        if (o.id != id) return o;
        final extra = Map<String, dynamic>.from(o.extra);
        extra['flipH'] = !(extra['flipH'] as bool? ?? false);
        return o.copyWith(extra: extra);
      }).toList();
    _pushUndoAndUpdate(objects: next);
    ref.read(sessionNotifierProvider.notifier).markDirty();
  }

  /// Flip object vertically
  void flipObjectV(String id) {
    final next = state.objects.map((o) {
        if (o.id != id) return o;
        final extra = Map<String, dynamic>.from(o.extra);
        extra['flipV'] = !(extra['flipV'] as bool? ?? false);
        return o.copyWith(extra: extra);
      }).toList();
    _pushUndoAndUpdate(objects: next);
    ref.read(sessionNotifierProvider.notifier).markDirty();
  }

  /// Toggle lock state
  void toggleLock(String id) {
    state = state.copyWith(
      objects: state.objects.map((o) =>
        o.id == id ? o.copyWith(isLocked: !o.isLocked) : o).toList(),
    );
  }
}

// Helper extension to keep undo stack bounded at 50
extension ListBound<T> on List<T> {
  List<T> takeLast50() => length >= 50 ? sublist(length - 49) : this;
}

@riverpod
GlobalKey canvasRepaintKey(CanvasRepaintKeyRef ref) {
  return GlobalKey();
}
