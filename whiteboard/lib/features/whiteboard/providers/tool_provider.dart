import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'canvas_provider.dart';

enum SubjectMode {
  general, math, physics, chemistry, englishHindi, sscRailway, upsc
}

enum ToolType {
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
  select,
  navigate,

  // Special
  magicPen,
  eyedropper,
  
  // Legacy
  pen,
  eraser,
}

enum ShapeType {
  line, arrow, doubleArrow, rectangle, roundedRectangle, circle, ellipse, triangle, diamond, star, polygon, speechBubble
}

class StrokeSmoothing {
  final int level;
  final double decimationThreshold;
  final bool taperEnabled;
  final double minWidth;
  final double maxWidth;

  const StrokeSmoothing({
    this.level = 2,
    this.decimationThreshold = 1.0,
    this.taperEnabled = true,
    this.minWidth = 1.0,
    this.maxWidth = 4.0,
  });

  StrokeSmoothing copyWith({
    int? level,
    double? decimationThreshold,
    bool? taperEnabled,
    double? minWidth,
    double? maxWidth,
  }) {
    return StrokeSmoothing(
      level: level ?? this.level,
      decimationThreshold: decimationThreshold ?? this.decimationThreshold,
      taperEnabled: taperEnabled ?? this.taperEnabled,
      minWidth: minWidth ?? this.minWidth,
      maxWidth: maxWidth ?? this.maxWidth,
    );
  }
}

class ToolSettings {
  final Color color;
  final double thickness;
  final double opacity;
  final bool isFilled;
  final ShapeType? shapeType;
  final StrokeSmoothing smoothing;
  final bool isLocked;

  const ToolSettings({
    this.color = Colors.white,
    this.thickness = 2.0,
    this.opacity = 1.0,
    this.isFilled = false,
    this.shapeType,
    this.smoothing = const StrokeSmoothing(),
    this.isLocked = false,
  });

  ToolSettings copyWith({
    Color? color,
    double? thickness,
    double? opacity,
    bool? isFilled,
    ShapeType? shapeType,
    StrokeSmoothing? smoothing,
    bool? isLocked,
  }) {
    return ToolSettings(
      color: color ?? this.color,
      thickness: thickness ?? this.thickness,
      opacity: opacity ?? this.opacity,
      isFilled: isFilled ?? this.isFilled,
      shapeType: shapeType ?? this.shapeType,
      smoothing: smoothing ?? this.smoothing,
      isLocked: isLocked ?? this.isLocked,
    );
  }
}

class ToolState {
  final ToolType activeTool;
  final Map<ToolType, ToolSettings> toolSettings;
  final List<ToolType> pinnedTools;
  final SubjectMode activeMode;

  ToolState({
    required this.activeTool,
    required this.toolSettings,
    required this.pinnedTools,
    this.activeMode = SubjectMode.general,
  });

  ToolSettings get currentSettings => toolSettings[activeTool] ?? const ToolSettings();

  ToolState copyWith({
    ToolType? activeTool,
    Map<ToolType, ToolSettings>? toolSettings,
    List<ToolType>? pinnedTools,
    SubjectMode? activeMode,
  }) {
    return ToolState(
      activeTool: activeTool ?? this.activeTool,
      toolSettings: toolSettings ?? this.toolSettings,
      pinnedTools: pinnedTools ?? this.pinnedTools,
      activeMode: activeMode ?? this.activeMode,
    );
  }
}

class ToolProvider extends StateNotifier<ToolState> {
  ToolProvider() : super(ToolState(
    activeTool: ToolType.softPen,
    toolSettings: {
      ToolType.softPen: const ToolSettings(color: Colors.white, thickness: 2.0),
      ToolType.hardPen: const ToolSettings(color: Colors.white, thickness: 4.0),
      ToolType.highlighter: const ToolSettings(color: Colors.yellow, thickness: 20.0, opacity: 0.3),
    },
    pinnedTools: [
      ToolType.select,
      ToolType.softPen,
      ToolType.hardPen,
      ToolType.highlighter,
      ToolType.softEraser,
      ToolType.rectangle,
      ToolType.circle,
      ToolType.textBox,
    ],
    activeMode: SubjectMode.general,
  ));

  void setSubjectMode(SubjectMode mode) {
    state = state.copyWith(activeMode: mode);
  }

  void selectTool(ToolType tool) {
    state = state.copyWith(activeTool: tool);
  }

  void updateSettings(ToolType tool, ToolSettings settings) {
    final newMap = Map<ToolType, ToolSettings>.from(state.toolSettings);
    newMap[tool] = settings;
    state = state.copyWith(toolSettings: newMap);
  }

  void setPinnedTools(List<ToolType> tools) {
    state = state.copyWith(pinnedTools: tools.take(10).toList());
  }

  void setColor(Color color) {
    updateSettings(state.activeTool, state.currentSettings.copyWith(color: color));
  }
}

final toolProvider = StateNotifierProvider<ToolProvider, ToolState>((ref) => ToolProvider());
