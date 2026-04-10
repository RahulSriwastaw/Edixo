// lib/features/whiteboard/services/pdf_exporter_service.dart

import 'dart:typed_data';
import 'dart:ui' as ui;
import 'package:flutter/foundation.dart' show kIsWeb, compute;
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:dio/dio.dart';
import 'package:http_parser/http_parser.dart';

import 'local_pdf_download.dart';

import '../presentation/providers/slide_provider.dart';
import '../presentation/providers/canvas_provider.dart';
import '../presentation/providers/session_provider.dart';
import '../presentation/providers/slide_capture_provider.dart';

class PdfExportConfig {
  final List<int> pageOrder;
  final Set<int> deletedPages;

  PdfExportConfig({
    required this.pageOrder,
    required this.deletedPages,
  });
}

/// Isolate-safe PDF generation function
Future<Uint8List> _generatePdfInIsolate(
  Map<String, dynamic> params,
) async {
  final List<Uint8List>? slideImages = params['slideImages'];
  final List<int> pageOrder = params['pageOrder'];
  final Set<int> deletedPages = params['deletedPages'];

  final pdf = pw.Document();

  if (slideImages == null || slideImages.isEmpty) {
    throw Exception('No slide images provided');
  }

  for (int orderIndex = 0; orderIndex < pageOrder.length; orderIndex++) {
    final pageIndex = pageOrder[orderIndex];

    if (deletedPages.contains(pageIndex)) {
      continue;
    }

    if (pageIndex >= slideImages.length) {
      debugPrint('Warning: Page index $pageIndex out of range');
      continue;
    }

    final pngBytes = slideImages[pageIndex];
    if (pngBytes.isEmpty) {
      debugPrint('Warning: Empty image for page $pageIndex');
      continue;
    }

    try {
      final pdfImage = pw.MemoryImage(pngBytes);
      pdf.addPage(
        pw.Page(
          pageFormat: PdfPageFormat.a4.landscape,
          margin: pw.EdgeInsets.zero,
          build: (pw.Context context) {
            return pw.Center(
              child: pw.Image(pdfImage, fit: pw.BoxFit.contain),
            );
          },
        ),
      );
    } catch (e) {
      debugPrint('Error adding page $pageIndex to PDF: $e');
      continue;
    }
  }

  return await pdf.save();
}

class PdfExporterService {
  final WidgetRef ref;
  late Dio _dio;
  static const int _maxRetries = 3;
  static const Duration _uploadTimeout = Duration(minutes: 5);

  PdfExporterService(this.ref) {
    _initializeDio();
  }

  void _initializeDio() {
    _dio = Dio(
      BaseOptions(
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: _uploadTimeout,
        sendTimeout: _uploadTimeout,
      ),
    );

    // Add retry interceptor
    _dio.interceptors.add(
      InterceptorsWrapper(
        onError: (error, handler) {
          if (error.response?.statusCode == 408 ||
              error.type == DioExceptionType.connectionTimeout) {
            debugPrint('Timeout error, will retry: ${error.message}');
          }
          return handler.next(error);
        },
      ),
    );
  }

  Future<void> exportSessionToPdf(
    BuildContext context, {
    PdfExportConfig? config,
  }) async {
    final slideNotifier = ref.read(slideNotifierProvider.notifier);
    final slideState = ref.read(slideNotifierProvider);
    final sessionState = ref.read(sessionNotifierProvider);
    final canvasKey = ref.read(canvasRepaintKeyProvider);

    if (slideState.pages.isEmpty || slideState.importedSets.isEmpty) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('No content to export.')),
        );
      }
      return;
    }

    // Use provided config or default (all pages in order)
    final pageOrder = config?.pageOrder ??
        List.generate(slideState.pages.length, (i) => i);
    final deletedPages = config?.deletedPages ?? {};

    if (pageOrder.isEmpty) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Cannot export: All pages were deleted.'),
          ),
        );
      }
      return;
    }

    // Status notifier for the dialog
    final statusNotifier = ValueNotifier<String>("Preparing export...");
    final progressNotifier = ValueNotifier<double>(0.0);

    // Show loading overlay
    _showProgressDialog(context, statusNotifier, progressNotifier);

    final originalIndex = slideState.currentPageIndex;

    try {
      final totalPages = pageOrder.length;
      final cachedSlides = ref.read(slideCaptureProvider);
      final captureNotifier = ref.read(slideCaptureProvider.notifier);

      // 1. Prepare all slide images
      statusNotifier.value = "Preparing slides...";
      progressNotifier.value = 0.05;

      // Capture the current (last) slide one last time
      await captureNotifier.captureSlide(slideState.currentPageIndex, canvasKey);
      await Future.delayed(const Duration(milliseconds: 50));

      // Collect all slide images
      final slideImages = <Uint8List>[];
      for (int i = 0; i < slideState.pages.length; i++) {
        final pngBytes = cachedSlides[i];
        if (pngBytes != null) {
          slideImages.add(pngBytes);
        } else {
          // Fallback: empty bytes
          slideImages.add(Uint8List(0));
        }
      }

      // 2. Generate PDF in isolate (non-blocking)
      statusNotifier.value = "Generating PDF (this may take a moment)...";
      progressNotifier.value = 0.2;

      final pdfBytes = await compute(_generatePdfInIsolate, {
        'slideImages': slideImages,
        'pageOrder': pageOrder,
        'deletedPages': deletedPages,
      });

      // 3. Restore original slide
      if (originalIndex != slideState.currentPageIndex) {
        slideNotifier.navigateToSlide(originalIndex);
        await Future.delayed(const Duration(milliseconds: 100));
      }

      // 4. Upload to Backend with retries
      statusNotifier.value = "Uploading to server...";
      progressNotifier.value = 0.7;

      final setId = slideState.importedSets.isNotEmpty
          ? slideState.importedSets.first.setId
          : 'unknown';
      final fileName = "class_notes_${setId}_${DateTime.now().millisecondsSinceEpoch}.pdf";

      await _uploadPdfWithRetry(
        pdfBytes,
        setId,
        pageOrder.length,
        fileName,
        statusNotifier,
        progressNotifier,
      );

      if (kIsWeb) {
        await downloadPdfLocally(pdfBytes, fileName);
        statusNotifier.value = 'Local copy downloaded.';
      }

      progressNotifier.value = 1.0;
      statusNotifier.value = "✓ Complete!";

      if (context.mounted) {
        // Short delay to show the "Success!" state
        await Future.delayed(const Duration(milliseconds: 700));
        Navigator.of(context).pop(); // Close progress

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              '✓ Success! PDF with ${pageOrder.length} pages uploaded',
            ),
            backgroundColor: Colors.green,
            behavior: SnackBarBehavior.floating,
            duration: const Duration(seconds: 3),
          ),
        );
      }
    } catch (e) {
      debugPrint("PDF Export Error: $e");
      if (context.mounted) {
        Navigator.of(context).pop();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Export failed: $e'),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
            duration: const Duration(seconds: 5),
          ),
        );
      }
    } finally {
      statusNotifier.dispose();
      progressNotifier.dispose();
    }
  }

  Future<void> _uploadPdfWithRetry(
    Uint8List pdfBytes,
    String setId,
    int totalPages,
    String fileName,
    ValueNotifier<String> statusNotifier,
    ValueNotifier<double> progressNotifier,
  ) async {
    int attempt = 0;
    Exception? lastError;

    while (attempt < _maxRetries) {
      try {
        await _uploadPdf(pdfBytes, setId, totalPages, fileName);
        return; // Success
      } catch (e) {
        attempt++;
        lastError = Exception(e);
        
        if (attempt < _maxRetries) {
          statusNotifier.value =
              "Upload failed, retrying... (${attempt}/$_maxRetries)";
          await Future.delayed(Duration(seconds: attempt * 2));
        }
      }
    }

    // All retries failed
    throw Exception(
      'Failed to upload PDF after $_maxRetries attempts. Last error: $lastError',
    );
  }

  Future<void> _uploadPdf(
    Uint8List pdfBytes,
    String setId,
    int totalPages,
    String fileName,
  ) async {
    try {
      final fileSizeMB =
          (pdfBytes.lengthInBytes / (1024 * 1024)).toStringAsFixed(2);

      final formData = FormData.fromMap({
        'file': MultipartFile.fromBytes(
          pdfBytes,
          filename: fileName,
          contentType: MediaType.parse('application/pdf'),
        ),
        'totalPages': totalPages.toString(),
        'fileSize': fileSizeMB,
      });

      const String apiUrl = 'http://localhost:4000/api';
      final response = await _dio.post(
        '$apiUrl/whiteboard/sets/$setId/whiteboard-pdf',
        data: formData,
        onSendProgress: (int sent, int total) {
          debugPrint('Upload progress: $sent / $total bytes');
        },
      );

      if (response.statusCode != 201 && response.statusCode != 200) {
        throw Exception(
          'Server error: ${response.statusCode} - ${response.statusMessage}',
        );
      }

      debugPrint('PDF uploaded successfully: ${response.data}');
    } on DioException catch (e) {
      final errorMsg = 'Upload failed: ${e.message}';
      debugPrint(errorMsg);
      rethrow;
    } catch (e) {
      debugPrint('Upload error: $e');
      rethrow;
    }
  }

  void _showProgressDialog(
    BuildContext context,
    ValueNotifier<String> statusNotifier,
    ValueNotifier<double> progressNotifier,
  ) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => WillPopScope(
        onWillPop: () async => false, // Prevent dismiss by back button
        child: Center(
          child: Container(
            width: 340,
            padding: const EdgeInsets.all(28),
            decoration: BoxDecoration(
              color: const Color(0xFF1A1A1A),
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.8),
                  blurRadius: 32,
                  offset: const Offset(0, 16),
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
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          Colors.blue.shade400,
                          Colors.blue.shade600,
                        ],
                      ),
                    ),
                    child: const Center(
                      child: SizedBox(
                        width: 48,
                        height: 48,
                        child: CircularProgressIndicator(
                          strokeWidth: 3,
                          valueColor:
                              AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

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
                              fontWeight: FontWeight.w600,
                              height: 1.4,
                            ),
                            textAlign: TextAlign.center,
                          ),
                          if (status.contains('may take'))
                            Padding(
                              padding: const EdgeInsets.only(top: 8),
                              child: Text(
                                'Please don\'t close the app',
                                style: TextStyle(
                                  color: Colors.blue[300],
                                  fontSize: 12,
                                  fontStyle: FontStyle.italic,
                                ),
                              ),
                            ),
                        ],
                      );
                    },
                  ),
                  const SizedBox(height: 20),

                  // Progress Bar with percentage
                  ValueListenableBuilder<double>(
                    valueListenable: progressNotifier,
                    builder: (context, progress, child) {
                      return Column(
                        children: [
                          // Animated progress bar
                          ClipRRect(
                            borderRadius: BorderRadius.circular(4),
                            child: LinearProgressIndicator(
                              value: progress,
                              backgroundColor: Colors.white.withValues(alpha: 0.1),
                              valueColor: AlwaysStoppedAnimation<Color>(
                                progress < 0.3
                                    ? Colors.blue
                                    : progress < 0.7
                                        ? Colors.cyan
                                        : Colors.green,
                              ),
                              minHeight: 4,
                            ),
                          ),
                          const SizedBox(height: 10),

                          // Percentage text
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '${(progress * 100).toStringAsFixed(0)}%',
                                style: const TextStyle(
                                  color: Colors.white70,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              Text(
                                progress >= 1.0
                                    ? 'Complete'
                                    : progress < 0.3
                                        ? 'Preparing...'
                                        : progress < 0.7
                                            ? 'Generating...'
                                            : 'Uploading...',
                                style: const TextStyle(
                                  color: Colors.white54,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        ],
                      );
                    },
                  ),

                  const SizedBox(height: 16),

                  // Tips
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.blue.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: Colors.blue.withValues(alpha: 0.2),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.info,
                          size: 14,
                          color: Colors.blue[300],
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'Larger PDFs may take longer',
                            style: TextStyle(
                              color: Colors.blue[300],
                              fontSize: 11,
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
}
