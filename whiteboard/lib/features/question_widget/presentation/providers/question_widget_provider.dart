
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/question_widget_model.dart';
import 'package:flutter/material.dart';

final questionWidgetProvider = StateNotifierProvider<QuestionWidgetNotifier, Map<String, QuestionWidgetModel>>((ref) {
  return QuestionWidgetNotifier();
});

class QuestionWidgetNotifier extends StateNotifier<Map<String, QuestionWidgetModel>> {
  QuestionWidgetNotifier() : super({});

  void addWidget(QuestionWidgetModel widget) {
    state = {...state, widget.id: widget};
  }

  void updatePosition(String id, Offset position) {
    state = {
      ...state,
      id: state[id]!.copyWith(x: position.dx, y: position.dy),
    };
  }

  void bringToFront(String id) {
    final maxZ = state.values.map((w) => w.zIndex).reduce((a, b) => a > b ? a : b);
    state = {
      ...state,
      id: state[id]!.copyWith(zIndex: maxZ + 1),
    };
  }

  void sendToBack(String id) {
    final minZ = state.values.map((w) => w.zIndex).reduce((a, b) => a < b ? a : b);
    state = {
      ...state,
      id: state[id]!.copyWith(zIndex: minZ - 1),
    };
  }

  void toggleLock(String id) {
    state = {
      ...state,
      id: state[id]!.copyWith(isLocked: !state[id]!.isLocked),
    };
  }
}
