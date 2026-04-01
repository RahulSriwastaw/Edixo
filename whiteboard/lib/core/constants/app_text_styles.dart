
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

class AppTextStyles {
  static TextStyle heading1 = GoogleFonts.dmSans(
    fontSize: 24, fontWeight: FontWeight.w700, color: AppColors.textPrimary);

  static TextStyle heading2 = GoogleFonts.dmSans(
    fontSize: 18, fontWeight: FontWeight.w600, color: AppColors.textPrimary);

  static TextStyle body = GoogleFonts.dmSans(
    fontSize: 14, fontWeight: FontWeight.w400, color: AppColors.textPrimary);

  static TextStyle bodySmall = GoogleFonts.dmSans(
    fontSize: 12, fontWeight: FontWeight.w400, color: AppColors.textSecondary);

  static TextStyle toolLabel = GoogleFonts.dmSans(
    fontSize: 11, fontWeight: FontWeight.w500, color: AppColors.textSecondary);

  static TextStyle slideQuestion = GoogleFonts.dmSans(
    fontSize: 22, fontWeight: FontWeight.w700,
    color: AppColors.slideQuestionText, height: 1.5);

  static TextStyle slideOption = GoogleFonts.dmSans(
    fontSize: 20, fontWeight: FontWeight.w600, color: AppColors.slideOptionText);

  static TextStyle hindi = GoogleFonts.notoSansDevanagari(
    fontSize: 20, fontWeight: FontWeight.w500, color: AppColors.textPrimary);
}
