import 'package:flutter/material.dart';
import 'tool_provider.dart';

enum ToolLibraryCategory {
  freeForm,
  shape,
  review,
  measure,
  insert,
  select,
}

class ToolDefinition {
  final String id;
  final Tool tool;
  final String name;
  final ToolLibraryCategory category;
  final IconData icon;
  final ToolSettings defaultSettings;

  const ToolDefinition({
    required this.id,
    required this.tool,
    required this.name,
    required this.category,
    required this.icon,
    this.defaultSettings = const ToolSettings(),
  });
}

const List<ToolDefinition> toolRegistry = [
  ToolDefinition(
    id: 'soft-pen',
    tool: Tool.softPen,
    name: 'Soft Pen',
    category: ToolLibraryCategory.freeForm,
    icon: Icons.edit_outlined,
    defaultSettings: ToolSettings(strokeWidth: 4.0, color: Color(0xFF111111)),
  ),
  ToolDefinition(
    id: 'hard-pen',
    tool: Tool.hardPen,
    name: 'Hard Pen',
    category: ToolLibraryCategory.freeForm,
    icon: Icons.edit,
    defaultSettings: ToolSettings(strokeWidth: 3.0, color: Color(0xFF111111)),
  ),
  ToolDefinition(
    id: 'highlighter',
    tool: Tool.highlighter,
    name: 'Highlighter',
    category: ToolLibraryCategory.freeForm,
    icon: Icons.highlight_outlined,
    defaultSettings: ToolSettings(
      strokeWidth: 15.0,
      color: Color(0xFFFFE66D),
      opacity: 0.3,
    ),
  ),
  ToolDefinition(
    id: 'chalk',
    tool: Tool.chalk,
    name: 'Chalk',
    category: ToolLibraryCategory.freeForm,
    icon: Icons.draw_outlined,
    defaultSettings: ToolSettings(strokeWidth: 4.0, color: Color(0xFF111111)),
  ),
  ToolDefinition(
    id: 'calligraphy',
    tool: Tool.calligraphy,
    name: 'Calligraphy',
    category: ToolLibraryCategory.freeForm,
    icon: Icons.brush_outlined,
    defaultSettings: ToolSettings(strokeWidth: 6.0, color: Color(0xFF111111)),
  ),
  ToolDefinition(
    id: 'spray',
    tool: Tool.spray,
    name: 'Spray',
    category: ToolLibraryCategory.freeForm,
    icon: Icons.blur_on_outlined,
    defaultSettings: ToolSettings(strokeWidth: 5.0, color: Color(0xFF111111)),
  ),
  ToolDefinition(
    id: 'laser-pointer',
    tool: Tool.laserPointer,
    name: 'Laser',
    category: ToolLibraryCategory.review,
    icon: Icons.local_fire_department_outlined,
  ),
  ToolDefinition(
    id: 'soft-eraser',
    tool: Tool.softEraser,
    name: 'Soft Eraser',
    category: ToolLibraryCategory.freeForm,
    icon: Icons.auto_fix_normal_outlined,
    defaultSettings: ToolSettings(strokeWidth: 20.0),
  ),
  ToolDefinition(
    id: 'hard-eraser',
    tool: Tool.hardEraser,
    name: 'Hard Eraser',
    category: ToolLibraryCategory.freeForm,
    icon: Icons.auto_fix_high_outlined,
  ),
  ToolDefinition(
    id: 'object-eraser',
    tool: Tool.objectEraser,
    name: 'Object Eraser',
    category: ToolLibraryCategory.select,
    icon: Icons.select_all,
  ),
  ToolDefinition(
    id: 'area-eraser',
    tool: Tool.areaEraser,
    name: 'Area Eraser',
    category: ToolLibraryCategory.select,
    icon: Icons.crop_free,
  ),
  ToolDefinition(
    id: 'line',
    tool: Tool.line,
    name: 'Line',
    category: ToolLibraryCategory.shape,
    icon: Icons.horizontal_rule_rounded,
  ),
  ToolDefinition(
    id: 'arrow',
    tool: Tool.arrow,
    name: 'Arrow',
    category: ToolLibraryCategory.shape,
    icon: Icons.arrow_forward_rounded,
  ),
  ToolDefinition(
    id: 'double-arrow',
    tool: Tool.doubleArrow,
    name: 'Double Arrow',
    category: ToolLibraryCategory.shape,
    icon: Icons.compare_arrows_rounded,
  ),
  ToolDefinition(
    id: 'rectangle',
    tool: Tool.rectangle,
    name: 'Rectangle',
    category: ToolLibraryCategory.shape,
    icon: Icons.crop_square_outlined,
  ),
  ToolDefinition(
    id: 'rounded-rect',
    tool: Tool.roundedRect,
    name: 'Rounded Rect',
    category: ToolLibraryCategory.shape,
    icon: Icons.rounded_corner_outlined,
  ),
  ToolDefinition(
    id: 'circle',
    tool: Tool.circle,
    name: 'Circle',
    category: ToolLibraryCategory.shape,
    icon: Icons.circle_outlined,
  ),
  ToolDefinition(
    id: 'triangle',
    tool: Tool.triangle,
    name: 'Triangle',
    category: ToolLibraryCategory.shape,
    icon: Icons.change_history_outlined,
  ),
  ToolDefinition(
    id: 'star',
    tool: Tool.star,
    name: 'Star',
    category: ToolLibraryCategory.shape,
    icon: Icons.star_border_outlined,
  ),
  ToolDefinition(
    id: 'polygon',
    tool: Tool.polygon,
    name: 'Polygon',
    category: ToolLibraryCategory.shape,
    icon: Icons.hexagon_outlined,
  ),
  ToolDefinition(
    id: 'callout',
    tool: Tool.callout,
    name: 'Callout',
    category: ToolLibraryCategory.review,
    icon: Icons.chat_bubble_outline_rounded,
  ),
  ToolDefinition(
    id: 'text-box',
    tool: Tool.textBox,
    name: 'Text Box',
    category: ToolLibraryCategory.insert,
    icon: Icons.text_fields_outlined,
    defaultSettings: ToolSettings(strokeWidth: 16.0),
  ),
  ToolDefinition(
    id: 'sticky-note',
    tool: Tool.stickyNote,
    name: 'Sticky Note',
    category: ToolLibraryCategory.insert,
    icon: Icons.sticky_note_2_outlined,
  ),
  ToolDefinition(
    id: 'select',
    tool: Tool.select,
    name: 'Select',
    category: ToolLibraryCategory.select,
    icon: Icons.highlight_alt_outlined,
  ),
  ToolDefinition(
    id: 'select-object',
    tool: Tool.selectObject,
    name: 'Select Object',
    category: ToolLibraryCategory.select,
    icon: Icons.touch_app_outlined,
  ),
  ToolDefinition(
    tool: Tool.lassoFreeform,
    id: 'lasso-freeform',
    name: 'Lasso Select',
    icon: Icons.gesture,
    category: ToolLibraryCategory.select,
  ),
  ToolDefinition(
    tool: Tool.lassoRect,
    id: 'lasso-rect',
    name: 'Rect Select',
    icon: Icons.crop_square_outlined,
    category: ToolLibraryCategory.select,
  ),
  ToolDefinition(
    id: 'navigate',
    tool: Tool.navigate,
    name: 'Navigate',
    category: ToolLibraryCategory.measure,
    icon: Icons.pan_tool_outlined,
  ),
  ToolDefinition(
    id: 'magic-pen',
    tool: Tool.magicPen,
    name: 'Magic Pen',
    category: ToolLibraryCategory.insert,
    icon: Icons.auto_awesome_outlined,
    defaultSettings: ToolSettings(strokeWidth: 5.0, color: Color(0xFF6A1B9A), opacity: 0.9),
  ),
  ToolDefinition(
    id: 'eyedropper',
    tool: Tool.eyedropper,
    name: 'Eyedropper',
    category: ToolLibraryCategory.review,
    icon: Icons.colorize_outlined,
  ),
  // ── Math / Geometry tools ────────────────────────────────────────────────
  ToolDefinition(
    id: 'ruler',
    tool: Tool.ruler,
    name: 'Ruler',
    category: ToolLibraryCategory.measure,
    icon: Icons.straighten_outlined,
  ),
  ToolDefinition(
    id: 'protractor',
    tool: Tool.protractor,
    name: 'Protractor',
    category: ToolLibraryCategory.measure,
    icon: Icons.architecture_outlined,
  ),
  ToolDefinition(
    id: 'compass',
    tool: Tool.compass,
    name: 'Compass',
    category: ToolLibraryCategory.measure,
    icon: Icons.explore_outlined,
  ),
  ToolDefinition(
    id: 'spotlight',
    tool: Tool.spotlight,
    name: 'Spotlight',
    category: ToolLibraryCategory.review,
    icon: Icons.highlight_outlined,
  ),
  ToolDefinition(
    id: 'india-map',
    tool: Tool.indiaMap,
    name: 'India Map',
    category: ToolLibraryCategory.insert,
    icon: Icons.map_outlined,
  ),
];

final Map<Tool, ToolDefinition> toolRegistryByTool = {
  for (final definition in toolRegistry) definition.tool: definition,
};

const List<Tool> defaultToolbarTools = [
  Tool.softPen,
  Tool.highlighter,
  Tool.softEraser,
  Tool.rectangle,
  Tool.circle,
  Tool.textBox,
  Tool.select,
  Tool.navigate,
];

const Map<ToolLibraryCategory, String> categoryTitleMap = {
  ToolLibraryCategory.freeForm: 'Free-form',
  ToolLibraryCategory.shape: 'Shape',
  ToolLibraryCategory.review: 'Review',
  ToolLibraryCategory.measure: 'Measure',
  ToolLibraryCategory.insert: 'Insert',
  ToolLibraryCategory.select: 'Select',
};
