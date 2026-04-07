// lib/features/whiteboard/presentation/widgets/teaching_tools/india_map_overlay.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../../providers/teaching_tools_provider.dart';

class IndiaMapOverlay extends ConsumerStatefulWidget {
  const IndiaMapOverlay({super.key});

  @override
  ConsumerState<IndiaMapOverlay> createState() => _IndiaMapOverlayState();
}

class _IndiaMapOverlayState extends ConsumerState<IndiaMapOverlay> {
  Offset _position = const Offset(100, 100);
  double _scale = 1.0;
  
  // High-quality India SVG URL (Open-source)
  static const String _mapUrl = 'https://raw.githubusercontent.com/Anuj-Rathore/India-SVG-Map/master/india.svg';

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(teachingToolsNotifierProvider);
    if (!state.isIndiaMapEnabled) return const SizedBox.shrink();

    return Positioned(
      left: _position.dx,
      top: _position.dy,
      child: GestureDetector(
        onPanUpdate: (details) {
          setState(() {
            _position += details.delta;
          });
        },
        onScaleUpdate: (details) {
          if (details.scale != 1.0) {
            setState(() {
              _scale = (_scale * details.scale).clamp(0.5, 4.0);
            });
          }
        },
        child: Container(
          width: 600 * _scale,
          height: 700 * _scale,
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.05),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white24),
          ),
          child: Stack(
            children: [
              // The Map
              SvgPicture.network(
                _mapUrl,
                placeholderBuilder: (context) => const Center(
                  child: CircularProgressIndicator(color: Colors.orange),
                ),
                colorFilter: const ColorFilter.mode(
                  Colors.white70,
                  BlendMode.srcIn,
                ),
              ),

              // Control Buttons
              Positioned(
                top: 0,
                right: 0,
                child: IconButton(
                  icon: const Icon(Icons.close, color: Colors.redAccent),
                  onPressed: () => ref.read(teachingToolsNotifierProvider.notifier).toggleIndiaMap(),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
