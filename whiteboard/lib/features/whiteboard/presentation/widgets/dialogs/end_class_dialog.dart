// lib/features/whiteboard/presentation/widgets/dialogs/end_class_dialog.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/constants/app_dimensions.dart';
import '../../../../../core/constants/app_text_styles.dart';
import '../../providers/session_provider.dart';
import '../../providers/slide_provider.dart';
import '../../../services/export_service.dart';

class EndClassDialog extends ConsumerStatefulWidget {
  const EndClassDialog({super.key});

  @override
  ConsumerState<EndClassDialog> createState() => _EndClassDialogState();
}

class _EndClassDialogState extends ConsumerState<EndClassDialog> {
  bool _isExporting = false;
  double _exportProgress = 0.0;
  String _exportStatus = '';

  Future<void> _handleEndClass() async {
    setState(() {
      _isExporting = true;
      _exportProgress = 0.0;
      _exportStatus = 'Generating PDF...';
    });

    try {
      final sessionState = ref.read(sessionNotifierProvider);
      final slideState = ref.read(slideNotifierProvider);

      if (sessionState.sessionId == null) {
        _showError('No active session');
        return;
      }

      // Step 1: Generate PDF
      final annotations = slideState.savedAnnotations.values.toList();
      final pdfFile = await ExportService.generatePdf(
        sessionId: sessionState.sessionId!,
        slideAnnotations: annotations,
        slideCount: slideState.pages.length,
      );


      setState(() {
        _exportProgress = 0.5;
        _exportStatus = 'Generating PNG images...';
      });

      // Step 2: Generate PNGs
      final pngFiles = await ExportService.generatePngs(
        sessionId: sessionState.sessionId!,
        slideAnnotations: annotations,
        slideCount: slideState.pages.length,
        canvasSize: const Size(1920, 1080),
      );


      setState(() {
        _exportProgress = 0.75;
        _exportStatus = 'Creating ZIP archive...';
      });

      // Step 3: Create ZIP
      await ExportService.createZip(
        sessionId: sessionState.sessionId!,
        pngFiles: pngFiles,
      );

      setState(() {
        _exportProgress = 1.0;
        _exportStatus = 'Export complete!';
      });

      // Step 4: Show success and close
      if (!mounted) return;
      await Future.delayed(const Duration(seconds: 1));
      if (!mounted) return;
      context.pop();
      _showSuccess('Class notes saved: ${pdfFile.path}');
    } catch (e) {
      setState(() {
        _isExporting = false;
        _exportStatus = 'Export failed: $e';
      });
    }
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

    return Dialog(
      backgroundColor: AppColors.bgPrimary,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppDimensions.borderRadiusL),
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header
            Row(
              children: [
                Icon(
                  Icons.stop_circle,
                  color: _isExporting ? AppColors.accentOrange : AppColors.error,
                  size: 28,
                ),
                const SizedBox(width: AppDimensions.borderRadiusM),
                Text(
                  _isExporting ? 'Exporting Class...' : 'End Class',
                  style: AppTextStyles.heading2,
                ),
              ],
            ),
            const SizedBox(height: AppDimensions.borderRadiusL),

            if (!_isExporting) ...[
              // Warning Message
              Text(
                'Are you sure you want to end this class? All slides will be exported to PDF and PNG.',
                style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppDimensions.topBarHeight),

              // Session Info
              Container(
                padding: const EdgeInsets.all(AppDimensions.borderRadiusM),
                decoration: BoxDecoration(
                  color: AppColors.bgSecondary,
                  borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
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
                    Text(
                      'Session ID: ${sessionState.sessionId ?? 'N/A'}',
                      style: AppTextStyles.body,
                    ),
                    const SizedBox(height: AppDimensions.borderRadiusS),
                    Text(
                      'Slides: ${sessionState.slidesCovered.length}',
                      style: AppTextStyles.body,
                    ),
                    const SizedBox(height: AppDimensions.borderRadiusS),
                    Text(
                      'Last Saved: ${sessionState.lastSavedAt != null ? _formatTime(sessionState.lastSavedAt!) : 'Never'}',
                      style: AppTextStyles.body,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppDimensions.topBarHeight),

              // Action Buttons
              Row(
                children: [
                  // Cancel Button
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => context.pop(),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: AppDimensions.borderRadiusM),
                        side: BorderSide(color: AppColors.textTertiary.withValues(alpha: 0.3)),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
                        ),
                      ),
                      child: Text(
                        'Cancel',
                        style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
                      ),
                    ),
                  ),
                  const SizedBox(width: AppDimensions.borderRadiusL),

                  // End Class Button
                  Expanded(
                    child: ElevatedButton(
                      onPressed: _handleEndClass,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.error,
                        padding: const EdgeInsets.symmetric(vertical: AppDimensions.borderRadiusM),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
                        ),
                      ),
                      child: Text(
                        'End & Export',
                        style: AppTextStyles.body.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ] else ...[
              // Export Progress
              Column(
                children: [
                  const SizedBox(height: AppDimensions.borderRadiusL),
                  LinearProgressIndicator(
                    value: _exportProgress,
                    backgroundColor: AppColors.bgSecondary,
                    valueColor: const AlwaysStoppedAnimation<Color>(AppColors.accentOrange),
                    minHeight: 8,
                  ),
                  const SizedBox(height: AppDimensions.borderRadiusM),
                  Text(
                    _exportStatus,
                    style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: AppDimensions.borderRadiusL),
                  if (_exportProgress >= 1.0)
                    const Icon(
                      Icons.check_circle,
                      color: AppColors.success,
                      size: 48,
                    ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  String _formatTime(DateTime time) {
    final hour = time.hour.toString().padLeft(2, '0');
    final minute = time.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }
}
