
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/auth_repository.dart';
import '../../data/models/teacher_model.dart';
import 'package:eduhub_whiteboard/core/error/failure.dart';

final loginProvider = StateNotifierProvider<LoginNotifier, LoginState>((ref) {
  return LoginNotifier(ref.watch(authRepositoryProvider));
});

class LoginNotifier extends StateNotifier<LoginState> {
  final AuthRepository _authRepository;

  LoginNotifier(this._authRepository) : super(const LoginState.initial());

  Future<void> login(String email, String password) async {
    state = const LoginState.loading();
    final result = await _authRepository.login(email, password);
    if (result.teacher != null) {
      state = LoginState.success(result.teacher!);
    } else {
      state = LoginState.error(result.failure!);
    }
  }
}

class LoginState {
  final bool isLoading;
  final TeacherModel? teacher;
  final Failure? failure;

  const LoginState({this.isLoading = false, this.teacher, this.failure});

  const LoginState.initial() : this();
  const LoginState.loading() : this(isLoading: true);
  const LoginState.success(TeacherModel teacher) : this(teacher: teacher);
  const LoginState.error(Failure failure) : this(failure: failure);
}
