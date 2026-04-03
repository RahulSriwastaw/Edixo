import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/slide_provider.dart';

class SlideContentLayer extends ConsumerWidget {
  const SlideContentLayer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final slideState = ref.watch(slideNotifierProvider);

    // No slide background needed for Phase 2 - just a transparent layer
    // In Phase 4, this might display slide questions as read-only content
    return const SizedBox.expand();
  }
}
