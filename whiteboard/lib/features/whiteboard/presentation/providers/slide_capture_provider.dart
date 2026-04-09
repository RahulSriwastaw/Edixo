// lib/features/whiteboard/presentation/providers/slide_capture_provider.dart

import 'dart:typed_data';
import 'dart:ui' as ui;
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'slide_capture_provider.g.dart';

@Riverpod(keepAlive: true)
class SlideCapture extends _$SlideCapture {
  @override
  Map<int, Uint8List> build() {
    return {};
  }

  /// Captures the current slide from a GloalKey and caches it.
  /// Standardizes resolution at 1.5x pixel ratio for optimal memory/speed on Web.
  Future<void> captureSlide(int index, GlobalKey key) async {
    try {
      final boundary = key.currentContext?.findRenderObject() as RenderRepaintBoundary?;
      if (boundary == null) return;

      final image = await boundary.toImage(pixelRatio: 1.5);
      final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
      
      if (byteData != null) {
        final bytes = byteData.buffer.asUint8List();
        state = {...state, index: bytes};
        debugPrint("Background Captured Slide $index (${bytes.lengthInBytes} bytes)");
      }
    } catch (e) {
      debugPrint("Error capturing slide $index in background: $e");
    }
  }

  /// Clears the cache when a session ends.
  void clear() {
    state = {};
  }
}
