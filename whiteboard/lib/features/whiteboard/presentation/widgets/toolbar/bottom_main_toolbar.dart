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
import '../tools/lasso_selection_overlay.dart';

// ─── Design Tokens ─────────────────────────────────────────────────────────
// Color system: matte black, no gradients, no white backgrounds
class _DS {
  // Colors
  static const body          = Color(0xFF0F0F0F);
  static const bgCard        = Color(0xFF1A1A1A);
  static const bgCardHover   = Color(0xFF202020);
  static const borderCard    = Color(0xFF252525);
  static const borderDivider = Color(0xFF1E1E1E);
  static const accent        = Color(0xFFFF6B2B);
  static const accentHover   = Color(0xFFE55A1A);
  static const textPrimary   = Color(0xFFEFEFEF);
  static const textSecondary = Color(0xFF888888);
  static const textMuted     = Color(0xFF555555);
  static const inputBg       = Color(0xFF1A1A1A);
  static const inputBorder   = Color(0xFF2A2A2A);

  // Radii
  static const radiusCard   = 8.0;
  static const radiusPill   = 20.0;
  static const radiusButton = 6.0;

  // Compact toolbar dims (30% reduction)
  static const toolbarHeight  = 44.0;
  static const buttonSize     = 34.0;   // was 36
  static const iconSize       = 17.0;   // was 18
  static const iconSizeSmall  = 15.0;   // was 16

  // Typography
  static const fontFamily = 'Inter';

  static const styleLabel = TextStyle(
    fontFamily: fontFamily,
    fontSize: 11,           // was 13, reduced 2px
    fontWeight: FontWeight.w500,
    color: textPrimary,
    height: 1.5,
  );

  static const styleMeta = TextStyle(
    fontFamily: fontFamily,
    fontSize: 10,
    fontWeight: FontWeight.w400,
    color: textMuted,
    height: 1.5,
  );
}
// ───────────────────────────────────────────────────────────────────────────

// Pen tools set — used in two places for dialog routing
const _kPenTools = {
  Tool.softPen, Tool.hardPen, Tool.highlighter,
  Tool.chalk, Tool.calligraphy, Tool.spray,
};

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
    final toolState      = ref.watch(toolNotifierProvider);
    final toolNotifier   = ref.read(toolNotifierProvider.notifier);
    final canvasNotifier = ref.read(canvasNotifierProvider.notifier);
    final slideState     = ref.watch(slideNotifierProvider);
    final slideNotifier  = ref.read(slideNotifierProvider.notifier);

    final visibleTools = toolState.toolbarTools
        .where(toolState.enabledTools.contains)
        .toList();

    return Container(
      height: _DS.toolbarHeight,
      padding: const EdgeInsets.symmetric(horizontal: 8),
      decoration: const BoxDecoration(
        color: _DS.bgCard,
        border: Border(
          top: BorderSide(color: _DS.borderDivider, width: 1),
        ),
      ),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            // ── Mode dropdown (Select / Lasso / Text / Eraser) ───────────
            LassoModeSwitcher(),

            _divider(),

            // ── Dynamic tool buttons ─────────────────────────────────────
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
                  toolNotifier.addToolToToolbar(incoming, atIndex: atIndex);
                }
              },
            ),

            // ── Add tool ─────────────────────────────────────────────────
            _IconBtn(
              icon: Icons.add_rounded,
              tooltip: 'Add tool',
              onPressed: () => _showToolLibrary(context),
            ),

            _divider(),

            // ── Undo / Redo ───────────────────────────────────────────────
            _IconBtn(
              icon: Icons.undo_rounded,
              tooltip: 'Undo',
              onPressed: canvasNotifier.undo,
            ),
            _IconBtn(
              icon: Icons.redo_rounded,
              tooltip: 'Redo',
              onPressed: canvasNotifier.redo,
            ),

            // ── Slide navigation ──────────────────────────────────────────
            if (slideState.hasSlides) ...[
              _divider(),
              _SlideNavigation(
                slideIndex: slideState.currentPageIndex,
                totalSlides: slideState.pages.length,
                onPrev: slideState.currentPageIndex > 0
                    ? () => slideNotifier
                        .navigateToSlide(slideState.currentPageIndex - 1)
                    : null,
                onNext: slideState.currentPageIndex <
                        slideState.pages.length - 1
                    ? () => slideNotifier
                        .navigateToSlide(slideState.currentPageIndex + 1)
                    : null,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _divider() => Container(
        width: 1,
        height: 20,
        margin: const EdgeInsets.symmetric(horizontal: 5),
        color: _DS.borderDivider,
      );

  void _showToolLibrary(BuildContext context) {
    showModalBottomSheet<void>(
      context: context,
      useRootNavigator: true,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const ToolPickerPanel(),
    );
  }

  /// ✅ BUG FIX: pen tools → PenPickerDialog, others → old sheet
  void _showToolQuickSettings(BuildContext context, Tool tool) {
    if (_kPenTools.contains(tool)) {
      showDialog(
        context: context,
        barrierColor: Colors.transparent,
        barrierDismissible: true,
        builder: (_) => const PenPickerDialog(),
      );
    } else {
      showToolSettingsSheet(context, ref, tool);
    }
  }
}

// ── Reusable compact icon button ─────────────────────────────────────────────

class _IconBtn extends StatefulWidget {
  final IconData icon;
  final String tooltip;
  final VoidCallback? onPressed;
  final bool active;

  const _IconBtn({
    required this.icon,
    required this.tooltip,
    this.onPressed,
    this.active = false,
  });

  @override
  State<_IconBtn> createState() => _IconBtnState();
}

class _IconBtnState extends State<_IconBtn> {
  bool _hovered = false;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: widget.tooltip,
      waitDuration: const Duration(milliseconds: 600),
      child: MouseRegion(
        onEnter: (_) => setState(() => _hovered = true),
        onExit: (_) => setState(() => _hovered = false),
        child: GestureDetector(
          onTap: widget.onPressed,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 120),
            curve: Curves.easeOut,
            width: _DS.buttonSize,
            height: _DS.buttonSize,
            margin: const EdgeInsets.symmetric(horizontal: 1),
            decoration: BoxDecoration(
              // Card hover shadow rule: only on hover
              color: widget.active
                  ? _DS.accent
                  : _hovered
                      ? _DS.bgCardHover
                      : Colors.transparent,
              borderRadius: BorderRadius.circular(_DS.radiusButton),
              boxShadow: _hovered && !widget.active
                  ? const [
                      BoxShadow(
                        color: Color(0x59000000),
                        blurRadius: 8,
                        offset: Offset(0, 2),
                      ),
                    ]
                  : null,
            ),
            child: Icon(
              widget.icon,
              size: _DS.iconSize,
              color: widget.active
                  ? Colors.white
                  : widget.onPressed != null
                      ? _DS.textSecondary
                      : _DS.textMuted,
            ),
          ),
        ),
      ),
    );
  }
}

// ── Drop area ─────────────────────────────────────────────────────────────────

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
      mainAxisSize: MainAxisSize.min,
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
            onAccept: (t) => onReorderOrInsert(
                incoming: t, atIndex: toolbarTools.length)),
      ],
    );
  }
}

// ── Drop slot ─────────────────────────────────────────────────────────────────

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
          duration: const Duration(milliseconds: 100),
          curve: Curves.easeOut,
          width: hovering ? 12 : 4,
          height: _DS.buttonSize,
          decoration: BoxDecoration(
            color: hovering
                ? _DS.accent.withValues(alpha: 0.7)
                : Colors.transparent,
            borderRadius: BorderRadius.circular(4),
          ),
        );
      },
    );
  }
}

// ── Tool button (icon-only) ───────────────────────────────────────────────────

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
  ConsumerState<_ToolbarToolButton> createState() =>
      _ToolbarToolButtonState();
}

class _ToolbarToolButtonState
    extends ConsumerState<_ToolbarToolButton> {
  bool _hovered = false;

  static const _eraserTools = [
    Tool.softEraser, Tool.hardEraser,
    Tool.objectEraser, Tool.areaEraser,
  ];

  bool get _isPen    => _kPenTools.contains(widget.tool);
  bool get _isEraser => _eraserTools.contains(widget.tool);

  @override
  Widget build(BuildContext context) {
    final def = toolRegistryByTool[widget.tool];
    if (def == null) return const SizedBox.shrink();

    return LongPressDraggable<Tool>(
      data: widget.tool,
      delay: const Duration(milliseconds: 250),
      feedback: Material(
        color: Colors.transparent,
        child: _buildVisual(def, selected: true, dragging: true),
      ),
      childWhenDragging: Opacity(
        opacity: 0.3,
        child: _buildVisual(def, selected: widget.selected),
      ),
      child: MouseRegion(
        onEnter: (_) => setState(() => _hovered = true),
        onExit:  (_) => setState(() => _hovered = false),
        child: GestureDetector(
          onTap: widget.onTap,
          onDoubleTap: widget.onDoubleTap,
          onLongPress: () {
            if (_isPen) {
              _showPenPickerDialog();
            } else if (_isEraser) {
              _showEraserPopup();
            } else {
              widget.onRemove();
            }
          },
          child: _buildVisual(def, selected: widget.selected),
        ),
      ),
    );
  }

  Widget _buildVisual(ToolDefinition def,
      {required bool selected, bool dragging = false}) {
    final bg = selected
        ? _DS.accent
        : _hovered && !dragging
            ? _DS.bgCardHover
            : Colors.transparent;

    final iconColor = selected
        ? Colors.white
        : _hovered
            ? _DS.textPrimary
            : _DS.textSecondary;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 120),
      curve: Curves.easeOut,
      width: _DS.buttonSize,
      height: _DS.buttonSize,
      margin: const EdgeInsets.symmetric(horizontal: 1),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(_DS.radiusButton),
        border: selected
            ? null
            : Border.all(
                color: _hovered ? _DS.borderCard : Colors.transparent,
                width: 1,
              ),
        boxShadow: _hovered && !selected && !dragging
            ? const [
                BoxShadow(
                  color: Color(0x59000000),
                  blurRadius: 8,
                  offset: Offset(0, 2),
                ),
              ]
            : null,
      ),
      child: Tooltip(
        message: '${def.name}\n'
            'Double-tap: ${_isPen ? "pen settings" : _isEraser ? "eraser mode" : "settings"}\n'
            'Long-press: ${_isPen ? "pen picker" : _isEraser ? "eraser mode" : "remove"}',
        waitDuration: const Duration(milliseconds: 700),
        child: Icon(def.icon,
            size: dragging ? _DS.iconSizeSmall : _DS.iconSize,
            color: iconColor),
      ),
    );
  }

  /// Long-press → PenPickerDialog (full pen type selector)
  void _showPenPickerDialog() => showDialog(
        context: context,
        barrierColor: Colors.transparent,
        barrierDismissible: true,
        builder: (_) => const PenPickerDialog(),
      );

  void _showEraserPopup() {
    final box = context.findRenderObject() as RenderBox?;
    if (box == null) return;
    final pos  = box.localToGlobal(Offset.zero);
    final size = box.size;
    showDialog(
      context: context,
      barrierColor: Colors.transparent,
      builder: (_) => EraserPopup(
        position: Offset(pos.dx + size.width / 2, pos.dy),
      ),
    );
  }
}

// ── Mode toggle (icon-only) ───────────────────────────────────────────────────

class _ModeToggle extends StatelessWidget {
  final Tool activeTool;
  final InteractionMode mode;
  final Function(Tool) onSelectTool;

  const _ModeToggle({
    required this.activeTool,
    required this.mode,
    required this.onSelectTool,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 28,
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: const Color(0xFF141414),
        borderRadius: BorderRadius.circular(_DS.radiusButton),
        border: Border.all(color: _DS.borderCard, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _ToggleIcon(
            isSelected: activeTool == Tool.selectObject,
            icon: Icons.open_with_rounded,
            tooltip: 'Move object',
            onTap: () => onSelectTool(Tool.selectObject),
          ),
          const SizedBox(width: 2),
          _ToggleIcon(
            isSelected: activeTool == Tool.select,
            icon: Icons.highlight_alt_rounded,
            tooltip: 'Adjust drawing',
            onTap: () => onSelectTool(Tool.select),
          ),
        ],
      ),
    );
  }
}

class _ToggleIcon extends StatelessWidget {
  final bool isSelected;
  final IconData icon;
  final String tooltip;
  final VoidCallback onTap;

  const _ToggleIcon({
    required this.isSelected,
    required this.icon,
    required this.tooltip,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      waitDuration: const Duration(milliseconds: 600),
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 120),
          curve: Curves.easeOut,
          width: 26,
          height: 22,
          decoration: BoxDecoration(
            color: isSelected ? _DS.accent : Colors.transparent,
            borderRadius: BorderRadius.circular(4),
          ),
          child: Icon(
            icon,
            size: _DS.iconSizeSmall,
            color: isSelected ? Colors.white : _DS.textMuted,
          ),
        ),
      ),
    );
  }
}

// ── Slide navigation (compact) ────────────────────────────────────────────────

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
        _IconBtn(
          icon: Icons.chevron_left_rounded,
          tooltip: 'Previous slide',
          onPressed: onPrev,
        ),
        // Compact slide counter pill
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
          decoration: BoxDecoration(
            color: const Color(0xFF141414),
            borderRadius: BorderRadius.circular(_DS.radiusPill),
            border: Border.all(color: _DS.borderCard, width: 1),
          ),
          child: Text(
            '${slideIndex + 1}/$totalSlides',
            style: const TextStyle(
              fontFamily: _DS.fontFamily,
              fontSize: 10,
              fontWeight: FontWeight.w500,
              color: _DS.textSecondary,
              height: 1.5,
            ),
          ),
        ),
        _IconBtn(
          icon: Icons.chevron_right_rounded,
          tooltip: 'Next slide',
          onPressed: onNext,
        ),
      ],
    );
  }
}