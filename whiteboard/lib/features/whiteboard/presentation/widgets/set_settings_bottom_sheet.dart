import 'package:flutter/material.dart';
import 'package:flutter_colorpicker/flutter_colorpicker.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:file_picker/file_picker.dart';
import 'package:dio/dio.dart';
import '../../../../core/network/dio_client.dart';
import '../../../question_widget/presentation/providers/set_layout_notifier.dart';
import '../../../question_widget/data/models/set_layout_models.dart';

class SetSettingsBottomSheet extends ConsumerWidget {
  final int currentQuestionNumber;

  const SetSettingsBottomSheet({super.key, required this.currentQuestionNumber});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(setLayoutNotifierProvider);
    final settings = state.settings;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        color: Color(0xFF1A1A1A),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Set Styles & Settings',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close, color: Colors.white54),
                ),
              ],
            ),
            const Divider(color: Colors.white12, height: 32),

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
                  onChanged: (c) => _update(ref, settings.copyWith(questionColor: c.toARGB32())),
                ),
                _ColorPickerTile(
                  label: 'Q Bg',
                  color: Color(settings.questionBg),
                  onChanged: (c) => _update(ref, settings.copyWith(questionBg: c.toARGB32())),
                ),
                _ColorPickerTile(
                  label: 'Opt Text',
                  color: Color(settings.optionColor),
                  onChanged: (c) => _update(ref, settings.copyWith(optionColor: c.toARGB32())),
                ),
                _ColorPickerTile(
                  label: 'Opt Bg',
                  color: Color(settings.optionBg),
                  onChanged: (c) => _update(ref, settings.copyWith(optionBg: c.toARGB32())),
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
              onChanged: (v) => _update(ref, settings.copyWith(questionFontSize: v)),
            ),
            _SliderTile(
              label: 'Options',
              value: settings.optionFontSize,
              min: 12,
              max: 60,
              onChanged: (v) => _update(ref, settings.copyWith(optionFontSize: v)),
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
                  onChanged: (c) => _update(ref, settings.copyWith(questionBorderColor: c.toARGB32())),
                ),
                _ColorPickerTile(
                  label: 'Opt Border',
                  color: Color(settings.optionBorderColor),
                  onChanged: (c) => _update(ref, settings.copyWith(optionBorderColor: c.toARGB32())),
                ),
              ],
            ),
            _SliderTile(
              label: 'Question Border Width',
              value: settings.questionBorderWidth,
              min: 0,
              max: 20,
              onChanged: (v) => _update(ref, settings.copyWith(questionBorderWidth: v)),
            ),
            _SliderTile(
              label: 'Option Border Width',
              value: settings.optionBorderWidth,
              min: 0,
              max: 20,
              onChanged: (v) => _update(ref, settings.copyWith(optionBorderWidth: v)),
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
                            _update(ref, settings.copyWith(clearBackground: true));
                          } else {
                            _update(ref, settings.copyWith(backgroundPreset: v));
                          }
                        },
                      ),
                      const SizedBox(height: 12),
                      SizedBox(
                        width: double.infinity,
                        child: OutlinedButton.icon(
                          onPressed: () async {
                            final result = await FilePicker.platform.pickFiles(type: FileType.image);
                            if (result == null || result.files.isEmpty) return;
                            
                            ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Uploading background...')));
                            try {
                              final dio = ref.read(dioProvider);
                              final file = result.files.first;
                              final formData = FormData.fromMap({
                                'file': MultipartFile.fromBytes(file.bytes!, filename: file.name),
                              });
                              
                              final response = await dio.post('/upload/image', data: formData);
                              
                              if (response.data['success'] == true) {
                                final url = response.data['data']['url'];
                                _update(ref, settings.copyWith(backgroundPreset: url));
                                ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Background uploaded!')));
                              }
                            } catch (e) {
                              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Failed to upload: $e')));
                            }
                          },
                          icon: const Icon(Icons.upload_file),
                          label: const Text('Upload Custom Image'),
                          style: OutlinedButton.styleFrom(
                            foregroundColor: Colors.orange,
                            side: const BorderSide(color: Colors.orange),
                            padding: const EdgeInsets.symmetric(vertical: 16),
                          ),
                        ),
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
              onChanged: (v) => _update(ref, settings.copyWith(showOptions: v)),
              activeColor: Colors.orange,
            ),
            SwitchListTile(
              title: const Text('Show Source Badge', style: TextStyle(color: Colors.white70)),
              value: settings.showSourceBadge,
              onChanged: (v) => _update(ref, settings.copyWith(showSourceBadge: v)),
              activeColor: Colors.orange,
            ),
            SwitchListTile(
              title: const Text('Show Card Background', style: TextStyle(color: Colors.white70)),
              value: settings.showCardBackground,
              onChanged: (v) => _update(ref, settings.copyWith(showCardBackground: v)),
              activeColor: Colors.orange,
            ),

            const SizedBox(height: 32),

            // Actions Section
            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      ref.read(setLayoutNotifierProvider.notifier).resetLayout(currentQuestionNumber);
                      Navigator.pop(context);
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
                    onPressed: () {
                      ref.read(setLayoutNotifierProvider.notifier).applySettingsToAll();
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Applied to all pages.')));
                    },
                    icon: const Icon(Icons.done_all),
                    label: const Text('Apply to All'),
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

  void _update(WidgetRef ref, SetSettingsModel settings) {
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
