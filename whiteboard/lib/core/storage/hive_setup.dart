import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:uuid/uuid.dart';
import '../../features/whiteboard/providers/canvas_provider.dart';

const _uuid = Uuid();

class StrokePointAdapter extends TypeAdapter<StrokePoint> {
  @override
  final int typeId = 10;

  @override
  StrokePoint read(BinaryReader reader) {
    final x = reader.readDouble();
    final y = reader.readDouble();
    final pressure = reader.readDouble();
    final hasTime = reader.readBool();
    final time = hasTime ? DateTime.fromMillisecondsSinceEpoch(reader.readInt()) : null;
    return StrokePoint(x, y, pressure: pressure, time: time);
  }

  @override
  void write(BinaryWriter writer, StrokePoint obj) {
    writer
      ..writeDouble(obj.x)
      ..writeDouble(obj.y)
      ..writeDouble(obj.pressure)
      ..writeBool(obj.time != null);
    if (obj.time != null) writer.writeInt(obj.time!.millisecondsSinceEpoch);
  }
}

class StrokeAdapter extends TypeAdapter<Stroke> {
  @override
  final int typeId = 11;

  @override
  Stroke read(BinaryReader reader) {
    final id = reader.readString();
    final points = reader.readList().cast<StrokePoint>();
    final color = Color(reader.readInt());
    final thickness = reader.readDouble();
    final opacity = reader.readDouble();
    final typeName = reader.readString();
    final text = reader.readBool() ? reader.readString() : null;
    final isFilled = reader.readBool();
    final isSelected = reader.readBool();
    return Stroke(
      id: id,
      points: points,
      color: color,
      thickness: thickness,
      opacity: opacity,
      type: StrokeType.values.byName(typeName),
      text: text,
      isFilled: isFilled,
      isSelected: isSelected,
    );
  }

  @override
  void write(BinaryWriter writer, Stroke obj) {
    writer
      ..writeString(obj.id)
      ..writeList(obj.points)
      ..writeInt(obj.color.value)
      ..writeDouble(obj.thickness)
      ..writeDouble(obj.opacity)
      ..writeString(obj.type.name)
      ..writeBool(obj.text != null);
    if (obj.text != null) writer.writeString(obj.text!);
    writer
      ..writeBool(obj.isFilled)
      ..writeBool(obj.isSelected);
  }
}

class PageDataAdapter extends TypeAdapter<PageData> {
  @override
  final int typeId = 12;

  @override
  PageData read(BinaryReader reader) {
    final id = reader.readString();
    final strokes = reader.readList().cast<Stroke>();
    final templateIndex = reader.readInt();
    final bgColorIndex = reader.readInt();
    final hasBgBytes = reader.readBool();
    Uint8List? bytes;
    if (hasBgBytes) {
      bytes = reader.readByteList();
    }
    return PageData(
      id: id,
      strokes: strokes,
      template: PageTemplate.values[templateIndex],
      bgColor: BackgroundColor.values[bgColorIndex],
      bgImageBytes: bytes,
    );
  }

  @override
  void write(BinaryWriter writer, PageData obj) {
    writer
      ..writeString(obj.id)
      ..writeList(obj.strokes)
      ..writeInt(obj.template.index)
      ..writeInt(obj.bgColor.index)
      ..writeBool(obj.bgImageBytes != null);
    if (obj.bgImageBytes != null) {
      writer.writeByteList(obj.bgImageBytes!);
    }
  }
}

class QuestionThemeAdapter extends TypeAdapter<QuestionTheme> {
  @override
  final int typeId = 13;

  @override
  QuestionTheme read(BinaryReader reader) {
    return QuestionTheme(
      questionColor: Color(reader.readInt()),
      questionBgColor: Color(reader.readInt()),
      optionColor: Color(reader.readInt()),
      optionBgColor: Color(reader.readInt()),
      screenBgColor: Color(reader.readInt()),
      updatePosition: reader.readBool(),
    );
  }

  @override
  void write(BinaryWriter writer, QuestionTheme obj) {
    writer
      ..writeInt(obj.questionColor.value)
      ..writeInt(obj.questionBgColor.value)
      ..writeInt(obj.optionColor.value)
      ..writeInt(obj.optionBgColor.value)
      ..writeInt(obj.screenBgColor.value)
      ..writeBool(obj.updatePosition);
  }
}

Future<void> setupHive() async {
  await Hive.initFlutter();
  if (!Hive.isAdapterRegistered(10)) Hive.registerAdapter(StrokePointAdapter());
  if (!Hive.isAdapterRegistered(11)) Hive.registerAdapter(StrokeAdapter());
  if (!Hive.isAdapterRegistered(12)) Hive.registerAdapter(PageDataAdapter());
  if (!Hive.isAdapterRegistered(13)) Hive.registerAdapter(QuestionThemeAdapter());
  await Hive.openBox<dynamic>('sessions');
  await Hive.openBox<dynamic>('questions');
  await Hive.openBox<dynamic>('settings');
  await Hive.openBox<dynamic>('pending_uploads');
}

String newSessionId() => _uuid.v4();
