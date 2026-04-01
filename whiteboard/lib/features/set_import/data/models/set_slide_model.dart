
class SetSlideModel {
  final String slideId;
  final int questionNumber;
  final String questionText;
  final String? questionImageUrl;
  final List<String> options;
  final String correctAnswer;

  SetSlideModel({
    required this.slideId,
    required this.questionNumber,
    required this.questionText,
    this.questionImageUrl,
    required this.options,
    required this.correctAnswer,
  });

  factory SetSlideModel.fromJson(Map<String, dynamic> json) {
    return SetSlideModel(
      slideId: json['slideId'],
      questionNumber: json['questionNumber'],
      questionText: json['questionText'],
      questionImageUrl: json['questionImageUrl'],
      options: List<String>.from(json['options']),
      correctAnswer: json['correctAnswer'],
    );
  }
}
