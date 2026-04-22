// lib/features/whiteboard/presentation/dialogs/pen_picker_dialog.dart
// Professional Pen Picker Dialog (Like Note3)

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../widgets/tools/pen_tool.dart';
import '../providers/tool_provider.dart';

class PenPickerDialog extends ConsumerStatefulWidget {
  const PenPickerDialog({super.key});

  @override
  ConsumerState<PenPickerDialog> createState() => _PenPickerDialogState();
}

class _PenPickerDialogState extends ConsumerState<PenPickerDialog> {
  late PenType _selectedType;
  late Color _selectedColor;
  late double _selectedWidth;
  late double _selectedOpacity;

  @override
  void initState() {
    super.initState();
    final penSettings = ref.read(penSettingsProvider);
    _selectedType = penSettings.type;
    _selectedColor = penSettings.color;
    _selectedWidth = penSettings.strokeWidth;
    _selectedOpacity = penSettings.opacity;
  }

  @override
  Widget build(BuildContext context) {
    final penSettings = ref.watch(penSettingsProvider);

    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.all(24),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 380),
        decoration: BoxDecoration(
          color: const Color(0xFF1A1A1A),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: Colors.white.withValues(alpha: 0.1),
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.5),
              blurRadius: 20,
              spreadRadius: 5,
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // ── Header with Pen Icon ────────────────────────────────
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Colors.orange.withValues(alpha: 0.2),
                    Colors.orange.withValues(alpha: 0.05),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      Icon(
                        _selectedType.icon,
                        color: Colors.orange,
                        size: 28,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _selectedType.displayName,
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 18,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 0.5,
                              ),
                            ),
                            Text(
                              'Pen Settings',
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.5),
                                fontSize: 11,
                                letterSpacing: 1,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  // ── Pen Type Selection Grid ─────────────────────
                  Text(
                    'Pen Types',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.7),
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1,
                    ),
                  ),
                  const SizedBox(height: 12),
                  GridView.builder(
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 4,
                      mainAxisSpacing: 8,
                      crossAxisSpacing: 8,
                      childAspectRatio: 1,
                    ),
                    itemCount: PenType.values.length,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemBuilder: (context, index) {
                      final pen = PenType.values[index];
                      final isSelected = pen == _selectedType;
                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            _selectedType = pen;
                          });
                        },
                        child: Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isSelected
                                  ? Colors.orange
                                  : Colors.white.withValues(alpha: 0.2),
                              width: isSelected ? 2 : 1,
                            ),
                            color: isSelected
                                ? Colors.orange.withValues(alpha: 0.15)
                                : Colors.white.withValues(alpha: 0.03),
                          ),
                          child: Center(
                            child: Icon(
                              pen.icon,
                              color: isSelected ? Colors.orange : Colors.white70,
                              size: 22,
                            ),
                          ),
                        ),
                      );
                    },
                  ),

                  const SizedBox(height: 20),

                  // ── Stroke Width Slider ─────────────────────────
                  _buildSettingSection(
                    label: 'Width',
                    value: _selectedWidth,
                    min: 1.0,
                    max: 40.0,
                    onChanged: (val) => setState(() => _selectedWidth = val),
                    child: Slider(
                      value: _selectedWidth,
                      min: 1.0,
                      max: 40.0,
                      onChanged: (val) => setState(() => _selectedWidth = val),
                      activeColor: Colors.orange,
                      inactiveColor: Colors.white.withValues(alpha: 0.1),
                    ),
                  ),

                  const SizedBox(height: 16),

                  // ── Opacity Slider ──────────────────────────────
                  _buildSettingSection(
                    label: 'Opacity',
                    value: _selectedOpacity,
                    min: 0.1,
                    max: 1.0,
                    onChanged: (val) => setState(() => _selectedOpacity = val),
                    child: Slider(
                      value: _selectedOpacity,
                      min: 0.1,
                      max: 1.0,
                      onChanged: (val) => setState(() => _selectedOpacity = val),
                      activeColor: Colors.orange,
                      inactiveColor: Colors.white.withValues(alpha: 0.1),
                    ),
                  ),

                  const SizedBox(height: 20),

                  // ── Color Grid (4x3) ────────────────────────────
                  Text(
                    'Colors',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.7),
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _buildColorGrid(),

                  const SizedBox(height: 20),

                  // ── Action Buttons ──────────────────────────────
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => Navigator.pop(context),
                          style: OutlinedButton.styleFrom(
                            side: BorderSide(
                              color: Colors.white.withValues(alpha: 0.2),
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                          child: Text(
                            'Cancel',
                            style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.7),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: () {
                            // Apply settings using the dedicated notifier method
                            ref.read(penSettingsProvider.notifier).applySettings(
                                  ref.read(penSettingsProvider).copyWith(
                                        type: _selectedType,
                                        color: _selectedColor,
                                        strokeWidth: _selectedWidth,
                                        opacity: _selectedOpacity,
                                      ),
                                );

                            Navigator.pop(context);
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.orange,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10),
                            ),
                            padding: const EdgeInsets.symmetric(vertical: 12),
                          ),
                          child: const Text(
                            'Apply',
                            style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSettingSection({
    required String label,
    required double value,
    required double min,
    required double max,
    required ValueChanged<double> onChanged,
    required Widget child,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              label,
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.7),
                fontSize: 12,
                fontWeight: FontWeight.w600,
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.orange.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                '${value.toStringAsFixed(1)}',
                style: const TextStyle(
                  color: Colors.orange,
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        child,
      ],
    );
  }

  Widget _buildColorGrid() {
    const colors = [
      Colors.black,
      Colors.white,
      Color(0xFFFF5252),
      Color(0xFFFF7043),
      Color(0xFFFFAB40),
      Color(0xFFFFEB3B),
      Color(0xFF69F0AE),
      Color(0xFF26C6DA),
      Color(0xFF40C4FF),
      Color(0xFF448AFF),
      Color(0xFFE040FB),
      Color(0xFF8D6E63),
    ];

    return GridView.builder(
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        mainAxisSpacing: 8,
        crossAxisSpacing: 8,
        childAspectRatio: 1,
      ),
      itemCount: colors.length,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemBuilder: (context, index) {
        final color = colors[index];
        final isSelected = color.value == _selectedColor.value;

        return GestureDetector(
          onTap: () {
            setState(() {
              _selectedColor = color;
            });
          },
          child: Container(
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: isSelected
                    ? Colors.orange
                    : Colors.white.withValues(alpha: 0.2),
                width: isSelected ? 2.5 : 1,
              ),
              boxShadow: isSelected
                  ? [
                      BoxShadow(
                        color: Colors.orange.withValues(alpha: 0.4),
                        blurRadius: 8,
                        spreadRadius: 1,
                      ),
                    ]
                  : null,
            ),
            child: isSelected
                ? const Center(
                    child: Icon(
                      Icons.check,
                      color: Colors.white,
                      size: 20,
                    ),
                  )
                : null,
          ),
        );
      },
    );
  }
}
