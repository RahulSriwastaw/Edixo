import 'package:flutter/material.dart';
import '../../providers/tool_provider.dart';

class StrokePoint {
  final double x;
  final double y;
  final double pressure;
  final DateTime? timestamp;

  const StrokePoint(this.x, this.y, {this.pressure = 1.0, this.timestamp});

  Map<String, dynamic> toJson() => {
    'x': x,
    'y': y,
    'p': pressure,
  };

  factory StrokePoint.fromJson(Map<String, dynamic> json) {
    return StrokePoint(
      (json['x'] as num).toDouble(),
      (json['y'] as num).toDouble(),
      pressure: (json['p'] as num? ?? 1.0).toDouble(),
    );
  }
}

class Stroke {
  final String id;
  final List<StrokePoint> points;
  final Color color;
  final double thickness;
  final double opacity;
  final Tool type;
  final bool isFilled;
  final bool isSelected;

  const Stroke({
    required this.id,
    required this.points,
    required this.color,
    required this.thickness,
    this.opacity = 1.0,
    required this.type,
    this.isFilled = false,
    this.isSelected = false,
  });

  Stroke copyWith({
    String? id,
    List<StrokePoint>? points,
    Color? color,
    double? thickness,
    double? opacity,
    Tool? type,
    bool? isFilled,
    bool? isSelected,
  }) {
    return Stroke(
      id: id ?? this.id,
      points: points ?? this.points,
      color: color ?? this.color,
      thickness: thickness ?? this.thickness,
      opacity: opacity ?? this.opacity,
      type: type ?? this.type,
      isFilled: isFilled ?? this.isFilled,
      isSelected: isSelected ?? this.isSelected,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'points': points.map((p) => p.toJson()).toList(),
    'color': color.value,
    'thickness': thickness,
    'opacity': opacity,
    'type': type.name,
    'isFilled': isFilled,
  };

  factory Stroke.fromJson(Map<String, dynamic> json) {
    return Stroke(
      id: json['id'] as String,
      points: (json['points'] as List)
          .map((p) => StrokePoint.fromJson(Map<String, dynamic>.from(p)))
          .toList(),
      color: Color(json['color'] as int),
      thickness: (json['thickness'] as num).toDouble(),
      opacity: (json['opacity'] as num? ?? 1.0).toDouble(),
      type: Tool.values.byName(json['type'] as String),
      isFilled: json['isFilled'] as bool? ?? false,
    );
  }
}
