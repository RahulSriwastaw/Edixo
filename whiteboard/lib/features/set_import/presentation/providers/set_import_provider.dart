import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../data/datasources/set_import_remote_ds.dart';
import '../../../../features/whiteboard/presentation/providers/slide_provider.dart';
import '../../../../features/whiteboard/data/models/slide_model.dart';
import '../../../../features/whiteboard/data/models/set_metadata_model.dart';
import '../../../../features/question_widget/presentation/providers/question_widget_provider.dart';

part 'set_import_provider.g.dart';

@riverpod
class SetImportNotifier extends _$SetImportNotifier {
  @override
  void build() {}

  Future<void> importSet({required String setId, String? password}) async {
    final rawSlides = await ref.read(setImportRemoteDsProvider).importSet(setId, password: password);
    
    // Convert SetSlideModel (import) to SetSlideModel (whiteboard)
    final slides = rawSlides.map((s) => SetSlideModel(
      slideId: s.slideId,
      questionNumber: s.questionNumber,
      questionText: s.questionText,
      questionImageUrl: s.questionImageUrl,
      options: s.options.asMap().entries.map((entry) {
        final index = entry.key;
        final text = entry.value;
        final labels = ['A', 'B', 'C', 'D', 'E', 'F'];
        return SlideOption(
          label: labels[index] ?? '${index + 1}',
          text: text,
          imageUrl: null,
        );
      }).toList(),
      correctAnswer: s.correctAnswer,
    )).toList();
    
    final metadata = SetMetadataModel(
      setId: setId,
      title: setId,
      questionCount: slides.length,
    );
    
    // Load slides into the whiteboard
    ref.read(slideNotifierProvider.notifier).loadSlides(slides, metadata);
    
    // Initialize question widgets on the canvas
    ref.read(questionWidgetNotifierProvider.notifier).populateFromSlides(slides);
  }
}
