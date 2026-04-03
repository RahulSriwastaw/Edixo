// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'slide_model.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class SlideOptionAdapter extends TypeAdapter<SlideOption> {
  @override
  final int typeId = 2;

  @override
  SlideOption read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return SlideOption(
      label: fields[0] as String,
      text: fields[1] as String,
      imageUrl: fields[2] as String?,
    );
  }

  @override
  void write(BinaryWriter writer, SlideOption obj) {
    writer
      ..writeByte(3)
      ..writeByte(0)
      ..write(obj.label)
      ..writeByte(1)
      ..write(obj.text)
      ..writeByte(2)
      ..write(obj.imageUrl);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is SlideOptionAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class SetSlideModelAdapter extends TypeAdapter<SetSlideModel> {
  @override
  final int typeId = 1;

  @override
  SetSlideModel read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return SetSlideModel(
      slideId: fields[0] as String,
      questionNumber: fields[1] as int,
      questionText: fields[2] as String,
      questionImageUrl: fields[3] as String?,
      options: (fields[4] as List).cast<SlideOption>(),
      correctAnswer: fields[5] as String?,
      examSource: fields[6] as String?,
      subject: fields[7] as String?,
      backgroundImageUrl: fields[8] as String?,
    );
  }

  @override
  void write(BinaryWriter writer, SetSlideModel obj) {
    writer
      ..writeByte(9)
      ..writeByte(0)
      ..write(obj.slideId)
      ..writeByte(1)
      ..write(obj.questionNumber)
      ..writeByte(2)
      ..write(obj.questionText)
      ..writeByte(3)
      ..write(obj.questionImageUrl)
      ..writeByte(4)
      ..write(obj.options)
      ..writeByte(5)
      ..write(obj.correctAnswer)
      ..writeByte(6)
      ..write(obj.examSource)
      ..writeByte(7)
      ..write(obj.subject)
      ..writeByte(8)
      ..write(obj.backgroundImageUrl);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is SetSlideModelAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
