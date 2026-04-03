// lib/features/auth/data/models/auth_response.dart

import 'teacher_model.dart';

class AuthResponse {
  final String accessToken;
  final String refreshToken;
  final TeacherModel teacher;

  const AuthResponse({
    required this.accessToken,
    required this.refreshToken,
    required this.teacher,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    // If response is wrapped in a 'data' object (typical for our backend)
    final Map<String, dynamic> data = json.containsKey('data') 
        ? json['data'] as Map<String, dynamic> 
        : json;

    return AuthResponse(
      accessToken:  data['accessToken'] as String? ?? '',
      refreshToken: data['refreshToken'] as String? ?? '',
      teacher:      TeacherModel.fromJson(
        (data['user'] ?? data['teacher'] ?? {}) as Map<String, dynamic>
      ),
    );
  }

  Map<String, dynamic> toJson() => {
    'accessToken': accessToken,
    'refreshToken': refreshToken,
    'teacher': teacher.toJson(),
  };
}
