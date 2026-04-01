import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../providers/tool_provider.dart';

class FloatingStylePanel extends ConsumerWidget {
  const FloatingStylePanel({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final toolState = ref.watch(toolProvider);
    final toolNotifier = ref.read(toolProvider.notifier);
    final settings = toolState.currentSettings;

    return Positioned(
      right: 20,
      top: 0,
      bottom: 0,
      child: Center(
        child: ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Container(
              width: 280,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.7),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white12, width: 1),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('STYLE - ${toolState.activeTool.name.toUpperCase()}', 
                    style: const TextStyle(color: Colors.white54, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
                  const SizedBox(height: 16),
                  
                  // 1. Color Grid (PRD 10.2)
                  const Text('Colors', style: TextStyle(color: Colors.white, fontSize: 12)),
                  const SizedBox(height: 12),
                  _ColorGrid(
                    selectedColor: settings.color,
                    onColorSelected: (color) => toolNotifier.setColor(color),
                  ),
                  
                  const Divider(height: 32, color: Colors.white10),
                  
                  // 2. Stroke Width Slider
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Width', style: TextStyle(color: Colors.white, fontSize: 12)),
                      Text('${settings.strokeWidth.toInt()} px', style: const TextStyle(color: Colors.white54, fontSize: 12)),
                    ],
                  ),
                  SliderTheme(
                    data: SliderTheme.of(context).copyWith(
                      activeTrackColor: const Color(0xFFFF6B35),
                      inactiveTrackColor: Colors.white10,
                      thumbColor: Colors.white,
                      overlayColor: const Color(0xFFFF6B35).withOpacity(0.2),
                    ),
                    child: Slider(
                      value: settings.strokeWidth,
                      min: 1.0,
                      max: 50.0,
                      onChanged: (v) => toolNotifier.setStrokeWidth(v),
                    ),
                  ),
                  
                  // 3. Opacity Slider
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Opacity', style: TextStyle(color: Colors.white, fontSize: 12)),
                      Text('${(settings.opacity * 100).toInt()}%', style: const TextStyle(color: Colors.white54, fontSize: 12)),
                    ],
                  ),
                  Slider(
                    value: settings.opacity,
                    min: 0.1,
                    max: 1.0,
                    activeColor: const Color(0xFFFF6B35),
                    onChanged: (v) => toolNotifier.setOpacity(v),
                  ),

                  const Divider(height: 32, color: Colors.white10),
                  
                  // 4. Smoothness / Smoothing (PRD 10.2)
                  const Text('Smoothness', style: TextStyle(color: Colors.white, fontSize: 12)),
                  Slider(
                    value: settings.smoothing.decimationThreshold,
                    min: 0.0,
                    max: 1.0,
                    activeColor: const Color(0xFFFF6B35),
                    onChanged: (v) => toolNotifier.setSmoothing(settings.smoothing.copyWith(decimationThreshold: v)),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _ColorGrid extends StatelessWidget {
  final Color selectedColor;
  final ValueChanged<Color> onColorSelected;

  const _ColorGrid({required this.selectedColor, required this.onColorSelected});

  static const List<Color> presets = [
    Colors.white, Colors.black, Colors.grey, Colors.red,
    Colors.orange, Colors.yellow, Colors.green, Colors.blue,
    Colors.purple, Colors.pink, Colors.brown, Colors.cyan,
  ];

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: presets.map((color) {
        final isSelected = selectedColor.value == color.value;
        return GestureDetector(
          onTap: () => onColorSelected(color),
          child: Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: color,
              shape: BoxShape.circle,
              border: Border.all(
                color: isSelected ? const Color(0xFFFF6B35) : Colors.white24,
                width: isSelected ? 3 : 1,
              ),
              boxShadow: isSelected ? [BoxShadow(color: color.withOpacity(0.5), blurRadius: 8)] : null,
            ),
          ),
        );
      }).toList(),
    );
  }
}
