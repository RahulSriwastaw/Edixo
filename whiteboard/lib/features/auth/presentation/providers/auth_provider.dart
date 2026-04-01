
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../domain/auth_repository.dart';

final authStateProvider = FutureProvider<bool>((ref) async {
  // Bypassing login screen for faster testing during development
  if (kDebugMode) return true;
  
  return ref.watch(authRepositoryProvider).isLoggedIn();
});
