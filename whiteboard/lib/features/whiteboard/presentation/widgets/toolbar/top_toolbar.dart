import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/constants/app_dimensions.dart';
import '../../../../../core/constants/app_text_styles.dart';
import '../../../presentation/providers/session_provider.dart';
import '../../../presentation/providers/slide_provider.dart';
import '../../../data/models/page_models.dart';
import '../dialogs/import_content_dialog.dart';
import '../dialogs/end_class_dialog.dart';
import '../dialogs/background_settings_dialog.dart';
import '../set_settings_bottom_sheet.dart';

class TopToolbar extends ConsumerWidget {
  final VoidCallback onToggleAi;
  final VoidCallback onToggleTimer;
  final bool isAiActive;
  final bool isTimerActive;

  const TopToolbar({
    super.key,
    required this.onToggleAi,
    required this.onToggleTimer,
    required this.isAiActive,
    required this.isTimerActive,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sessionState = ref.watch(sessionNotifierProvider);
    final slideState   = ref.watch(slideNotifierProvider);
    final slideNotifier = ref.read(slideNotifierProvider.notifier);
    
    final hasSlides    = slideState.hasSlides;
    final setName      = slideState.setMetadata?.title ?? (hasSlides ? 'Imported Set' : 'EduBoard Pro');
    final slideIndex   = slideState.currentPageIndex;
    final totalSlides  = slideState.pages.length;
    
    final currentPage = slideState.currentPage;
    final int? currentQuestion = (currentPage is SetImportPage) ? currentPage.slide.questionNumber : null;


    return Container(
      height: AppDimensions.topBarHeight,
      padding: const EdgeInsets.symmetric(horizontal: AppDimensions.borderRadiusL),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary.withValues(alpha: 0.9),
        border: Border(
          bottom: BorderSide(
            color: AppColors.textTertiary.withValues(alpha: 0.1),
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: [
          // 1. Menu Button
          IconButton(
            icon: const Icon(Icons.menu, color: AppColors.textPrimary),
            onPressed: () => Scaffold.of(context).openDrawer(),
            tooltip: 'Menu',
          ),

          const SizedBox(width: AppDimensions.borderRadiusM),

          // 2. Set name + slide indicator
          Expanded(
            child: Row(
              children: [
                Flexible(
                  child: Text(
                    setName,
                    style: AppTextStyles.body.copyWith(
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.w600,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                if (hasSlides) ...
                [
                  const SizedBox(width: 8),
                  Text(
                    '${slideIndex + 1} / $totalSlides',
                    style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary),
                  ),
                ],
              ],
            ),
          ),

          // 3. Save Status Indicator
          _SaveStatusIndicator(status: sessionState.saveStatus),

          const SizedBox(width: AppDimensions.borderRadiusL),

          // Slide Navigation Buttons (Added per request)
          if (hasSlides) ...[
            IconButton(
              icon: const Icon(Icons.chevron_left),
              color: slideIndex > 0 ? AppColors.textPrimary : Colors.white24,
              tooltip: 'Previous Slide',
              onPressed: slideIndex > 0 ? () => slideNotifier.navigateToSlide(slideIndex - 1) : null,
            ),
            IconButton(
              icon: const Icon(Icons.chevron_right),
              color: slideIndex < totalSlides - 1 ? AppColors.textPrimary : Colors.white24,
              tooltip: 'Next Slide',
              onPressed: slideIndex < totalSlides - 1 ? () => slideNotifier.navigateToSlide(slideIndex + 1) : null,
            ),
            const SizedBox(width: AppDimensions.borderRadiusL),
          ],

          // Timer Toggle
          IconButton(
            onPressed: onToggleTimer,
            icon: Icon(isTimerActive ? Icons.timer_off : Icons.timer, color: isTimerActive ? AppColors.accentOrange : AppColors.textPrimary),
            tooltip: isTimerActive ? 'Hide Timer' : 'Show Timer',
          ),
          const SizedBox(width: 8),
          
          // AI Assistant Toggle
          ElevatedButton.icon(
            onPressed: onToggleAi,
            icon: const Icon(Icons.smart_toy, size: 18),
            label: const Text('AI'),
            style: ElevatedButton.styleFrom(
              backgroundColor: isAiActive ? Colors.white12 : Colors.orange,
              foregroundColor: isAiActive ? Colors.orange : Colors.black,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
          ),
          const SizedBox(width: AppDimensions.borderRadiusM),

          // Question Settings (Added per request)
          if (currentQuestion != null) ...[
            ElevatedButton.icon(
              onPressed: () {
                showModalBottomSheet(
                  context: context,
                  backgroundColor: Colors.transparent,
                  isScrollControlled: true,
                  builder: (_) => SetSettingsBottomSheet(currentQuestionNumber: currentQuestion),
                );
              },
              icon: const Icon(Icons.settings, size: 18),
              label: const Text('Q-Settings'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.accentOrange,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                  horizontal: AppDimensions.borderRadiusL,
                  vertical: AppDimensions.borderRadiusS,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
                ),
              ),
            ),
            const SizedBox(width: AppDimensions.borderRadiusM),
          ],

          // 4. Import (Set / PDF) Button
          ElevatedButton.icon(
            onPressed: () => showImportContentDialog(context),
            icon: const Icon(Icons.download_rounded, size: 18),
            label: const Text('Import'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.accentOrange,
              foregroundColor: AppColors.bgPrimary,
              padding: const EdgeInsets.symmetric(
                horizontal: AppDimensions.borderRadiusL,
                vertical: AppDimensions.borderRadiusS,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
              ),
            ),
          ),

          const SizedBox(width: AppDimensions.borderRadiusM),

          // 5. Background Settings Button
          IconButton(
            icon: const Icon(Icons.image_search_outlined, size: 20),
            color: AppColors.textPrimary,
            tooltip: 'Background Settings',
            onPressed: () => showBackgroundSettingsDialog(context),
          ),

          const SizedBox(width: AppDimensions.borderRadiusM),

          // 6. End Class Button
          OutlinedButton.icon(
            onPressed: () => _showEndClassDialog(context),
            icon: const Icon(Icons.stop, size: 18),
            label: const Text('End Class'),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.error,
              side: const BorderSide(color: AppColors.error),
              padding: const EdgeInsets.symmetric(
                horizontal: AppDimensions.borderRadiusL,
                vertical: AppDimensions.borderRadiusS,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showEndClassDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => const EndClassDialog(),
    );
  }
}

// ── Save Status Indicator ────────────────────────────────────────────────────

class _SaveStatusIndicator extends StatelessWidget {
  final SaveStatus status;

  const _SaveStatusIndicator({required this.status});

  @override
  Widget build(BuildContext context) {
    final (icon, color, label) = switch (status) {
      SaveStatus.idle => (Icons.check_circle, AppColors.success, ''),
      SaveStatus.saving => (Icons.sync, AppColors.accentOrange, 'Saving...'),
      SaveStatus.saved => (Icons.check_circle, AppColors.success, 'Saved'),
      SaveStatus.failed => (Icons.error, AppColors.error, 'Failed'),
    };

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: color),
        if (label.isNotEmpty) ...[
          const SizedBox(width: 4),
          Text(
            label,
            style: AppTextStyles.caption.copyWith(color: color),
          ),
        ],
      ],
    );
  }
}
