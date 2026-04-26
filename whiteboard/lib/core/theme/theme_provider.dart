import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Theme mode provider - manages light/dark theme switching
/// Persists to localStorage (SharedPreferences) and respects prefers-color-scheme
final themeModeProvider = StateNotifierProvider<ThemeModeNotifier, ThemeMode>((ref) {
  return ThemeModeNotifier();
});

class ThemeModeNotifier extends StateNotifier<ThemeMode> {
  static const String _storageKey = 'theme';
  bool _initialized = false;

  ThemeModeNotifier() : super(ThemeMode.dark) {
    _loadTheme();
  }

  Future<void> _loadTheme() async {
    if (_initialized) return;
    _initialized = true;

    final prefs = await SharedPreferences.getInstance();
    final savedTheme = prefs.getString(_storageKey);

    if (savedTheme != null) {
      // localStorage takes priority
      state = savedTheme == 'light' ? ThemeMode.light : ThemeMode.dark;
    } else {
      // Fall back to prefers-color-scheme (system)
      state = ThemeMode.system;
    }
  }

  Future<void> toggleTheme() async {
    final prefs = await SharedPreferences.getInstance();

    ThemeMode newMode;
    if (state == ThemeMode.light) {
      newMode = ThemeMode.dark;
      await prefs.setString(_storageKey, 'dark');
    } else {
      newMode = ThemeMode.light;
      await prefs.setString(_storageKey, 'light');
    }

    state = newMode;
  }

  Future<void> setDarkMode() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_storageKey, 'dark');
    state = ThemeMode.dark;
  }

  Future<void> setLightMode() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_storageKey, 'light');
    state = ThemeMode.light;
  }
}

/// Extension to get current brightness from ThemeMode
extension ThemeModeBrightness on ThemeMode {
  Brightness resolveBrightness(BuildContext context) {
    switch (this) {
      case ThemeMode.light:
        return Brightness.light;
      case ThemeMode.dark:
        return Brightness.dark;
      case ThemeMode.system:
        return MediaQuery.platformBrightnessOf(context);
    }
  }
}
