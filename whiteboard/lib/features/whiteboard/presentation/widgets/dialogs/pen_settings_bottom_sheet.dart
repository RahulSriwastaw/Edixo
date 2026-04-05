import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../providers/tool_provider.dart';

class PenSettingsBottomSheet extends ConsumerWidget {
  const PenSettingsBottomSheet({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final toolState = ref.watch(toolNotifierProvider);
    final notifier = ref.read(toolNotifierProvider.notifier);
    final tool = toolState.activeTool;
    final settings = toolState.settingsFor(tool);

    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: const BoxDecoration(
        color: Color(0xFF1E1E2C),
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
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
            value: settings.strokeWidth,
            min: 1,
            max: 50,
            onChanged: (val) => notifier.setStrokeWidth(val),
            unit: 'px',
          ),
          
          _settingRow(
            label: 'Opacity',
            value: settings.opacity * 100,
            min: 10,
            max: 100,
            onChanged: (val) => notifier.setOpacity(val / 100),
            unit: '%',
          ),
          
          if (tool == Tool.softPen || tool == Tool.hardPen)
            _settingRow(
              label: 'Smoothing',
              value: settings.smoothness * 10,
              min: 0,
              max: 20,
              onChanged: (val) => notifier.setSmoothness(val / 10),
              unit: '',
            ),
            
          SizedBox(height: 10.h),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _colorCircle(ref, Colors.white, settings.color == Colors.white),
              _colorCircle(ref, const Color(0xFFFF6B35), settings.color == const Color(0xFFFF6B35)),
              _colorCircle(ref, const Color(0xFF4ECDC4), settings.color == const Color(0xFF4ECDC4)),
              _colorCircle(ref, const Color(0xFFFFE66D), settings.color == const Color(0xFFFFE66D)),
              _colorCircle(ref, const Color(0xFFFF9F1C), settings.color == const Color(0xFFFF9F1C)),
            ],
          ),
          SizedBox(height: 20.h),
        ],
      ),
    );
  }

  String _getToolLabel(Tool tool) {
    if (tool == Tool.softPen) return 'Pen';
    if (tool == Tool.highlighter) return 'Highlighter';
    if (tool == Tool.softEraser || tool == Tool.hardEraser) return 'Eraser';
    return 'Tool';
  }

  Widget _settingRow({
    required String label,
    required double value,
    required double min,
    required double max,
    required Function(double) onChanged,
    required String unit,
  }) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 8.h),
      child: Row(
        children: [
          SizedBox(
            width: 80.w,
            child: Text(label, style: TextStyle(color: Colors.white70, fontSize: 14.sp)),
          ),
          Expanded(
            child: Slider(
              value: value,
              min: min,
              max: max,
              onChanged: onChanged,
              activeColor: const Color(0xFFFF6B35),
            ),
          ),
          SizedBox(
            width: 40.w,
            child: Text('${value.toInt()}$unit', style: TextStyle(color: Colors.white, fontSize: 14.sp)),
          ),
        ],
      ),
    );
  }

  Widget _colorCircle(WidgetRef ref, Color color, bool isSelected) {
    return InkWell(
      onTap: () => ref.read(toolNotifierProvider.notifier).setColor(color),
      child: Container(
        width: 32.w,
        height: 32.w,
        decoration: BoxDecoration(
          color: color,
          shape: BoxShape.circle,
          border: Border.all(
            color: isSelected ? Colors.white : Colors.transparent,
            width: 2,
          ),
          boxShadow: isSelected ? [BoxShadow(color: color.withValues(alpha: 0.5), blurRadius: 8)] : null,
        ),
      ),
    );
  }
}
