// lib/features/whiteboard/services/export_service.dart

import 'dart:typed_data';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:archive/archive.dart';
import '../data/models/stroke_model.dart';
import '../data/models/canvas_object_model.dart';
import '../data/models/slide_annotation.dart';

/// Service for exporting whiteboard sessions to PDF/PNG
class ExportService {
  /// Generate PDF from session annotations in memory
  static Future<Uint8List> generatePdf({
    required List<SlideAnnotationData> slideAnnotations,
    required int slideCount,
  }) async {
    final pdf = pw.Document();

    // Generate one page per slide
    for (int i = 0; i < slideCount; i++) {
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

    return await pdf.save();
  }

  /// Generate PNG images from strokes in memory
  static Future<List<Uint8List>> generatePngs({
    required List<SlideAnnotationData> slideAnnotations,
    required int slideCount,
    required Size canvasSize,
  }) async {
    final images = <Uint8List>[];

    for (int i = 0; i < slideCount; i++) {
      final annotation = i < slideAnnotations.length
          ? slideAnnotations[i]
          : SlideAnnotationData(slideId: 'slide-$i');

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

      final picture = recorder.endRecording();
      final image = await picture.toImage(
        canvasSize.width.toInt(),
        canvasSize.height.toInt(),
      );
      final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
      final pngBytes = byteData!.buffer.asUint8List();

      images.add(pngBytes);
    }

    return images;
  }

  /// Create ZIP archive from PNG bytes in memory
  static Future<Uint8List> createZip({
    required List<Uint8List> pngDataList,
  }) async {
    final archive = Archive();

    for (int i = 0; i < pngDataList.length; i++) {
      final archiveFile = ArchiveFile(
        'slide_${i + 1}.png',
        pngDataList[i].length,
        pngDataList[i],
      );
      archive.addFile(archiveFile);
    }

    final zipData = ZipEncoder().encode(archive);
    return Uint8List.fromList(zipData!);
  }

  /// Draw a stroke on canvas (for PNG export)
  static void _drawStrokeOnCanvas(Canvas canvas, StrokeModel stroke) {
    if (stroke.points.isEmpty) return;

    final paint = Paint()
      ..color = Color(stroke.colorARGB).withValues(alpha: stroke.opacity)
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
      ..color = obj.fillColor.withValues(alpha: obj.opacity)
      ..style = PaintingStyle.fill;

    final borderPaint = Paint()
      ..color = obj.borderColor.withValues(alpha: obj.opacity)
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
