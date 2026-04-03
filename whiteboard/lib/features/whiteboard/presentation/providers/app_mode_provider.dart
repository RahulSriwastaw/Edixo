// lib/features/whiteboard/presentation/providers/app_mode_provider.dart

import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'app_mode_provider.g.dart';

enum AppMode {
  whiteboardFree,     // Blank canvas — no slides — free drawing
  slideMode,          // Set loaded — slides visible — annotation enabled
  annotationFloat,    // Floating toolbar over desktop
  presentationClean,  // Full screen — all UI hidden — student view
  preparationEdit,    // Pre-class — edit question widgets — no annotation
}

@riverpod
class AppModeNotifier extends _$AppModeNotifier {
  @override
  AppMode build() => AppMode.whiteboardFree;

  void setMode(AppMode mode) => state = mode;
  void enterSlideMode()       => state = AppMode.slideMode;
  void enterFreeMode()        => state = AppMode.whiteboardFree;
  void togglePresentation()   => state = state == AppMode.presentationClean
      ? AppMode.slideMode
      : AppMode.presentationClean;
}
