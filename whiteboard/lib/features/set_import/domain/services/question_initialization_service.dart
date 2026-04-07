import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../whiteboard/presentation/providers/slide_provider.dart';
import '../../../question_widget/presentation/providers/question_widget_provider.dart';
import '../../../whiteboard/data/models/page_models.dart';

/// Initializes question widgets when slides are loaded
/// This ensures imported questions are properly rendered on the whiteboard
Future<void> initializeQuestionWidgets(WidgetRef ref) async {
  try {
    final slideState = ref.read(slideNotifierProvider);
    
    final slides = slideState.pages
        .whereType<SetImportPage>()
        .map((p) => p.slide)
        .toList();

    if (slides.isNotEmpty) {
      // Populate question widgets from loaded slides
      ref.read(questionWidgetNotifierProvider.notifier)
          .populateFromSlides(slides);
      
      print('[QuestionService] ✅ Initialized ${slides.length} question widgets');
    }
  } catch (e) {
    print('[QuestionService] ❌ Error initializing question widgets: $e');
  }
}
