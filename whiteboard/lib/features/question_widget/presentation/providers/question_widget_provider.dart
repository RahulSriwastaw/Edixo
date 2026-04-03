
// lib/features/question_widget/presentation/providers/question_widget_provider.dart

import 'package:flutter/material.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../data/models/question_widget_model.dart';
import '../../data/models/question_widget_style.dart';
import '../../../whiteboard/data/models/slide_model.dart';
import '../../../whiteboard/presentation/providers/session_provider.dart';
import 'selected_widget_provider.dart';

part 'question_widget_provider.g.dart';

@riverpod
class QuestionWidgetNotifier extends _$QuestionWidgetNotifier {
  @override
  Map<String, QuestionWidgetModel> build() => {};

  void populateFromSlides(List<SetSlideModel> slides) {
    final initial = <String, QuestionWidgetModel>{};
    for (int i = 0; i < slides.length; i++) {
      final slide = slides[i];
      initial[slide.slideId] = QuestionWidgetModel(
        id:              slide.slideId,
        slideId:         slide.slideId,
        questionNumber:  slide.questionNumber,
        questionText:    slide.questionText,
        questionImageUrl: slide.questionImageUrl,
        options:         slide.options,
        correctAnswer:   slide.correctAnswer,
        x:       100.0,
        y:       80.0,
        width:   900.0,
        height:  480.0,
        zIndex:  i,
        isLocked: false,
        style:   QuestionWidgetStyle.defaults,
      );
    }
    state = initial;
  }

  void updatePosition(String id, Offset pos) {
    final widget = state[id];
    if (widget == null || widget.isLocked) return;
    final updated = widget.copyWith(x: pos.dx, y: pos.dy);
    state = {...state, id: updated};
    ref.read(sessionNotifierProvider.notifier).markDirty();
  }

  void updateSize(String id, Size size) {
    final widget = state[id];
    if (widget == null || widget.isLocked) return;
    final updated = widget.copyWith(width: size.width, height: size.height);
    state = {...state, id: updated};
    ref.read(sessionNotifierProvider.notifier).markDirty();
  }

  void updateStyle(String id, QuestionWidgetStyle style) {
    final widget = state[id];
    if (widget == null) return;
    final updated = widget.copyWith(style: style);
    state = {...state, id: updated};
    ref.read(sessionNotifierProvider.notifier).markDirty();
  }

  void updateText(String id, String newText) {
    final widget = state[id];
    if (widget == null) return;
    final updated = widget.copyWith(questionText: newText);
    state = {...state, id: updated};
    ref.read(sessionNotifierProvider.notifier).markDirty();
  }

  void toggleLock(String id) {
    final widget = state[id];
    if (widget == null) return;
    final updated = widget.copyWith(isLocked: !widget.isLocked);
    state = {...state, id: updated};
  }

  void remove(String id) {
    final newState = Map<String, QuestionWidgetModel>.from(state)..remove(id);
    state = newState;
    ref.read(sessionNotifierProvider.notifier).markDirty();
  }

  void bringToFront(String id) {
    if (state.isEmpty) return;
    final maxZ = state.values.map((w) => w.zIndex).reduce((a, b) => a > b ? a : b);
    final widget = state[id];
    if (widget == null) return;
    final updated = widget.copyWith(zIndex: maxZ + 1);
    state = {...state, id: updated};
    _normalizeZIndex();
  }

  void sendToBack(String id) {
    final widget = state[id];
    if (widget == null) return;
    final updated = widget.copyWith(zIndex: -1);
    state = {...state, id: updated};
    _normalizeZIndex();
  }

  void _normalizeZIndex() {
    final sorted = state.values.toList()
      ..sort((a, b) => a.zIndex.compareTo(b.zIndex));
    final normalized = <String, QuestionWidgetModel>{};
    for (int i = 0; i < sorted.length; i++) {
      normalized[sorted[i].id] = sorted[i].copyWith(zIndex: i);
    }
    state = normalized;
  }
}
