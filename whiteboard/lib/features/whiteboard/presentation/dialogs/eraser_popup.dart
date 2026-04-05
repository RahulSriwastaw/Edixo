// lib/features/whiteboard/presentation/dialogs/eraser_popup.dart
// Eraser Mode Selection Popup

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../widgets/tools/eraser_tool.dart';

class EraserPopup extends ConsumerStatefulWidget {
  final Offset position;

  const EraserPopup({
    super.key,
    required this.position,
  });

  @override
  ConsumerState<EraserPopup> createState() => _EraserPopupState();
}

class _EraserPopupState extends ConsumerState<EraserPopup> {
  late EraserMode _selectedMode;

  @override
  void initState() {
    super.initState();
    _selectedMode = ref.read(activEraserModeProvider);
  }

  @override
  Widget build(BuildContext context) {
    final screenSize = MediaQuery.of(context).size;

    // Position popup below the eraser button
    final popupX = widget.position.dx - 120; // Center it
    final popupY = widget.position.dy + 60;

    // Ensure popup doesn't go off screen
    final adjustedX = popupX.clamp(16.0, screenSize.width - 256 - 16);
    final adjustedY = popupY.clamp(16.0, screenSize.height - 400 - 16);

    return Stack(
      children: [
        // Background tap to close
        Positioned.fill(
          child: GestureDetector(
            onTap: () => Navigator.pop(context),
            child: Container(color: Colors.transparent),
          ),
        ),

        // Popup
        Positioned(
          left: adjustedX,
          top: adjustedY,
          child: GestureDetector(
            onTap: () {}, // Prevent closing on inner tap
            child: Container(
              width: 240,
              decoration: BoxDecoration(
                color: const Color(0xFF1A1A1A),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: Colors.white.withValues(alpha: 0.1),
                  width: 1,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.6),
                    blurRadius: 16,
                    spreadRadius: 4,
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Header
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          Colors.red.withValues(alpha: 0.2),
                          Colors.red.withValues(alpha: 0.05),
                        ],
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.delete_outline,
                          color: Colors.red,
                          size: 24,
                        ),
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Eraser',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            Text(
                              'Select mode',
                              style: TextStyle(
                                color: Colors.white.withValues(alpha: 0.5),
                                fontSize: 10,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Mode Buttons
                  Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        ...[
                          EraserMode.pointErase,
                          EraserMode.strokeErase,
                          EraserMode.clearAll,
                        ].map((mode) {
                          final isSelected = mode == _selectedMode;

                          return Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: GestureDetector(
                              onTap: () {
                                setState(() => _selectedMode = mode);
                                ref
                                    .read(activEraserModeProvider.notifier)
                                    .state = mode;

                                if (mode == EraserMode.clearAll) {
                                  // Show confirmation dialog for clear all
                                  _showClearAllConfirmation(context);
                                } else {
                                  Navigator.pop(context);
                                }
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 12,
                                  vertical: 10,
                                ),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(
                                    color: isSelected
                                        ? Colors.red
                                        : Colors.white.withValues(alpha: 0.2),
                                    width: isSelected ? 1.5 : 1,
                                  ),
                                  color: isSelected
                                      ? Colors.red.withValues(alpha: 0.1)
                                      : Colors.white.withValues(alpha: 0.03),
                                ),
                                child: Row(
                                  children: [
                                    Icon(
                                      mode.icon,
                                      color: isSelected
                                          ? Colors.red
                                          : Colors.white70,
                                      size: 18,
                                    ),
                                    const SizedBox(width: 10),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            mode.displayName,
                                            style: TextStyle(
                                              color: isSelected
                                                  ? Colors.red
                                                  : Colors.white,
                                              fontSize: 11,
                                              fontWeight: FontWeight.w600,
                                            ),
                                          ),
                                          Text(
                                            mode.description,
                                            style: TextStyle(
                                              color: Colors.white
                                                  .withValues(alpha: 0.4),
                                              fontSize: 9,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    if (isSelected)
                                      const Icon(
                                        Icons.check_circle,
                                        color: Colors.red,
                                        size: 16,
                                      ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }

  void _showClearAllConfirmation(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        backgroundColor: Colors.transparent,
        child: Container(
          decoration: BoxDecoration(
            color: const Color(0xFF1A1A1A),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: Colors.white.withValues(alpha: 0.1),
            ),
          ),
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.warning_rounded,
                color: Colors.red,
                size: 48,
              ),
              const SizedBox(height: 16),
              const Text(
                'Clear All?',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'This will remove all strokes and objects from the canvas.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.6),
                  fontSize: 12,
                ),
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  TextButton(
                    onPressed: () {
                      Navigator.pop(ctx);
                      Navigator.pop(context);
                    },
                    child: Text(
                      'Cancel',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.7),
                      ),
                    ),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      // Actually clear the canvas
                      ref.read(activEraserModeProvider.notifier).state =
                          EraserMode.clearAll;
                      final handler = EraserToolHandler(ref);
                      handler.clearAll();

                      Navigator.pop(ctx);
                      Navigator.pop(context);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                    ),
                    child: const Text(
                      'Clear All',
                      style: TextStyle(color: Colors.white),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
