import 'dart:async';
import 'dart:isolate';
import 'dart:typed_data';
import 'package:flutter/foundation.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;

/// Commands sent to the worker
enum WorkerCommand { start, process, stop }

/// Message structure for background worker communication
class WorkerMessage {
  final WorkerCommand command;
  final Map<String, dynamic>? data;

  WorkerMessage({required this.command, this.data});
}

/// Background PDF processing worker using Isolate pool
class BackgroundPdfWorker {
  static const int poolSize = 3; // 3 concurrent workers
  final List<Isolate> _isolates = [];
  final List<ReceivePort> _receivePorts = [];
  final List<SendPort> _sendPorts = [];
  final List<bool> _workerBusy = [];
  
  static BackgroundPdfWorker? _instance;
  
  BackgroundPdfWorker._();
  
  static BackgroundPdfWorker get instance => _instance ??= BackgroundPdfWorker._();

  bool get isInitialized => _isolates.length == poolSize;

  /// Initialize the worker pool
  Future<void> initialize() async {
    if (isInitialized) return;

    for (int i = 0; i < poolSize; i++) {
      final receivePort = ReceivePort();
      _receivePorts.add(receivePort);
      _workerBusy.add(false);

      final isolate = await Isolate.spawn(
        _workerEntryPoint,
        receivePort.sendPort,
      );
      _isolates.add(isolate);

      // Wait for the initialization message containing the SendPort
      final sendPort = await receivePort.first as SendPort;
      _sendPorts.add(sendPort);
    }

    debugPrint('✓ PDF Worker Pool initialized with $poolSize workers');
  }

  /// Get the next available worker
  Future<(SendPort, ReceivePort)> _getAvailableWorker() async {
    const maxWaitTime = Duration(minutes: 5);
    final startTime = DateTime.now();

    while (true) {
      for (int i = 0; i < _workerBusy.length; i++) {
        if (!_workerBusy[i]) {
          _workerBusy[i] = true;
          return (_sendPorts[i], _receivePorts[i]);
        }
      }

      // Check timeout
      if (DateTime.now().difference(startTime) > maxWaitTime) {
        throw TimeoutException('No worker available after $maxWaitTime');
      }

      await Future.delayed(const Duration(milliseconds: 100));
    }
  }

  /// Process PDF generation in background
  Future<Uint8List> generatePdf({
    required List<Uint8List> slideImages,
    required List<int> pageOrder,
    required Set<int> deletedPages,
    required Function(double) onProgress,
  }) async {
    await initialize();

    final responsePort = ReceivePort();
    
    try {
      final params = {
        'slideImages': slideImages,
        'pageOrder': pageOrder,
        'deletedPages': deletedPages,
        'responsePort': responsePort.sendPort,
      };

      final result = await _processWithWorker(params, responsePort);
      return result as Uint8List;
    } catch (e) {
      debugPrint('PDF generation error: $e');
      rethrow;
    } finally {
      responsePort.close();
      onProgress(1.0);
    }
  }

  Future<dynamic> _processWithWorker(
    Map<String, dynamic> params,
    ReceivePort responsePort,
  ) async {
    final (sendPort, receivePort) = await _getAvailableWorker();
    int workerIndex = _sendPorts.indexOf(sendPort);

    final controller = StreamController<dynamic>();
    final subscription = responsePort.listen((message) {
      if (message is String && message == 'DONE') {
        controller.close();
      } else {
        controller.add(message);
      }
    });

    try {
      sendPort.send(params);
      
      Uint8List? result;
      await for (final message in controller.stream) {
        if (message is Uint8List) {
          result = message;
        } else if (message is {'progress': double}) {
          debugPrint('PDF generation progress: ${(message['progress'] * 100).toStringAsFixed(0)}%');
        }
      }

      return result ?? throw Exception('No PDF generated');
    } finally {
      await subscription.cancel();
      _workerBusy[workerIndex] = false;
    }
  }

  void dispose() {
    for (final receivePort in _receivePorts) {
      receivePort.close();
    }
    for (final isolate in _isolates) {
      isolate.kill();
    }
    _isolates.clear();
    _receivePorts.clear();
    _sendPorts.clear();
    _workerBusy.clear();
    _instance = null;
  }
}

/// Entry point for the background isolate
void _workerEntryPoint(SendPort mainSendPort) {
  final workerReceivePort = ReceivePort();
  mainSendPort.send(workerReceivePort.sendPort);

  workerReceivePort.listen((dynamic message) async {
    if (message is Map<String, dynamic>) {
      try {
        final slideImages = message['slideImages'] as List<Uint8List>;
        final pageOrder = message['pageOrder'] as List<int>;
        final deletedPages = message['deletedPages'] as Set<int>;
        final responsePort = message['responsePort'] as SendPort;

        // Generate PDF
        final pdfBytes = await _generatePdfOptimized(
          slideImages,
          pageOrder,
          deletedPages,
          responsePort,
        );

        responsePort.send(pdfBytes);
        responsePort.send('DONE');
      } catch (e) {
        debugPrint('Worker error: $e');
      }
    }
  });
}

/// Optimized PDF generation function (runs in isolate)
Future<Uint8List> _generatePdfOptimized(
  List<Uint8List> slideImages,
  List<int> pageOrder,
  Set<int> deletedPages,
  SendPort progressPort,
) async {
  const pageSize = 50; // Process pages in chunks
  final pdf = pw.Document();
  int processedPages = 0;

  try {
    // Process pages in batches to avoid memory issues
    for (int batch = 0; batch < pageOrder.length; batch += pageSize) {
      final endIndex = (batch + pageSize).clamp(0, pageOrder.length);

      for (int orderIndex = batch; orderIndex < endIndex; orderIndex++) {
        final pageIndex = pageOrder[orderIndex];

        if (deletedPages.contains(pageIndex) || pageIndex >= slideImages.length) {
          continue;
        }

        final pngBytes = slideImages[pageIndex];
        if (pngBytes.isEmpty) continue;

        try {
          final pdfImage = pw.MemoryImage(pngBytes);
          pdf.addPage(
            pw.Page(
              pageFormat: PdfPageFormat.a4.landscape,
              margin: pw.EdgeInsets.zero,
              build: (pw.Context context) {
                return pw.Center(
                  child: pw.Image(pdfImage, fit: pw.BoxFit.contain),
                );
              },
            ),
          );

          processedPages++;
          progressPort.send({
            'progress': processedPages / pageOrder.length,
          });
        } catch (e) {
          debugPrint('Error adding page $pageIndex: $e');
        }
      }

      // Release memory periodically
      await Future.delayed(const Duration(milliseconds: 10));
    }

    return await pdf.save();
  } catch (e) {
    debugPrint('PDF generation failed: $e');
    rethrow;
  }
}
