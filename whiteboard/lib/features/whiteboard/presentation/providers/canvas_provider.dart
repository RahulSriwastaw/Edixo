// lib/features/whiteboard/presentation/providers/canvas_provider.dart

import 'package:flutter/material.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:uuid/uuid.dart';
import '../../data/models/stroke_model.dart';
import '../../data/models/canvas_object_model.dart';
import '../../data/models/slide_annotation.dart';
import 'tool_provider.dart';
import 'session_provider.dart';

part 'canvas_provider.g.dart';

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
    // TODO: Get current slide ID from slideNotifierProvider
    const slideId   = '';  // Will be injected by caller
    state = state.copyWith(
      activeStroke: StrokeModel(
        id:          const Uuid().v4(),
        points:      [point],
        colorARGB:   settings.color.value,
        strokeWidth: settings.strokeWidth,
        type:        StrokeType.softPen,  // TODO: Map from settings.activeTool
        opacity:     settings.opacity,
        slideId:     slideId,
      ),
    );
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

  void deleteObject(String id) {
    _pushUndoAndUpdate(
      objects: state.objects.where((o) => o.id != id).toList(),
    );
    ref.read(sessionNotifierProvider.notifier).markDirty();
  }

  void clearSlide() {
    _pushUndoAndUpdate(strokes: [], objects: []);
    ref.read(sessionNotifierProvider.notifier).markDirty();
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
}

// Helper extension to keep undo stack bounded at 50
extension _ListBound<T> on List<T> {
  List<T> takeLast50() => length >= 50 ? sublist(length - 49) : this;
}
