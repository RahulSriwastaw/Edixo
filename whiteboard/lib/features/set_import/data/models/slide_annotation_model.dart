
import '../../../whiteboard/data/models/stroke_model.dart';

class SlideAnnotationModel {
  final String slideId;
  final List<StrokeModel> strokes;

  SlideAnnotationModel({required this.slideId, required this.strokes});
}
