import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'background_settings_provider.g.dart';

class BackgroundSettings {
  final bool enableCustomBackground;
  final String? backgroundImageUrl;
  final double backgroundOpacity;
  final bool stretchBackground;

  const BackgroundSettings({
    this.enableCustomBackground = false,
    this.backgroundImageUrl,
    this.backgroundOpacity = 1.0,
    this.stretchBackground = false,
  });

  BackgroundSettings copyWith({
    bool? enableCustomBackground,
    String? backgroundImageUrl,
    double? backgroundOpacity,
    bool? stretchBackground,
  }) =>
      BackgroundSettings(
        enableCustomBackground: enableCustomBackground ?? this.enableCustomBackground,
        backgroundImageUrl: backgroundImageUrl ?? this.backgroundImageUrl,
        backgroundOpacity: backgroundOpacity ?? this.backgroundOpacity,
        stretchBackground: stretchBackground ?? this.stretchBackground,
      );
}

@riverpod
class BackgroundSettingsNotifier extends _$BackgroundSettingsNotifier {
  @override
  BackgroundSettings build() => const BackgroundSettings();

  void setCustomBackground(String imageUrl) {
    state = state.copyWith(
      backgroundImageUrl: imageUrl,
      enableCustomBackground: true,
    );
  }

  void toggleCustomBackground() {
    state = state.copyWith(
      enableCustomBackground: !state.enableCustomBackground,
    );
  }

  void setBackgroundOpacity(double opacity) {
    state = state.copyWith(
      backgroundOpacity: opacity.clamp(0.0, 1.0),
    );
  }

  void setStretchBackground(bool stretch) {
    state = state.copyWith(
      stretchBackground: stretch,
    );
  }

  void clearBackground() {
    state = state.copyWith(
      backgroundImageUrl: null,
      enableCustomBackground: false,
    );
  }
}
