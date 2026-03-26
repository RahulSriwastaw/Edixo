class AIMessage {
  final String id;
  final String text;
  final bool isUser;
  final DateTime timestamp;
  final String? code;

  AIMessage({
    required this.id,
    required this.text,
    required this.isUser,
    DateTime? timestamp,
    this.code,
  }) : timestamp = timestamp ?? DateTime.now();

  bool get hasCode => code != null && code!.isNotEmpty;

  AIMessage copyWith({
    String? id,
    String? text,
    bool? isUser,
    DateTime? timestamp,
    String? code,
  }) {
    return AIMessage(
      id: id ?? this.id,
      text: text ?? this.text,
      isUser: isUser ?? this.isUser,
      timestamp: timestamp ?? this.timestamp,
      code: code ?? this.code,
    );
  }
}
