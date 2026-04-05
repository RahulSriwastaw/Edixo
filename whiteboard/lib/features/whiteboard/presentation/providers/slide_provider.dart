// lib/features/whiteboard/presentation/providers/slide_provider.dart

import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../data/models/slide_model.dart';
import '../../data/models/slide_annotation.dart';
import '../../data/models/set_metadata_model.dart';
import 'canvas_provider.dart';
import '../../../question_widget/presentation/providers/selected_widget_provider.dart';
import '../../../question_widget/presentation/providers/question_widget_provider.dart';

part 'slide_provider.g.dart';

// ── SlideState ──────────────────────────────────────────────────────────────

class SlideState {
  final List<SetSlideModel>              slides;
  final int                              currentSlideIndex;
  final SetMetadataModel?                setMetadata;
  final Map<String, SlideAnnotationData> savedAnnotations;

  const SlideState({
    required this.slides,
    required this.currentSlideIndex,
    this.setMetadata,
    required this.savedAnnotations,
  });

  factory SlideState.initial() => const SlideState(
    slides:            [],
    currentSlideIndex: 0,
    savedAnnotations:  {},
  );

  SetSlideModel? get currentSlide =>
    slides.isEmpty ? null : slides[currentSlideIndex];

  bool get hasSlides => slides.isNotEmpty;

  SlideState copyWith({
    List<SetSlideModel>?              slides,
    int?                              currentSlideIndex,
    SetMetadataModel?                 setMetadata,
    Map<String, SlideAnnotationData>? savedAnnotations,
  }) => SlideState(
    slides:            slides            ?? this.slides,
    currentSlideIndex: currentSlideIndex ?? this.currentSlideIndex,
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
    state = SlideState(
      slides:            slides,
      currentSlideIndex: 0,
      setMetadata:       metadata,
      savedAnnotations:  {},
    );
    // Load first slide canvas
    _activateSlide(0);
  }

  /// Navigate to a different slide by index.
  void navigateToSlide(int index) {
    if (index < 0 || index >= state.slides.length) return;
    if (index == state.currentSlideIndex) return;

    // 1. Persist current canvas annotations before leaving
    _persistCurrentCanvas();
    // 2. Update index
    state = state.copyWith(currentSlideIndex: index);
    // 3. Load new slide canvas
    _activateSlide(index);
    // 4. Deselect any selected widget
    ref.read(selectedWidgetNotifierProvider.notifier).deselect();
  }

  void _persistCurrentCanvas() {
    final canvas  = ref.read(canvasNotifierProvider);
    final slideId = state.currentSlide?.slideId;
    if (slideId == null) return;
    final annotation = SlideAnnotationData(
      slideId: slideId,
      strokes: List.from(canvas.strokes),
      objects: List.from(canvas.objects),
    );
    state = state.copyWith(
      savedAnnotations: {...state.savedAnnotations, slideId: annotation},
    );
  }

  void _activateSlide(int index) {
    final slide  = state.slides[index];
    final saved  = state.savedAnnotations[slide.slideId];
    ref.read(canvasNotifierProvider.notifier).loadFromAnnotation(
      saved ?? SlideAnnotationData(slideId: slide.slideId),
    );
    
    // Load question widgets for this slide
    ref.read(questionWidgetNotifierProvider.notifier).populateFromSlides([slide]);
  }
}
