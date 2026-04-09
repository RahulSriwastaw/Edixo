// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'session_model.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class WhiteboardSessionModelAdapter
    extends TypeAdapter<WhiteboardSessionModel> {
  @override
  final int typeId = 7;

  @override
  WhiteboardSessionModel read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return WhiteboardSessionModel(
      sessionId: fields[0] as String,
      setId: fields[1] as String,
      teacherId: fields[2] as String,
      startTime: fields[3] as DateTime,
      lastSaved: fields[4] as DateTime,
      currentPageIndex: fields[5] as int,
      slidesCovered: (fields[6] as List).cast<int>(),
      annotationsJson: fields[7] as String,
      setIds: (fields[8] as List).cast<String>(),
    );
  }

  @override
  void write(BinaryWriter writer, WhiteboardSessionModel obj) {
    writer
      ..writeByte(9)
      ..writeByte(0)
      ..write(obj.sessionId)
      ..writeByte(1)
      ..write(obj.setId)
      ..writeByte(2)
      ..write(obj.teacherId)
      ..writeByte(3)
      ..write(obj.startTime)
      ..writeByte(4)
      ..write(obj.lastSaved)
      ..writeByte(5)
      ..write(obj.currentPageIndex)
      ..writeByte(6)
      ..write(obj.slidesCovered)
      ..writeByte(7)
      ..write(obj.annotationsJson)
      ..writeByte(8)
      ..write(obj.setIds);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is WhiteboardSessionModelAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
