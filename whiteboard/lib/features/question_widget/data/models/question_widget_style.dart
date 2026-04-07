// lib/features/question_widget/data/models/question_widget_style.dart
// IMPORTANT: BoxFit cannot be stored directly in Hive.
// We store bgImageFitIndex (int) and expose bgImageFit as a getter.

import 'package:flutter/material.dart';
import 'package:hive/hive.dart';

part 'question_widget_style.g.dart';

// Hive typeId: 11
@HiveType(typeId: 11)
class QuestionWidgetStyle extends HiveObject {
  @HiveField(0)  final int    questionTextColorARGB;
  @HiveField(1)  final int    questionBgColorARGB;
  @HiveField(2)  final int    optionTextColorARGB;
  @HiveField(3)  final int    optionBgColorARGB;
  @HiveField(4)  final double questionFontSize;
  @HiveField(5)  final double optionFontSize;
  @HiveField(6)  final String fontFamily;       // 'DM Sans' | 'Noto Sans Devanagari'
  @HiveField(7)  final double borderRadius;
  @HiveField(8)  final double borderWidth;
  @HiveField(9)  final int    borderColorARGB;
  @HiveField(10) final bool   hasShadow;
  @HiveField(11) final double padding;
  @HiveField(12) final String? bgImagePath;
  @HiveField(13) final String? bgImageUrl;
  @HiveField(14) final double bgImageOpacity;
  // ✅ v3.1 FIX: Store as int index instead of BoxFit (Flutter type not Hive-serializable)
  @HiveField(15) final int   bgImageFitIndex;
  @HiveField(16, defaultValue: true) final bool   showCardBackground;

  // Getter for convenient access
  BoxFit get bgImageFit => BoxFit.values[bgImageFitIndex];

  QuestionWidgetStyle({
    required this.questionTextColorARGB,
    required this.questionBgColorARGB,
    required this.optionTextColorARGB,
    required this.optionBgColorARGB,
    required this.questionFontSize,
    required this.optionFontSize,
    required this.fontFamily,
    required this.borderRadius,
    required this.borderWidth,
    required this.borderColorARGB,
    required this.hasShadow,
    required this.padding,
    this.bgImagePath,
    this.bgImageUrl,
    required this.bgImageOpacity,
    required this.bgImageFitIndex,
    this.showCardBackground = true,
  });

  // Default coaching aesthetic: black bg, white question, yellow options
  static QuestionWidgetStyle get defaults => QuestionWidgetStyle(
    questionTextColorARGB: 0xFFFFFFFF,
    questionBgColorARGB:   0xFF000000,
    optionTextColorARGB:   0xFFFFFF00,
    optionBgColorARGB:     0x00000000,
    questionFontSize:      22.0,
    optionFontSize:        20.0,
    fontFamily:            'DM Sans',
    borderRadius:          8.0,
    borderWidth:           0.0,
    borderColorARGB:       0xFF444444,
    hasShadow:             false,
    padding:               16.0,
    bgImagePath:           null,
    bgImageUrl:            null,
    bgImageOpacity:        1.0,
    bgImageFitIndex:       0,  // BoxFit.fill = index 0
    showCardBackground:    true,
  );

  QuestionWidgetStyle copyWith({
    int? questionTextColorARGB, int? questionBgColorARGB,
    int? optionTextColorARGB, int? optionBgColorARGB,
    double? questionFontSize, double? optionFontSize,
    String? fontFamily, double? borderRadius, double? borderWidth,
    int? borderColorARGB, bool? hasShadow, double? padding,
    String? bgImagePath, String? bgImageUrl,
    double? bgImageOpacity, int? bgImageFitIndex,
    bool? showCardBackground,
  }) => QuestionWidgetStyle(
    questionTextColorARGB: questionTextColorARGB ?? this.questionTextColorARGB,
    questionBgColorARGB:   questionBgColorARGB   ?? this.questionBgColorARGB,
    optionTextColorARGB:   optionTextColorARGB   ?? this.optionTextColorARGB,
    optionBgColorARGB:     optionBgColorARGB     ?? this.optionBgColorARGB,
    questionFontSize:      questionFontSize      ?? this.questionFontSize,
    optionFontSize:        optionFontSize        ?? this.optionFontSize,
    fontFamily:            fontFamily            ?? this.fontFamily,
    borderRadius:          borderRadius          ?? this.borderRadius,
    borderWidth:           borderWidth           ?? this.borderWidth,
    borderColorARGB:       borderColorARGB       ?? this.borderColorARGB,
    hasShadow:             hasShadow             ?? this.hasShadow,
    padding:               padding               ?? this.padding,
    bgImagePath:           bgImagePath           ?? this.bgImagePath,
    bgImageUrl:            bgImageUrl            ?? this.bgImageUrl,
    bgImageOpacity:        bgImageOpacity        ?? this.bgImageOpacity,
    bgImageFitIndex:       bgImageFitIndex       ?? this.bgImageFitIndex,
    showCardBackground:    showCardBackground    ?? this.showCardBackground,
  );

  Map<String, dynamic> toJson() => {
    'questionTextColorARGB': questionTextColorARGB,
    'questionBgColorARGB':   questionBgColorARGB,
    'optionTextColorARGB':   optionTextColorARGB,
    'optionBgColorARGB':     optionBgColorARGB,
    'questionFontSize':      questionFontSize,
    'optionFontSize':        optionFontSize,
    'fontFamily':            fontFamily,
    'borderRadius':          borderRadius,
    'borderWidth':           borderWidth,
    'borderColorARGB':       borderColorARGB,
    'hasShadow':             hasShadow,
    'padding':               padding,
    'bgImagePath':           bgImagePath,
    'bgImageUrl':            bgImageUrl,
    'bgImageOpacity':        bgImageOpacity,
    'bgImageFitIndex':       bgImageFitIndex,
  };
}
