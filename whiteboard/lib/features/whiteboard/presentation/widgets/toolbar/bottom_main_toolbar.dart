import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../presentation/providers/canvas_provider.dart';
import '../../../presentation/providers/slide_provider.dart';
import '../../../presentation/providers/tool_provider.dart';
import '../../../presentation/providers/tool_registry.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/constants/app_text_styles.dart';
import 'tool_picker_panel.dart';
import 'tool_settings_sheet.dart';
import '../../dialogs/pen_picker_dialog.dart';
import '../../dialogs/eraser_popup.dart';

class BottomMainToolbar extends ConsumerStatefulWidget {
  const BottomMainToolbar({super.key});

  @override
  ConsumerState<BottomMainToolbar> createState() => _BottomMainToolbarState();
}

class _BottomMainToolbarState extends ConsumerState<BottomMainToolbar> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(toolNotifierProvider.notifier).loadToolbarFromStorage();
    });
  }

  @override
  Widget build(BuildContext context) {
    final toolState    = ref.watch(toolNotifierProvider);
    final toolNotifier = ref.read(toolNotifierProvider.notifier);
    final canvasNotifier = ref.read(canvasNotifierProvider.notifier);
    final slideState   = ref.watch(slideNotifierProvider);
    final slideNotifier = ref.read(slideNotifierProvider.notifier);
    final visibleTools = toolState.toolbarTools
        .where(toolState.enabledTools.contains)
        .toList();

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
                color: Colors.black.withValues(alpha: 0.7),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white12, width: 1),
              ),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    _ModeToggle(
                      activeTool: toolState.activeTool,
                      mode: toolState.interactionMode,
                      onSelectTool: (t) => toolNotifier.selectTool(t),
                    ),
                    const VerticalDivider(
                        width: 24, indent: 16, endIndent: 16,
                        color: Colors.white24),

                    // Dynamic tool buttons
                    _ToolbarDropArea(
                      toolbarTools: visibleTools,
                      activeTool: toolState.activeTool,
                      onToolTap: (tool) => toolNotifier.selectTool(tool),
                      onToolDoubleTap: (tool) {
                        toolNotifier.selectTool(tool);
                        _showToolQuickSettings(context, tool);
                      },
                      onRemoveTool: (tool) =>
                          toolNotifier.removeToolFromToolbar(tool),
                      onReorderOrInsert: ({
                        required Tool incoming,
                        required int atIndex,
                      }) {
                        final oldIndex = visibleTools.indexOf(incoming);
                        if (oldIndex >= 0) {
                          toolNotifier.moveToolInToolbar(
                              oldIndex: oldIndex, newIndex: atIndex);
                        } else {
                          toolNotifier.addToolToToolbar(incoming,
                              atIndex: atIndex);
                        }
                      },
                    ),

                    // Add-tool button
                    IconButton(
                      tooltip: 'Add tool',
                      onPressed: () => _showToolLibrary(context),
                      icon: const Icon(Icons.add,
                          size: 20, color: Colors.white70),
                      style: IconButton.styleFrom(
                          fixedSize: const Size(44, 44)),
                    ),

                    const VerticalDivider(
                        width: 24, indent: 16, endIndent: 16,
                        color: Colors.white24),

                    // Undo / Redo
                    IconButton(
                      tooltip: 'Undo',
                      onPressed: canvasNotifier.undo,
                      icon: const Icon(Icons.undo,
                          size: 20, color: Colors.white70),
                      style: IconButton.styleFrom(
                          fixedSize: const Size(44, 44)),
                    ),
                    IconButton(
                      tooltip: 'Redo',
                      onPressed: canvasNotifier.redo,
                      icon: const Icon(Icons.redo,
                          size: 20, color: Colors.white70),
                      style: IconButton.styleFrom(
                          fixedSize: const Size(44, 44)),
                    ),

                    // Slide navigation (only when slides are loaded)
                    if (slideState.hasSlides) ...[
                      const VerticalDivider(
                          width: 24, indent: 16, endIndent: 16,
                          color: Colors.white24),
                      _SlideNavigation(
                        slideIndex: slideState.currentPageIndex,
                        totalSlides: slideState.pages.length,
                        onPrev: slideState.currentPageIndex > 0
                            ? () => slideNotifier.navigateToSlide(
                                slideState.currentPageIndex - 1)
                            : null,
                        onNext: slideState.currentPageIndex <
                                slideState.pages.length - 1
                            ? () => slideNotifier.navigateToSlide(
                                slideState.currentPageIndex + 1)
                            : null,
                      ),
                    ],

                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _showToolLibrary(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      useRootNavigator: true,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const ToolPickerPanel(),
    );
  }

  void _showToolQuickSettings(BuildContext context, Tool tool) {
    showToolSettingsSheet(context, ref, tool);
  }
}

// ── Drop area ────────────────────────────────────────────────────────────────

class _ToolbarDropArea extends StatelessWidget {
  final List<Tool> toolbarTools;
  final Tool activeTool;
  final ValueChanged<Tool> onToolTap;
  final ValueChanged<Tool> onToolDoubleTap;
  final ValueChanged<Tool> onRemoveTool;
  final void Function({required Tool incoming, required int atIndex})
      onReorderOrInsert;

  const _ToolbarDropArea({
    required this.toolbarTools,
    required this.activeTool,
    required this.onToolTap,
    required this.onToolDoubleTap,
    required this.onRemoveTool,
    required this.onReorderOrInsert,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        for (int i = 0; i < toolbarTools.length; i++)
          Row(children: [
            _DropSlot(
                onAccept: (t) =>
                    onReorderOrInsert(incoming: t, atIndex: i)),
            _ToolbarToolButton(
              tool: toolbarTools[i],
              selected: toolbarTools[i] == activeTool,
              onTap: () => onToolTap(toolbarTools[i]),
              onDoubleTap: () => onToolDoubleTap(toolbarTools[i]),
              onRemove: () => onRemoveTool(toolbarTools[i]),
            ),
          ]),
        _DropSlot(
            onAccept: (t) =>
                onReorderOrInsert(incoming: t, atIndex: toolbarTools.length)),
      ],
    );
  }
}

// ── Drop slot ────────────────────────────────────────────────────────────────

class _DropSlot extends StatelessWidget {
  final ValueChanged<Tool> onAccept;
  const _DropSlot({required this.onAccept});

  @override
  Widget build(BuildContext context) {
    return DragTarget<Tool>(
      onWillAcceptWithDetails: (_) => true,
      onAcceptWithDetails: (d) => onAccept(d.data),
      builder: (_, candidateData, __) {
        final hovering = candidateData.isNotEmpty;
        return AnimatedContainer(
          duration: const Duration(milliseconds: 120),
          width: hovering ? 14 : 6,
          height: 40,
          decoration: BoxDecoration(
            color: hovering
                ? AppColors.accentOrange.withValues(alpha: 0.8)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(6),
          ),
        );
      },
    );
  }
}

// ── Tool button ──────────────────────────────────────────────────────────────

class _ToolbarToolButton extends ConsumerStatefulWidget {
  final Tool tool;
  final bool selected;
  final VoidCallback onTap;
  final VoidCallback onDoubleTap;
  final VoidCallback onRemove;

  const _ToolbarToolButton({
    required this.tool,
    required this.selected,
    required this.onTap,
    required this.onDoubleTap,
    required this.onRemove,
  });

  @override
  ConsumerState<_ToolbarToolButton> createState() => _ToolbarToolButtonState();
}

class _ToolbarToolButtonState extends ConsumerState<_ToolbarToolButton> {
  @override
  Widget build(BuildContext context) {
    final def = toolRegistryByTool[widget.tool];
    if (def == null) return const SizedBox.shrink();

    // Determine if this is a pen or eraser tool for special long-press handling
    final isPenTool = [
      Tool.softPen,
      Tool.hardPen,
      Tool.highlighter,
      Tool.chalk,
      Tool.calligraphy,
      Tool.spray,
    ].contains(widget.tool);

    final isEraserTool = [
      Tool.softEraser,
      Tool.hardEraser,
      Tool.objectEraser,
      Tool.areaEraser,
    ].contains(widget.tool);

    return LongPressDraggable<Tool>(
      data: widget.tool,
      feedback: Material(
          color: Colors.transparent,
          child: _visual(def, selected: true, small: true)),
      childWhenDragging: Opacity(
          opacity: 0.35, child: _visual(def, selected: widget.selected)),
      child: GestureDetector(
        onTap: widget.onTap,
        onDoubleTap: widget.onDoubleTap,
        onLongPress: () {
          if (isPenTool) {
            _showPenPickerDialog();
          } else if (isEraserTool) {
            _showEraserPopup();
          } else {
            widget.onRemove();
          }
        },
        child: _visual(def, selected: widget.selected),
      ),
    );
  }

  void _showPenPickerDialog() {
    showDialog(
      context: context,
      builder: (_) => const PenPickerDialog(),
    );
  }

  void _showEraserPopup() {
    final renderBox = context.findRenderObject() as RenderBox?;
    if (renderBox == null) return;

    final position = renderBox.localToGlobal(Offset.zero);
    final size = renderBox.size;

    showDialog(
      context: context,
      barrierColor: Colors.transparent,
      builder: (_) => EraserPopup(
        position: Offset(position.dx + size.width / 2, position.dy),
      ),
    );
  }

  Widget _visual(ToolDefinition def,
      {required bool selected, bool small = false}) {
    return Container(
      width: 44,
      height: 44,
      margin: const EdgeInsets.symmetric(horizontal: 2),
      decoration: BoxDecoration(
        color: selected ? AppColors.accentOrange : Colors.transparent,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Tooltip(
        message: '${def.name} (long-press: ${_getLongPressTooltip()})',
        child: Icon(def.icon,
            size: small ? 18 : 20,
            color: selected ? Colors.white : Colors.white70),
      ),
    );
  }

  String _getLongPressTooltip() {
    final isPenTool = [
      Tool.softPen,
      Tool.hardPen,
      Tool.highlighter,
      Tool.chalk,
      Tool.calligraphy,
      Tool.spray,
    ].contains(widget.tool);

    final isEraserTool = [
      Tool.softEraser,
      Tool.hardEraser,
      Tool.objectEraser,
      Tool.areaEraser,
    ].contains(widget.tool);

    if (isPenTool) return 'open pen settings';
    if (isEraserTool) return 'select erase mode';
    return 'remove from toolbar';
  }
}

// ── Mode toggle ──────────────────────────────────────────────────────────────

class _ModeToggle extends StatelessWidget {
  final Tool activeTool;
  final InteractionMode mode;
  final Function(Tool) onSelectTool;

  const _ModeToggle({required this.activeTool, required this.mode, required this.onSelectTool});

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 36,
      decoration: BoxDecoration(
          color: Colors.white10, borderRadius: BorderRadius.circular(8)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _ToggleItem(
              isSelected: activeTool == Tool.selectObject,
              icon: Icons.open_with,
              label: 'Move Question',
              onTap: () => onSelectTool(Tool.selectObject)),
          _ToggleItem(
              isSelected: activeTool == Tool.select,
              icon: Icons.highlight_alt,
              label: 'Adjust Drawing',
              onTap: () => onSelectTool(Tool.select)),
        ],
      ),
    );
  }
}

class _ToggleItem extends StatelessWidget {
  final bool isSelected;
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _ToggleItem(
      {required this.isSelected,
      required this.icon,
      required this.label,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: isSelected ? AppColors.accentOrange : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon,
                size: 18,
                color: isSelected ? Colors.white : Colors.white54),
            const SizedBox(width: 6),
            Text(label,
                style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: isSelected ? Colors.white : Colors.white54)),
          ],
        ),
      ),
    );
  }
}

// ── Slide navigation ─────────────────────────────────────────────────────────

class _SlideNavigation extends StatelessWidget {
  final int slideIndex;
  final int totalSlides;
  final VoidCallback? onPrev;
  final VoidCallback? onNext;

  const _SlideNavigation({
    required this.slideIndex,
    required this.totalSlides,
    required this.onPrev,
    required this.onNext,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        IconButton(
          tooltip: 'Previous slide',
          onPressed: onPrev,
          icon: Icon(Icons.chevron_left,
              size: 20,
              color: onPrev != null ? Colors.white70 : Colors.white24),
          style: IconButton.styleFrom(fixedSize: const Size(36, 44)),
        ),
        Text('${slideIndex + 1}/$totalSlides',
            style: AppTextStyles.caption.copyWith(color: Colors.white70)),
        IconButton(
          tooltip: 'Next slide',
          onPressed: onNext,
          icon: Icon(Icons.chevron_right,
              size: 20,
              color: onNext != null ? Colors.white70 : Colors.white24),
          style: IconButton.styleFrom(fixedSize: const Size(36, 44)),
        ),
      ],
    );
  }
}
