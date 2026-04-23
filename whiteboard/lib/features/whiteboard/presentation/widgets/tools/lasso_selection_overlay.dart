// lib/features/whiteboard/presentation/widgets/tools/lasso_selection_overlay.dart
// Floating selection toolbar + canvas overlay for lasso selection

import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'lasso_tool.dart';
import '../../providers/canvas_provider.dart';
import '../../providers/tool_provider.dart';

// ─── Design Tokens ─────────────────────────────────────────────────────────
class _C {
  static const card    = Color(0xFF1A1A1A);
  static const border  = Color(0xFF252525);
  static const divider = Color(0xFF1E1E1E);
  static const accent  = Color(0xFFFF6B2B);
  static const txtPri  = Color(0xFFEFEFEF);
  static const txtSec  = Color(0xFF888888);
  static const txtMut  = Color(0xFF555555);
  static const danger  = Color(0xFFF44336);
  static const font    = 'Inter';
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Overlay Widget — wraps the entire canvas stack
// Usage: put this in the same Stack as your whiteboard canvas
//
//   Stack(children: [
//     WhiteboardCanvas(),
//     const LassoSelectionOverlay(),   // ← add this
//   ])
// ─────────────────────────────────────────────────────────────────────────────

class LassoSelectionOverlay extends ConsumerStatefulWidget {
  const LassoSelectionOverlay({super.key});

  @override
  ConsumerState<LassoSelectionOverlay> createState() =>
      _LassoSelectionOverlayState();
}

class _LassoSelectionOverlayState
    extends ConsumerState<LassoSelectionOverlay> {
  double _rotation = 0;

  @override
  Widget build(BuildContext context) {
    final lassoState = ref.watch(lassoProvider);
    final toolState = ref.watch(toolNotifierProvider);

    final isSelectionTool = toolState.activeTool == Tool.select ||
        toolState.activeTool == Tool.selectObject ||
        toolState.activeTool == Tool.lassoFreeform ||
        toolState.activeTool == Tool.lassoRect;

    final _selectionBounds = lassoState.currentBounds;

    return Stack(
      children: [
        // ── Canvas overlay (draw lasso + handles) ──────────────────────────
        Positioned.fill(
          child: IgnorePointer(
            // Pass through when user is transforming
            ignoring: lassoState.isDragging ||
                lassoState.isResizing ||
                lassoState.isRotating,
            child: CustomPaint(
              painter: LassoHandlePainter(
                lassoState: lassoState,
                selectionBounds: _selectionBounds,
                rotation: _rotation,
              ),
            ),
          ),
        ),

        // ── Pointer capture for lasso interactions ─────────────────────────
        Positioned.fill(
          child: IgnorePointer(
            ignoring: !isSelectionTool,
            child: Listener(
              behavior: HitTestBehavior.translucent,
              onPointerDown: (e) => _onDown(e.localPosition),
              onPointerMove: (e) => _onMove(e.localPosition),
              onPointerUp: (e) => _onUp(e.localPosition),
            ),
          ),
        ),

        // ── Keyboard shortcut listener ─────────────────────────────────────
        if (lassoState.hasSelection)
          Focus(
            autofocus: true,
            onKeyEvent: (_, event) => _handleKey(event),
            child: const SizedBox.shrink(),
          ),
      ],
    );
  }

  // ── Pointer handlers ───────────────────────────────────────────────────────

  void _onDown(Offset point) {
    final bounds = ref.read(lassoProvider).currentBounds;
    final state = ref.read(lassoProvider);
    
    // Reset rotation for new selection or if starting fresh move
    if (state.activeHandle == SelectHandle.none) {
      setState(() => _rotation = 0);
    }
    
    ref.read(lassoToolHandlerProvider).onPointerDown(point, bounds);
  }

  void _onMove(Offset point) {
    final bounds = ref.read(lassoProvider).currentBounds;
    ref.read(lassoToolHandlerProvider).onPointerMove(point, bounds);
    // Sync local rotation state
    final state = ref.read(lassoProvider);
    if (state.isRotating && state.dragStart != null && bounds != null) {
      final center = bounds.center;
      final startAngle = math.atan2(
        state.dragStart!.dy - center.dy,
        state.dragStart!.dx - center.dx,
      );
      final currAngle = math.atan2(
        point.dy - center.dy,
        point.dx - center.dx,
      );
      setState(() => _rotation += currAngle - startAngle);
    }
  }

  void _onUp(Offset point) {
    ref.read(lassoToolHandlerProvider).onPointerUp(point);
  }

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  // Delete / Ctrl+C / Ctrl+V / Ctrl+D / Escape

  KeyEventResult _handleKey(KeyEvent event) {
    if (event is! KeyDownEvent) return KeyEventResult.ignored;
    final handler = ref.read(lassoToolHandlerProvider);
    final ctrl = HardwareKeyboard.instance.isControlPressed ||
        HardwareKeyboard.instance.isMetaPressed;

    switch (event.logicalKey) {
      case LogicalKeyboardKey.delete:
      case LogicalKeyboardKey.backspace:
        handler.deleteSelected();
        return KeyEventResult.handled;
      case LogicalKeyboardKey.escape:
        ref.read(lassoProvider.notifier).clearSelection();
        return KeyEventResult.handled;
      case LogicalKeyboardKey.keyC:
        if (ctrl) { handler.copySelected(); return KeyEventResult.handled; }
        break;
      case LogicalKeyboardKey.keyV:
        if (ctrl) { handler.paste(); return KeyEventResult.handled; }
        break;
      case LogicalKeyboardKey.keyD:
        if (ctrl) { handler.duplicateSelected(); return KeyEventResult.handled; }
        break;
      case LogicalKeyboardKey.keyA:
        if (ctrl) {
          final canvas = ref.read(canvasNotifierProvider);
          handler.selectAll(
              objects: canvas.objects, strokes: canvas.strokes);
          return KeyEventResult.handled;
        }
        break;
      default:
        break;
    }
    return KeyEventResult.ignored;
  }
}


// ─────────────────────────────────────────────────────────────────────────────
// Floating Toolbar Widget
// ─────────────────────────────────────────────────────────────────────────────

class LassoFloatingToolbar extends ConsumerWidget {
  const LassoFloatingToolbar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final lassoState = ref.watch(lassoProvider);
    if (!lassoState.hasSelection || lassoState.currentBounds == null) {
      return const SizedBox.shrink();
    }

    final bounds = lassoState.currentBounds!;
    final screenSize = MediaQuery.of(context).size;
    final matrix = ref.watch(canvasTransformationProvider);
    
    // Project canvas coordinates to screen coordinates
    final topCenterCanvas = bounds.topCenter;
    final topCenterScreen = MatrixUtils.transformPoint(matrix, topCenterCanvas);
    
    final toolbarW = 340.0;
    final toolbarH = 40.0;
    
    // Position near the top-center of the selection
    final rawX = topCenterScreen.dx - toolbarW / 2;
    final rawY = topCenterScreen.dy - toolbarH - 24; // more gap for handles
    
    final tx = rawX.clamp(8.0, screenSize.width - toolbarW - 8);
    final ty = rawY.clamp(8.0, screenSize.height - toolbarH - 8);

    final count = lassoState.selectedObjectIds.length +
        lassoState.selectedStrokeIndices.length;

    return Positioned(
      left: tx,
      top: ty,
      child: _SelectionToolbar(
        selectionCount: count,
        onDelete: () =>
            ref.read(lassoToolHandlerProvider).deleteSelected(),
        onDuplicate: () =>
            ref.read(lassoToolHandlerProvider).duplicateSelected(),
        onCopy: () =>
            ref.read(lassoToolHandlerProvider).copySelected(),
        onPaste: () =>
            ref.read(lassoToolHandlerProvider).paste(),
        onBringFront: () =>
            ref.read(lassoToolHandlerProvider).bringToFront(),
        onSendBack: () =>
            ref.read(lassoToolHandlerProvider).sendToBack(),
        onFlipH: () =>
            ref.read(lassoToolHandlerProvider).flipHorizontal(),
        onFlipV: () =>
            ref.read(lassoToolHandlerProvider).flipVertical(),
        onLock: () =>
            ref.read(lassoToolHandlerProvider).lockSelected(),
        onDeselect: () =>
            ref.read(lassoProvider.notifier).clearSelection(),
        onColorPick: () => _showColorPicker(context, ref),
        onOpacityChange: (v) =>
            ref.read(lassoToolHandlerProvider).setOpacity(v),
      ),
    );
  }

  void _showColorPicker(BuildContext context, WidgetRef ref) {
    const colors = [
      Color(0xFFE53935), Color(0xFFFF5722), Color(0xFFFF9800),
      Color(0xFFFFD600), Color(0xFF43A047), Color(0xFF00BCD4),
      Color(0xFF2196F3), Color(0xFF3F51B5), Color(0xFF9C27B0),
      Color(0xFF795548), Color(0xFF000000), Color(0xFFFFFFFF),
    ];

    showDialog(
      context: context,
      barrierColor: Colors.transparent,
      builder: (_) => Dialog(
        backgroundColor: Colors.transparent,
        child: Container(
          width: 200,
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: _C.card,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: _C.border),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Fill Color',
                  style: TextStyle(
                    fontFamily: _C.font, fontSize: 11, color: _C.txtSec,
                    fontWeight: FontWeight.w600, letterSpacing: 0.6,
                  )),
              const SizedBox(height: 8),
              Wrap(
                spacing: 6, runSpacing: 6,
                children: colors.map((c) => GestureDetector(
                  onTap: () {
                    ref.read(lassoToolHandlerProvider).setFillColor(c);
                    Navigator.pop(context);
                  },
                  child: Container(
                    width: 28, height: 28,
                    decoration: BoxDecoration(
                      color: c,
                      borderRadius: BorderRadius.circular(5),
                      border: Border.all(
                        color: c == Colors.white ? _C.border : Colors.transparent,
                      ),
                    ),
                  ),
                )).toList(),
              ),
            ],
          ),
        ),
      ),
    );
  }
}



// ─────────────────────────────────────────────────────────────────────────────
// Floating Selection Toolbar
// ─────────────────────────────────────────────────────────────────────────────

class _SelectionToolbar extends StatefulWidget {
  final int selectionCount;
  final VoidCallback onDelete;
  final VoidCallback onDuplicate;
  final VoidCallback onCopy;
  final VoidCallback onPaste;
  final VoidCallback onBringFront;
  final VoidCallback onSendBack;
  final VoidCallback onFlipH;
  final VoidCallback onFlipV;
  final VoidCallback onLock;
  final VoidCallback onDeselect;
  final VoidCallback onColorPick;
  final ValueChanged<double> onOpacityChange;

  const _SelectionToolbar({
    required this.selectionCount,
    required this.onDelete,
    required this.onDuplicate,
    required this.onCopy,
    required this.onPaste,
    required this.onBringFront,
    required this.onSendBack,
    required this.onFlipH,
    required this.onFlipV,
    required this.onLock,
    required this.onDeselect,
    required this.onColorPick,
    required this.onOpacityChange,
  });

  @override
  State<_SelectionToolbar> createState() => _SelectionToolbarState();
}

class _SelectionToolbarState extends State<_SelectionToolbar> {
  bool _showExtra = false;

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 38,
      decoration: BoxDecoration(
        color: _C.card,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: _C.border),
        boxShadow: const [
          BoxShadow(color: Color(0x60000000), blurRadius: 12, offset: Offset(0, 4)),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Count badge
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 8),
            padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
            decoration: BoxDecoration(
              color: _C.accent.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: _C.accent.withValues(alpha: 0.4)),
            ),
            child: Text(
              '${widget.selectionCount} selected',
              style: const TextStyle(
                fontFamily: _C.font, fontSize: 10,
                fontWeight: FontWeight.w600, color: _C.accent, height: 1.4,
              ),
            ),
          ),

          _vd(),

          // Primary actions
          _Btn(icon: Icons.copy_outlined, tip: 'Copy (Ctrl+C)', onTap: widget.onCopy),
          _Btn(icon: Icons.content_paste_outlined, tip: 'Paste (Ctrl+V)', onTap: widget.onPaste),
          _Btn(icon: Icons.control_point_duplicate_outlined, tip: 'Duplicate (Ctrl+D)', onTap: widget.onDuplicate),

          _vd(),

          _Btn(icon: Icons.flip_outlined, tip: 'Flip H', onTap: widget.onFlipH),
          _Btn(icon: Icons.flip_camera_android_outlined, tip: 'Flip V', onTap: widget.onFlipV),

          _vd(),

          _Btn(icon: Icons.flip_to_front_outlined, tip: 'Bring to Front', onTap: widget.onBringFront),
          _Btn(icon: Icons.flip_to_back_outlined, tip: 'Send to Back', onTap: widget.onSendBack),

          _vd(),

          _Btn(icon: Icons.color_lens_outlined, tip: 'Fill Color', onTap: widget.onColorPick),
          _Btn(icon: Icons.lock_outline, tip: 'Lock', onTap: widget.onLock),

          _vd(),

          // Deselect
          _Btn(icon: Icons.deselect_outlined, tip: 'Deselect (Esc)', onTap: widget.onDeselect),

          // Delete — red
          _Btn(
            icon: Icons.delete_outline_rounded,
            tip: 'Delete (Del)',
            onTap: widget.onDelete,
            color: _C.danger,
          ),
        ],
      ),
    );
  }

  Widget _vd() => Container(
        width: 1, height: 20,
        margin: const EdgeInsets.symmetric(horizontal: 2),
        color: _C.divider,
      );
}

class _Btn extends StatefulWidget {
  final IconData icon;
  final String tip;
  final VoidCallback onTap;
  final Color? color;

  const _Btn({required this.icon, required this.tip, required this.onTap, this.color});

  @override
  State<_Btn> createState() => _BtnState();
}

class _BtnState extends State<_Btn> {
  bool _hov = false;

  @override
  Widget build(BuildContext context) {
    final c = widget.color ?? _C.txtSec;
    return MouseRegion(
      onEnter: (_) => setState(() => _hov = true),
      onExit:  (_) => setState(() => _hov = false),
      child: Tooltip(
        message: widget.tip,
        waitDuration: const Duration(milliseconds: 500),
        child: GestureDetector(
          onTap: widget.onTap,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 100),
            width: 32, height: 32,
            margin: const EdgeInsets.symmetric(horizontal: 1),
            decoration: BoxDecoration(
              color: _hov
                  ? (widget.color != null
                      ? widget.color!.withValues(alpha: 0.12)
                      : const Color(0xFF222222))
                  : Colors.transparent,
              borderRadius: BorderRadius.circular(5),
            ),
            child: Icon(widget.icon, size: 16, color: _hov ? c : c.withValues(alpha: 0.8)),
          ),
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Lasso Mode Switcher — compact toggle (put in toolbar area)
// ─────────────────────────────────────────────────────────────────────────────

class LassoModeSwitcher extends ConsumerWidget {
  const LassoModeSwitcher({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final mode = ref.watch(lassoProvider).mode;
    return Container(
      height: 28,
      padding: const EdgeInsets.all(3),
      decoration: BoxDecoration(
        color: const Color(0xFF141414),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: _C.border),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _ModeChip(
            icon: Icons.gesture,
            label: 'Lasso',
            active: mode == LassoMode.freeform,
            onTap: () => ref
                .read(lassoProvider.notifier)
                .setMode(LassoMode.freeform),
          ),
          const SizedBox(width: 2),
          _ModeChip(
            icon: Icons.crop_square_outlined,
            label: 'Rect',
            active: mode == LassoMode.rect,
            onTap: () =>
                ref.read(lassoProvider.notifier).setMode(LassoMode.rect),
          ),
        ],
      ),
    );
  }
}

class _ModeChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool active;
  final VoidCallback onTap;

  const _ModeChip({
    required this.icon, required this.label,
    required this.active, required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 120),
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: active ? _C.accent : Colors.transparent,
          borderRadius: BorderRadius.circular(4),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 12, color: active ? Colors.white : _C.txtSec),
            const SizedBox(width: 4),
            Text(label,
                style: TextStyle(
                  fontFamily: _C.font, fontSize: 10, height: 1.3,
                  fontWeight: active ? FontWeight.w600 : FontWeight.w400,
                  color: active ? Colors.white : _C.txtSec,
                )),
          ],
        ),
      ),
    );
  }
}