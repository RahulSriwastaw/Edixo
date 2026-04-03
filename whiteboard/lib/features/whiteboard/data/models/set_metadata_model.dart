// lib/features/whiteboard/data/models/set_metadata_model.dart

class SetMetadataModel {
  final String  setId;
  final String  title;
  final String? subject;
  final int     questionCount;
  final String? orgId;

  const SetMetadataModel({
    required this.setId,
    required this.title,
    this.subject,
    required this.questionCount,
    this.orgId,
  });

  factory SetMetadataModel.fromJson(Map<String, dynamic> json) => SetMetadataModel(
    setId:         json['id'] as String,
    title:         json['title'] as String,
    subject:       json['subject'] as String?,
    questionCount: json['questionCount'] as int? ?? 0,
    orgId:         json['orgId'] as String?,
  );

  Map<String, dynamic> toJson() => {
    'id': setId,
    'title': title,
    'subject': subject,
    'questionCount': questionCount,
    'orgId': orgId,
  };
}
