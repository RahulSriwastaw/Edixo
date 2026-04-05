import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/constants/app_dimensions.dart';
import '../../../../../core/constants/app_text_styles.dart';
import '../../providers/slide_provider.dart';

class NextQuestionPreviewPanel extends ConsumerWidget {
  const NextQuestionPreviewPanel({super.key});

  String _stripHtmlTags(String htmlString) {
    // Simple HTML tag removal - replace common tags with empty string
    String text = htmlString
        .replaceAll(RegExp(r'<[^>]*>'), ' ')  // Remove all tags
        .replaceAll(RegExp(r'&nbsp;'), ' ')   // Replace entities
        .replaceAll(RegExp(r'&amp;'), '&')
        .replaceAll(RegExp(r'&lt;'), '<')
        .replaceAll(RegExp(r'&gt;'), '>')
        .replaceAll(RegExp(r'&quot;'), '"')
        .replaceAll(RegExp(r'&#39;'), "'")
        .replaceAll(RegExp(r'\s+'), ' ')      // Collapse multiple spaces
        .trim();
    return text;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final slideState = ref.watch(slideNotifierProvider);
    final currentIndex = slideState.currentSlideIndex;
    final slides = slideState.slides;

    // Check if there's a next slide
    if (!slideState.hasSlides || currentIndex >= slides.length - 1) {
      return Container(
        width: 300,
        decoration: BoxDecoration(
          color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(AppDimensions.borderRadiusL),
          border: Border.all(
            color: AppColors.textTertiary.withValues(alpha: 0.2),
          ),
        ),
        padding: const EdgeInsets.all(AppDimensions.borderRadiusL),
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.check_circle_outline,
                color: AppColors.textSecondary,
                size: 40,
              ),
              const SizedBox(height: 12),
              Text(
                'No More Questions',
                style: AppTextStyles.body.copyWith(
                  color: AppColors.textSecondary,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'You\'ve reached the last question.',
                style: AppTextStyles.caption.copyWith(
                  color: AppColors.textTertiary,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      );
    }

    final nextSlide = slides[currentIndex + 1];
    final questionText = _stripHtmlTags(nextSlide.questionText);
    final questionNum = nextSlide.questionNumber;

    return Container(
      width: 320,
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(AppDimensions.borderRadiusL),
        border: Border.all(
          color: AppColors.accentOrange.withValues(alpha: 0.3),
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.accentOrange.withValues(alpha: 0.1),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(AppDimensions.borderRadiusL),
            decoration: BoxDecoration(
              color: AppColors.accentOrange.withValues(alpha: 0.1),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(AppDimensions.borderRadiusL),
                topRight: Radius.circular(AppDimensions.borderRadiusL),
              ),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.preview_outlined,
                  color: AppColors.accentOrange,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Text(
                  'Next Question',
                  style: AppTextStyles.body.copyWith(
                    color: AppColors.accentOrange,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),

          // Question Number & Preview
          Expanded(
            child: SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(AppDimensions.borderRadiusL),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Question Number
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppDimensions.borderRadiusM,
                        vertical: AppDimensions.borderRadiusS,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.accentOrange.withValues(alpha: 0.15),
                        borderRadius:
                            BorderRadius.circular(AppDimensions.borderRadiusM),
                      ),
                      child: Text(
                        'Question $questionNum',
                        style: AppTextStyles.caption.copyWith(
                          color: AppColors.accentOrange,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),

                    const SizedBox(height: 12),

                    // Question Text
                    Text(
                      questionText,
                      style: AppTextStyles.body.copyWith(
                        color: AppColors.textPrimary,
                        height: 1.5,
                      ),
                      maxLines: 6,
                      overflow: TextOverflow.ellipsis,
                    ),

                    // Question Image (if available)
                    if (nextSlide.questionImageUrl != null) ...[
                      const SizedBox(height: 12),
                      ClipRRect(
                        borderRadius:
                            BorderRadius.circular(AppDimensions.borderRadiusM),
                        child: Container(
                          height: 120,
                          color: AppColors.bgPrimary,
                          child: Image.network(
                            nextSlide.questionImageUrl!,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => Center(
                              child: Icon(
                                Icons.image_not_supported,
                                color: AppColors.textTertiary,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],

                    // Options Preview
                    if (nextSlide.options.isNotEmpty) ...[
                      const SizedBox(height: 14),
                      Text(
                        'Options:',
                        style: AppTextStyles.caption.copyWith(
                          color: AppColors.textSecondary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      ...nextSlide.options.take(4).map((option) {
                        return Padding(
                          padding: const EdgeInsets.only(bottom: 6),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 24,
                                height: 24,
                                decoration: BoxDecoration(
                                  color: AppColors.accentOrange
                                      .withValues(alpha: 0.2),
                                  borderRadius: BorderRadius.circular(4),
                                  border: Border.all(
                                    color: AppColors.accentOrange
                                        .withValues(alpha: 0.5),
                                  ),
                                ),
                                child: Center(
                                  child: Text(
                                    option.label,
                                    style: AppTextStyles.caption.copyWith(
                                      color: AppColors.accentOrange,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  option.text,
                                  style: AppTextStyles.caption.copyWith(
                                    color: AppColors.textSecondary,
                                  ),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                        );
                      }),
                    ],

                    const SizedBox(height: 8),

                    // Slide counter
                    Text(
                      '${currentIndex + 1} / ${slides.length}',
                      style: AppTextStyles.caption.copyWith(
                        color: AppColors.textTertiary,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Footer with Navigation
          Padding(
            padding: const EdgeInsets.all(AppDimensions.borderRadiusL),
            child: Row(
              children: [
                Text(
                  '→ Next',
                  style: AppTextStyles.caption.copyWith(
                    color: AppColors.accentOrange,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const Spacer(),
                Icon(
                  Icons.arrow_forward,
                  color: AppColors.accentOrange.withValues(alpha: 0.6),
                  size: 16,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
