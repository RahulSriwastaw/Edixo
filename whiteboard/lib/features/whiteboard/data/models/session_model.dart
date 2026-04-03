// lib/features/whiteboard/data/models/session_model.dart
// NOTE: Map<String, SlideAnnotationData> is stored by serializing to JSON string.

import 'package:hive/hive.dart';

part 'session_model.g.dart';

// Hive typeId: 7
@HiveType(typeId: 7)
class WhiteboardSessionModel extends HiveObject {
  @HiveField(0) final String   sessionId;
  @HiveField(1) final String   setId;
  @HiveField(2) final String   teacherId;
  @HiveField(3) final String   orgId;
  @HiveField(4) final DateTime startTime;
  @HiveField(5) final DateTime lastSaved;
  @HiveField(6) final int      currentSlideIndex;
  @HiveField(7) final List<int> slidesCovered;
  @HiveField(8) final String   annotationsJson; // JSON-encoded Map<slideId, annotation>

  WhiteboardSessionModel({
    required this.sessionId,
    required this.setId,
    required this.teacherId,
    required this.orgId,
    required this.startTime,
    required this.lastSaved,
    required this.currentSlideIndex,
    required this.slidesCovered,
    required this.annotationsJson,
  });

  Map<String, dynamic> toJson() => {
    'sessionId': sessionId,
    'setId': setId,
    'teacherId': teacherId,
    'orgId': orgId,
    'startTime': startTime.toIso8601String(),
    'lastSaved': lastSaved.toIso8601String(),
    'currentSlideIndex': currentSlideIndex,
    'slidesCovered': slidesCovered,
    'annotationsJson': annotationsJson,
  };

  factory WhiteboardSessionModel.fromJson(Map<String, dynamic> json) =>
    WhiteboardSessionModel(
      sessionId:       json['sessionId'] as String,
      setId:           json['setId'] as String,
      teacherId:       json['teacherId'] as String,
      orgId:           json['orgId'] as String,
      startTime:       DateTime.parse(json['startTime'] as String),
      lastSaved:       DateTime.parse(json['lastSaved'] as String),
      currentSlideIndex: json['currentSlideIndex'] as int,
      slidesCovered:   List<int>.from(json['slidesCovered'] as List),
      annotationsJson: json['annotationsJson'] as String,
    );
}
