import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../../../core/theme/app_theme.dart';
import '../../providers/tool_provider.dart';
import '../../../domain/services/pdf_import_service.dart';
import '../../providers/canvas_provider.dart';

// ─── Tool entry (not const to avoid compile issues with records) ──────────────
class _ToolEntry {
  final Tool tool;
  final IconData icon;
  final String label;
  final bool isPremium;
  const _ToolEntry(this.tool, this.icon, this.label, {this.isPremium = false});
}

// ─── Tool Categories ──────────────────────────────────────────────────────────
enum ToolCategory { draw, shapes, objects, measure, insert, edit }

// ─── Full Tool Library (PRD-07 v2.0, 6 Tabs) ─────────────────────────────────
final Map<ToolCategory, List<_ToolEntry>> _allTools = {
  ToolCategory.draw: [
    const _ToolEntry(Tool.softPen, Icons.edit_outlined, 'Soft Pen'),
    const _ToolEntry(Tool.hardPen, Icons.edit, 'Hard Pen'),
    const _ToolEntry(Tool.highlighter, Icons.highlight_outlined, 'Highlighter'),
    const _ToolEntry(Tool.chalk, Icons.draw_outlined, 'Chalk'),
    const _ToolEntry(Tool.calligraphy, Icons.brush_outlined, 'Calligraphy'),
    const _ToolEntry(Tool.spray, Icons.blur_on_outlined, 'Spray'),
    const _ToolEntry(Tool.laserPointer, Icons.local_fire_department_outlined, 'Laser'),
    const _ToolEntry(Tool.softEraser, Icons.auto_fix_normal_outlined, 'Soft Eraser'),
    const _ToolEntry(Tool.hardEraser, Icons.auto_fix_high_outlined, 'Hard Eraser'),
  ],
  ToolCategory.shapes: [
    const _ToolEntry(Tool.line, Icons.horizontal_rule_rounded, 'Line'),
    const _ToolEntry(Tool.arrow, Icons.arrow_forward_rounded, 'Arrow'),
    const _ToolEntry(Tool.doubleArrow, Icons.compare_arrows_rounded, 'Double Arrow'),
    const _ToolEntry(Tool.rectangle, Icons.crop_square_outlined, 'Rectangle'),
    const _ToolEntry(Tool.roundedRect, Icons.rounded_corner_outlined, 'Rounded Rect'),
    const _ToolEntry(Tool.circle, Icons.circle_outlined, 'Circle'),
    const _ToolEntry(Tool.triangle, Icons.change_history_outlined, 'Triangle'),
    const _ToolEntry(Tool.star, Icons.star_border_outlined, 'Star'),
    const _ToolEntry(Tool.polygon, Icons.hexagon_outlined, 'Polygon'),
    const _ToolEntry(Tool.callout, Icons.chat_bubble_outline_rounded, 'Callout'),
  ],
  ToolCategory.objects: [
    const _ToolEntry(Tool.textBox, Icons.text_fields_outlined, 'Text Box'),
    const _ToolEntry(Tool.stickyNote, Icons.sticky_note_2_outlined, 'Sticky Note'),
  ],
  ToolCategory.measure: [
    const _ToolEntry(Tool.navigate, Icons.navigation_outlined, 'Navigate'),
  ],
  ToolCategory.insert: [
    const _ToolEntry(Tool.magicPen, Icons.auto_awesome_outlined, 'Magic Pen'),
  ],
  ToolCategory.edit: [
    const _ToolEntry(Tool.select, Icons.highlight_alt_outlined, 'Select'),
    const _ToolEntry(Tool.navigate, Icons.pan_tool_outlined, 'Pan'),
  ],
};

const _tabLabels = ['Free-form', 'Shape', 'Review', 'Measure ★', 'Insert', 'Select'];
const _tabCategories = [
  ToolCategory.draw,
  ToolCategory.shapes,
  ToolCategory.objects,
  ToolCategory.measure,
  ToolCategory.insert,
  ToolCategory.edit,
];
const _tabColors = [
  AppTheme.drawColor,
  AppTheme.shapeColor,
  AppTheme.textColor,
  AppTheme.measureColor,
  Color(0xFFF39C12),
  AppTheme.navColor,
];

class ToolPickerPanel extends ConsumerStatefulWidget {
  const ToolPickerPanel({super.key});

  @override
  ConsumerState<ToolPickerPanel> createState() => _ToolPickerPanelState();
}

class _ToolPickerPanelState extends ConsumerState<ToolPickerPanel>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 6, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final toolState = ref.watch(toolNotifierProvider);
    final notifier = ref.read(toolNotifierProvider.notifier);

    return Container(
      height: MediaQuery.of(context).size.height * 0.7,
      decoration: BoxDecoration(
        color: const Color(0xFF16162A),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24.r)),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Column(
        children: [
          // Handle
          Container(
            width: 40.w,
            height: 4.h,
            margin: EdgeInsets.only(top: 12.h),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(2.r),
            ),
          ),

          // Header
          Padding(
            padding: EdgeInsets.fromLTRB(16.w, 12.h, 16.w, 0),
            child: Row(
              children: [
                Text(
                  'Tool Library',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18.sp,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.white54),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),

          // Search bar
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
            child: TextField(
              onChanged: (v) => setState(() => _searchQuery = v.toLowerCase()),
              style: TextStyle(color: Colors.white, fontSize: 14.sp),
              decoration: InputDecoration(
                hintText: 'Search tools...',
                hintStyle: TextStyle(color: Colors.white38, fontSize: 14.sp),
                prefixIcon: const Icon(Icons.search, color: Colors.white38),
                filled: true,
                fillColor: Colors.white.withOpacity(0.07),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12.r),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),

          // Tabs
          TabBar(
            controller: _tabController,
            isScrollable: true,
            indicatorColor: AppTheme.primaryOrange,
            labelColor: AppTheme.primaryOrange,
            unselectedLabelColor: Colors.white38,
            labelStyle: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w600),
            tabs: List.generate(6, (i) => Tab(text: _tabLabels[i])),
          ),

          // Drag hint
          Padding(
            padding: EdgeInsets.symmetric(vertical: 6.h),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.push_pin_rounded, size: 12.sp, color: AppTheme.primaryOrange.withOpacity(0.7)),
                SizedBox(width: 4.w),
                Text(
                  'Long-press a tool to pin it to your toolbar',
                  style: TextStyle(color: Colors.white38, fontSize: 11.sp),
                ),
              ],
            ),
          ),

          // Tool grids
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: List.generate(6, (tabIdx) {
                final category = _tabCategories[tabIdx];
                final categoryColor = _tabColors[tabIdx];
                var tools = _allTools[category] ?? <_ToolEntry>[];

                if (_searchQuery.isNotEmpty) {
                  tools = tools
                      .where((t) => t.label.toLowerCase().contains(_searchQuery))
                      .toList();
                }

                return _ToolGrid(
                  tools: tools,
                  categoryColor: categoryColor,
                  favorites: toolState.pinnedTools,
                  onToolTap: (toolType) async {
                    notifier.selectTool(toolType);
                    Navigator.pop(context);
                  },
                  onLongPress: (toolType) {
                    notifier.setPinnedTools([...toolState.pinnedTools, toolType]);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Tool pinned to Favorites!'),
                        duration: Duration(seconds: 1),
                        backgroundColor: AppTheme.primaryOrange,
                      ),
                    );
                  },
                );
              }),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Tool Grid ────────────────────────────────────────────────────────────────
class _ToolGrid extends StatelessWidget {
  final List<_ToolEntry> tools;
  final Color categoryColor;
  final List<Tool> favorites;
  final void Function(Tool) onToolTap;
  final void Function(Tool) onLongPress;

  const _ToolGrid({
    required this.tools,
    required this.categoryColor,
    required this.favorites,
    required this.onToolTap,
    required this.onLongPress,
  });

  @override
  Widget build(BuildContext context) {
    if (tools.isEmpty) {
      return Center(
        child: Text('No tools found',
            style: TextStyle(color: Colors.white38, fontSize: 14.sp)),
      );
    }

    return GridView.builder(
      padding: EdgeInsets.all(16.w),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        childAspectRatio: 0.85,
        crossAxisSpacing: 10.w,
        mainAxisSpacing: 10.h,
      ),
      itemCount: tools.length,
      itemBuilder: (_, idx) {
        final tool = tools[idx];
        final isFavorited = favorites.contains(tool.tool);

        return GestureDetector(
          onTap: () => onToolTap(tool.tool),
          onLongPress: () => onLongPress(tool.tool),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.06),
              borderRadius: BorderRadius.circular(14.r),
              border: isFavorited
                  ? Border.all(color: categoryColor.withOpacity(0.6))
                  : null,
            ),
            child: Stack(
              children: [
                Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 40.w,
                        height: 40.h,
                        decoration: BoxDecoration(
                          color: categoryColor.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(12.r),
                        ),
                        child: Icon(tool.icon, size: 22.sp, color: categoryColor),
                      ),
                      SizedBox(height: 6.h),
                      Text(
                        tool.label,
                        style: TextStyle(
                          color: Colors.white70,
                          fontSize: 10.sp,
                          fontWeight: FontWeight.w500,
                        ),
                        textAlign: TextAlign.center,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),

                // Premium badge
                if (tool.isPremium)
                  Positioned(
                    top: 4.h,
                    right: 4.w,
                    child: Container(
                      padding: EdgeInsets.all(2.w),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFD700),
                        borderRadius: BorderRadius.circular(4.r),
                      ),
                      child: Icon(Icons.star_rounded, size: 8.sp, color: Colors.black87),
                    ),
                  ),

                // Favorited pin indicator
                if (isFavorited)
                  Positioned(
                    top: 4.h,
                    left: 4.w,
                    child: Icon(Icons.push_pin_rounded, size: 10.sp, color: categoryColor),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }
}
