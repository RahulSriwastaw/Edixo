// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'stroke_model.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class StrokeModelAdapter extends TypeAdapter<StrokeModel> {
  @override
  final int typeId = 3;

  @override
  StrokeModel read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return StrokeModel(
      id: fields[0] as String,
      points: (fields[1] as List).cast<Offset>(),
      colorARGB: fields[2] as int,
      strokeWidth: fields[3] as double,
      type: fields[4] as StrokeType,
      opacity: fields[5] as double,
      slideId: fields[6] as String,
    );
  }

  @override
  void write(BinaryWriter writer, StrokeModel obj) {
    writer
      ..writeByte(7)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.points)
      ..writeByte(2)
      ..write(obj.colorARGB)
      ..writeByte(3)
      ..write(obj.strokeWidth)
      ..writeByte(4)
      ..write(obj.type)
      ..writeByte(5)
      ..write(obj.opacity)
      ..writeByte(6)
      ..write(obj.slideId);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is StrokeModelAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class StrokeTypeAdapter extends TypeAdapter<StrokeType> {
  @override
  final int typeId = 9;

  @override
  StrokeType read(BinaryReader reader) {
    switch (reader.readByte()) {
      case 0:
        return StrokeType.softPen;
      case 1:
        return StrokeType.hardPen;
      case 2:
        return StrokeType.highlighter;
      case 3:
        return StrokeType.chalk;
      case 4:
        return StrokeType.calligraphy;
      case 5:
        return StrokeType.spray;
      case 6:
        return StrokeType.laserPointer;
      default:
        return StrokeType.softPen;
    }
  }

  @override
  void write(BinaryWriter writer, StrokeType obj) {
    switch (obj) {
      case StrokeType.softPen:
        writer.writeByte(0);
        break;
      case StrokeType.hardPen:
        writer.writeByte(1);
        break;
      case StrokeType.highlighter:
        writer.writeByte(2);
        break;
      case StrokeType.chalk:
        writer.writeByte(3);
        break;
      case StrokeType.calligraphy:
        writer.writeByte(4);
        break;
      case StrokeType.spray:
        writer.writeByte(5);
        break;
      case StrokeType.laserPointer:
        writer.writeByte(6);
        break;
    }
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is StrokeTypeAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
