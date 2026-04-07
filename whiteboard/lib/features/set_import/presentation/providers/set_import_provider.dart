import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../data/datasources/set_import_remote_ds.dart';
import '../../../../features/whiteboard/presentation/providers/slide_provider.dart';
import '../../../../features/whiteboard/data/models/set_metadata_model.dart';
import '../../../../features/question_widget/presentation/providers/question_widget_provider.dart';

part 'set_import_provider.g.dart';

@riverpod
class SetImportNotifier extends _$SetImportNotifier {
  @override
  void build() {}

  Future<void> importSet({required String setId, String? password}) async {
    final slides = await ref.read(setImportRemoteDsProvider).importSet(setId, password: password);

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
