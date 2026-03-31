import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../../core/theme/app_theme.dart';
import '../../../providers/canvas_provider.dart';
import '../../../providers/tool_provider.dart';

class LeftSideToolbar extends ConsumerWidget {
  const LeftSideToolbar({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final canvasState = ref.watch(canvasStateProvider);
    final toolState = ref.watch(toolProvider);
    final toolNotifier = ref.read(toolProvider.notifier);
    final canvasNotifier = ref.read(canvasStateProvider.notifier);

    return Container(
      width: 56.w, 
      decoration: const BoxDecoration(
        color: Color(0xFF1E2235),
        border: Border(right: BorderSide(color: Colors.white12, width: 1)),
      ),
      child: Column(
        children: [
          SizedBox(height: 12.h),
          
          // Subject Mode Switcher (PRD 14.1)
          Expanded(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                _ModeButton(
                  mode: SubjectMode.general,
                  icon: Icons.dashboard_outlined,
                  activeMode: toolState.activeMode,
                  onTap: () => toolNotifier.setSubjectMode(SubjectMode.general),
                ),
                _ModeButton(
                  mode: SubjectMode.math,
                  icon: Icons.calculate_outlined,
                  activeMode: toolState.activeMode,
                  onTap: () => toolNotifier.setSubjectMode(SubjectMode.math),
                ),
                _ModeButton(
                  mode: SubjectMode.physics,
                  icon: Icons.bolt_outlined,
                  activeMode: toolState.activeMode,
                  onTap: () => toolNotifier.setSubjectMode(SubjectMode.physics),
                ),
                _ModeButton(
                  mode: SubjectMode.chemistry,
                  icon: Icons.science_outlined,
                  activeMode: toolState.activeMode,
                  onTap: () => toolNotifier.setSubjectMode(SubjectMode.chemistry),
                ),
                 _ModeButton(
                  mode: SubjectMode.englishHindi,
                  icon: Icons.translate_outlined,
                  activeMode: toolState.activeMode,
                  onTap: () => toolNotifier.setSubjectMode(SubjectMode.englishHindi),
                ),
                _ModeButton(
                  mode: SubjectMode.sscRailway,
                  icon: Icons.train_outlined,
                  activeMode: toolState.activeMode,
                  onTap: () => toolNotifier.setSubjectMode(SubjectMode.sscRailway),
                ),
                _ModeButton(
                  mode: SubjectMode.upsc,
                  icon: Icons.account_balance_outlined,
                  activeMode: toolState.activeMode,
                  onTap: () => toolNotifier.setSubjectMode(SubjectMode.upsc),
                ),

                _divider(),

                // Canvas Tools
                _SideIconButton(
                  icon: canvasState.showGrid ? Icons.grid_on : Icons.grid_off_outlined,
                  onTap: () => canvasNotifier.toggleGrid(),
                  tooltip: 'Toggle Grid',
                ),
              ],
            ),
          ),

          // Page Stack (F-01.1.2)
          _SideIconButton(
            icon: Icons.layers_outlined,
            label: '${canvasState.currentPageNumber}',
            onTap: () => Scaffold.of(context).openEndDrawer(), 
            tooltip: 'Page Manager',
            color: AppTheme.primaryOrange,
          ),

          SizedBox(height: 12.h),
        ],
      ),
    );
  }

  Widget _divider() => Container(
        width: 32.w,
        height: 1,
        margin: EdgeInsets.symmetric(vertical: 8.h, horizontal: 12.w),
        color: Colors.white12,
      );
}

class _ModeButton extends StatelessWidget {
  final SubjectMode mode;
  final IconData icon;
  final SubjectMode activeMode;
  final VoidCallback onTap;

  const _ModeButton({
    required this.mode,
    required this.icon,
    required this.activeMode,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isActive = mode == activeMode;
    final color = isActive ? AppTheme.primaryOrange : Colors.white60;

    return Tooltip(
      message: '${mode.name.toUpperCase()} Mode',
      child: InkWell(
        onTap: onTap,
        child: Container(
          width: 56.w,
          padding: EdgeInsets.symmetric(vertical: 12.h),
          decoration: BoxDecoration(
            border: Border(
              left: BorderSide(
                color: isActive ? AppTheme.primaryOrange : Colors.transparent,
                width: 3,
              ),
            ),
            color: isActive ? AppTheme.primaryOrange.withOpacity(0.05) : Colors.transparent,
          ),
          child: Icon(icon, color: color, size: 24.w),
        ),
      ),
    );
  }
}

class _SideIconButton extends StatelessWidget {
  final IconData icon;
  final String? label;
  final VoidCallback onTap;
  final String tooltip;
  final Color color;

  const _SideIconButton({required this.icon, this.label, required this.onTap, required this.tooltip, this.color = Colors.white70});

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: tooltip,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: EdgeInsets.symmetric(vertical: 12.h),
          child: Stack(
            alignment: Alignment.center,
            children: [
              Icon(icon, color: color, size: 26.w),
              if (label != null)
                Positioned(
                  bottom: -2,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 1),
                    decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(4)),
                    child: Text(label!, style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold)),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
