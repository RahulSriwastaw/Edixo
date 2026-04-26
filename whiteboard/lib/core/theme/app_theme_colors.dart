import 'package:flutter/material.dart';

/// AppThemeColors - Dual theme color system
/// All colors are defined as getters that resolve based on brightness
/// Usage: AppThemeColors.of(context).bgBody
class AppThemeColors {
  final Brightness brightness;

  const AppThemeColors._(this.brightness);

  bool get isDark => brightness == Brightness.dark;
  bool get isLight => brightness == Brightness.light;

  static AppThemeColors of(BuildContext context) {
    return AppThemeColors._(Theme.of(context).brightness);
  }

  // ── Primary Accent (same in both themes) ──────────────────────────
  static const Color primaryAccent = Color(0xFFFF6B2B);
  static const Color primaryAccentHover = Color(0xFFE55A1A);

  // ── Body Background ───────────────────────────────────────────────
  Color get bgBody => isDark ? const Color(0xFF0F0F0F) : const Color(0xFFF5F5F5);

  // ── Sidebar Background ────────────────────────────────────────────
  Color get bgSidebar => isDark ? const Color(0xFF141414) : const Color(0xFFFFFFFF);

  // ── Main Content Background ───────────────────────────────────────
  Color get bgMain => isDark ? const Color(0xFF111111) : const Color(0xFFF0F0F0);

  // ── Card / Panel Background ───────────────────────────────────────
  Color get bgCard => isDark ? const Color(0xFF1A1A1A) : const Color(0xFFFFFFFF);

  // ── Card Border ───────────────────────────────────────────────────
  Color get borderCard => isDark ? const Color(0xFF252525) : const Color(0xFFE0E0E0);

  // ── Text Colors ───────────────────────────────────────────────────
  Color get textPrimary => isDark ? const Color(0xFFEFEFEF) : const Color(0xFF111111);
  Color get textSecondary => isDark ? const Color(0xFF888888) : const Color(0xFF555555);
  Color get textMuted => isDark ? const Color(0xFF555555) : const Color(0xFF999999);

  // ── Input Colors ──────────────────────────────────────────────────
  Color get bgInput => isDark ? const Color(0xFF1A1A1A) : const Color(0xFFFFFFFF);
  Color get borderInput => isDark ? const Color(0xFF2A2A2A) : const Color(0xFFD0D0D0);

  // ── Divider ───────────────────────────────────────────────────────
  Color get divider => isDark ? const Color(0xFF1E1E1E) : const Color(0xFFE8E8E8);

  // ── Scrollbar ─────────────────────────────────────────────────────
  Color get scrollbarTrack => isDark ? const Color(0xFF2A2A2A) : const Color(0xFFE0E0E0);
  static const Color scrollbarThumb = Color(0xFFFF6B2B);

  // ── Button Secondary ──────────────────────────────────────────────
  Color get btnSecondaryBorder => isDark ? const Color(0xFF2A2A2A) : const Color(0xFFD0D0D0);
  Color get btnSecondaryText => isDark ? const Color(0xFFEFEFEF) : const Color(0xFF111111);

  // ── Badge Colors ──────────────────────────────────────────────────
  Color get badgeSuccessBg => isDark ? const Color(0xFF1A3A1A) : const Color(0xFFE8F5E9);
  Color get badgeSuccessText => isDark ? const Color(0xFF4CAF50) : const Color(0xFF2E7D32);
  Color get badgeErrorBg => isDark ? const Color(0xFF3A1A1A) : const Color(0xFFFFEBEE);
  Color get badgeErrorText => isDark ? const Color(0xFFF44336) : const Color(0xFFC62828);
  Color get badgeInfoBg => isDark ? const Color(0xFF1A2A3A) : const Color(0xFFE3F2FD);
  Color get badgeInfoText => isDark ? const Color(0xFF2196F3) : const Color(0xFF1565C0);

  // ── Card Hover Shadow ─────────────────────────────────────────────
  Color get cardHoverShadow => isDark
      ? const Color(0x59000000) // rgba(0,0,0,0.35)
      : const Color(0x1F000000); // rgba(0,0,0,0.12)

  // ── Legacy aliases for backward compatibility ─────────────────────
  Color get bgPrimary => bgBody;
  Color get bgSecondary => bgSidebar;
  Color get bgPanel => bgCard;
  Color get accentOrange => primaryAccent;
  Color get accentYellow => const Color(0xFFFFB300);
  Color get success => badgeSuccessText;
  Color get error => badgeErrorText;
  Color get warning => const Color(0xFFFACC15);
  Color get info => badgeInfoText;
  Color get toolActive => primaryAccent.withValues(alpha: 0.25);
  Color get toolHover => isDark ? Colors.white.withValues(alpha: 0.08) : Colors.black.withValues(alpha: 0.06);
  Color get border => borderCard;
  Color get borderFocus => primaryAccent;
  Color get textDisabled => textMuted;
  Color get textTertiary => textMuted;

  // ── Slide Defaults ────────────────────────────────────────────────
  Color get slideQuestionText => isDark ? const Color(0xFFFFFFFF) : const Color(0xFF111111);
  Color get slideOptionText => isDark ? const Color(0xFFFFFF00) : const Color(0xFFFF6B2B);
  Color get slideBg => isDark ? const Color(0xFF000000) : const Color(0xFFFFFFFF);
}
