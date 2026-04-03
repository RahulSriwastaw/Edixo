// lib/features/whiteboard/presentation/widgets/subject_tools/sticky_note_widget.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/constants/app_dimensions.dart';
import '../../../../../core/constants/app_text_styles.dart';

/// StickyNote - draggable note for annotations
class StickyNoteWidget extends ConsumerStatefulWidget {
  final String id;
  final Offset initialPosition;
  final Color noteColor;

  const StickyNoteWidget({
    super.key,
    required this.id,
    required this.initialPosition,
    this.noteColor = Colors.yellow,
  });

  @override
  ConsumerState<StickyNoteWidget> createState() => _StickyNoteWidgetState();
}

class _StickyNoteWidgetState extends ConsumerState<StickyNoteWidget> {
  late Offset _position;
  bool _isEditing = false;
  bool _isDragging = false;
  late TextEditingController _controller;
  late FocusNode _focusNode;

  @override
  void initState() {
    super.initState();
    _position = widget.initialPosition;
    _controller = TextEditingController();
    _focusNode = FocusNode();
  }

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Positioned(
      left: _position.dx,
      top: _position.dy,
      child: GestureDetector(
        onPanStart: _isEditing ? null : (_) => setState(() => _isDragging = true),
        onPanUpdate: _isEditing
            ? null
            : (details) {
                setState(() {
                  _position += details.delta;
                });
              },
        onPanEnd: _isEditing ? null : (_) => setState(() => _isDragging = false),
        onTap: _isEditing ? null : () => setState(() => _isEditing = true),
        child: Container(
          width: 200,
          height: 200,
          padding: EdgeInsets.all(AppDimensions.borderRadiusM),
          decoration: BoxDecoration(
            color: widget.noteColor.withOpacity(0.9),
            borderRadius: BorderRadius.circular(AppDimensions.borderRadiusS),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.3),
                blurRadius: 8,
                offset: const Offset(3, 3),
              ),
            ],
          ),
          child: Stack(
            children: [
              if (_isEditing) ...[
                TextField(
                  controller: _controller,
                  focusNode: _focusNode,
                  maxLines: null,
                  style: TextStyle(
                    color: Colors.black87,
                    fontSize: 14,
                    fontFamily: 'Noto Sans Devanagari',
                  ),
                  decoration: InputDecoration(
                    border: InputBorder.none,
                    hintText: 'Write note...',
                    hintStyle: TextStyle(color: Colors.black45),
                    contentPadding: EdgeInsets.zero,
                  ),
                  onSubmitted: (_) => setState(() => _isEditing = false),
                ),
                // Close button
                Positioned(
                  top: 0,
                  right: 0,
                  child: GestureDetector(
                    onTap: () => setState(() => _isEditing = false),
                    child: Icon(Icons.check_circle, color: Colors.black54, size: 20),
                  ),
                ),
              ] else ...[
                Text(
                  _controller.text.isEmpty ? 'Tap to edit' : _controller.text,
                  style: TextStyle(
                    color: _controller.text.isEmpty ? Colors.black45 : Colors.black87,
                    fontSize: 14,
                  ),
                ),
                // Delete button
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: GestureDetector(
                    onTap: () {
                      // Remove from parent
                    },
                    child: Icon(Icons.close, color: Colors.black54, size: 18),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
