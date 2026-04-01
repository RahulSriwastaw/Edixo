import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../../core/theme/app_theme.dart';
import '../../../providers/canvas_provider.dart';
import '../../../providers/tool_provider.dart';

// ─── Save State Provider ──────────────────────────────────────────────────────
final saveFlashProvider = StateProvider<bool>((ref) => false);

class TopToolbar extends ConsumerStatefulWidget {
  final String sessionName;
  final VoidCallback onMenu;
  final VoidCallback onImportSet;
  final VoidCallback onEndClass;

  const TopToolbar({
    super.key,
    required this.sessionName,
    required this.onMenu,
    required this.onImportSet,
    required this.onEndClass,
  });

  @override
  ConsumerState<TopToolbar> createState() => _TopToolbarState();
}

class _TopToolbarState extends ConsumerState<TopToolbar>
    with SingleTickerProviderStateMixin {
  late final AnimationController _saveAnim;
  late final Animation<double> _saveOpacity;
  bool _editingName = false;
  late TextEditingController _nameController;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.sessionName);
    _saveAnim = AnimationController(vsync: this, duration: const Duration(milliseconds: 600));
    _saveOpacity = Tween<double>(begin: 0, end: 1).animate(
        CurvedAnimation(parent: _saveAnim, curve: Curves.easeInOut));
  }

  @override
  Widget build(BuildContext context) {
    final canvasState = ref.watch(canvasStateProvider);

    // Flash save indicator when saved
    ref.listen(canvasStateProvider, (prev, next) {
      if (prev?.isDirty == true && !next.isDirty) {
        _triggerSaveFlash();
      }
    });

    return Container(
      height: 48.h, // PRD Section 6.1
      decoration: const BoxDecoration(
        color: AppTheme.primaryDark,
        border: Border(bottom: BorderSide(color: Colors.white12, width: 1)),
      ),
      child: Row(
        children: [
          // 1. Menu button (F-01.1.1)
          _toolbarButton(icon: Icons.menu, onTap: widget.onMenu, tooltip: 'Menu'),
          
          // 2. Set Title / Mode indicator
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 12.w),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _editingName
                    ? SizedBox(
                        width: 200.w,
                        child: TextField(
                          controller: _nameController,
                          autofocus: true,
                          style: TextStyle(color: Colors.white, fontSize: 13.sp),
                          decoration: const InputDecoration(border: InputBorder.none, isDense: true),
                          onSubmitted: (_) => setState(() => _editingName = false),
                        ),
                      )
                    : GestureDetector(
                        onTap: () => setState(() => _editingName = true),
                        child: Text(
                          _nameController.text,
                          style: TextStyle(color: Colors.white, fontSize: 14.sp, fontWeight: FontWeight.w600),
                        ),
                      ),
                SizedBox(width: 8.w),
                // Mode Indicator (PRD 6.1)
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 2.h),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryOrange.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(4.r),
                    border: Border.all(color: AppTheme.primaryOrange.withOpacity(0.3)),
                  ),
                  child: Text(
                    ref.watch(toolProvider.select((s) => s.activeMode.name.toUpperCase())),
                    style: TextStyle(
                      color: AppTheme.primaryOrange,
                      fontSize: 10.sp,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.5,
                    ),
                  ),
                ),
              ],
            ),
          ),

          SizedBox(width: 24.w),

          // Import Set button (PRD Section 15)
          ElevatedButton.icon(
            onPressed: widget.onImportSet,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryOrange.withOpacity(0.15),
              foregroundColor: AppTheme.primaryOrange,
              elevation: 0,
              padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 8.h),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6.r)),
            ),
            icon: Icon(Icons.cloud_download_rounded, size: 18.w),
            label: Text('Import Set / PDF', style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.bold)),
          ),

          SizedBox(width: 12.w),

          const Spacer(),

          // 3. Class Session Timer placeholder
          Container(
            padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 4.h),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(20.r),
            ),
            child: Row(
              children: [
                Icon(Icons.timer_outlined, color: Colors.white70, size: 16.w),
                SizedBox(width: 6.w),
                Text('00:00', style: TextStyle(color: Colors.white70, fontSize: 13.sp, fontWeight: FontWeight.w500)),
              ],
            ),
          ),

          SizedBox(width: 16.w),

          // 4. Offline badge placeholder
          Container(
            margin: EdgeInsets.only(right: 12.w),
            padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 3.h),
            decoration: BoxDecoration(
              color: Colors.grey.withOpacity(0.2),
              borderRadius: BorderRadius.circular(4.r),
            ),
            child: Text('OFFLINE', style: TextStyle(color: Colors.grey, fontSize: 10.sp, fontWeight: FontWeight.bold)),
          ),

          // 5. Save Status indicator
          FadeTransition(
            opacity: _saveOpacity,
            child: Icon(Icons.check_circle, color: AppTheme.successGreen, size: 18.w),
          ),
          if (canvasState.isDirty)
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 8.w),
              child: Container(
                width: 8.w, height: 8.w,
                decoration: const BoxDecoration(color: AppTheme.primaryOrange, shape: BoxShape.circle),
              ),
            ),

          SizedBox(width: 12.w),

          // 6. End Class button
          Padding(
            padding: EdgeInsets.only(right: 12.w),
            child: ElevatedButton(
              onPressed: widget.onEndClass,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.redAccent.withOpacity(0.2),
                foregroundColor: Colors.redAccent,
                elevation: 0,
                side: const BorderSide(color: Colors.redAccent, width: 0.5),
                padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
                minimumSize: Size.zero,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6.r)),
              ),
              child: Text('End Class', style: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.bold)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _toolbarButton({
    required IconData icon,
    required VoidCallback onTap,
    required String tooltip,
    Color color = Colors.white70,
  }) {
    return Tooltip(
      message: tooltip,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: 14.w),
          child: Icon(icon, color: color, size: 24.w),
        ),
      ),
    );
  }

  void _showImportMenu(BuildContext context, WidgetRef ref) {
    // Legacy - being removed from TopBar according to PRD
  }

  void _triggerSaveFlash() {
    _saveAnim.forward().then((_) => _saveAnim.reverse());
  }

  void _showExportMenu(BuildContext context, WidgetRef ref) {
    // Legacy - move to Menu
  }

  @override
  void dispose() {
    _saveAnim.dispose();
    _nameController.dispose();
    super.dispose();
  }
}

class _PremiumBadgeWrapper extends StatelessWidget {
  final Widget child;
  final bool isPremium;

  const _PremiumBadgeWrapper({required this.child, this.isPremium = false});

  @override
  Widget build(BuildContext context) {
    if (!isPremium) return child;
    return Stack(
      clipBehavior: Clip.none,
      children: [
        child,
        Positioned(
          top: 6.h,
          right: 6.w,
          child: Container(
            padding: EdgeInsets.all(2.w),
            decoration: const BoxDecoration(
              color: Color(0xFFFFD700),
              shape: BoxShape.circle,
              boxShadow: [BoxShadow(color: Colors.black45, blurRadius: 4, offset: Offset(0, 1))],
            ),
            child: Icon(Icons.star_rounded, color: Colors.white, size: 8.w),
          ),
        ),
      ],
    );
  }
}
