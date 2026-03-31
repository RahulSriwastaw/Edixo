
class Question {
  final String id;
  final String text; // mapped to questionText below temporarily
  final List<String> options;
  final int correctOption;
  final String? imageUrl;
  final String? source;
  final String? explanation;

  String get questionText => text;

  const Question({
    required this.id,
    required this.text,
    required this.options,
    required this.correctOption,
    this.source,
    this.imageUrl,
    this.explanation,
  });
}
