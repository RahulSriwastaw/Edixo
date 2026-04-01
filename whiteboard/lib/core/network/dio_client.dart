
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../constants/api_constants.dart';
import 'auth_interceptor.dart';
import 'retry_interceptor.dart';

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl:        ApiConstants.baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 30),
    headers:        {'Content-Type': 'application/json'},
  ));

  dio.interceptors.addAll([
    AuthInterceptor(ref),             // JWT attach + 401 auto-refresh
    RetryInterceptor(dio,             // 3× retry on timeout / 5xx
      retries: 3,
      retryDelays: [
        const Duration(seconds: 1),
        const Duration(seconds: 3),
        const Duration(seconds: 5),
      ],
    ),
    if (kDebugMode) LogInterceptor(requestBody: true, responseBody: true),
  ]);

  return dio;
});
