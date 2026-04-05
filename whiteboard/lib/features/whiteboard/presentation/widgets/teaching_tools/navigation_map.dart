// lib/features/whiteboard/presentation/widgets/teaching_tools/navigation_map.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/constants/app_text_styles.dart';
import '../../providers/slide_provider.dart';
import '../../providers/session_provider.dart';

/// Navigation map - shows all slides as thumbnails for quick navigation
class NavigationMap extends ConsumerWidget {
  const NavigationMap({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final slideState = ref.watch(slideNotifierProvider);
    final sessionState = ref.watch(sessionNotifierProvider);

    return Container(
      width: 320,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary.withValues(alpha: 0.95),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.textDisabled.withValues(alpha: 0.2)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              const Icon(Icons.map, color: AppColors.accentOrange, size: 20),
              const SizedBox(width: 8),
              Text(
                'Navigation Map',
                style: AppTextStyles.heading3,
              ),
              const Spacer(),
              Text(
                '${slideState.slides.length} slides',
                style: AppTextStyles.caption.copyWith(color: AppColors.textTertiary),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // Slide thumbnails
          Expanded(
            child: ListView.builder(
              itemCount: slideState.slides.length,
              itemBuilder: (context, index) {
                final slide = slideState.slides[index];
                final isCurrentSlide = index == slideState.currentSlideIndex;
                final isCovered = sessionState.slidesCovered.contains(index);

                return Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: _SlideThumbnail(
                    slideNumber: index + 1,
                    questionText: slide.questionText,
                    isCurrentSlide: isCurrentSlide,
                    isCovered: isCovered,
                    onTap: () {
                      ref.read(slideNotifierProvider.notifier).navigateToSlide(index);
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _SlideThumbnail extends StatelessWidget {
  final int slideNumber;
  final String questionText;
  final bool isCurrentSlide;
  final bool isCovered;
  final VoidCallback onTap;

  const _SlideThumbnail({
    required this.slideNumber,
    required this.questionText,
    required this.isCurrentSlide,
    required this.isCovered,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isCurrentSlide
              ? AppColors.accentOrange.withValues(alpha: 0.2)
              : AppColors.bgPrimary,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isCurrentSlide
                ? AppColors.accentOrange
                : AppColors.textDisabled.withValues(alpha: 0.2),
            width: isCurrentSlide ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            // Slide number
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: isCovered ? AppColors.success : AppColors.textDisabled,
                borderRadius: BorderRadius.circular(4),
              ),
              alignment: Alignment.center,
              child: Text(
                '$slideNumber',
                style: AppTextStyles.bodySmall.copyWith(
                  color: isCovered ? AppColors.bgPrimary : AppColors.textPrimary,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(width: 12),

            // Question preview
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    questionText.length > 50
                        ? '${questionText.substring(0, 50)}...'
                        : questionText,
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (isCurrentSlide) ...[
                    const SizedBox(height: 4),
                    Text(
                      '● Current',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.accentOrange,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ],
              ),
            ),

            // Covered indicator
            if (isCovered)
              const Icon(
                Icons.check_circle,
                color: AppColors.success,
                size: 18,
              ),
          ],
        ),
      ),
    );
  }
}
