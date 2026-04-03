// lib/features/whiteboard/presentation/widgets/toolbar/top_toolbar.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/constants/app_dimensions.dart';
import '../../../../../core/constants/app_text_styles.dart';
import '../../../presentation/providers/session_provider.dart';
import '../dialogs/set_import_dialog.dart';
import '../dialogs/end_class_dialog.dart';

class TopToolbar extends ConsumerWidget {
  const TopToolbar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final sessionState = ref.watch(sessionNotifierProvider);

    return Container(
      height: AppDimensions.topBarHeight,
      padding: EdgeInsets.symmetric(horizontal: AppDimensions.borderRadiusL),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary.withOpacity(0.9),
        border: Border(
          bottom: BorderSide(
            color: AppColors.textTertiary.withOpacity(0.1),
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: [
          // 1. Menu Button
          IconButton(
            icon: Icon(Icons.menu, color: AppColors.textPrimary),
            onPressed: () => Scaffold.of(context).openDrawer(),
            tooltip: 'Menu',
          ),

          SizedBox(width: AppDimensions.borderRadiusM),

          // 2. Session Name / Set Info
          Expanded(
            child: Text(
              sessionState.sessionId != null
                  ? 'Session: ${sessionState.sessionId!.substring(0, 8)}...'
                  : 'EduBoard Pro',
              style: AppTextStyles.body.copyWith(
                color: AppColors.textPrimary,
                fontWeight: FontWeight.w600,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ),

          // 3. Save Status Indicator
          _SaveStatusIndicator(status: sessionState.saveStatus),

          SizedBox(width: AppDimensions.borderRadiusL),

          // 4. Import Set Button
          ElevatedButton.icon(
            onPressed: () => _showSetImportDialog(context),
            icon: Icon(Icons.folder_open, size: 18),
            label: Text('Import Set'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.accentOrange,
              foregroundColor: AppColors.bgPrimary,
              padding: EdgeInsets.symmetric(
                horizontal: AppDimensions.borderRadiusL,
                vertical: AppDimensions.borderRadiusS,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
              ),
            ),
          ),

          SizedBox(width: AppDimensions.borderRadiusM),

          // 5. End Class Button
          OutlinedButton.icon(
            onPressed: () => _showEndClassDialog(context),
            icon: Icon(Icons.stop, size: 18),
            label: Text('End Class'),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.error,
              side: BorderSide(color: AppColors.error),
              padding: EdgeInsets.symmetric(
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

  void _showSetImportDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => const SetImportDialog(),
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
          SizedBox(width: 4),
          Text(
            label,
            style: AppTextStyles.caption.copyWith(color: color),
          ),
        ],
      ],
    );
  }
}
