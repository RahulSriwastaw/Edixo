
import 'package:dio/dio.dart';

class RetryInterceptor extends Interceptor {
  final Dio dio;
  final int retries;
  final List<Duration> retryDelays;

  RetryInterceptor(this.dio, {required this.retries, required this.retryDelays});

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    // TODO: Implement retry logic
    super.onError(err, handler);
  }
}
