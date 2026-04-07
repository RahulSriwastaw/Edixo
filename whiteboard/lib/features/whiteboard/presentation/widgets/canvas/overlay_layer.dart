import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../teaching_tools/spotlight_overlay.dart';
import '../teaching_tools/india_map_overlay.dart';
import '../../../../subject_tools/presentation/widgets/math_tools_layer.dart';

class OverlayLayer extends ConsumerWidget {
  const OverlayLayer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return const Stack(
      children: [
        // 1. Spotlight (Focused Teaching)
        SpotlightOverlay(),

        // 2. India Map (Geography/GS Context)
        IndiaMapOverlay(),

        // 3. Math Tools (Ruler, Protractor)
        MathToolsLayer(),

        // TODO: Selection box, Laser Pointer
      ],
    );
  }
}
