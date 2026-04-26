import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../presentation/providers/canvas_provider.dart';
import '../../../presentation/providers/slide_provider.dart';
import '../../../presentation/providers/tool_provider.dart';
import '../../../presentation/providers/tool_registry.dart';
import '../../../../../core/theme/app_theme_colors.dart';
import '../../../../../core/theme/app_theme_text_styles.dart';
import '../../../../../core/theme/app_theme_dimensions.dart';
import 'tool_picker_panel.dart';
import 'tool_settings_sheet.dart';
import '../../dialogs/pen_picker_dialog.dart';
import '../../dialogs/eraser_popup.dart';
import '../tools/lasso_selection_overlay.dart';

const _kPenTools = {Tool.softPen, Tool.hardPen, Tool.highlighter, Tool.chalk, Tool.calligraphy, Tool.spray};

class BottomMainToolbar extends ConsumerStatefulWidget {
  const BottomMainToolbar({super.key});
  @override ConsumerState<BottomMainToolbar> createState() => _BottomMainToolbarState();
}

class _BottomMainToolbarState extends ConsumerState<BottomMainToolbar> {
  @override void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(toolNotifierProvider.notifier).loadToolbarFromStorage();
    });
  }

  @override Widget build(BuildContext context) {
    final toolState = ref.watch(toolNotifierProvider);
    final toolNotifier = ref.read(toolNotifierProvider.notifier);
    final canvasNotifier = ref.read(canvasNotifierProvider.notifier);
    final slideState = ref.watch(slideNotifierProvider);
    final slideNotifier = ref.read(slideNotifierProvider.notifier);
    final theme = AppThemeColors.of(context);
    final visibleTools = toolState.toolbarTools.where(toolState.enabledTools.contains).toList();

    return Container(
      height: AppThemeDimensions.bottomBarHeight,
      padding: const EdgeInsets.symmetric(horizontal: 8),
      decoration: BoxDecoration(color: theme.bgCard, border: Border(top: BorderSide(color: theme.divider, width: 1))),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            LassoModeSwitcher(),
            _divider(theme),
            _ToolbarDropArea(
              toolbarTools: visibleTools,
              activeTool: toolState.activeTool,
              onToolTap: (tool) => toolNotifier.selectTool(tool),
              onToolDoubleTap: (tool) { toolNotifier.selectTool(tool); _showToolQuickSettings(context, tool); },
              onRemoveTool: (tool) => toolNotifier.removeToolFromToolbar(tool),
              onReorderOrInsert: ({required Tool incoming, required int atIndex}) {
                final oldIndex = visibleTools.indexOf(incoming);
                if (oldIndex >= 0) { toolNotifier.moveToolInToolbar(oldIndex: oldIndex, newIndex: atIndex); }
                else { toolNotifier.addToolToToolbar(incoming, atIndex: atIndex); }
              },
            ),
            _IconBtn(icon: Icons.add_rounded, tooltip: 'Add tool', onPressed: () => _showToolLibrary(context)),
            _divider(theme),
            _IconBtn(icon: Icons.undo_rounded, tooltip: 'Undo', onPressed: canvasNotifier.undo),
            _IconBtn(icon: Icons.redo_rounded, tooltip: 'Redo', onPressed: canvasNotifier.redo),
            if (slideState.hasSlides) ...[
              _divider(theme),
              _SlideNavigation(
                slideIndex: slideState.currentPageIndex,
                totalSlides: slideState.pages.length,
                onPrev: slideState.currentPageIndex > 0 ? () => slideNotifier.navigateToSlide(slideState.currentPageIndex - 1) : null,
                onNext: slideState.currentPageIndex < slideState.pages.length - 1 ? () => slideNotifier.navigateToSlide(slideState.currentPageIndex + 1) : null,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _divider(AppThemeColors theme) => Container(width: 1, height: 20, margin: const EdgeInsets.symmetric(horizontal: 4), color: theme.divider);

  void _showToolLibrary(BuildContext context) {
    showModalBottomSheet<void>(context: context, useRootNavigator: true, isScrollControlled: true, backgroundColor: Colors.transparent, builder: (_) => const ToolPickerPanel());
  }

  void _showToolQuickSettings(BuildContext context, Tool tool) {
    if (_kPenTools.contains(tool)) {
      showDialog(context: context, barrierColor: Colors.transparent, barrierDismissible: true, builder: (_) => const PenPickerDialog());
    } else {
      showToolSettingsSheet(context, ref, tool);
    }
  }
}

class _IconBtn extends StatefulWidget {
  final IconData icon; final String tooltip; final VoidCallback? onPressed; final bool active;
  const _IconBtn({required this.icon, required this.tooltip, this.onPressed, this.active = false});
  @override State<_IconBtn> createState() => _IconBtnState();
}

class _IconBtnState extends State<_IconBtn> {
  bool _hovered = false;
  @override Widget build(BuildContext context) {
    final theme = AppThemeColors.of(context);
    return Tooltip(message: widget.tooltip, waitDuration: const Duration(milliseconds: 600),
      child: MouseRegion(
        onEnter: (_) => setState(() => _hovered = true), onExit: (_) => setState(() => _hovered = false),
        child: GestureDetector(
          onTap: widget.onPressed,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 120), curve: Curves.easeOut,
            width: AppThemeDimensions.toolButtonSize, height: AppThemeDimensions.toolButtonSize, margin: const EdgeInsets.symmetric(horizontal: 1),
            decoration: BoxDecoration(
              color: widget.active ? AppThemeColors.primaryAccent : (_hovered ? theme.toolHover : Colors.transparent),
              borderRadius: BorderRadius.circular(AppThemeDimensions.borderRadiusButton),
              boxShadow: _hovered && !widget.active ? [BoxShadow(color: theme.cardHoverShadow, blurRadius: 8, offset: const Offset(0, 2))] : null,
            ),
            child: Icon(widget.icon, size: AppThemeDimensions.toolIconSize,
              color: widget.active ? Colors.white : (widget.onPressed != null ? theme.textSecondary : theme.textMuted)),
          ),
        ),
      ),
    );
  }
}

class _ToolbarDropArea extends StatelessWidget {
  final List<Tool> toolbarTools; final Tool activeTool; final ValueChanged<Tool> onToolTap; final ValueChanged<Tool> onToolDoubleTap;
  final ValueChanged<Tool> onRemoveTool; final void Function({required Tool incoming, required int atIndex}) onReorderOrInsert;
  const _ToolbarDropArea({required this.toolbarTools, required this.activeTool, required this.onToolTap, required this.onToolDoubleTap, required this.onRemoveTool, required this.onReorderOrInsert});

  @override Widget build(BuildContext context) {
    return Row(mainAxisSize: MainAxisSize.min, children: [
      for (int i = 0; i < toolbarTools.length; i++)
        Row(children: [
          _DropSlot(onAccept: (t) => onReorderOrInsert(incoming: t, atIndex: i)),
          _ToolbarToolButton(tool: toolbarTools[i], selected: toolbarTools[i] == activeTool, onTap: () => onToolTap(toolbarTools[i]), onDoubleTap: () => onToolDoubleTap(toolbarTools[i]), onRemove: () => onRemoveTool(toolbarTools[i])),
        ]),
      _DropSlot(onAccept: (t) => onReorderOrInsert(incoming: t, atIndex: toolbarTools.length)),
    ]);
  }
}

class _DropSlot extends StatelessWidget {
  final ValueChanged<Tool> onAccept;
  const _DropSlot({required this.onAccept});
  @override Widget build(BuildContext context) {
    final theme = AppThemeColors.of(context);
    return DragTarget<Tool>(
      onWillAcceptWithDetails: (_) => true, onAcceptWithDetails: (d) => onAccept(d.data),
      builder: (_, candidateData, __) {
        final hovering = candidateData.isNotEmpty;
        return AnimatedContainer(duration: const Duration(milliseconds: 100), curve: Curves.easeOut,
          width: hovering ? 12 : 4, height: AppThemeDimensions.toolButtonSize,
          decoration: BoxDecoration(color: hovering ? AppThemeColors.primaryAccent.withValues(alpha: 0.7) : Colors.transparent, borderRadius: BorderRadius.circular(4)),
        );
      },
    );
  }
}

class _ToolbarToolButton extends ConsumerStatefulWidget {
  final Tool tool; final bool selected; final VoidCallback onTap; final VoidCallback onDoubleTap; final VoidCallback onRemove;
  const _ToolbarToolButton({required this.tool, required this.selected, required this.onTap, required this.onDoubleTap, required this.onRemove});
  @override ConsumerState<_ToolbarToolButton> createState() => _ToolbarToolButtonState();
}

class _ToolbarToolButtonState extends ConsumerState<_ToolbarToolButton> {
  bool _hovered = false;
  static const _eraserTools = [Tool.softEraser, Tool.hardEraser, Tool.objectEraser, Tool.areaEraser];
  bool get _isPen => _kPenTools.contains(widget.tool);
  bool get _isEraser => _eraserTools.contains(widget.tool);

  @override Widget build(BuildContext context) {
    final def = toolRegistryByTool[widget.tool];
    if (def == null) return const SizedBox.shrink();
    final theme = AppThemeColors.of(context);
    return LongPressDraggable<Tool>(
      data: widget.tool, delay: const Duration(milliseconds: 250),
      feedback: Material(color: Colors.transparent, child: _buildVisual(def, theme, selected: true, dragging: true)),
      childWhenDragging: Opacity(opacity: 0.3, child: _buildVisual(def, theme, selected: widget.selected)),
      child: MouseRegion(
        onEnter: (_) => setState(() => _hovered = true), onExit: (_) => setState(() => _hovered = false),
        child: GestureDetector(
          onTap: widget.onTap, onDoubleTap: widget.onDoubleTap,
          onLongPress: () { if (_isPen) { _showPenPickerDialog(); } else if (_isEraser) { _showEraserPopup(); } else { widget.onRemove(); } },
          child: _buildVisual(def, theme, selected: widget.selected),
        ),
      ),
    );
  }

  Widget _buildVisual(ToolDefinition def, AppThemeColors theme, {required bool selected, bool dragging = false}) {
    final bg = selected ? AppThemeColors.primaryAccent : (_hovered && !dragging ? theme.toolHover : Colors.transparent);
    final iconColor = selected ? Colors.white : (_hovered ? theme.textPrimary : theme.textSecondary);
    return AnimatedContainer(duration: const Duration(milliseconds: 120), curve: Curves.easeOut,
      width: AppThemeDimensions.toolButtonSize, height: AppThemeDimensions.toolButtonSize, margin: const EdgeInsets.symmetric(horizontal: 1),
      decoration: BoxDecoration(
        color: bg, borderRadius: BorderRadius.circular(AppThemeDimensions.borderRadiusButton),
        border: selected ? null : Border.all(color: _hovered ? theme.borderCard : Colors.transparent, width: 1),
        boxShadow: _hovered && !selected && !dragging ? [BoxShadow(color: theme.cardHoverShadow, blurRadius: 8, offset: const Offset(0, 2))] : null,
      ),
      child: Tooltip(
        message: '${def.name}\nDouble-tap: ${_isPen ? "pen settings" : _isEraser ? "eraser mode" : "settings"}\nLong-press: ${_isPen ? "pen picker" : _isEraser ? "eraser mode" : "remove"}',
        waitDuration: const Duration(milliseconds: 700),
        child: Icon(def.icon, size: dragging ? 15 : AppThemeDimensions.toolIconSize, color: iconColor),
      ),
    );
  }

  void _showPenPickerDialog() => showDialog(context: context, barrierColor: Colors.transparent, barrierDismissible: true, builder: (_) => const PenPickerDialog());
  void _showEraserPopup() {
    final box = context.findRenderObject() as RenderBox?;
    if (box == null) return;
    final pos = box.localToGlobal(Offset.zero); final size = box.size;
    showDialog(context: context, barrierColor: Colors.transparent, builder: (_) => EraserPopup(position: Offset(pos.dx + size.width / 2, pos.dy)));
  }
}

class _ModeToggle extends StatelessWidget {
  final Tool activeTool; final InteractionMode mode; final Function(Tool) onSelectTool;
  const _ModeToggle({required this.activeTool, required this.mode, required this.onSelectTool});
  @override Widget build(BuildContext context) {
    final theme = AppThemeColors.of(context);
    return Container(height: 28, padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(color: theme.bgMain, borderRadius: BorderRadius.circular(AppThemeDimensions.borderRadiusButton), border: Border.all(color: theme.borderCard, width: 1)),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        _ToggleIcon(isSelected: activeTool == Tool.selectObject, icon: Icons.open_with_rounded, tooltip: 'Move object', onTap: () => onSelectTool(Tool.selectObject)),
        const SizedBox(width: 2),
        _ToggleIcon(isSelected: activeTool == Tool.select, icon: Icons.highlight_alt_rounded, tooltip: 'Adjust drawing', onTap: () => onSelectTool(Tool.select)),
      ]),
    );
  }
}

class _ToggleIcon extends StatelessWidget {
  final bool isSelected; final IconData icon; final String tooltip; final VoidCallback onTap;
  const _ToggleIcon({required this.isSelected, required this.icon, required this.tooltip, required this.onTap});
  @override Widget build(BuildContext context) {
    return Tooltip(message: tooltip, waitDuration: const Duration(milliseconds: 600),
      child: GestureDetector(onTap: onTap,
        child: AnimatedContainer(duration: const Duration(milliseconds: 120), curve: Curves.easeOut, width: 26, height: 22,
          decoration: BoxDecoration(color: isSelected ? AppThemeColors.primaryAccent : Colors.transparent, borderRadius: BorderRadius.circular(4)),
          child: Icon(icon, size: 14, color: isSelected ? Colors.white : AppThemeColors.of(context).textMuted),
        ),
      ),
    );
  }
}

class _SlideNavigation extends StatelessWidget {
  final int slideIndex; final int totalSlides; final VoidCallback? onPrev; final VoidCallback? onNext;
  const _SlideNavigation({required this.slideIndex, required this.totalSlides, required this.onPrev, required this.onNext});
  @override Widget build(BuildContext context) {
    final theme = AppThemeColors.of(context);
    return Row(mainAxisSize: MainAxisSize.min, children: [
      _IconBtn(icon: Icons.chevron_left_rounded, tooltip: 'Previous slide', onPressed: onPrev),
      Container(padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
        decoration: BoxDecoration(color: theme.bgMain, borderRadius: BorderRadius.circular(AppThemeDimensions.borderRadiusPill), border: Border.all(color: theme.borderCard)),
        child: Text('${slideIndex + 1}/$totalSlides', style: AppThemeTextStyles.caption(context).copyWith(fontWeight: FontWeight.w500, color: theme.textSecondary)),
      ),
      _IconBtn(icon: Icons.chevron_right_rounded, tooltip: 'Next slide', onPressed: onNext),
    ]);
  }
}
