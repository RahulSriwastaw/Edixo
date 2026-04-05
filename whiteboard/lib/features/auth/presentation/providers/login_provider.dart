
// lib/features/auth/presentation/providers/login_provider.dart

import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/providers/auth_provider.dart';
import '../../../../core/storage/secure_storage.dart';
import '../../../auth/data/datasources/auth_remote_ds.dart';
import '../../../auth/data/models/teacher_model.dart';

part 'login_provider.g.dart';

enum LoginState { initial, loading, success, failure }

class LoginNotifierState {
  final LoginState state;
  final Failure? error;
  final String? debugMessage;

  const LoginNotifierState({
    this.state      = LoginState.initial,
    this.error,
    this.debugMessage,
  });

  LoginNotifierState copyWith({
    LoginState? state,
    Failure?    error,
    String?     debugMessage,
  }) => LoginNotifierState(
    state:         state         ?? this.state,
    error:         error,
    debugMessage:  debugMessage  ?? this.debugMessage,
  );
}

@riverpod
class LoginNotifier extends _$LoginNotifier {
  @override
  LoginNotifierState build() => const LoginNotifierState();

  /// Perform login with username and password.
  /// Stores JWT tokens in SecureStorage and sets auth state on success.
  Future<void> login(String username, String password) async {
    state = state.copyWith(state: LoginState.loading);

    final result = await ref.read(authRemoteDsProvider).login(username, password);

    await result.fold(
      (authResponse) async {
        // Store tokens in secure storage
        await ref.read(secureStorageProvider).writeAccessToken(authResponse.accessToken);
        await ref.read(secureStorageProvider).writeRefreshToken(authResponse.refreshToken);
        
        // Update auth provider with teacher information
        ref.read(authNotifierProvider.notifier).setTeacher(authResponse.teacher);
        
        state = state.copyWith(state: LoginState.success);
      },
      (failure) {
        state = state.copyWith(
          state: LoginState.failure,
          error: failure,
          debugMessage: failure.message,
        );
      },
    );
  }

  /// Perform bypass login for development.
  void devLogin() {
    const dummyTeacher = TeacherModel(
      id: 'dev-123',
      name: 'Dev Teacher',
      email: 'dev@eduhub.com',
      username: 'dev_teacher',
      role: 'teacher',
    );
    ref.read(authNotifierProvider.notifier).setTeacher(dummyTeacher);
    state = state.copyWith(state: LoginState.success);
  }

  void reset() => state = const LoginNotifierState();
}
