import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:async' show unawaited;
import '../../providers/toolbar_state_provider.dart';
import 'bottom_main_toolbar.dart';

class MovableBottomToolbar extends ConsumerStatefulWidget {
  const MovableBottomToolbar({super.key});

  @override
  ConsumerState<MovableBottomToolbar> createState() => _MovableBottomToolbarState();
}

class _MovableBottomToolbarState extends ConsumerState<MovableBottomToolbar> {
  Offset _dragStartPosition = Offset.zero;
  Offset? _toolbarPosition;
  late Size _screenSize;

  @override
  void initState() {
    super.initState();
  }

  @override
  void dispose() {
    super.dispose();
  }

  void _snapToNearestEdge(Size screenSize) {
    if (_toolbarPosition == null) return;
    final centerX = _toolbarPosition!.dx + 250;
    final centerY = _toolbarPosition!.dy + 28;

    final distToLeft = centerX;
    final distToRight = screenSize.width - centerX;
    final distToTop = centerY;
    final distToBottom = screenSize.height - centerY;

    final minDist = [distToLeft, distToRight, distToTop, distToBottom].reduce((a, b) => a < b ? a : b);

    late Offset snappedPosition;

    if (minDist == distToLeft) {
      snappedPosition = Offset(16, _toolbarPosition!.dy);
    } else if (minDist == distToRight) {
      snappedPosition = Offset(screenSize.width - 516, _toolbarPosition!.dy);
    } else if (minDist == distToTop) {
      snappedPosition = Offset(_toolbarPosition!.dx, 72);
    } else {
      snappedPosition = Offset(_toolbarPosition!.dx, screenSize.height - 100);
    }

    _clampPositionToBounds(screenSize, snappedPosition);
  }

  void _clampPositionToBounds(Size screenSize, Offset position) {
    if (_toolbarPosition == null) return;
    _toolbarPosition = Offset(
      position.dx.clamp(16.0, screenSize.width - 516),
      position.dy.clamp(72.0, screenSize.height - 100),
    );

    unawaited(
      ref.read(toolbarPositionNotifierProvider.notifier).updatePosition(_toolbarPosition!),
    );
  }

  @override
  Widget build(BuildContext context) {
    _screenSize = MediaQuery.of(context).size;
    final toolbarState = ref.watch(toolbarPositionNotifierProvider);

    // Initialize position on first build
    if (_toolbarPosition == null) {
      _toolbarPosition = toolbarState.position != Offset.zero 
        ? toolbarState.position 
        : Offset(
            (_screenSize.width - 500) / 2,
            (_screenSize.height - 100).clamp(72.0, _screenSize.height - 100),
          );
      // Async: save to provider if using default
      if (toolbarState.position == Offset.zero) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (_toolbarPosition != null && mounted) {
            unawaited(
              ref.read(toolbarPositionNotifierProvider.notifier).updatePosition(_toolbarPosition!),
            );
          }
        });
      }
    } else if (_toolbarPosition != toolbarState.position) {
      // Update from state if changed externally
      _toolbarPosition = toolbarState.position;
    }

    final isCollapsed = toolbarState.isCollapsed;

    return Positioned(
      left: _toolbarPosition!.dx,
      top: _toolbarPosition!.dy,
      child: GestureDetector(
        onPanStart: (details) {
          _dragStartPosition = _toolbarPosition!;
        },
        onPanUpdate: (details) {
          setState(() {
            _toolbarPosition = _dragStartPosition + details.delta;
            _clampPositionToBounds(_screenSize, _toolbarPosition!);
          });
        },
        onPanEnd: (details) {
          _snapToNearestEdge(_screenSize);
        },
        child: MouseRegion(
          cursor: SystemMouseCursors.grab,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                curve: Curves.easeInOut,
                width: isCollapsed ? 56 : null,
                height: isCollapsed ? 56 : null,
                decoration: BoxDecoration(
                  color: Colors.black.withValues(alpha: 0.7),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white12, width: 1),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.3),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: isCollapsed
                    ? SizedBox(
                        width: 56,
                        height: 56,
                        child: _buildCollapsedButton(),
                      )
                    : SizedBox(
                        width: 500,
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                          // Drag Handle Header
                          Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            decoration: const BoxDecoration(
                              border: Border(
                                bottom: BorderSide(color: Colors.white12, width: 1),
                              ),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.drag_handle, color: Colors.white54, size: 18),
                                const SizedBox(width: 8),
                                const Expanded(
                                  child: Text(
                                    'Toolbar',
                                    style: TextStyle(
                                      color: Colors.white70,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                                GestureDetector(
                                  onTap: () {
                                    ref.read(toolbarPositionNotifierProvider.notifier).toggleCollapsed();
                                  },
                                  child: Tooltip(
                                    message: 'Collapse toolbar',
                                    child: const Icon(
                                      Icons.expand_more,
                                      color: Colors.white54,
                                      size: 20,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          // Toolbar Content
                          const BottomMainToolbar(),
                        ],
                        ),
                      ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCollapsedButton() {
    return GestureDetector(
      onTap: () {
        ref.read(toolbarPositionNotifierProvider.notifier).toggleCollapsed();
      },
      child: Tooltip(
        message: 'Expand toolbar',
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
          ),
          child: const Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.expand_less,
                color: Colors.white70,
                size: 24,
              ),
              SizedBox(height: 4),
              Icon(
                Icons.drag_handle,
                color: Colors.white54,
                size: 16,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
