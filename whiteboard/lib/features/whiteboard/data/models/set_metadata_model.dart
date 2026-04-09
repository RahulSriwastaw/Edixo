// lib/features/whiteboard/data/models/set_metadata_model.dart

class SetMetadataModel {
  final String  setId;
  final String  title;
  final String? subject;
  final int     questionCount;

  final Map<String, dynamic>? visualSettings;

  const SetMetadataModel({
    required this.setId,
    required this.title,
    this.subject,
    required this.questionCount,
    this.visualSettings,
  });

  factory SetMetadataModel.fromJson(Map<String, dynamic> json) => SetMetadataModel(
    setId:         json['id'] as String,
    title:         json['title'] as String,
    subject:       json['subject'] as String?,
    questionCount: json['questionCount'] as int? ?? 0,
    visualSettings: json['visual_settings'] as Map<String, dynamic>?,
  );

  Map<String, dynamic> toJson() => {
    'id': setId,
    'title': title,
    'subject': subject,
    'questionCount': questionCount,
    'visual_settings': visualSettings,
  };
}
