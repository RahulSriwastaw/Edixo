
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/auth_repository.dart';

final authStateProvider = FutureProvider<bool>((ref) async {
  return ref.watch(authRepositoryProvider).isLoggedIn();
});
