// lib/features/whiteboard/presentation/providers/canvas_size_provider.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Updated by WhiteboardCanvas via LayoutBuilder on every build.
/// Default size matches a 1920×1080 canvas (standard coaching blackboard).
final canvasSizeProvider = StateProvider<Size>((ref) => const Size(1920, 1080));
