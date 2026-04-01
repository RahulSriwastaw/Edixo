
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:eduhub_whiteboard/core/error/app_exception.dart';
import 'package:eduhub_whiteboard/core/error/failure.dart';
import 'package:eduhub_whiteboard/core/storage/secure_storage.dart';
import '../data/datasources/auth_remote_ds.dart';
import '../data/models/teacher_model.dart';

final authRepositoryProvider = Provider((ref) => AuthRepository(ref.watch(authRemoteDsProvider), SecureStorageService()));

class AuthRepository {
  final AuthRemoteDataSource _remoteDataSource;
  final SecureStorageService _storageService;

  AuthRepository(this._remoteDataSource, this._storageService);

  Future<({Failure? failure, TeacherModel? teacher})> login(String email, String password) async {
    try {
      final teacher = await _remoteDataSource.login(email, password);
      return (failure: null, teacher: teacher);
    } on DioException catch (e) {
      return (failure: ServerFailure(mapDioException(e).message), teacher: null);
    }
  }

  Future<void> logout() async {
    await _storageService.deleteAllTokens();
  }

  Future<bool> isLoggedIn() async {
    final token = await _storageService.getAccessToken();
    return token != null;
  }
}
