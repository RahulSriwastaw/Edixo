import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/canvas_provider.dart';

final slideProvider = StateNotifierProvider<SlideNotifier, SlideState>((ref) {
  return SlideNotifier(ref);
});

class SlideNotifier extends StateNotifier<SlideState> {
  final Ref _ref;
  SlideNotifier(this._ref) : super(SlideState.initial());

  void setSlides(List<PageData> slides) {
    state = state.copyWith(
      slides: slides,
      currentIndex: 0,
    );
  }

  void nextSlide() {
    final canvasNotifier = _ref.read(canvasStateProvider.notifier);
    final canvasState = _ref.read(canvasStateProvider);
    if (canvasState.currentPageIndex < canvasState.pages.length - 1) {
      canvasNotifier.setPageIndex(canvasState.currentPageIndex + 1);
    }
  }

  void previousSlide() {
    final canvasNotifier = _ref.read(canvasStateProvider.notifier);
    final canvasState = _ref.read(canvasStateProvider);
    if (canvasState.currentPageIndex > 0) {
      canvasNotifier.setPageIndex(canvasState.currentPageIndex - 1);
    }
  }

  void goToSlide(int index) {
    final canvasNotifier = _ref.read(canvasStateProvider.notifier);
    canvasNotifier.setPageIndex(index);
  }
}

class SlideState {
  final List<PageData> slides;
  final int currentIndex;

  SlideState({
    required this.slides,
    required this.currentIndex,
  });

  factory SlideState.initial() => SlideState(slides: [], currentIndex: -1);

  SlideState copyWith({
    List<PageData>? slides,
    int? currentIndex,
  }) {
    return SlideState(
      slides: slides ?? this.slides,
      currentIndex: currentIndex ?? this.currentIndex,
    );
  }
}
