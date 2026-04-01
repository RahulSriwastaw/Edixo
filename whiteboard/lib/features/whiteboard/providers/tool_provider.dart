import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

enum SubjectMode {
  general, math, physics, chemistry, englishHindi, sscRailway, upsc
}

enum ToolType {
  pen, eraser, shape, text, select, other
}

enum Tool {
  // Writing
  softPen, 
  hardPen, 
  highlighter, 
  chalk,
  calligraphy,
  spray,
  laserPointer,
  
  // Erasing
  softEraser, 
  hardEraser, 
  objectEraser, 
  areaEraser,
  
  // Shapes
  line, 
  arrow, 
  doubleArrow,
  rectangle, 
  roundedRect,
  circle, 
  triangle, 
  star,
  polygon,
  callout,

  // Text
  textBox, 
  stickyNote,

  // Selection
  select,       // selects canvas objects (shapes, textboxes)
  selectObject, // selects QuestionWidgets on EditableQuestionLayer
  navigate,     // enables InteractiveViewer pan/zoom

  // Special
  magicPen,
  eyedropper,
}

enum InteractionMode { drawMode, selectMode }

enum ShapeType {
  line, arrow, doubleArrow, rectangle, roundedRect, roundedRectangle,
  circle, ellipse, triangle, diamond, star, polygon, callout, speechBubble
}

enum StrokeTip { round, flat, brush }

class SmoothingSettings {
  final int level; // 0, 1, 2, 3
  final bool taperEnabled;
  final double minWidth;
  final double maxWidth;
  final double decimationThreshold;

  const SmoothingSettings({
    this.level = 1,
    this.taperEnabled = false,
    this.minWidth = 1.0,
    this.maxWidth = 10.0,
    this.decimationThreshold = 0.5,
  });

  SmoothingSettings copyWith({
    int? level,
    bool? taperEnabled,
    double? minWidth,
    double? maxWidth,
    double? decimationThreshold,
  }) {
    return SmoothingSettings(
      level: level ?? this.level,
      taperEnabled: taperEnabled ?? this.taperEnabled,
      minWidth: minWidth ?? this.minWidth,
      maxWidth: maxWidth ?? this.maxWidth,
      decimationThreshold: decimationThreshold ?? this.decimationThreshold,
    );
  }
}

class ToolSettings {
  final Tool activeTool;
  final Color color;
  final double strokeWidth;     // 1.0–50.0
  final double opacity;         // 0.1–1.0
  final SmoothingSettings smoothing;
  final StrokeTip tip;          // round | flat | brush
  final bool isFilled;
  final ShapeType? shapeType;
  final InteractionMode interactionMode;
  final bool isLocked;

  double get thickness => strokeWidth;
  double get smoothingValue => smoothing.decimationThreshold;

  const ToolSettings({
    this.activeTool = Tool.softPen,
    this.color = Colors.white,
    this.strokeWidth = 4.0,
    this.opacity = 1.0,
    this.smoothing = const SmoothingSettings(),
    this.tip = StrokeTip.round,
    this.isFilled = false,
    this.shapeType,
    this.interactionMode = InteractionMode.drawMode,
    this.isLocked = false,
  });

  ToolSettings copyWith({
    Tool? activeTool,
    Color? color,
    double? strokeWidth,
    double? opacity,
    SmoothingSettings? smoothing,
    StrokeTip? tip,
    bool? isFilled,
    ShapeType? shapeType,
    InteractionMode? interactionMode,
    bool? isLocked,
  }) {
    return ToolSettings(
      activeTool: activeTool ?? this.activeTool,
      color: color ?? this.color,
      strokeWidth: strokeWidth ?? this.strokeWidth,
      opacity: opacity ?? this.opacity,
      smoothing: smoothing ?? this.smoothing,
      tip: tip ?? this.tip,
      isFilled: isFilled ?? this.isFilled,
      shapeType: shapeType ?? this.shapeType,
      interactionMode: interactionMode ?? this.interactionMode,
      isLocked: isLocked ?? this.isLocked,
    );
  }
}

class ToolState {
  final Tool activeTool;
  final InteractionMode interactionMode;
  final Map<Tool, ToolSettings> toolSettings;
  final List<Tool> pinnedTools;
  final SubjectMode activeMode;

  ToolState({
    required this.activeTool,
    this.interactionMode = InteractionMode.drawMode,
    required this.toolSettings,
    required this.pinnedTools,
    this.activeMode = SubjectMode.general,
  });

  ToolSettings get currentSettings => toolSettings[activeTool] ?? ToolSettings(activeTool: activeTool);

  ToolState copyWith({
    Tool? activeTool,
    InteractionMode? interactionMode,
    Map<Tool, ToolSettings>? toolSettings,
    List<Tool>? pinnedTools,
    SubjectMode? activeMode,
  }) {
    return ToolState(
      activeTool: activeTool ?? this.activeTool,
      interactionMode: interactionMode ?? this.interactionMode,
      toolSettings: toolSettings ?? this.toolSettings,
      pinnedTools: pinnedTools ?? this.pinnedTools,
      activeMode: activeMode ?? this.activeMode,
    );
  }
}

class ToolProvider extends StateNotifier<ToolState> {
  ToolProvider() : super(ToolState(
    activeTool: Tool.softPen,
    toolSettings: {
      Tool.softPen: const ToolSettings(activeTool: Tool.softPen, color: Colors.white, strokeWidth: 4.0),
      Tool.hardPen: const ToolSettings(activeTool: Tool.hardPen, color: Colors.white, strokeWidth: 6.0),
      Tool.highlighter: const ToolSettings(activeTool: Tool.highlighter, color: Colors.yellow, strokeWidth: 24.0, opacity: 0.4),
    },
    pinnedTools: [
      Tool.select,
      Tool.softPen,
      Tool.hardPen,
      Tool.highlighter,
      Tool.softEraser,
      Tool.rectangle,
      Tool.circle,
      Tool.textBox,
    ],
    activeMode: SubjectMode.general,
  ));

  void setSubjectMode(SubjectMode mode) {
    state = state.copyWith(activeMode: mode);
  }

  void selectTool(Tool tool) {
    // If selecting a tool that implies a mode change, do so
    InteractionMode newMode = state.interactionMode;
    if (tool == Tool.select || tool == Tool.selectObject || tool == Tool.navigate) {
      newMode = InteractionMode.selectMode;
    } else {
      newMode = InteractionMode.drawMode;
    }

    state = state.copyWith(
      activeTool: tool,
      interactionMode: newMode,
    );
  }

  void setInteractionMode(InteractionMode mode) {
    state = state.copyWith(interactionMode: mode);
  }

  void updateSettings(Tool tool, ToolSettings settings) {
    final newMap = Map<Tool, ToolSettings>.from(state.toolSettings);
    newMap[tool] = settings;
    state = state.copyWith(toolSettings: newMap);
  }

  void setPinnedTools(List<Tool> tools) {
    state = state.copyWith(pinnedTools: tools.take(10).toList());
  }

  void pinTool(Tool tool) {
    if (state.pinnedTools.contains(tool)) return;
    if (state.pinnedTools.length >= 10) return; // max 10 slots
    final newPinned = List<Tool>.from(state.pinnedTools)..add(tool);
    state = state.copyWith(pinnedTools: newPinned);
  }

  void unpinTool(Tool tool) {
    if (!state.pinnedTools.contains(tool)) return;
    final newPinned = List<Tool>.from(state.pinnedTools)..remove(tool);
    state = state.copyWith(pinnedTools: newPinned);
  }

  void setColor(Color color) {
    updateSettings(state.activeTool, state.currentSettings.copyWith(color: color));
  }

  void setStrokeWidth(double width) {
    updateSettings(state.activeTool, state.currentSettings.copyWith(strokeWidth: width));
  }

  void setOpacity(double opacity) {
    updateSettings(state.activeTool, state.currentSettings.copyWith(opacity: opacity));
  }

  void setSmoothing(SmoothingSettings settings) {
    updateSettings(state.activeTool, state.currentSettings.copyWith(smoothing: settings));
  }

  void setTip(StrokeTip tip) {
    updateSettings(state.activeTool, state.currentSettings.copyWith(tip: tip));
  }

  void setShapeType(ShapeType shape) {
    updateSettings(state.activeTool, state.currentSettings.copyWith(shapeType: shape));
  }

  void setShapeFilled(bool filled) {
    updateSettings(state.activeTool, state.currentSettings.copyWith(isFilled: filled));
  }

  void toggleToolLock(Tool tool) {
    final current = state.toolSettings[tool] ?? ToolSettings(activeTool: tool);
    final newMap = Map<Tool, ToolSettings>.from(state.toolSettings);
    newMap[tool] = current.copyWith(isLocked: !current.isLocked);
    state = state.copyWith(toolSettings: newMap);
  }

  void resetCurrentTool() {
    final newMap = Map<Tool, ToolSettings>.from(state.toolSettings);
    newMap[state.activeTool] = ToolSettings(activeTool: state.activeTool);
    state = state.copyWith(toolSettings: newMap);
  }
}

final toolProvider = StateNotifierProvider<ToolProvider, ToolState>((ref) => ToolProvider());
