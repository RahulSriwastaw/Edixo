
class ApiConstants {
  static const String baseUrl = 'http://localhost:4000/api';

  // ── Auth Endpoints ─────────────────────────────────────────────
  static const String teacherLogin = '/auth/login';
  static const String whiteboardLogin = '/auth/whiteboard/login';
  static const String refreshToken = '/auth/refresh';
  static const String logout = '/auth/logout';
  static const String currentTeacher = '/auth/me';
}
