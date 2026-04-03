// lib/features/whiteboard/services/export_service.dart

import 'dart:io';
import 'dart:typed_data';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:path_provider/path_provider.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:archive/archive.dart';
import 'package:archive/archive_io.dart';
import '../data/models/stroke_model.dart';
import '../data/models/canvas_object_model.dart';
import '../data/models/slide_annotation.dart';

/// Service for exporting whiteboard sessions to PDF/PNG
class ExportService {
  /// Generate PDF from session annotations
  /// Runs in compute() isolate to avoid blocking main thread
  static Future<File> generatePdf({
    required String sessionId,
    required List<SlideAnnotationData> slideAnnotations,
    required int slideCount,
  }) async {
    final pdf = pw.Document();

    // Generate one page per slide
    for (int i = 0; i < slideCount; i++) {
      final annotation = i < slideAnnotations.length
          ? slideAnnotations[i]
          : SlideAnnotationData(slideId: 'slide-$i');

      pdf.addPage(
        pw.Page(
          pageFormat: PdfPageFormat.a4.landscape,
          build: (context) {
            return pw.Center(
              child: pw.Text(
                'Slide ${i + 1}',
                style: const pw.TextStyle(fontSize: 24),
              ),
            );
          },
        ),
      );
    }

    // Save to temporary file
    final tempDir = await getTemporaryDirectory();
    final file = File('${tempDir.path}/session_$sessionId.pdf');
    await file.writeAsBytes(await pdf.save());

    return file;
  }

  /// Generate PNG images from strokes
  /// Returns list of image file paths
  static Future<List<File>> generatePngs({
    required String sessionId,
    required List<SlideAnnotationData> slideAnnotations,
    required int slideCount,
    required Size canvasSize,
  }) async {
    final tempDir = await getTemporaryDirectory();
    final files = <File>[];

    for (int i = 0; i < slideCount; i++) {
      final annotation = i < slideAnnotations.length
          ? slideAnnotations[i]
          : SlideAnnotationData(slideId: 'slide-$i');

      // Create a recorder to capture the canvas
      final recorder = ui.PictureRecorder();
      final canvas = Canvas(recorder);

      // Draw background
      canvas.drawRect(
        Rect.fromLTWH(0, 0, canvasSize.width, canvasSize.height),
        Paint()..color = const Color(0xFF0D0D0D),
      );

      // Draw strokes
      for (final stroke in annotation.strokes) {
        _drawStrokeOnCanvas(canvas, stroke);
      }

      // Draw objects
      for (final obj in annotation.objects) {
        _drawObjectOnCanvas(canvas, obj);
      }

      // Convert to image
      final picture = recorder.endRecording();
      final image = await picture.toImage(
        canvasSize.width.toInt(),
        canvasSize.height.toInt(),
      );
      final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
      final pngBytes = byteData!.buffer.asUint8List();

      // Save to file
      final file = File('${tempDir.path}/slide_${i + 1}.png');
      await file.writeAsBytes(pngBytes);
      files.add(file);
    }

    return files;
  }

  /// Create ZIP archive from PNG files
  static Future<File> createZip({
    required String sessionId,
    required List<File> pngFiles,
  }) async {
    final encoder = ZipFileEncoder();
    final tempDir = await getTemporaryDirectory();
    final zipFile = File('${tempDir.path}/session_$sessionId.zip');

    encoder.create(zipFile.path);

    for (final file in pngFiles) {
      await encoder.addFile(file);
    }

    await encoder.close();
    return zipFile;
  }

  /// Draw a stroke on canvas (for PNG export)
  static void _drawStrokeOnCanvas(Canvas canvas, StrokeModel stroke) {
    if (stroke.points.isEmpty) return;

    final paint = Paint()
      ..color = Color(stroke.colorARGB).withOpacity(stroke.opacity)
      ..strokeWidth = stroke.strokeWidth
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..style = PaintingStyle.stroke;

    final points = stroke.points;
    if (points.length < 2) {
      canvas.drawCircle(points[0], stroke.strokeWidth / 2, paint);
      return;
    }

    for (int i = 0; i < points.length - 1; i++) {
      canvas.drawLine(points[i], points[i + 1], paint);
    }
  }

  /// Draw an object on canvas (for PNG export)
  static void _drawObjectOnCanvas(Canvas canvas, CanvasObjectModel obj) {
    final rect = Rect.fromLTWH(obj.x, obj.y, obj.width, obj.height);
    final paint = Paint()
      ..color = obj.fillColor.withOpacity(obj.opacity)
      ..style = PaintingStyle.fill;

    final borderPaint = Paint()
      ..color = obj.borderColor.withOpacity(obj.opacity)
      ..strokeWidth = obj.borderWidth
      ..style = PaintingStyle.stroke;

    switch (obj.type) {
      case ObjectType.rectangle:
        canvas.drawRect(rect, paint);
        if (obj.borderWidth > 0) canvas.drawRect(rect, borderPaint);
      case ObjectType.circle:
        final center = Offset(obj.x + obj.width / 2, obj.y + obj.height / 2);
        final radius = (obj.width + obj.height) / 4;
        canvas.drawCircle(center, radius, paint);
        if (obj.borderWidth > 0) canvas.drawCircle(center, radius, borderPaint);
      default:
        canvas.drawRect(rect, paint);
    }
  }
}
