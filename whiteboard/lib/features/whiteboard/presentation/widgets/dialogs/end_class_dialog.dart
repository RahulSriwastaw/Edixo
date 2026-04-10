// lib/features/whiteboard/presentation/widgets/dialogs/end_class_dialog.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/constants/app_dimensions.dart';
import '../../../../../core/constants/app_text_styles.dart';
import '../../providers/session_provider.dart';
import '../../providers/slide_provider.dart';
import '../../providers/canvas_provider.dart';
import '../../../services/export_service.dart';
import '../../../services/pdf_exporter_service.dart';
import '../panels/page_arrangement_panel.dart';

class EndClassDialog extends ConsumerStatefulWidget {
  const EndClassDialog({super.key});

  @override
  ConsumerState<EndClassDialog> createState() => _EndClassDialogState();
}

class _EndClassDialogState extends ConsumerState<EndClassDialog> {
  bool _showArrangementPanel = false;
  PdfExportConfig? _exportConfig;

  Future<void> _handleEndClass() async {
    // First show the arrangement panel
    setState(() => _showArrangementPanel = true);
  }

  Future<void> _handleProceedWithExport(
    List<int> pageOrder,
    Set<int> deletedPages,
  ) async {
    // Store the configuration
    _exportConfig = PdfExportConfig(
      pageOrder: pageOrder,
      deletedPages: deletedPages,
    );

    // Proceed with PDF export
    final pdfService = PdfExporterService(ref);
    await pdfService.exportSessionToPdf(
      context,
      config: _exportConfig,
    );
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppColors.error,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  void _showSuccess(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppColors.success,
        duration: const Duration(seconds: 5),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final sessionState = ref.watch(sessionNotifierProvider);

    // Show arrangement panel if requested
    if (_showArrangementPanel) {
      return Dialog(
        backgroundColor: AppColors.bgPrimary,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppDimensions.borderRadiusL),
        ),
        child: Container(
          constraints: const BoxConstraints(maxWidth: 1000, maxHeight: 800),
          child: PageArrangementPanel(
            onConfirm: (pageOrder, deletedPages) {
              _handleProceedWithExport(pageOrder, deletedPages);
            },
            onCancel: () {
              setState(() => _showArrangementPanel = false);
            },
          ),
        ),
      );
    }

    // Show original end class dialog
    return Dialog(
      backgroundColor: AppColors.bgPrimary,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppDimensions.borderRadiusL),
      ),
      child: Container(
        constraints: const BoxConstraints(maxWidth: 400),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                const Icon(
                  Icons.stop_rounded,
                  color: AppColors.error,
                  size: 22,
                ),
                const SizedBox(width: 12),
                Text(
                  'End Class Session',
                  style: AppTextStyles.heading2.copyWith(fontSize: 18),
                ),
              ],
            ),
            const SizedBox(height: AppDimensions.borderRadiusL),

            // Session Info
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.bgSecondary.withValues(alpha: 0.5),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Session Details',
                    style: AppTextStyles.caption.copyWith(
                      color: AppColors.textTertiary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: AppDimensions.borderRadiusS),
                  _detailRow('Session ID', sessionState.sessionId ?? 'N/A'),
                  const SizedBox(height: 8),
                  _detailRow('Slides Covered', '${sessionState.slidesCovered.length}'),
                  const SizedBox(height: 8),
                  _detailRow('Duration', _formatTime(sessionState.classDuration)),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Action Buttons
            Row(
              children: [
                // Cancel Button
                Expanded(
                  child: TextButton(
                    onPressed: () => context.pop(),
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: Text(
                      'Cancel',
                      style: AppTextStyles.body.copyWith(
                        color: AppColors.textTertiary,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                // End Class Button
                Expanded(
                  child: ElevatedButton(
                    onPressed: _handleEndClass,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.error,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ).copyWith(
                      overlayColor: WidgetStateProperty.all(Colors.white10),
                    ),
                    child: const Text(
                      'End & Arrange',
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _detailRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: AppTextStyles.caption.copyWith(
            color: AppColors.textTertiary,
            fontSize: 13,
          ),
        ),
        Text(
          value,
          style: AppTextStyles.body.copyWith(
            color: AppColors.textPrimary,
            fontSize: 13,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  String _formatTime(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    final minutes = twoDigits(duration.inMinutes.remainder(60));
    final seconds = twoDigits(duration.inSeconds.remainder(60));
    return "${twoDigits(duration.inHours)}:$minutes:$seconds";
  }
}
