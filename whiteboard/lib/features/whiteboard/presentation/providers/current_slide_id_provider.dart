// lib/features/whiteboard/presentation/providers/current_slide_id_provider.dart

import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'slide_provider.dart';

part 'current_slide_id_provider.g.dart';

/// Derived from slideNotifierProvider — always gives current slide's ID or null.
@riverpod
String? currentSlideId(CurrentSlideIdRef ref) {
  final state  = ref.watch(slideNotifierProvider);
  final slides = state.slides;
  final idx    = state.currentSlideIndex;
  if (slides.isEmpty || idx < 0 || idx >= slides.length) return null;
  return slides[idx].slideId;
}
