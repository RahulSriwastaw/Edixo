// lib/features/whiteboard/presentation/widgets/tools/text_tool.dart
// Text Tool: Create and edit text boxes on canvas

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:uuid/uuid.dart';
import '../../../data/models/canvas_object_model.dart';
import '../../providers/canvas_provider.dart';
import 'package:eduboard_pro/features/whiteboard/presentation/providers/current_slide_id_provider.dart';

// ──────────────────────────────────────────────────────────────────────────
// Text Settings Provider
// ──────────────────────────────────────────────────────────────────────────

class TextSettings {
  final Color textColor;
  final double fontSize;
  final FontWeight fontWeight;
  final bool isItalic;

  const TextSettings({
    this.textColor = Colors.black,
    this.fontSize = 16.0,
    this.fontWeight = FontWeight.normal,
    this.isItalic = false,
  });

  TextSettings copyWith({
    Color? textColor,
    double? fontSize,
    FontWeight? fontWeight,
    bool? isItalic,
  }) {
    return TextSettings(
      textColor: textColor ?? this.textColor,
      fontSize: fontSize ?? this.fontSize,
      fontWeight: fontWeight ?? this.fontWeight,
      isItalic: isItalic ?? this.isItalic,
    );
  }

  Map<String, dynamic> toExtra() => {
    'textColor': textColor.toARGB32(),
    'fontSize': fontSize,
    'fontWeight': fontWeight.index,
    'isItalic': isItalic,
  };

  factory TextSettings.fromExtra(Map<String, dynamic> extra) {
    final fontWeightIndex = (extra['fontWeight'] as int?) ?? 0;
    return TextSettings(
      textColor: Color(extra['textColor'] as int? ?? 0xFF000000),
      fontSize: (extra['fontSize'] as num?)?.toDouble() ?? 16.0,
      fontWeight: fontWeightIndex < FontWeight.values.length
          ? FontWeight.values[fontWeightIndex]
          : FontWeight.normal,
      isItalic: extra['isItalic'] as bool? ?? false,
    );
  }
}

final textSettingsProvider = StateNotifierProvider<TextSettingsNotifier, TextSettings>(
  (ref) => TextSettingsNotifier(),
);

class TextSettingsNotifier extends StateNotifier<TextSettings> {
  TextSettingsNotifier() : super(const TextSettings());

  void setColor(Color color) => state = state.copyWith(textColor: color);
  void setFontSize(double size) => state = state.copyWith(fontSize: size);
  void setFontWeight(FontWeight weight) => state = state.copyWith(fontWeight: weight);
  void toggleItalic() => state = state.copyWith(isItalic: !state.isItalic);
  void toggleBold() => state = state.copyWith(
    fontWeight: state.fontWeight == FontWeight.bold ? FontWeight.normal : FontWeight.bold,
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Text Tool Handler
// ──────────────────────────────────────────────────────────────────────────

class TextToolHandler {
  final dynamic ref;

  TextToolHandler(this.ref);

  /// Create a new text box at the given position
  void createTextBox(Offset position) {
    final textSettings = ref.read(textSettingsProvider);

    final textBox = CanvasObjectModel(
      id: const Uuid().v4(),
      type: ObjectType.textBox,
      x: position.dx,
      y: position.dy,
      width: 200.0,      // Default width
      height: 40.0,      // Default height
      slideId: ref.read(currentSlideIdProvider) ?? '',
      fillColorARGB: 0,  // Transparent
      borderColorARGB: Colors.grey.shade300.toARGB32(),
      borderWidth: 1.0,
      rotation: 0,
      opacity: 1.0,
      isLocked: false,
      zIndex: 0,
      extra: {
        'text': 'Text',
        'textColor': textSettings.textColor.toARGB32(),
        'fontSize': textSettings.fontSize,
        'fontWeight': textSettings.fontWeight.index,
        'isItalic': textSettings.isItalic,
      },
    );

    ref.read(canvasNotifierProvider.notifier).addObject(textBox);
  }

  /// Update text content for a text box
  void updateText(String id, String text) {
    ref.read(canvasNotifierProvider.notifier).updateObjectText(id, text);
  }

  /// Update text properties
  void updateTextSettings(String id, TextSettings settings) {
    final extra = settings.toExtra();
    ref.read(canvasNotifierProvider.notifier).updateObjectExtra(id, {
      ...extra,
      'text': ref.read(canvasNotifierProvider)
          .objects.firstWhere((o) => o.id == id)
          .extra['text'] ?? 'Text',
    });
  }

  /// Change text color
  void setTextColor(Color color) {
    ref.read(textSettingsProvider.notifier).setColor(color);
  }

  /// Change font size
  void setFontSize(double size) {
    ref.read(textSettingsProvider.notifier).setFontSize(size);
  }
}
