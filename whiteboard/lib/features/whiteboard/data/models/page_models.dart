import 'package:hive/hive.dart';
import 'slide_model.dart';

part 'page_models.g.dart';

@HiveType(typeId: 25)
enum PageType {
  @HiveField(0) blank,
  @HiveField(1) setImport,
  @HiveField(2) pdf,
}

abstract class WhiteboardPage extends HiveObject {

  @HiveField(0) final String id;
  @HiveField(1) final PageType type;

  WhiteboardPage({required this.id, required this.type});
}

@HiveType(typeId: 27)
class SetImportPage extends WhiteboardPage {
  @HiveField(2) final SetSlideModel slide;
  @HiveField(3) final String setId;

  SetImportPage({
    required super.id,
    required this.slide,
    required this.setId,
  }) : super(type: PageType.setImport);
}

@HiveType(typeId: 28)
class BlankPage extends WhiteboardPage {
  BlankPage({required super.id}) : super(type: PageType.blank);
}
