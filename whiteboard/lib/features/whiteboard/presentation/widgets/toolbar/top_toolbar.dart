import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/constants/app_dimensions.dart';
import '../../../../../core/constants/app_text_styles.dart';
import '../../../presentation/providers/session_provider.dart';
import '../../../presentation/providers/slide_provider.dart';
import '../dialogs/import_content_dialog.dart';
import '../dialogs/end_class_dialog.dart';
import '../dialogs/background_settings_dialog.dart';

class TopToolbar extends ConsumerWidget {
  const TopToolbar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sessionState = ref.watch(sessionNotifierProvider);
    final slideState   = ref.watch(slideNotifierProvider);
    final hasSlides    = slideState.hasSlides;
    final setName      = slideState.setMetadata?.title ?? (hasSlides ? 'Imported Set' : 'EduBoard Pro');
    final slideIndex   = slideState.currentSlideIndex;
    final totalSlides  = slideState.slides.length;

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
