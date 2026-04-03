// lib/features/whiteboard/data/models/slide_annotation.dart

import 'package:hive/hive.dart';
import 'stroke_model.dart';
import 'canvas_object_model.dart';

part 'slide_annotation.g.dart';

// Hive typeId: 5
@HiveType(typeId: 5)
class SlideAnnotationData extends HiveObject {
  @HiveField(0) final String                 slideId;
  @HiveField(1) final List<StrokeModel>      strokes;
  @HiveField(2) final List<CanvasObjectModel> objects;
  @HiveField(3) final SlideColorConfig?      colorConfig;
  @HiveField(4) final String?                bgImagePath;

  SlideAnnotationData({
    required this.slideId,
    List<StrokeModel>?      strokes,
    List<CanvasObjectModel>? objects,
    this.colorConfig,
    this.bgImagePath,
  })  : strokes = strokes ?? [],
        objects = objects ?? [];

  Map<String, dynamic> toJson() => {
    'strokes': strokes.map((s) => s.toJson()).toList(),
    'objects': objects.map((o) => o.toJson()).toList(),
  };
}

// Hive typeId: 6
@HiveType(typeId: 6)
class SlideColorConfig extends HiveObject {
  @HiveField(0) final int questionTextColorARGB;
  @HiveField(1) final int questionBgColorARGB;
  @HiveField(2) final int optionTextColorARGB;
  @HiveField(3) final int optionBgColorARGB;
  @HiveField(4) final int screenBgColorARGB;

  SlideColorConfig({
    required this.questionTextColorARGB,
    required this.questionBgColorARGB,
    required this.optionTextColorARGB,
    required this.optionBgColorARGB,
    required this.screenBgColorARGB,
  });

  Map<String, dynamic> toJson() => {
    'questionTextColorARGB': questionTextColorARGB,
    'questionBgColorARGB':   questionBgColorARGB,
    'optionTextColorARGB':   optionTextColorARGB,
    'optionBgColorARGB':     optionBgColorARGB,
    'screenBgColorARGB':     screenBgColorARGB,
  };
}
