import 'question_widget_data.dart';

enum CanvasObjectType { questionWidget, textBox, stickyNote, shape }

class CanvasObjectModel {
  final String id;
  final CanvasObjectType type;
  final double x;
  final double y;
  final double width;
  final double height;
  final bool isLocked;
  final bool isSelected;
  final QuestionStyle style;
  final dynamic data; // The actual content (e.g. Question)

  const CanvasObjectModel({
    required this.id,
    required this.type,
    this.x = 100.0,
    this.y = 100.0,
    this.width = 820.0,
    this.height = 480.0,
    this.isLocked = false,
    this.isSelected = false,
    this.style = const QuestionStyle(),
    this.data,
  });

  CanvasObjectModel copyWith({
    String? id,
    CanvasObjectType? type,
    double? x,
    double? y,
    double? width,
    double? height,
    bool? isLocked,
    bool? isSelected,
    QuestionStyle? style,
    dynamic data,
  }) {
    return CanvasObjectModel(
      id: id ?? this.id,
      type: type ?? this.type,
      x: x ?? this.x,
      y: y ?? this.y,
      width: width ?? this.width,
      height: height ?? this.height,
      isLocked: isLocked ?? this.isLocked,
      isSelected: isSelected ?? this.isSelected,
      style: style ?? this.style,
      data: data ?? this.data,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type.name,
      'x': x,
      'y': y,
      'width': width,
      'height': height,
      'isLocked': isLocked,
      'isSelected': isSelected,
      'style': style.toJson(),
      'data': type == CanvasObjectType.questionWidget && data is Question
          ? data.toJson()
          : data,
    };
  }

  factory CanvasObjectModel.fromJson(Map<String, dynamic> json) {
    final typeStr = json['type'] as String? ?? 'questionWidget';
    final type = CanvasObjectType.values.byName(typeStr);
    
    dynamic data;
    if (type == CanvasObjectType.questionWidget && json['data'] != null) {
      data = Question.fromJson(Map<String, dynamic>.from(json['data'] as Map));
    } else {
      data = json['data'];
    }

    return CanvasObjectModel(
      id: json['id'] as String,
      type: type,
      x: (json['x'] as num?)?.toDouble() ?? 100.0,
      y: (json['y'] as num?)?.toDouble() ?? 100.0,
      width: (json['width'] as num?)?.toDouble() ?? 820.0,
      height: (json['height'] as num?)?.toDouble() ?? 480.0,
      isLocked: json['isLocked'] as bool? ?? false,
      isSelected: json['isSelected'] as bool? ?? false,
      style: json['style'] != null
          ? QuestionStyle.fromJson(Map<String, dynamic>.from(json['style'] as Map))
          : const QuestionStyle(),
      data: data,
    );
  }
}
