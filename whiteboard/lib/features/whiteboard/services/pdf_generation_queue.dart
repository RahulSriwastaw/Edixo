import 'dart:async';
import 'dart:typed_data';
import 'package:flutter/foundation.dart';
import 'background_pdf_worker.dart';

/// Model for a PDF generation task
class PdfGenerationTask {
  final String id;
  final List<Uint8List> slideImages;
  final List<int> pageOrder;
  final Set<int> deletedPages;
  final Function(double) onProgress;
  final Function(Uint8List) onSuccess;
  final Function(String) onError;

  final Completer<Uint8List> _completer = Completer();

  PdfGenerationTask({
    required this.id,
    required this.slideImages,
    required this.pageOrder,
    required this.deletedPages,
    required this.onProgress,
    required this.onSuccess,
    required this.onError,
  });

  Future<Uint8List> get future => _completer.future;
}

/// Queue manager for PDF generation tasks with priority support
class PdfGenerationQueue {
  // Task queues
  final List<PdfGenerationTask> _normalQueue = [];
  final List<PdfGenerationTask> _priorityQueue = [];
  
  // Active tasks
  final Map<String, PdfGenerationTask> _activeTasks = {};
  
  // Configuration
  final int maxConcurrent;
  final Duration taskTimeout;
  
  // State management
  StreamController<PdfQueueEvent>? _eventController;
  int _currentlyProcessing = 0;
  bool _isDisposed = false;

  static PdfGenerationQueue? _instance;

  PdfGenerationQueue._({
    this.maxConcurrent = 3,
    this.taskTimeout = const Duration(minutes: 10),
  });

  static PdfGenerationQueue get instance {
    return _instance ??= PdfGenerationQueue._(
      maxConcurrent: 3,
      taskTimeout: const Duration(minutes: 10),
    );
  }

  Stream<PdfQueueEvent> get events {
    _eventController ??= StreamController<PdfQueueEvent>.broadcast();
    return _eventController!.stream;
  }

  /// Enqueue a task with priority
  Future<Uint8List> enqueueTask({
    required String taskId,
    required List<Uint8List> slideImages,
    required List<int> pageOrder,
    required Set<int> deletedPages,
    required Function(double) onProgress,
    bool highPriority = false,
  }) async {
    if (_isDisposed) {
      throw StateError('Queue has been disposed');
    }

    final task = PdfGenerationTask(
      id: taskId,
      slideImages: slideImages,
      pageOrder: pageOrder,
      deletedPages: deletedPages,
      onProgress: onProgress,
      onSuccess: (bytes) {
        _emit(PdfQueueEvent.taskCompleted(taskId, bytes.lengthInBytes));
      },
      onError: (error) {
        _emit(PdfQueueEvent.taskError(taskId, error));
      },
    );

    if (highPriority) {
      _priorityQueue.add(task);
      _emit(PdfQueueEvent.taskEnqueued(taskId, isPriority: true));
    } else {
      _normalQueue.add(task);
      _emit(PdfQueueEvent.taskEnqueued(taskId, isPriority: false));
    }

    _processQueue();

    return task.future;
  }

  /// Process queue based on available workers
  void _processQueue() {
    if (_isDisposed || _currentlyProcessing >= maxConcurrent) return;

    // Priority queue first
    if (_priorityQueue.isNotEmpty) {
      _processTask(_priorityQueue.removeAt(0));
    } else if (_normalQueue.isNotEmpty) {
      _processTask(_normalQueue.removeAt(0));
    }
  }

  /// Process a single task
  void _processTask(PdfGenerationTask task) async {
    if (_isDisposed) return;

    _currentlyProcessing++;
    _activeTasks[task.id] = task;
    _emit(PdfQueueEvent.taskStarted(task.id));

    try {
      final pdfBytes = await BackgroundPdfWorker.instance.generatePdf(
        slideImages: task.slideImages,
        pageOrder: task.pageOrder,
        deletedPages: task.deletedPages,
        onProgress: task.onProgress,
      ).timeout(
        taskTimeout,
        onTimeout: () {
          throw TimeoutException(
            'PDF generation timed out after ${taskTimeout.inSeconds}s',
          );
        },
      );

      if (!_isDisposed && _activeTasks.containsKey(task.id)) {
        task._completer.complete(pdfBytes);
        task.onSuccess(pdfBytes);
      }
    } catch (e, stackTrace) {
      debugPrint('Task ${task.id} error: $e\n$stackTrace');
      if (!_isDisposed && _activeTasks.containsKey(task.id)) {
        if (!task._completer.isCompleted) {
          task._completer.completeError(e);
        }
        task.onError(e.toString());
      }
    } finally {
      _activeTasks.remove(task.id);
      _currentlyProcessing--;
      
      if (!_isDisposed) {
        _emit(PdfQueueEvent.taskFinished(task.id));
        _processQueue(); // Process next task
      }
    }
  }

  /// Cancel a specific task
  bool cancelTask(String taskId) {
    final inNormalQueue = _normalQueue.any((t) => t.id == taskId);
    final inPriorityQueue = _priorityQueue.any((t) => t.id == taskId);
    
    if (inNormalQueue) {
      _normalQueue.removeWhere((t) => t.id == taskId);
    }
    if (inPriorityQueue) {
      _priorityQueue.removeWhere((t) => t.id == taskId);
    }
    
    if (_activeTasks.containsKey(taskId)) {
      _activeTasks.remove(taskId);
      _emit(PdfQueueEvent.taskCancelled(taskId));
      return true;
    }

    if (inNormalQueue || inPriorityQueue) {
      _emit(PdfQueueEvent.taskCancelled(taskId));
      _processQueue();
      return true;
    }

    return false;
  }

  /// Get queue statistics
  PdfQueueStats getStats() {
    return PdfQueueStats(
      pendingTasks: _normalQueue.length,
      priorityTasks: _priorityQueue.length,
      activeTasks: _activeTasks.length,
      totalQueuedTasks: _normalQueue.length + _priorityQueue.length,
    );
  }

  void _emit(PdfQueueEvent event) {
    _eventController?.add(event);
  }

  void dispose() {
    _isDisposed = true;
    _activeTasks.clear();
    _normalQueue.clear();
    _priorityQueue.clear();
    _eventController?.close();
    _eventController = null;
    _instance = null;
  }
}

/// Events emitted by the queue
class PdfQueueEvent {
  final String type;
  final String? taskId;
  final int? dataSize;
  final String? error;
  final bool? isPriority;

  PdfQueueEvent._({
    required this.type,
    this.taskId,
    this.dataSize,
    this.error,
    this.isPriority,
  });

  factory PdfQueueEvent.taskEnqueued(String taskId, {required bool isPriority}) {
    return PdfQueueEvent._(
      type: 'ENQUEUED',
      taskId: taskId,
      isPriority: isPriority,
    );
  }

  factory PdfQueueEvent.taskStarted(String taskId) {
    return PdfQueueEvent._(type: 'STARTED', taskId: taskId);
  }

  factory PdfQueueEvent.taskCompleted(String taskId, int dataSize) {
    return PdfQueueEvent._(
      type: 'COMPLETED',
      taskId: taskId,
      dataSize: dataSize,
    );
  }

  factory PdfQueueEvent.taskError(String taskId, String error) {
    return PdfQueueEvent._(
      type: 'ERROR',
      taskId: taskId,
      error: error,
    );
  }

  factory PdfQueueEvent.taskFinished(String taskId) {
    return PdfQueueEvent._(type: 'FINISHED', taskId: taskId);
  }

  factory PdfQueueEvent.taskCancelled(String taskId) {
    return PdfQueueEvent._(type: 'CANCELLED', taskId: taskId);
  }
}

/// Statistics about the queue
class PdfQueueStats {
  final int pendingTasks;
  final int priorityTasks;
  final int activeTasks;
  final int totalQueuedTasks;

  PdfQueueStats({
    required this.pendingTasks,
    required this.priorityTasks,
    required this.activeTasks,
    required this.totalQueuedTasks,
  });

  bool get isIdle => activeTasks == 0 && totalQueuedTasks == 0;
}
