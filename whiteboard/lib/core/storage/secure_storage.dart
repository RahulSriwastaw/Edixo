
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final secureStorageProvider = Provider<SecureStorageService>(
  (ref) => SecureStorageService(),
);

class SecureStorageService {
  final _storage = const FlutterSecureStorage();

  /// Read access token from secure storage
  Future<String?> readAccessToken() async =>
    await _storage.read(key: 'access_token');

  /// Read refresh token from secure storage
  Future<String?> readRefreshToken() async =>
    await _storage.read(key: 'refresh_token');

  /// Write access token to secure storage
  Future<void> writeAccessToken(String token) async =>
    await _storage.write(key: 'access_token', value: token);

  /// Write refresh token to secure storage
  Future<void> writeRefreshToken(String token) async =>
    await _storage.write(key: 'refresh_token', value: token);

  /// Delete all tokens from secure storage
  Future<void> deleteAll() async {
    await _storage.delete(key: 'access_token');
    await _storage.delete(key: 'refresh_token');
  }

  /// Legacy method names (for backward compatibility in old code)
  Future<void> saveTokens({required String accessToken, required String refreshToken}) async {
    await writeAccessToken(accessToken);
    await writeRefreshToken(refreshToken);
  }

  Future<String?> getAccessToken() async => await readAccessToken();
  Future<String?> getRefreshToken() async => await readRefreshToken();
  Future<void> deleteAllTokens() async => await deleteAll();
}
