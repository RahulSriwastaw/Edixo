// lib/features/whiteboard/presentation/widgets/shapes/shape_tools.dart

import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/constants/app_dimensions.dart';

/// Shape tool palette - provides access to all shape tools
class ShapeToolsPalette extends ConsumerWidget {
  final Function(String shapeType) onShapeSelected;

  const ShapeToolsPalette({super.key, required this.onShapeSelected});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      padding: EdgeInsets.all(AppDimensions.borderRadiusM),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary.withOpacity(0.95),
        borderRadius: BorderRadius.circular(AppDimensions.borderRadiusL),
        border: Border.all(color: AppColors.textTertiary.withOpacity(0.2)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.3),
            blurRadius: 8,
            offset: const Offset(2, 2),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'Shapes',
            style: TextStyle(
              color: AppColors.textPrimary,
              fontSize: 12,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: AppDimensions.borderRadiusS),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _ShapeButton(
                icon: Icons.crop_square,
                label: 'Rectangle',
                onTap: () => onShapeSelected('rectangle'),
              ),
              _ShapeButton(
                icon: Icons.circle,
                label: 'Circle',
                onTap: () => onShapeSelected('circle'),
              ),
              _ShapeButton(
                icon: Icons.change_history,
                label: 'Triangle',
                onTap: () => onShapeSelected('triangle'),
              ),
              _ShapeButton(
                icon: Icons.show_chart,
                label: 'Line',
                onTap: () => onShapeSelected('line'),
              ),
              _ShapeButton(
                icon: Icons.arrow_right_alt,
                label: 'Arrow',
                onTap: () => onShapeSelected('arrow'),
              ),
              _ShapeButton(
                icon: Icons.text_fields,
                label: 'Text',
                onTap: () => onShapeSelected('textbox'),
              ),
              _ShapeButton(
                icon: Icons.sticky_note_2,
                label: 'Sticky Note',
                onTap: () => onShapeSelected('sticky'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _ShapeButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _ShapeButton({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 48,
        height: 48,
        decoration: BoxDecoration(
          color: AppColors.bgPrimary,
          borderRadius: BorderRadius.circular(AppDimensions.borderRadiusS),
          border: Border.all(color: AppColors.textTertiary.withOpacity(0.3)),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, size: 20, color: AppColors.textPrimary),
            SizedBox(height: 2),
            Text(
              label,
              style: TextStyle(
                color: AppColors.textSecondary,
                fontSize: 8,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Draggable shape widget
class DraggableShape extends ConsumerStatefulWidget {
  final String shapeType;
  final Offset initialPosition;
  final Color color;

  const DraggableShape({
    super.key,
    required this.shapeType,
    required this.initialPosition,
    this.color = Colors.white,
  });

  @override
  ConsumerState<DraggableShape> createState() => _DraggableShapeState();
}

class _DraggableShapeState extends ConsumerState<DraggableShape> {
  late Offset _position;
  late Size _size;
  bool _isDragging = false;
  bool _isResizing = false;

  @override
  void initState() {
    super.initState();
    _position = widget.initialPosition;
    _size = const Size(150, 150);
  }

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: _position.dx,
      top: _position.dy,
      child: GestureDetector(
        onPanStart: (_) => setState(() => _isDragging = true),
        onPanUpdate: (details) {
          setState(() {
            _position += details.delta;
          });
        },
        onPanEnd: (_) => setState(() => _isDragging = false),
        child: Container(
          width: _size.width,
          height: _size.height,
          child: Stack(
            children: [
              // Shape
              CustomPaint(
                painter: ShapePainter(
                  shapeType: widget.shapeType,
                  color: widget.color,
                ),
                child: SizedBox.expand(),
              ),
              // Resize handle
              Positioned(
                bottom: 0,
                right: 0,
                child: GestureDetector(
                  onPanStart: (_) => setState(() => _isResizing = true),
                  onPanUpdate: (details) {
                    setState(() {
                      _size = Size(
                        (_size.width + details.delta.dx).clamp(50.0, 500.0),
                        (_size.height + details.delta.dy).clamp(50.0, 500.0),
                      );
                    });
                  },
                  onPanEnd: (_) => setState(() => _isResizing = false),
                  child: Container(
                    width: 16,
                    height: 16,
                    decoration: BoxDecoration(
                      color: AppColors.accentOrange,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Icon(Icons.drag_handle, size: 12, color: Colors.white),
                  ),
                ),
              ),
              // Delete button
              Positioned(
                top: 0,
                right: 0,
                child: GestureDetector(
                  onTap: () {
                    // Remove from parent
                  },
                  child: Container(
                    width: 20,
                    height: 20,
                    decoration: BoxDecoration(
                      color: Colors.red,
                      shape: BoxShape.circle,
                    ),
                    child: Icon(Icons.close, size: 14, color: Colors.white),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class ShapePainter extends CustomPainter {
  final String shapeType;
  final Color color;

  ShapePainter({required this.shapeType, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color.withOpacity(0.3)
      ..style = PaintingStyle.fill;

    final borderPaint = Paint()
      ..color = color
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    switch (shapeType) {
      case 'rectangle':
        canvas.drawRect(
          Rect.fromLTWH(0, 0, size.width, size.height),
          paint,
        );
        canvas.drawRect(
          Rect.fromLTWH(0, 0, size.width, size.height),
          borderPaint,
        );
        break;

      case 'circle':
        final center = Offset(size.width / 2, size.height / 2);
        final radius = min(size.width, size.height) / 2;
        canvas.drawCircle(center, radius, paint);
        canvas.drawCircle(center, radius, borderPaint);
        break;

      case 'triangle':
        final path = Path()
          ..moveTo(size.width / 2, 0)
          ..lineTo(size.width, size.height)
          ..lineTo(0, size.height)
          ..close();
        canvas.drawPath(path, paint);
        canvas.drawPath(path, borderPaint);
        break;

      case 'line':
        canvas.drawLine(
          Offset(0, size.height / 2),
          Offset(size.width, size.height / 2),
          borderPaint..strokeWidth = 3,
        );
        break;

      case 'arrow':
        final path = Path()
          ..moveTo(0, size.height / 2)
          ..lineTo(size.width - 20, size.height / 2)
          ..lineTo(size.width - 30, size.height / 2 - 10)
          ..moveTo(size.width - 20, size.height / 2)
          ..lineTo(size.width - 30, size.height / 2 + 10);
        canvas.drawPath(path, borderPaint..strokeWidth = 3);
        break;

      default:
        canvas.drawRect(
          Rect.fromLTWH(0, 0, size.width, size.height),
          paint,
        );
    }
  }

  @override
  bool shouldRepaint(ShapePainter oldDelegate) {
    return oldDelegate.shapeType != shapeType || oldDelegate.color != color;
  }
}
