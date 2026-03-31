class AppConstants {
  // API
  static const String baseUrl = 'http://localhost:4000/api';
  static const String apiVersion = 'v1';
  
  // Storage Keys
  static const String authTokenKey = 'auth_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userDataKey = 'user_data';
  static const String rememberMeKey = 'remember_me';
  
  // Canvas
  static const double minZoom = 0.25;
  static const double maxZoom = 4.0;
  static const double defaultZoom = 1.0;
  
  // Auto-save
  static const int localAutoSaveInterval = 30; // seconds
  static const int cloudAutoSaveInterval = 120; // seconds
  
  // Lockout
  static const int maxLoginAttempts = 5;
  static const int lockoutDurationMinutes = 30;
  
  // OTP
  static const int otpLength = 6;
  
  // Tool Defaults
  static const double defaultPenThickness = 2.0;
  static const double defaultHighlighterThickness = 15.0;
  static const double defaultEraserThickness = 20.0;
  
  // Colors
  static const List<int> defaultColors = [
    0xFF000000, // Black
    0xFFE53935, // Red
    0xFF4CAF50, // Green
    0xFF2196F3, // Blue
    0xFFFF9800, // Orange
    0xFF9C27B0, // Purple
    0xFF795548, // Brown
    0xFF607D8B, // Grey
  ];
}
