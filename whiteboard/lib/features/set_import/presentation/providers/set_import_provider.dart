import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/datasources/set_import_remote_ds.dart';
import 'package:eduhub_whiteboard/features/whiteboard/presentation/providers/slide_provider.dart';
import 'package:eduhub_whiteboard/features/whiteboard/providers/canvas_provider.dart';

final setImportProvider = Provider((ref) => SetImport(ref));

class SetImport {
  final Ref _ref;

  SetImport(this._ref);

  Future<void> import(String setId, {String? password}) async {
    final rawSlides = await _ref.read(setImportRemoteDsProvider).importSet(setId, password: password);
    
    // Map SetSlideModel to PageData architecture
    final List<PageData> slides = rawSlides.map((s) => PageData(
      id: s.slideId, // Fixed field name
      template: PageTemplate.blank,
    )).toList();
    
    _ref.read(slideProvider.notifier).setSlides(slides);
  }
}
