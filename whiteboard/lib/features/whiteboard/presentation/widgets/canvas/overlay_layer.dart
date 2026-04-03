import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/tool_provider.dart';

class OverlayLayer extends ConsumerWidget {
  const OverlayLayer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final toolState = ref.watch(toolNotifierProvider);

    // In Phase 2, overlay layer is empty
    // Will add laser pointer, spotlight, selection box in Phase 3+
    return const SizedBox.expand();
  }
}
