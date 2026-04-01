import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../providers/canvas_provider.dart';
import 'question_widget_overlay.dart'; // We'll refactor this into DraggableResizableQuestionWidget

class EditableQuestionLayer extends ConsumerWidget {
  const EditableQuestionLayer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final canvasState = ref.watch(canvasStateProvider);
    final currentPage = canvasState.currentPage;

    return Stack(
      children: currentPage.questionWidgets.map((widgetModel) {
        return QuestionWidgetOverlay(
          key: ValueKey(widgetModel.id),
          object: widgetModel,
        );
      }).toList(),
    );
  }
}
