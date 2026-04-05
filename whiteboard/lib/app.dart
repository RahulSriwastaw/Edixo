
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'router/app_router.dart';
import 'features/auth/presentation/providers/startup_provider.dart';
import 'core/constants/app_colors.dart';

class EduBoardApp extends ConsumerWidget {
  const EduBoardApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Wait for app startup (session restoration) to complete
    final startupAsync = ref.watch(appStartupProvider);
    final router = ref.watch(routerProvider);

      return ScreenUtilInit(
        designSize: const Size(1280, 800),
        minTextAdapt: true,
        splitScreenMode: false,
        builder: (_, __) => MaterialApp.router(
          title: 'EduBoard Pro',
          theme: ThemeData.dark(),
          routerConfig: router,
          builder: (context, child) {
            return startupAsync.when(
              loading: () => const Scaffold(
                backgroundColor: AppColors.bgPrimary,
                body: Center(
                  child: CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(
                      AppColors.accentOrange,
                    ),
                  ),
                ),
              ),
              error: (error, stack) => Scaffold(
                backgroundColor: AppColors.bgPrimary,
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
}
