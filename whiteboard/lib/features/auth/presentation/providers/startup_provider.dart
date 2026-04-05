// lib/features/auth/presentation/providers/startup_provider.dart

import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../../../core/storage/secure_storage.dart';
import '../../../../core/providers/auth_provider.dart';
import '../../../auth/data/datasources/auth_remote_ds.dart';

part 'startup_provider.g.dart';

/// Initializes the app on startup:
/// - Checks for existing access token in SecureStorage
/// - If token exists, validates it and restores teacher session
/// - If no token or validation fails, user starts at login screen
@riverpod
Future<void> appStartup(AppStartupRef ref) async {
  final secureStorage = ref.read(secureStorageProvider);
  final authRemoteDs = ref.read(authRemoteDsProvider);
  final authNotifier = ref.read(authNotifierProvider.notifier);

  try {
    // Try to read existing access token
    final accessToken = await secureStorage.readAccessToken();
    final refreshToken = await secureStorage.readRefreshToken();

    if (accessToken == null || refreshToken == null) {
      // No tokens available, user must login
      return;
    }

    // Token exists, try to validate it by refreshing
    // If refresh fails, tokens are invalid and should be cleared
    final refreshResult = await authRemoteDs.refreshToken(refreshToken);

    await refreshResult.fold(
      (tokens) async {
        // Refresh successful! Update tokens
        await secureStorage.writeAccessToken(tokens['accessToken']!);
        await secureStorage.writeRefreshToken(tokens['refreshToken']!);
        
        // Now load the current teacher info
        final teacherResult = await authRemoteDs.getCurrentTeacher();
        await teacherResult.fold(
          (teacher) {
            // Successfully restored session!
            authNotifier.setTeacher(teacher);
          },
          (failure) async {
            // Failed to get teacher info, clear tokens
            await secureStorage.deleteAll();
          },
        );
      },
      (failure) async {
        // Refresh failed, clear invalid tokens
        await secureStorage.deleteAll();
      },
    );
  } catch (e) {
    // On any error, clear tokens to force re-login
    await secureStorage.deleteAll();
  }
}
