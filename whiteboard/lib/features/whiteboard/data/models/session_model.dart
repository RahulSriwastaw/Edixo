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
  @HiveField(3) final DateTime startTime;
  @HiveField(4) final DateTime lastSaved;
  @HiveField(5) final int      currentPageIndex;
  @HiveField(6) final List<int> slidesCovered;
  @HiveField(7) final String   annotationsJson; // JSON-encoded Map<slideId, annotation>

  WhiteboardSessionModel({
    required this.sessionId,
    required this.setId,
    required this.teacherId,
    required this.startTime,
    required this.lastSaved,
    required this.currentPageIndex,
    required this.slidesCovered,
    required this.annotationsJson,
  });

  Map<String, dynamic> toJson() => {
    'sessionId': sessionId,
    'setId': setId,
    'teacherId': teacherId,
    'startTime': startTime.toIso8601String(),
    'lastSaved': lastSaved.toIso8601String(),
    'currentPageIndex': currentPageIndex,
    'slidesCovered': slidesCovered,
    'annotationsJson': annotationsJson,
  };

  factory WhiteboardSessionModel.fromJson(Map<String, dynamic> json) =>
    WhiteboardSessionModel(
      sessionId:       json['sessionId'] as String,
      setId:           json['setId'] as String,
      teacherId:       json['teacherId'] as String,
      startTime:       DateTime.parse(json['startTime'] as String),
      lastSaved:       DateTime.parse(json['lastSaved'] as String),
      currentPageIndex: json['currentPageIndex'] as int,
      slidesCovered:   List<int>.from(json['slidesCovered'] as List),
      annotationsJson: json['annotationsJson'] as String,
    );
}

