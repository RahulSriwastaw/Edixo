// lib/features/whiteboard/data/models/slide_model.dart

import 'package:hive/hive.dart';

part 'slide_model.g.dart';

// Hive typeId: 2
@HiveType(typeId: 2)
class SlideOption extends HiveObject {
  @HiveField(0) final String  label;       // 'A' | 'B' | 'C' | 'D'
  @HiveField(1) final String  text;
  @HiveField(2) final String? imageUrl;

  SlideOption({required this.label, required this.text, this.imageUrl});

  factory SlideOption.fromJson(Map<String, dynamic> json) => SlideOption(
    label:    json['label'] as String,
    text:     json['text'] as String,
    imageUrl: json['imageUrl'] as String?,
  );

  Map<String, dynamic> toJson() => {'label': label, 'text': text, 'imageUrl': imageUrl};
}

// Hive typeId: 1
@HiveType(typeId: 1)
class SetSlideModel extends HiveObject {
  @HiveField(0) final String            slideId;
  @HiveField(1) final int               questionNumber;
  @HiveField(2) final String            questionText;       // HTML
  @HiveField(3) final String?           questionImageUrl;
  @HiveField(4) final List<SlideOption> options;
  @HiveField(5) final String?           correctAnswer;
  @HiveField(6) final String?           examSource;
  @HiveField(7) final String?           subject;
  @HiveField(8) final String?           backgroundImageUrl;

  SetSlideModel({
    required this.slideId,
    required this.questionNumber,
    required this.questionText,
    this.questionImageUrl,
    required this.options,
    this.correctAnswer,
    this.examSource,
    this.subject,
    this.backgroundImageUrl,
  });

  factory SetSlideModel.fromJson(Map<String, dynamic> json) => SetSlideModel(
    slideId:            json['id'] as String,
    questionNumber:     json['questionNumber'] as int,
    questionText:       json['questionText'] as String,
    questionImageUrl:   json['questionImage'] as String?,
    options:            (json['options'] as List)
                          .map((o) => SlideOption.fromJson(o as Map<String, dynamic>))
                          .toList(),
    correctAnswer:      json['correctAnswer'] as String?,
    examSource:         json['examSource'] as String?,
    subject:            json['subject'] as String?,
    backgroundImageUrl: json['backgroundImageUrl'] as String?,
  );

  Map<String, dynamic> toJson() => {
    'id': slideId,
    'questionNumber': questionNumber,
    'questionText': questionText,
    'questionImage': questionImageUrl,
    'options': options.map((o) => o.toJson()).toList(),
    'correctAnswer': correctAnswer,
    'examSource': examSource,
    'subject': subject,
    'backgroundImageUrl': backgroundImageUrl,
  };
}
