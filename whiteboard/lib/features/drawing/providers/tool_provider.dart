import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../domain/models/drawing_tool.dart';
import '../../whiteboard/providers/canvas_provider.dart';

enum AutoHideDelay { short2s, normal3s, long5s, never }
enum AutoHideStyle { collapse, fade }

// ─── Tool Settings ───────────────────────────────────────────────────────────
class ToolSettings {
  final double thickness;
  final double opacity;
  final Color color;
  final ShapeType? shapeType;
  final bool isFilled;
  final bool isLocked;

  const ToolSettings({
    this.thickness = 2.0,
    this.opacity = 1.0,
    this.color = Colors.black,
    this.shapeType,
    this.isFilled = false,
    this.isLocked = true,
  });

  ToolSettings copyWith({double? thickness, double? opacity, Color? color, ShapeType? shapeType, bool? isFilled, bool? isLocked}) {
    return ToolSettings(
      thickness: thickness ?? this.thickness,
      opacity: opacity ?? this.opacity,
      color: color ?? this.color,
      shapeType: shapeType ?? this.shapeType,
      isFilled: isFilled ?? this.isFilled,
      isLocked: isLocked ?? this.isLocked,
    );
  }
}

// ─── Default settings per tool ──────────────────────────────────────────────
const _defaultSettings = {
  ToolType.pen: ToolSettings(thickness: 2.5, opacity: 1.0, color: Colors.black, isLocked: true),
  ToolType.pencil: ToolSettings(thickness: 2.0, opacity: 0.85, color: Colors.black, isLocked: true),
  ToolType.ballpoint: ToolSettings(thickness: 1.5, opacity: 1.0, color: Colors.black, isLocked: true),
  ToolType.highlighter: ToolSettings(thickness: 16.0, opacity: 0.4, color: Color(0xFFFFD600), isLocked: true),
  ToolType.marker: ToolSettings(thickness: 8.0, opacity: 1.0, color: Colors.black, isLocked: true),
  ToolType.eraser: ToolSettings(thickness: 20.0, opacity: 1.0, color: Colors.white, isLocked: true),
  ToolType.laserPointer: ToolSettings(thickness: 6.0, opacity: 1.0, color: Color(0xFFE74C3C), isLocked: true),
  ToolType.lasso: ToolSettings(thickness: 1.5, opacity: 0.7, color: Color(0xFF4A90D9), isLocked: true),
  ToolType.shapes: ToolSettings(thickness: 2.0, opacity: 1.0, color: Colors.black, shapeType: ShapeType.rectangle, isFilled: false, isLocked: false),
  ToolType.text: ToolSettings(thickness: 14.0, opacity: 1.0, color: Colors.black, isLocked: false),
};

// ─── Drawing State ───────────────────────────────────────────────────────────
class DrawingState {
  final ToolType activeTool;
  final Map<ToolType, ToolSettings> toolSettings;
  final List<Color> recentColors;
  final List<ToolType> favorites;
  final bool autoHideEnabled;
  final AutoHideDelay autoHideDelay;
  final AutoHideStyle autoHideStyle;
  final bool isTeachingMode;

  DrawingState({
    this.activeTool = ToolType.pen,
    Map<ToolType, ToolSettings>? toolSettings,
    List<Color>? recentColors,
    List<ToolType>? favorites,
    this.autoHideEnabled = true,
    this.autoHideDelay = AutoHideDelay.normal3s,
    this.autoHideStyle = AutoHideStyle.fade,
    this.isTeachingMode = false,
  }) : toolSettings = toolSettings ?? Map.from(_defaultSettings),
       recentColors = recentColors ?? [Colors.black, Color(0xFFF4511E), Color(0xFF4A90D9), Color(0xFF10B981), Colors.white],
       favorites = favorites ?? [ToolType.pen, ToolType.highlighter, ToolType.eraser, ToolType.lasso, ToolType.shapes, ToolType.text];

  ToolSettings get currentSettings => toolSettings[activeTool] ?? const ToolSettings();

  DrawingState copyWith({
    ToolType? activeTool,
    Map<ToolType, ToolSettings>? toolSettings,
    List<Color>? recentColors,
    List<ToolType>? favorites,
    bool? autoHideEnabled,
    AutoHideDelay? autoHideDelay,
    AutoHideStyle? autoHideStyle,
    bool? isTeachingMode,
  }) {
    return DrawingState(
      activeTool: activeTool ?? this.activeTool,
      toolSettings: toolSettings ?? this.toolSettings,
      recentColors: recentColors ?? this.recentColors,
      favorites: favorites ?? this.favorites,
      autoHideEnabled: autoHideEnabled ?? this.autoHideEnabled,
      autoHideDelay: autoHideDelay ?? this.autoHideDelay,
      autoHideStyle: autoHideStyle ?? this.autoHideStyle,
      isTeachingMode: isTeachingMode ?? this.isTeachingMode,
    );
  }
}

// ─── Drawing Notifier ────────────────────────────────────────────────────────
class DrawingStateNotifier extends StateNotifier<DrawingState> {
  DrawingStateNotifier() : super(DrawingState());

  void selectTool(ToolType tool) {
    state = state.copyWith(activeTool: tool);
  }

  void setColor(Color color) {
    final toolSettings = Map<ToolType, ToolSettings>.from(state.toolSettings);
    final current = toolSettings[state.activeTool] ?? const ToolSettings();
    toolSettings[state.activeTool] = current.copyWith(color: color);

    // Update recent colors
    final recent = List<Color>.from(state.recentColors);
    recent.remove(color);
    recent.insert(0, color);
    if (recent.length > 8) recent.removeLast();

    state = state.copyWith(toolSettings: toolSettings, recentColors: recent);
  }

  void setThickness(double thickness) {
    final toolSettings = Map<ToolType, ToolSettings>.from(state.toolSettings);
    final current = toolSettings[state.activeTool] ?? const ToolSettings();
    toolSettings[state.activeTool] = current.copyWith(thickness: thickness);
    state = state.copyWith(toolSettings: toolSettings);
  }

  void setOpacity(double opacity) {
    final toolSettings = Map<ToolType, ToolSettings>.from(state.toolSettings);
    final current = toolSettings[state.activeTool] ?? const ToolSettings();
    toolSettings[state.activeTool] = current.copyWith(opacity: opacity);
    state = state.copyWith(toolSettings: toolSettings);
  }

  void setShapeType(ShapeType shapeType) {
    final toolSettings = Map<ToolType, ToolSettings>.from(state.toolSettings);
    final current = toolSettings[state.activeTool] ?? const ToolSettings();
    toolSettings[state.activeTool] = current.copyWith(shapeType: shapeType);
    state = state.copyWith(toolSettings: toolSettings);
  }

  void toggleFavorite(ToolType tool) {
    final favorites = List<ToolType>.from(state.favorites);
    if (favorites.contains(tool)) {
      if (favorites.length > 1) favorites.remove(tool);
    } else {
      if (favorites.length < 6) favorites.add(tool); // PRD: max 6
    }
    state = state.copyWith(favorites: favorites);
  }

  void reorderFavorites(List<ToolType> newOrder) {
    state = state.copyWith(favorites: newOrder.take(6).toList());
  }

  void toggleToolLock(ToolType tool) {
    final toolSettings = Map<ToolType, ToolSettings>.from(state.toolSettings);
    final current = toolSettings[tool] ?? const ToolSettings();
    toolSettings[tool] = current.copyWith(isLocked: !current.isLocked);
    state = state.copyWith(toolSettings: toolSettings);
  }

  void setAutoHide(bool enabled) {
    state = state.copyWith(autoHideEnabled: enabled);
  }

  void setAutoHideDelay(AutoHideDelay delay) {
    state = state.copyWith(autoHideDelay: delay);
  }

  void setAutoHideStyle(AutoHideStyle style) {
    state = state.copyWith(autoHideStyle: style);
  }

  void toggleTeachingMode() {
    state = state.copyWith(isTeachingMode: !state.isTeachingMode);
  }

  void setShapeFilled(bool isFilled) {
    final toolSettings = Map<ToolType, ToolSettings>.from(state.toolSettings);
    final current = toolSettings[state.activeTool] ?? const ToolSettings();
    toolSettings[state.activeTool] = current.copyWith(isFilled: isFilled);
    state = state.copyWith(toolSettings: toolSettings);
  }

  void resetCurrentTool() {
    final toolSettings = Map<ToolType, ToolSettings>.from(state.toolSettings);
    toolSettings[state.activeTool] = _defaultSettings[state.activeTool] ?? const ToolSettings();
    state = state.copyWith(toolSettings: toolSettings);
  }
}

final drawingStateProvider = StateNotifierProvider<DrawingStateNotifier, DrawingState>((ref) {
  return DrawingStateNotifier();
});

// Legacy compat providers
final currentToolProvider = Provider<ToolType>((ref) => ref.watch(drawingStateProvider).activeTool);
final toolSettingsProvider = Provider<Map<ToolType, ToolSettings>>((ref) => ref.watch(drawingStateProvider).toolSettings);
