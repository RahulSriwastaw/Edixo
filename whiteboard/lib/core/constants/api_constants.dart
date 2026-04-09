
class ApiConstants {
  static const String baseUrl = 'http://localhost:4000/api';

  // ── Auth Endpoints ─────────────────────────────────────────────
  static const String teacherLogin = '/auth/login';
  static const String whiteboardLogin = '/auth/whiteboard/login';
  static const String refreshToken = '/auth/refresh';
  static const String logout = '/auth/logout';
  static const String currentTeacher = '/auth/me';
  
  /// Resolves a URL path (absolute or relative) to a full absolute URL
  static String resolveUrl(String path) {
    if (path.isEmpty) return path;
    if (path.startsWith('http')) return path;
    
    // Support file system paths (unlikely in this context but for safety)
    if (path.startsWith('file://')) return path;

    // Relative path from backend (e.g. /uploads/...)
    final String cleanBaseUrl = baseUrl.replaceAll('/api', '');
    return '$cleanBaseUrl${path.startsWith('/') ? path : '/$path'}';
  }
}
