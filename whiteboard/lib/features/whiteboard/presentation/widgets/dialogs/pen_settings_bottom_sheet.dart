import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../../core/theme/app_theme.dart';
import '../../providers/tool_provider.dart';

class PenSettingsBottomSheet extends ConsumerWidget {
  final ToolType tool;

  const PenSettingsBottomSheet({super.key, required this.tool});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final toolState = ref.watch(toolProvider);
    final settings = toolState.toolSettings[tool] ?? const ToolSettings();
    final notifier = ref.read(toolProvider.notifier);

    return Container(
      padding: EdgeInsets.all(24.w),
      decoration: BoxDecoration(
        color: AppTheme.primaryDark,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20.r)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text(
                '${_getToolLabel(tool)} Settings',
                style: TextStyle(color: Colors.white, fontSize: 18.sp, fontWeight: FontWeight.bold),
              ),
              const Spacer(),
              IconButton(
                icon: const Icon(Icons.close, color: Colors.white60),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          SizedBox(height: 20.h),
          
          _settingRow(
            label: 'Thickness',
            value: settings.thickness,
            min: 1,
            max: 50,
            onChanged: (val) => notifier.updateSettings(tool, settings.copyWith(thickness: val)),
            unit: 'px',
          ),
          
          _settingRow(
            label: 'Opacity',
            value: settings.opacity * 100,
            min: 10,
            max: 100,
            onChanged: (val) => notifier.updateSettings(tool, settings.copyWith(opacity: val / 100)),
            unit: '%',
          ),

          _settingRow(
            label: 'Smoothness',
            value: settings.smoothing.decimationThreshold * 10, // Visual mapping
            min: 0,
            max: 50,
            onChanged: (val) => notifier.updateSettings(
              tool, 
              settings.copyWith(smoothing: settings.smoothing.copyWith(decimationThreshold: val / 10)),
            ),
            unit: '',
          ),

          SizedBox(height: 16.h),
          Text('Tip Style', style: TextStyle(color: Colors.white70, fontSize: 12.sp, fontWeight: FontWeight.w600)),
          SizedBox(height: 12.h),
          Row(
            children: [
              _tipOption(context, 'Round', Icons.circle, true),
              SizedBox(width: 12.w),
              _tipOption(context, 'Flat', Icons.horizontal_rule, false),
              SizedBox(width: 12.w),
              _tipOption(context, 'Brush', Icons.brush, false),
            ],
          ),
          SizedBox(height: 24.h),
        ],
      ),
    );
  }

  Widget _settingRow({
    required String label,
    required double value,
    required double min,
    required double max,
    required ValueChanged<double> onChanged,
    required String unit,
  }) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 12.h),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: TextStyle(color: Colors.white70, fontSize: 13.sp)),
              Text('${value.toInt()} $unit', style: TextStyle(color: AppTheme.primaryOrange, fontSize: 13.sp, fontWeight: FontWeight.bold)),
            ],
          ),
          SliderTheme(
            data: SliderThemeData(
              activeTrackColor: AppTheme.primaryOrange,
              inactiveTrackColor: Colors.white10,
              thumbColor: AppTheme.primaryOrange,
              overlayColor: AppTheme.primaryOrange.withOpacity(0.2),
              trackHeight: 4.h,
            ),
            child: Slider(
              value: value,
              min: min,
              max: max,
              onChanged: onChanged,
            ),
          ),
        ],
      ),
    );
  }

  Widget _tipOption(BuildContext context, String label, IconData icon, bool selected) {
    return Expanded(
      child: Container(
        padding: EdgeInsets.all(12.w),
        decoration: BoxDecoration(
          color: selected ? AppTheme.primaryOrange.withOpacity(0.15) : Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(10.r),
          border: Border.all(color: selected ? AppTheme.primaryOrange : Colors.transparent),
        ),
        child: Column(
          children: [
            Icon(icon, color: selected ? AppTheme.primaryOrange : Colors.white60, size: 20.w),
            SizedBox(height: 4.h),
            Text(label, style: TextStyle(color: selected ? Colors.white : Colors.white60, fontSize: 10.sp)),
          ],
        ),
      ),
    );
  }

  String _getToolLabel(ToolType tool) {
    final name = tool.name;
    return name[0].toUpperCase() + name.substring(1);
  }
}
