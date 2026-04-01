
import 'package:flutter/material.dart';

class QuestionWidgetModel {
  final String id;
  final String questionText;
  final double x;
  final double y;
  final double width;
  final double height;
  final int zIndex;
  final bool isLocked;

  QuestionWidgetModel({
    required this.id,
    required this.questionText,
    required this.x,
    required this.y,
    required this.width,
    required this.height,
    required this.zIndex,
    required this.isLocked,
  });

  QuestionWidgetModel copyWith({
    String? id,
    String? questionText,
    double? x,
    double? y,
    double? width,
    double? height,
    int? zIndex,
    bool? isLocked,
  }) {
    return QuestionWidgetModel(
      id: id ?? this.id,
      questionText: questionText ?? this.questionText,
      x: x ?? this.x,
      y: y ?? this.y,
      width: width ?? this.width,
      height: height ?? this.height,
      zIndex: zIndex ?? this.zIndex,
      isLocked: isLocked ?? this.isLocked,
    );
  }
}
