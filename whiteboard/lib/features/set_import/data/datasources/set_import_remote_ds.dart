
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/network/dio_client.dart';
import '../../../whiteboard/data/models/slide_model.dart';

final setImportRemoteDsProvider = Provider((ref) => SetImportRemoteDataSource(ref.watch(dioProvider)));

class SetImportRemoteDataSource {
  final Dio _dio;

  SetImportRemoteDataSource(this._dio);

  Future<List<SetSlideModel>> importSet(String setId, {String? password}) async {
    try {
      final response = await _dio.get(
        '/whiteboard/sets/$setId/questions',
        queryParameters: {'password': password},
      );
      final questions = (response.data['data']['questions'] as List)
          .map((q) => SetSlideModel.fromJson(q as Map<String, dynamic>))
          .toList();
      return questions;
    } on DioException {
      rethrow;
    }
  }
}
