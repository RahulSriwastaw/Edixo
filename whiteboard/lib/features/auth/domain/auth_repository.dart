// lib/features/auth/domain/auth_repository.dart

import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../data/datasources/auth_remote_ds.dart';

part 'auth_repository.g.dart';

class AuthRepository {
  final AuthRemoteDataSource remoteDataSource;

  AuthRepository({required this.remoteDataSource});

  Future<bool> isLoggedIn() async {
    // Check if user has valid tokens stored
    // For now, return true to bypass during development
    return true;
  }

  Future<void> logout() async {
    await remoteDataSource.logout();
  }
}

@riverpod
AuthRepository authRepository(AuthRepositoryRef ref) {
  return AuthRepository(
    remoteDataSource: ref.watch(authRemoteDsProvider),
  );
}
