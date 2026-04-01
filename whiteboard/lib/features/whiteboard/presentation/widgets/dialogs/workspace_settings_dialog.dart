import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../../core/theme/app_theme.dart';
import '../../../providers/canvas_provider.dart';

class WorkspaceSettingsDialog extends ConsumerWidget {
  const WorkspaceSettingsDialog({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final canvasState = ref.watch(canvasStateProvider);
    final notifier = ref.read(canvasStateProvider.notifier);
    final isFullscreen = canvasState.isFullscreen;

    return Dialog(
      backgroundColor: const Color(0xFF2D2D3A),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16.r)),
      child: Container(
        width: 340.w,
        padding: EdgeInsets.all(24.w),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.tune, color: AppTheme.primaryOrange, size: 24.w),
                SizedBox(width: 8.w),
                Text('Workspace Settings', style: TextStyle(color: Colors.white, fontSize: 18.sp, fontWeight: FontWeight.bold)),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.white54),
                  onPressed: () => Navigator.pop(context),
                  visualDensity: VisualDensity.compact,
                ),
              ],
            ),
            SizedBox(height: 20.h),

            // Teaching Mode
            Container(
              padding: EdgeInsets.all(16.w),
              decoration: BoxDecoration(
                color: Colors.white10,
                borderRadius: BorderRadius.circular(12.r),
                border: Border.all(color: isFullscreen ? AppTheme.primaryOrange : Colors.transparent),
              ),
              child: Row(
                children: [
                  Icon(Icons.school_outlined, size: 28.w, color: isFullscreen ? AppTheme.primaryOrange : Colors.white70),
                  SizedBox(width: 16.w),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Teaching Mode', style: TextStyle(color: Colors.white, fontSize: 15.sp, fontWeight: FontWeight.w600)),
                        SizedBox(height: 2.h),
                        Text('Hide all UI chrome to maximize canvas area', style: TextStyle(color: Colors.white54, fontSize: 12.sp)),
                      ],
                    ),
                  ),
                  Switch(
                    value: isFullscreen,
                    activeThumbColor: AppTheme.primaryOrange,
                    onChanged: (v) {
                      notifier.toggleFullscreen();
                      if (v) Navigator.pop(context); // Close dialog if enabled Teaching mode
                    },
                  ),
                ],
              ),
            ),
            SizedBox(height: 16.h),

            // Open Theme Settings Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.pop(context);
                  // TODO: Implement QuestionThemeDialog or use another settings UI
                },
                icon: const Icon(Icons.palette_outlined, color: Colors.white),
                label: const Text('Question & Background Colors'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white10,
                  foregroundColor: Colors.white,
                  padding: EdgeInsets.symmetric(vertical: 14.h),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
                ),
              ),
            ),
            SizedBox(height: 24.h),

            Text('Workspace Settings', style: TextStyle(color: Colors.white70, fontSize: 14.sp, fontWeight: FontWeight.w600)),
            SizedBox(height: 12.h),
            Text(
              'Auto-hide toolbar after 5 seconds of inactivity.',
              style: TextStyle(color: Colors.white54, fontSize: 13.sp),
            ),
          ],
        ),
      ),
    );
  }
}
