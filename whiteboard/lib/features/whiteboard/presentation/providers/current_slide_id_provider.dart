// lib/features/whiteboard/presentation/providers/current_slide_id_provider.dart

import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'slide_provider.dart';

part 'current_slide_id_provider.g.dart';

/// Derived from slideNotifierProvider — always gives current slide's ID or null.
@riverpod
String? currentSlideId(CurrentSlideIdRef ref) {
  final state = ref.watch(slideNotifierProvider);
  final pages = state.pages;
  final idx   = state.currentPageIndex;
  if (pages.isEmpty || idx < 0 || idx >= pages.length) return null;
  return pages[idx].id;
}

