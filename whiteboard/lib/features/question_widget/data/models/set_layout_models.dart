
import 'package:flutter/material.dart';
import 'package:hive/hive.dart';

part 'set_layout_models.g.dart';

@HiveType(typeId: 21)
class BaseWidgetLayout extends HiveObject {
  @HiveField(0) final double x;
  @HiveField(1) final double y;
  @HiveField(2) final double width;
  @HiveField(3) final double height;
  @HiveField(4) final bool isLocked;

  BaseWidgetLayout({
    required this.x,
    required this.y,
    required this.width,
    required this.height,
    this.isLocked = false,
  });

  BaseWidgetLayout copyWith({
    double? x,
    double? y,
    double? width,
    double? height,
    bool? isLocked,
  }) => BaseWidgetLayout(
    x: x ?? this.x,
    y: y ?? this.y,
    width: width ?? this.width,
    height: height ?? this.height,
    isLocked: isLocked ?? this.isLocked,
  );
}

@HiveType(typeId: 22)
class QuestionLayout extends BaseWidgetLayout {
  QuestionLayout({
    required super.x,
    required super.y,
    required super.width,
    required super.height,
    super.isLocked,
  });

  @override
  QuestionLayout copyWith({
    double? x,
    double? y,
    double? width,
    double? height,
    bool? isLocked,
  }) => QuestionLayout(
    x: x ?? this.x,
    y: y ?? this.y,
    width: width ?? this.width,
    height: height ?? this.height,
    isLocked: isLocked ?? this.isLocked,
  );
}

@HiveType(typeId: 23)
class OptionsLayout extends BaseWidgetLayout {
  OptionsLayout({
    required super.x,
    required super.y,
    required super.width,
    required super.height,
    super.isLocked,
  });

  @override
  OptionsLayout copyWith({
    double? x,
    double? y,
    double? width,
    double? height,
    bool? isLocked,
  }) => OptionsLayout(
    x: x ?? this.x,
    y: y ?? this.y,
    width: width ?? this.width,
    height: height ?? this.height,
    isLocked: isLocked ?? this.isLocked,
  );
}

@HiveType(typeId: 24)
class SetSettingsModel extends HiveObject {
  @HiveField(0) final int questionColor;
  @HiveField(1) final int questionBg;
  @HiveField(2) final int optionColor;
  @HiveField(3) final int optionBg;
  @HiveField(4) final int screenBg;
  @HiveField(5) final double questionFontSize;
  @HiveField(6) final double optionFontSize;
  @HiveField(7) final bool showOptions;
  @HiveField(8, defaultValue: true) final bool showSourceBadge;
  @HiveField(9, defaultValue: 0x00000000) final int questionBorderColor;
  @HiveField(10, defaultValue: 0.0) final double questionBorderWidth;
  @HiveField(11, defaultValue: 0x00000000) final int optionBorderColor;
  @HiveField(12, defaultValue: 0.0) final double optionBorderWidth;
  @HiveField(13, defaultValue: null) final String? backgroundPreset;
  @HiveField(14, defaultValue: true) final bool showCardBackground;

  SetSettingsModel({
    required this.questionColor,
    required this.questionBg,
    required this.optionColor,
    required this.optionBg,
    required this.screenBg,
    required this.questionFontSize,
    required this.optionFontSize,
    this.showOptions = true,
    this.showSourceBadge = true,
    this.questionBorderColor = 0x00000000,
    this.questionBorderWidth = 0.0,
    this.optionBorderColor = 0x00000000,
    this.optionBorderWidth = 0.0,
    this.backgroundPreset,
    this.showCardBackground = true,
  });

  static SetSettingsModel get defaults => SetSettingsModel(
    questionColor: 0xFFFFFFFF,
    questionBg: 0xFF262626,
    optionColor: 0xFFFFFF00,
    optionBg: 0x00000000,
    screenBg: 0xFF0D0D0D,
    questionFontSize: 24,
    optionFontSize: 20,
    questionBorderColor: 0x00000000,
    questionBorderWidth: 0.0,
    optionBorderColor: 0x00000000,
    optionBorderWidth: 0.0,
    backgroundPreset: null,
    showCardBackground: true,
  );

  SetSettingsModel copyWith({
    int? questionColor,
    int? questionBg,
    int? optionColor,
    int? optionBg,
    int? screenBg,
    double? questionFontSize,
    double? optionFontSize,
    bool? showOptions,
    bool? showSourceBadge,
    int? questionBorderColor,
    double? questionBorderWidth,
    int? optionBorderColor,
    double? optionBorderWidth,
    String? backgroundPreset,
    bool? showCardBackground,
    bool clearBackground = false,
  }) => SetSettingsModel(
    questionColor: questionColor ?? this.questionColor,
    questionBg: questionBg ?? this.questionBg,
    optionColor: optionColor ?? this.optionColor,
    optionBg: optionBg ?? this.optionBg,
    screenBg: screenBg ?? this.screenBg,
    questionFontSize: questionFontSize ?? this.questionFontSize,
    optionFontSize: optionFontSize ?? this.optionFontSize,
    showOptions: showOptions ?? this.showOptions,
    showSourceBadge: showSourceBadge ?? this.showSourceBadge,
    questionBorderColor: questionBorderColor ?? this.questionBorderColor,
    questionBorderWidth: questionBorderWidth ?? this.questionBorderWidth,
    optionBorderColor: optionBorderColor ?? this.optionBorderColor,
    optionBorderWidth: optionBorderWidth ?? this.optionBorderWidth,
    backgroundPreset: clearBackground ? null : (backgroundPreset ?? this.backgroundPreset),
    showCardBackground: showCardBackground ?? this.showCardBackground,
  );
}
