class ApiConfig {
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:4000/api',
  );

  static const String wsUrl = String.fromEnvironment(
    'WS_WHITEBOARD_URL',
    defaultValue: 'ws://localhost:5000/api/whiteboard/sync',
  );
}
