// lib/features/whiteboard/presentation/widgets/teaching_tools/screen_cover.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/constants/app_text_styles.dart';

/// Screen cover overlay - hides content from students
/// Used when teacher wants to prepare next slide without students seeing
class ScreenCover extends ConsumerStatefulWidget {
  const ScreenCover({super.key});

  @override
  ConsumerState<ScreenCover> createState() => _ScreenCoverState();
}

class _ScreenCoverState extends ConsumerState<ScreenCover> {
  bool _isActive = false;
  String _message = 'Preparing next slide...';

  @override
  Widget build(BuildContext context) {
    if (!_isActive) {
      return Positioned(
        bottom: 100,
        right: 20,
        child: ElevatedButton.icon(
          onPressed: () => setState(() => _isActive = true),
          icon: Icon(Icons.visibility_off, size: 18),
          label: Text('Cover Screen'),
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.bgSecondary,
            foregroundColor: AppColors.textPrimary,
            padding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 12,
            ),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
      );
    }

    return GestureDetector(
      onTap: () => setState(() => _isActive = false),
      child: Container(
        color: Colors.black,
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.visibility_off,
                size: 80,
                color: AppColors.textDisabled,
              ),
              const SizedBox(height: 32),
              Text(
                _message,
                style: AppTextStyles.heading1.copyWith(
                  color: AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 16),
              Text(
                'Tap anywhere to reveal',
                style: AppTextStyles.body.copyWith(
                  color: AppColors.textDisabled,
                ),
              ),
              const SizedBox(height: 32),
              // Message selector
              Wrap(
                spacing: 12,
                runSpacing: 12,
                children: [
                  _MessageChip(
                    label: 'Preparing...',
                    isSelected: _message == 'Preparing next slide...',
                    onTap: () => setState(() => _message = 'Preparing next slide...'),
                  ),
                  _MessageChip(
                    label: 'Wait...',
                    isSelected: _message == 'Please wait...',
                    onTap: () => setState(() => _message = 'Please wait...'),
                  ),
                  _MessageChip(
                    label: 'Break Time',
                    isSelected: _message == 'Break time - be right back!',
                    onTap: () => setState(() => _message = 'Break time - be right back!'),
                  ),
                  _MessageChip(
                    label: 'Quiz Time',
                    isSelected: _message == 'Get your notebooks ready!',
                    onTap: () => setState(() => _message = 'Get your notebooks ready!'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _MessageChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _MessageChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 12,
        ),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.accentOrange : AppColors.bgSecondary,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? AppColors.accentOrange : AppColors.textDisabled.withOpacity(0.3),
            width: 2,
          ),
        ),
        child: Text(
          label,
          style: AppTextStyles.body.copyWith(
            color: isSelected ? AppColors.bgPrimary : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }
}
