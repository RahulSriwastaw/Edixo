import 'package:flutter/material.dart';
import 'package:flutter_colorpicker/flutter_colorpicker.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:file_picker/file_picker.dart';
import 'package:dio/dio.dart';
import '../../../../core/network/dio_client.dart';
import '../../../question_widget/presentation/providers/set_layout_notifier.dart';
import '../../../question_widget/data/models/set_layout_models.dart';
import '../providers/floating_overlay_provider.dart';

class SetSettingsPanel extends ConsumerStatefulWidget {
  final int currentQuestionNumber;

  const SetSettingsPanel({super.key, required this.currentQuestionNumber});

  @override
  ConsumerState<SetSettingsPanel> createState() => _SetSettingsPanelState();
}

class _SetSettingsPanelState extends ConsumerState<SetSettingsPanel> {
  bool _isApplying = false;

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(setLayoutNotifierProvider);
    final settings = state.settings;

    return Container(
      padding: const EdgeInsets.all(24),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Colors Section
            const _SectionHeader(title: 'Colors'),
            const SizedBox(height: 16),
            Wrap(
              spacing: 16,
              runSpacing: 16,
              children: [
                _ColorPickerTile(
                  label: 'Q Text',
                  color: Color(settings.questionColor),
                  onChanged: (c) => _update(settings.copyWith(questionColor: c.toARGB32())),
                ),
                _ColorPickerTile(
                  label: 'Q Bg',
                  color: Color(settings.questionBg),
                  onChanged: (c) => _update(settings.copyWith(questionBg: c.toARGB32())),
                ),
                _ColorPickerTile(
                  label: 'Opt Text',
                  color: Color(settings.optionColor),
                  onChanged: (c) => _update(settings.copyWith(optionColor: c.toARGB32())),
                ),
                _ColorPickerTile(
                  label: 'Opt Bg',
                  color: Color(settings.optionBg),
                  onChanged: (c) => _update(settings.copyWith(optionBg: c.toARGB32())),
                ),
              ],
            ),

            const SizedBox(height: 32),

            // Font Sizes Section
            const _SectionHeader(title: 'Font Sizes'),
            _SliderTile(
              label: 'Question',
              value: settings.questionFontSize,
              min: 12,
              max: 80,
              onChanged: (v) => _update(settings.copyWith(questionFontSize: v)),
            ),
            _SliderTile(
              label: 'Options',
              value: settings.optionFontSize,
              min: 12,
              max: 60,
              onChanged: (v) => _update(settings.copyWith(optionFontSize: v)),
            ),

            const SizedBox(height: 32),

            // Borders Section
            const _SectionHeader(title: 'Borders'),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _ColorPickerTile(
                  label: 'Q Border',
                  color: Color(settings.questionBorderColor),
                  onChanged: (c) => _update(settings.copyWith(questionBorderColor: c.toARGB32())),
                ),
                _ColorPickerTile(
                  label: 'Opt Border',
                  color: Color(settings.optionBorderColor),
                  onChanged: (c) => _update(settings.copyWith(optionBorderColor: c.toARGB32())),
                ),
              ],
            ),
            _SliderTile(
              label: 'Question Border Width',
              value: settings.questionBorderWidth,
              min: 0,
              max: 20,
              onChanged: (v) => _update(settings.copyWith(questionBorderWidth: v)),
            ),
            _SliderTile(
              label: 'Option Border Width',
              value: settings.optionBorderWidth,
              min: 0,
              max: 20,
              onChanged: (v) => _update(settings.copyWith(optionBorderWidth: v)),
            ),

            const SizedBox(height: 32),

            // Background Section
            const _SectionHeader(title: 'Project Background'),
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8.0),
              child: Builder(
                builder: (context) {
                  final knownPresets = ['chalkboard', 'blueprint', 'notebook', 'gradient_blue'];
                  final isCustom = settings.backgroundPreset != null && !knownPresets.contains(settings.backgroundPreset);
                  
                  return Column(
                    children: [
                      DropdownButtonFormField<String?>(
                        dropdownColor: const Color(0xFF262626),
                        value: isCustom ? 'custom' : settings.backgroundPreset,
                        decoration: InputDecoration(
                          filled: true,
                          fillColor: Colors.white10,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                        ),
                        items: [
                          const DropdownMenuItem(value: null, child: Text('Default Dark', style: TextStyle(color: Colors.white))),
                          const DropdownMenuItem(value: 'chalkboard', child: Text('Chalkboard', style: TextStyle(color: Colors.white))),
                          const DropdownMenuItem(value: 'blueprint', child: Text('Blueprint', style: TextStyle(color: Colors.white))),
                          const DropdownMenuItem(value: 'notebook', child: Text('Notebook Canvas', style: TextStyle(color: Colors.white))),
                          const DropdownMenuItem(value: 'gradient_blue', child: Text('PPT Gradient Blue', style: TextStyle(color: Colors.white))),
                          if (isCustom)
                            const DropdownMenuItem(value: 'custom', child: Text('Custom Image', style: TextStyle(color: Colors.orange))),
                        ],
                        onChanged: (v) {
                          if (v == 'custom') return; // Do nothing if they click the placeholder
                          
                          if (v == null) {
                            _update(settings.copyWith(clearBackground: true));
                          } else {
                            _update(settings.copyWith(backgroundPreset: v));
                          }
                        },
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        initialValue: isCustom ? settings.backgroundPreset : '',
                        style: const TextStyle(color: Colors.white),
                        decoration: InputDecoration(
                          hintText: 'Or paste Custom Image URL here (Press Enter)',
                          hintStyle: const TextStyle(color: Colors.white54),
                          filled: true,
                          fillColor: Colors.white10,
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
                          prefixIcon: const Icon(Icons.link, color: Colors.white54),
                        ),
                        onFieldSubmitted: (val) {
                          if (val.isNotEmpty) {
                            _update(settings.copyWith(backgroundPreset: val));
                          }
                        },
                      ),
                    ],
                  );
                }
              ),
            ),

            const SizedBox(height: 32),

            // Toggles Section
            const _SectionHeader(title: 'Display Toggles'),
            SwitchListTile(
              title: const Text('Show Options', style: TextStyle(color: Colors.white70)),
              value: settings.showOptions,
              onChanged: (v) => _update(settings.copyWith(showOptions: v)),
              activeColor: Colors.orange,
            ),
            SwitchListTile(
              title: const Text('Show Source Badge', style: TextStyle(color: Colors.white70)),
              value: settings.showSourceBadge,
              onChanged: (v) => _update(settings.copyWith(showSourceBadge: v)),
              activeColor: Colors.orange,
            ),
            SwitchListTile(
              title: const Text('Show Card Background', style: TextStyle(color: Colors.white70)),
              value: settings.showCardBackground,
              onChanged: (v) => _update(settings.copyWith(showCardBackground: v)),
              activeColor: Colors.orange,
            ),

            const SizedBox(height: 32),

            // Actions Section
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _isApplying ? null : () {
                      ref.read(setLayoutNotifierProvider.notifier).resetLayout(widget.currentQuestionNumber);
                      ref.read(floatingOverlayNotifierProvider.notifier).hidePanel('setSettings');
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Layout reset.')));
                    },
                    icon: const Icon(Icons.refresh),
                    label: const Text('Reset Layout'),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.orange,
                      side: const BorderSide(color: Colors.orange),
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: _isApplying ? null : () async {
                      setState(() => _isApplying = true);
                      try {
                        await ref.read(setLayoutNotifierProvider.notifier).applyLayoutToAll(widget.currentQuestionNumber);
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Layout & Settings applied to all pages.')));
                          ref.read(floatingOverlayNotifierProvider.notifier).hidePanel('setSettings');
                        }
                      } finally {
                        if (mounted) setState(() => _isApplying = false);
                      }
                    },
                    icon: _isApplying 
                      ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                      : const Icon(Icons.done_all),
                    label: Text(_isApplying ? 'Applying...' : 'Apply to All'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.orange,
                      foregroundColor: Colors.black,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }

  void _update(SetSettingsModel settings) {
    ref.read(setLayoutNotifierProvider.notifier).updateSettings(settings);
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Text(
      title.toUpperCase(),
      style: const TextStyle(
        fontSize: 12,
        letterSpacing: 1.2,
        fontWeight: FontWeight.bold,
        color: Colors.white38,
      ),
    );
  }
}

class _ColorPickerTile extends StatelessWidget {
  final String label;
  final Color color;
  final ValueChanged<Color> onChanged;

  const _ColorPickerTile({required this.label, required this.color, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        GestureDetector(
          onTap: () {
            showDialog(
              context: context,
              builder: (ctx) => AlertDialog(
                title: Text('Pick $label'),
                content: SingleChildScrollView(
                  child: ColorPicker(
                    pickerColor: color,
                    onColorChanged: onChanged,
                  ),
                ),
                actions: [
                  TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('DONE')),
                ],
              ),
            );
          },
          child: Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white24),
              boxShadow: [
                BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 4, offset: const Offset(0, 2)),
              ],
            ),
          ),
        ),
        const SizedBox(height: 8),
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 10)),
      ],
    );
  }
}

class _SliderTile extends StatelessWidget {
  final String label;
  final double value;
  final double min;
  final double max;
  final ValueChanged<double> onChanged;

  const _SliderTile({required this.label, required this.value, required this.min, required this.max, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: const TextStyle(color: Colors.white70)),
              Text(value.toInt().toString(), style: const TextStyle(color: Colors.orange, fontWeight: FontWeight.bold)),
            ],
          ),
          Slider(
            value: value,
            min: min,
            max: max,
            divisions: (max - min).toInt(),
            onChanged: onChanged,
            activeColor: Colors.orange,
            inactiveColor: Colors.white12,
          ),
        ],
      ),
    );
  }
}
