import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_client.dart';
import '../models/question_model.dart';

class QuestionRepository {
  final Dio _dio;

  QuestionRepository(this._dio);

  Future<Map<String, dynamic>> validateSet(String setId, String password) async {
    final response = await _dio.post('/whiteboard/validate-set', data: {
      'setId': setId,
      'password': password,
    });
    return response.data;
  }

  Future<List<Question>> fetchSetQuestions(String setId) async {
    final response = await _dio.get('/whiteboard/sets/$setId/questions');
    final List data = response.data['questions'] ?? [];
    return data.map((q) => Question.fromJson(q)).toList();
  }
}

final questionRepositoryProvider = Provider<QuestionRepository>((ref) {
  return QuestionRepository(ref.read(dioProvider));
});
