// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'set_layout_models.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class BaseWidgetLayoutAdapter extends TypeAdapter<BaseWidgetLayout> {
  @override
  final int typeId = 21;

  @override
  BaseWidgetLayout read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return BaseWidgetLayout(
      x: fields[0] as double,
      y: fields[1] as double,
      width: fields[2] as double,
      height: fields[3] as double,
      isLocked: fields[4] as bool,
    );
  }

  @override
  void write(BinaryWriter writer, BaseWidgetLayout obj) {
    writer
      ..writeByte(5)
      ..writeByte(0)
      ..write(obj.x)
      ..writeByte(1)
      ..write(obj.y)
      ..writeByte(2)
      ..write(obj.width)
      ..writeByte(3)
      ..write(obj.height)
      ..writeByte(4)
      ..write(obj.isLocked);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is BaseWidgetLayoutAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class QuestionLayoutAdapter extends TypeAdapter<QuestionLayout> {
  @override
  final int typeId = 22;

  @override
  QuestionLayout read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return QuestionLayout(
      x: fields[0] as double,
      y: fields[1] as double,
      width: fields[2] as double,
      height: fields[3] as double,
      isLocked: fields[4] as bool,
    );
  }

  @override
  void write(BinaryWriter writer, QuestionLayout obj) {
    writer
      ..writeByte(5)
      ..writeByte(0)
      ..write(obj.x)
      ..writeByte(1)
      ..write(obj.y)
      ..writeByte(2)
      ..write(obj.width)
      ..writeByte(3)
      ..write(obj.height)
      ..writeByte(4)
      ..write(obj.isLocked);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is QuestionLayoutAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class OptionsLayoutAdapter extends TypeAdapter<OptionsLayout> {
  @override
  final int typeId = 23;

  @override
  OptionsLayout read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return OptionsLayout(
      x: fields[0] as double,
      y: fields[1] as double,
      width: fields[2] as double,
      height: fields[3] as double,
      isLocked: fields[4] as bool,
    );
  }

  @override
  void write(BinaryWriter writer, OptionsLayout obj) {
    writer
      ..writeByte(5)
      ..writeByte(0)
      ..write(obj.x)
      ..writeByte(1)
      ..write(obj.y)
      ..writeByte(2)
      ..write(obj.width)
      ..writeByte(3)
      ..write(obj.height)
      ..writeByte(4)
      ..write(obj.isLocked);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is OptionsLayoutAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class SetSettingsModelAdapter extends TypeAdapter<SetSettingsModel> {
  @override
  final int typeId = 24;

  @override
  SetSettingsModel read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return SetSettingsModel(
      questionColor: fields[0] as int,
      questionBg: fields[1] as int,
      optionColor: fields[2] as int,
      optionBg: fields[3] as int,
      screenBg: fields[4] as int,
      questionFontSize: fields[5] as double,
      optionFontSize: fields[6] as double,
      showOptions: fields[7] as bool,
      showSourceBadge: fields[8] == null ? true : fields[8] as bool,
      questionBorderColor: fields[9] == null ? 0 : fields[9] as int,
      questionBorderWidth: fields[10] == null ? 0.0 : fields[10] as double,
      optionBorderColor: fields[11] == null ? 0 : fields[11] as int,
      optionBorderWidth: fields[12] == null ? 0.0 : fields[12] as double,
      backgroundPreset: fields[13] as String?,
      showCardBackground: fields[14] == null ? true : fields[14] as bool,
    );
  }

  @override
  void write(BinaryWriter writer, SetSettingsModel obj) {
    writer
      ..writeByte(15)
      ..writeByte(0)
      ..write(obj.questionColor)
      ..writeByte(1)
      ..write(obj.questionBg)
      ..writeByte(2)
      ..write(obj.optionColor)
      ..writeByte(3)
      ..write(obj.optionBg)
      ..writeByte(4)
      ..write(obj.screenBg)
      ..writeByte(5)
      ..write(obj.questionFontSize)
      ..writeByte(6)
      ..write(obj.optionFontSize)
      ..writeByte(7)
      ..write(obj.showOptions)
      ..writeByte(8)
      ..write(obj.showSourceBadge)
      ..writeByte(9)
      ..write(obj.questionBorderColor)
      ..writeByte(10)
      ..write(obj.questionBorderWidth)
      ..writeByte(11)
      ..write(obj.optionBorderColor)
      ..writeByte(12)
      ..write(obj.optionBorderWidth)
      ..writeByte(13)
      ..write(obj.backgroundPreset)
      ..writeByte(14)
      ..write(obj.showCardBackground);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is SetSettingsModelAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
