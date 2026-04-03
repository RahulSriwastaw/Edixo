
import 'package:flutter/material.dart';

class AppColors {
  // ── Canvas ────────────────────────────────────────────────────────
  static const Color bgPrimary   = Color(0xFF0D0D0D); // canvas background
  static const Color bgSecondary = Color(0xFF1A1A1A); // toolbar background
  static const Color bgPanel     = Color(0xFF242424); // side panels
  static const Color bgCard      = Color(0xFF2C2C2C); // dialogs, cards

  // ── Brand ─────────────────────────────────────────────────────────
  static const Color accentOrange = Color(0xFFF4511E); // active tool, CTA
  static const Color accentYellow = Color(0xFFFFB300); // highlights

  // ── Text ──────────────────────────────────────────────────────────
  static const Color textPrimary   = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFFB0B0B0);
  static const Color textTertiary  = Color(0xFF666666);
  static const Color textDisabled  = Color(0xFF555555);

  // ── Status ────────────────────────────────────────────────────────
  static const Color success = Color(0xFF22C55E);
  static const Color error   = Color(0xFFEF4444);
  static const Color warning = Color(0xFFFACC15);
  static const Color info    = Color(0xFF3B82F6);

  // ── Interactive States ────────────────────────────────────────────
  static const Color toolActive = Color(0x40F4511E); // 25% orange
  static const Color toolHover  = Color(0x20FFFFFF); // 12% white
  static const Color border     = Color(0xFF333333);
  static const Color borderFocus = Color(0xFFF4511E);

  // ── Slide Defaults (coaching aesthetic) ───────────────────────────
  static const Color slideQuestionText = Color(0xFFFFFFFF); // white
  static const Color slideOptionText   = Color(0xFFFFFF00); // yellow
  static const Color slideBg           = Color(0xFF000000); // black
}
