import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../providers/canvas_provider.dart';

class SlidePanelDrawer extends ConsumerWidget {
  const SlidePanelDrawer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final canvasState = ref.watch(canvasStateProvider);
    final pages = canvasState.pages;
    final notifier = ref.read(canvasStateProvider.notifier);

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
                const Text('Page Manager', 
                  style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                const Spacer(),
                Text('${pages.length} Pages', style: const TextStyle(color: Colors.white54, fontSize: 12)),
              ],
            ),
          ),
          
          // Action Buttons
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => notifier.addPage(template: PageTemplate.blank),
                    icon: const Icon(Icons.add, size: 16),
                    label: const Text('Blank'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white10,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () => notifier.addPage(template: PageTemplate.grid),
                    icon: const Icon(Icons.grid_on, size: 16),
                    label: const Text('Grid'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.white10,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Page List
          Expanded(
            child: ReorderableListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              itemCount: pages.length,
              onReorder: notifier.reorderPages,
              itemBuilder: (context, index) {
                final page = pages[index];
                final isSelected = canvasState.currentPageIndex == index;
                
                return Padding(
                  key: ValueKey(page.id),
                  padding: const EdgeInsets.only(bottom: 12),
                  child: _PageTile(
                    index: index,
                    page: page,
                    isSelected: isSelected,
                    onTap: () {
                      notifier.setPageIndex(index);
                      Navigator.of(context).pop();
                    },
                    onDelete: () => notifier.removePage(index),
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

class _PageTile extends StatelessWidget {
  final int index;
  final PageData page;
  final bool isSelected;
  final VoidCallback onTap;
  final VoidCallback onDelete;

  const _PageTile({
    required this.index,
    required this.page,
    required this.isSelected,
    required this.onTap,
    required this.onDelete,
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
                   page.bgImageBytes != null ? Icons.image : Icons.description_outlined,
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
                   if (!isSelected)
                     IconButton(
                       icon: const Icon(Icons.delete_outline, size: 14, color: Colors.white38),
                       onPressed: onDelete,
                       padding: EdgeInsets.zero,
                       constraints: const BoxConstraints(),
                     ),
                 ],
               ),
             ),
          ],
        ),
      ),
    );
  }
}
