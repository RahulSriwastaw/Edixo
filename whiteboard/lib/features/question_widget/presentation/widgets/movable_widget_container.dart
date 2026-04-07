
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/interaction_state_provider.dart';

class MovableWidgetContainer extends ConsumerStatefulWidget {
  final String id;
  final Widget child;
  final double x;
  final double y;
  final double width;
  final double height;
  final bool isLocked;
  final bool canEdit;
  final Function(Offset) onMove;
  final Function(Size) onResize;
  final VoidCallback onToggleLock;

  const MovableWidgetContainer({
    super.key,
    required this.id,
    required this.child,
    required this.x,
    required this.y,
    required this.width,
    required this.height,
    required this.isLocked,
    this.canEdit = true,
    required this.onMove,
    required this.onResize,
    required this.onToggleLock,
  });

  @override
  ConsumerState<MovableWidgetContainer> createState() => _MovableWidgetContainerState();
}

class _MovableWidgetContainerState extends ConsumerState<MovableWidgetContainer> {
  bool get _isSelected => ref.watch(selectedSetWidgetIdProvider) == widget.id;

  double get _handleSize => kIsWeb || defaultTargetPlatform == TargetPlatform.windows || defaultTargetPlatform == TargetPlatform.macOS || defaultTargetPlatform == TargetPlatform.linux
      ? 12.0
      : 24.0;

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: widget.x,
      top: widget.y,
      child: GestureDetector(
        onTap: () {
          if (widget.canEdit) {
            ref.read(selectedSetWidgetIdProvider.notifier).state = widget.id;
          }
        },
        onLongPress: widget.canEdit ? widget.onToggleLock : null,
        onPanStart: widget.canEdit ? (_) {
          if (!widget.isLocked) {
            ref.read(isDraggingWidgetProvider.notifier).state = true;
          }
        } : null,
        onPanUpdate: widget.canEdit ? (details) {
          if (!widget.isLocked) {
            widget.onMove(Offset(widget.x + details.delta.dx, widget.y + details.delta.dy));
          }
        } : null,
        onPanEnd: widget.canEdit ? (_) => ref.read(isDraggingWidgetProvider.notifier).state = false : null,
        child: Container(
          width: widget.width,
          height: widget.height,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            boxShadow: _isSelected
                ? [
                    BoxShadow(
                      color: Colors.orange.withValues(alpha: 0.25),
                      blurRadius: 15,
                      spreadRadius: 2,
                    ),
                  ]
                : [],
          ),
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              // Selection Border (Dashed)
              if (_isSelected)
                _DashedBorder(
                  width: widget.width,
                  height: widget.height,
                  color: Colors.blueAccent,
                ),
              
              // The Actual Content
              widget.child,

              // Resizing Handles
              if (_isSelected && !widget.isLocked) ..._buildHandles(),
              
              // Lock Icon
              if (widget.isLocked)
                const Positioned(
                  top: 8,
                  right: 8,
                  child: Icon(Icons.lock, color: Colors.white54, size: 16),
                ),
            ],
          ),
        ),
      ),
    );
  }

  List<Widget> _buildHandles() {
    return [
      // Corners
      _Handle(top: -_handleSize / 2, left: -_handleSize / 2, onDrag: (d) => _resize(top: d.dy, left: d.dx)),
      _Handle(top: -_handleSize / 2, right: -_handleSize / 2, onDrag: (d) => _resize(top: d.dy, right: -d.dx)),
      _Handle(bottom: -_handleSize / 2, left: -_handleSize / 2, onDrag: (d) => _resize(bottom: -d.dy, left: d.dx)),
      _Handle(bottom: -_handleSize / 2, right: -_handleSize / 2, onDrag: (d) => _resize(bottom: -d.dy, right: -d.dx)),
      // Edges
      _Handle(top: -_handleSize / 2, left: widget.width / 2 - _handleSize / 2, onDrag: (d) => _resize(top: d.dy)),
      _Handle(bottom: -_handleSize / 2, left: widget.width / 2 - _handleSize / 2, onDrag: (d) => _resize(bottom: -d.dy)),
      _Handle(left: -_handleSize / 2, top: widget.height / 2 - _handleSize / 2, onDrag: (d) => _resize(left: d.dx)),
      _Handle(right: -_handleSize / 2, top: widget.height / 2 - _handleSize / 2, onDrag: (d) => _resize(right: -d.dx)),
    ];
  }

  void _resize({double? top, double? left, double? right, double? bottom}) {
    double newX = widget.x;
    double newY = widget.y;
    double newWidth = widget.width;
    double newHeight = widget.height;

    if (top != null) {
      newY += top;
      newHeight -= top;
    }
    if (bottom != null) {
      newHeight += bottom;
    }
    if (left != null) {
      newX += left;
      newWidth -= left;
    }
    if (right != null) {
      newWidth += right;
    }

    // Constraints
    if (newWidth < 100) newWidth = 100;
    if (newHeight < 60) newHeight = 60;
    if (newWidth > 1920) newWidth = 1920;
    if (newHeight > 1080) newHeight = 1080;

    widget.onMove(Offset(newX, newY));
    widget.onResize(Size(newWidth, newHeight));
  }

  Widget _Handle({double? top, double? left, double? right, double? bottom, required Function(Offset) onDrag}) {
    return Positioned(
      top: top,
      left: left,
      right: right,
      bottom: bottom,
      child: GestureDetector(
        onPanStart: (_) {
          ref.read(isDraggingWidgetProvider.notifier).state = true;
        },
        onPanUpdate: (d) => onDrag(d.delta),
        onPanEnd: (_) => ref.read(isDraggingWidgetProvider.notifier).state = false,
        child: Container(
          width: 16,
          height: 16,
          decoration: BoxDecoration(
            color: Colors.orange,
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white, width: 2.5),
            boxShadow: [
              BoxShadow(
                color: Colors.black26,
                blurRadius: 4,
                spreadRadius: 1,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _DashedBorder extends StatelessWidget {
  final double width;
  final double height;
  final Color color;

  const _DashedBorder({required this.width, required this.height, required this.color});

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: Size(width, height),
      painter: _DashedPainter(color: color),
    );
  }
}

class _DashedPainter extends CustomPainter {
  final Color color;
  _DashedPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;

    const dashWidth = 5.0;
    const dashSpace = 3.0;

    // Drawing dashed rectangles manually
    _drawDashedLine(canvas, const Offset(0, 0), Offset(size.width, 0), paint, dashWidth, dashSpace);
    _drawDashedLine(canvas, Offset(size.width, 0), Offset(size.width, size.height), paint, dashWidth, dashSpace);
    _drawDashedLine(canvas, Offset(size.width, size.height), Offset(0, size.height), paint, dashWidth, dashSpace);
    _drawDashedLine(canvas, Offset(0, size.height), const Offset(0, 0), paint, dashWidth, dashSpace);
  }

  void _drawDashedLine(Canvas canvas, Offset start, Offset end, Paint paint, double dashWidth, double dashSpace) {
    double distance = (end - start).distance;
    double currentDistance = 0;
    while (currentDistance < distance) {
      double stopDistance = currentDistance + dashWidth;
      if (stopDistance > distance) stopDistance = distance;
      canvas.drawLine(
        Offset.lerp(start, end, currentDistance / distance)!,
        Offset.lerp(start, end, stopDistance / distance)!,
        paint,
      );
      currentDistance += dashWidth + dashSpace;
    }
  }

  @override
  bool shouldRepaint(CustomPainter oldDelegate) => false;
}
