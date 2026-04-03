import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/canvas_provider.dart';
import '../../providers/slide_provider.dart';

class SlidePanelDrawer extends ConsumerWidget {
  const SlidePanelDrawer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final slideState = ref.watch(slideNotifierProvider);
    final slides = slideState.slides;
    final slideNotifier = ref.read(slideNotifierProvider.notifier);

    return Drawer(
      backgroundColor: const Color(0xFF1A1A1A),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.fromLTRB(16, 60, 16, 16),
            color: Colors.black26,
            child: Row(
              children: [
                const Icon(Icons.layers_outlined, color: Color(0xFFFF6B35)),
                const SizedBox(width: 12),
                const Text('Slide Manager', 
                  style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                const Spacer(),
                Text('${slides.length} Slides', style: const TextStyle(color: Colors.white54, fontSize: 12)),
              ],
            ),
          ),
          
          // Slide List
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              itemCount: slides.length,
              itemBuilder: (context, index) {
                final slide = slides[index];
                final isSelected = slideState.currentSlideIndex == index;
                
                return Padding(
                  key: ValueKey(slide.slideId),
                  padding: const EdgeInsets.only(bottom: 12),
                  child: _SlideTile(
                    index: index,
                    slide: slide,
                    isSelected: isSelected,
                    onTap: () {
                      slideNotifier.navigateToSlide(index);
                      Navigator.of(context).pop();
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _SlideTile extends StatelessWidget {
  final int index;
  final dynamic slide;
  final bool isSelected;
  final VoidCallback onTap;

  const _SlideTile({
    required this.index,
    required this.slide,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 120,
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFFF6B35).withOpacity(0.1) : Colors.white.withOpacity(0.03),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? const Color(0xFFFF6B35) : Colors.white10,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          children: [
             // Thumbnail Placeholder
             Expanded(
               child: Center(
                 child: Icon(
                   Icons.description_outlined,
                   color: Colors.white24,
                   size: 32,
                 ),
               ),
             ),
             // Footer
             Container(
               padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
               decoration: const BoxDecoration(
                 color: Colors.black26,
                 borderRadius: BorderRadius.vertical(bottom: Radius.circular(10)),
               ),
               child: Row(
                 mainAxisAlignment: MainAxisAlignment.spaceBetween,
                 children: [
                   Text('Slide ${index + 1}', style: const TextStyle(color: Colors.white, fontSize: 11)),
                 ],
               ),
             ),
          ],
        ),
      ),
    );
  }
}
