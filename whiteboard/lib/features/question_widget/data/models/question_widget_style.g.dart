// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'question_widget_style.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class QuestionWidgetStyleAdapter extends TypeAdapter<QuestionWidgetStyle> {
  @override
  final int typeId = 11;

  @override
  QuestionWidgetStyle read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return QuestionWidgetStyle(
      questionTextColorARGB: fields[0] as int,
      questionBgColorARGB: fields[1] as int,
      optionTextColorARGB: fields[2] as int,
      optionBgColorARGB: fields[3] as int,
      questionFontSize: fields[4] as double,
      optionFontSize: fields[5] as double,
      fontFamily: fields[6] as String,
      borderRadius: fields[7] as double,
      borderWidth: fields[8] as double,
      borderColorARGB: fields[9] as int,
      hasShadow: fields[10] as bool,
      padding: fields[11] as double,
      bgImagePath: fields[12] as String?,
      bgImageUrl: fields[13] as String?,
      bgImageOpacity: fields[14] as double,
      bgImageFitIndex: fields[15] as int,
      showCardBackground: fields[16] == null ? true : fields[16] as bool,
    );
  }

  @override
  void write(BinaryWriter writer, QuestionWidgetStyle obj) {
    writer
      ..writeByte(17)
      ..writeByte(0)
      ..write(obj.questionTextColorARGB)
      ..writeByte(1)
      ..write(obj.questionBgColorARGB)
      ..writeByte(2)
      ..write(obj.optionTextColorARGB)
      ..writeByte(3)
      ..write(obj.optionBgColorARGB)
      ..writeByte(4)
      ..write(obj.questionFontSize)
      ..writeByte(5)
      ..write(obj.optionFontSize)
      ..writeByte(6)
      ..write(obj.fontFamily)
      ..writeByte(7)
      ..write(obj.borderRadius)
      ..writeByte(8)
      ..write(obj.borderWidth)
      ..writeByte(9)
      ..write(obj.borderColorARGB)
      ..writeByte(10)
      ..write(obj.hasShadow)
      ..writeByte(11)
      ..write(obj.padding)
      ..writeByte(12)
      ..write(obj.bgImagePath)
      ..writeByte(13)
      ..write(obj.bgImageUrl)
      ..writeByte(14)
      ..write(obj.bgImageOpacity)
      ..writeByte(15)
      ..write(obj.bgImageFitIndex)
      ..writeByte(16)
      ..write(obj.showCardBackground);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is QuestionWidgetStyleAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
