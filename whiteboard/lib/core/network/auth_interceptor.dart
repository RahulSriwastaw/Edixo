
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../constants/api_constants.dart';
import '../storage/secure_storage.dart';
import 'dio_client.dart';

/// Interceptor for JWT token management.
///
/// Responsibilities:
/// 1. Attach JWT to all requests (onRequest)
/// 2. Auto-refresh 401 responses and retry (onError)
/// 3. Logout user on refresh failure
class AuthInterceptor extends Interceptor {
  final Ref _ref;

  AuthInterceptor(this._ref);

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final storage = _ref.read(secureStorageProvider);
    final token = await storage.readAccessToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode == 401) {
      final refreshed = await _tryRefresh();
      if (refreshed) {
        // Retry original request with new token
        final storage = _ref.read(secureStorageProvider);
        final token = await storage.readAccessToken();
        err.requestOptions.headers['Authorization'] = 'Bearer $token';
        try {
          final dio = _ref.read(dioProvider);
          final response = await dio.fetch(err.requestOptions);
          handler.resolve(response);
          return;
        } catch (_) {
          // Retry also failed
        }
      }
      // Refresh failed — logout user
      // TODO: Trigger logout via authProvider.notifier.logout()
    }
    handler.next(err);
  }

  /// Attempt to refresh access token using refresh token.
  /// Returns true on success, false on failure.
  Future<bool> _tryRefresh() async {
    try {
      final storage = _ref.read(secureStorageProvider);
      final refreshToken = await storage.readRefreshToken();
      if (refreshToken == null) return false;

      // Use bare Dio to avoid infinite interceptor loop
      final bare = Dio();
      final res = await bare.post(
        ApiConstants.baseUrl + ApiConstants.refreshToken,
        data: {'refreshToken': refreshToken},
      );

      final newAccessToken = res.data['accessToken'] as String;
      final newRefreshToken = res.data['refreshToken'] as String;
      await storage.writeAccessToken(newAccessToken);
      await storage.writeRefreshToken(newRefreshToken);
      return true;
    } catch (_) {
      return false;
    }
  }
}
