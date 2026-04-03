// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'canvas_object_model.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class CanvasObjectModelAdapter extends TypeAdapter<CanvasObjectModel> {
  @override
  final int typeId = 4;

  @override
  CanvasObjectModel read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return CanvasObjectModel(
      id: fields[0] as String?,
      type: fields[1] as ObjectType,
      x: fields[2] as double,
      y: fields[3] as double,
      width: fields[4] as double,
      height: fields[5] as double,
      rotation: fields[6] as double,
      fillColorARGB: fields[7] as int,
      borderColorARGB: fields[8] as int,
      borderWidth: fields[9] as double,
      opacity: fields[10] as double,
      isLocked: fields[11] as bool,
      zIndex: fields[12] as int,
      slideId: fields[13] as String,
      extra: (fields[14] as Map?)?.cast<String, dynamic>(),
    );
  }

  @override
  void write(BinaryWriter writer, CanvasObjectModel obj) {
    writer
      ..writeByte(15)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.type)
      ..writeByte(2)
      ..write(obj.x)
      ..writeByte(3)
      ..write(obj.y)
      ..writeByte(4)
      ..write(obj.width)
      ..writeByte(5)
      ..write(obj.height)
      ..writeByte(6)
      ..write(obj.rotation)
      ..writeByte(7)
      ..write(obj.fillColorARGB)
      ..writeByte(8)
      ..write(obj.borderColorARGB)
      ..writeByte(9)
      ..write(obj.borderWidth)
      ..writeByte(10)
      ..write(obj.opacity)
      ..writeByte(11)
      ..write(obj.isLocked)
      ..writeByte(12)
      ..write(obj.zIndex)
      ..writeByte(13)
      ..write(obj.slideId)
      ..writeByte(14)
      ..write(obj.extra);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is CanvasObjectModelAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class ObjectTypeAdapter extends TypeAdapter<ObjectType> {
  @override
  final int typeId = 8;

  @override
  ObjectType read(BinaryReader reader) {
    switch (reader.readByte()) {
      case 0:
        return ObjectType.rectangle;
      case 1:
        return ObjectType.roundedRect;
      case 2:
        return ObjectType.circle;
      case 3:
        return ObjectType.triangle;
      case 4:
        return ObjectType.star;
      case 5:
        return ObjectType.polygon;
      case 6:
        return ObjectType.line;
      case 7:
        return ObjectType.arrow;
      case 8:
        return ObjectType.doubleArrow;
      case 9:
        return ObjectType.callout;
      case 10:
        return ObjectType.textBox;
      case 11:
        return ObjectType.stickyNote;
      case 12:
        return ObjectType.imageBox;
      case 13:
        return ObjectType.ruler;
      case 14:
        return ObjectType.protractor;
      case 15:
        return ObjectType.compass;
      default:
        return ObjectType.rectangle;
    }
  }

  @override
  void write(BinaryWriter writer, ObjectType obj) {
    switch (obj) {
      case ObjectType.rectangle:
        writer.writeByte(0);
        break;
      case ObjectType.roundedRect:
        writer.writeByte(1);
        break;
      case ObjectType.circle:
        writer.writeByte(2);
        break;
      case ObjectType.triangle:
        writer.writeByte(3);
        break;
      case ObjectType.star:
        writer.writeByte(4);
        break;
      case ObjectType.polygon:
        writer.writeByte(5);
        break;
      case ObjectType.line:
        writer.writeByte(6);
        break;
      case ObjectType.arrow:
        writer.writeByte(7);
        break;
      case ObjectType.doubleArrow:
        writer.writeByte(8);
        break;
      case ObjectType.callout:
        writer.writeByte(9);
        break;
      case ObjectType.textBox:
        writer.writeByte(10);
        break;
      case ObjectType.stickyNote:
        writer.writeByte(11);
        break;
      case ObjectType.imageBox:
        writer.writeByte(12);
        break;
      case ObjectType.ruler:
        writer.writeByte(13);
        break;
      case ObjectType.protractor:
        writer.writeByte(14);
        break;
      case ObjectType.compass:
        writer.writeByte(15);
        break;
    }
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is ObjectTypeAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
