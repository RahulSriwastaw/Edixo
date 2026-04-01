
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:eduhub_whiteboard/core/network/dio_client.dart';
import 'package:eduhub_whiteboard/core/storage/secure_storage.dart';
import '../models/teacher_model.dart';

final authRemoteDsProvider = Provider((ref) => AuthRemoteDataSource(ref.watch(dioProvider)));

class AuthRemoteDataSource {
  final Dio _dio;

  AuthRemoteDataSource(this._dio);

  Future<TeacherModel> login(String email, String password) async {
    try {
      final response = await _dio.post(
        '/auth/teacher/login',
        data: {'email': email, 'password': password},
      );
      final accessToken = response.data['accessToken'] as String;
      final refreshToken = response.data['refreshToken'] as String;
      await SecureStorageService().saveTokens(accessToken: accessToken, refreshToken: refreshToken);
      return TeacherModel.fromJson(response.data['teacher']);
    } on DioException {
      // Error handling will be implemented in the repository
      rethrow;
    }
  }
}
