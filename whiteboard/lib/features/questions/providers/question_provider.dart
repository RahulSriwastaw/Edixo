import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import 'package:hive_flutter/hive_flutter.dart';
import '../../../core/api/api_client.dart';
import '../domain/models/question.dart';

class QuestionPanelState {
  final String setId;
  final String setName;
  final String creatorName;
  final List<Question> questions;
  final int currentIndex;

  QuestionPanelState({
    required this.setId,
    required this.setName,
    required this.creatorName,
    required this.questions,
    this.currentIndex = 0,
  });

  Question? get currentQuestion => 
      questions.isNotEmpty && currentIndex < questions.length 
          ? questions[currentIndex] 
          : null;

  int get totalQuestions => questions.length;

  QuestionPanelState copyWith({
    String? setId,
    String? setName,
    String? creatorName,
    List<Question>? questions,
    int? currentIndex,
  }) {
    return QuestionPanelState(
      setId: setId ?? this.setId,
      setName: setName ?? this.setName,
      creatorName: creatorName ?? this.creatorName,
      questions: questions ?? this.questions,
      currentIndex: currentIndex ?? this.currentIndex,
    );
  }
}

class QuestionPanelNotifier extends StateNotifier<AsyncValue<QuestionPanelState>> {
  final Dio _dio;
  QuestionPanelNotifier(this._dio) : super(AsyncValue.data(QuestionPanelState(
    setId: '',
    setName: '',
    creatorName: '',
    questions: [],
  )));

  Future<bool> loadSet({required String id, required String password, required String type}) async {
    state = const AsyncValue.loading();
    try {
      // Try cache first
      final box = await Hive.openBox<dynamic>('questions');
      if (box.containsKey(id)) {
        final cached = box.get(id) as Map;
        final cachedQs = (cached['questions'] as List)
            .map((q) => Question(
                  id: q['id'] as String,
                  text: q['text'] as String,
                  options: List<String>.from(q['options'] as List),
                  correctOption: q['correctOption'] as int,
                  imageUrl: q['imageUrl'] as String?,
                  source: q['source'] as String?,
                  explanation: q['explanation'] as String?,
                ))
            .toList();
        state = AsyncValue.data(QuestionPanelState(
          setId: cached['setId'] as String,
          setName: cached['setName'] as String,
          creatorName: cached['creatorName'] as String? ?? '',
          questions: cachedQs,
        ));
      }

      final resp = await _dio.get('/qbank/sets/$id/questions', queryParameters: {'password': password});
      if (resp.statusCode != 200 || resp.data['success'] != true) {
        throw Exception('Failed to load set');
      }

      final data = resp.data['data'];
      final qs = (data['questions'] as List).map((q) {
        final options = (q['options'] as List).map((o) => o['text'] as String? ?? '').toList();
        final correctLabel = (q['correctOption'] as String?) ?? '';
        const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
        final correctIndex = labels.indexOf(correctLabel);
        return Question(
          id: q['id'] ?? q['questionId'] ?? '',
          text: q['text'] ?? '',
          options: options,
          correctOption: correctIndex >= 0 ? correctIndex : 0,
          imageUrl: q['questionImageUrl'] as String?,
          source: q['examSource'] as String?,
        );
      }).toList();

      final setName = data['set']?['name'] as String? ?? 'Question Set';
      final creator = data['set']?['creatorName'] as String? ?? 'EduHub';

      final newState = QuestionPanelState(
        setId: id,
        setName: setName,
        creatorName: creator,
        questions: qs,
      );

      await box.put(id, {
        'setId': id,
        'setName': setName,
        'creatorName': creator,
        'questions': qs
            .map((q) => {
                  'id': q.id,
                  'text': q.text,
                  'options': q.options,
                  'correctOption': q.correctOption,
                  'imageUrl': q.imageUrl,
                  'source': q.source,
                  'explanation': q.explanation,
                })
            .toList(),
      });

      state = AsyncValue.data(newState);
      return true;
    } catch (e, st) {
      print('QuestionPanelNotifier: Error loading set: $e');
      state = AsyncValue.error(e, st);
      return false;
    }
  }

  void nextQuestion() {
    state.whenData((data) {
      if (data.currentIndex < data.questions.length - 1) {
        state = AsyncValue.data(data.copyWith(currentIndex: data.currentIndex + 1));
      }
    });
  }

  void previousQuestion() {
    state.whenData((data) {
      if (data.currentIndex > 0) {
        state = AsyncValue.data(data.copyWith(currentIndex: data.currentIndex - 1));
      }
    });
  }
}

final questionPanelProvider = StateNotifierProvider<QuestionPanelNotifier, AsyncValue<QuestionPanelState>>((ref) {
  final dio = ref.watch(dioProvider);
  return QuestionPanelNotifier(dio);
});

final questionPanelVisibilityProvider = StateProvider<bool>((ref) => false);
