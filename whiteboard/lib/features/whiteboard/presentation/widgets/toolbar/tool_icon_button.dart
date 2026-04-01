import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../providers/tool_provider.dart';

class ToolIconButton extends ConsumerWidget {
  final Tool tool;
  final IconData icon;
  final String? tooltip;

  const ToolIconButton({
    super.key,
    required this.tool,
    required this.icon,
    this.tooltip,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final toolState = ref.watch(toolProvider);
    final isSelected = toolState.activeTool == tool;

    return IconButton(
      tooltip: tooltip,
      onPressed: () => ref.read(toolProvider.notifier).selectTool(tool),
      icon: Icon(
        icon,
        size: 20,
        color: isSelected ? const Color(0xFFFF6B35) : Colors.white70,
      ),
      style: IconButton.styleFrom(
        backgroundColor: isSelected ? Colors.white10 : Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        fixedSize: const Size(44, 44),
      ),
    );
  }
}
