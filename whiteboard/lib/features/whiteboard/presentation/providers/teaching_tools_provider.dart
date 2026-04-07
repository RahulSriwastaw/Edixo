// lib/features/whiteboard/presentation/providers/teaching_tools_provider.dart

import 'package:flutter/material.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'teaching_tools_provider.g.dart';

class TeachingToolsState {
  final bool isSpotlightEnabled;
  final bool isIndiaMapEnabled;
  final bool isScreenCoverEnabled;
  final Set<String> activeMathTools; // e.g. {'ruler', 'protractor'}
  final Offset spotlightPosition;
  final double spotlightRadius;

  const TeachingToolsState({
    this.isSpotlightEnabled = false,
    this.isIndiaMapEnabled = false,
    this.isScreenCoverEnabled = false,
    this.activeMathTools = const {},
    this.spotlightPosition = const Offset(960, 540),
    this.spotlightRadius = 200,
  });

  TeachingToolsState copyWith({
    bool? isSpotlightEnabled,
    bool? isIndiaMapEnabled,
    bool? isScreenCoverEnabled,
    Set<String>? activeMathTools,
    Offset? spotlightPosition,
    double? spotlightRadius,
  }) => TeachingToolsState(
    isSpotlightEnabled: isSpotlightEnabled ?? this.isSpotlightEnabled,
    isIndiaMapEnabled: isIndiaMapEnabled ?? this.isIndiaMapEnabled,
    isScreenCoverEnabled: isScreenCoverEnabled ?? this.isScreenCoverEnabled,
    activeMathTools: activeMathTools ?? this.activeMathTools,
    spotlightPosition: spotlightPosition ?? this.spotlightPosition,
    spotlightRadius: spotlightRadius ?? this.spotlightRadius,
  );
}

@riverpod
class TeachingToolsNotifier extends _$TeachingToolsNotifier {
  @override
  TeachingToolsState build() => const TeachingToolsState();

  void toggleSpotlight() => state = state.copyWith(isSpotlightEnabled: !state.isSpotlightEnabled);
  
  void updateSpotlight(Offset pos, double radius) => 
      state = state.copyWith(spotlightPosition: pos, spotlightRadius: radius);

  void toggleIndiaMap() => state = state.copyWith(isIndiaMapEnabled: !state.isIndiaMapEnabled);
  
  void toggleScreenCover() => state = state.copyWith(isScreenCoverEnabled: !state.isScreenCoverEnabled);

  void toggleMathTool(String toolId) {
    final next = Set<String>.from(state.activeMathTools);
    if (next.contains(toolId)) {
      next.remove(toolId);
    } else {
      next.add(toolId);
    }
    state = state.copyWith(activeMathTools: next);
  }

  void closeAll() => state = const TeachingToolsState();
}
