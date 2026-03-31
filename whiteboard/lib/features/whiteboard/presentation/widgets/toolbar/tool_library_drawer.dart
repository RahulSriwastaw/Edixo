import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../../core/theme/app_theme.dart';
import '../../providers/tool_provider.dart';

class ToolLibraryDrawer extends ConsumerWidget {
  const ToolLibraryDrawer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final toolState = ref.watch(toolProvider);
    final notifier = ref.read(toolProvider.notifier);

    return Drawer(
      width: 320.w, // Larger drawer for library
      child: Container(
        color: AppTheme.primaryDark,
        child: Column(
          children: [
            // 1. Header with Search (F-07.1)
            Padding(
              padding: EdgeInsets.fromLTRB(20.w, 50.h, 12.w, 16.h),
              child: Row(
                children: [
                   const Text('Tool Library', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                   const Spacer(),
                   IconButton(icon: const Icon(Icons.close, color: Colors.white60), onPressed: () => Navigator.pop(context)),
                ],
              ),
            ),
            
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 20.w),
              child: TextField(
                style: const TextStyle(color: Colors.white),
                decoration: InputDecoration(
                  hintText: 'Search tools...',
                  hintStyle: const TextStyle(color: Colors.white24),
                  prefixIcon: const Icon(Icons.search, color: Colors.white38),
                  filled: true,
                  fillColor: Colors.white.withOpacity(0.05),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12.r), borderSide: BorderSide.none),
                  contentPadding: EdgeInsets.zero,
                ),
              ),
            ),

            SizedBox(height: 20.h),

            // 2. Categories List
            Expanded(
              child: ListView(
                padding: EdgeInsets.symmetric(horizontal: 16.w),
                children: [
                  _CategorySection(
                    title: 'Writing',
                    tools: [
                      _ToolInfo(ToolType.softPen, 'Soft Pen', Icons.edit),
                      _ToolInfo(ToolType.hardPen, 'Hard Pen', Icons.brush),
                      _ToolInfo(ToolType.highlighter, 'Highlighter', Icons.highlight),
                      _ToolInfo(ToolType.chalk, 'Chalk', Icons.gesture),
                      _ToolInfo(ToolType.calligraphy, 'Calligraphy', Icons.history_edu),
                    ],
                    activeTool: toolState.activeTool,
                    onToolSelect: (t) => _onToolSelect(context, notifier, t),
                  ),
                  _CategorySection(
                    title: 'Erasing',
                    tools: [
                      _ToolInfo(ToolType.softEraser, 'Soft Eraser', Icons.auto_fix_normal),
                      _ToolInfo(ToolType.hardEraser, 'Hard Eraser', Icons.cleaning_services),
                      _ToolInfo(ToolType.objectEraser, 'Object Eraser', Icons.category),
                    ],
                    activeTool: toolState.activeTool,
                    onToolSelect: (t) => _onToolSelect(context, notifier, t),
                  ),
                  _CategorySection(
                    title: 'Shapes',
                    tools: [
                      _ToolInfo(ToolType.rectangle, 'Rectangle', Icons.rectangle_outlined),
                      _ToolInfo(ToolType.circle, 'Circle', Icons.circle_outlined),
                      _ToolInfo(ToolType.line, 'Line', Icons.horizontal_rule),
                      _ToolInfo(ToolType.arrow, 'Arrow', Icons.arrow_right_alt),
                    ],
                    activeTool: toolState.activeTool,
                    onToolSelect: (t) => _onToolSelect(context, notifier, t),
                  ),
                  _CategorySection(
                    title: 'Text',
                    tools: [
                      _ToolInfo(ToolType.textBox, 'Text Box', Icons.text_fields),
                      _ToolInfo(ToolType.stickyNote, 'Sticky Note', Icons.sticky_note_2_outlined),
                    ],
                    activeTool: toolState.activeTool,
                    onToolSelect: (t) => _onToolSelect(context, notifier, t),
                  ),
                  // 3. Subject Specific Section (PRD 14.2)
                  if (toolState.activeMode != SubjectMode.general)
                    _CategorySection(
                      title: '${toolState.activeMode.name.toUpperCase()} TOOLS',
                      tools: _getSubjectTools(toolState.activeMode),
                      activeTool: toolState.activeTool,
                      onToolSelect: (t) => _onToolSelect(context, notifier, t),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  List<_ToolInfo> _getSubjectTools(SubjectMode mode) {
    switch (mode) {
      case SubjectMode.math:
        return [
          _ToolInfo(ToolType.line, 'Ruler', Icons.straighten),
          _ToolInfo(ToolType.circle, 'Protractor', Icons.pie_chart_outline),
          _ToolInfo(ToolType.circle, 'Compass', Icons.architecture),
          _ToolInfo(ToolType.line, 'Plotter', Icons.show_chart),
        ];
      case SubjectMode.chemistry:
        return [
          _ToolInfo(ToolType.rectangle, 'Periodic Table', Icons.grid_view),
          _ToolInfo(ToolType.circle, 'Apparatus', Icons.biotech),
        ];
      case SubjectMode.physics:
        return [
          _ToolInfo(ToolType.line, 'Circuitry', Icons.electrical_services),
          _ToolInfo(ToolType.arrow, 'Vectors', Icons.trending_up),
        ];
      default:
        return [];
    }
  }

  void _onToolSelect(BuildContext context, ToolProvider notifier, ToolType tool) {
    notifier.selectTool(tool);
    Navigator.pop(context); // Close drawer on selection
  }
}

class _ToolInfo {
  final ToolType type;
  final String label;
  final IconData icon;
  _ToolInfo(this.type, this.label, this.icon);
}

class _CategorySection extends StatelessWidget {
  final String title;
  final List<_ToolInfo> tools;
  final ToolType activeTool;
  final Function(ToolType) onToolSelect;

  const _CategorySection({required this.title, required this.tools, required this.activeTool, required this.onToolSelect});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: EdgeInsets.symmetric(vertical: 12.h, horizontal: 4.w),
          child: Text(title.toUpperCase(), style: TextStyle(color: Colors.white38, fontSize: 11.sp, fontWeight: FontWeight.bold, letterSpacing: 1.2)),
        ),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 3,
            mainAxisSpacing: 12.h,
            crossAxisSpacing: 12.w,
            childAspectRatio: 0.9,
          ),
          itemCount: tools.length,
          itemBuilder: (context, i) {
            final tool = tools[i];
            final isActive = activeTool == tool.type;
            return InkWell(
              onTap: () => onToolSelect(tool.type),
              borderRadius: BorderRadius.circular(12.r),
              child: Container(
                decoration: BoxDecoration(
                  color: isActive ? AppTheme.primaryOrange.withOpacity(0.15) : Colors.white.withOpacity(0.02),
                  borderRadius: BorderRadius.circular(12.r),
                  border: Border.all(color: isActive ? AppTheme.primaryOrange : Colors.white10),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(tool.icon, color: isActive ? AppTheme.primaryOrange : Colors.white70, size: 24.w),
                    SizedBox(height: 6.h),
                    Text(tool.label, textAlign: TextAlign.center, style: TextStyle(color: isActive ? Colors.white : Colors.white60, fontSize: 10.sp)),
                  ],
                ),
              ),
            );
          },
        ),
        SizedBox(height: 12.h),
      ],
    );
  }
}
