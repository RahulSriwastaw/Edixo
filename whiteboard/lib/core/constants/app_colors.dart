import 'package:flutter/material.dart';
import '../theme/app_theme_colors.dart';

/// DEPRECATED: Use AppThemeColors.of(context) instead
/// This file is kept for backward compatibility during migration.
/// All colors now resolve dynamically based on the current theme (light/dark).
class AppColors {
  // These will return dark theme values by default for non-context usage
  // For proper theming, use AppThemeColors.of(context)

  static const Color bgPrimary   = Color(0xFF0F0F0F);
  static const Color bgSecondary = Color(0xFF141414);
  static const Color bgPanel     = Color(0xFF1A1A1A);
  static const Color bgCard      = Color(0xFF1A1A1A);

  static const Color accentOrange = Color(0xFFFF6B2B);
  static const Color accentYellow = Color(0xFFFFB300);

  static const Color textPrimary   = Color(0xFFEFEFEF);
  static const Color textSecondary = Color(0xFF888888);
  static const Color textTertiary  = Color(0xFF555555);
  static const Color textDisabled  = Color(0xFF555555);

  static const Color success = Color(0xFF4CAF50);
  static const Color error   = Color(0xFFF44336);
  static const Color warning = Color(0xFFFACC15);
  static const Color info    = Color(0xFF2196F3);

  static const Color toolActive = Color(0x40FF6B2B);
  static const Color toolHover  = Color(0x14FFFFFF);
  static const Color border     = Color(0xFF252525);
  static const Color borderFocus = Color(0xFFFF6B2B);

  static const Color slideQuestionText = Color(0xFFFFFFFF);
  static const Color slideOptionText   = Color(0xFFFFFF00);
  static const Color slideBg           = Color(0xFF000000);
}
