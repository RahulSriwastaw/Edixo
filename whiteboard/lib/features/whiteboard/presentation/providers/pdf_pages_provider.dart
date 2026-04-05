// lib/features/whiteboard/presentation/providers/pdf_pages_provider.dart
//
// Holds rendered PDF page images in memory (slideId → PNG bytes).
// Not persisted to Hive — reloaded if app restarts.

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Map from slideId → rendered PNG bytes for PDF-sourced slides.
final pdfPagesProvider =
    StateProvider<Map<String, Uint8List>>((ref) => const {});
