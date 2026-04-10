import 'dart:typed_data';
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:http_parser/http_parser.dart';

/// Chunked upload configuration
class ChunkedUploadConfig {
  final int chunkSize; // Default 1MB chunks
  final int maxRetries;
  final Duration timeout;
  final Duration retryDelay;

  const ChunkedUploadConfig({
    this.chunkSize = 1024 * 1024, // 1MB
    this.maxRetries = 3,
    this.timeout = const Duration(minutes: 2),
    this.retryDelay = const Duration(seconds: 2),
  });
}

/// Upload progress information
class UploadProgress {
  final int bytesUploaded;
  final int totalBytes;
  final double percentage;
  final Duration elapsedTime;
  final Duration? estimatedRemaining;

  UploadProgress({
    required this.bytesUploaded,
    required this.totalBytes,
    required this.percentage,
    required this.elapsedTime,
    this.estimatedRemaining,
  });

  String get formattedProgress =>
      '${(percentage * 100).toStringAsFixed(1)}% (${_formatBytes(bytesUploaded)}/${_formatBytes(totalBytes)})';

  static String _formatBytes(int bytes) {
    if (bytes < 1024) return '$bytes B';
    final kb = bytes / 1024;
    if (kb < 1024) return '${kb.toStringAsFixed(1)} KB';
    final mb = kb / 1024;
    return '${mb.toStringAsFixed(1)} MB';
  }
}

/// Advanced PDF upload service with streaming and chunking
class AdvancedPdfUploadService {
  late final Dio _dio;
  final ChunkedUploadConfig config;
  final Map<String, CancelToken> _activeCancelTokens = {};

  static AdvancedPdfUploadService? _instance;

  AdvancedPdfUploadService._({required this.config}) {
    _initializeDio();
  }

  static AdvancedPdfUploadService get instance {
    return _instance ??= AdvancedPdfUploadService._(
      config: const ChunkedUploadConfig(),
    );
  }

  void _initializeDio() {
    _dio = Dio(
      BaseOptions(
        connectTimeout: config.timeout,
        receiveTimeout: config.timeout,
        sendTimeout: config.timeout,
        contentType: 'application/octet-stream',
      ),
    );

    // Add logging interceptor for debugging
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          debugPrint('🚀 Upload request: ${options.path}');
          return handler.next(options);
        },
        onResponse: (response, handler) {
          debugPrint('✓ Upload response: ${response.statusCode}');
          return handler.next(response);
        },
        onError: (error, handler) {
          debugPrint('✗ Upload error: ${error.message}');
          return handler.next(error);
        },
      ),
    );
  }

  /// Upload PDF with streaming and chunking
  Future<String> uploadPdfWithStreaming({
    required Uint8List pdfBytes,
    required String fileName,
    required String setId,
    required int totalPages,
    required String apiUrl,
    required Function(UploadProgress) onProgress,
    required Function(String) onStatus,
  }) async {
    final uploadId = _generateUploadId();
    debugPrint('📤 Starting PDF upload: $uploadId ($fileName)');

    try {
      // Backend currently supports only the direct PDF upload endpoint.
      // Chunked endpoints (/upload-chunk, /finalize-upload) are not implemented yet.
      return await _uploadSingleChunk(
        pdfBytes: pdfBytes,
        fileName: fileName,
        setId: setId,
        totalPages: totalPages,
        apiUrl: apiUrl,
        onProgress: onProgress,
        onStatus: onStatus,
      );
    } finally {
      _activeCancelTokens.remove(uploadId);
    }
  }

  /// Single chunk upload (for small files)
  Future<String> _uploadSingleChunk({
    required Uint8List pdfBytes,
    required String fileName,
    required String setId,
    required int totalPages,
    required String apiUrl,
    required Function(UploadProgress) onProgress,
    required Function(String) onStatus,
  }) async {
    int attempt = 0;
    Exception? lastError;

    while (attempt < config.maxRetries) {
      try {
        onStatus('Uploading PDF...');

        final formData = FormData.fromMap({
          'file': MultipartFile.fromBytes(
            pdfBytes,
            filename: fileName,
            contentType: MediaType.parse('application/pdf'),
          ),
          'totalPages': totalPages.toString(),
          'fileSize': (pdfBytes.length / (1024 * 1024)).toStringAsFixed(2),
        });

        final startTime = DateTime.now();
        final cancelToken = CancelToken();
        _activeCancelTokens['single'] = cancelToken;

        final response = await _dio.post(
          '$apiUrl/whiteboard/sets/$setId/whiteboard-pdf',
          data: formData,
          cancelToken: cancelToken,
          onSendProgress: (sent, total) {
            final elapsed = DateTime.now().difference(startTime);
            final percentage = total > 0 ? sent / total : 0.0;
            final bytesPerSecond = elapsed.inMilliseconds > 0
                ? sent / (elapsed.inMilliseconds / 1000)
                : 0.0;
            final remaining = bytesPerSecond > 0
                ? Duration(
                    seconds: ((total - sent) / bytesPerSecond).toInt(),
                  )
                : null;

            onProgress(UploadProgress(
              bytesUploaded: sent,
              totalBytes: total,
              percentage: percentage,
              elapsedTime: elapsed,
              estimatedRemaining: remaining,
            ));
          },
        );

        if (response.statusCode == 200 || response.statusCode == 201) {
          debugPrint('✓ Upload successful: ${response.data}');
          return response.data['fileUrl'] ?? 'uploaded';
        } else {
          throw Exception(
            'Server error: ${response.statusCode} - ${response.statusMessage}',
          );
        }
      } on DioException catch (e) {
        attempt++;
        lastError = Exception('DIO Error: ${e.message}');

        if (attempt < config.maxRetries) {
          onStatus('Upload failed, retrying... ($attempt/${config.maxRetries})');
          await Future.delayed(config.retryDelay * attempt);
        }
      } catch (e) {
        attempt++;
        lastError = Exception(e.toString());

        if (attempt < config.maxRetries) {
          onStatus('Error occurred, retrying... ($attempt/${config.maxRetries})');
          await Future.delayed(config.retryDelay * attempt);
        }
      }
    }

    throw Exception(
      'Upload failed after ${config.maxRetries} attempts: $lastError',
    );
  }

  /// Chunked upload for large files (streaming approach)
  Future<String> _uploadChunked({
    required Uint8List pdfBytes,
    required String fileName,
    required String setId,
    required int totalPages,
    required String apiUrl,
    required String uploadId,
    required Function(UploadProgress) onProgress,
    required Function(String) onStatus,
  }) async {
    final totalChunks = (pdfBytes.length / config.chunkSize).ceil();
    debugPrint('📦 Chunked upload: $totalChunks chunks (${_formatBytes(pdfBytes.length)})');

    int uploadedBytes = 0;
    final startTime = DateTime.now();
    final cancelToken = CancelToken();
    _activeCancelTokens[uploadId] = cancelToken;

    try {
      for (int chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        onStatus('Uploading chunk ${chunkIndex + 1}/$totalChunks...');

        final start = chunkIndex * config.chunkSize;
        final end = (start + config.chunkSize).clamp(0, pdfBytes.length);
        final chunk = pdfBytes.sublist(start, end);

        await _uploadChunk(
          chunkData: chunk,
          chunkIndex: chunkIndex,
          totalChunks: totalChunks,
          fileName: fileName,
          setId: setId,
          uploadId: uploadId,
          apiUrl: apiUrl,
          cancelToken: cancelToken,
        );

        uploadedBytes = end;
        final elapsed = DateTime.now().difference(startTime);
        final percentage = uploadedBytes / pdfBytes.length;
        final bytesPerSecond = elapsed.inMilliseconds > 0
            ? uploadedBytes / (elapsed.inMilliseconds / 1000)
            : 0.0;
        final remaining = bytesPerSecond > 0
            ? Duration(
                seconds: ((pdfBytes.length - uploadedBytes) / bytesPerSecond)
                    .toInt(),
              )
            : null;

        onProgress(UploadProgress(
          bytesUploaded: uploadedBytes,
          totalBytes: pdfBytes.length,
          percentage: percentage,
          elapsedTime: elapsed,
          estimatedRemaining: remaining,
        ));
      }

      // Finalize upload
      onStatus('Finalizing upload...');
      final finalizeResponse = await _finalizeUpload(
        uploadId: uploadId,
        setId: setId,
        fileName: fileName,
        totalPages: totalPages,
        totalSize: pdfBytes.length,
        apiUrl: apiUrl,
        cancelToken: cancelToken,
      );

      return finalizeResponse;
    } finally {
      cancelToken.cancel();
      _activeCancelTokens.remove(uploadId);
    }
  }

  /// Upload individual chunk
  Future<void> _uploadChunk({
    required Uint8List chunkData,
    required int chunkIndex,
    required int totalChunks,
    required String fileName,
    required String setId,
    required String uploadId,
    required String apiUrl,
    required CancelToken cancelToken,
  }) async {
    int attempt = 0;

    while (attempt < config.maxRetries) {
      try {
        final formData = FormData.fromMap({
          'uploadId': uploadId,
          'chunkIndex': chunkIndex.toString(),
          'totalChunks': totalChunks.toString(),
          'chunk': MultipartFile.fromBytes(
            chunkData,
            filename: '${fileName}_chunk_$chunkIndex',
            contentType: MediaType.parse('application/octet-stream'),
          ),
        });

        final response = await _dio.post(
          '$apiUrl/whiteboard/sets/$setId/upload-chunk',
          data: formData,
          cancelToken: cancelToken,
        );

        if (response.statusCode == 200 || response.statusCode == 201) {
          return;
        } else {
          throw Exception('Chunk upload failed: ${response.statusCode}');
        }
      } catch (e) {
        attempt++;
        if (attempt < config.maxRetries) {
          await Future.delayed(config.retryDelay * attempt);
        } else {
          rethrow;
        }
      }
    }
  }

  /// Finalize chunked upload
  Future<String> _finalizeUpload({
    required String uploadId,
    required String setId,
    required String fileName,
    required int totalPages,
    required int totalSize,
    required String apiUrl,
    required CancelToken cancelToken,
  }) async {
    try {
      final response = await _dio.post(
        '$apiUrl/whiteboard/sets/$setId/finalize-upload',
        data: {
          'uploadId': uploadId,
          'fileName': fileName,
          'totalPages': totalPages,
          'totalSize': totalSize,
        },
        cancelToken: cancelToken,
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return response.data['fileUrl'] ?? 'uploaded';
      } else {
        throw Exception('Finalize failed: ${response.statusCode}');
      }
    } catch (e) {
      debugPrint('Finalize error: $e');
      rethrow;
    }
  }

  /// Cancel ongoing upload
  bool cancelUpload(String uploadId) {
    _activeCancelTokens[uploadId]?.cancel('Upload cancelled by user');
    _activeCancelTokens.remove(uploadId);
    return true;
  }

  String _generateUploadId() => '${DateTime.now().millisecondsSinceEpoch}_${DateTime.now().microsecond}';

  static String _formatBytes(int bytes) {
    if (bytes < 1024) return '$bytes B';
    final kb = bytes / 1024;
    if (kb < 1024) return '${kb.toStringAsFixed(1)} KB';
    final mb = kb / 1024;
    if (mb < 1024) return '${mb.toStringAsFixed(1)} MB';
    final gb = mb / 1024;
    return '${gb.toStringAsFixed(1)} GB';
  }

  void dispose() {
    for (final token in _activeCancelTokens.values) {
      token.cancel();
    }
    _activeCancelTokens.clear();
    _instance = null;
  }
}
