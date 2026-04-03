// lib/features/whiteboard/presentation/providers/tool_provider.dart

import 'package:flutter/material.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'tool_provider.g.dart';

enum Tool {
  // Writing
  softPen, hardPen, highlighter, chalk, calligraphy, spray, laserPointer,
  // Erasing
  softEraser, hardEraser, objectEraser, areaEraser,
  // Shapes
  line, arrow, doubleArrow, rectangle, roundedRect, circle,
  triangle, star, polygon, callout,
  // Text
  textBox, stickyNote,
  // Selection
  select,        // Selects canvas objects (shapes, textboxes)
  selectObject,  // Selects QuestionWidgets on EditableQuestionLayer
  navigate,      // Pan/zoom canvas
  // Special
  magicPen, eyedropper,
}

enum StrokeTip { round, flat, brush }

enum InteractionMode { drawMode, selectMode }

enum SubjectMode { none, math, physics, chemistry, biology, geography, general, englishHindi, sscRailway, upsc }

extension ToolExt on Tool {
  bool get isDrawingTool => const {
    Tool.softPen, Tool.hardPen, Tool.highlighter, Tool.chalk,
    Tool.calligraphy, Tool.spray, Tool.laserPointer,
  }.contains(this);

  bool get isEraserTool => const {
    Tool.softEraser, Tool.hardEraser, Tool.objectEraser, Tool.areaEraser,
  }.contains(this);

  bool get isShapeTool => const {
    Tool.line, Tool.arrow, Tool.doubleArrow, Tool.rectangle, Tool.roundedRect,
    Tool.circle, Tool.triangle, Tool.star, Tool.polygon, Tool.callout,
  }.contains(this);
}

// ── SmoothingSettings ──────────────────────────────────────────────────

class SmoothingSettings {
  final int level;           // 0: Off, 1: Low, 2: Med, 3: High
  final bool taperEnabled;
  final double minWidth;
  final double maxWidth;

  const SmoothingSettings({
    this.level = 2,
    this.taperEnabled = false,
    this.minWidth = 1.0,
    this.maxWidth = 10.0,
  });

  SmoothingSettings copyWith({
    int? level,
    bool? taperEnabled,
    double? minWidth,
    double? maxWidth,
  }) => SmoothingSettings(
    level: level ?? this.level,
    taperEnabled: taperEnabled ?? this.taperEnabled,
    minWidth: minWidth ?? this.minWidth,
    maxWidth: maxWidth ?? this.maxWidth,
  );
}

// ── ToolSettings ─────────────────────────────────────────────────────

class ToolSettings {
  final Color           color;
  final double          strokeWidth;     // 1.0–50.0
  final double          opacity;         // 0.1–1.0
  final double          smoothness;      // 0.0–1.0 (legacy simple smoothing)
  final StrokeTip       tip;
  final SmoothingSettings smoothing;      // New advanced smoothing

  // These were in ToolState but needed here for Riverpod type compatibility
  final Tool            activeTool;
  final InteractionMode interactionMode;
  final SubjectMode     activeMode;
  final List<Tool>      pinnedTools;
  final Map<Tool, ToolSettings> toolSettings;

  const ToolSettings({
    this.color         = const Color(0xFFFFFFFF),
    this.strokeWidth   = 4.0,
    this.opacity       = 1.0,
    this.smoothness    = 0.5,
    this.tip           = StrokeTip.round,
    this.smoothing     = const SmoothingSettings(),
    this.activeTool    = Tool.softPen,
    this.interactionMode = InteractionMode.drawMode,
    this.activeMode    = SubjectMode.none,
    this.pinnedTools   = const [],
    this.toolSettings  = const {},
  });

  ToolSettings copyWith({
    Color?           color,
    double?          strokeWidth,
    double?          opacity,
    double?          smoothness,
    StrokeTip?       tip,
    SmoothingSettings? smoothing,
    Tool?            activeTool,
    InteractionMode? interactionMode,
    SubjectMode?     activeMode,
    List<Tool>?      pinnedTools,
    Map<Tool, ToolSettings>? toolSettings,
  }) => ToolSettings(
    color:           color           ?? this.color,
    strokeWidth:     strokeWidth     ?? this.strokeWidth,
    opacity:         opacity         ?? this.opacity,
    smoothness:      smoothness      ?? this.smoothness,
    tip:             tip             ?? this.tip,
    smoothing:       smoothing       ?? this.smoothing,
    activeTool:      activeTool      ?? this.activeTool,
    interactionMode: interactionMode ?? this.interactionMode,
    activeMode:      activeMode      ?? this.activeMode,
    pinnedTools:     pinnedTools     ?? this.pinnedTools,
    toolSettings:    toolSettings    ?? this.toolSettings,
  );

  // Helper for UI
  ToolSettings settingsFor(Tool tool) => toolSettings[tool] ?? const ToolSettings();
  
  // Compatibility getter
  ToolSettings get currentSettings => toolSettings[activeTool] ?? this;
}

// ── ToolNotifier ──────────────────────────────────────────────────────

@riverpod
class ToolNotifier extends _$ToolNotifier {
  @override
  ToolSettings build() => const ToolSettings(
    toolSettings: {
      Tool.softPen:     ToolSettings(strokeWidth: 4.0, color: Color(0xFFFFFFFF)),
      Tool.highlighter: ToolSettings(strokeWidth: 15.0, color: Color(0xFFFFE66D), opacity: 0.3),
      Tool.softEraser:  ToolSettings(strokeWidth: 20.0),
    },
  );

  void selectTool(Tool tool) {
    final mode = _autoInteractionMode(tool);
    state = state.copyWith(activeTool: tool, interactionMode: mode);
  }

  void setColor(Color color) {
    final newSettings = Map<Tool, ToolSettings>.from(state.toolSettings);
    newSettings[state.activeTool] = state.currentSettings.copyWith(color: color);
    state = state.copyWith(toolSettings: newSettings);
  }

  void setStrokeWidth(double w) {
    final newSettings = Map<Tool, ToolSettings>.from(state.toolSettings);
    newSettings[state.activeTool] = state.currentSettings.copyWith(strokeWidth: w);
    state = state.copyWith(toolSettings: newSettings);
  }

  void setOpacity(double o) {
    final newSettings = Map<Tool, ToolSettings>.from(state.toolSettings);
    newSettings[state.activeTool] = state.currentSettings.copyWith(opacity: o);
    state = state.copyWith(toolSettings: newSettings);
  }

  void setSmoothness(double s) {
    final newSettings = Map<Tool, ToolSettings>.from(state.toolSettings);
    newSettings[state.activeTool] = state.currentSettings.copyWith(smoothness: s);
    state = state.copyWith(toolSettings: newSettings);
  }

  void setTip(StrokeTip tip) {
    final newSettings = Map<Tool, ToolSettings>.from(state.toolSettings);
    newSettings[state.activeTool] = state.currentSettings.copyWith(tip: tip);
    state = state.copyWith(toolSettings: newSettings);
  }

  void setSubjectMode(SubjectMode mode) => state = state.copyWith(activeMode: mode);
  
  void setPinnedTools(List<Tool> tools) => state = state.copyWith(pinnedTools: tools);

  void updateSettings(Tool tool, ToolSettings settings) {
    final newSettings = Map<Tool, ToolSettings>.from(state.toolSettings);
    newSettings[tool] = settings;
    state = state.copyWith(toolSettings: newSettings);
  }

  void toggleInteractionMode() {
    final next = state.interactionMode == InteractionMode.drawMode
        ? InteractionMode.selectMode
        : InteractionMode.drawMode;
    state = state.copyWith(interactionMode: next);
  }

  InteractionMode _autoInteractionMode(Tool tool) {
    if (tool == Tool.select || tool == Tool.selectObject) {
      return InteractionMode.selectMode;
    }
    if (tool.isDrawingTool || tool.isEraserTool || tool.isShapeTool
        || tool == Tool.textBox || tool == Tool.stickyNote) {
      return InteractionMode.drawMode;
    }
    return state.interactionMode;
  }
}
