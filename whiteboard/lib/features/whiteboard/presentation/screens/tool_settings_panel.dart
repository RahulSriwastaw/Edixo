import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../core/theme/app_theme.dart';
import 'package:flutter_colorpicker/flutter_colorpicker.dart';
import '../../../drawing/domain/models/drawing_tool.dart';
import '../../../drawing/providers/tool_provider.dart';
import '../../providers/canvas_provider.dart';

class ToolSettingsPanel extends ConsumerStatefulWidget {
  final ToolType toolType;

  const ToolSettingsPanel({super.key, required this.toolType});

  @override
  ConsumerState<ToolSettingsPanel> createState() => _ToolSettingsPanelState();
}

class _ToolSettingsPanelState extends ConsumerState<ToolSettingsPanel> {
  @override
  Widget build(BuildContext context) {
    final drawingState = ref.watch(drawingStateProvider);
    final settings = drawingState.toolSettings[widget.toolType] ?? const ToolSettings();
    final notifier = ref.read(drawingStateProvider.notifier);

    return Dialog(
      backgroundColor: const Color(0xFF2D2D3A),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16.r)),
      child: Container(
        width: 320.w,
        padding: EdgeInsets.all(20.w),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(_toolIcon(widget.toolType), color: AppTheme.primaryOrange, size: 20.w),
                SizedBox(width: 8.w),
                Text(
                  '${_toolName(widget.toolType)} Settings',
                  style: TextStyle(color: Colors.white, fontSize: 16.sp, fontWeight: FontWeight.bold),
                ),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.white54),
                  onPressed: () => Navigator.pop(context),
                  visualDensity: VisualDensity.compact,
                ),
              ],
            ),
            SizedBox(height: 16.h),

            // Live preview stroke (hide for shapes for now, or keep it as border preview)
            if (widget.toolType != ToolType.shapes) ...[
              Container(
                height: 60.h,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8.r),
                ),
                child: CustomPaint(
                  painter: _StrokePreviewPainter(
                    color: settings.color,
                    thickness: settings.thickness,
                    opacity: settings.opacity,
                  ),
                ),
              ),
              SizedBox(height: 16.h),
            ],

            // Shape Settings
            if (widget.toolType == ToolType.shapes) ...[
              _label('Shape Type'),
              SizedBox(height: 4.h),
              Wrap(
                spacing: 8.w,
                runSpacing: 8.h,
                children: [
                  _shapeOption(ShapeType.rectangle, Icons.crop_square, settings.shapeType, notifier),
                  _shapeOption(ShapeType.circle, Icons.radio_button_unchecked, settings.shapeType, notifier),
                  _shapeOption(ShapeType.triangle, Icons.change_history, settings.shapeType, notifier),
                  _shapeOption(ShapeType.line, Icons.horizontal_rule, settings.shapeType, notifier),
                  _shapeOption(ShapeType.arrow, Icons.arrow_right_alt, settings.shapeType, notifier),
                ],
              ),
              SizedBox(height: 16.h),
              Row(
                children: [
                  Text('Fill Shape', style: TextStyle(color: Colors.white70, fontSize: 13.sp)),
                  const Spacer(),
                  Switch(
                    value: settings.isFilled,
                    activeColor: AppTheme.primaryOrange,
                    onChanged: (v) => notifier.setShapeFilled(v),
                  ),
                ],
              ),
              SizedBox(height: 8.h),
            ],


            // Thickness slider
            _label('Stroke Width: ${settings.thickness.toStringAsFixed(1)}'),
            Slider(
              value: settings.thickness,
              min: 0.5,
              max: widget.toolType == ToolType.highlighter ? 30 : 20,
              divisions: 40,
              activeColor: AppTheme.primaryOrange,
              onChanged: (v) {
                notifier.setThickness(v);
                // Hack to force rebuild
                ref.read(drawingStateProvider.notifier).selectTool(widget.toolType);
              },
            ),

            // Opacity slider (not for eraser)
            if (widget.toolType != ToolType.eraser) ...[
              _label('Opacity: ${(settings.opacity * 100).toInt()}%'),
              Slider(
                value: settings.opacity,
                min: 0.1,
                max: 1.0,
                divisions: 10, // Simpler divisions
                activeColor: AppTheme.primaryOrange,
                onChanged: (v) => notifier.setOpacity(v),
              ),
            ],

            SizedBox(height: 8.h),

            // Color swatches
            if (widget.toolType != ToolType.eraser) ...[
              _label('Color'),
              SizedBox(height: 8.h),
              Wrap(
                spacing: 8.w,
                runSpacing: 8.h,
                children: [
                  ...[
                    Colors.black, Colors.white, const Color(0xFF1A73E8),
                    const Color(0xFFF4511E), const Color(0xFF10B981), const Color(0xFFEF4444),
                    const Color(0xFF8B5CF6), const Color(0xFFF59E0B), Colors.yellow, const Color(0xFF06B6D4),
                  ].map((c) {
                    final isSelected = c.value == settings.color.value;
                    return GestureDetector(
                      onTap: () => notifier.setColor(c),
                      child: Container(
                        width: 28.w,
                        height: 28.w,
                        decoration: BoxDecoration(
                          color: c,
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: isSelected ? AppTheme.primaryOrange : Colors.white24,
                            width: isSelected ? 2.5 : 1,
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                  // Custom color picker button
                  GestureDetector(
                    onTap: () => _showColorPicker(context, settings.color, notifier),
                    child: Container(
                      width: 28.w,
                      height: 28.w,
                      decoration: BoxDecoration(
                        gradient: const SweepGradient(
                          colors: [Colors.red, Colors.yellow, Colors.green, Colors.blue, Colors.purple, Colors.red],
                        ),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white54, width: 1.5),
                      ),
                      child: Icon(Icons.colorize, size: 16.w, color: Colors.white),
                    ),
                  ),
                ],
              ),
            ],

            SizedBox(height: 16.h),

            // Tool Lock
            Row(
              children: [
                Icon(settings.isLocked ? Icons.lock : Icons.lock_open, color: Colors.white70, size: 18.w),
                SizedBox(width: 8.w),
                Text('Tool Lock', style: TextStyle(color: Colors.white70, fontSize: 13.sp)),
                Tooltip(
                  message: 'Keep tool selected after use',
                  child: Padding(
                    padding: EdgeInsets.only(left: 4.w),
                    child: Icon(Icons.info_outline, color: Colors.white38, size: 14.w),
                  ),
                ),
                const Spacer(),
                Switch(
                  value: settings.isLocked,
                  activeColor: AppTheme.primaryOrange,
                  onChanged: (_) => notifier.toggleToolLock(widget.toolType),
                ),
              ],
            ),

            SizedBox(height: 16.h),

            // Reset button
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: () => notifier.resetCurrentTool(),
                  child: const Text('Reset', style: TextStyle(color: Colors.white54)),
                ),
                SizedBox(width: 8.w),
                ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryOrange,
                    minimumSize: Size(80.w, 36.h),
                  ),
                  child: const Text('Done'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showColorPicker(BuildContext context, Color currentColor, DrawingStateNotifier notifier) {
    Color selectedColor = currentColor;
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF2D2D3A),
        title: Text('Pick a color', style: TextStyle(color: Colors.white, fontSize: 16.sp)),
        content: SingleChildScrollView(
          child: ColorPicker(
            pickerColor: currentColor,
            onColorChanged: (c) => selectedColor = c,
            colorPickerWidth: 250.w,
            pickerAreaHeightPercent: 0.7,
            enableAlpha: false,
            displayThumbColor: true,
            portraitOnly: true,
          ),
        ),
        actions: [
          TextButton(
            child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
            onPressed: () => Navigator.of(context).pop(),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryOrange),
            child: const Text('Select'),
            onPressed: () {
              notifier.setColor(selectedColor);
              Navigator.of(context).pop();
            },
          ),
        ],
      ),
    );
  }

  Widget _shapeOption(ShapeType type, IconData icon, ShapeType? current, DrawingStateNotifier notifier) {
    final isSelected = current == type;
    return GestureDetector(
      onTap: () => notifier.setShapeType(type),
      child: Container(
        padding: EdgeInsets.all(8.w),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.primaryOrange.withOpacity(0.2) : Colors.transparent,
          border: Border.all(
            color: isSelected ? AppTheme.primaryOrange : Colors.white24,
          ),
          borderRadius: BorderRadius.circular(8.r),
        ),
        child: Icon(icon, color: isSelected ? AppTheme.primaryOrange : Colors.white70, size: 24.w),
      ),
    );
  }

  Widget _label(String text) => Padding(
        padding: EdgeInsets.only(bottom: 4.h),
        child: Text(text, style: TextStyle(color: Colors.white70, fontSize: 12.sp)),
      );

  String _toolName(ToolType type) {
    switch (type) {
      case ToolType.pen: return 'Pen';
      case ToolType.pencil: return 'Pencil';
      case ToolType.ballpoint: return 'Ballpoint';
      case ToolType.highlighter: return 'Highlighter';
      case ToolType.marker: return 'Marker';
      case ToolType.eraser: return 'Eraser';
      case ToolType.laserPointer: return 'Laser Pointer';
      case ToolType.shapes: return 'Shapes';
      case ToolType.text: return 'Text';
      default: return 'Tool';
    }
  }

  IconData _toolIcon(ToolType type) {
    switch (type) {
      case ToolType.pen: return Icons.edit;
      case ToolType.pencil: return Icons.create;
      case ToolType.highlighter: return Icons.highlight;
      case ToolType.eraser: return Icons.auto_fix_normal;
      case ToolType.laserPointer: return Icons.flash_on;
      case ToolType.shapes: return Icons.category_outlined;
      case ToolType.text: return Icons.text_fields;
      default: return Icons.tune;
    }
  }
}

class _StrokePreviewPainter extends CustomPainter {
  final Color color;
  final double thickness;
  final double opacity;

  _StrokePreviewPainter({required this.color, required this.thickness, required this.opacity});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color.withOpacity(opacity)
      ..strokeWidth = thickness
      ..strokeCap = StrokeCap.round
      ..style = PaintingStyle.stroke;

    const points = [0.1, 0.25, 0.4, 0.6, 0.75, 0.9];
    final path = Path();
    path.moveTo(size.width * 0.05, size.height * 0.5);
    path.cubicTo(
      size.width * 0.2, size.height * 0.2,
      size.width * 0.4, size.height * 0.8,
      size.width * 0.6, size.height * 0.3,
    );
    path.cubicTo(
      size.width * 0.7, size.height * 0.1,
      size.width * 0.8, size.height * 0.6,
      size.width * 0.95, size.height * 0.5,
    );
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _StrokePreviewPainter old) =>
      color != old.color || thickness != old.thickness || opacity != old.opacity;
}
