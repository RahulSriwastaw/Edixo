import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:file_picker/file_picker.dart';
import '../../../../../core/theme/app_theme_colors.dart';
import '../../../../../core/theme/app_theme_text_styles.dart';
import '../../../../../core/theme/app_theme_dimensions.dart';
import '../../../../question_widget/presentation/providers/selected_widget_provider.dart';
import '../../../../question_widget/presentation/providers/question_widget_provider.dart';
import '../../../../question_widget/data/models/question_widget_style.dart';

class FloatingStylePanel extends ConsumerWidget {
  const FloatingStylePanel({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedWidgetId = ref.watch(selectedWidgetNotifierProvider);
    final questionWidgets = ref.watch(questionWidgetNotifierProvider);
    final theme = AppThemeColors.of(context);
    
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
      right: 16,
      top: 64,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(AppThemeDimensions.borderRadiusCard),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            width: AppThemeDimensions.stylePanelWidth,
            padding: const EdgeInsets.all(AppThemeDimensions.paddingL),
            decoration: BoxDecoration(
              color: theme.bgSidebar.withValues(alpha: 0.95),
              borderRadius: BorderRadius.circular(AppThemeDimensions.borderRadiusCard),
              border: Border.all(color: theme.borderCard, width: 1),
            ),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Row(
                    children: [
                      Icon(Icons.style, color: AppThemeColors.primaryAccent, size: 16),
                      const SizedBox(width: AppThemeDimensions.gapXS),
                      Text(
                        'QUESTION STYLE',
                        style: AppThemeTextStyles.sectionHeader(context),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppThemeDimensions.gapL),

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
                        const SizedBox(height: AppThemeDimensions.gapS),
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
                        const SizedBox(height: AppThemeDimensions.gapS),
                        _ColorPickerRow(
                          selectedColor: Color(style.borderColorARGB),
                          onColorChanged: (color) {
                            notifier.updateStyle(
                              selectedWidgetId,
                              style.copyWith(borderColorARGB: color.toARGB32()),
                            );
                          },
                        ),
                        const SizedBox(height: AppThemeDimensions.gapS),
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
                      activeTrackColor: AppThemeColors.primaryAccent,
                      contentPadding: EdgeInsets.zero,
                      dense: true,
                      title: Text(
                        style.hasShadow ? 'Enabled' : 'Disabled',
                        style: AppThemeTextStyles.caption(context).copyWith(color: theme.textSecondary),
                      ),
                    ),
                  ),

                  // 7.5. Card Background toggle
                  _StyleSection(
                    title: 'Card Background',
                    child: SwitchListTile(
                      value: style.showCardBackground,
                      onChanged: (v) => notifier.updateStyle(
                        selectedWidgetId,
                        style.copyWith(showCardBackground: v),
                      ),
                      activeTrackColor: AppThemeColors.primaryAccent,
                      contentPadding: EdgeInsets.zero,
                      dense: true,
                      title: Text(
                        style.showCardBackground ? 'Show' : 'Hide',
                        style: AppThemeTextStyles.caption(context).copyWith(color: theme.textSecondary),
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
                          icon: const Icon(Icons.image, size: 16),
                          label: const Text('Choose Image'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppThemeColors.primaryAccent,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(
                              horizontal: AppThemeDimensions.paddingM,
                              vertical: AppThemeDimensions.paddingS,
                            ),
                            elevation: 0,
                            minimumSize: const Size(0, 32),
                          ),
                        ),
                        if (style.bgImageOpacity > 0) ...[
                          const SizedBox(height: AppThemeDimensions.gapS),
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
                            icon: const Icon(Icons.arrow_upward, size: 14),
                            label: const Text('Bring Front'),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: theme.textPrimary,
                              side: BorderSide(color: theme.btnSecondaryBorder),
                              padding: const EdgeInsets.symmetric(vertical: AppThemeDimensions.paddingS),
                              minimumSize: const Size(0, 32),
                            ),
                          ),
                        ),
                        const SizedBox(width: AppThemeDimensions.gapS),
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () => notifier.sendToBack(selectedWidgetId),
                            icon: const Icon(Icons.arrow_downward, size: 14),
                            label: const Text('Send Back'),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: theme.textPrimary,
                              side: BorderSide(color: theme.btnSecondaryBorder),
                              padding: const EdgeInsets.symmetric(vertical: AppThemeDimensions.paddingS),
                              minimumSize: const Size(0, 32),
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
    final theme = AppThemeColors.of(context);
    
    return Padding(
      padding: const EdgeInsets.only(bottom: AppThemeDimensions.paddingM),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: AppThemeTextStyles.caption(context).copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: AppThemeDimensions.gapXS),
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
    final theme = AppThemeColors.of(context);

    return Wrap(
      spacing: 6,
      runSpacing: 6,
      children: _colors.map((color) {
        final isSelected = selectedColor.toARGB32() == color.toARGB32();
        return GestureDetector(
          onTap: () => onColorChanged(color),
          child: Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
              border: Border.all(
                color: isSelected ? AppThemeColors.primaryAccent : theme.borderCard,
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
    final theme = AppThemeColors.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: AppThemeTextStyles.caption(context).copyWith(color: theme.textSecondary)),
            Text(
              value.toInt().toString(),
              style: AppThemeTextStyles.caption(context),
            ),
          ],
        ),
        SliderTheme(
          data: SliderThemeData(
            trackHeight: 3,
            thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
            overlayShape: const RoundSliderOverlayShape(overlayRadius: 10),
            activeTrackColor: AppThemeColors.primaryAccent,
            inactiveTrackColor: theme.divider,
            thumbColor: AppThemeColors.primaryAccent,
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
