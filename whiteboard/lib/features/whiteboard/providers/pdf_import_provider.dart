import 'dart:typed_data';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:file_picker/file_picker.dart';
import 'package:pdfx/pdfx.dart';
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'canvas_provider.dart';

class PdfImportState {
  final String? fileName;
  final int? pageCount;
  final bool isLoading;
  final String? error;
  final List<Uint8List> thumbnails;
  final String? filePath;
  final Uint8List? fileBytes;

  PdfImportState({
    this.fileName,
    this.pageCount,
    this.isLoading = false,
    this.error,
    this.thumbnails = const [],
    this.filePath,
    this.fileBytes,
  });

  PdfImportState copyWith({
    String? fileName,
    int? pageCount,
    bool? isLoading,
    String? error,
    List<Uint8List>? thumbnails,
    String? filePath,
    Uint8List? fileBytes,
  }) {
    return PdfImportState(
      fileName: fileName ?? this.fileName,
      pageCount: pageCount ?? this.pageCount,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
      thumbnails: thumbnails ?? this.thumbnails,
      filePath: filePath ?? this.filePath,
      fileBytes: fileBytes ?? this.fileBytes,
    );
  }
}

class PdfImportNotifier extends StateNotifier<PdfImportState> {
  PdfImportNotifier() : super(PdfImportState());

  Future<void> pickPdf() async {
    state = state.copyWith(isLoading: true, error: null, thumbnails: []);
    
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf'],
        withData: true,
      );

      if (result != null && result.files.isNotEmpty) {
        final file = result.files.single;
        PdfDocument document;
        
        if (kIsWeb || file.path == null) {
          if (file.bytes == null) throw Exception("No bytes available");
          document = await PdfDocument.openData(file.bytes!);
        } else {
          document = await PdfDocument.openFile(file.path!);
        }
        
        // Generate thumbnails for the first few pages (e.g., up to 10)
        final List<Uint8List> thumbs = [];
        final count = document.pagesCount > 10 ? 10 : document.pagesCount;
        
        for (int i = 1; i <= count; i++) {
          final page = await document.getPage(i);
          final pageImage = await page.render(
            width: page.width / 4,
            height: page.height / 4,
            format: PdfPageImageFormat.jpeg,
            quality: 70,
          );
          if (pageImage != null) {
            thumbs.add(pageImage.bytes);
          }
          await page.close();
        }

        state = state.copyWith(
          fileName: file.name,
          pageCount: document.pagesCount,
          filePath: file.path,
          fileBytes: file.bytes,
          thumbnails: thumbs,
          isLoading: false,
        );
        
        await document.close();
      } else {
        state = state.copyWith(isLoading: false);
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: 'Failed to load PDF: $e');
    }
  }

  Future<Uint8List?> renderPage(int pageNumber) async {
    if (state.filePath == null && state.fileBytes == null) return null;
    
    try {
      PdfDocument document;
      if (state.fileBytes != null) {
        document = await PdfDocument.openData(state.fileBytes!);
      } else {
        document = await PdfDocument.openFile(state.filePath!);
      }
      final page = await document.getPage(pageNumber);
      
      // Render at high resolution for whiteboard (2x or 3x)
      final pageImage = await page.render(
        width: page.width * 2,
        height: page.height * 2,
        format: PdfPageImageFormat.png,
        quality: 100,
      );
      
      await page.close();
      await document.close();
      
      return pageImage?.bytes;
    } catch (e) {
      return null;
    }
  }

  Future<List<Uint8List>> renderAllPages() async {
    if (state.filePath == null && state.fileBytes == null) return [];
    
    final List<Uint8List> results = [];
    try {
      PdfDocument document;
      if (state.fileBytes != null) {
        document = await PdfDocument.openData(state.fileBytes!);
      } else {
        document = await PdfDocument.openFile(state.filePath!);
      }
      for (int i = 1; i <= document.pagesCount; i++) {
        final page = await document.getPage(i);
        final pageImage = await page.render(
          width: page.width * 2,
          height: page.height * 2,
          format: PdfPageImageFormat.png,
          quality: 100,
        );
        if (pageImage != null) {
          results.add(pageImage.bytes);
        }
        await page.close();
      }
      await document.close();
    } catch (e) {
      debugPrint('Error bulk rendering PDF: $e');
    }
    return results;
  }

  void reset() {
    state = PdfImportState();
  }

  Future<void> importToCanvas(WidgetRef ref) async {
    await pickPdf();
    if (state.thumbnails.isNotEmpty || state.pageCount != null) {
      final pages = await renderAllPages();
      if (pages.isNotEmpty) {
        ref.read(canvasStateProvider.notifier).importPdfPages(pages);
      }
    }
  }
}

final pdfImportProvider = StateNotifierProvider<PdfImportNotifier, PdfImportState>((ref) {
  return PdfImportNotifier();
});
