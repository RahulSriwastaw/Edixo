import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_theme_colors.dart';

/// DEPRECATED: Use the new dual-theme system in app.dart instead
/// This file is kept for backward compatibility during migration.
/// The new system uses AppThemeColors.of(context) for dynamic light/dark resolution.
class AppTheme {
  // Brand Colors - now redirected to new system
  static const Color primaryOrange = AppThemeColors.primaryAccent;
  static const Color primaryDark = Color(0xFF0F0F0F);
  static const Color accentBlue = Color(0xFF2196F3);
  static const Color successGreen = Color(0xFF4CAF50);
  static const Color errorRed = Color(0xFFF44336);
  static const Color canvasWhite = Color(0xFFF5F5F5);
  static const Color canvasBlue = Color(0xFFF0F4F8);
  static const Color canvasYellow = Color(0xFFFFD600);
  static const Color canvasDark = Color(0xFF0F0F0F);

  // Category colors from PRD
  static const Color drawColor = Color(0xFFFF6B2B);
  static const Color highlightColor = Color(0xFFFFD600);
  static const Color shapeColor = Color(0xFF2196F3);
  static const Color textColor = Color(0xFF9B59B6);
  static const Color eraserColor = Color(0xFFF44336);
  static const Color measureColor = Color(0xFF1ABC9C);
  static const Color navColor = Color(0xFF888888);

  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: primaryOrange,
      scaffoldBackgroundColor: canvasWhite,
      fontFamily: 'Inter',
      colorScheme: const ColorScheme.light(
        primary: primaryOrange,
        secondary: accentBlue,
        surface: Colors.white,
        error: errorRed,
      ),
      textTheme: GoogleFonts.interTextTheme().copyWith(
        displayLarge: GoogleFonts.inter(fontSize: 32, fontWeight: FontWeight.bold, color: const Color(0xFF111111)),
        headlineMedium: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w700, color: const Color(0xFF111111)),
        titleLarge: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600),
        bodyLarge: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.normal, height: 1.5),
        bodyMedium: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.normal, height: 1.5),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryOrange,
          foregroundColor: Colors.white,
          minimumSize: Size(120.w, 36.h),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6.r)),
          textStyle: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w500),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(6.r), borderSide: const BorderSide(color: Color(0xFFD0D0D0))),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6.r), borderSide: const BorderSide(color: primaryOrange, width: 2)),
        errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6.r), borderSide: const BorderSide(color: errorRed, width: 2)),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: primaryOrange,
      scaffoldBackgroundColor: primaryDark,
      fontFamily: 'Inter',
      colorScheme: const ColorScheme.dark(
        primary: primaryOrange,
        secondary: accentBlue,
        surface: Color(0xFF1A1A1A),
        error: errorRed,
      ),
      textTheme: GoogleFonts.interTextTheme().copyWith(
        displayLarge: GoogleFonts.inter(fontSize: 32, fontWeight: FontWeight.bold, color: const Color(0xFFEFEFEF)),
        headlineMedium: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w700, color: const Color(0xFFEFEFEF)),
        bodyLarge: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.normal, color: const Color(0xFFEFEFEF), height: 1.5),
        bodyMedium: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.normal, color: const Color(0xFF888888), height: 1.5),
      ),
      drawerTheme: const DrawerThemeData(backgroundColor: Color(0xFF141414), elevation: 0),
      appBarTheme: const AppBarTheme(backgroundColor: Color(0xFF141414), elevation: 0),
    );
  }

  static ThemeData get theme => darkTheme;
}
