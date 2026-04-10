// lib/features/whiteboard/presentation/widgets/dialogs/end_class_dialog.dart

import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/constants/app_dimensions.dart';
import '../../../../../core/constants/app_text_styles.dart';
import '../../providers/session_provider.dart';
import '../../providers/slide_provider.dart';
import '../../providers/canvas_provider.dart';
import '../../providers/slide_capture_provider.dart';
import '../../../services/export_service.dart';
import '../../../services/pdf_exporter_service.dart';
import '../../../services/background_pdf_worker.dart';
import '../../../services/pdf_generation_queue.dart';
import '../../../services/advanced_pdf_upload_service.dart';
import '../panels/page_arrangement_panel.dart';

class EndClassDialog extends ConsumerStatefulWidget {
  const EndClassDialog({super.key});

  @override
  ConsumerState<EndClassDialog> createState() => _EndClassDialogState();
}

class _EndClassDialogState extends ConsumerState<EndClassDialog> {
  bool _showArrangementPanel = false;
  PdfExportConfig? _exportConfig;
  String? _currentTaskId;
  bool _isProcessing = false;

  @override
  void initState() {
    super.initState();
    _initializeWorkerPool();
  }

  Future<void> _initializeWorkerPool() async {
    try {
      await BackgroundPdfWorker.instance.initialize();
      debugPrint('✓ Worker pool initialized');
    } catch (e) {
      debugPrint('⚠️ Worker initialization error: $e');
    }
  }

  Future<void> _handleEndClass() async {
    // First show the arrangement panel
    setState(() => _showArrangementPanel = true);
  }

  Future<void> _handleProceedWithExport(
    List<int> pageOrder,
    Set<int> deletedPages,
  ) async {
    if (_isProcessing) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Export already in progress...')),
      );
      return;
    }

    setState(() => _isProcessing = true);
    _currentTaskId = 'task_${DateTime.now().millisecondsSinceEpoch}';

    try {
      // Store the configuration
      _exportConfig = PdfExportConfig(
        pageOrder: pageOrder,
        deletedPages: deletedPages,
      );

      // Use optimized export with background processing
      await _optimizedExportSessionToPdf(
        context,
        config: _exportConfig!,
        taskId: _currentTaskId!,
      );
    } finally {
      if (mounted) {
        setState(() => _isProcessing = false);
      }
    }
  }

  /// Optimized PDF export with background processing
  Future<void> _optimizedExportSessionToPdf(
    BuildContext context, {
    required PdfExportConfig config,
    required String taskId,
  }) async {
    final slideNotifier = ref.read(slideNotifierProvider.notifier);
    final slideState = ref.read(slideNotifierProvider);
    final sessionState = ref.read(sessionNotifierProvider);
    final canvasKey = ref.read(canvasRepaintKeyProvider);
    final cachedSlides = ref.read(slideCaptureProvider);
    final captureNotifier = ref.read(slideCaptureProvider.notifier);

    if (slideState.pages.isEmpty || slideState.importedSets.isEmpty) {
      if (!context.mounted) return;
      _showError('No content to export.');
      return;
    }

    final pageOrder = config.pageOrder;
    final deletedPages = config.deletedPages;

    if (pageOrder.isEmpty) {
      if (!context.mounted) return;
      _showError('Cannot export: All pages were deleted.');
      return;
    }

    // Progress tracking
    final statusNotifier = ValueNotifier<String>("Preparing export...");
    final progressNotifier = ValueNotifier<double>(0.0);
    final uploadProgressNotifier = ValueNotifier<String>("0%");

    if (!context.mounted) return;
    _showOptimizedProgressDialog(
      context,
      statusNotifier,
      progressNotifier,
      uploadProgressNotifier,
      taskId,
    );

    final originalIndex = slideState.currentPageIndex;

    try {
      // Step 1: Capture last slide (non-blocking)
      statusNotifier.value = "Capturing final slide...";
      progressNotifier.value = 0.05;
      await captureNotifier.captureSlide(slideState.currentPageIndex, canvasKey);
      await Future.delayed(const Duration(milliseconds: 50));

      // Step 2: Collect all slide images
      statusNotifier.value = "Preparing slide images...";
      progressNotifier.value = 0.1;

      final slideImages = <Uint8List>[];
      for (int i = 0; i < slideState.pages.length; i++) {
        final pngBytes = cachedSlides[i];
        slideImages.add(pngBytes ?? Uint8List(0));
      }

      // Step 3: Queue PDF generation (background processing)
      statusNotifier.value = "Queuing PDF generation...";
      progressNotifier.value = 0.15;

      final pdfBytes = await PdfGenerationQueue.instance.enqueueTask(
        taskId: taskId,
        slideImages: slideImages,
        pageOrder: pageOrder,
        deletedPages: deletedPages,
        onProgress: (progress) {
          progressNotifier.value = 0.15 + (progress * 0.5); // 15% to 65%
          statusNotifier.value =
              "Generating PDF (${(progress * 100).toStringAsFixed(0)}%)...";
        },
        highPriority: true,
      );

      // Step 4: Restore original slide
      if (originalIndex != slideState.currentPageIndex) {
        slideNotifier.navigateToSlide(originalIndex);
        await Future.delayed(const Duration(milliseconds: 100));
      }

      // Step 5: Upload PDF with streaming (advanced upload)
      statusNotifier.value = "Uploading to server...";
      progressNotifier.value = 0.7;

      final uploadService = AdvancedPdfUploadService.instance;
      final setId = slideState.importedSets.isNotEmpty
          ? slideState.importedSets.first.setId
          : 'unknown';

      await uploadService.uploadPdfWithStreaming(
        pdfBytes: pdfBytes,
        fileName:
            "class_notes_${setId}_${DateTime.now().millisecondsSinceEpoch}.pdf",
        setId: setId,
        totalPages: pageOrder.length,
        apiUrl: 'http://localhost:4000/api',
        onProgress: (uploadProgress) {
          progressNotifier.value = 0.7 + (uploadProgress.percentage * 0.3);
          uploadProgressNotifier.value =
              uploadProgress.formattedProgress;
          statusNotifier.value =
              "Uploading: ${uploadProgress.formattedProgress}...";
        },
        onStatus: (status) {
          statusNotifier.value = status;
        },
      );

      progressNotifier.value = 1.0;
      statusNotifier.value = "✓ Complete!";

      if (!context.mounted) return;

      // Short delay to show the "Success!" state
      await Future.delayed(const Duration(milliseconds: 700));
      Navigator.of(context).pop(); // Close progress

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            '✓ Success! PDF with ${pageOrder.length} pages uploaded smoothly',
          ),
          backgroundColor: Colors.green,
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 3),
        ),
      );
    } catch (e) {
      debugPrint("PDF Export Error: $e");
      if (!context.mounted) {
        statusNotifier.dispose();
        progressNotifier.dispose();
        uploadProgressNotifier.dispose();
        return;
      }

      Navigator.of(context).pop();
      _showError('Export failed: $e');
    } finally {
      statusNotifier.dispose();
      progressNotifier.dispose();
      uploadProgressNotifier.dispose();
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

  /// Optimized progress dialog with better UI and upload progress tracking
  void _showOptimizedProgressDialog(
    BuildContext context,
    ValueNotifier<String> statusNotifier,
    ValueNotifier<double> progressNotifier,
    ValueNotifier<String> uploadProgressNotifier,
    String taskId,
  ) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => WillPopScope(
        onWillPop: () async => false,
        child: Center(
          child: Container(
            width: 360,
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              color: const Color(0xFF1A1A1A),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.9),
                  blurRadius: 40,
                  offset: const Offset(0, 20),
                ),
              ],
            ),
            child: Material(
              color: Colors.transparent,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Animated Progress Indicator
                  Container(
                    width: 70,
                    height: 70,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          Colors.blue.shade300,
                          Colors.blue.shade600,
                        ],
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.blue.withValues(alpha: 0.3),
                          blurRadius: 20,
                          spreadRadius: 5,
                        ),
                      ],
                    ),
                    child: const Center(
                      child: SizedBox(
                        width: 60,
                        height: 60,
                        child: CircularProgressIndicator(
                          strokeWidth: 4,
                          valueColor:
                              AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 28),

                  // Status Text
                  ValueListenableBuilder<String>(
                    valueListenable: statusNotifier,
                    builder: (context, status, child) {
                      return Column(
                        children: [
                          Text(
                            status,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              height: 1.5,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 4),
                          if (status.contains('progress') ||
                              status.contains('Uploading'))
                            Text(
                              'Using advanced streaming technology',
                              style: TextStyle(
                                color: Colors.green[300],
                                fontSize: 12,
                                fontStyle: FontStyle.italic,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                        ],
                      );
                    },
                  ),
                  const SizedBox(height: 24),

                  // Progress Bar with enhanced styling
                  ValueListenableBuilder<double>(
                    valueListenable: progressNotifier,
                    builder: (context, progress, child) {
                      return Column(
                        children: [
                          // Animated progress bar with gradient
                          Container(
                            height: 6,
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(8),
                              color: Colors.white.withValues(alpha: 0.1),
                              boxShadow: [
                                BoxShadow(
                                  blurRadius: 2,
                                  color: Colors.black.withValues(alpha: 0.3),
                                  offset: Offset(0, 1),
                                ),
                              ],
                            ),
                            child: Stack(
                              children: [
                                // Background
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(8),
                                  child: Container(
                                    color:
                                        Colors.white.withValues(alpha: 0.05),
                                  ),
                                ),
                                // Progress fill
                                ClipRRect(
                                  borderRadius: BorderRadius.circular(8),
                                  child: FractionallySizedBox(
                                    widthFactor: progress,
                                    child: Container(
                                      decoration: BoxDecoration(
                                        gradient: LinearGradient(
                                          colors: [
                                            Colors.blue[400]!,
                                            Colors.cyan[300]!,
                                          ],
                                        ),
                                        boxShadow: [
                                          BoxShadow(
                                            color:
                                                Colors.cyan.withValues(alpha: 0.5),
                                            blurRadius: 8,
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(height: 12),

                          // Progress stats
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '${(progress * 100).toStringAsFixed(0)}%',
                                style: const TextStyle(
                                  color: Colors.white70,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              ValueListenableBuilder<String>(
                                valueListenable: uploadProgressNotifier,
                                builder: (context, uploadProgress, _) {
                                  return Text(
                                    uploadProgress,
                                    style: const TextStyle(
                                      color: Colors.cyan,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  );
                                },
                              ),
                            ],
                          ),
                        ],
                      );
                    },
                  ),

                  const SizedBox(height: 24),

                  // Enhanced Info Card
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          Colors.blue.withValues(alpha: 0.15),
                          Colors.cyan.withValues(alpha: 0.1),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: Colors.blue.withValues(alpha: 0.25),
                      ),
                    ),
                    child: Row(
                      children: [
                        ScaleTransition(
                          scale: Tween(begin: 0.8, end: 1.2).animate(
                            CurvedAnimation(
                              parent: AlwaysStoppedAnimation(0.5),
                              curve: Curves.easeInOut,
                            ),
                          ),
                          child: Icon(
                            Icons.info_rounded,
                            size: 16,
                            color: Colors.blue[300],
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            'Not blocking UI · Background processing · Chunked upload',
                            style: TextStyle(
                              color: Colors.blue[300],
                              fontSize: 12,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
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
                    onPressed: _isProcessing ? null : () => context.pop(),
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: Text(
                      'Cancel',
                      style: AppTextStyles.body.copyWith(
                        color: _isProcessing
                            ? AppColors.textTertiary.withValues(alpha: 0.5)
                            : AppColors.textTertiary,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                // End Class Button
                Expanded(
                  child: ElevatedButton(
                    onPressed: _isProcessing ? null : _handleEndClass,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _isProcessing
                          ? AppColors.error.withValues(alpha: 0.6)
                          : AppColors.error,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ).copyWith(
                      overlayColor: WidgetStateProperty.all(Colors.white10),
                    ),
                    child: Text(
                      _isProcessing ? 'Processing...' : 'End & Arrange',
                      style: const TextStyle(
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
