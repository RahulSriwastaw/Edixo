import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/floating_overlay_provider.dart';

class FloatingMovablePanel extends ConsumerWidget {
  final String panelId;
  final Widget child;
  final String title;

  const FloatingMovablePanel({
    super.key,
    required this.panelId,
    required this.child,
    this.title = 'Settings',
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final overlays = ref.watch(floatingOverlayNotifierProvider);
    final panelState = overlays[panelId];

    if (panelState == null) return const SizedBox.shrink();

    return Positioned(
      left: panelState.position.dx,
      top: panelState.position.dy,
      child: GestureDetector(
        onPanUpdate: (details) {
          ref.read(floatingOverlayNotifierProvider.notifier).updatePosition(
            panelId,
            panelState.position + details.delta,
          );
        },
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Container(
              // Allow flexible width/height based on content, but add constraints if needed
              constraints: const BoxConstraints(
                maxWidth: 400, // Maximum width so it doesn't span whole screen
                maxHeight: 700,
              ),
              decoration: BoxDecoration(
                color: const Color(0xFF1A1A1A).withValues(alpha: 0.95),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white24, width: 1),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.5),
                    blurRadius: 15,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: IntrinsicWidth(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Drag header
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: const BoxDecoration(
                        border: Border(bottom: BorderSide(color: Colors.white12, width: 1)),
                        color: Colors.black12, // slightly darker header
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.drag_indicator, color: Colors.white54, size: 20),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              title,
                              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                            ),
                          ),
                          GestureDetector(
                            onTap: () {
                              ref.read(floatingOverlayNotifierProvider.notifier).hidePanel(panelId);
                            },
                            child: const Icon(Icons.close, color: Colors.white54, size: 20),
                          ),
                        ],
                      ),
                    ),
                    // Content
                    Flexible(
                      child: SingleChildScrollView(
                        child: child,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
