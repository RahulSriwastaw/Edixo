import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:async';
import 'dart:typed_data';
import 'package:uuid/uuid.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:dio/dio.dart';
import 'package:eduhub_whiteboard/core/network/dio_client.dart';
import '../domain/models/question_widget_data.dart';
import '../domain/models/canvas_object_model.dart';
import '../domain/models/stroke.dart';
import 'tool_provider.dart';

export '../domain/models/question_widget_data.dart' hide QuestionStyle;
export '../domain/models/canvas_object_model.dart';
export '../domain/models/stroke.dart';

enum PageTemplate { blank, ruled, grid, dotGrid, mathGrid }
enum BackgroundColor { white, lightBlue, lightYellow, dark }

class SyncService {
  void broadcastStroke(Stroke stroke, int pageIdx) {}
  void broadcastClearPage(int pageIdx) {}
}

class QuestionTheme {
  final Color questionColor;
  final Color questionBgColor;
  final Color optionColor;
  final Color optionBgColor;
  final bool updatePosition;
  final Color screenBgColor;

  const QuestionTheme({
    this.questionColor = Colors.white,
    this.questionBgColor = const Color(0xFF252545),
    this.optionColor = Colors.white70,
    this.optionBgColor = const Color(0xFF353555),
    this.updatePosition = true,
    this.screenBgColor = const Color(0xFF0D0D0D),
  });

  QuestionTheme copyWith({
    Color? questionColor,
    Color? questionBgColor,
    Color? optionColor,
    Color? optionBgColor,
    bool? updatePosition,
    Color? screenBgColor,
  }) {
    return QuestionTheme(
      questionColor: questionColor ?? this.questionColor,
      questionBgColor: questionBgColor ?? this.questionBgColor,
      optionColor: optionColor ?? this.optionColor,
      optionBgColor: optionBgColor ?? this.optionBgColor,
      updatePosition: updatePosition ?? this.updatePosition,
      screenBgColor: screenBgColor ?? this.screenBgColor,
    );
  }

  Map<String, dynamic> toJson() => {
    'questionColor': questionColor.value,
    'questionBgColor': questionBgColor.value,
    'optionColor': optionColor.value,
    'optionBgColor': optionBgColor.value,
    'updatePosition': updatePosition,
    'screenBgColor': screenBgColor.value,
  };

  factory QuestionTheme.fromJson(Map<String, dynamic> json) {
    return QuestionTheme(
      questionColor: Color(json['questionColor'] as int),
      questionBgColor: Color(json['questionBgColor'] as int),
      optionColor: Color(json['optionColor'] as int? ?? 0xFFB0B0C0),
      optionBgColor: Color(json['optionBgColor'] as int? ?? 0xFF353555),
      updatePosition: json['updatePosition'] as bool,
      screenBgColor: Color(json['screenBgColor'] as int),
    );
  }
}

class PageData {
  final String id;
  final List<Stroke> strokes;
  final List<CanvasObjectModel> objects;
  final List<CanvasObjectModel> questionWidgets;
  final PageTemplate template;
  final BackgroundColor bgColor;
  final Uint8List? bgImageBytes;

  PageData({
    required this.id,
    this.strokes = const [],
    this.objects = const [],
    this.questionWidgets = const [],
    this.template = PageTemplate.blank,
    this.bgColor = BackgroundColor.white,
    this.bgImageBytes,
  });

  CanvasObjectModel? get questionWidget => questionWidgets.isNotEmpty ? questionWidgets.first : null;

  PageData copyWith({
    String? id,
    List<Stroke>? strokes,
    List<CanvasObjectModel>? objects,
    List<CanvasObjectModel>? questionWidgets,
    PageTemplate? template,
    BackgroundColor? bgColor,
    Uint8List? bgImageBytes,
  }) {
    return PageData(
      id: id ?? this.id,
      strokes: strokes ?? this.strokes,
      objects: objects ?? this.objects,
      questionWidgets: questionWidgets ?? this.questionWidgets,
      template: template ?? this.template,
      bgColor: bgColor ?? this.bgColor,
      bgImageBytes: bgImageBytes ?? this.bgImageBytes,
    );
  }

  Color get backgroundColor {
    switch (bgColor) {
      case BackgroundColor.white: return Colors.white;
      case BackgroundColor.lightBlue: return const Color(0xFFF0F4F8);
      case BackgroundColor.lightYellow: return const Color(0xFFFEF9E7);
      case BackgroundColor.dark: return const Color(0xFF12121A);
    }
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'strokes': strokes.map((s) => s.toJson()).toList(),
    'objects': objects.map((o) => o.toJson()).toList(),
    'questionWidgets': questionWidgets.map((q) => q.toJson()).toList(),
    'template': template.name,
    'bgColor': bgColor.name,
    'bgImageBytes': bgImageBytes,
  };

  factory PageData.fromJson(Map<String, dynamic> json) {
    return PageData(
      id: json['id'] as String,
      strokes: (json['strokes'] as List? ?? [])
          .map((s) => Stroke.fromJson(s as Map<String, dynamic>))
          .toList(),
      objects: (json['objects'] as List? ?? [])
          .map((o) => CanvasObjectModel.fromJson(o as Map<String, dynamic>))
          .toList(),
      questionWidgets: (json['questionWidgets'] as List? ?? [])
          .map((q) => CanvasObjectModel.fromJson(q as Map<String, dynamic>))
          .toList(),
      template: PageTemplate.values.byName(json['template'] as String? ?? 'blank'),
      bgColor: BackgroundColor.values.byName(json['bgColor'] as String? ?? 'white'),
      bgImageBytes: json['bgImageBytes'] != null
          ? Uint8List.fromList(List<int>.from(json['bgImageBytes'] as List))
          : null,
    );
  }
}

class CanvasState {
  final String sessionId;
  final String? setId;
  final List<PageData> pages;
  final int currentPageIndex;
  final double zoom;
  final bool isDirty;
  final List<List<Stroke>> undoHistory;
  final List<List<Stroke>> redoHistory;
  final bool isFullscreen;
  final bool showGrid;
  final QuestionTheme questionTheme;

  CanvasState({
    String? sessionId,
    this.setId,
    List<PageData>? pages,
    this.currentPageIndex = 0,
    this.zoom = 1.0,
    this.isDirty = false,
    List<List<Stroke>>? undoHistory,
    List<List<Stroke>>? redoHistory,
    this.isFullscreen = false,
    this.showGrid = false,
    this.questionTheme = const QuestionTheme(),
  })  : sessionId = sessionId ?? const Uuid().v4(),
        pages = pages ?? [PageData(id: 'page_0')],
        undoHistory = undoHistory ?? [],
        redoHistory = redoHistory ?? [];

  PageData get currentPage => pages[currentPageIndex];

  CanvasState copyWith({
    List<PageData>? pages,
    int? currentPageIndex,
    double? zoom,
    bool? isDirty,
    List<List<Stroke>>? undoHistory,
    List<List<Stroke>>? redoHistory,
    bool? isFullscreen,
    bool? showGrid,
    QuestionTheme? questionTheme,
    String? sessionId,
    String? setId,
  }) {
    return CanvasState(
      sessionId: sessionId ?? this.sessionId,
      setId: setId ?? this.setId,
      pages: pages ?? this.pages,
      currentPageIndex: currentPageIndex ?? this.currentPageIndex,
      zoom: zoom ?? this.zoom,
      isDirty: isDirty ?? this.isDirty,
      undoHistory: undoHistory ?? this.undoHistory,
      redoHistory: redoHistory ?? this.redoHistory,
      isFullscreen: isFullscreen ?? this.isFullscreen,
      showGrid: showGrid ?? this.showGrid,
      questionTheme: questionTheme ?? this.questionTheme,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'sessionId': sessionId,
      'setId': setId,
      'currentPageIndex': currentPageIndex,
      'zoom': zoom,
      'pages': pages.map((p) => p.toJson()).toList(),
      'isFullscreen': isFullscreen,
      'showGrid': showGrid,
      'questionTheme': questionTheme.toJson(),
    };
  }

  factory CanvasState.fromJson(Map<String, dynamic> json) {
    return CanvasState(
      sessionId: json['sessionId'] as String?,
      setId: json['setId'] as String?,
      currentPageIndex: json['currentPageIndex'] as int? ?? 0,
      zoom: (json['zoom'] as num?)?.toDouble() ?? 1.0,
      pages: (json['pages'] as List? ?? []).map((p) => PageData.fromJson(p as Map<String, dynamic>)).toList(),
      isFullscreen: json['isFullscreen'] as bool? ?? false,
      showGrid: json['showGrid'] as bool? ?? false,
      questionTheme: json['questionTheme'] != null 
          ? QuestionTheme.fromJson(json['questionTheme'] as Map<String, dynamic>)
          : const QuestionTheme(),
    );
  }
}

class CanvasStateNotifier extends StateNotifier<CanvasState> {
  Timer? _autosaveTimer;
  final Dio _dio;
  final SyncService? _syncService = null;

  CanvasStateNotifier({required CanvasState state, required Dio dio}) : _dio = dio, super(state) {
    _init();
  }

  Future<void> _init() async {
    await _restoreFromHive();
    _startAutosave();
  }

  void _startAutosave() {
    _autosaveTimer = Timer.periodic(const Duration(seconds: 30), (_) {
      if (state.isDirty) save();
    });
  }

  Future<void> _restoreFromHive() async {
    try {
      final box = await Hive.openBox('sessions');
      if (box.containsKey('lastSession')) {
        final raw = box.get('lastSession');
        state = CanvasState.fromJson(Map<String, dynamic>.from(raw)).copyWith(isDirty: false);
      }
    } catch (e) {
      debugPrint('Restore failed: $e');
    }
  }

  void undo() {
    if (state.undoHistory.isEmpty) return;
    final undoHistory = [...state.undoHistory];
    final redoHistory = [...state.redoHistory, state.currentPage.strokes];
    final lastStrokes = undoHistory.removeLast();

    final pages = [...state.pages];
    pages[state.currentPageIndex] = pages[state.currentPageIndex].copyWith(strokes: lastStrokes);

    state = state.copyWith(pages: pages, undoHistory: undoHistory, redoHistory: redoHistory, isDirty: true);
  }

  void redo() {
    if (state.redoHistory.isEmpty) return;
    final redoHistory = [...state.redoHistory];
    final undoHistory = [...state.undoHistory, state.currentPage.strokes];
    final nextStrokes = redoHistory.removeLast();

    final pages = [...state.pages];
    pages[state.currentPageIndex] = pages[state.currentPageIndex].copyWith(strokes: nextStrokes);

    state = state.copyWith(pages: pages, undoHistory: undoHistory, redoHistory: redoHistory, isDirty: true);
  }

  void toggleFullscreen() {
    state = state.copyWith(isFullscreen: !state.isFullscreen);
  }

  void toggleGrid() {
    state = state.copyWith(showGrid: !state.showGrid);
  }

  void setQuestionTheme(QuestionTheme theme) {
    state = state.copyWith(questionTheme: theme);
  }

  void updateQuestionWidget(CanvasObjectModel updatedWidget) {
    updateObject(updatedWidget);
  }

  void setBackgroundColor(BackgroundColor color) {
    final updatedPages = [...state.pages];
    updatedPages[state.currentPageIndex] = state.currentPage.copyWith(bgColor: color);
    state = state.copyWith(pages: updatedPages);
  }

  void importPdfPages(List<Uint8List> pages) {
    final List<PageData> newPages = pages.map((bytes) => PageData(
      id: const Uuid().v4(),
      bgImageBytes: bytes,
      template: PageTemplate.blank,
    )).toList();
    
    state = state.copyWith(
      pages: [...state.pages, ...newPages],
    );
  }

  void addStroke(Stroke stroke) {
    final pages = [...state.pages];
    final pageIdx = state.currentPageIndex;
    pages[pageIdx] = pages[pageIdx].copyWith(strokes: [...pages[pageIdx].strokes, stroke]);
    
    final undoHistory = [...state.undoHistory, state.currentPage.strokes];
    if (undoHistory.length > 50) undoHistory.removeAt(0);

    state = state.copyWith(pages: pages, isDirty: true, undoHistory: undoHistory, redoHistory: []);
  }

  void addQuestion(Question question) {
    final pages = [...state.pages];
    final pageIdx = state.currentPageIndex;
    final id = 'qw_${DateTime.now().millisecondsSinceEpoch}';
    final newQw = CanvasObjectModel(
      id: id,
      type: CanvasObjectType.questionWidget,
      data: question,
      isSelected: true,
    );

    pages[pageIdx] = pages[pageIdx].copyWith(
      questionWidgets: [...pages[pageIdx].questionWidgets.map((q) => q.copyWith(isSelected: false)), newQw],
    );
    state = state.copyWith(pages: pages, isDirty: true);
  }

  void selectObject(String id) {
     final pages = [...state.pages];
     final pageIdx = state.currentPageIndex;
     
     final qw = pages[pageIdx].questionWidgets.map((q) => q.copyWith(isSelected: q.id == id)).toList();
     final obj = pages[pageIdx].objects.map((o) => o.copyWith(isSelected: o.id == id)).toList();

     pages[pageIdx] = pages[pageIdx].copyWith(questionWidgets: qw, objects: obj);
     state = state.copyWith(pages: pages);
  }

  void removeObject(String id) {
     final pages = [...state.pages];
     final pageIdx = state.currentPageIndex;
     
     final qw = pages[pageIdx].questionWidgets.where((q) => q.id != id).toList();
     final obj = pages[pageIdx].objects.where((o) => o.id != id).toList();

     pages[pageIdx] = pages[pageIdx].copyWith(questionWidgets: qw, objects: obj);
     state = state.copyWith(pages: pages, isDirty: true);
  }

  void updateObject(CanvasObjectModel obj) {
    final pages = [...state.pages];
    final pageIdx = state.currentPageIndex;
    
    if (obj.type == CanvasObjectType.questionWidget) {
      final list = [...pages[pageIdx].questionWidgets];
      final idx = list.indexWhere((o) => o.id == obj.id);
      if (idx != -1) {
        list[idx] = obj;
        pages[pageIdx] = pages[pageIdx].copyWith(questionWidgets: list);
      }
    } else {
      final list = [...pages[pageIdx].objects];
      final idx = list.indexWhere((o) => o.id == obj.id);
      if (idx != -1) {
        list[idx] = obj;
        pages[pageIdx] = pages[pageIdx].copyWith(objects: list);
      }
    }
    state = state.copyWith(pages: pages, isDirty: true);
  }

  void save() async {
    try {
      final box = await Hive.openBox('sessions');
      await box.put('lastSession', state.toJson());
      state = state.copyWith(isDirty: false);
    } catch (e) {
      debugPrint('Save failed: $e');
    }
  }

  void setPageIndex(int index) {
    if (index < 0 || index >= state.pages.length) return;
    state = state.copyWith(currentPageIndex: index);
  }

  void clearPage() {
    final pages = [...state.pages];
    pages[state.currentPageIndex] = pages[state.currentPageIndex].copyWith(strokes: [], objects: []);
    state = state.copyWith(pages: pages, isDirty: true);
  }

  void addPage({PageTemplate template = PageTemplate.blank}) {
    final newPage = PageData(id: const Uuid().v4(), template: template);
    state = state.copyWith(
      pages: [...state.pages, newPage],
      currentPageIndex: state.pages.length,
    );
  }

  void removePage(int index) {
    if (state.pages.length <= 1) return;
    final pages = [...state.pages];
    pages.removeAt(index);
    int newIdx = state.currentPageIndex;
    if (newIdx >= pages.length) newIdx = pages.length - 1;
    state = state.copyWith(pages: pages, currentPageIndex: newIdx);
  }

  void reorderPages(int oldIndex, int newIndex) {
    final pages = [...state.pages];
    final page = pages.removeAt(oldIndex);
    pages.insert(newIndex, page);
    state = state.copyWith(pages: pages, currentPageIndex: newIndex);
  }

  @override
  void dispose() {
    _autosaveTimer?.cancel();
    super.dispose();
  }
}

final canvasStateProvider = StateNotifierProvider<CanvasStateNotifier, CanvasState>((ref) {
  final dio = ref.watch(dioProvider);
  return CanvasStateNotifier(
    state: CanvasState(sessionId: 'local-session'),
    dio: dio,
  );
});

final canvasBoundaryKeyProvider = Provider<GlobalKey>((ref) => GlobalKey());
