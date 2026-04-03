import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../presentation/providers/canvas_provider.dart';
import '../../../presentation/providers/tool_provider.dart';
import '../../../presentation/providers/session_provider.dart';
import '../../../presentation/providers/app_mode_provider.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/constants/app_dimensions.dart';

class BottomMainToolbar extends ConsumerWidget {
  const BottomMainToolbar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final toolState = ref.watch(toolNotifierProvider);
    final toolNotifier = ref.read(toolNotifierProvider.notifier);
    final canvasNotifier = ref.read(canvasNotifierProvider.notifier);
    final sessionState = ref.watch(sessionNotifierProvider);

    return Align(
      alignment: Alignment.bottomCenter,
      child: Padding(
        padding: const EdgeInsets.only(bottom: 24.0),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Container(
              height: 56,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.7),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white12, width: 1),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // 1. Mode Toggle (Select vs Draw)
                  _ModeToggle(
                    mode: toolState.interactionMode,
                    onChanged: (mode) => toolNotifier.toggleInteractionMode(),
                  ),
                  const VerticalDivider(width: 24, indent: 16, endIndent: 16, color: Colors.white24),

                  // 2. Drawing Tools
                  _ToolButton(
                    icon: Icons.brush,
                    label: 'Pen',
                    isSelected: toolState.activeTool == Tool.softPen,
                    onTap: () => toolNotifier.selectTool(Tool.softPen),
                  ),
                  _ToolButton(
                    icon: Icons.edit,
                    label: 'Hard Pen',
                    isSelected: toolState.activeTool == Tool.hardPen,
                    onTap: () => toolNotifier.selectTool(Tool.hardPen),
                  ),
                  _ToolButton(
                    icon: Icons.highlight,
                    label: 'Highlighter',
                    isSelected: toolState.activeTool == Tool.highlighter,
                    onTap: () => toolNotifier.selectTool(Tool.highlighter),
                  ),
                  _ToolButton(
                    icon: Icons.cleaning_services,
                    label: 'Eraser',
                    isSelected: toolState.activeTool == Tool.softEraser,
                    onTap: () => toolNotifier.selectTool(Tool.softEraser),
                  ),
                  
                  const VerticalDivider(width: 24, indent: 16, endIndent: 16, color: Colors.white24),

                  // 3. Shapes
                  _ToolButton(
                    icon: Icons.crop_square,
                    label: 'Rectangle',
                    isSelected: toolState.activeTool == Tool.rectangle,
                    onTap: () => toolNotifier.selectTool(Tool.rectangle),
                  ),
                  _ToolButton(
                    icon: Icons.panorama_fish_eye,
                    label: 'Circle',
                    isSelected: toolState.activeTool == Tool.circle,
                    onTap: () => toolNotifier.selectTool(Tool.circle),
                  ),
                  _ToolButton(
                    icon: Icons.change_history,
                    label: 'Triangle',
                    isSelected: toolState.activeTool == Tool.triangle,
                    onTap: () => toolNotifier.selectTool(Tool.triangle),
                  ),
                  _ToolButton(
                    icon: Icons.text_fields,
                    label: 'Text',
                    isSelected: toolState.activeTool == Tool.textBox,
                    onTap: () => toolNotifier.selectTool(Tool.textBox),
                  ),

                  const VerticalDivider(width: 24, indent: 16, endIndent: 16, color: Colors.white24),

                  // 4. Undo/Redo
                  IconButton(
                    tooltip: 'Undo',
                    onPressed: canvasNotifier.undo,
                    icon: const Icon(Icons.undo, size: 20, color: Colors.white70),
                    style: IconButton.styleFrom(fixedSize: const Size(44, 44)),
                  ),
                  IconButton(
                    tooltip: 'Redo',
                    onPressed: canvasNotifier.redo,
                    icon: const Icon(Icons.redo, size: 20, color: Colors.white70),
                    style: IconButton.styleFrom(fixedSize: const Size(44, 44)),
                  ),
                  
                  const VerticalDivider(width: 24, indent: 16, endIndent: 16, color: Colors.white24),
                  
                  // 5. Color Picker
                  _ColorPickerButton(
                    currentColor: toolState.color,
                    onColorChanged: (color) => toolNotifier.setColor(color),
                  ),

                  // 6. Stroke Width
                  _StrokeWidthSlider(
                    value: toolState.strokeWidth,
                    onChanged: (w) => toolNotifier.setStrokeWidth(w),
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

// ── Tool Button ────────────────────────────────────────────────────────────

class _ToolButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _ToolButton({
    required this.icon,
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 44,
        height: 44,
        margin: const EdgeInsets.symmetric(horizontal: 2),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.accentOrange : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Tooltip(
          message: label,
          child: Icon(
            icon,
            size: 20,
            color: isSelected ? Colors.white : Colors.white70,
          ),
        ),
      ),
    );
  }
}

// ── Mode Toggle ────────────────────────────────────────────────────────────

class _ModeToggle extends StatelessWidget {
  final InteractionMode mode;
  final ValueChanged<InteractionMode> onChanged;

  const _ModeToggle({required this.mode, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 36,
      decoration: BoxDecoration(
        color: Colors.white10,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _ToggleItem(
            isSelected: mode == InteractionMode.selectMode,
            icon: Icons.near_me_outlined,
            onTap: () => onChanged(InteractionMode.selectMode),
          ),
          _ToggleItem(
            isSelected: mode == InteractionMode.drawMode,
            icon: Icons.gesture,
            onTap: () => onChanged(InteractionMode.drawMode),
          ),
        ],
      ),
    );
  }
}

class _ToggleItem extends StatelessWidget {
  final bool isSelected;
  final IconData icon;
  final VoidCallback onTap;

  const _ToggleItem({required this.isSelected, required this.icon, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 36,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: isSelected ? AppColors.accentOrange : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Icon(
          icon,
          size: 18,
          color: isSelected ? Colors.white : Colors.white54,
        ),
      ),
    );
  }
}

// ── Color Picker Button ────────────────────────────────────────────────────

class _ColorPickerButton extends StatelessWidget {
  final Color currentColor;
  final ValueChanged<Color> onColorChanged;

  const _ColorPickerButton({
    required this.currentColor,
    required this.onColorChanged,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => _showColorPicker(context),
      child: Container(
        width: 36,
        height: 36,
        margin: const EdgeInsets.symmetric(horizontal: 4),
        decoration: BoxDecoration(
          color: currentColor,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.white30, width: 2),
        ),
        child: const Icon(
          Icons.palette,
          size: 18,
          color: Colors.black54,
        ),
      ),
    );
  }

  void _showColorPicker(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Select Color'),
        content: SingleChildScrollView(
          child: BlockPicker(
            pickerColor: currentColor,
            onColorChanged: onColorChanged,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }
}

// ── Stroke Width Slider ────────────────────────────────────────────────────

class _StrokeWidthSlider extends StatelessWidget {
  final double value;
  final ValueChanged<double> onChanged;

  const _StrokeWidthSlider({
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 100,
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            '${value.toInt()}px',
            style: const TextStyle(color: Colors.white70, fontSize: 10),
          ),
          SliderTheme(
            data: SliderThemeData(
              trackHeight: 4,
              thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 6),
              overlayShape: const RoundSliderOverlayShape(overlayRadius: 12),
              activeTrackColor: AppColors.accentOrange,
              inactiveTrackColor: Colors.white24,
              thumbColor: AppColors.accentOrange,
            ),
            child: Slider(
              value: value,
              min: 1,
              max: 50,
              divisions: 49,
              onChanged: onChanged,
            ),
          ),
        ],
      ),
    );
  }
}

// ── Block Picker (Simple Color Grid) ───────────────────────────────────────

class BlockPicker extends StatelessWidget {
  final Color pickerColor;
  final ValueChanged<Color> onColorChanged;

  const BlockPicker({
    required this.pickerColor,
    required this.onColorChanged,
  });

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
    Colors.lime,
    Colors.brown,
    Colors.grey,
  ];

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: _colors.map((color) {
        return GestureDetector(
          onTap: () => onColorChanged(color),
          child: Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: pickerColor == color
                    ? AppColors.accentOrange
                    : Colors.white30,
                width: pickerColor == color ? 3 : 1,
              ),
            ),
          ),
        );
      }).toList(),
    );
  }
}
