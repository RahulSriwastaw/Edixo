
// lib/features/question_widget/data/models/question_widget_model.dart

import 'package:hive/hive.dart';
import 'package:flutter/material.dart';
import '../../../whiteboard/data/models/slide_model.dart';
import 'question_widget_style.dart';

part 'question_widget_model.g.dart';

// Hive typeId: 10
@HiveType(typeId: 10)
class QuestionWidgetModel extends HiveObject {
  @HiveField(0)  final String            id;
  @HiveField(1)  final String            slideId;
  @HiveField(2)  final int               questionNumber;
  @HiveField(3)  final String            questionText;    // HTML string
  @HiveField(4)  final String?           questionImageUrl;
  @HiveField(5)  final List<SlideOption> options;
  @HiveField(6)  final String?           correctAnswer;
  @HiveField(7)  final double            x;
  @HiveField(8)  final double            y;
  @HiveField(9)  final double            width;
  @HiveField(10) final double            height;
  @HiveField(11) final int               zIndex;
  @HiveField(12) final bool              isLocked;
  @HiveField(13) final QuestionWidgetStyle style;

  static const double kMinWidth  = 200.0;
  static const double kMaxWidth  = 1800.0;
  static const double kMinHeight = 100.0;
  static const double kMaxHeight = 900.0;

  QuestionWidgetModel({
    required this.id,
    required this.slideId,
    required this.questionNumber,
    required this.questionText,
    this.questionImageUrl,
    required this.options,
    this.correctAnswer,
    required this.x,
    required this.y,
    required this.width,
    required this.height,
    required this.zIndex,
    required this.isLocked,
    required this.style,
  });

  QuestionWidgetModel copyWith({
    double? x, double? y, double? width, double? height,
    int? zIndex, bool? isLocked, QuestionWidgetStyle? style,
    String? questionText,
  }) => QuestionWidgetModel(
    id:              id,
    slideId:         slideId,
    questionNumber:  questionNumber,
    questionText:    questionText    ?? this.questionText,
    questionImageUrl: questionImageUrl,
    options:         options,
    correctAnswer:   correctAnswer,
    x:       x      ?? this.x,
    y:       y      ?? this.y,
    width:   width  ?? this.width,
    height:  height ?? this.height,
    zIndex:  zIndex ?? this.zIndex,
    isLocked: isLocked ?? this.isLocked,
    style:   style  ?? this.style,
  );

  Map<String, dynamic> toJson() => {
    'x': x, 'y': y, 'width': width, 'height': height,
    'zIndex': zIndex, 'isLocked': isLocked,
    'style': style.toJson(),
  };
}
