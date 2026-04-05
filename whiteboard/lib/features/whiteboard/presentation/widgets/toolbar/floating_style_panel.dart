import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:file_picker/file_picker.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/constants/app_dimensions.dart';
import '../../../../../core/constants/app_text_styles.dart';
import '../../../../question_widget/presentation/providers/selected_widget_provider.dart';
import '../../../../question_widget/presentation/providers/question_widget_provider.dart';
import '../../../../question_widget/data/models/question_widget_style.dart';

class FloatingStylePanel extends ConsumerWidget {
  const FloatingStylePanel({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedWidgetId = ref.watch(selectedWidgetNotifierProvider);
    final questionWidgets = ref.watch(questionWidgetNotifierProvider);

    // Only show if a widget is selected
    if (selectedWidgetId == null) {
      return const SizedBox.shrink();
    }

    final selectedWidget = questionWidgets[selectedWidgetId];
    if (selectedWidget == null) {
      return const SizedBox.shrink();
    }

    final style = selectedWidget.style;
    final notifier = ref.read(questionWidgetNotifierProvider.notifier);

    return Positioned(
      right: 20,
      top: 80,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(AppDimensions.borderRadiusL),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            width: AppDimensions.stylePanelWidth,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.bgSecondary.withValues(alpha: 0.9),
              borderRadius: BorderRadius.circular(AppDimensions.borderRadiusL),
              border: Border.all(color: AppColors.textTertiary.withValues(alpha: 0.2), width: 1),
            ),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Row(
                    children: [
                      const Icon(Icons.style, color: AppColors.accentOrange, size: 18),
                      const SizedBox(width: AppDimensions.borderRadiusS),
                      Text(
                        'QUESTION STYLE',
                        style: AppTextStyles.caption.copyWith(
                          color: AppColors.textTertiary,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.2,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppDimensions.borderRadiusL),

                  // 1. Question Text Color
                  _StyleSection(
                    title: 'Question Text Color',
                    child: _ColorPickerRow(
                      selectedColor: Color(style.questionTextColorARGB),
                      onColorChanged: (color) {
                        notifier.updateStyle(
                          selectedWidgetId,
                          style.copyWith(questionTextColorARGB: color.toARGB32()),
                        );
                      },
                    ),
                  ),

                  // 2. Question Background Color
                  _StyleSection(
                    title: 'Question Background',
                    child: _ColorPickerRow(
                      selectedColor: Color(style.questionBgColorARGB),
                      onColorChanged: (color) {
                        notifier.updateStyle(
                          selectedWidgetId,
                          style.copyWith(questionBgColorARGB: color.toARGB32()),
                        );
                      },
                    ),
                  ),

                  // 3. Option Text Color
                  _StyleSection(
                    title: 'Option Text Color',
                    child: _ColorPickerRow(
                      selectedColor: Color(style.optionTextColorARGB),
                      onColorChanged: (color) {
                        notifier.updateStyle(
                          selectedWidgetId,
                          style.copyWith(optionTextColorARGB: color.toARGB32()),
                        );
                      },
                    ),
                  ),

                  // 4. Option Background Color
                  _StyleSection(
                    title: 'Option Background',
                    child: _ColorPickerRow(
                      selectedColor: Color(style.optionBgColorARGB),
                      onColorChanged: (color) {
                        notifier.updateStyle(
                          selectedWidgetId,
                          style.copyWith(optionBgColorARGB: color.toARGB32()),
                        );
                      },
                    ),
                  ),

                  // 5. Font Sizes
                  _StyleSection(
                    title: 'Font Sizes',
                    child: Column(
                      children: [
                        _SliderRow(
                          label: 'Question',
                          value: style.questionFontSize,
                          min: 12,
                          max: 48,
                          onChanged: (v) => notifier.updateStyle(
                            selectedWidgetId,
                            style.copyWith(questionFontSize: v),
                          ),
                        ),
                        const SizedBox(height: AppDimensions.borderRadiusS),
                        _SliderRow(
                          label: 'Options',
                          value: style.optionFontSize,
                          min: 10,
                          max: 36,
                          onChanged: (v) => notifier.updateStyle(
                            selectedWidgetId,
                            style.copyWith(optionFontSize: v),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // 6. Border
                  _StyleSection(
                    title: 'Border',
                    child: Column(
                      children: [
                        _SliderRow(
                          label: 'Width',
                          value: style.borderWidth,
                          min: 0,
                          max: 8,
                          onChanged: (v) => notifier.updateStyle(
                            selectedWidgetId,
                            style.copyWith(borderWidth: v),
                          ),
                        ),
                        const SizedBox(height: AppDimensions.borderRadiusS),
                        _ColorPickerRow(
                          selectedColor: Color(style.borderColorARGB),
                          onColorChanged: (color) {
                            notifier.updateStyle(
                              selectedWidgetId,
                              style.copyWith(borderColorARGB: color.toARGB32()),
                            );
                          },
                        ),
                        const SizedBox(height: AppDimensions.borderRadiusS),
                        _SliderRow(
                          label: 'Radius',
                          value: style.borderRadius,
                          min: 0,
                          max: 24,
                          onChanged: (v) => notifier.updateStyle(
                            selectedWidgetId,
                            style.copyWith(borderRadius: v),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // 7. Shadow Toggle
                  _StyleSection(
                    title: 'Shadow',
                    child: SwitchListTile(
                      value: style.hasShadow,
                      onChanged: (v) => notifier.updateStyle(
                        selectedWidgetId,
                        style.copyWith(hasShadow: v),
                      ),
                      activeThumbColor: AppColors.accentOrange,
                      contentPadding: EdgeInsets.zero,
                      dense: true,
                      title: Text(
                        style.hasShadow ? 'Enabled' : 'Disabled',
                        style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary),
                      ),
                    ),
                  ),

                  // 8. Background Image
                  _StyleSection(
                    title: 'Background Image',
                    child: Column(
                      children: [
                        ElevatedButton.icon(
                          onPressed: () => _pickBackgroundImage(context, notifier, selectedWidgetId, style),
                          icon: const Icon(Icons.image, size: 18),
                          label: const Text('Choose Image'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.accentOrange,
                            foregroundColor: AppColors.bgPrimary,
                            padding: const EdgeInsets.symmetric(
                              horizontal: AppDimensions.borderRadiusL,
                              vertical: AppDimensions.borderRadiusS,
                            ),
                          ),
                        ),
                        if (style.bgImageOpacity > 0) ...[
                          const SizedBox(height: AppDimensions.borderRadiusS),
                          _SliderRow(
                            label: 'Opacity',
                            value: style.bgImageOpacity,
                            min: 0.0,
                            max: 1.0,
                            onChanged: (v) => notifier.updateStyle(
                              selectedWidgetId,
                              style.copyWith(bgImageOpacity: v),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),

                  // 9. Z-Index Controls
                  _StyleSection(
                    title: 'Layer Order',
                    child: Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () => notifier.bringToFront(selectedWidgetId),
                            icon: const Icon(Icons.arrow_upward, size: 16),
                            label: const Text('Bring Front'),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppColors.textPrimary,
                              padding: const EdgeInsets.symmetric(vertical: AppDimensions.borderRadiusS),
                            ),
                          ),
                        ),
                        const SizedBox(width: AppDimensions.borderRadiusS),
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () => notifier.sendToBack(selectedWidgetId),
                            icon: const Icon(Icons.arrow_downward, size: 16),
                            label: const Text('Send Back'),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: AppColors.textPrimary,
                              padding: const EdgeInsets.symmetric(vertical: AppDimensions.borderRadiusS),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _pickBackgroundImage(
    BuildContext context,
    QuestionWidgetNotifier notifier,
    String widgetId,
    QuestionWidgetStyle style,
  ) async {
    final result = await FilePicker.platform.pickFiles(type: FileType.image);
    if (result != null && result.files.single.path != null) {
      notifier.updateStyle(
        widgetId,
        style.copyWith(
          bgImagePath: result.files.single.path!,
          bgImageOpacity: 0.5,
        ),
      );
    }
  }
}

// ── Style Section ────────────────────────────────────────────────────────────

class _StyleSection extends StatelessWidget {
  final String title;
  final Widget child;

  const _StyleSection({required this.title, required this.child});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppDimensions.borderRadiusL),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: AppTextStyles.caption.copyWith(
              color: AppColors.textTertiary,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: AppDimensions.borderRadiusS),
          child,
        ],
      ),
    );
  }
}

// ── Color Picker Row ─────────────────────────────────────────────────────────

class _ColorPickerRow extends StatelessWidget {
  final Color selectedColor;
  final ValueChanged<Color> onColorChanged;

  const _ColorPickerRow({required this.selectedColor, required this.onColorChanged});

  static const _colors = [
    Colors.white,
    Colors.yellow,
    Colors.orange,
    Colors.red,
    Colors.pink,
    Colors.purple,
    Colors.blue,
    Colors.cyan,
    Colors.green,
    Colors.black,
    Colors.grey,
    Colors.brown,
  ];

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 6,
      runSpacing: 6,
      children: _colors.map((color) {
        final isSelected = selectedColor.toARGB32() == color.toARGB32();
        return GestureDetector(
          onTap: () => onColorChanged(color),
          child: Container(
            width: 28,
            height: 28,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
              border: Border.all(
                color: isSelected ? AppColors.accentOrange : Colors.white24,
                width: isSelected ? 3 : 1,
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}

// ── Slider Row ───────────────────────────────────────────────────────────────

class _SliderRow extends StatelessWidget {
  final String label;
  final double value;
  final double min;
  final double max;
  final ValueChanged<double> onChanged;

  const _SliderRow({
    required this.label,
    required this.value,
    required this.min,
    required this.max,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary)),
            Text(
              value.toInt().toString(),
              style: AppTextStyles.caption.copyWith(color: AppColors.textTertiary),
            ),
          ],
        ),
        SliderTheme(
          data: const SliderThemeData(
            trackHeight: 4,
            thumbShape: RoundSliderThumbShape(enabledThumbRadius: 6),
            overlayShape: RoundSliderOverlayShape(overlayRadius: 12),
            activeTrackColor: AppColors.accentOrange,
            inactiveTrackColor: Colors.white24,
            thumbColor: AppColors.accentOrange,
          ),
          child: Slider(
            value: value,
            min: min,
            max: max,
            onChanged: onChanged,
          ),
        ),
      ],
    );
  }
}
