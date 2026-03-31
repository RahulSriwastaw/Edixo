class Question {
  final String id;
  final String text;
  final List<String> options;
  final int correctOption;
  final String? source;

  Question({
    required this.id,
    required this.text,
    required this.options,
    required this.correctOption,
    this.source,
  });

  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      id: json['id'] as String,
      text: json['text'] as String,
      options: List<String>.from(json['options'] ?? []),
      correctOption: (json['correctOption'] as num?)?.toInt() ?? 0,
      source: json['source'] as String?,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'text': text,
    'options': options,
    'correctOption': correctOption,
    'source': source,
  };
}
