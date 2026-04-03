import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../question_widget/data/models/question_widget_model.dart';
import '../../../../question_widget/presentation/providers/question_widget_provider.dart';
import '../../../../question_widget/presentation/providers/selected_widget_provider.dart';
import '../../providers/tool_provider.dart';
import '../../providers/canvas_size_provider.dart';

class EditableQuestionLayer extends ConsumerStatefulWidget {
  const EditableQuestionLayer({super.key});

  @override
  ConsumerState<EditableQuestionLayer> createState() => _EditableQuestionLayerState();
}

class _EditableQuestionLayerState extends ConsumerState<EditableQuestionLayer> {
  @override
  void initState() {
    super.initState();
    // Register keyboard shortcut for Q key (toggle draw/select mode)
    HardwareKeyboard.instance.addHandler(_handleKeyEvent);
  }

  @override
  void dispose() {
    HardwareKeyboard.instance.removeHandler(_handleKeyEvent);
    super.dispose();
  }

  bool _handleKeyEvent(KeyEvent event) {
    if (event is KeyDownEvent && event.logicalKey == LogicalKeyboardKey.keyQ) {
      ref.read(toolNotifierProvider.notifier).toggleInteractionMode();
      return true;
    }
    // Delete key removes selected widget
    if (event is KeyDownEvent && event.logicalKey == LogicalKeyboardKey.delete) {
      final selectedId = ref.read(selectedWidgetNotifierProvider);
      if (selectedId != null) {
        ref.read(questionWidgetNotifierProvider.notifier).remove(selectedId);
        ref.read(selectedWidgetNotifierProvider.notifier).deselect();
      }
      return true;
    }
    return false;
  }

  @override
  Widget build(BuildContext context) {
    final widgets = ref.watch(questionWidgetNotifierProvider);
    final canvasSize = ref.watch(canvasSizeProvider);

    return Stack(
      clipBehavior: Clip.none,
      children: widgets.entries.map((entry) {
        final id = entry.key;
        final widgetModel = entry.value;

        return Positioned(
          left: widgetModel.x.clamp(0.0, canvasSize.width - widgetModel.width),
          top: widgetModel.y.clamp(0.0, canvasSize.height - widgetModel.height),
          width: widgetModel.width,
          height: widgetModel.height,
          child: DraggableResizableQuestionWidget(
            key: ValueKey(id),
            id: id,
            model: widgetModel,
            canvasSize: canvasSize,
          ),
        );
      }).toList(),
    );
  }
}

/// Draggable and resizable question widget
/// Uses local setState for drag/resize, commits to provider on completion
class DraggableResizableQuestionWidget extends ConsumerStatefulWidget {
  final String id;
  final QuestionWidgetModel model;
  final Size canvasSize;

  const DraggableResizableQuestionWidget({
    required Key key,
    required this.id,
    required this.model,
    required this.canvasSize,
  }) : super(key: key);

  @override
  ConsumerState<DraggableResizableQuestionWidget> createState() =>
      _DraggableResizableQuestionWidgetState();
}

class _DraggableResizableQuestionWidgetState
    extends ConsumerState<DraggableResizableQuestionWidget> {
  late Offset _position;
  late Size _size;
  bool _isDragging = false;
  ResizeHandle? _activeResizeHandle;

  @override
  void initState() {
    super.initState();
    _position = Offset(widget.model.x, widget.model.y);
    _size = Size(widget.model.width, widget.model.height);
  }

  @override
  void didUpdateWidget(DraggableResizableQuestionWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Sync with provider changes
    if (oldWidget.model.x != widget.model.x || oldWidget.model.y != widget.model.y) {
      _position = Offset(widget.model.x, widget.model.y);
    }
    if (oldWidget.model.width != widget.model.width || oldWidget.model.height != widget.model.height) {
      _size = Size(widget.model.width, widget.model.height);
    }
  }

  void _handleDragEnd() {
    // Clamp to canvas bounds
    final clampedX = _position.dx.clamp(0.0, widget.canvasSize.width - _size.width);
    final clampedY = _position.dy.clamp(0.0, widget.canvasSize.height - _size.height);
    final clampedPosition = Offset(clampedX, clampedY);

    ref.read(questionWidgetNotifierProvider.notifier).updatePosition(widget.id, clampedPosition);
    setState(() => _isDragging = false);
  }

  void _handleResizeEnd() {
    // Clamp size to min/max bounds
    final clampedWidth = _size.width.clamp(200.0, 1800.0);
    final clampedHeight = _size.height.clamp(100.0, 900.0);
    final clampedSize = Size(clampedWidth, clampedHeight);

    ref.read(questionWidgetNotifierProvider.notifier).updateSize(widget.id, clampedSize);
    setState(() => _activeResizeHandle = null);
  }

  @override
  Widget build(BuildContext context) {
    final isSelected = ref.watch(selectedWidgetNotifierProvider) == widget.id;
    final isLocked = widget.model.isLocked;

    return GestureDetector(
      onTap: () {
        if (!isLocked) {
          ref.read(selectedWidgetNotifierProvider.notifier).select(widget.id);
        }
      },
      onPanStart: isLocked ? null : (_) => setState(() => _isDragging = true),
      onPanUpdate: isLocked
          ? null
          : (details) {
              setState(() {
                _position += details.delta;
              });
            },
      onPanEnd: isLocked ? null : (_) => _handleDragEnd(),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          // Main widget content
          Material(
            color: Colors.transparent,
            child: Container(
              decoration: BoxDecoration(
                color: Color(widget.model.style.questionBgColorARGB),
                border: Border.all(
                  color: isSelected ? Colors.orange : Color(widget.model.style.borderColorARGB),
                  width: isSelected ? 3.0 : widget.model.style.borderWidth,
                ),
                borderRadius: BorderRadius.circular(widget.model.style.borderRadius),
                boxShadow: widget.model.style.hasShadow
                    ? [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.3),
                          blurRadius: 8,
                          offset: const Offset(2, 2),
                        ),
                      ]
                    : [],
              ),
              padding: EdgeInsets.all(widget.model.style.padding),
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Question text
                    Text(
                      widget.model.questionText,
                      style: TextStyle(
                        color: Color(widget.model.style.questionTextColorARGB),
                        fontSize: widget.model.style.questionFontSize.toDouble(),
                        fontFamily: widget.model.style.fontFamily,
                      ),
                    ),
                    SizedBox(height: 12),
                    // Options
                    ...widget.model.options.asMap().entries.map((entry) {
                      final index = entry.key;
                      final option = entry.value;
                      return Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: Row(
                          children: [
                            Container(
                              width: 28,
                              height: 28,
                              decoration: BoxDecoration(
                                color: Color(widget.model.style.optionBgColorARGB),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              alignment: Alignment.center,
                              child: Text(
                                option.label,
                                style: TextStyle(
                                  color: Color(widget.model.style.optionTextColorARGB),
                                  fontWeight: FontWeight.bold,
                                  fontSize: widget.model.style.optionFontSize.toDouble(),
                                ),
                              ),
                            ),
                            SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                option.text,
                                style: TextStyle(
                                  color: Color(widget.model.style.optionTextColorARGB),
                                  fontSize: widget.model.style.optionFontSize.toDouble(),
                                  fontFamily: widget.model.style.fontFamily,
                                ),
                              ),
                            ),
                          ],
                        ),
                      );
                    }).toList(),
                  ],
                ),
              ),
            ),
          ),

          // Selection overlay with resize handles
          if (isSelected && !isLocked) ...[
            // Resize handles (4 corners)
            Positioned(
              top: -6,
              left: -6,
              child: _ResizeHandle(
                handle: ResizeHandle.topLeft,
                onResizeStart: () => setState(() => _activeResizeHandle = ResizeHandle.topLeft),
                onResizeUpdate: (delta) {
                  setState(() {
                    _size = Size(
                      (_size.width - delta.dx).clamp(200.0, 1800.0),
                      (_size.height - delta.dy).clamp(100.0, 900.0),
                    );
                    _position = Offset(
                      _position.dx + delta.dx,
                      _position.dy + delta.dy,
                    );
                  });
                },
                onResizeEnd: () => _handleResizeEnd(),
              ),
            ),
            Positioned(
              top: -6,
              right: -6,
              child: _ResizeHandle(
                handle: ResizeHandle.topRight,
                onResizeStart: () => setState(() => _activeResizeHandle = ResizeHandle.topRight),
                onResizeUpdate: (delta) {
                  setState(() {
                    _size = Size(
                      (_size.width + delta.dx).clamp(200.0, 1800.0),
                      (_size.height - delta.dy).clamp(100.0, 900.0),
                    );
                    _position = Offset(
                      _position.dx,
                      _position.dy + delta.dy,
                    );
                  });
                },
                onResizeEnd: () => _handleResizeEnd(),
              ),
            ),
            Positioned(
              bottom: -6,
              left: -6,
              child: _ResizeHandle(
                handle: ResizeHandle.bottomLeft,
                onResizeStart: () => setState(() => _activeResizeHandle = ResizeHandle.bottomLeft),
                onResizeUpdate: (delta) {
                  setState(() {
                    _size = Size(
                      (_size.width - delta.dx).clamp(200.0, 1800.0),
                      (_size.height + delta.dy).clamp(100.0, 900.0),
                    );
                    _position = Offset(
                      _position.dx + delta.dx,
                      _position.dy,
                    );
                  });
                },
                onResizeEnd: () => _handleResizeEnd(),
              ),
            ),
            Positioned(
              bottom: -6,
              right: -6,
              child: _ResizeHandle(
                handle: ResizeHandle.bottomRight,
                onResizeStart: () => setState(() => _activeResizeHandle = ResizeHandle.bottomRight),
                onResizeUpdate: (delta) {
                  setState(() {
                    _size = Size(
                      (_size.width + delta.dx).clamp(200.0, 1800.0),
                      (_size.height + delta.dy).clamp(100.0, 900.0),
                    );
                  });
                },
                onResizeEnd: () => _handleResizeEnd(),
              ),
            ),

            // Action buttons (top-right corner)
            Positioned(
              top: -40,
              right: 0,
              child: Row(
                children: [
                  // Lock button
                  _ActionButton(
                    icon: Icons.lock_open,
                    tooltip: 'Lock',
                    onTap: () => ref.read(questionWidgetNotifierProvider.notifier).toggleLock(widget.id),
                  ),
                  SizedBox(width: 4),
                  // Delete button
                  _ActionButton(
                    icon: Icons.delete,
                    tooltip: 'Delete',
                    onTap: () {
                      ref.read(questionWidgetNotifierProvider.notifier).remove(widget.id);
                      ref.read(selectedWidgetNotifierProvider.notifier).deselect();
                    },
                  ),
                ],
              ),
            ),
          ],

          // Lock icon for locked widgets
          if (isLocked)
            Positioned(
              top: 4,
              right: 4,
              child: Icon(
                Icons.lock,
                size: 16,
                color: Colors.white.withOpacity(0.5),
              ),
            ),
        ],
      ),
    );
  }
}

// ── Resize Handle ────────────────────────────────────────────────────────────

enum ResizeHandle { topLeft, topRight, bottomLeft, bottomRight }

class _ResizeHandle extends StatefulWidget {
  final ResizeHandle handle;
  final VoidCallback onResizeStart;
  final ValueChanged<Offset> onResizeUpdate;
  final VoidCallback onResizeEnd;

  const _ResizeHandle({
    required this.handle,
    required this.onResizeStart,
    required this.onResizeUpdate,
    required this.onResizeEnd,
  });

  @override
  State<_ResizeHandle> createState() => _ResizeHandleState();
}

class _ResizeHandleState extends State<_ResizeHandle> {
  bool _isResizing = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onPanStart: (_) {
        setState(() => _isResizing = true);
        widget.onResizeStart();
      },
      onPanUpdate: (details) => widget.onResizeUpdate(details.delta),
      onPanEnd: (_) {
        setState(() => _isResizing = false);
        widget.onResizeEnd();
      },
      child: MouseRegion(
        cursor: _getCursor(),
        child: Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: _isResizing ? Colors.orange : Colors.white,
            borderRadius: BorderRadius.circular(2),
            border: Border.all(color: Colors.orange, width: 2),
          ),
        ),
      ),
    );
  }

  SystemMouseCursor _getCursor() {
    return switch (widget.handle) {
      ResizeHandle.topLeft => SystemMouseCursors.resizeUpLeft,
      ResizeHandle.topRight => SystemMouseCursors.resizeUpRight,
      ResizeHandle.bottomLeft => SystemMouseCursors.resizeDownLeft,
      ResizeHandle.bottomRight => SystemMouseCursors.resizeDownRight,
    };
  }
}

// ── Action Button ────────────────────────────────────────────────────────────

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String tooltip;
  final VoidCallback onTap;

  const _ActionButton({
    required this.icon,
    required this.tooltip,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            color: Colors.black.withOpacity(0.7),
            borderRadius: BorderRadius.circular(4),
          ),
          child: Icon(
            icon,
            size: 16,
            color: Colors.white,
          ),
        ),
      ),
    );
  }
}
