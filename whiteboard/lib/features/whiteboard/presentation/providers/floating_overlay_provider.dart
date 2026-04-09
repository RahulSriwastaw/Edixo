import 'package:flutter/material.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'floating_overlay_provider.g.dart';

class FloatingPanelState {
  final String id;
  final Widget child;
  final Offset position;
  final Size? size;

  const FloatingPanelState({
    required this.id,
    required this.child,
    required this.position,
    this.size,
  });

  FloatingPanelState copyWith({
    String? id,
    Widget? child,
    Offset? position,
    Size? size,
  }) {
    return FloatingPanelState(
      id: id ?? this.id,
      child: child ?? this.child,
      position: position ?? this.position,
      size: size ?? this.size,
    );
  }
}

@riverpod
class FloatingOverlayNotifier extends _$FloatingOverlayNotifier {
  @override
  Map<String, FloatingPanelState> build() {
    return {};
  }

  void showPanel(String id, Widget child, {Offset? initialPosition}) {
    // Default to the top-right-ish area, or slightly offset so it is visible but out of the way.
    final pos = initialPosition ?? const Offset(800, 100); 
    state = {
      ...state,
      id: FloatingPanelState(id: id, child: child, position: pos),
    };
  }

  void hidePanel(String id) {
    if (!state.containsKey(id)) return;
    final newState = Map<String, FloatingPanelState>.from(state)..remove(id);
    state = newState;
  }
  
  void togglePanel(String id, Widget child, {Offset? initialPosition}) {
    if (state.containsKey(id)) {
      hidePanel(id);
    } else {
      showPanel(id, child, initialPosition: initialPosition);
    }
  }

  void updatePosition(String id, Offset newPosition) {
    if (!state.containsKey(id)) return;
    state = {
      ...state,
      id: state[id]!.copyWith(position: newPosition),
    };
  }
}
