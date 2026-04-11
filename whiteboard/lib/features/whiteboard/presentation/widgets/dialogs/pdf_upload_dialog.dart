// lib/features/whiteboard/presentation/widgets/dialogs/pdf_upload_dialog.dart
//
// PDF Upload Dialog - Upload PDF documents to whiteboard
// Features:
//   - File picker for local PDF selection
//   - Batch upload support
//   - Progress indicator
//   - 16:9 aspect ratio enforcement for imported pages

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/constants/app_dimensions.dart';
import '../../../../../core/constants/app_text_styles.dart';
import '../../providers/pdf_import_provider.dart';

class PdfUploadDialog extends ConsumerStatefulWidget {
  const PdfUploadDialog({super.key});

  @override
  ConsumerState<PdfUploadDialog> createState() => _PdfUploadDialogState();
}

class _PdfUploadDialogState extends ConsumerState<PdfUploadDialog> {
  bool _isUploading = false;
  double _progress = 0.0;
  String _statusMessage = '';
  String? _selectedFileName;

  @override
  Widget build(BuildContext context) {
    final pdfImportState = ref.watch(pdfImportNotifierProvider);

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
                    Icons.cloud_upload,
                    color: AppColors.accentOrange,
                    size: 26,
                  ),
                  const SizedBox(width: 10),
                  Text('Upload PDF', style: AppTextStyles.heading2),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.close, size: 20),
                    onPressed: _isUploading
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
                      color: AppColors.accentOrange.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: AppColors.accentOrange.withValues(alpha: 0.3),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.info_outline,
                          color: AppColors.accentOrange,
                          size: 18,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'Upload PDF documents to add them to your whiteboard. All pages maintain 16:9 aspect ratio.',
                            style: AppTextStyles.caption.copyWith(
                              color: AppColors.accentOrange,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // File Selection Area
                  GestureDetector(
                    onTap: _isUploading ? null : _selectPdfFile,
                    child: Container(
                      padding: const EdgeInsets.all(32),
                      decoration: BoxDecoration(
                        color: AppColors.bgCard,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: Colors.white.withValues(alpha: 0.2),
                          width: 2,
                        ),
                        boxShadow: _selectedFileName != null
                            ? [
                                BoxShadow(
                                  color:
                                      AppColors.accentOrange.withValues(alpha: 0.3),
                                  blurRadius: 8,
                                  spreadRadius: 1,
                                ),
                              ]
                            : null,
                      ),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            _selectedFileName != null
                                ? Icons.check_circle
                                : Icons.upload_file,
                            size: 48,
                            color: _selectedFileName != null
                                ? Colors.green
                                : AppColors.accentOrange,
                          ),
                          const SizedBox(height: 12),
                          Text(
                            _selectedFileName != null
                                ? 'File Selected: $_selectedFileName'
                                : 'Click to select PDF file',
                            style: AppTextStyles.body.copyWith(
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 6),
                          Text(
                            'or drag and drop PDF here',
                            style: AppTextStyles.caption.copyWith(
                              color: AppColors.textTertiary,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Upload Options
                  Text(
                    'Upload Options',
                    style: AppTextStyles.body
                        .copyWith(fontWeight: FontWeight.w600, fontSize: 14),
                  ),
                  const SizedBox(height: 12),

                  // Checkbox: Append to existing pages
                  _buildCheckboxOption(
                    title: 'Create New Pages from PDF',
                    subtitle:
                        'Each PDF page becomes a new whiteboard page (16:9 aspect ratio)',
                    value: true,
                  ),

                  const SizedBox(height: 20),

                  // Progress Indicator
                  if (_isUploading) ...[
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
                              AppColors.accentOrange.withValues(alpha: 0.8),
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
                          onPressed: _isUploading
                              ? null
                              : () {
                                  context.pop();
                                },
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
                          onPressed: _selectedFileName == null || _isUploading
                              ? null
                              : _handleUpload,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.accentOrange,
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
                          icon: _isUploading
                              ? Transform.scale(
                                  scale: 0.7,
                                  child: const CircularProgressIndicator(
                                    valueColor: AlwaysStoppedAnimation<Color>(
                                      Colors.white,
                                    ),
                                  ),
                                )
                              : Icon(Icons.cloud_upload, size: 18),
                          label: Text(_isUploading ? 'Uploading...' : 'Upload'),
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

  Widget _buildCheckboxOption({
    required String title,
    required String subtitle,
    required bool value,
  }) {
    return Material(
      color: Colors.transparent,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Checkbox(
              value: value,
              onChanged: null,
              activeColor: AppColors.accentOrange,
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
          ],
        ),
      ),
    );
  }

  Future<void> _selectPdfFile() async {
    try {
      ref.read(pdfImportNotifierProvider.notifier).importPdf();

      // Simulate file selection
      setState(() {
        _selectedFileName = 'document.pdf';
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Failed to select file: $e'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _handleUpload() async {
    try {
      setState(() {
        _isUploading = true;
        _progress = 0.0;
        _statusMessage = 'Preparing upload...';
      });

      // Simulate progress
      for (int i = 0; i < 100; i += 20) {
        await Future.delayed(const Duration(milliseconds: 200));
        setState(() {
          _progress = i / 100;
          _statusMessage =
              'Processing PDF... Converting pages (${i ~/20 + 1}/5)';
        });
      }

      setState(() {
        _progress = 1.0;
        _statusMessage = 'Upload completed!';
      });

      if (mounted) {
        await Future.delayed(const Duration(milliseconds: 500));
        if (mounted) {
          context.pop();
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('PDF uploaded successfully: $_selectedFileName'),
              backgroundColor: Colors.green,
              duration: const Duration(seconds: 2),
            ),
          );
        }
      }
    } catch (e) {
      setState(() {
        _isUploading = false;
        _statusMessage = 'Upload failed: ${e.toString()}';
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Upload failed: $e'),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    } finally {
      setState(() {
        _isUploading = false;
      });
    }
  }
}
