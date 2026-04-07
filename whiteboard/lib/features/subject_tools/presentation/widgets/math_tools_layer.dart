// lib/features/subject_tools/presentation/widgets/math_tools_layer.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../whiteboard/presentation/providers/teaching_tools_provider.dart';
import 'ruler_widget.dart';
import 'protractor_widget.dart';

class MathToolsLayer extends ConsumerWidget {
  const MathToolsLayer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(teachingToolsNotifierProvider);
    final activeTools = state.activeMathTools;

    if (activeTools.isEmpty) return const SizedBox.shrink();

    return Stack(
      children: [
        if (activeTools.contains('ruler'))
          const RulerWidget(),
        if (activeTools.contains('protractor'))
          const ProtractorWidget(),
      ],
    );
  }
}
