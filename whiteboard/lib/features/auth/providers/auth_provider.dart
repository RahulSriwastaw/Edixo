import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:eduhub_whiteboard/core/api/api_client.dart';
import 'package:eduhub_whiteboard/core/constants/app_constants.dart';

final authProvider = StateNotifierProvider<AuthNotifier, AsyncValue<User?>>((ref) {
  final dio = ref.watch(dioProvider);
  return AuthNotifier(dio);
});

final authNotifierProvider = Provider<AuthNotifier>((ref) {
  return ref.watch(authProvider.notifier);
});

class User {
  final String id;
  final String name;
  final String role;
  final String? email;

  User({required this.id, required this.name, required this.role, this.email});

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['userId'] ?? json['id'] ?? '',
      name: json['name'] ?? 'Teacher',
      role: json['role'] ?? 'teacher',
      email: json['email'],
    );
  }
}

class AuthNotifier extends StateNotifier<AsyncValue<User?>> {
  final Dio _dio;
  final _storage = const FlutterSecureStorage();

  AuthNotifier(this._dio) : super(const AsyncData(null)) {
    _checkStatus();
  }

  Future<void> _checkStatus() async {
    final token = await _storage.read(key: AppConstants.authTokenKey);
    if (token != null) {
      try {
        final response = await _dio.get('/auth/me', 
          options: Options(headers: {'Authorization': 'Bearer $token'}));
        if (response.statusCode == 200 && response.data['success']) {
          state = AsyncData(User.fromJson(response.data['data']));
          return;
        }
      } catch (e) {
        // Silently fail and stay logged out
      }
    }
    state = const AsyncData(null);
  }

  Future<bool> login(String email, String password, {String role = 'ORG_STAFF', String? orgId}) async {
    state = const AsyncLoading();
    try {
      final response = await _dio.post('/auth/login', data: {
        'email': email,
        'password': password,
        'role': role,
        'orgId': orgId,
      });

      if (response.statusCode == 200 && response.data['success']) {
        final token = response.data['data']['accessToken'];
        final refreshToken = response.data['data']['refreshToken'];
        final userData = response.data['data']['user'];
        
        await _storage.write(key: AppConstants.authTokenKey, value: token);
        if (refreshToken != null) {
          await _storage.write(key: AppConstants.refreshTokenKey, value: refreshToken);
        }
        state = AsyncData(User.fromJson(userData));
        return true;
      } else {
        state = AsyncError(response.data['error'] ?? 'Login failed', StackTrace.current);
      }
    } catch (e) {
      state = AsyncError('Connection failed: $e', StackTrace.current);
    }
    return false;
  }

  void loginDev() {
    state = AsyncData(User(id: 'dev_user', name: 'Dev Teacher', role: 'admin'));
  }

  Future<void> logout() async {
    await _storage.delete(key: AppConstants.authTokenKey);
    await _storage.delete(key: AppConstants.refreshTokenKey);
    state = const AsyncData(null);
  }
}
