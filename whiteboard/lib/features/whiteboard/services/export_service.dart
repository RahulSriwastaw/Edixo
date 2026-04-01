import 'dart:ui' as ui;
import 'package:flutter/material.dart' show Colors;
import 'package:flutter/foundation.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:intl/intl.dart';

import '../providers/canvas_provider.dart';
import '../presentation/widgets/drawing/canvas_painter.dart';
import '../providers/tool_provider.dart';

class ExportService {
  static Future<void> exportPageToPdf(PageData page) async {
    try {
      // 1. Render the canvas to an image
      final recorder = ui.PictureRecorder();
      final canvas = ui.Canvas(recorder);
      const size = ui.Size(4000, 3000);

      // Draw background
      final bgPaint = ui.Paint()..color = _getBgColor(page.bgColor);
      canvas.drawRect(ui.Rect.fromLTWH(0, 0, size.width, size.height), bgPaint);

      // Draw content using our existing CanvasPainter
      final painter = CanvasPainter(
        strokes: page.strokes,
        objects: page.objects,
      );
      
      painter.paint(canvas, size);

      final picture = recorder.endRecording();
      // To prevent massive memory usage, let's scale it down by half for the PDF (2000x1500)
      final img = await picture.toImage(2000, 1500); 
      final byteData = await img.toByteData(format: ui.ImageByteFormat.png);
      final pngBytes = byteData!.buffer.asUint8List();

      // 2. Create PDF
      final pdf = pw.Document();
      final image = pw.MemoryImage(pngBytes);

      pdf.addPage(
        pw.Page(
          pageFormat: PdfPageFormat.a4.landscape,
          margin: const pw.EdgeInsets.all(0),
          build: (pw.Context context) {
            return pw.Center(
              child: pw.Image(image, fit: pw.BoxFit.contain),
            );
          },
        ),
      );

      // 3. Share or Save PDF
      final timestamp = DateFormat('yyyyMMdd_HHmmss').format(DateTime.now());
      final filename = 'EduHub_Note_$timestamp.pdf';

      await Printing.sharePdf(
        bytes: await pdf.save(),
        filename: filename,
      );

    } catch (e) {
      debugPrint('Export Error: $e');
    }
  }

  static ui.Color _getBgColor(BackgroundColor color) {
    switch (color) {
      case BackgroundColor.white: return const ui.Color(0xFFFFFFFF);
      case BackgroundColor.lightBlue: return const ui.Color(0xFFF0F8FF);
      case BackgroundColor.lightYellow: return const ui.Color(0xFFFFFFE0);
      case BackgroundColor.dark: return const ui.Color(0xFF1E1E1E);
    }
  }
}
