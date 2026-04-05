// lib/features/whiteboard/presentation/providers/tool_provider.dart

import 'package:flutter/material.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../../../core/storage/hive_service.dart';
import 'tool_registry.dart';

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
  // Math / Geometry
  ruler, protractor, compass,
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
  final List<Tool>      toolbarTools;
  final Set<Tool>       enabledTools;
  final String?         selectedElementId;
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
    this.toolbarTools  = defaultToolbarTools,
    this.enabledTools  = const {
      Tool.softPen,
      Tool.hardPen,
      Tool.highlighter,
      Tool.chalk,
      Tool.calligraphy,
      Tool.spray,
      Tool.laserPointer,
      Tool.softEraser,
      Tool.hardEraser,
      Tool.objectEraser,
      Tool.areaEraser,
      Tool.line,
      Tool.arrow,
      Tool.doubleArrow,
      Tool.rectangle,
      Tool.roundedRect,
      Tool.circle,
      Tool.triangle,
      Tool.star,
      Tool.polygon,
      Tool.callout,
      Tool.textBox,
      Tool.stickyNote,
      Tool.select,
      Tool.selectObject,
      Tool.navigate,
      Tool.magicPen,
      Tool.eyedropper,
      Tool.ruler,
      Tool.protractor,
      Tool.compass,
    },
    this.selectedElementId,
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
    List<Tool>?      toolbarTools,
    Set<Tool>?       enabledTools,
    String?          selectedElementId,
    bool             clearSelectedElement = false,
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
    toolbarTools:    toolbarTools    ?? this.toolbarTools,
    enabledTools:    enabledTools    ?? this.enabledTools,
    selectedElementId: clearSelectedElement
        ? null
        : (selectedElementId ?? this.selectedElementId),
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
  static const _toolbarStorageKey = 'whiteboard.toolbar.tools.v1';

  @override
  ToolSettings build() {
    final settings = <Tool, ToolSettings>{
      for (final definition in toolRegistry)
        definition.tool: definition.defaultSettings,
    };
    final enabled = <Tool>{
      for (final definition in toolRegistry) definition.tool,
    };
    return ToolSettings(toolSettings: settings, enabledTools: enabled);
  }

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

  void updateSettings(Tool tool, ToolSettings settings) {
    final newSettings = Map<Tool, ToolSettings>.from(state.toolSettings);
    newSettings[tool] = settings;
    state = state.copyWith(toolSettings: newSettings);
  }

  void setSelectedElement(String? elementId) {
    state = state.copyWith(
      selectedElementId: elementId,
      clearSelectedElement: elementId == null,
    );
  }

  // Backend hook: call after subscription payload is fetched on login.
  void setEnabledToolsFromBackend(Iterable<String> allowedToolIds) {
    final next = <Tool>{};
    for (final definition in toolRegistry) {
      if (allowedToolIds.contains(definition.id)) {
        next.add(definition.tool);
      }
    }

    // If backend returns empty list unexpectedly, keep current behavior safe.
    if (next.isEmpty) return;

    final filteredToolbar = state.toolbarTools
        .where((tool) => next.contains(tool))
        .toList();

    state = state.copyWith(
      enabledTools: next,
      toolbarTools: filteredToolbar.isEmpty ? defaultToolbarTools.where(next.contains).toList() : filteredToolbar,
      activeTool: next.contains(state.activeTool)
          ? state.activeTool
          : (filteredToolbar.isNotEmpty ? filteredToolbar.first : next.first),
    );
    _persistToolbar();
  }

  void setToolbarTools(List<Tool> tools) {
    final unique = <Tool>{};
    final sanitized = <Tool>[];
    for (final tool in tools) {
      if (!toolRegistryByTool.containsKey(tool)) continue;
      if (!state.enabledTools.contains(tool)) continue;
      if (unique.add(tool)) sanitized.add(tool);
    }
    if (sanitized.isEmpty) {
      sanitized.addAll(defaultToolbarTools);
    }
    state = state.copyWith(toolbarTools: sanitized);
    _persistToolbar();
  }

  void addToolToToolbar(Tool tool, {int? atIndex}) {
    if (!toolRegistryByTool.containsKey(tool)) return;
    if (!state.enabledTools.contains(tool)) return;
    if (state.toolbarTools.contains(tool)) return;

    final next = List<Tool>.from(state.toolbarTools);
    if (atIndex != null && atIndex >= 0 && atIndex <= next.length) {
      next.insert(atIndex, tool);
    } else {
      next.add(tool);
    }
    state = state.copyWith(toolbarTools: next);
    _persistToolbar();
  }

  void removeToolFromToolbar(Tool tool) {
    final next = List<Tool>.from(state.toolbarTools)..remove(tool);
    if (next.isEmpty) return;

    state = state.copyWith(
      toolbarTools: next,
      activeTool: state.activeTool == tool ? next.first : state.activeTool,
    );
    _persistToolbar();
  }

  void moveToolInToolbar({required int oldIndex, required int newIndex}) {
    if (oldIndex < 0 || oldIndex >= state.toolbarTools.length) return;
    if (newIndex < 0 || newIndex > state.toolbarTools.length) return;

    final next = List<Tool>.from(state.toolbarTools);
    final item = next.removeAt(oldIndex);
    final adjustedIndex = newIndex > oldIndex ? newIndex - 1 : newIndex;
    next.insert(adjustedIndex.clamp(0, next.length), item);
    state = state.copyWith(toolbarTools: next);
    _persistToolbar();
  }

  Future<void> loadToolbarFromStorage() async {
    final box = _settingsBoxOrNull();
    if (box == null) return;

    try {
      final raw = box.get(_toolbarStorageKey);
      if (raw is! List) return;

      final tools = <Tool>[];
      for (final entry in raw) {
        if (entry is! String) continue;

        Tool? parsed;
        for (final value in Tool.values) {
          if (value.name == entry) {
            parsed = value;
            break;
          }
        }

        if (parsed != null && toolRegistryByTool.containsKey(parsed)) {
          tools.add(parsed);
        }
      }
      state = state.copyWith(
        toolbarTools: tools.isEmpty ? defaultToolbarTools : tools,
      );
    } catch (_) {
      state = state.copyWith(toolbarTools: defaultToolbarTools);
    }
  }

  dynamic _settingsBoxOrNull() {
    try {
      return HiveService.getSettingsBox();
    } catch (_) {
      return null;
    }
  }

  Future<void> _persistToolbar() async {
    final box = _settingsBoxOrNull();
    if (box == null) return;

    await box.put(_toolbarStorageKey, state.toolbarTools.map((t) => t.name).toList());
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
