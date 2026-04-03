// lib/core/storage/hive_service.dart

import 'package:hive_flutter/hive_flutter.dart';

class HiveService {
  static const String sessionsBox = 'sessions';
  static const String slidesBox = 'slides';
  static const String settingsBox = 'settings';
  static const String pendingSyncBox = 'pendingSync';

  /// Initialize all Hive boxes. Call after Hive.initFlutter() in main.dart.
  static Future<void> init() async {
    await Future.wait([
      Hive.openBox('sessions'),
      Hive.openBox('slides'),
      Hive.openBox('settings'),
      Hive.openBox<String>('pendingSync'),
    ]);
  }

  /// Get sessions box
  static Box getSessionsBox() => Hive.box('sessions');

  /// Get slides box
  static Box getSlidesBox() => Hive.box('slides');

  /// Get settings box
  static Box getSettingsBox() => Hive.box('settings');

  /// Get pending sync box (stores JSON payloads awaiting server sync)
  static Box<String> getPendingSyncBox() => Hive.box<String>('pendingSync');

  /// Clear all boxes (use with caution — dev/testing only)
  static Future<void> clearAll() async {
    await Future.wait([
      getSessionsBox().clear(),
      getSlidesBox().clear(),
      getSettingsBox().clear(),
      getPendingSyncBox().clear(),
    ]);
  }
}
