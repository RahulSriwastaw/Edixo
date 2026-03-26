import 'dart:typed_data';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:share_plus/share_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../providers/canvas_provider.dart';

class ExportService {
  static Future<void> exportCurrentPageAsPng(WidgetRef ref) async {
    final GlobalKey boundaryKey = ref.read(canvasBoundaryKeyProvider);
    final boundary = boundaryKey.currentContext?.findRenderObject() as RenderRepaintBoundary?;

    if (boundary == null) return;

    try {
      final ui.Image image = await boundary.toImage(pixelRatio: 2.0);
      final ByteData? byteData = await image.toByteData(format: ui.ImageByteFormat.png);
      final Uint8List pngBytes = byteData!.buffer.asUint8List();

      final fileName = 'eduhub_board_${DateTime.now().millisecondsSinceEpoch}.png';

      // Share or Download
      await Share.shareXFiles(
        [XFile.fromData(pngBytes, name: fileName, mimeType: 'image/png')],
        text: 'EduHub Whiteboard Export',
      );
    } catch (e) {
      debugPrint('Error exporting PNG: $e');
    }
  }

  static Future<void> exportAllPagesAsPdf(WidgetRef ref) async {
    final canvasState = ref.read(canvasStateProvider);
    final notifier = ref.read(canvasStateProvider.notifier);
    final boundaryKey = ref.read(canvasBoundaryKeyProvider);
    
    final pdf = pw.Document();
    
    // Save original index to restore later
    final originalIndex = canvasState.currentPageIndex;

    try {
      for (int i = 0; i < canvasState.pages.length; i++) {
        // Switch to the page
        notifier.goToPage(i);
        
        // Wait a short moment for the canvas to render the new page
        await Future.delayed(const Duration(milliseconds: 300));
        
        final boundary = boundaryKey.currentContext?.findRenderObject() as RenderRepaintBoundary?;
        if (boundary == null) continue;

        final ui.Image image = await boundary.toImage(pixelRatio: 2.0);
        final ByteData? byteData = await image.toByteData(format: ui.ImageByteFormat.png);
        final Uint8List pngBytes = byteData!.buffer.asUint8List();

        final pdfImage = pw.MemoryImage(pngBytes);

        pdf.addPage(
          pw.Page(
            pageFormat: PdfPageFormat.a4.landscape,
            margin: pw.EdgeInsets.zero,
            build: (pw.Context context) {
              return pw.FullPage(
                ignoreMargins: true,
                child: pw.Image(pdfImage, fit: pw.BoxFit.contain),
              );
            },
          ),
        );
      }

      final fileName = 'eduhub_document_${DateTime.now().millisecondsSinceEpoch}.pdf';
      final pdfBytes = await pdf.save();

      // Trigger download/share via printing package, robust on Web and Mobile
      await Printing.sharePdf(bytes: pdfBytes, filename: fileName);
      
    } catch (e) {
      debugPrint('Error exporting PDF: $e');
    } finally {
      // Restore original page
      notifier.goToPage(originalIndex);
    }
  }

  static Future<void> exportAnnotationsOnlyPdf(WidgetRef ref) async {
    final canvasState = ref.read(canvasStateProvider);
    final notifier = ref.read(canvasStateProvider.notifier);
    final boundaryKey = ref.read(canvasBoundaryKeyProvider);
    
    ref.read(hideCanvasBackgroundProvider.notifier).state = true;
    final pdf = pw.Document();
    final originalIndex = canvasState.currentPageIndex;

    try {
      for (int i = 0; i < canvasState.pages.length; i++) {
        notifier.goToPage(i);
        await Future.delayed(const Duration(milliseconds: 300));
        
        final boundary = boundaryKey.currentContext?.findRenderObject() as RenderRepaintBoundary?;
        if (boundary == null) continue;

        final ui.Image image = await boundary.toImage(pixelRatio: 2.0);
        final ByteData? byteData = await image.toByteData(format: ui.ImageByteFormat.png);
        final Uint8List pngBytes = byteData!.buffer.asUint8List();

        final pdfImage = pw.MemoryImage(pngBytes);

        pdf.addPage(
          pw.Page(
            pageFormat: PdfPageFormat.a4.landscape,
            margin: pw.EdgeInsets.zero,
            build: (pw.Context context) {
              return pw.FullPage(
                ignoreMargins: true,
                child: pw.Image(pdfImage, fit: pw.BoxFit.contain),
              );
            },
          ),
        );
      }

      final fileName = 'eduhub_annotations_${DateTime.now().millisecondsSinceEpoch}.pdf';
      final pdfBytes = await pdf.save();

      await Printing.sharePdf(bytes: pdfBytes, filename: fileName);
      
    } catch (e) {
      debugPrint('Error exporting annotations PDF: $e');
    } finally {
      ref.read(hideCanvasBackgroundProvider.notifier).state = false;
      notifier.goToPage(originalIndex);
    }
  }
}
