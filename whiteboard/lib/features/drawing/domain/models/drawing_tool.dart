import 'package:flutter/material.dart';

enum ToolType {
  // Draw
  pen,
  pencil,
  ballpoint,
  highlighter,
  marker,
  laserPointer,
  
  // Edit
  eraser,
  lasso,
  
  // Objects
  shapes,
  text,
  stickyNote,
  equation,
  image,
  pdf,
  
  // Measure
  ruler,
  protractor,
  
  // System
  settings,
  none,
}

enum ShapeType {
  line,
  arrow,
  rectangle,
  roundedRectangle,
  circle,
  ellipse,
  triangle,
  diamond,
  speechBubble,
  polygon,
}

enum ToolCategory {
  draw,
  edit,
  objects,
  shapes,   // Added for Tool Picker shape tab
  insert,   // Added for Tool Picker insert tab
  measure,
  system,
}

class DrawingTool {
  final ToolType type;
  final ToolCategory category;
  final String label;
  final IconData icon;
  final double thickness;
  final Color color;
  final double opacity;
  final ShapeType? shapeType;
  final Map<String, dynamic>? settings;
  final bool isStickyByDefault;

  const DrawingTool({
    required this.type,
    required this.category,
    required this.label,
    required this.icon,
    this.thickness = 2.0,
    this.color = Colors.black,
    this.opacity = 1.0,
    this.shapeType,
    this.settings,
    this.isStickyByDefault = true,
  });

  DrawingTool copyWith({
    double? thickness,
    Color? color,
    double? opacity,
    ShapeType? shapeType,
    Map<String, dynamic>? settings,
    bool? isStickyByDefault,
  }) {
    return DrawingTool(
      type: type,
      category: category,
      label: label,
      icon: icon,
      thickness: thickness ?? this.thickness,
      color: color ?? this.color,
      opacity: opacity ?? this.opacity,
      shapeType: shapeType ?? this.shapeType,
      settings: settings ?? this.settings,
      isStickyByDefault: isStickyByDefault ?? this.isStickyByDefault,
    );
  }

  // Predefined tools
  static const DrawingTool pen = DrawingTool(
    type: ToolType.pen,
    category: ToolCategory.draw,
    label: 'Pen',
    icon: Icons.edit,
    thickness: 2.0,
  );

  static const DrawingTool pencil = DrawingTool(
    type: ToolType.pencil,
    category: ToolCategory.draw,
    label: 'Pencil',
    icon: Icons.create,
    thickness: 1.5,
  );

  static const DrawingTool highlighter = DrawingTool(
    type: ToolType.highlighter,
    category: ToolCategory.draw,
    label: 'Highlighter',
    icon: Icons.highlight,
    thickness: 15.0,
    color: Color(0xFFFFD600),
    opacity: 0.3,
  );

  static const DrawingTool marker = DrawingTool(
    type: ToolType.marker,
    category: ToolCategory.draw,
    label: 'Marker',
    icon: Icons.brush,
    thickness: 8.0,
  );

  static const DrawingTool eraser = DrawingTool(
    type: ToolType.eraser,
    category: ToolCategory.edit,
    label: 'Eraser',
    icon: Icons.auto_fix_normal,
    thickness: 20.0,
  );

  static const DrawingTool lasso = DrawingTool(
    type: ToolType.lasso,
    category: ToolCategory.edit,
    label: 'Lasso',
    icon: Icons.highlight_alt,
  );

  static const DrawingTool shapes = DrawingTool(
    type: ToolType.shapes,
    category: ToolCategory.objects,
    label: 'Shapes',
    icon: Icons.category_outlined,
    isStickyByDefault: false,
  );

  static const DrawingTool text = DrawingTool(
    type: ToolType.text,
    category: ToolCategory.objects,
    label: 'Text',
    icon: Icons.text_fields,
    isStickyByDefault: false,
  );

  static const DrawingTool stickyNote = DrawingTool(
    type: ToolType.stickyNote,
    category: ToolCategory.objects,
    label: 'Sticky',
    icon: Icons.note_add_outlined,
    isStickyByDefault: false,
  );

  static const DrawingTool equation = DrawingTool(
    type: ToolType.equation,
    category: ToolCategory.objects,
    label: 'Equation',
    icon: Icons.functions,
    isStickyByDefault: false,
  );

  static const DrawingTool image = DrawingTool(
    type: ToolType.image,
    category: ToolCategory.objects,
    label: 'Image',
    icon: Icons.image_outlined,
    isStickyByDefault: false,
  );

  static const DrawingTool ruler = DrawingTool(
    type: ToolType.ruler,
    category: ToolCategory.measure,
    label: 'Ruler',
    icon: Icons.straighten,
    isStickyByDefault: false,
  );

  static const DrawingTool settingsTool = DrawingTool(
    type: ToolType.settings,
    category: ToolCategory.system,
    label: 'Settings',
    icon: Icons.settings,
    isStickyByDefault: false,
  );
}
