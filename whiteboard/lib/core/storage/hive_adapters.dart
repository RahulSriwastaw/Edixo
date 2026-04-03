// lib/core/storage/hive_adapters.dart
//
// Custom Hive adapters for types that Hive cannot serialize directly.
// OffsetAdapter is CRITICAL — required by StrokeModel which stores List<Offset>.
// Register both adapters in main.dart BEFORE opening boxes.

import 'package:flutter/material.dart';
import 'package:hive/hive.dart';

/// Adapter for Flutter Offset — stores dx and dy as doubles.
/// 
/// Usage in models:
///   @HiveField(X) final List<Offset> points;  // Uses this adapter automatically
///
/// typeId: 20 (reserved for custom adapters)
class OffsetAdapter extends TypeAdapter<Offset> {
  @override
  final int typeId = 20;

  @override
  Offset read(BinaryReader reader) =>
    Offset(reader.readDouble(), reader.readDouble());

  @override
  void write(BinaryWriter writer, Offset obj) {
    writer.writeDouble(obj.dx);
    writer.writeDouble(obj.dy);
  }
}

/// Adapter for BoxFit enum — NOT used directly in Hive fields.
/// Instead, QuestionWidgetStyle stores bgImageFitIndex (int) and exposes
/// bgImageFit as a getter: BoxFit.values[bgImageFitIndex]
///
/// BoxFit enum indices:
///   0 = fill, 1 = contain, 2 = cover, 3 = fitWidth,
///   4 = fitHeight, 5 = none, 6 = scaleDown
///
/// NOTE: Flutter types that are Flutter enums or classes cannot be
/// stored directly in Hive. Always use int indices or wrapper types.
