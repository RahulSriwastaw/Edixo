import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../../core/theme/app_theme.dart';
import '../../../providers/canvas_provider.dart';

class PageSidebar extends ConsumerWidget {
  const PageSidebar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final canvasState = ref.watch(canvasStateProvider);
    final notifier = ref.read(canvasStateProvider.notifier);

    return Container(
      width: 140.w,
      decoration: BoxDecoration(
        color: const Color(0xFF1E1E2E), // Dark Navy
        border: Border(right: BorderSide(color: Colors.white.withOpacity(0.08))),
      ),
      child: Column(
        children: [
          // Header
          Padding(
            padding: EdgeInsets.symmetric(vertical: 20.h, horizontal: 12.w),
            child: Row(
              children: [
                Icon(Icons.layers_outlined, color: Colors.white70, size: 18.sp),
                SizedBox(width: 8.w),
                Text(
                  'Pages',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 14.sp,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const Spacer(),
                Text(
                  '${canvasState.pages.length}',
                  style: TextStyle(color: Colors.white38, fontSize: 12.sp),
                ),
              ],
            ),
          ),

          // Page list
          Expanded(
            child: ListView.builder(
              padding: EdgeInsets.symmetric(horizontal: 12.w),
              itemCount: canvasState.pages.length,
              itemBuilder: (context, index) {
                final page = canvasState.pages[index];
                final isSelected = canvasState.currentPageIndex == index;

                return GestureDetector(
                  onTap: () => notifier.setPageIndex(index),
                  child: Container(
                    margin: EdgeInsets.only(bottom: 16.h),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(12.r),
                      border: Border.all(
                        color: isSelected ? AppTheme.primaryOrange : Colors.white10,
                        width: isSelected ? 2 : 1,
                      ),
                      boxShadow: isSelected
                          ? [
                              BoxShadow(
                                color: AppTheme.primaryOrange.withOpacity(0.2),
                                blurRadius: 8,
                                spreadRadius: 1,
                              )
                            ]
                          : [],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Thumbnail Preview
                        AspectRatio(
                          aspectRatio: 1.4, // Match canvas aspect ratio roughly
                          child: ClipRRect(
                            borderRadius: BorderRadius.vertical(top: Radius.circular(10.r)),
                            child: Container(
                              color: Colors.white.withOpacity(0.05),
                              child: page.bgImageBytes != null
                                  ? Image.memory(
                                      page.bgImageBytes!,
                                      fit: BoxFit.cover,
                                    )
                                  : Center(
                                      child: Icon(
                                        _getTemplateIcon(page.template),
                                        color: Colors.white24,
                                        size: 24.sp,
                                      ),
                                    ),
                            ),
                          ),
                        ),
                        // Page Number
                        Padding(
                          padding: EdgeInsets.all(6.w),
                          child: Row(
                            children: [
                              Text(
                                'Slide ${index + 1}',
                                style: TextStyle(
                                  color: isSelected ? Colors.white : Colors.white70,
                                  fontSize: 10.sp,
                                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                                ),
                              ),
                              const Spacer(),
                              if (canvasState.pages.length > 1)
                                GestureDetector(
                                  onTap: () => _confirmDelete(context, index, notifier),
                                  child: Icon(
                                    Icons.delete_outline_rounded,
                                    size: 14.sp,
                                    color: Colors.white24,
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          // Add Page Button
          Padding(
            padding: EdgeInsets.all(16.w),
            child: ElevatedButton.icon(
              onPressed: () => notifier.addPage(),
              icon: Icon(Icons.add_rounded, size: 18.sp),
              label: Text('New Page', style: TextStyle(fontSize: 12.sp)),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryOrange,
                foregroundColor: Colors.white,
                minimumSize: Size(double.infinity, 40.h),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  IconData _getTemplateIcon(PageTemplate template) {
    switch (template) {
      case PageTemplate.grid: return Icons.grid_on_rounded;
      case PageTemplate.ruled: return Icons.view_headline_rounded;
      case PageTemplate.dotGrid: return Icons.blur_on_rounded;
      default: return Icons.crop_din_rounded;
    }
  }

  void _confirmDelete(BuildContext context, int index, CanvasStateNotifier notifier) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF2D2D3A),
        title: Text('Delete Page?', style: TextStyle(color: Colors.white, fontSize: 16.sp)),
        content: Text(
          'This will remove all annotations on this slide.',
          style: TextStyle(color: Colors.white70, fontSize: 14.sp),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () {
              notifier.removePage(index);
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.errorRed),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
}
