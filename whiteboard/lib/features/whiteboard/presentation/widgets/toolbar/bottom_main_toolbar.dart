import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../../core/theme/app_theme.dart';
import '../../../providers/canvas_provider.dart';
import '../../../providers/tool_provider.dart';
import '../dialogs/pen_settings_bottom_sheet.dart';
import '../dialogs/question_theme_dialog.dart';

class BottomMainToolbar extends ConsumerWidget {
  const BottomMainToolbar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final toolState = ref.watch(toolProvider);
    final canvasState = ref.watch(canvasStateProvider);
    final toolNotifier = ref.read(toolProvider.notifier);
    final canvasNotifier = ref.read(canvasStateProvider.notifier);

    return Container(
      height: 56.h, // PRD Section 6.2
      padding: EdgeInsets.symmetric(horizontal: 12.w),
      decoration: BoxDecoration(
        color: const Color(0xFF1E2235),
        border: const Border(top: BorderSide(color: Colors.white12, width: 1)),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.3), blurRadius: 10, offset: const Offset(0, -2)),
        ],
      ),
      child: Row(
        children: [
          // 1. Undo / Redo (F-01.1.4)
          _navBtn(
            icon: Icons.undo,
            onTap: canvasState.undoHistory.isNotEmpty ? () => canvasNotifier.undo() : null,
            tooltip: 'Undo (Ctrl+Z)',
          ),
          _navBtn(
            icon: Icons.redo,
            onTap: canvasState.redoHistory.isNotEmpty ? () => canvasNotifier.redo() : null,
            tooltip: 'Redo (Ctrl+Y)',
          ),

          const Spacer(),

          // 2. Pinned tools (max 10 slots) (F-01.1.3)
          // Slot 0: Color picker (non-removable)
          _ColorPickerSlot(
            currentColor: toolState.currentSettings.color,
            onTap: () => _showColorPicker(context, ref),
          ),
          
          SizedBox(width: 8.w),

          // Tools slots 1-9
          Row(
            mainAxisSize: MainAxisSize.min,
            children: toolState.pinnedTools.where((t) => t != ToolType.select).map((tool) {
              return _PinnedToolSlot(
                tool: tool,
                isActive: toolState.activeTool == tool,
                onTap: () => toolNotifier.selectTool(tool),
                onLongPress: () => _openToolSettings(context, tool),
              );
            }).toList(),
          ),

          const Spacer(),

          // 3. + Tool Library (F-01.1.5)
          _actionBtn(
            icon: Icons.add_circle_outline,
            label: 'Library',
            onTap: () => Scaffold.of(context).openDrawer(),
            tooltip: 'Open Tool Library',
          ),
          
          SizedBox(width: 8.w),

          // 4. End Class (Secondary location or just Save)
          _actionBtn(
            icon: Icons.save_outlined,
            onTap: () => canvasNotifier.save(),
            tooltip: 'Save Progress',
            active: canvasState.isDirty,
          ),
        ],
      ),
    );
  }

  Widget _navBtn({required IconData icon, VoidCallback? onTap, String? tooltip}) {
    return Tooltip(
      message: tooltip ?? '',
      child: IconButton(
        icon: Icon(icon, color: onTap != null ? Colors.white70 : Colors.white12, size: 22.w),
        onPressed: onTap,
      ),
    );
  }

  Widget _actionBtn({required IconData icon, String? label, required VoidCallback onTap, String? tooltip, bool active = false}) {
    return Tooltip(
      message: tooltip ?? '',
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8.r),
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 6.h),
          decoration: BoxDecoration(
            color: active ? AppTheme.primaryOrange.withOpacity(0.2) : Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(8.r),
            border: Border.all(color: active ? AppTheme.primaryOrange : Colors.white12),
          ),
          child: Row(
            children: [
              Icon(icon, color: active ? AppTheme.primaryOrange : Colors.white70, size: 20.w),
              if (label != null) ...[
                SizedBox(width: 6.w),
                Text(label, style: TextStyle(color: active ? AppTheme.primaryOrange : Colors.white70, fontSize: 12.sp, fontWeight: FontWeight.bold)),
              ],
            ],
          ),
        ),
      ),
    );
  }

  void _showColorPicker(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (context) => const QuestionThemeDialog(),
    );
  }

  void _openToolSettings(BuildContext context, ToolType tool) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => PenSettingsBottomSheet(tool: tool),
    );
  }
}

class _ColorPickerSlot extends StatelessWidget {
  final Color currentColor;
  final VoidCallback onTap;
  const _ColorPickerSlot({required this.currentColor, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40.w,
        height: 40.w,
        decoration: BoxDecoration(
          color: currentColor,
          shape: BoxShape.circle,
          border: Border.all(color: Colors.white, width: 2),
          boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 4)],
        ),
        child: const Icon(Icons.colorize, color: Colors.white70, size: 16),
      ),
    );
  }
}

class _PinnedToolSlot extends StatelessWidget {
  final ToolType tool;
  final bool isActive;
  final VoidCallback onTap;
  final VoidCallback onLongPress;

  const _PinnedToolSlot({
    required this.tool, 
    required this.isActive, 
    required this.onTap,
    required this.onLongPress,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: 4.w),
      child: GestureDetector(
        onTap: onTap,
        onLongPress: onLongPress,
        child: AnimatedScale(
          scale: isActive ? 1.1 : 1.0,
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeOutBack,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            width: 44.w, height: 44.w,
            decoration: BoxDecoration(
              color: isActive ? AppTheme.primaryOrange : Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(10.r),
              border: Border.all(color: isActive ? AppTheme.primaryOrange.withOpacity(0.5) : Colors.white10),
              boxShadow: isActive ? [BoxShadow(color: AppTheme.primaryOrange.withOpacity(0.3), blurRadius: 10, spreadRadius: -1)] : [],
            ),
            child: Icon(_toolIcon(tool), color: isActive ? Colors.white : Colors.white60, size: 22.sp),
          ),
        ),
      ),
    );
  }

  IconData _toolIcon(ToolType t) {
    switch (t) {
      case ToolType.softPen: return Icons.edit_outlined;
      case ToolType.hardPen: return Icons.brush;
      case ToolType.highlighter: return Icons.highlight_outlined;
      case ToolType.softEraser: return Icons.auto_fix_normal_outlined;
      case ToolType.rectangle: return Icons.rectangle_outlined;
      case ToolType.circle: return Icons.circle_outlined;
      case ToolType.textBox: return Icons.text_fields_outlined;
      default: return Icons.category_outlined;
    }
  }
}
