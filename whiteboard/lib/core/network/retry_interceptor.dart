
import 'package:dio/dio.dart';

/// Retry interceptor — retries failed requests based on error type and count.
///
/// Retries on:
/// - Connection errors (timeout, socket, etc.)
/// - 5xx server errors
/// - Does NOT retry on 4xx client errors or auth errors
class RetryInterceptor extends Interceptor {
  final Dio dio;
  final int retries;
  final List<Duration> retryDelays;
  final Map<String, int> _retryCount = {};

  RetryInterceptor(this.dio, {required this.retries, required this.retryDelays});

  @override
  Future<void> onError(DioException err, ErrorInterceptorHandler handler) async {
    final key = _getRequestKey(err.requestOptions);
    final count = _retryCount[key] ?? 0;

    // Check if we should retry
    if (count < retries && _shouldRetry(err)) {
      _retryCount[key] = count + 1;

      // Wait before retrying
      if (count < retryDelays.length) {
        await Future.delayed(retryDelays[count]);
      }

      try {
        // Retry the request
        final response = await dio.fetch(err.requestOptions);
        _retryCount.remove(key); // Clear retry count on success
        handler.resolve(response);
        return;
      } on DioException catch (e) {
        // If retry also failed, continue error handling
        err = e;
      }
    }

    _retryCount.remove(key);
    handler.next(err);
  }

  /// Determine if error should be retried
  bool _shouldRetry(DioException err) {
    // Retry on connection errors
    if (err.type == DioExceptionType.connectionTimeout ||
        err.type == DioExceptionType.receiveTimeout ||
        err.type == DioExceptionType.unknown) {
      return true;
    }

    // Retry on 5xx server errors
    if (err.response != null && err.response!.statusCode! >= 500) {
      return true;
    }

    return false;
  }

  /// Generate unique key for request (method + path)
  String _getRequestKey(RequestOptions options) =>
    '${options.method}:${options.path}';
}
