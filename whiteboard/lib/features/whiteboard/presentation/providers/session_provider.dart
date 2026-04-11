// lib/features/whiteboard/presentation/providers/session_provider.dart

import 'dart:async';
import 'dart:convert';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../data/models/slide_annotation.dart';
import 'canvas_provider.dart';
import 'slide_provider.dart';
import '../../../question_widget/presentation/providers/question_widget_provider.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/providers/auth_provider.dart';
import 'package:flutter/foundation.dart';

part 'session_provider.g.dart';

// ── Enums & State ───────────────────────────────────────────────────────────

enum SaveStatus { idle, saving, saved, failed }

class SessionState {
  final String?    sessionId;
  final SaveStatus saveStatus;
  final DateTime?  lastSavedAt;
  final bool       isDirty;
  final Duration   classDuration;
  final List<int>  slidesCovered;

  const SessionState({
    this.sessionId,
    required this.saveStatus,
    this.lastSavedAt,
    required this.isDirty,
    required this.classDuration,
    required this.slidesCovered,
  });

  factory SessionState.initial() => const SessionState(
    sessionId:     null,
    saveStatus:    SaveStatus.idle,
    lastSavedAt:   null,
    isDirty:       false,
    classDuration: Duration.zero,
    slidesCovered: [],
  );

  SessionState copyWith({
    String?    sessionId,
    SaveStatus? saveStatus,
    DateTime?  lastSavedAt,
    bool?      isDirty,
    Duration?  classDuration,
    List<int>? slidesCovered,
  }) => SessionState(
    sessionId:     sessionId     ?? this.sessionId,
    saveStatus:    saveStatus    ?? this.saveStatus,
    lastSavedAt:   lastSavedAt   ?? this.lastSavedAt,
    isDirty:       isDirty       ?? this.isDirty,
    classDuration: classDuration ?? this.classDuration,
    slidesCovered: slidesCovered ?? this.slidesCovered,
  );
}

// ── SessionNotifier ─────────────────────────────────────────────────────────

@riverpod
class SessionNotifier extends _$SessionNotifier {
  Timer? _periodicTimer;
  Timer? _debounceTimer;
  Timer? _classTimer;

  @override
  SessionState build() {
    ref.onDispose(() {
      _periodicTimer?.cancel();
      _debounceTimer?.cancel();
      _classTimer?.cancel();
    });
    return SessionState.initial();
  }

  void startSession(String sessionId) {
    state = state.copyWith(
      sessionId:     sessionId,
      saveStatus:    SaveStatus.saved,
      lastSavedAt:   DateTime.now(),
      isDirty:       false,
      classDuration: Duration.zero,
    );
    _startTimers();
  }

  void _startTimers() {
    // Periodic auto-save every 30 seconds
    _periodicTimer = Timer.periodic(
      const Duration(seconds: 30),
      (_) => _autoSave(),
    );
    // Class duration timer — ticks every second
    _classTimer = Timer.periodic(
      const Duration(seconds: 1),
      (_) => state = state.copyWith(
        classDuration: state.classDuration + const Duration(seconds: 1),
      ),
    );
  }

  /// Called after any canvas change. Debounces 5 seconds then saves.
  void markDirty() {
    if (state.sessionId == null) return;
    state = state.copyWith(isDirty: true);
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(seconds: 5), _autoSave);
  }

  Future<void> _autoSave() async {
    if (!state.isDirty || state.sessionId == null) return;
    state = state.copyWith(saveStatus: SaveStatus.saving);

    final payload = _buildPayload();

    // 1. Always save to Hive first (offline-safe)
    final hiveBox = Hive.box<String>('pendingSync');
    await hiveBox.put(state.sessionId!, jsonEncode(payload));

    // 2. If it's a server session (not local-prefix) → sync to server
    if (!state.sessionId!.startsWith('local-')) {
      await _syncToServer(payload);
    }

    state = state.copyWith(
      saveStatus:  SaveStatus.saved,
      isDirty:     false,
      lastSavedAt: DateTime.now(),
    );
  }

  Future<void> _syncToServer(Map<String, dynamic> payload) async {
    try {
      final dio = ref.read(dioProvider);
      final slideState = ref.read(slideNotifierProvider);
      final teacher = ref.read(authNotifierProvider);
      
      final setId = slideState.importedSets.isNotEmpty 
          ? slideState.importedSets.first.setId 
          : null;

      await dio.post('/whiteboard/autosave', data: {
        'sessionId': state.sessionId,
        'setId': setId,
        'teacherId': teacher?.id,
        'data': payload,
        'savedAt': DateTime.now().toIso8601String(),
      });
    } catch (e) {
      debugPrint('Whiteboard server autosave failed: $e');
      // Note: We have RetryInterceptor in Dio providing automatic retries.
    }
  }

  /// Force immediate save (Ctrl+S)
  Future<void> forceSave() async {
    _debounceTimer?.cancel();
    await _autoSave();
  }

  Map<String, dynamic> _buildPayload() {
    final canvas      = ref.read(canvasNotifierProvider);
    final slideState  = ref.read(slideNotifierProvider);
    final widgetState = ref.read(questionWidgetNotifierProvider);
    final currentIdx  = slideState.currentPageIndex;
    final covered     = List<int>.from(state.slidesCovered);
    if (!covered.contains(currentIdx)) covered.add(currentIdx);


    // Include saved per-slide annotations plus current in-memory canvas state.
    final annotations = Map<String, SlideAnnotationData>.from(slideState.savedAnnotations);
    final currentPage = slideState.currentPage;
    if (currentPage != null) {
      annotations[currentPage.id] = SlideAnnotationData(
        slideId: currentPage.id,
        strokes: canvas.strokes,
        objects: canvas.objects,
      );
    }


    return {
      'sessionId':     state.sessionId,
      'lastSaved':     DateTime.now().toIso8601String(),
      'setIds':        slideState.importedSets.map((s) => s.setId).toList(),
      'slideIndex':    currentIdx,
      'slidesCovered': covered,
      'annotations': annotations.map((k, v) => MapEntry(k, v.toJson())),
      'questionWidgets': widgetState.map((k, v) => MapEntry(k, v.toJson())),
    };
  }
}
