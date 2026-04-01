class Question {
  final String id;
  final String questionNumber;
  final String questionText;
  final String? questionImage;
  final List<QuestionOption> options;
  final String correctAnswer;
  final String? examSource;
  final String? subject;

  const Question({
    required this.id,
    required this.questionNumber,
    required this.questionText,
    this.questionImage,
    required this.options,
    required this.correctAnswer,
    this.examSource,
    this.subject,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'questionNumber': questionNumber,
      'questionText': questionText,
      'questionImage': questionImage,
      'options': options.map((e) => e.toJson()).toList(),
      'correctAnswer': correctAnswer,
      'examSource': examSource,
      'subject': subject,
    };
  }

  factory Question.fromJson(Map<String, dynamic> json) {
    return Question(
      id: json['id'] as String,
      questionNumber: json['questionNumber'] as String? ?? 'Q1',
      questionText: json['questionText'] as String? ?? '',
      questionImage: json['questionImage'] as String?,
      options: (json['options'] as List?)
              ?.map((e) => QuestionOption.fromJson(Map<String, dynamic>.from(e as Map)))
              .toList() ??
          [],
      correctAnswer: json['correctAnswer'] as String? ?? '',
      examSource: json['examSource'] as String?,
      subject: json['subject'] as String?,
    );
  }
}

class QuestionOption {
  final String id;
  final String label;
  final String text;
  final String? imageUrl;

  const QuestionOption({
    required this.id,
    required this.label,
    required this.text,
    this.imageUrl,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'label': label,
      'text': text,
      'imageUrl': imageUrl,
    };
  }

  factory QuestionOption.fromJson(Map<String, dynamic> json) {
    return QuestionOption(
      id: json['id'] as String? ?? '',
      label: json['label'] as String? ?? '',
      text: json['text'] as String? ?? '',
      imageUrl: json['imageUrl'] as String?,
    );
  }
}

class QuestionStyle {
  final int questionTextColor;
  final int questionBgColor;
  final int optionTextColor;
  final int optionBgColor;
  final double fontSize;
  final double questionFontSize;
  final double optionFontSize;
  final double padding;
  final double borderRadius;
  final bool showLabels;

  const QuestionStyle({
    this.questionTextColor = 0xFFFFFFFF,
    this.questionBgColor = 0xFF252545,
    this.optionTextColor = 0xFFB0B0C0,
    this.optionBgColor = 0xFF353555,
    this.fontSize = 24.0,
    this.questionFontSize = 18.0,
    this.optionFontSize = 14.0,
    this.padding = 24.0,
    this.borderRadius = 16.0,
    this.showLabels = true,
  });

  Map<String, dynamic> toJson() {
    return {
      'questionTextColor': questionTextColor,
      'questionBgColor': questionBgColor,
      'optionTextColor': optionTextColor,
      'optionBgColor': optionBgColor,
      'fontSize': fontSize,
      'questionFontSize': questionFontSize,
      'optionFontSize': optionFontSize,
      'padding': padding,
      'borderRadius': borderRadius,
      'showLabels': showLabels,
    };
  }

  factory QuestionStyle.fromJson(Map<String, dynamic> json) {
    return QuestionStyle(
      questionTextColor: json['questionTextColor'] as int? ?? 0xFFFFFFFF,
      questionBgColor: json['questionBgColor'] as int? ?? 0xFF252545,
      optionTextColor: json['optionTextColor'] as int? ?? 0xFFB0B0C0,
      optionBgColor: json['optionBgColor'] as int? ?? 0xFF353555,
      fontSize: (json['fontSize'] as num?)?.toDouble() ?? 24.0,
      questionFontSize: (json['questionFontSize'] as num?)?.toDouble() ?? 18.0,
      optionFontSize: (json['optionFontSize'] as num?)?.toDouble() ?? 14.0,
      padding: (json['padding'] as num?)?.toDouble() ?? 24.0,
      borderRadius: (json['borderRadius'] as num?)?.toDouble() ?? 16.0,
      showLabels: json['showLabels'] as bool? ?? true,
    );
  }

  QuestionStyle copyWith({
    int? questionTextColor,
    int? questionBgColor,
    int? optionTextColor,
    int? optionBgColor,
    double? fontSize,
    double? questionFontSize,
    double? optionFontSize,
    double? padding,
    double? borderRadius,
    bool? showLabels,
  }) {
    return QuestionStyle(
      questionTextColor: questionTextColor ?? this.questionTextColor,
      questionBgColor: questionBgColor ?? this.questionBgColor,
      optionTextColor: optionTextColor ?? this.optionTextColor,
      optionBgColor: optionBgColor ?? this.optionBgColor,
      fontSize: fontSize ?? this.fontSize,
      questionFontSize: questionFontSize ?? this.questionFontSize,
      optionFontSize: optionFontSize ?? this.optionFontSize,
      padding: padding ?? this.padding,
      borderRadius: borderRadius ?? this.borderRadius,
      showLabels: showLabels ?? this.showLabels,
    );
  }
}
