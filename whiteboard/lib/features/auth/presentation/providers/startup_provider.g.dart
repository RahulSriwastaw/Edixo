// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'startup_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$appStartupHash() => r'5bd299c6f4abd4b4f3b281989908eff4ed7828f7';

/// Initializes the app on startup:
/// - Checks for existing access token in SecureStorage
/// - If token exists, validates it and restores teacher session
/// - If no token or validation fails, user starts at login screen
///
/// Copied from [appStartup].
@ProviderFor(appStartup)
final appStartupProvider = AutoDisposeFutureProvider<void>.internal(
  appStartup,
  name: r'appStartupProvider',
  debugGetCreateSourceHash:
      const bool.fromEnvironment('dart.vm.product') ? null : _$appStartupHash,
  dependencies: null,
  allTransitiveDependencies: null,
);

typedef AppStartupRef = AutoDisposeFutureProviderRef<void>;
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member
