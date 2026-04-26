import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';
import 'router/app_router.dart';
import 'features/auth/presentation/providers/startup_provider.dart';
import 'core/theme/theme_provider.dart';
import 'core/theme/app_theme_colors.dart';

class EduBoardApp extends ConsumerWidget {
  const EduBoardApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final startupAsync = ref.watch(appStartupProvider);
    final router = ref.watch(routerProvider);
    final themeMode = ref.watch(themeModeProvider);

    return ScreenUtilInit(
      designSize: const Size(1280, 800),
      minTextAdapt: true,
      splitScreenMode: false,
      builder: (_, __) => MaterialApp.router(
        title: 'EduBoard Pro',
        themeMode: themeMode,
        theme: _buildLightTheme(),
        darkTheme: _buildDarkTheme(),
        routerConfig: router,
        builder: (context, child) {
          return startupAsync.when(
            loading: () => Scaffold(
              backgroundColor: AppThemeColors.of(context).bgBody,
              body: const Center(
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation<Color>(
                    AppThemeColors.primaryAccent,
                  ),
                ),
              ),
            ),
            error: (error, stack) => Scaffold(
              backgroundColor: AppThemeColors.of(context).bgBody,
              body: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline, color: Colors.red, size: 48),
                    const SizedBox(height: 16),
                    Text(
                      'Initialization Error',
                      style: Theme.of(context).textTheme.headlineSmall,
                    ),
                    const SizedBox(height: 8),
                    Text('Error: $error'),
                  ],
                ),
              ),
            ),
            data: (_) => child!,
          );
        },
      ),
    );
  }

  ThemeData _buildLightTheme() {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: AppThemeColors.primaryAccent,
      scaffoldBackgroundColor: const Color(0xFFF5F5F5),
      fontFamily: 'Inter',
      colorScheme: const ColorScheme.light(
        primary: AppThemeColors.primaryAccent,
        secondary: Color(0xFF1565C0),
        surface: Color(0xFFFFFFFF),
        error: Color(0xFFC62828),
      ),
      textTheme: GoogleFonts.interTextTheme(ThemeData.light().textTheme).copyWith(
        displayLarge: GoogleFonts.inter(fontSize: 32, fontWeight: FontWeight.bold, color: const Color(0xFF111111)),
        headlineMedium: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w700, color: const Color(0xFF111111)),
        titleLarge: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: const Color(0xFF111111)),
        bodyLarge: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w400, color: const Color(0xFF111111), height: 1.5),
        bodyMedium: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w400, color: const Color(0xFF555555), height: 1.5),
        labelLarge: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w500, color: const Color(0xFF111111)),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppThemeColors.primaryAccent,
          foregroundColor: Colors.white,
          minimumSize: const Size(120, 36),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
          textStyle: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w500),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: const Color(0xFF111111),
          side: const BorderSide(color: Color(0xFFD0D0D0)),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          textStyle: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w500),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFFFFFFFF),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: const BorderSide(color: Color(0xFFD0D0D0))),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: const BorderSide(color: AppThemeColors.primaryAccent, width: 2)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: const BorderSide(color: Color(0xFFD0D0D0))),
        errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: const BorderSide(color: Color(0xFFC62828), width: 2)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      ),
      cardTheme: const CardThemeData(
        color: Color(0xFFFFFFFF),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(8)),
          side: BorderSide(color: Color(0xFFE0E0E0)),
        ),
        elevation: 0,
      ),
      dividerTheme: const DividerThemeData(color: Color(0xFFE8E8E8), thickness: 1),
      scrollbarTheme: ScrollbarThemeData(
        thumbColor: WidgetStateProperty.all(AppThemeColors.primaryAccent),
        trackColor: WidgetStateProperty.all(const Color(0xFFE0E0E0)),
        thickness: WidgetStateProperty.all(4),
      ),
    );
  }

  ThemeData _buildDarkTheme() {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: AppThemeColors.primaryAccent,
      scaffoldBackgroundColor: const Color(0xFF0F0F0F),
      fontFamily: 'Inter',
      colorScheme: const ColorScheme.dark(
        primary: AppThemeColors.primaryAccent,
        secondary: Color(0xFF2196F3),
        surface: Color(0xFF1A1A1A),
        error: Color(0xFFF44336),
      ),
      textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme).copyWith(
        displayLarge: GoogleFonts.inter(fontSize: 32, fontWeight: FontWeight.bold, color: const Color(0xFFEFEFEF)),
        headlineMedium: GoogleFonts.inter(fontSize: 20, fontWeight: FontWeight.w700, color: const Color(0xFFEFEFEF)),
        titleLarge: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w600, color: const Color(0xFFEFEFEF)),
        bodyLarge: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w400, color: const Color(0xFFEFEFEF), height: 1.5),
        bodyMedium: GoogleFonts.inter(fontSize: 12, fontWeight: FontWeight.w400, color: const Color(0xFF888888), height: 1.5),
        labelLarge: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w500, color: const Color(0xFFEFEFEF)),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppThemeColors.primaryAccent,
          foregroundColor: Colors.white,
          minimumSize: const Size(120, 36),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
          textStyle: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w500),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: const Color(0xFFEFEFEF),
          side: const BorderSide(color: Color(0xFF2A2A2A)),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          textStyle: GoogleFonts.inter(fontSize: 13, fontWeight: FontWeight.w500),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: const Color(0xFF1A1A1A),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: const BorderSide(color: Color(0xFF2A2A2A))),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: const BorderSide(color: AppThemeColors.primaryAccent, width: 2)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: const BorderSide(color: Color(0xFF2A2A2A))),
        errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(6), borderSide: const BorderSide(color: Color(0xFFF44336), width: 2)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      ),
      cardTheme: const CardThemeData(
        color: Color(0xFF1A1A1A),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(8)),
          side: BorderSide(color: Color(0xFF252525)),
        ),
        elevation: 0,
      ),
      dividerTheme: const DividerThemeData(color: Color(0xFF1E1E1E), thickness: 1),
      scrollbarTheme: ScrollbarThemeData(
        thumbColor: WidgetStateProperty.all(AppThemeColors.primaryAccent),
        trackColor: WidgetStateProperty.all(const Color(0xFF2A2A2A)),
        thickness: WidgetStateProperty.all(4),
      ),
      drawerTheme: const DrawerThemeData(backgroundColor: Color(0xFF141414), elevation: 0),
      appBarTheme: const AppBarTheme(backgroundColor: Color(0xFF141414), elevation: 0),
    );
  }
}
