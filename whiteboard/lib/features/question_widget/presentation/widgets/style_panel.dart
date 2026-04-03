
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/question_widget_provider.dart';
import '../providers/selected_widget_provider.dart';

class StylePanel extends ConsumerWidget {
  const StylePanel({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedWidgetId = ref.watch(selectedWidgetNotifierProvider);
    if (selectedWidgetId == null) {
      return const SizedBox.shrink();
    }

    return Positioned(
      top: 100,
      right: 20,
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Column(
            children: [
              const Text('Style'),
              ElevatedButton(onPressed: () => ref.read(questionWidgetNotifierProvider.notifier).bringToFront(selectedWidgetId), child: const Text('Bring to Front')),
              ElevatedButton(onPressed: () => ref.read(questionWidgetNotifierProvider.notifier).sendToBack(selectedWidgetId), child: const Text('Send to Back')),
              IconButton(
                onPressed: () => ref.read(questionWidgetNotifierProvider.notifier).toggleLock(selectedWidgetId),
                icon: Icon(ref.watch(questionWidgetNotifierProvider)[selectedWidgetId]!.isLocked ? Icons.lock : Icons.lock_open),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
