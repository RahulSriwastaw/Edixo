// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'page_models.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class SetImportPageAdapter extends TypeAdapter<SetImportPage> {
  @override
  final int typeId = 27;

  @override
  SetImportPage read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return SetImportPage(
      id: fields[0] as String,
      slide: fields[2] as SetSlideModel,
      setId: fields[3] as String,
    );
  }

  @override
  void write(BinaryWriter writer, SetImportPage obj) {
    writer
      ..writeByte(4)
      ..writeByte(2)
      ..write(obj.slide)
      ..writeByte(3)
      ..write(obj.setId)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.type);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is SetImportPageAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class BlankPageAdapter extends TypeAdapter<BlankPage> {
  @override
  final int typeId = 28;

  @override
  BlankPage read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return BlankPage(
      id: fields[0] as String,
    );
  }

  @override
  void write(BinaryWriter writer, BlankPage obj) {
    writer
      ..writeByte(2)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.type);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is BlankPageAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}

class PageTypeAdapter extends TypeAdapter<PageType> {
  @override
  final int typeId = 25;

  @override
  PageType read(BinaryReader reader) {
    switch (reader.readByte()) {
      case 0:
        return PageType.blank;
      case 1:
        return PageType.setImport;
      case 2:
        return PageType.pdf;
      default:
        return PageType.blank;
    }
  }

  @override
  void write(BinaryWriter writer, PageType obj) {
    switch (obj) {
      case PageType.blank:
        writer.writeByte(0);
        break;
      case PageType.setImport:
        writer.writeByte(1);
        break;
      case PageType.pdf:
        writer.writeByte(2);
        break;
    }
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is PageTypeAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
