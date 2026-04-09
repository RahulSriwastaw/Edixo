// lib/features/whiteboard/services/pdf_exporter_service.dart

import 'dart:typed_data';
import 'dart:ui' as ui;
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:dio/dio.dart';
import 'package:http_parser/http_parser.dart';

import '../presentation/providers/slide_provider.dart';
import '../presentation/providers/canvas_provider.dart';
import '../presentation/providers/session_provider.dart';
import '../presentation/providers/slide_capture_provider.dart';

class PdfExporterService {
  final WidgetRef ref;

  PdfExporterService(this.ref);

  Future<void> exportSessionToPdf(BuildContext context) async {
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

    // Status notifier for the dialog
    final statusNotifier = ValueNotifier<String>("Preparing export...");
    final progressNotifier = ValueNotifier<double>(0.0);

    // Show loading overlay
    _showProgressDialog(context, statusNotifier, progressNotifier);

    final pdf = pw.Document();
    final originalIndex = slideState.currentPageIndex;

    try {
      final totalPages = slideState.pages.length;
      final cachedSlides = ref.read(slideCaptureProvider);
      final captureNotifier = ref.read(slideCaptureProvider.notifier);

      // 1. Capture the current (last) slide one last time to get final changes
      statusNotifier.value = "Capturing final slide...";
      progressNotifier.value = 0.1;
      await captureNotifier.captureSlide(slideState.currentPageIndex, canvasKey);

      for (int i = 0; i < totalPages; i++) {
        final progress = 0.1 + (0.7 * (i / totalPages));
        progressNotifier.value = progress;
        statusNotifier.value = "Assembling slide ${i + 1} of $totalPages...";

        Uint8List? pngBytes = ref.read(slideCaptureProvider)[i];

        // 2. Fallback: If not cached, navigate and capture manually
        if (pngBytes == null) {
          statusNotifier.value = "Recovering slide ${i + 1}...";
          if (slideState.currentPageIndex != i) {
            slideNotifier.navigateToSlide(i);
            await Future.delayed(const Duration(milliseconds: 300));
          }
          await captureNotifier.captureSlide(i, canvasKey);
          pngBytes = ref.read(slideCaptureProvider)[i];
        }

        if (pngBytes == null) {
          debugPrint("Critical Error: Could not capture slide $i");
          continue;
        }

        // 3. Add to PDF
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
        
        await Future.delayed(Duration.zero);
      }

      // 4. Restore original slide
      if (originalIndex != slideState.currentPageIndex) {
        slideNotifier.navigateToSlide(originalIndex);
        await Future.delayed(const Duration(milliseconds: 100));
      }

      // 5. Generate PDF Bytes
      statusNotifier.value = "Finalizing PDF document...";
      progressNotifier.value = 0.9;
      await Future.delayed(const Duration(milliseconds: 100));
      
      final pdfBytes = await pdf.save();
      final setId = slideState.importedSets.isNotEmpty ? slideState.importedSets.first.setId : 'unknown';

      // 8. Upload to Backend
      statusNotifier.value = "Uploading to server...";
      await _uploadPdf(pdfBytes, setId, totalPages);
      
      progressNotifier.value = 1.0;
      statusNotifier.value = "Success!";

      if (context.mounted) {
        // Short delay to show the "Success!" state
        await Future.delayed(const Duration(milliseconds: 500));
        Navigator.of(context).pop(); // Close progress
        
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Class notes generated and uploaded successfully!'),
            backgroundColor: Colors.green,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } catch (e) {
      debugPrint("PDF Export Error: $e");
      if (context.mounted) {
        Navigator.of(context).pop(); 
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to generate PDF: $e'), 
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    } finally {
      statusNotifier.dispose();
      progressNotifier.dispose();
    }
  }

  Future<void> _uploadPdf(Uint8List pdfBytes, String setId, int totalPages) async {
    final dio = Dio();
    final fileName = "class_notes_$setId.pdf";
    
    final formData = FormData.fromMap({
      'file': MultipartFile.fromBytes(
        pdfBytes, 
        filename: fileName,
        contentType: MediaType.parse('application/pdf'),
      ),
      'totalPages': totalPages,
      'fileSize': (pdfBytes.lengthInBytes / (1024 * 1024)).toStringAsFixed(2),
    });

    const String apiUrl = 'http://localhost:4000/api';
    await dio.post('$apiUrl/whiteboard/sets/$setId/whiteboard-pdf', data: formData);
  }

  void _showProgressDialog(
    BuildContext context, 
    ValueNotifier<String> statusNotifier,
    ValueNotifier<double> progressNotifier,
  ) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => Center(
        child: Container(
          width: 280, // Compact width
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: const Color(0xFF1E1E1E),
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.4),
                blurRadius: 20,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Material(
            color: Colors.transparent,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.redAccent),
                  ),
                ),
                const SizedBox(height: 20),
                ValueListenableBuilder<String>(
                  valueListenable: statusNotifier,
                  builder: (context, status, child) {
                    return Text(
                      status,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                      ),
                      textAlign: TextAlign.center,
                    );
                  },
                ),
                const SizedBox(height: 12),
                ValueListenableBuilder<double>(
                  valueListenable: progressNotifier,
                  builder: (context, progress, child) {
                    return ClipRRect(
                      borderRadius: BorderRadius.circular(2),
                      child: LinearProgressIndicator(
                        value: progress,
                        backgroundColor: Colors.white10,
                        valueColor: const AlwaysStoppedAnimation<Color>(Colors.redAccent),
                        minHeight: 2,
                      ),
                    );
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
  void _updateProgressDialog(BuildContext context, int current, int total) {
     // No longer used, replaced by ValueNotifier system
  }
}
