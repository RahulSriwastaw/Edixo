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


part 'slide_provider.g.dart';

// ── SlideState ──────────────────────────────────────────────────────────────

class SlideState {
  final List<WhiteboardPage>            pages;
  final int                              currentPageIndex;
  final SetMetadataModel?                setMetadata;
  final Map<String, SlideAnnotationData> savedAnnotations;

  const SlideState({
    required this.pages,
    required this.currentPageIndex,
    this.setMetadata,
    required this.savedAnnotations,
  });

  factory SlideState.initial() => const SlideState(
    pages:            [],
    currentPageIndex: 0,
    savedAnnotations:  {},
  );

  WhiteboardPage? get currentPage =>
    pages.isEmpty ? null : pages[currentPageIndex];

  bool get hasSlides => pages.isNotEmpty;

  SlideState copyWith({
    List<WhiteboardPage>?              pages,
    int?                              currentPageIndex,
    SetMetadataModel?                 setMetadata,
    Map<String, SlideAnnotationData>? savedAnnotations,
  }) => SlideState(
    pages:            pages            ?? this.pages,
    currentPageIndex: currentPageIndex ?? this.currentPageIndex,
    setMetadata:       setMetadata       ?? this.setMetadata,
    savedAnnotations:  savedAnnotations  ?? this.savedAnnotations,
  );
}


// ── SlideNotifier ───────────────────────────────────────────────────────────

@riverpod
class SlideNotifier extends _$SlideNotifier {
  @override
  SlideState build() => SlideState.initial();

  /// Called after successful Set import.
  void loadSlides(List<SetSlideModel> slides, SetMetadataModel metadata) {
    final pages = slides.map((s) => SetImportPage(id: s.slideId, slide: s)).toList();
    
    state = SlideState(
      pages:            pages,
      currentPageIndex: 0,
      setMetadata:       metadata,
      savedAnnotations:  {},
    );
    
    // Initialize layout for the set
    ref.read(setLayoutNotifierProvider.notifier).initSet(metadata.setId);

    
    // Load first slide canvas
    if (pages.isNotEmpty) {
      _activateSlide(0);
    }
  }

  /// Navigate to a different slide by index.
  void navigateToSlide(int index) {
    if (index < 0 || index >= state.pages.length) return;
    if (index == state.currentPageIndex) return;

    // 1. Persist current canvas annotations before leaving
    _persistCurrentCanvas();
    // 2. Update index
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
      // Load layouts for this question
      ref.read(setLayoutNotifierProvider.notifier).loadLayoutsForQuestion(page.slide.questionNumber);
      // Also enter Slide Mode if not already
      ref.read(appModeNotifierProvider.notifier).enterSlideMode();
    }
  }
}

