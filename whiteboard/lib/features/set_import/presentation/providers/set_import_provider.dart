import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../data/datasources/set_import_remote_ds.dart';
import '../../data/models/set_slide_model.dart' as import_models;
import '../../../../features/whiteboard/presentation/providers/slide_provider.dart';
import '../../../../features/whiteboard/presentation/providers/canvas_provider.dart';
import '../../../../features/whiteboard/data/models/slide_model.dart';
import '../../../../features/whiteboard/data/models/set_metadata_model.dart';

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
      questionNumber: s.questionNumber ?? 0,
      questionText: s.questionText ?? '',
      questionImageUrl: s.questionImageUrl,
      options: (s.options ?? []).map((opt) => SlideOption(
        label: '',
        text: opt is String ? opt : opt.toString(),
        imageUrl: null,
      )).toList(),
      correctAnswer: s.correctAnswer,
    )).toList();
    
    final metadata = SetMetadataModel(
      setId: setId,
      title: setId,
      questionCount: slides.length,
    );
    ref.read(slideNotifierProvider.notifier).loadSlides(slides, metadata);
  }
}
