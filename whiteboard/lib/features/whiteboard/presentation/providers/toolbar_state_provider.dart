import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ToolbarPositionState {
  final Offset position;
  final bool isCollapsed;

  const ToolbarPositionState({
    required this.position,
    this.isCollapsed = false,
  });

  ToolbarPositionState copyWith({
    Offset? position,
    bool? isCollapsed,
  }) {
    return ToolbarPositionState(
      position: position ?? this.position,
      isCollapsed: isCollapsed ?? this.isCollapsed,
    );
  }

  // Serialize to String for local storage
  String toJson() {
    return '${position.dx},${position.dy},$isCollapsed';
  }

  // Deserialize from String
  static ToolbarPositionState fromJson(String json) {
    try {
      final parts = json.split(',');
      if (parts.length >= 3) {
        final dx = double.parse(parts[0]);
        final dy = double.parse(parts[1]);
        final isCollapsed = parts[2] == 'true';
        return ToolbarPositionState(
          position: Offset(dx, dy),
          isCollapsed: isCollapsed,
        );
      }
    } catch (e) {
      // Return default if parsing fails
    }
    return const ToolbarPositionState(
      position: Offset(0, 0),
      isCollapsed: false,
    );
  }

  // Default position at bottom center
  static const defaultPosition = Offset(0, 0); // Will be calculated at runtime
}

class ToolbarPositionNotifier extends StateNotifier<ToolbarPositionState> {
  static const String _storageKey = 'toolbar_position_state';

  ToolbarPositionNotifier() : super(const ToolbarPositionState(position: Offset(0, 0))) {
    _loadToolbarState();
  }

  Future<void> _loadToolbarState() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedState = prefs.getString(_storageKey);
      if (savedState != null) {
        state = ToolbarPositionState.fromJson(savedState);
      }
    } catch (e) {
      debugPrint('Error loading toolbar state: $e');
    }
  }

  Future<void> _saveToolbarState(ToolbarPositionState newState) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_storageKey, newState.toJson());
    } catch (e) {
      debugPrint('Error saving toolbar state: $e');
    }
  }

  Future<void> updatePosition(Offset newPosition) async {
    final updatedState = state.copyWith(position: newPosition);
    state = updatedState;
    await _saveToolbarState(updatedState);
  }

  Future<void> toggleCollapsed() async {
    final updatedState = state.copyWith(isCollapsed: !state.isCollapsed);
    state = updatedState;
    await _saveToolbarState(updatedState);
  }

  Future<void> setCollapsed(bool collapsed) async {
    final updatedState = state.copyWith(isCollapsed: collapsed);
    state = updatedState;
    await _saveToolbarState(updatedState);
  }

  Future<void> resetPosition() async {
    const defaultState = ToolbarPositionState(position: Offset(0, 0));
    state = defaultState;
    await _saveToolbarState(defaultState);
  }
}

final toolbarPositionNotifierProvider = StateNotifierProvider<
    ToolbarPositionNotifier,
    ToolbarPositionState>((ref) {
  return ToolbarPositionNotifier();
});
