import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../../core/theme/app_theme.dart';
import '../../../../drawing/providers/tool_provider.dart';

class WorkspaceSettingsDialog extends ConsumerWidget {
  const WorkspaceSettingsDialog({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final drawingState = ref.watch(drawingStateProvider);
    final notifier = ref.read(drawingStateProvider.notifier);

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
                border: Border.all(color: drawingState.isTeachingMode ? AppTheme.primaryOrange : Colors.transparent),
              ),
              child: Row(
                children: [
                  Icon(Icons.school_outlined, size: 28.w, color: drawingState.isTeachingMode ? AppTheme.primaryOrange : Colors.white70),
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
                    value: drawingState.isTeachingMode,
                    activeColor: AppTheme.primaryOrange,
                    onChanged: (v) {
                      notifier.toggleTeachingMode();
                      if (v) Navigator.pop(context); // Close dialog if enabled Teaching mode
                    },
                  ),
                ],
              ),
            ),
            SizedBox(height: 24.h),

            Text('Favorites Bar Auto-Hide', style: TextStyle(color: Colors.white70, fontSize: 14.sp, fontWeight: FontWeight.w600)),
            SizedBox(height: 12.h),

            // Delay Dropdown
            Row(
              children: [
                Text('Inactivity Delay', style: TextStyle(color: Colors.white, fontSize: 14.sp)),
                const Spacer(),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 12.w),
                  decoration: BoxDecoration(
                    color: Colors.white12,
                    borderRadius: BorderRadius.circular(8.r),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<AutoHideDelay>(
                      value: drawingState.autoHideDelay,
                      dropdownColor: const Color(0xFF1E2235),
                      icon: const Icon(Icons.arrow_drop_down, color: Colors.white70),
                      style: TextStyle(color: Colors.white, fontSize: 14.sp),
                      items: const [
                        DropdownMenuItem(value: AutoHideDelay.short2s, child: Text('2 Seconds')),
                        DropdownMenuItem(value: AutoHideDelay.normal3s, child: Text('3 Seconds')),
                        DropdownMenuItem(value: AutoHideDelay.long5s, child: Text('5 Seconds')),
                        DropdownMenuItem(value: AutoHideDelay.never, child: Text('Never')),
                      ],
                      onChanged: (val) {
                        if (val != null) notifier.setAutoHideDelay(val);
                      },
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(height: 16.h),

            // Style Dropdown
            Row(
              children: [
                Text('Hide Style', style: TextStyle(color: Colors.white, fontSize: 14.sp)),
                const Spacer(),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 12.w),
                  decoration: BoxDecoration(
                    color: Colors.white12,
                    borderRadius: BorderRadius.circular(8.r),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<AutoHideStyle>(
                      value: drawingState.autoHideStyle,
                      dropdownColor: const Color(0xFF1E2235),
                      icon: const Icon(Icons.arrow_drop_down, color: Colors.white70),
                      style: TextStyle(color: Colors.white, fontSize: 14.sp),
                      items: const [
                        DropdownMenuItem(value: AutoHideStyle.fade, child: Text('Fade (15%)')),
                        DropdownMenuItem(value: AutoHideStyle.collapse, child: Text('Collapse (Hide)')),
                      ],
                      onChanged: (val) {
                        if (val != null) notifier.setAutoHideStyle(val);
                      },
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
