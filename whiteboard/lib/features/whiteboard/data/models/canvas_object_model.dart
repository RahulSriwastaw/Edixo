// lib/features/whiteboard/data/models/canvas_object_model.dart

import 'package:hive/hive.dart';
import 'package:flutter/material.dart';
import 'package:uuid/uuid.dart';

part 'canvas_object_model.g.dart';

// Hive typeId: 4
@HiveType(typeId: 4)
class CanvasObjectModel extends HiveObject {
  @HiveField(0)  final String   id;
  @HiveField(1)  final ObjectType type;
  @HiveField(2)  final double   x;
  @HiveField(3)  final double   y;
  @HiveField(4)  final double   width;
  @HiveField(5)  final double   height;
  @HiveField(6)  final double   rotation;       // degrees 0–360
  @HiveField(7)  final int      fillColorARGB;
  @HiveField(8)  final int      borderColorARGB;
  @HiveField(9)  final double   borderWidth;
  @HiveField(10) final double   opacity;
  @HiveField(11) final bool     isLocked;
  @HiveField(12) final int      zIndex;
  @HiveField(13) final String   slideId;
  @HiveField(14) final Map<String, dynamic> extra; // type-specific

  Color get fillColor   => Color(fillColorARGB);
  Color get borderColor => Color(borderColorARGB);
  Rect  get bounds      => Rect.fromLTWH(x, y, width, height);

  CanvasObjectModel({
    String? id,
    required this.type,
    required this.x,
    required this.y,
    required this.width,
    required this.height,
    this.rotation       = 0.0,
    this.fillColorARGB  = 0x00000000,
    this.borderColorARGB= 0xFFFFFFFF,
    this.borderWidth    = 1.0,
    this.opacity        = 1.0,
    this.isLocked       = false,
    this.zIndex         = 0,
    required this.slideId,
    Map<String, dynamic>? extra,
  })  : id    = id ?? const Uuid().v4(),
        extra = extra ?? {};

  CanvasObjectModel copyWith({
    String? id,
    ObjectType? type,
    double? x, double? y, double? width, double? height,
    double? rotation, int? fillColorARGB, int? borderColorARGB,
    double? borderWidth, double? opacity, bool? isLocked,
    int? zIndex, String? slideId, Map<String, dynamic>? extra,
  }) => CanvasObjectModel(
    id:              id             ?? this.id,
    type:            type           ?? this.type,
    x:               x              ?? this.x,
    y:               y              ?? this.y,
    width:           width          ?? this.width,
    height:          height         ?? this.height,
    rotation:        rotation       ?? this.rotation,
    fillColorARGB:   fillColorARGB  ?? this.fillColorARGB,
    borderColorARGB: borderColorARGB?? this.borderColorARGB,
    borderWidth:     borderWidth    ?? this.borderWidth,
    opacity:         opacity        ?? this.opacity,
    isLocked:        isLocked       ?? this.isLocked,
    zIndex:          zIndex         ?? this.zIndex,
    slideId:         slideId        ?? this.slideId,
    extra:           extra          ?? Map.from(this.extra),
  );

  Map<String, dynamic> toJson() => {
    'id': id, 'type': type.name,
    'x': x, 'y': y, 'width': width, 'height': height,
    'rotation': rotation,
    'fillColorARGB': fillColorARGB, 'borderColorARGB': borderColorARGB,
    'borderWidth': borderWidth, 'opacity': opacity,
    'isLocked': isLocked, 'zIndex': zIndex,
    'slideId': slideId, 'extra': extra,
  };

  factory CanvasObjectModel.fromJson(Map<String, dynamic> json) => CanvasObjectModel(
    id:              json['id'] as String,
    type:            ObjectType.values.byName(json['type'] as String),
    x:               (json['x'] as num).toDouble(),
    y:               (json['y'] as num).toDouble(),
    width:           (json['width'] as num).toDouble(),
    height:          (json['height'] as num).toDouble(),
    rotation:        (json['rotation'] as num?)?.toDouble() ?? 0.0,
    fillColorARGB:   json['fillColorARGB'] as int? ?? 0x00000000,
    borderColorARGB: json['borderColorARGB'] as int? ?? 0xFFFFFFFF,
    borderWidth:     (json['borderWidth'] as num?)?.toDouble() ?? 1.0,
    opacity:         (json['opacity'] as num?)?.toDouble() ?? 1.0,
    isLocked:        json['isLocked'] as bool? ?? false,
    zIndex:          json['zIndex'] as int? ?? 0,
    slideId:         json['slideId'] as String,
    extra:           Map<String, dynamic>.from(json['extra'] as Map? ?? {}),
  );
}

// Hive typeId: 8
@HiveType(typeId: 8)
enum ObjectType {
  @HiveField(0)  rectangle,
  @HiveField(1)  roundedRect,
  @HiveField(2)  circle,
  @HiveField(3)  triangle,
  @HiveField(4)  star,
  @HiveField(5)  polygon,
  @HiveField(6)  line,
  @HiveField(7)  arrow,
  @HiveField(8)  doubleArrow,
  @HiveField(9)  callout,
  @HiveField(10) textBox,
  @HiveField(11) stickyNote,
  @HiveField(12) imageBox,
  @HiveField(13) ruler,
  @HiveField(14) protractor,
  @HiveField(15) compass,
}
