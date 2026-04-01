
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../storage/secure_storage.dart';
import 'dio_client.dart';

class AuthInterceptor extends Interceptor {
  final Ref ref;
  final SecureStorageService _storageService = SecureStorageService();

  AuthInterceptor(this.ref);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    final accessToken = await _storageService.getAccessToken();
    if (accessToken != null) {
      options.headers['Authorization'] = 'Bearer $accessToken';
    }
    super.onRequest(options, handler);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      // If a 401 response is received, refresh the token
      final newAccessToken = await _refreshToken();

      if (newAccessToken != null) {
        // Update the request header with the new token
        err.requestOptions.headers['Authorization'] = 'Bearer $newAccessToken';
        // Repeat the request with the new token
        try {
          handler.resolve(await ref.read(dioProvider).fetch(err.requestOptions));
        } on DioException catch (e) {
          // If the request fails again, pass the error
          handler.next(e);
        }
      } else {
        handler.next(err);
      }
    } else {
      handler.next(err);
    }
  }

  Future<String?> _refreshToken() async {
    try {
      final refreshToken = await _storageService.getRefreshToken();
      if (refreshToken == null) return null;

      final response = await ref.read(dioProvider).post(
        '/auth/refresh',
        data: {'refreshToken': refreshToken},
      );

      final newAccessToken = response.data['accessToken'] as String;
      final newRefreshToken = response.data['refreshToken'] as String;
      await _storageService.saveTokens(accessToken: newAccessToken, refreshToken: newRefreshToken);

      return newAccessToken;
    } catch (e) {
      // If refresh fails, delete tokens and force re-login
      await _storageService.deleteAllTokens();
      return null;
    }
  }
}
