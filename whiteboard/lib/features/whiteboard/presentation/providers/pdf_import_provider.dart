// lib/features/whiteboard/presentation/providers/pdf_import_provider.dart
//
// Picks a PDF, renders each page to PNG, creates synthetic SetSlideModel entries,
// and loads them into slideNotifierProvider + pdfPagesProvider.

import 'package:flutter/foundation.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:uuid/uuid.dart';
import '../../data/models/slide_model.dart';
import '../../data/models/set_metadata_model.dart';
import '../../domain/services/pdf_import_service.dart';
import 'slide_provider.dart';
import 'pdf_pages_provider.dart';
import 'session_provider.dart';

part 'pdf_import_provider.g.dart';

enum PdfImportStatus { idle, picking, rendering, done, error }

class PdfImportState {
  final PdfImportStatus status;
  final String? errorMessage;
  final int totalPages;
  final int renderedPages;

  const PdfImportState({
    this.status = PdfImportStatus.idle,
    this.errorMessage,
    this.totalPages = 0,
    this.renderedPages = 0,
  });

  double get progress =>
      totalPages == 0 ? 0.0 : renderedPages / totalPages;

  PdfImportState copyWith({
    PdfImportStatus? status,
    String? errorMessage,
    int? totalPages,
    int? renderedPages,
  }) =>
      PdfImportState(
        status: status ?? this.status,
        errorMessage: errorMessage,
        totalPages: totalPages ?? this.totalPages,
        renderedPages: renderedPages ?? this.renderedPages,
      );
}

@riverpod
class PdfImportNotifier extends _$PdfImportNotifier {
  @override
  PdfImportState build() => const PdfImportState();

  Future<void> importPdf() async {
    state = state.copyWith(status: PdfImportStatus.picking);

    try {
      final pages = await PdfImportService.importPdf();

      if (pages.isEmpty) {
        // User cancelled or PDF had no pages
        state = const PdfImportState();
        return;
      }

      state = state.copyWith(
        status: PdfImportStatus.rendering,
        totalPages: pages.length,
        renderedPages: 0,
      );

      const uuid = Uuid();
      final slides = <SetSlideModel>[];
      final pageMap = <String, Uint8List>{};

      for (int i = 0; i < pages.length; i++) {
        final slideId = uuid.v4();
        slides.add(SetSlideModel(
          slideId: slideId,
          questionNumber: i + 1,
          questionText: 'Page ${i + 1}',  // Plain label — no HTML question
          options: const [],
          backgroundImageUrl: null,  // Stored in pdfPagesProvider, not URL
        ));
        pageMap[slideId] = pages[i];
        state = state.copyWith(renderedPages: i + 1);
      }

      // Store page images in memory provider
      ref.read(pdfPagesProvider.notifier).state = pageMap;

      // Load slides into whiteboard
      final metadata = SetMetadataModel(
        setId: 'pdf-${DateTime.now().millisecondsSinceEpoch}',
        title: 'PDF Document (${pages.length} pages)',
        questionCount: pages.length,
      );
      ref.read(slideNotifierProvider.notifier).loadSlides(slides, metadata);
      
      // Start a local session to enable autosave
      ref.read(sessionNotifierProvider.notifier).startSession('local-${metadata.setId}');

      state = state.copyWith(status: PdfImportStatus.done);

      // Reset back to idle after a moment
      await Future.delayed(const Duration(seconds: 2));
      if (state.status == PdfImportStatus.done) {
        state = const PdfImportState();
      }
    } catch (e) {
      debugPrint('PdfImportNotifier error: $e');
      state = state.copyWith(
        status: PdfImportStatus.error,
        errorMessage: e.toString(),
      );
    }
  }

  void reset() => state = const PdfImportState();
}
