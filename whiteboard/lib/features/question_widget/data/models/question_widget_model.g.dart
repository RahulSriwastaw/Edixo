// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'question_widget_model.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class QuestionWidgetModelAdapter extends TypeAdapter<QuestionWidgetModel> {
  @override
  final int typeId = 10;

  @override
  QuestionWidgetModel read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return QuestionWidgetModel(
      id: fields[0] as String,
      slideId: fields[1] as String,
      questionNumber: fields[2] as int,
      questionText: fields[3] as String,
      questionImageUrl: fields[4] as String?,
      options: (fields[5] as List).cast<SlideOption>(),
      correctAnswer: fields[6] as String?,
      x: fields[7] as double,
      y: fields[8] as double,
      width: fields[9] as double,
      height: fields[10] as double,
      zIndex: fields[11] as int,
      isLocked: fields[12] as bool,
      style: fields[13] as QuestionWidgetStyle,
    );
  }

  @override
  void write(BinaryWriter writer, QuestionWidgetModel obj) {
    writer
      ..writeByte(14)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.slideId)
      ..writeByte(2)
      ..write(obj.questionNumber)
      ..writeByte(3)
      ..write(obj.questionText)
      ..writeByte(4)
      ..write(obj.questionImageUrl)
      ..writeByte(5)
      ..write(obj.options)
      ..writeByte(6)
      ..write(obj.correctAnswer)
      ..writeByte(7)
      ..write(obj.x)
      ..writeByte(8)
      ..write(obj.y)
      ..writeByte(9)
      ..write(obj.width)
      ..writeByte(10)
      ..write(obj.height)
      ..writeByte(11)
      ..write(obj.zIndex)
      ..writeByte(12)
      ..write(obj.isLocked)
      ..writeByte(13)
      ..write(obj.style);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is QuestionWidgetModelAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
