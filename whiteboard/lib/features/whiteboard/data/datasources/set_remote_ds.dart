// lib/features/whiteboard/data/datasources/set_remote_ds.dart

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:result_dart/result_dart.dart';
import '../../../../core/error/error_handler.dart';
import '../../../../core/error/failure.dart' as failure_types;
import '../../../../core/network/dio_client.dart';
import '../models/set_metadata_model.dart';
import '../models/slide_model.dart';

// Type alias to avoid naming conflict with result_dart.Failure
typedef AppFailure = failure_types.Failure;

final setRemoteDsProvider = Provider<SetRemoteDataSource>((ref) {
  return SetRemoteDataSource(ref.read(dioProvider));
});

class SetRemoteDataSource {
  final Dio _dio;

  SetRemoteDataSource(this._dio);

  /// POST /whiteboard/validate-set
  /// Validates set ID and password
  Future<Result<bool, AppFailure>> validateSet({
    required String setId,
    required String password,
  }) async {
    try {
      final response = await _dio.post(
        '/whiteboard/validate-set',
        data: {
          'setId': setId,
          'password': password,
        },
      );

      return Success(response.data['valid'] as bool? ?? false);
    } on DioException catch (e) {
      return Failure(mapDioException(e));
    } catch (e) {
      return Failure(failure_types.ServerFailure('Unexpected error: $e'));
    }
  }

  /// GET /whiteboard/sets/:id/questions
  /// Fetches all questions for a set
  Future<Result<List<SetSlideModel>, AppFailure>> fetchQuestions(String setId) async {
    try {
      final response = await _dio.get('/whiteboard/sets/$setId/questions');
      final payload = response.data as Map<String, dynamic>;
      final list = payload['data'] != null
        ? (payload['data']['questions'] as List<dynamic>? ?? <dynamic>[])
        : (payload['questions'] as List<dynamic>? ?? <dynamic>[]);

      final questions = list
        .map((q) => SetSlideModel.fromJson(q as Map<String, dynamic>))
          .toList();

      return Success(questions);
    } on DioException catch (e) {
      return Failure(mapDioException(e));
    } catch (e) {
      return Failure(failure_types.ServerFailure('Unexpected error: $e'));
    }
  }

  /// GET /whiteboard/sets/:id/metadata
  /// Fetches set metadata (title, subject, etc.)
  Future<Result<SetMetadataModel, AppFailure>> fetchMetadata(String setId) async {
    try {
      final response = await _dio.get('/whiteboard/sets/$setId/metadata');
      final payload = response.data as Map<String, dynamic>;
      final metadataJson = payload['data'] != null
          ? payload['data'] as Map<String, dynamic>
          : payload;
      final metadata = SetMetadataModel.fromJson(metadataJson);

      return Success(metadata);
    } on DioException catch (e) {
      return Failure(mapDioException(e));
    } catch (e) {
      return Failure(failure_types.ServerFailure('Unexpected error: $e'));
    }
  }

  /// POST /whiteboard/session/start
  /// Creates a new whiteboard session
  Future<Result<String, AppFailure>> startSession({
    required String setId,
    required String teacherId,
  }) async {
    try {
      final response = await _dio.post(
        '/whiteboard/session/start',
        data: {
          'setId': setId,
          'teacherId': teacherId,
        },
      );

      final payload = response.data as Map<String, dynamic>;
      final data = payload['data'] != null
          ? payload['data'] as Map<String, dynamic>
          : payload;

      return Success(data['sessionId'] as String);
    } on DioException catch (e) {
      return Failure(mapDioException(e));
    } catch (e) {
      return Failure(failure_types.ServerFailure('Unexpected error: $e'));
    }
  }
}
