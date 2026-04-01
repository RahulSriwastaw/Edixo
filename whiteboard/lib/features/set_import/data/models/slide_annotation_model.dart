
import 'package:eduhub_whiteboard/features/whiteboard/domain/models/stroke.dart';

class SlideAnnotationModel {
  final String slideId;
  final List<Stroke> strokes;

  SlideAnnotationModel({required this.slideId, required this.strokes});
}
