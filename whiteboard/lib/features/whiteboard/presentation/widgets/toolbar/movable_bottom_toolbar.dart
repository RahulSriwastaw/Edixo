import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:async' show unawaited;
import '../../providers/toolbar_state_provider.dart';
import 'bottom_main_toolbar.dart';

// ─── Design Tokens ────────────────────────────────────────────────────────────
class _DS {
  // Colors
  static const bgCard        = Color(0xFF1A1A1A);
  static const borderCard    = Color(0xFF252525);
  static const borderDivider = Color(0xFF1E1E1E);
  static const accent        = Color(0xFFFF6B2B);
  static const textPrimary   = Color(0xFFEFEFEF);
  static const textSecondary = Color(0xFF888888);
  static const textMuted     = Color(0xFF555555);

  // Radii
  static const radiusCard   = 8.0;
  static const radiusButton = 6.0;

  // Typography
  static const fontFamily = 'Inter';

  static const styleNavLabel = TextStyle(
    fontFamily: fontFamily,
    fontSize: 13,
    fontWeight: FontWeight.w400,
    color: textPrimary,
    height: 1.5,
  );

  static const styleCardTitle = TextStyle(
    fontFamily: fontFamily,
    fontSize: 13,
    fontWeight: FontWeight.w600,
    color: textPrimary,
    height: 1.5,
  );

  static const styleMeta = TextStyle(
    fontFamily: fontFamily,
    fontSize: 11,
    fontWeight: FontWeight.w400,
    color: textMuted,
    height: 1.5,
  );
}
// ─────────────────────────────────────────────────────────────────────────────

class MovableBottomToolbar extends ConsumerStatefulWidget {
  const MovableBottomToolbar({super.key});

  @override
  ConsumerState<MovableBottomToolbar> createState() =>
      _MovableBottomToolbarState();
}

class _MovableBottomToolbarState extends ConsumerState<MovableBottomToolbar> {
  Offset? _toolbarPosition;
  late Size _screenSize;

  // ── BUG FIX ────────────────────────────────────────────────────────────────
  // Old code:  _toolbarPosition = _dragStartPosition + details.delta
  //            This only added a single tiny frame-delta to the drag-START
  //            position instead of accumulating deltas, so the toolbar barely
  //            moved and then snapped back.
  //
  // Fix:       Accumulate delta directly onto the CURRENT position each frame.
  //            No need for _dragStartPosition at all.
  // ──────────────────────────────────────────────────────────────────────────

  @override
  void dispose() {
    super.dispose();
  }

  void _snapToNearestEdge(Size screenSize) {
    if (_toolbarPosition == null) return;
    const toolbarW = 500.0;
    const toolbarH = 56.0;

    final centerX = _toolbarPosition!.dx + toolbarW / 2;
    final centerY = _toolbarPosition!.dy + toolbarH / 2;

    final distToLeft   = centerX;
    final distToRight  = screenSize.width - centerX;
    final distToTop    = centerY;
    final distToBottom = screenSize.height - centerY;

    final minDist = [distToLeft, distToRight, distToTop, distToBottom]
        .reduce((a, b) => a < b ? a : b);

    late Offset snapped;
    if (minDist == distToLeft) {
      snapped = Offset(16, _toolbarPosition!.dy);
    } else if (minDist == distToRight) {
      snapped = Offset(screenSize.width - toolbarW - 16, _toolbarPosition!.dy);
    } else if (minDist == distToTop) {
      snapped = Offset(_toolbarPosition!.dx, 72);
    } else {
      snapped = Offset(_toolbarPosition!.dx, screenSize.height - 100);
    }

    _clampAndSave(screenSize, snapped);
  }

  void _clampAndSave(Size screenSize, Offset position) {
    final clamped = Offset(
      position.dx.clamp(16.0, screenSize.width - 516),
      position.dy.clamp(72.0, screenSize.height - 100),
    );
    setState(() => _toolbarPosition = clamped);
    unawaited(
      ref
          .read(toolbarPositionNotifierProvider.notifier)
          .updatePosition(clamped),
    );
  }

  @override
  Widget build(BuildContext context) {
    _screenSize = MediaQuery.of(context).size;
    final toolbarState = ref.watch(toolbarPositionNotifierProvider);

    // Initialise position once
    if (_toolbarPosition == null) {
      _toolbarPosition = toolbarState.position != Offset.zero
          ? toolbarState.position
          : Offset(
              (_screenSize.width - 500) / 2,
              (_screenSize.height - 100).clamp(72.0, _screenSize.height - 100),
            );
      if (toolbarState.position == Offset.zero) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (_toolbarPosition != null && mounted) {
            unawaited(
              ref
                  .read(toolbarPositionNotifierProvider.notifier)
                  .updatePosition(_toolbarPosition!),
            );
          }
        });
      }
    } else if (_toolbarPosition != toolbarState.position &&
        !_isDragging) {
      // Accept external state changes only when not dragging
      _toolbarPosition = toolbarState.position;
    }

    final isCollapsed = toolbarState.isCollapsed;

    return Positioned(
      left: _toolbarPosition!.dx,
      top: _toolbarPosition!.dy,
      child: GestureDetector(
        // ── FIXED: accumulate delta onto current position each frame ──────
        onPanUpdate: (details) {
          setState(() {
            final next = _toolbarPosition! + details.delta;
            _toolbarPosition = Offset(
              next.dx.clamp(16.0, _screenSize.width - 516),
              next.dy.clamp(72.0, _screenSize.height - 100),
            );
          });
        },
        onPanEnd: (_) {
          _isDragging = false;
          _snapToNearestEdge(_screenSize);
        },
        onPanStart: (_) => _isDragging = true,
        // ─────────────────────────────────────────────────────────────────
        child: MouseRegion(
          cursor: SystemMouseCursors.grab,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 250),
            curve: Curves.easeInOut,
            width: isCollapsed ? 44 : null,
            height: isCollapsed ? 44 : null,
            decoration: BoxDecoration(
              // Flat matte — no gradient, no white
              color: _DS.bgCard,
              borderRadius: BorderRadius.circular(_DS.radiusCard),
              border: Border.all(color: _DS.borderCard, width: 1),
              // Shadow only on the widget itself (simulates card-hover rule)
              boxShadow: const [
                BoxShadow(
                  color: Color(0x59000000), // rgba(0,0,0,0.35)
                  blurRadius: 8,
                  offset: Offset(0, 2),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(_DS.radiusCard),
              child: isCollapsed
                  ? SizedBox(
                      width: 44,
                      height: 44,
                      child: _buildCollapsedButton(),
                    )
                  : SizedBox(
                      width: 500,
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          // ── Drag Handle Header ─────────────────────────
                          Container(
                            width: double.infinity,
                            // Padding reduced ~30 %: was 8px v / 12px h → 6px / 8px
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 6),
                            decoration: const BoxDecoration(
                              border: Border(
                                bottom: BorderSide(
                                    color: _DS.borderDivider, width: 1),
                              ),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.drag_handle,
                                    color: _DS.textMuted, size: 16),
                                const SizedBox(width: 6),
                                const Expanded(
                                  child: Text(
                                    'Toolbar',
                                    style: _DS.styleCardTitle,
                                  ),
                                ),
                                GestureDetector(
                                  onTap: () => ref
                                      .read(toolbarPositionNotifierProvider
                                          .notifier)
                                      .toggleCollapsed(),
                                  child: Tooltip(
                                    message: 'Collapse toolbar',
                                    child: Container(
                                      width: 24,
                                      height: 24,
                                      decoration: BoxDecoration(
                                        color: Colors.transparent,
                                        borderRadius: BorderRadius.circular(
                                            _DS.radiusButton),
                                        border: Border.all(
                                            color: _DS.borderCard, width: 1),
                                      ),
                                      child: const Icon(
                                        Icons.expand_more,
                                        color: _DS.textSecondary,
                                        size: 16,
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          // ── Toolbar Content ────────────────────────────
                          const BottomMainToolbar(),
                        ],
                      ),
                    ),
            ),
          ),
        ),
      ),
    );
  }

  bool _isDragging = false;

  Widget _buildCollapsedButton() {
    return GestureDetector(
      onTap: () => ref
          .read(toolbarPositionNotifierProvider.notifier)
          .toggleCollapsed(),
      child: Tooltip(
        message: 'Expand toolbar',
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(_DS.radiusCard),
          ),
          child: const Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.expand_less, color: _DS.accent, size: 20),
              SizedBox(height: 2),
              Icon(Icons.drag_handle, color: _DS.textMuted, size: 14),
            ],
          ),
        ),
      ),
    );
  }
}