// lib/core/providers/auth_provider.dart

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../features/auth/data/models/teacher_model.dart';
import '../storage/secure_storage.dart';

part 'auth_provider.g.dart';

/// Currently authenticated teacher, or null if logged out.
@riverpod
class AuthNotifier extends _$AuthNotifier {
  @override
  TeacherModel? build() => null;

  /// Set authenticated teacher after login
  void setTeacher(TeacherModel teacher) => state = teacher;

  /// Logout: clear teacher and delete tokens
  Future<void> logout() async {
    state = null;
    await ref.read(secureStorageProvider).deleteAll();
  }
}
