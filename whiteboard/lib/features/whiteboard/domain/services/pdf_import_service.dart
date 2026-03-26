import 'dart:typed_data';
import 'package:flutter/foundation.dart';
import 'package:file_picker/file_picker.dart';
import 'package:pdfx/pdfx.dart';

class PdfImportService {
  /// Opens a file picker, parses the selected PDF, and returns a list of PNG image bytes representing the pages.
  static Future<List<Uint8List>> importPdf() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf'],
        withData: true,
      );

      if (result == null || result.files.isEmpty) {
        return [];
      }

      final fileBytes = result.files.first.bytes;
      if (fileBytes == null) {
        return [];
      }

      final document = await PdfDocument.openData(fileBytes);
      final int pagesCount = document.pagesCount;
      final List<Uint8List> images = [];

      for (int i = 1; i <= pagesCount; i++) {
        final page = await document.getPage(i);
        
        // Render at 2x scale for better clarity on large canvases
        final pageImage = await page.render(
          width: page.width * 2,
          height: page.height * 2,
          format: PdfPageImageFormat.png,
        );

        if (pageImage?.bytes != null) {
          images.add(pageImage!.bytes);
        }
        await page.close();
      }

      await document.close();
      return images;
    } catch (e) {
      debugPrint('Error importing PDF: $e');
      return [];
    }
  }
}
