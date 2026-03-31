import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:eduhub_whiteboard/core/constants/app_constants.dart';
import 'package:eduhub_whiteboard/core/constants/api_config.dart';

final dioProvider = Provider<Dio>((ref) {
  const storage = FlutterSecureStorage();
  final dio = Dio(
    BaseOptions(
      baseUrl: ApiConfig.baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ),
  );

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await storage.read(key: AppConstants.authTokenKey);
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (error, handler) async {
        // Attempt refresh on 401 once
        if (error.response?.statusCode == 401) {
          final refresh = await storage.read(key: AppConstants.refreshTokenKey);
          if (refresh != null) {
            try {
              final resp = await dio.post('/auth/refresh', data: {'refreshToken': refresh});
              final newToken = resp.data['data']?['accessToken'] as String?;
              final newRefresh = resp.data['data']?['refreshToken'] as String?;
              if (newToken != null) {
                await storage.write(key: AppConstants.authTokenKey, value: newToken);
                if (newRefresh != null) {
                  await storage.write(key: AppConstants.refreshTokenKey, value: newRefresh);
                }
                // retry original
                final opts = error.requestOptions;
                opts.headers['Authorization'] = 'Bearer $newToken';
                final cloneReq = await dio.fetch(opts);
                return handler.resolve(cloneReq);
              }
            } catch (_) {
              // fall through to logout
            }
          }
        }
        return handler.next(error);
      },
    ),
  );

  return dio;
});
