// lib/core/error/error_handler.dart

import 'package:dio/dio.dart';
import 'failure.dart';

Failure mapDioException(DioException e) {
  return switch (e.type) {
    DioExceptionType.connectionTimeout => const NetworkFailure("Connection timed out"),
    DioExceptionType.receiveTimeout    => const NetworkFailure("Server took too long"),
    DioExceptionType.badResponse       => switch (e.response?.statusCode) {
      401   => const UnauthorizedFailure("Session expired — please log in again"),
      403   => const UnauthorizedFailure("You don't have access to this set"),
      404   => const NotFoundFailure("Set ID not found"),
      422   => const WrongPasswordFailure("Incorrect password"),
      500   => const ServerFailure("Server error — your data is saved locally"),
      _     => ServerFailure("Error ${e.response?.statusCode}"),
    },
    DioExceptionType.unknown => const NetworkFailure("Network error"),
    _ => const NetworkFailure("No internet connection"),
  };
}
