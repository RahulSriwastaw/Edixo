
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../features/auth/presentation/screens/login_screen.dart';
import '../features/whiteboard/presentation/screens/whiteboard_screen.dart';
import '../features/auth/presentation/providers/auth_provider.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);
  return GoRouter(
    initialLocation: kDebugMode ? '/whiteboard' : '/login',
    redirect: (context, state) {
      final isLoggedIn = authState.asData?.value ?? false;
      if (!isLoggedIn && state.matchedLocation != '/login') {
        return '/login';
      }
      if (isLoggedIn && state.matchedLocation == '/login') {
        return '/whiteboard';
      }
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/whiteboard',
        builder: (context, state) => const WhiteboardScreen(),
      ),
    ],
  );
});
