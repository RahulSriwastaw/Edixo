
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/question_widget_model.dart';
import '../providers/question_widget_provider.dart';
import '../providers/selected_widget_provider.dart';

class DraggableResizableQuestionWidget extends ConsumerStatefulWidget {
  final QuestionWidgetModel model;

  const DraggableResizableQuestionWidget({super.key, required this.model});

  @override
  ConsumerState<DraggableResizableQuestionWidget> createState() => _DraggableResizableQuestionWidgetState();
}

class _DraggableResizableQuestionWidgetState extends ConsumerState<DraggableResizableQuestionWidget> {
  late double _x, _y, _width, _height;

  @override
  void initState() {
    super.initState();
    _x = widget.model.x;
    _y = widget.model.y;
    _width = widget.model.width;
    _height = widget.model.height;
  }

  @override
  Widget build(BuildContext context) {
    final isLocked = widget.model.isLocked;
    return Positioned(
      left: _x,
      top: _y,
      child: GestureDetector(
        onTap: () {
          ref.read(selectedWidgetNotifierProvider.notifier).select(widget.model.id);
        },
        onPanUpdate: isLocked ? null : (details) {
          setState(() {
            _x += details.delta.dx;
            _y += details.delta.dy;
          });
        },
        onPanEnd: isLocked ? null : (_) {
          ref.read(questionWidgetNotifierProvider.notifier).updatePosition(widget.model.id, Offset(_x, _y));
        },
        child: SizedBox(
          width: _width,
          height: _height,
          child: Container(
            decoration: BoxDecoration(
              border: Border.all(color: Colors.blue, width: 2),
            ),
            child: Text(widget.model.questionText),
          ),
        ),
      ),
    );
  }
}
