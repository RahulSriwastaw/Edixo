
// lib/features/auth/data/datasources/auth_remote_ds.dart

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:result_dart/result_dart.dart';
import '../../../../core/constants/api_constants.dart';
import '../../../../core/error/error_handler.dart';
import '../../../../core/error/failure.dart' as failure_types;
import '../../../../core/network/dio_client.dart';
import '../models/teacher_model.dart';
import '../models/auth_response.dart';

// Type alias to avoid naming conflict with result_dart.Failure
typedef AppFailure = failure_types.Failure;

final authRemoteDsProvider = Provider<AuthRemoteDataSource>((ref) {
  return AuthRemoteDataSource(ref.read(dioProvider));
});

class AuthRemoteDataSource {
  final Dio _dio;

  AuthRemoteDataSource(this._dio);

  /// POST /auth/whiteboard/login
  /// Request: { username: string, password: string }
  /// Response: { accessToken, refreshToken, user: {...} }
  Future<Result<AuthResponse, AppFailure>> login(String username, String password) async {
    try {
      final response = await _dio.post(
        ApiConstants.whiteboardLogin,
        data: {
          'username': username,
          'password': password,
        },
      );

      final authResponse = AuthResponse.fromJson(response.data as Map<String, dynamic>);
      return Success(authResponse);
    } on DioException catch (e) {
      return Failure(mapDioException(e));
    } catch (e) {
      return Failure(failure_types.ServerFailure('Unexpected error: $e'));
    }
  }

  /// POST /auth/refresh
  /// Request: { refreshToken: string }
  /// Response: { accessToken, refreshToken }
  Future<Result<Map<String, String>, AppFailure>> refreshToken(String refreshToken) async {
    try {
      final response = await _dio.post(
        ApiConstants.refreshToken,
        data: {'refreshToken': refreshToken},
      );

      return Success({
        'accessToken': response.data['accessToken'] as String,
        'refreshToken': response.data['refreshToken'] as String,
      });
    } on DioException catch (e) {
      return Failure(mapDioException(e));
    } catch (e) {
      return Failure(failure_types.ServerFailure('Unexpected error: $e'));
    }
  }

  /// POST /auth/logout
  Future<Result<bool, AppFailure>> logout() async {
    try {
      await _dio.post(ApiConstants.logout);
      return const Success(true);  // Return true to indicate successful logout
    } on DioException catch (e) {
      return Failure(mapDioException(e));
    } catch (e) {
      return Failure(failure_types.ServerFailure('Unexpected error: $e'));
    }
  }

  /// GET /auth/me
  /// Returns current authenticated teacher's info
  Future<Result<TeacherModel, AppFailure>> getCurrentTeacher() async {
    try {
      final response = await _dio.get(ApiConstants.currentTeacher);
      final payload = response.data as Map<String, dynamic>;
      final teacherJson = payload.containsKey('data')
          ? payload['data'] as Map<String, dynamic>
          : payload;
      final teacher = TeacherModel.fromJson(teacherJson);
      return Success(teacher);
    } on DioException catch (e) {
      return Failure(mapDioException(e));
    } catch (e) {
      return Failure(failure_types.ServerFailure('Unexpected error: $e'));
    }
  }
}
