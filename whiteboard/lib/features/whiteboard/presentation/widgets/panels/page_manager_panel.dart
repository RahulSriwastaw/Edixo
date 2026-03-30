import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../../core/theme/app_theme.dart';
import 'package:eduhub_whiteboard/features/whiteboard/providers/canvas_provider.dart';

class PageManagerPanel extends ConsumerStatefulWidget {
  const PageManagerPanel({super.key});

  @override
  ConsumerState<PageManagerPanel> createState() => _PageManagerPanelState();
}

class _PageManagerPanelState extends ConsumerState<PageManagerPanel> {
  @override
  Widget build(BuildContext context) {
    final canvasState = ref.watch(canvasStateProvider);
    final notifier = ref.read(canvasStateProvider.notifier);
    final pages = canvasState.pages;

    return Container(
      width: 300.w,
      height: double.infinity,
      decoration: BoxDecoration(
        color: const Color(0xFF12121F).withOpacity(0.95),
        border: const Border(left: BorderSide(color: Colors.white10)),
      ),
      child: Column(
        children: [
          // Header
          Container(
            padding: EdgeInsets.fromLTRB(20.w, 40.h, 12.w, 20.h),
            child: Row(
              children: [
                Text(
                  'Page Manager',
                  style: GoogleFonts.dmSans(
                    color: Colors.white,
                    fontSize: 18.sp,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.add_rounded, color: AppTheme.primaryOrange),
                  onPressed: notifier.addPage,
                  tooltip: 'Add new page',
                ),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.white38, size: 20),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),

          const Divider(color: Colors.white10, height: 1),

          // Pages List (Reorderable)
          Expanded(
            child: ReorderableListView.builder(
              padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 16.h),
              itemCount: pages.length,
              onReorder: notifier.reorderPages,
              itemBuilder: (context, index) {
                final page = pages[index];
                final isCurrent = index == canvasState.currentPageIndex;

                return Padding(
                  key: ValueKey(page.id),
                  padding: EdgeInsets.only(bottom: 12.h),
                  child: _PageThumbnailCard(
                    page: page,
                    index: index,
                    isCurrent: isCurrent,
                    onTap: () {
                      notifier.setPageIndex(index);
                      // Close drawer/panel if needed? Or keep open for quick jumping.
                    },
                    onDelete: () => _confirmDelete(context, notifier, index),
                  ),
                );
              },
            ),
          ),

          // Footer info
          Padding(
            padding: EdgeInsets.all(20.w),
            child: Text(
              '${pages.length} Pages Total',
              style: TextStyle(color: Colors.white38, fontSize: 12.sp),
            ),
          ),
        ],
      ),
    );
  }

  void _confirmDelete(BuildContext context, CanvasStateNotifier notifier, int index) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E1E30),
        title: const Text('Delete Page?', style: TextStyle(color: Colors.white)),
        content: const Text(
          'This will permanently remove all strokes on this page.',
          style: TextStyle(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel', style: TextStyle(color: Colors.white38)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.redAccent),
            onPressed: () {
              notifier.removePage(index);
              Navigator.pop(ctx);
            },
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
}

class _PageThumbnailCard extends StatelessWidget {
  final PageData page;
  final int index;
  final bool isCurrent;
  final VoidCallback onTap;
  final VoidCallback onDelete;

  const _PageThumbnailCard({
    required this.page,
    required this.index,
    required this.isCurrent,
    required this.onTap,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(
          color: isCurrent ? AppTheme.primaryOrange.withOpacity(0.1) : const Color(0xFF1E1E30),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isCurrent ? AppTheme.primaryOrange : Colors.white10,
            width: isCurrent ? 1.5 : 1,
          ),
          boxShadow: isCurrent 
            ? [BoxShadow(color: AppTheme.primaryOrange.withOpacity(0.15), blurRadius: 8)]
            : null,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Thumbnail Area
            Container(
              height: 120.h,
              decoration: BoxDecoration(
                color: const Color(0xFF0D0D0D),
                borderRadius: const BorderRadius.vertical(top: Radius.circular(11)),
                image: page.bgImageBytes != null 
                  ? DecorationImage(image: MemoryImage(page.bgImageBytes!), fit: BoxFit.contain)
                  : null,
              ),
              child: Center(
                child: page.bgImageBytes == null 
                  ? Icon(
                      _getTemplateIcon(page.template),
                      color: Colors.white12,
                      size: 40.sp,
                    )
                  : null,
              ),
            ),

            // Info Bar
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 8.h),
              child: Row(
                children: [
                  Container(
                    width: 20.w,
                    height: 20.w,
                    decoration: BoxDecoration(
                      color: isCurrent ? AppTheme.primaryOrange : Colors.white10,
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Text(
                        '${index + 1}',
                        style: TextStyle(
                          color: isCurrent ? Colors.white : Colors.white38,
                          fontSize: 10.sp,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                  SizedBox(width: 8.w),
                  Text(
                    'Page ${index + 1}',
                    style: TextStyle(
                      color: isCurrent ? Colors.white : Colors.white60,
                      fontSize: 12.sp,
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.delete_outline_rounded, size: 18),
                    color: Colors.white24,
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

  IconData _getTemplateIcon(PageTemplate template) {
    switch (template) {
      case PageTemplate.ruled: return Icons.notes_rounded;
      case PageTemplate.grid: return Icons.grid_4x4_rounded;
      case PageTemplate.dotGrid: return Icons.blur_on_rounded;
      case PageTemplate.mathGrid: return Icons.grid_on_rounded;
      default: return Icons.crop_din_rounded;
    }
  }
}
