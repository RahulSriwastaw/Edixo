// lib/features/whiteboard/presentation/widgets/subject_tools/text_box_widget.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/constants/app_dimensions.dart';
import '../../../../../core/constants/app_text_styles.dart';

/// TextBox tool - tap to place, double-tap to edit
class TextBoxWidget extends ConsumerStatefulWidget {
  final String id;
  final Offset initialPosition;

  const TextBoxWidget({
    super.key,
    required this.id,
    required this.initialPosition,
  });

  @override
  ConsumerState<TextBoxWidget> createState() => _TextBoxWidgetState();
}

class _TextBoxWidgetState extends ConsumerState<TextBoxWidget> {
  late Offset _position;
  late Size _size;
  bool _isEditing = false;
  bool _isDragging = false;
  late TextEditingController _controller;
  late FocusNode _focusNode;

  @override
  void initState() {
    super.initState();
    _position = widget.initialPosition;
    _size = const Size(300, 100);
    _controller = TextEditingController();
    _focusNode = FocusNode();
  }

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _startEditing() {
    setState(() => _isEditing = true);
    _focusNode.requestFocus();
  }

  void _stopEditing() {
    setState(() => _isEditing = false);
    _focusNode.unfocus();
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
        onDoubleTap: _startEditing,
        child: Container(
          width: _size.width,
          constraints: BoxConstraints(
            minHeight: 50,
            minWidth: 100,
            maxWidth: 800,
          ),
          padding: EdgeInsets.all(AppDimensions.borderRadiusM),
          decoration: BoxDecoration(
            color: AppColors.bgSecondary.withOpacity(0.9),
            borderRadius: BorderRadius.circular(AppDimensions.borderRadiusS),
            border: Border.all(
              color: _isEditing ? AppColors.accentOrange : AppColors.textTertiary.withOpacity(0.3),
              width: _isEditing ? 2 : 1,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.2),
                blurRadius: 4,
                offset: const Offset(1, 1),
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
                  minLines: 3,
                  style: AppTextStyles.body.copyWith(color: AppColors.textPrimary),
                  decoration: InputDecoration(
                    border: InputBorder.none,
                    hintText: 'Type here...',
                    hintStyle: AppTextStyles.body.copyWith(color: AppColors.textTertiary),
                    contentPadding: EdgeInsets.zero,
                  ),
                  onSubmitted: (_) => _stopEditing(),
                ),
                // Done button
                Positioned(
                  top: 0,
                  right: 0,
                  child: GestureDetector(
                    onTap: _stopEditing,
                    child: Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        color: AppColors.accentOrange,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(Icons.check, size: 16, color: Colors.white),
                    ),
                  ),
                ),
              ] else ...[
                // Display mode
                Text(
                  _controller.text.isEmpty ? 'Double-tap to edit' : _controller.text,
                  style: AppTextStyles.body.copyWith(
                    color: _controller.text.isEmpty
                        ? AppColors.textTertiary
                        : AppColors.textPrimary,
                  ),
                ),
                // Resize handle
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: GestureDetector(
                    onPanUpdate: (details) {
                      setState(() {
                        _size = Size(
                          (_size.width + details.delta.dx).clamp(100.0, 800.0),
                          (_size.height + details.delta.dy).clamp(50.0, 600.0),
                        );
                      });
                    },
                    child: Container(
                      width: 16,
                      height: 16,
                      child: Icon(Icons.drag_handle, size: 16, color: AppColors.textTertiary),
                    ),
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
