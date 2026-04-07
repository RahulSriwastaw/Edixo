import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/slide_provider.dart';
import '../../../data/models/page_models.dart';
import '../../../../whiteboard/data/models/slide_model.dart';



class SlidePanelDrawer extends ConsumerWidget {
  const SlidePanelDrawer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final slideState = ref.watch(slideNotifierProvider);
    final pages = slideState.pages;
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
                Text('${pages.length} Slides', style: const TextStyle(color: Colors.white54, fontSize: 12)),
              ],
            ),
          ),

          
          // Slide List
          Expanded(
            child: pages.isEmpty
                ? const Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.inbox_outlined, color: Colors.white24, size: 48),
                        SizedBox(height: 12),
                        Text('No slides imported', style: TextStyle(color: Colors.white38, fontSize: 13)),
                        SizedBox(height: 4),
                        Text('Use "Import Set" to load questions', style: TextStyle(color: Colors.white24, fontSize: 11)),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    itemCount: pages.length,
                    itemBuilder: (context, index) {
                      final page = pages[index];
                      final isSelected = slideState.currentPageIndex == index;
                      final hasSavedAnnotation = slideState.savedAnnotations.containsKey(page.id);
                      
                      return Padding(
                        key: ValueKey(page.id),
                        padding: const EdgeInsets.only(bottom: 10),
                        child: _SlideTile(
                          index: index,
                          page: page,
                          isSelected: isSelected,
                          hasAnnotation: hasSavedAnnotation,
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
  final WhiteboardPage page;
  final bool isSelected;
  final bool hasAnnotation;
  final VoidCallback onTap;

  const _SlideTile({
    required this.index,
    required this.page,
    required this.isSelected,
    required this.hasAnnotation,
    required this.onTap,
  });


  /// Strip basic HTML tags for thumbnail preview text.
  String _stripHtml(String html) {
    return html
        .replaceAll(RegExp(r'<[^>]+>'), ' ')
        .replaceAll(RegExp(r'&nbsp;'), ' ')
        .replaceAll(RegExp(r'&amp;'), '&')
        .replaceAll(RegExp(r'&lt;'), '<')
        .replaceAll(RegExp(r'&gt;'), '>')
        .replaceAll(RegExp(r'\s+'), ' ')
        .trim();
  }

  @override
  Widget build(BuildContext context) {
    String title = 'Blank Page';
    String previewText = 'Empty surface';
    String? source;
    int? qNum;
    int optCount = 0;

    if (page is SetImportPage) {
      final slide = (page as SetImportPage).slide;
      title = 'Question ${slide.questionNumber}';
      previewText = slide.questionText;
      source = slide.examSource;
      qNum = slide.questionNumber;
      optCount = slide.options.length;
    }

    final questionPreview = _stripHtml(previewText);
    final truncated = questionPreview.length > 80
        ? '${questionPreview.substring(0, 80)}…'
        : questionPreview;

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        decoration: BoxDecoration(
          color: isSelected
              ? const Color(0xFFFF6B35).withValues(alpha: 0.12)
              : Colors.white.withValues(alpha: 0.03),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected ? const Color(0xFFFF6B35) : Colors.white10,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Thumbnail area
            Container(
              height: 72,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.3),
                borderRadius: const BorderRadius.vertical(top: Radius.circular(9)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: qNum != null 
                              ? const Color(0xFFFF6B35).withValues(alpha: 0.85)
                              : Colors.blueGrey,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          qNum != null ? 'Q$qNum' : 'PAGE',
                          style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                        ),
                      ),
                      if (source != null) ...[
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            source,
                            style: const TextStyle(color: Colors.white38, fontSize: 9),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 6),
                  Expanded(
                    child: Text(
                      truncated,
                      style: const TextStyle(color: Colors.white60, fontSize: 10, height: 1.3),
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
            // Footer
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              child: Row(
                children: [
                  Text(
                    'Slide ${index + 1}',
                    style: TextStyle(
                      color: isSelected ? const Color(0xFFFF6B35) : Colors.white54,
                      fontSize: 11,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    ),
                  ),
                  const Spacer(),
                  if (hasAnnotation)
                    const Tooltip(
                      message: 'Has annotations',
                      child: Icon(Icons.edit_note, color: Color(0xFFFF6B35), size: 14),
                    ),
                  if (optCount > 0) ...[
                    const SizedBox(width: 4),
                    Text(
                      '$optCount opts',
                      style: const TextStyle(color: Colors.white24, fontSize: 9),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}


