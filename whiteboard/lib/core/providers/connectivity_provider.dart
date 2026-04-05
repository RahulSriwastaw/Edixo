// lib/core/providers/connectivity_provider.dart

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'connectivity_provider.g.dart';

/// Stream of online/offline status. True if connected, false if offline.
@riverpod
Stream<bool> isOnline(IsOnlineRef ref) {
  return Connectivity().onConnectivityChanged.map(
    (results) => results.any((result) => result != ConnectivityResult.none),
  );
}
