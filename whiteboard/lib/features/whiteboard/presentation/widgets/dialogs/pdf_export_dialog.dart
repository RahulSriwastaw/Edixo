// lib/features/whiteboard/presentation/widgets/dialogs/pdf_export_dialog.dart
//
// PDF Export Dialog - Export class notes/whiteboard as PDF
// Features:
//   - Export current page or all pages
//   - Download locally with timestamp
//   - Progress indicator for large exports
//   - 16:9 aspect ratio maintenance

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/constants/app_dimensions.dart';
import '../../../../../core/constants/app_text_styles.dart';
import '../../providers/slide_provider.dart';
import '../../../services/pdf_exporter_service.dart';

class PdfExportDialog extends ConsumerStatefulWidget {
  final SlideState slideState;

  const PdfExportDialog({
    super.key,
    required this.slideState,
  });

  @override
  ConsumerState<PdfExportDialog> createState() => _PdfExportDialogState();
}

class _PdfExportDialogState extends ConsumerState<PdfExportDialog> {
  bool _exportAll = true;
  bool _isExporting = false;
  double _progress = 0.0;
  String _statusMessage = '';

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: AppColors.bgPrimary,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppDimensions.borderRadiusL),
      ),
      child: SizedBox(
        width: 420,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 20, 8, 0),
              child: Row(
                children: [
                  const Icon(
                    Icons.file_download,
                    color: Colors.green,
                    size: 26,
                  ),
                  const SizedBox(width: 10),
                  Text('Export as PDF', style: AppTextStyles.heading2),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.close, size: 20),
                    onPressed: _isExporting
                        ? null
                        : () {
                            context.pop();
                          },
                    tooltip: 'Close',
                  ),
                ],
              ),
            ),

            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Info Box
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.green.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: Colors.green.withValues(alpha: 0.3),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.info_outline,
                          color: Colors.green[300],
                          size: 18,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'Export your class notes and whiteboard content as PDF. All pages maintain 16:9 aspect ratio.',
                            style: AppTextStyles.caption.copyWith(
                              color: Colors.green[300],
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Export Options
                  Text(
                    'Export Options',
                    style: AppTextStyles.body
                        .copyWith(fontWeight: FontWeight.w600, fontSize: 14),
                  ),
                  const SizedBox(height: 12),

                  // Radio: Export All
                  _buildRadioOption(
                    value: true,
                    groupValue: _exportAll,
                    onChanged: _isExporting
                        ? (_) {}
                        : (value) {
                            setState(() => _exportAll = value ?? true);
                          },
                    title: 'Export All Pages',
                    subtitle:
                        'Export all ${widget.slideState.pages.length} pages to PDF',
                    icon: Icons.layers,
                  ),

                  const SizedBox(height: 8),

                  // Radio: Export Current
                  _buildRadioOption(
                    value: false,
                    groupValue: _exportAll,
                    onChanged: _isExporting
                        ? (_) {}
                        : (value) {
                            setState(() => _exportAll = value ?? false);
                          },
                    title: 'Export Current Page Only',
                    subtitle:
                        'Export page ${widget.slideState.currentPageIndex + 1} only',
                    icon: Icons.article,
                  ),

                  const SizedBox(height: 20),

                  // Progress Indicator
                  if (_isExporting) ...[
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              _statusMessage,
                              style: AppTextStyles.caption.copyWith(
                                fontSize: 12,
                              ),
                            ),
                            Text(
                              '${(_progress * 100).toStringAsFixed(0)}%',
                              style: AppTextStyles.caption.copyWith(
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: LinearProgressIndicator(
                            value: _progress,
                            minHeight: 6,
                            backgroundColor: Colors.grey.withValues(alpha: 0.2),
                            valueColor: AlwaysStoppedAnimation<Color>(
                              Colors.green.withValues(alpha: 0.8),
                            ),
                          ),
                        ),
                        const SizedBox(height: 20),
                      ],
                    ),
                  ],

                  // Action Buttons
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: _isExporting ? null : () => context.pop(),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(
                              vertical: AppDimensions.borderRadiusM,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(
                                AppDimensions.borderRadiusM,
                              ),
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
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: _isExporting ? null : _handleExport,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.green,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(
                              vertical: AppDimensions.borderRadiusM,
                            ),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(
                                AppDimensions.borderRadiusM,
                              ),
                            ),
                            disabledBackgroundColor:
                                Colors.grey.withValues(alpha: 0.3),
                          ),
                          icon: _isExporting
                              ? Transform.scale(
                                  scale: 0.7,
                                  child: const CircularProgressIndicator(
                                    valueColor: AlwaysStoppedAnimation<Color>(
                                      Colors.white,
                                    ),
                                  ),
                                )
                              : Icon(
                                  Icons.file_download,
                                  size: 18,
                                ),
                          label: Text(_isExporting ? 'Exporting...' : 'Export'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRadioOption({
    required bool value,
    required bool groupValue,
    required Function(bool?) onChanged,
    required String title,
    required String subtitle,
    required IconData icon,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onChanged as void Function()?,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: [
              Radio<bool>(
                value: value,
                groupValue: groupValue,
                onChanged: onChanged,
                activeColor: Colors.green,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: AppTextStyles.body.copyWith(
                        fontWeight: FontWeight.w500,
                        fontSize: 13,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: AppTextStyles.caption.copyWith(
                        color: AppColors.textTertiary,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(
                icon,
                color: AppColors.textTertiary,
                size: 20,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _handleExport() async {
    try {
      setState(() {
        _isExporting = true;
        _progress = 0.0;
        _statusMessage = 'Preparing export...';
      });

      // Create config for export
      List<int> pageOrder;
      if (_exportAll) {
        // Export all pages in order
        pageOrder =
            List.generate(widget.slideState.pages.length, (i) => i);
      } else {
        // Export only current page
        pageOrder = [widget.slideState.currentPageIndex];
      }

      final config = PdfExportConfig(
        pageOrder: pageOrder,
        deletedPages: <int>{},
      );

      // Get the exporter service using Riverpod
      final exporter = PdfExporterService(ref);

      // Do the export
      setState(() {
        _progress = 0.5;
        _statusMessage = 'Generating PDF...';
      });

      await exporter.exportSessionToPdf(context, config: config);

      if (mounted) {
        setState(() {
          _progress = 1.0;
          _statusMessage = 'Export completed!';
        });
        // Auto-close dialog after successful export
        await Future.delayed(const Duration(milliseconds: 500));
        if (mounted) {
          context.pop();
        }
      }
    } catch (e) {
      setState(() {
        _isExporting = false;
        _statusMessage = 'Export failed: ${e.toString()}';
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Export failed: $e'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    }
  }
}
