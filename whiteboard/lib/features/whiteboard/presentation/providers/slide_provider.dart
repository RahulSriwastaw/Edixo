// lib/features/whiteboard/presentation/providers/slide_provider.dart

import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../data/models/slide_model.dart';
import '../../data/models/slide_annotation.dart';
import '../../data/models/set_metadata_model.dart';
import 'canvas_provider.dart';
import '../../../question_widget/presentation/providers/selected_widget_provider.dart';
import '../../../question_widget/presentation/providers/question_widget_provider.dart';
import '../../data/models/page_models.dart';


import '../../../question_widget/presentation/providers/set_layout_notifier.dart';
import 'app_mode_provider.dart';
import 'slide_capture_provider.dart';


part 'slide_provider.g.dart';

// ── SlideState ──────────────────────────────────────────────────────────────

class SlideState {
  final List<WhiteboardPage>            pages;
  final int                              currentPageIndex;
  final List<SetMetadataModel>           importedSets;
  final Map<String, SlideAnnotationData> savedAnnotations;

  const SlideState({
    required this.pages,
    required this.currentPageIndex,
    required this.importedSets,
    required this.savedAnnotations,
  });

  factory SlideState.initial() => const SlideState(
    pages:            [],
    currentPageIndex: 0,
    importedSets:     [],
    savedAnnotations:  {},
  );

  WhiteboardPage? get currentPage =>
    pages.isEmpty ? null : pages[currentPageIndex];

  bool get hasSlides => pages.isNotEmpty;

  SlideState copyWith({
    List<WhiteboardPage>?              pages,
    int?                              currentPageIndex,
    List<SetMetadataModel>?           importedSets,
    Map<String, SlideAnnotationData>? savedAnnotations,
  }) => SlideState(
    pages:            pages            ?? this.pages,
    currentPageIndex: currentPageIndex ?? this.currentPageIndex,
    importedSets:     importedSets     ?? this.importedSets,
    savedAnnotations:  savedAnnotations  ?? this.savedAnnotations,
  );
}


// ── SlideNotifier ───────────────────────────────────────────────────────────

@riverpod
class SlideNotifier extends _$SlideNotifier {
  @override
  SlideState build() => SlideState.initial();

  /// Called after successful Set import (initial load or Start New Session).
  void loadSlides(List<SetSlideModel> slides, SetMetadataModel metadata) {
    final pages = slides.map((s) => SetImportPage(id: s.slideId, slide: s, setId: metadata.setId)).toList();
    
    state = SlideState(
      pages:            pages,
      currentPageIndex: 0,
      importedSets:     [metadata],
      savedAnnotations:  {},
    );
    
    // Clear capture cache for the new session
    ref.read(slideCaptureProvider.notifier).clear();
    
    // Initialize layout for the set
    ref.read(setLayoutNotifierProvider.notifier).initSet(metadata.setId, visualSettings: metadata.visualSettings);

    // Load first slide canvas
    if (pages.isNotEmpty) {
      _activateSlide(0);
    }
  }

  /// Appends new slides to the current session.
  void appendSlides(List<SetSlideModel> slides, SetMetadataModel metadata) {
    final newPages = slides.map((s) => SetImportPage(id: s.slideId, slide: s, setId: metadata.setId)).toList();
    final previousPageIndex = state.currentPageIndex;
    
    state = state.copyWith(
      pages: [...state.pages, ...newPages],
      importedSets: [...state.importedSets, metadata],
    );

    // Clear capture cache for the new set to ensure fresh captures
    ref.read(slideCaptureProvider.notifier).clear();

    // Initialize layout for the new set
    ref.read(setLayoutNotifierProvider.notifier).initSet(metadata.setId, visualSettings: metadata.visualSettings);

    // If we were at 0 and now have slides, activate
    if (previousPageIndex == 0 && state.pages.length == newPages.length) {
      _activateSlide(0);
    }
  }

  /// Navigate to a different slide by index.
  void navigateToSlide(int index) {
    if (index < 0 || index >= state.pages.length) return;
    if (index == state.currentPageIndex) return;

    // 1. Trigger background capture of the slide we're leaving
    // We do this in a fire-and-forget manner to keep navigation snappy
    final currentKey = ref.read(canvasRepaintKeyProvider);
    final currentIndex = state.currentPageIndex;
    ref.read(slideCaptureProvider.notifier).captureSlide(currentIndex, currentKey);

    // 2. Persist current canvas annotations
    _persistCurrentCanvas();
    // 3. Update index
    state = state.copyWith(currentPageIndex: index);
    // 3. Load new slide canvas
    _activateSlide(index);
    // 4. Deselect any selected widget
    ref.read(selectedWidgetNotifierProvider.notifier).deselect();
  }

  void _persistCurrentCanvas() {
    final canvas  = ref.read(canvasNotifierProvider);
    final pageId = state.currentPage?.id;
    if (pageId == null) return;
    final annotation = SlideAnnotationData(
      slideId: pageId,
      strokes: List.from(canvas.strokes),
      objects: List.from(canvas.objects),
    );
    state = state.copyWith(
      savedAnnotations: {...state.savedAnnotations, pageId: annotation},
    );
  }

  void _activateSlide(int index) {
    final page  = state.pages[index];
    final saved  = state.savedAnnotations[page.id];
    ref.read(canvasNotifierProvider.notifier).loadFromAnnotation(
      saved ?? SlideAnnotationData(slideId: page.id),
    );
    
    if (page is SetImportPage) {
      // 1. MUST re-initialize layout notifier with the correct setId and its settings
      ref.read(setLayoutNotifierProvider.notifier).initSet(page.setId);
      
      // 2. Load layouts ONLY IF NOT a PDF import
      if (!page.setId.startsWith('pdf-')) {
        ref.read(setLayoutNotifierProvider.notifier).loadLayoutsForQuestion(page.slide.questionNumber);
        // Note: We no longer populateFromSlides here because it creates a duplicate 
        // combined card. The layout manager handles the separate q/o cards.
      } else {
        // Ensure manual widgets are cleared for PDF pages to avoid 'Page X' cards
        ref.read(questionWidgetNotifierProvider.notifier).clear();
      }
      
      // Also enter Slide Mode if not already
      ref.read(appModeNotifierProvider.notifier).enterSlideMode();
    }
  }
}

