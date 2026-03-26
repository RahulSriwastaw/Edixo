import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/presentation/screens/login_screen.dart';
import 'features/whiteboard/presentation/screens/whiteboard_screen.dart';
import 'features/auth/providers/auth_provider.dart';

class EduHubWhiteboardApp extends ConsumerWidget {
  const EduHubWhiteboardApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    return ScreenUtilInit(
      designSize: const Size(1920, 1080),
      builder: (context, child) {
        return MaterialApp(
          title: 'EduHub Digital Whiteboard',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: ThemeMode.light,
          home: authState.when(
            data: (user) => user != null 
                ? const WhiteboardScreen() 
                : const LoginScreen(),
            loading: () => const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            ),
            error: (_, __) => const LoginScreen(),
          ),
        );
      },
    );
  }
}
