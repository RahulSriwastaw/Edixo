
import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Provider to track if any widget is currently being dragged or resized.
/// When true, the whiteboard's InteractiveViewer should have pan and scale disabled.
final isDraggingWidgetProvider = StateProvider<bool>((ref) => false);

/// Provider to track the currently selected widget ID for styling/settings.
final selectedSetWidgetIdProvider = StateProvider<String?>((ref) => null);
