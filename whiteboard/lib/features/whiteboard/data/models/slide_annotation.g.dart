// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'slide_annotation.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class SlideAnnotationDataAdapter extends TypeAdapter<SlideAnnotationData> {
  @override
  final int typeId = 5;

  @override
  SlideAnnotationData read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return SlideAnnotationData(
      slideId: fields[0] as String,
      strokes: (fields[1] as List?)?.cast<StrokeModel>(),
      objects: (fields[2] as List?)?.cast<CanvasObjectModel>(),
      colorConfig: fields[3] as SlideColorConfig?,
      bgImagePath: fields[4] as String?,
    );
  }

  @override
  void write(BinaryWriter writer, SlideAnnotationData obj) {
    writer
      ..writeByte(5)
      ..writeByte(0)
      ..write(obj.slideId)
      ..writeByte(1)
      ..write(obj.strokes)
      ..writeByte(2)
      ..write(obj.objects)
      ..writeByte(3)
      ..write(obj.colorConfig)
      ..writeByte(4)
      ..write(obj.bgImagePath);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is SlideAnnotationDataAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class SlideColorConfigAdapter extends TypeAdapter<SlideColorConfig> {
  @override
  final int typeId = 6;

  @override
  SlideColorConfig read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return SlideColorConfig(
      questionTextColorARGB: fields[0] as int,
      questionBgColorARGB: fields[1] as int,
      optionTextColorARGB: fields[2] as int,
      optionBgColorARGB: fields[3] as int,
      screenBgColorARGB: fields[4] as int,
    );
  }

  @override
  void write(BinaryWriter writer, SlideColorConfig obj) {
    writer
      ..writeByte(5)
      ..writeByte(0)
      ..write(obj.questionTextColorARGB)
      ..writeByte(1)
      ..write(obj.questionBgColorARGB)
      ..writeByte(2)
      ..write(obj.optionTextColorARGB)
      ..writeByte(3)
      ..write(obj.optionBgColorARGB)
      ..writeByte(4)
      ..write(obj.screenBgColorARGB);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is SlideColorConfigAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
