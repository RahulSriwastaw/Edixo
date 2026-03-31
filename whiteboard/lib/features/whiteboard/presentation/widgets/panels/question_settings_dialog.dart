import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_colorpicker/flutter_colorpicker.dart';
import '../../../providers/canvas_provider.dart';
import '../../../../../core/theme/app_theme.dart';

class QuestionSettingsDialog extends ConsumerWidget {
  const QuestionSettingsDialog({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final canvasState = ref.watch(canvasStateProvider);
    final theme = canvasState.questionTheme;

    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: EdgeInsets.symmetric(horizontal: 20.w, vertical: 20.h),
      child: Container(
        width: 450.w,
        padding: EdgeInsets.all(24.w),
        decoration: BoxDecoration(
          color: const Color(0xFF1E1E2C),
          borderRadius: BorderRadius.circular(20.r),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.5),
              blurRadius: 20,
              spreadRadius: 5,
            ),
          ],
          border: Border.all(color: Colors.white10),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(Icons.settings_suggest_outlined, color: AppTheme.primaryOrange, size: 24.w),
                    SizedBox(width: 12.w),
                    Text(
                      'Presentation Settings',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 18.sp,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(Icons.close, color: Colors.white54),
                ),
              ],
            ),
            const Divider(color: Colors.white10, height: 32),

            _buildSectionHeader('Question Styles'),
            SizedBox(height: 12.h),
            Row(
              children: [
                _buildColorButton(
                  context, 
                  ref, 
                  'Question Color', 
                  theme.questionColor, 
                  (c) => _updateTheme(ref, theme.copyWith(questionColor: c)),
                ),
                SizedBox(width: 12.w),
                _buildColorButton(
                  context, 
                  ref, 
                  'Question BG', 
                  theme.questionBgColor, 
                  (c) => _updateTheme(ref, theme.copyWith(questionBgColor: c)),
                ),
              ],
            ),

            SizedBox(height: 24.h),
            _buildSectionHeader('Option Styles'),
            SizedBox(height: 12.h),
            Row(
              children: [
                _buildColorButton(
                  context, 
                  ref, 
                  'Option Color', 
                  theme.optionColor, 
                  (c) => _updateTheme(ref, theme.copyWith(optionColor: c)),
                ),
                SizedBox(width: 12.w),
                _buildColorButton(
                  context, 
                  ref, 
                  'Option BG', 
                  theme.optionBgColor, 
                  (c) => _updateTheme(ref, theme.copyWith(optionBgColor: c)),
                ),
              ],
            ),

            SizedBox(height: 24.h),
            _buildSectionHeader('Canvas'),
            SizedBox(height: 12.h),
            Row(
              children: [
                _buildColorButton(
                  context, 
                  ref, 
                  'Screen BG', 
                  theme.screenBgColor, 
                  (c) => _updateTheme(ref, theme.copyWith(screenBgColor: c)),
                ),
              ],
            ),

            SizedBox(height: 32.h),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Update Position',
                  style: TextStyle(color: Colors.white70, fontSize: 14.sp),
                ),
                Switch(
                  value: theme.updatePosition,
                  onChanged: (v) => _updateTheme(ref, theme.copyWith(updatePosition: v)),
                  activeColor: AppTheme.primaryOrange,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _updateTheme(WidgetRef ref, QuestionTheme theme) {
    ref.read(canvasStateProvider.notifier).setQuestionTheme(theme);
    // Also update screen background if relevant
    ref.read(canvasStateProvider.notifier).setBackgroundColor(theme.screenBgColor);
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title.toUpperCase(),
      style: TextStyle(
        color: Colors.white38,
        fontSize: 10.sp,
        fontWeight: FontWeight.bold,
        letterSpacing: 1.2,
      ),
    );
  }

  Widget _buildColorButton(
    BuildContext context, 
    WidgetRef ref, 
    String label, 
    Color color, 
    ValueChanged<Color> onColorChanged,
  ) {
    return Expanded(
      child: GestureDetector(
        onTap: () => _pickColor(context, label, color, onColorChanged),
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 10.h),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(8.r),
            border: Border.all(color: Colors.white10),
          ),
          child: Row(
            children: [
              Container(
                width: 20.w,
                height: 20.w,
                decoration: BoxDecoration(
                  color: color,
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white24),
                ),
              ),
              SizedBox(width: 10.w),
              Expanded(
                child: Text(
                  label,
                  style: TextStyle(color: Colors.white, fontSize: 11.sp),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _pickColor(BuildContext context, String title, Color currentColor, ValueChanged<Color> onColorChanged) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Pick $title'),
        content: SingleChildScrollView(
          child: ColorPicker(
            pickerColor: currentColor,
            onColorChanged: onColorChanged,
            pickerAreaHeightPercent: 0.8,
          ),
        ),
        actions: [
          TextButton(
            child: const Text('DONE'),
            onPressed: () => Navigator.of(context).pop(),
          ),
        ],
      ),
    );
  }
}
