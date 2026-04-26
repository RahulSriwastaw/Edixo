import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../core/theme/app_theme_colors.dart';
import '../../../../../core/theme/app_theme_text_styles.dart';
import '../../../../../core/theme/app_theme_dimensions.dart';
import '../../../../../core/theme/theme_toggle_button.dart';
import '../../../presentation/providers/session_provider.dart';
import '../../../presentation/providers/slide_provider.dart';
import '../../../data/models/page_models.dart';
import '../dialogs/import_content_dialog.dart';
import '../dialogs/end_class_dialog.dart';
import '../dialogs/pdf_export_dialog.dart';
import '../dialogs/pdf_upload_dialog.dart';
import '../set_settings_bottom_sheet.dart';
import '../../providers/floating_overlay_provider.dart';
import '../overlays/floating_movable_panel.dart';

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
    final theme = AppThemeColors.of(context);
    
    final hasSlides    = slideState.hasSlides;
    final firstSet     = slideState.importedSets.isNotEmpty ? slideState.importedSets.first : null;
    final setName      = firstSet?.title ?? (hasSlides ? 'Imported Set' : 'EduBoard Pro');
    final slideIndex   = slideState.currentPageIndex;
    final totalSlides  = slideState.pages.length;

    final currentPage = slideState.currentPage;
    final int? currentQuestion = (currentPage is SetImportPage) ? currentPage.slide.questionNumber : null;


    return Container(
      height: AppThemeDimensions.topBarHeight,
      padding: const EdgeInsets.symmetric(horizontal: AppThemeDimensions.paddingL),
      decoration: BoxDecoration(
        color: theme.bgSidebar.withValues(alpha: 0.95),
        border: Border(
          bottom: BorderSide(
            color: theme.divider,
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: [
          // 1. Menu Button
          IconButton(
            icon: Icon(Icons.menu, color: theme.textPrimary, size: AppThemeDimensions.toolIconSize),
            onPressed: () => Scaffold.of(context).openDrawer(),
            tooltip: 'Menu',
            padding: const EdgeInsets.all(6),
            constraints: const BoxConstraints(minWidth: 34, minHeight: 34),
          ),

          const SizedBox(width: AppThemeDimensions.gapM),

          // 2. Set name + slide indicator
          Expanded(
            child: Row(
              children: [
                Flexible(
                  child: Text(
                    setName,
                    style: AppThemeTextStyles.navLabel(context).copyWith(
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
                    style: AppThemeTextStyles.caption(context),
                  ),
                ],
              ],
            ),
          ),

          // 3. Save Status Indicator
          _SaveStatusIndicator(status: sessionState.saveStatus),

          const SizedBox(width: AppThemeDimensions.gapL),

          // Slide Navigation Buttons
          if (hasSlides) ...[
            IconButton(
              icon: const Icon(Icons.chevron_left, size: 20),
              color: slideIndex > 0 ? theme.textPrimary : theme.textMuted,
              tooltip: 'Previous Slide',
              onPressed: slideIndex > 0 ? () => slideNotifier.navigateToSlide(slideIndex - 1) : null,
              padding: const EdgeInsets.all(6),
              constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
            ),
            IconButton(
              icon: const Icon(Icons.chevron_right, size: 20),
              color: slideIndex < totalSlides - 1 ? theme.textPrimary : theme.textMuted,
              tooltip: 'Next Slide',
              onPressed: slideIndex < totalSlides - 1 ? () => slideNotifier.navigateToSlide(slideIndex + 1) : null,
              padding: const EdgeInsets.all(6),
              constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
            ),
            const SizedBox(width: AppThemeDimensions.gapM),
          ],

          // Timer Toggle
          IconButton(
            onPressed: onToggleTimer,
            icon: Icon(isTimerActive ? Icons.timer_off : Icons.timer, 
              color: isTimerActive ? theme.accentOrange : theme.textPrimary, 
              size: 20),
            tooltip: isTimerActive ? 'Hide Timer' : 'Show Timer',
            padding: const EdgeInsets.all(6),
            constraints: const BoxConstraints(minWidth: 34, minHeight: 34),
          ),
          const SizedBox(width: AppThemeDimensions.gapXS),

          // Theme Toggle (Sun/Moon) - in top-right per spec
          const ThemeToggleButton(iconSize: 20),
          const SizedBox(width: AppThemeDimensions.gapXS),

          // AI Assistant Toggle
          _PrimaryButton(
            onPressed: onToggleAi,
            icon: Icons.smart_toy,
            label: 'AI',
            isActive: isAiActive,
          ),
          const SizedBox(width: AppThemeDimensions.gapM),

          // Question Settings
          if (currentQuestion != null) ...[
            _PrimaryButton(
              onPressed: () {
                ref.read(floatingOverlayNotifierProvider.notifier).togglePanel(
                  'setSettings',
                  FloatingMovablePanel(
                    panelId: 'setSettings',
                    title: 'Set Styles & Settings',
                    child: SetSettingsPanel(currentQuestionNumber: currentQuestion),
                  ),
                  initialPosition: const Offset(800, 100),
                );
              },
              icon: Icons.settings,
              label: 'Q-Settings',
            ),
            const SizedBox(width: AppThemeDimensions.gapM),
          ],

          // Import Button
          _PrimaryButton(
            onPressed: () => showImportContentDialog(context),
            icon: Icons.download_rounded,
            label: 'Import',
          ),

          const SizedBox(width: AppThemeDimensions.gapM),

          // Export Button
          _SecondaryButton(
            onPressed: () => _showExportDialog(context, slideState),
            icon: Icons.file_download,
            label: 'Export',
          ),

          const SizedBox(width: AppThemeDimensions.gapM),

          // End Class Button
          _DangerButton(
            onPressed: () => _showEndClassDialog(context),
            icon: Icons.stop,
            label: 'End Class',
          ),
        ],
      ),
    );
  }

  void _showExportDialog(BuildContext context, SlideState slideState) {
    showDialog(
      context: context,
      builder: (context) => PdfExportDialog(slideState: slideState),
    );
  }

  void _showEndClassDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => const EndClassDialog(),
    );
  }
}

// ── Compact Primary Button (#FF6B2B bg, white text) ──────────────────────────
class _PrimaryButton extends StatelessWidget {
  final VoidCallback onPressed;
  final IconData icon;
  final String label;
  final bool isActive;

  const _PrimaryButton({
    required this.onPressed,
    required this.icon,
    required this.label,
    this.isActive = false,
  });

  @override
  Widget build(BuildContext context) {
    final theme = AppThemeColors.of(context);

    return ElevatedButton.icon(
      onPressed: onPressed,
      icon: Icon(icon, size: 16),
      label: Text(label),
      style: ElevatedButton.styleFrom(
        backgroundColor: isActive ? theme.textPrimary : AppThemeColors.primaryAccent,
        foregroundColor: isActive ? AppThemeColors.primaryAccent : Colors.white,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppThemeDimensions.borderRadiusButton),
        ),
        textStyle: AppThemeTextStyles.button(context),
        minimumSize: const Size(0, 32),
        elevation: 0,
      ),
    );
  }
}

// ── Compact Secondary Button (transparent, bordered) ─────────────────────────
class _SecondaryButton extends StatelessWidget {
  final VoidCallback onPressed;
  final IconData icon;
  final String label;

  const _SecondaryButton({
    required this.onPressed,
    required this.icon,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    final theme = AppThemeColors.of(context);

    return ElevatedButton.icon(
      onPressed: onPressed,
      icon: Icon(icon, size: 16),
      label: Text(label),
      style: ElevatedButton.styleFrom(
        backgroundColor: Colors.transparent,
        foregroundColor: theme.btnSecondaryText,
        side: BorderSide(color: theme.btnSecondaryBorder),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppThemeDimensions.borderRadiusButton),
        ),
        textStyle: AppThemeTextStyles.button(context),
        minimumSize: const Size(0, 32),
        elevation: 0,
      ),
    );
  }
}

// ── Danger Button (error color border) ───────────────────────────────────────
class _DangerButton extends StatelessWidget {
  final VoidCallback onPressed;
  final IconData icon;
  final String label;

  const _DangerButton({
    required this.onPressed,
    required this.icon,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    final theme = AppThemeColors.of(context);

    return OutlinedButton.icon(
      onPressed: onPressed,
      icon: Icon(icon, size: 16),
      label: Text(label),
      style: OutlinedButton.styleFrom(
        foregroundColor: theme.error,
        side: BorderSide(color: theme.error),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppThemeDimensions.borderRadiusButton),
        ),
        textStyle: AppThemeTextStyles.button(context),
        minimumSize: const Size(0, 32),
      ),
    );
  }
}

// ── Save Status Indicator ────────────────────────────────────────────────────
class _SaveStatusIndicator extends StatelessWidget {
  final SaveStatus status;

  const _SaveStatusIndicator({required this.status});

  @override
  Widget build(BuildContext context) {
    final theme = AppThemeColors.of(context);
    final (icon, color, label) = switch (status) {
      SaveStatus.idle => (Icons.check_circle, theme.badgeSuccessText, ''),
      SaveStatus.saving => (Icons.sync, theme.accentOrange, 'Saving...'),
      SaveStatus.saved => (Icons.check_circle, theme.badgeSuccessText, 'Saved'),
      SaveStatus.failed => (Icons.error, theme.error, 'Failed'),
    };

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 14, color: color),
        if (label.isNotEmpty) ...[
          const SizedBox(width: 4),
          Text(
            label,
            style: AppThemeTextStyles.caption(context).copyWith(color: color),
          ),
        ],
      ],
    );
  }
}
