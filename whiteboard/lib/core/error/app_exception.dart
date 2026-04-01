
import 'package:dio/dio.dart';
import 'failure.dart';

sealed class AppException {
  final String message;
  const AppException(this.message);
}

Failure mapDioException(DioException e) {
  return switch (e.type) {
    DioExceptionType.connectionTimeout => const NetworkFailure("Connection timed out"),
    DioExceptionType.receiveTimeout    => const NetworkFailure("Server took too long"),
    DioExceptionType.badResponse       => switch (e.response?.statusCode) {
      401   => const ServerFailure("Session expired — please log in again"),
      403   => const ServerFailure("You don't have access to this set"),
      404   => const ServerFailure("Set ID not found"),
      422   => const ServerFailure("Incorrect password"),
      500   => const ServerFailure("Server error — your data is saved locally"),
      _     => ServerFailure("Error ${e.response?.statusCode}"),
    },
    _ => const NetworkFailure("No internet connection"),
  };
}
