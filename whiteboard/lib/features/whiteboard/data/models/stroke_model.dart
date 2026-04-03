// lib/features/whiteboard/data/models/stroke_model.dart
// IMPORTANT: Offset stored via custom OffsetAdapter (typeId: 20)

import 'package:flutter/material.dart';
import 'package:hive/hive.dart';

part 'stroke_model.g.dart';

// Hive typeId: 3
@HiveType(typeId: 3)
class StrokeModel extends HiveObject {
  @HiveField(0) final String         id;
  @HiveField(1) final List<Offset>   points;   // Uses OffsetAdapter (typeId: 20)
  @HiveField(2) final int            colorARGB;
  @HiveField(3) final double         strokeWidth;
  @HiveField(4) final StrokeType     type;
  @HiveField(5) final double         opacity;
  @HiveField(6) final String         slideId;

  Color get color => Color(colorARGB);

  StrokeModel({
    required this.id,
    required this.points,
    required this.colorARGB,
    required this.strokeWidth,
    required this.type,
    required this.opacity,
    required this.slideId,
  });

  // ✅ copyWith — was missing in v3.0
  StrokeModel copyWith({
    String?       id,
    List<Offset>? points,
    int?          colorARGB,
    double?       strokeWidth,
    StrokeType?   type,
    double?       opacity,
    String?       slideId,
  }) => StrokeModel(
    id:          id          ?? this.id,
    points:      points      ?? this.points,
    colorARGB:   colorARGB   ?? this.colorARGB,
    strokeWidth: strokeWidth ?? this.strokeWidth,
    type:        type        ?? this.type,
    opacity:     opacity     ?? this.opacity,
    slideId:     slideId     ?? this.slideId,
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'points': points.map((p) => [p.dx, p.dy]).toList(),
    'colorARGB':   colorARGB,
    'strokeWidth': strokeWidth,
    'type':        type.name,
    'opacity':     opacity,
    'slideId':     slideId,
  };

  factory StrokeModel.fromJson(Map<String, dynamic> json, String slideId) =>
    StrokeModel(
      id:          json['id'] as String,
      points:      (json['points'] as List)
                     .map((p) => Offset(
                       (p as List)[0] as double,
                       p[1] as double,
                     ))
                     .toList(),
      colorARGB:   json['colorARGB'] as int,
      strokeWidth: (json['strokeWidth'] as num).toDouble(),
      type:        StrokeType.values.byName(json['type'] as String),
      opacity:     (json['opacity'] as num).toDouble(),
      slideId:     slideId,
    );
}

// Hive typeId: 9
@HiveType(typeId: 9)
enum StrokeType {
  @HiveField(0) softPen,
  @HiveField(1) hardPen,
  @HiveField(2) highlighter,
  @HiveField(3) chalk,
  @HiveField(4) calligraphy,
  @HiveField(5) spray,
  @HiveField(6) laserPointer,  // NOT saved — ephemeral
}
