import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_theme_colors.dart';

/// AppThemeTextStyles - Typography system with Inter font
/// All text styles are defined as static methods that take BuildContext
/// to resolve theme-aware colors automatically
class AppThemeTextStyles {
  // ── Font Family ───────────────────────────────────────────────────
  static const String fontFamily = 'Inter';

  // ── Helpers ───────────────────────────────────────────────────────
  static TextStyle _style({
    required BuildContext context,
    required double fontSize,
    required FontWeight fontWeight,
    double height = 1.5,
    Color? color,
  }) {
    final theme = AppThemeColors.of(context);
    return GoogleFonts.inter(
      fontSize: fontSize,
      fontWeight: fontWeight,
      height: height,
      color: color ?? theme.textPrimary,
    );
  }

  // ── Page Title: 20px / 700 ────────────────────────────────────────
  static TextStyle pageTitle(BuildContext context) => _style(
        context: context,
        fontSize: 20,
        fontWeight: FontWeight.w700,
      );

  // ── Card Title: 13px / 600 ────────────────────────────────────────
  static TextStyle cardTitle(BuildContext context) => _style(
        context: context,
        fontSize: 13,
        fontWeight: FontWeight.w600,
      );

  // ── Nav Labels: 13px / 400 ────────────────────────────────────────
  static TextStyle navLabel(BuildContext context) => _style(
        context: context,
        fontSize: 13,
        fontWeight: FontWeight.w400,
      );

  // ── Buttons: 13px / 500 ───────────────────────────────────────────
  static TextStyle button(BuildContext context) => _style(
        context: context,
        fontSize: 13,
        fontWeight: FontWeight.w500,
      );

  // ── Body: 13px / 400 (reduced from 14px) ──────────────────────────
  static TextStyle body(BuildContext context) => _style(
        context: context,
        fontSize: 13,
        fontWeight: FontWeight.w400,
      );

  // ── Body Small: 12px / 400 ────────────────────────────────────────
  static TextStyle bodySmall(BuildContext context) => _style(
        context: context,
        fontSize: 12,
        fontWeight: FontWeight.w400,
        color: AppThemeColors.of(context).textSecondary,
      );

  // ── Caption / Meta: 11px / 400 / muted ────────────────────────────
  static TextStyle caption(BuildContext context) => _style(
        context: context,
        fontSize: 11,
        fontWeight: FontWeight.w400,
        color: AppThemeColors.of(context).textMuted,
      );

  // ── Card Meta (email, date): 11px / 400 / muted ───────────────────
  static TextStyle cardMeta(BuildContext context) => _style(
        context: context,
        fontSize: 11,
        fontWeight: FontWeight.w400,
        color: AppThemeColors.of(context).textMuted,
      );

  // ── Section Headers: 11px uppercase, letter-spacing 0.8px ─────────
  static TextStyle sectionHeader(BuildContext context) => _style(
        context: context,
        fontSize: 11,
        fontWeight: FontWeight.w600,
        color: AppThemeColors.of(context).textSecondary,
      ).copyWith(
        letterSpacing: 0.8,
        // uppercase should be applied via .toUpperCase() on text
      );

  // ── Status Pills: 11px ────────────────────────────────────────────
  static TextStyle pill(BuildContext context) => _style(
        context: context,
        fontSize: 11,
        fontWeight: FontWeight.w500,
      );

  // ── Tool Label: 11px / 500 ────────────────────────────────────────
  static TextStyle toolLabel(BuildContext context) => _style(
        context: context,
        fontSize: 11,
        fontWeight: FontWeight.w500,
        color: AppThemeColors.of(context).textSecondary,
      );

  // ── Slide Question: 20px / 700 ────────────────────────────────────
  static TextStyle slideQuestion(BuildContext context) => _style(
        context: context,
        fontSize: 20,
        fontWeight: FontWeight.w700,
        color: AppThemeColors.of(context).slideQuestionText,
      );

  // ── Slide Option: 18px / 600 ──────────────────────────────────────
  static TextStyle slideOption(BuildContext context) => _style(
        context: context,
        fontSize: 18,
        fontWeight: FontWeight.w600,
        color: AppThemeColors.of(context).slideOptionText,
      );

  // ── Hindi: 18px / 500 ─────────────────────────────────────────────
  static TextStyle hindi(BuildContext context) => GoogleFonts.notoSansDevanagari(
        fontSize: 18,
        fontWeight: FontWeight.w500,
        color: AppThemeColors.of(context).textPrimary,
      );

  // ── Legacy heading styles for backward compatibility ──────────────
  static TextStyle heading1(BuildContext context) => _style(
        context: context,
        fontSize: 22,
        fontWeight: FontWeight.w700,
      );

  static TextStyle heading2(BuildContext context) => _style(
        context: context,
        fontSize: 16,
        fontWeight: FontWeight.w600,
      );

  static TextStyle heading3(BuildContext context) => _style(
        context: context,
        fontSize: 14,
        fontWeight: FontWeight.w600,
      );
}
