import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/slide_provider.dart';
import '../providers/app_mode_provider.dart';
import '../../data/models/page_models.dart';

import '../../../question_widget/data/models/set_layout_models.dart';
import '../../../question_widget/presentation/providers/set_layout_notifier.dart';
import 'set_settings_bottom_sheet.dart';
import '../providers/floating_overlay_provider.dart';
import 'overlays/floating_movable_panel.dart';

class SetNavigationToolbar extends ConsumerStatefulWidget {
  const SetNavigationToolbar({super.key});

  @override
  ConsumerState<SetNavigationToolbar> createState() => _SetNavigationToolbarState();
}

class _SetNavigationToolbarState extends ConsumerState<SetNavigationToolbar> {
  late FocusNode _focusNode;

  @override
  void initState() {
    super.initState();
    _focusNode = FocusNode();
  }

  @override
  void dispose() {
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final slideState = ref.watch(slideNotifierProvider);
    if (!slideState.hasSlides) return const SizedBox.shrink();

    final current = slideState.currentPageIndex + 1;
    final total = slideState.pages.length;


    return KeyboardListener(
      focusNode: _focusNode,
      autofocus: true,
      onKeyEvent: (event) {
        if (event is KeyDownEvent) {
          if (event.logicalKey == LogicalKeyboardKey.arrowLeft) {
            _prev(ref);
          } else if (event.logicalKey == LogicalKeyboardKey.arrowRight) {
            _next(ref);
          }
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        margin: const EdgeInsets.only(bottom: 24),
        decoration: BoxDecoration(
          color: const Color(0xFF1E1E1E),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.5),
              blurRadius: 10,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Previous Button
            _NavButton(
              icon: Icons.chevron_left,
              onPressed: current > 1 ? () => _prev(ref) : null,
              tooltip: 'Previous (Left Arrow)',
            ),
            
            const SizedBox(width: 8),
            
            // Progress Indicator
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.black26,
                borderRadius: BorderRadius.circular(12),
              ),
              child: InkWell(
                onTap: () {
                  // Show Jump to Question Grid (future enhancement)
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Jump to Question Grid coming soon!')),
                  );
                },
                child: Text(
                  'Q $current of $total',
                  style: const TextStyle(
                    color: Colors.orange,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              ),
            ),
            
            const SizedBox(width: 8),
            
            // Next Button
            _NavButton(
              icon: Icons.chevron_right,
              onPressed: current < total ? () => _next(ref) : null,
              tooltip: 'Next (Right Arrow)',
            ),

            const VerticalDivider(color: Colors.white12, width: 24),

            // Settings Button
            _NavButton(
              icon: Icons.settings,
              onPressed: () {
                final pageNum = (slideState.currentPage as SetImportPage?)?.slide.questionNumber ?? 1;
                ref.read(floatingOverlayNotifierProvider.notifier).togglePanel(
                  'setSettings',
                  FloatingMovablePanel(
                    panelId: 'setSettings',
                    title: 'Set Styles & Settings',
                    child: SetSettingsPanel(currentQuestionNumber: pageNum),
                  ),
                  initialPosition: const Offset(800, 100),
                );
              },
              tooltip: 'Settings',
            ),

            const SizedBox(width: 8),

            // Exit Button
            _NavButton(
              icon: Icons.close,
              color: Colors.redAccent,
              onPressed: () {
                ref.read(appModeNotifierProvider.notifier).enterFreeMode();
              },

              tooltip: 'Exit Set Mode',
            ),
          ],
        ),
      ),
    );
  }

  void _next(WidgetRef ref) {
    ref.read(slideNotifierProvider.notifier).navigateToSlide(
      ref.read(slideNotifierProvider).currentPageIndex + 1,
    );
  }

  void _prev(WidgetRef ref) {
    ref.read(slideNotifierProvider.notifier).navigateToSlide(
      ref.read(slideNotifierProvider).currentPageIndex - 1,
    );
  }
}


class _NavButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onPressed;
  final String tooltip;
  final Color? color;

  const _NavButton({
    required this.icon,
    this.onPressed,
    required this.tooltip,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onPressed,
          borderRadius: BorderRadius.circular(12),
          child: Container(
            padding: const EdgeInsets.all(10),
            child: Icon(
              icon,
              color: onPressed == null ? Colors.white24 : (color ?? Colors.white70),
              size: 24,
            ),
          ),
        ),
      ),
    );
  }
}
