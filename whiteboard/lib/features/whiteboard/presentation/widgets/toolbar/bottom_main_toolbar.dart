import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../providers/canvas_provider.dart';
import '../../../providers/tool_provider.dart';
import 'tool_icon_button.dart';

class BottomMainToolbar extends ConsumerWidget {
  const BottomMainToolbar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final toolState = ref.watch(toolProvider);
    final toolNotifier = ref.read(toolProvider.notifier);
    final canvasNotifier = ref.read(canvasStateProvider.notifier);

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
                    onChanged: (mode) => toolNotifier.setInteractionMode(mode),
                  ),
                  const VerticalDivider(width: 24, indent: 16, endIndent: 16, color: Colors.white24),

                  // 2. Main Pinned Tool Slots (PRD 10.1)
                  ...toolState.pinnedTools.take(8).map((tool) {
                    return ToolIconButton(
                      tool: tool,
                      icon: _getIconForTool(tool),
                      tooltip: tool.name,
                    );
                  }).toList(),

                  const VerticalDivider(width: 24, indent: 16, endIndent: 16, color: Colors.white24),

                  // 3. Functional Actions
                  IconButton(
                    tooltip: 'Undo',
                    onPressed: () => canvasNotifier.undo(),
                    icon: const Icon(Icons.undo, size: 20, color: Colors.white70),
                    style: IconButton.styleFrom(fixedSize: const Size(44, 44)),
                  ),
                  IconButton(
                    tooltip: 'Redo',
                    onPressed: () => canvasNotifier.redo(),
                    icon: const Icon(Icons.redo, size: 20, color: Colors.white70),
                    style: IconButton.styleFrom(fixedSize: const Size(44, 44)),
                  ),
                  
                  const VerticalDivider(width: 24, indent: 16, endIndent: 16, color: Colors.white24),
                  
                  IconButton(
                    tooltip: 'Page Search',
                    onPressed: () => Scaffold.of(context).openDrawer(),
                    icon: const Icon(Icons.grid_view, size: 20, color: Color(0xFFFF6B35)),
                    style: IconButton.styleFrom(fixedSize: const Size(44, 44)),
                  ),
                  IconButton(
                    tooltip: 'Clear Page',
                    onPressed: () => canvasNotifier.clearPage(),
                    icon: const Icon(Icons.delete_sweep, size: 20, color: Colors.redAccent),
                    style: IconButton.styleFrom(fixedSize: const Size(44, 44)),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  IconData _getIconForTool(Tool tool) {
    switch (tool) {
      case Tool.softPen: return Icons.brush;
      case Tool.hardPen: return Icons.edit;
      case Tool.highlighter: return Icons.highlight;
      case Tool.softEraser: return Icons.cleaning_services;
      case Tool.rectangle: return Icons.crop_square;
      case Tool.circle: return Icons.panorama_fish_eye;
      case Tool.textBox: return Icons.text_fields;
      case Tool.select: return Icons.pan_tool_alt;
      case Tool.selectObject: return Icons.ads_click;
      default: return Icons.square;
    }
  }
}

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
          color: isSelected ? const Color(0xFFFF6B35) : Colors.transparent,
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
