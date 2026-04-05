import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/slide_provider.dart';
import '../../providers/pdf_pages_provider.dart';

/// Layer 2 — shows the current slide's background.
/// - For PDF-imported slides: renders the pre-rendered page image.
/// - For question-set slides: transparent (EditableQuestionLayer handles rendering).
class SlideContentLayer extends ConsumerWidget {
  const SlideContentLayer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final slideState = ref.watch(slideNotifierProvider);
    final pdfPages   = ref.watch(pdfPagesProvider);

    final currentSlide = slideState.currentSlide;
    if (currentSlide == null) return const SizedBox.expand();

    final pageBytes = pdfPages[currentSlide.slideId];
    if (pageBytes == null) return const SizedBox.expand();

    // PDF page — render full-frame, absorb no pointer events (annotation layer is above)
    return Positioned.fill(
      child: Image.memory(
        pageBytes,
        fit: BoxFit.contain,
        gaplessPlayback: true,   // prevents flicker on slide change
        errorBuilder: (_, __, ___) => const _PageErrorPlaceholder(),
      ),
    );
  }
}

class _PageErrorPlaceholder extends StatelessWidget {
  const _PageErrorPlaceholder();

  @override
  Widget build(BuildContext context) {
    return Container(
      color: const Color(0xFF1A1A2E),
      child: const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.broken_image_outlined, color: Colors.white24, size: 48),
            SizedBox(height: 8),
            Text('Page could not be rendered',
                style: TextStyle(color: Colors.white38, fontSize: 12)),
          ],
        ),
      ),
    );
  }
}
