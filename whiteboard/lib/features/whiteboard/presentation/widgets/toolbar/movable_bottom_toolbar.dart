import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:async' show unawaited;
import '../../../../../core/theme/app_theme_colors.dart';
import '../../../../../core/theme/app_theme_text_styles.dart';
import '../../../../../core/theme/app_theme_dimensions.dart';
import '../../providers/toolbar_state_provider.dart';
import 'bottom_main_toolbar.dart';

class MovableBottomToolbar extends ConsumerStatefulWidget {
  const MovableBottomToolbar({super.key});

  @override
  ConsumerState<MovableBottomToolbar> createState() =>
      _MovableBottomToolbarState();
}

class _MovableBottomToolbarState extends ConsumerState<MovableBottomToolbar> {
  Offset? _toolbarPosition;
  late Size _screenSize;

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
    final theme = AppThemeColors.of(context);
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
        child: MouseRegion(
          cursor: SystemMouseCursors.grab,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 250),
            curve: Curves.easeInOut,
            width: isCollapsed ? 40 : null,
            height: isCollapsed ? 40 : null,
            decoration: BoxDecoration(
              // Flat matte — no gradient, no white
              color: theme.bgCard,
              borderRadius: BorderRadius.circular(AppThemeDimensions.borderRadiusCard),
              border: Border.all(color: theme.borderCard, width: 1),
              // Shadow only on the widget itself (simulates card-hover rule)
              boxShadow: [
                BoxShadow(
                  color: theme.cardHoverShadow,
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(AppThemeDimensions.borderRadiusCard),
              child: isCollapsed
                  ? SizedBox(
                      width: 40,
                      height: 40,
                      child: _buildCollapsedButton(theme),
                    )
                  : SizedBox(
                      width: 500,
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          // ── Drag Handle Header ─────────────────────────
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(
                                horizontal: AppThemeDimensions.paddingM, vertical: AppThemeDimensions.paddingS),
                            decoration: BoxDecoration(
                              border: Border(
                                bottom: BorderSide(
                                    color: theme.divider, width: 1),
                              ),
                            ),
                            child: Row(
                              children: [
                                Icon(Icons.drag_handle,
                                    color: theme.textMuted, size: 16),
                                const SizedBox(width: 6),
                                Expanded(
                                  child: Text(
                                    'Toolbar',
                                    style: AppThemeTextStyles.cardTitle(context),
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
                                            AppThemeDimensions.borderRadiusButton),
                                        border: Border.all(
                                            color: theme.borderCard, width: 1),
                                      ),
                                      child: Icon(
                                        Icons.expand_more,
                                        color: theme.textSecondary,
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

  Widget _buildCollapsedButton(AppThemeColors theme) {
    return GestureDetector(
      onTap: () => ref
          .read(toolbarPositionNotifierProvider.notifier)
          .toggleCollapsed(),
      child: Tooltip(
        message: 'Expand toolbar',
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppThemeDimensions.borderRadiusCard),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.expand_less, color: AppThemeColors.primaryAccent, size: 20),
              const SizedBox(height: 2),
              Icon(Icons.drag_handle, color: theme.textMuted, size: 14),
            ],
          ),
        ),
      ),
    );
  }
}
