import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../data/models/question_widget_style.dart';
import '../providers/question_widget_provider.dart';

class QuestionSettingsPanel extends ConsumerStatefulWidget {
  final String widgetId;

  const QuestionSettingsPanel({required this.widgetId, super.key});

  @override
  ConsumerState<QuestionSettingsPanel> createState() => _QuestionSettingsPanelState();
}

class _QuestionSettingsPanelState extends ConsumerState<QuestionSettingsPanel> {
  late QuestionWidgetStyle _style;
  late TextEditingController _fontSizeController;
  late TextEditingController _paddingController;
  late TextEditingController _borderRadiusController;

  @override
  void initState() {
    super.initState();
    final widgetModel = ref.read(questionWidgetNotifierProvider)[widget.widgetId];
    _style = widgetModel?.style ?? QuestionWidgetStyle.defaults;
    
    _fontSizeController = TextEditingController(text: _style.questionFontSize.toString());
    _paddingController = TextEditingController(text: _style.padding.toString());
    _borderRadiusController = TextEditingController(text: _style.borderRadius.toString());
  }

  @override
  void dispose() {
    _fontSizeController.dispose();
    _paddingController.dispose();
    _borderRadiusController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final widgetModel = ref.watch(questionWidgetNotifierProvider)[widget.widgetId];
    if (widgetModel == null) {
      return const SizedBox.shrink();
    }

    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Text Settings Section
                    _buildSectionHeader('Text Style'),
                    _buildTextFieldWithLabel(
                      'Font Size',
                      _fontSizeController,
                      keyboardType: TextInputType.number,
                      onChanged: (value) {
                        final int? size = int.tryParse(value);
                        if (size != null && size >= 10 && size <= 48) {
                          _style = _style.copyWith(
                            questionFontSize: size.toDouble(),
                          );
                          _applyStyle();
                        }
                      },
                    ),


                    const SizedBox(height: 24),

                    // Colors Section
                    _buildSectionHeader('Colors'),
                    _buildColorPicker(
                      'Background Color',
                      Color(_style.questionBgColorARGB),
                      (color) {
                        _style = _style.copyWith(
                          questionBgColorARGB: color.value,
                        );
                        _applyStyle();
                      },
                    ),
                    _buildColorPicker(
                      'Text Color',
                      Color(_style.questionTextColorARGB),
                      (color) {
                        _style = _style.copyWith(
                          questionTextColorARGB: color.value,
                        );
                        _applyStyle();
                      },
                    ),
                    _buildColorPicker(
                      'Option Color',
                      Color(_style.optionTextColorARGB),
                      (color) {
                        _style = _style.copyWith(
                          optionTextColorARGB: color.value,
                        );
                        _applyStyle();
                      },
                    ),
                    _buildColorPicker(
                      'Border Color',
                      Color(_style.borderColorARGB),
                      (color) {
                        _style = _style.copyWith(
                          borderColorARGB: color.value,
                        );
                        _applyStyle();
                      },
                    ),

                    const SizedBox(height: 24),

                    // Layout Section
                    _buildSectionHeader('Layout'),
                    _buildTextFieldWithLabel(
                      'Padding',
                      _paddingController,
                      keyboardType: TextInputType.number,
                      onChanged: (value) {
                        final int? padding = int.tryParse(value);
                        if (padding != null && padding >= 0 && padding <= 50) {
                          _style = _style.copyWith(padding: padding.toDouble());
                          _applyStyle();
                        }
                      },
                    ),
                    _buildTextFieldWithLabel(
                      'Border Radius',
                      _borderRadiusController,
                      keyboardType: TextInputType.number,
                      onChanged: (value) {
                        final int? radius = int.tryParse(value);
                        if (radius != null && radius >= 0 && radius <= 30) {
                          _style = _style.copyWith(borderRadius: radius.toDouble());
                          _applyStyle();
                        }
                      },
                    ),
                    _buildSwitchWithLabel(
                      'Show Shadow',
                      _style.hasShadow,
                      (value) {
                        _style = _style.copyWith(hasShadow: value);
                        _applyStyle();
                      },
                    ),
                    _buildSwitchWithLabel(
                      'Show Card Background',
                      _style.showCardBackground,
                      (value) {
                        _style = _style.copyWith(showCardBackground: value);
                        _applyStyle();
                      },
                    ),

        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Text(
        title,
        style: AppTextStyles.body.copyWith(
          fontWeight: FontWeight.w600,
          color: AppColors.textPrimary,
        ),
      ),
    );
  }

  Widget _buildTextFieldWithLabel(
    String label,
    TextEditingController controller, {
    TextInputType keyboardType = TextInputType.text,
    required ValueChanged<String> onChanged,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: AppTextStyles.caption.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: controller,
            keyboardType: keyboardType,
            decoration: InputDecoration(
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
              ),
              filled: true,
              fillColor: AppColors.bgCard.withValues(alpha: 0.7),
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 12,
                vertical: 12,
              ),
            ),
            onChanged: onChanged,
          ),
        ],
      ),
    );
  }

  Widget _buildSwitchWithLabel(String label, bool value, ValueChanged<bool> onChanged) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          Expanded(
            child: Text(
              label,
              style: AppTextStyles.body.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ),
          Transform.scale(
            scale: 1.2,
            child: Switch(
              value: value,
              onChanged: onChanged,
              activeColor: AppColors.accentOrange,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSliderWithLabel(
    String label,
    double value,
    double min,
    double max,
    double divisions,
    ValueChanged<double> onChanged,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: AppTextStyles.caption.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Expanded(
                child: Slider(
                  value: value,
                  min: min,
                  max: max,
                  divisions: (max - min) ~/ divisions,
                  label: value.toStringAsFixed(1),
                  onChanged: onChanged,
                  activeColor: AppColors.accentOrange,
                  inactiveColor: AppColors.textTertiary.withValues(alpha: 0.3),
                ),
              ),
              const SizedBox(width: 12),
              Text(
                value.toStringAsFixed(1),
                style: AppTextStyles.caption.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildColorPicker(
    String label,
    Color color,
    ValueChanged<Color> onChanged,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: AppTextStyles.caption.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 6),
          Container(
            height: 48,
            decoration: BoxDecoration(
              border: Border.all(
                color: AppColors.textTertiary.withValues(alpha: 0.3),
              ),
              borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
            ),
            child: Row(
              children: [
                // Color preview
                Container(
                  width: 24,
                  height: 24,
                  margin: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: color,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                Expanded(
                  child: GestureDetector(
                    onTap: () => _showColorPickerDialog(color, onChanged),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: Text(
                        'Tap to change color',
                        style: AppTextStyles.caption.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _showColorPickerDialog(Color initialColor, ValueChanged<Color> onChanged) async {
    // Simple color picker - in a real app you'd use a proper color picker package
    await showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: AppColors.bgCard,
        title: Text('Pick a Color', style: AppTextStyles.body),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Preset colors
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: [
                  Colors.red,
                  Colors.orange,
                  Colors.yellow,
                  Colors.green,
                  Colors.blue,
                  Colors.purple,
                  Colors.pink,
                  Colors.brown,
                  Colors.grey,
                  Colors.black,
                  Colors.white,
                ].map((color) => GestureDetector(
                  onTap: () {
                    Navigator.of(context).pop();
                    onChanged(color);
                  },
                  child: Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: color,
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.3),
                        width: 2,
                      ),
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                )).toList(),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
        ],
      ),
    );
  }

  void _applyStyle() {
    ref.read(questionWidgetNotifierProvider.notifier).updateStyle(widget.widgetId, _style);
  }
}
