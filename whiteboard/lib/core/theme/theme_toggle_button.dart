import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'theme_provider.dart';
import 'app_theme_colors.dart';

/// ThemeToggleButton - Sun/Moon icon toggle in the top-right of the header
/// On click: toggles .dark / .light and persists to localStorage
class ThemeToggleButton extends ConsumerWidget {
  final double iconSize;

  const ThemeToggleButton({
    super.key,
    this.iconSize = 20,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeModeProvider);
    final isDark = themeMode == ThemeMode.dark ||
        (themeMode == ThemeMode.system &&
            MediaQuery.platformBrightnessOf(context) == Brightness.dark);

    return IconButton(
      onPressed: () => ref.read(themeModeProvider.notifier).toggleTheme(),
      icon: AnimatedSwitcher(
        duration: const Duration(milliseconds: 200),
        transitionBuilder: (child, animation) {
          return RotationTransition(
            turns: animation,
            child: FadeTransition(
              opacity: animation,
              child: child,
            ),
          );
        },
        child: Icon(
          isDark ? Icons.dark_mode_rounded : Icons.light_mode_rounded,
          key: ValueKey<bool>(isDark),
          size: iconSize,
          color: AppThemeColors.of(context).textPrimary,
        ),
      ),
      tooltip: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      padding: const EdgeInsets.all(6),
      constraints: const BoxConstraints(minWidth: 34, minHeight: 34),
    );
  }
}
