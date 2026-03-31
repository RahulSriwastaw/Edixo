import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../../../core/theme/app_theme.dart';
import '../../../../drawing/domain/models/drawing_tool.dart';
import '../../../../drawing/providers/tool_provider.dart';
import '../../../providers/pdf_import_provider.dart';
import '../../../providers/canvas_provider.dart';

// ─── Tool entry (not const to avoid compile issues with records) ──────────────
class _ToolEntry {
  final ToolType toolType;
  final IconData icon;
  final String label;
  final bool isPremium;
  const _ToolEntry(this.toolType, this.icon, this.label, {this.isPremium = false});
}

// ─── Full Tool Library (PRD-07 v2.0, 6 Tabs) ─────────────────────────────────
final Map<ToolCategory, List<_ToolEntry>> _allTools = {
  ToolCategory.draw: [
    const _ToolEntry(ToolType.pen, Icons.edit_outlined, 'Pen'),
    const _ToolEntry(ToolType.highlighter, Icons.highlight_outlined, 'Highlighter'),
    const _ToolEntry(ToolType.marker, Icons.brush_outlined, 'Marker'),
    const _ToolEntry(ToolType.eraser, Icons.auto_fix_normal_outlined, 'Eraser'),
    const _ToolEntry(ToolType.laserPointer, Icons.local_fire_department_outlined, 'Laser'),
    const _ToolEntry(ToolType.pencil, Icons.create_outlined, 'Pencil'),
  ],
  ToolCategory.shapes: [
    const _ToolEntry(ToolType.shapes, Icons.horizontal_rule_rounded, 'Line'),
    const _ToolEntry(ToolType.shapes, Icons.arrow_forward_rounded, 'Arrow'),
    const _ToolEntry(ToolType.shapes, Icons.crop_square_outlined, 'Rectangle'),
    const _ToolEntry(ToolType.shapes, Icons.circle_outlined, 'Ellipse'),
    const _ToolEntry(ToolType.shapes, Icons.cloud_outlined, 'Cloud'),
    const _ToolEntry(ToolType.shapes, Icons.hexagon_outlined, 'Polygon'),
    _ToolEntry(ToolType.shapes, Icons.change_history_outlined, 'Triangle', isPremium: true),
    _ToolEntry(ToolType.shapes, Icons.chat_bubble_outline_rounded, 'Speech', isPremium: true),
  ],
  ToolCategory.objects: [
    const _ToolEntry(ToolType.text, Icons.text_fields_outlined, 'Text'),
    _ToolEntry(ToolType.stickyNote, Icons.sticky_note_2_outlined, 'Sticky', isPremium: true),
    const _ToolEntry(ToolType.text, Icons.format_underline_rounded, 'Underline'),
    const _ToolEntry(ToolType.text, Icons.strikethrough_s_rounded, 'Strikethrough'),
    const _ToolEntry(ToolType.text, Icons.highlight_outlined, 'Text Highlight'),
    _ToolEntry(ToolType.equation, Icons.functions_outlined, 'Equation', isPremium: true),
  ],
  ToolCategory.measure: [
    _ToolEntry(ToolType.ruler, Icons.straighten_outlined, 'Length', isPremium: true),
    _ToolEntry(ToolType.ruler, Icons.route_outlined, 'Polylength', isPremium: true),
    _ToolEntry(ToolType.ruler, Icons.crop_free_outlined, 'Rect Area', isPremium: true),
    _ToolEntry(ToolType.ruler, Icons.pentagon_outlined, 'Poly Area', isPremium: true),
    _ToolEntry(ToolType.ruler, Icons.settings_outlined, 'Calibrate', isPremium: true),
  ],
  ToolCategory.insert: [
    const _ToolEntry(ToolType.image, Icons.image_outlined, 'Image'),
    const _ToolEntry(ToolType.pdf, Icons.picture_as_pdf_outlined, 'PDF Page'),
    const _ToolEntry(ToolType.stickyNote, Icons.note_add_outlined, 'Note'),
    const _ToolEntry(ToolType.image, Icons.camera_alt_outlined, 'Camera'),
    const _ToolEntry(ToolType.ruler, Icons.bookmark_border_rounded, 'Bookmark'),
    _ToolEntry(ToolType.equation, Icons.functions_outlined, 'Equation', isPremium: true),
    const _ToolEntry(ToolType.image, Icons.grid_on_rounded, 'Grid'),
    _ToolEntry(ToolType.laserPointer, Icons.volume_up_outlined, 'Audio Note', isPremium: true),
  ],
  ToolCategory.edit: [
    const _ToolEntry(ToolType.lasso, Icons.highlight_alt_outlined, 'Lasso'),
    const _ToolEntry(ToolType.lasso, Icons.text_format_rounded, 'Text Select'),
    _ToolEntry(ToolType.lasso, Icons.select_all_rounded, 'Rect Select', isPremium: true),
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
    final drawingState = ref.watch(drawingStateProvider);
    final notifier = ref.read(drawingStateProvider.notifier);

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
                  favorites: drawingState.favorites,
                  onToolTap: (toolType) async {
                    if (toolType == ToolType.pdf) {
                      final pdfNotifier = ref.read(pdfImportProvider.notifier);
                      await pdfNotifier.pickPdf();
                      final pdfState = ref.read(pdfImportProvider);
                      if (pdfState.filePath != null || pdfState.fileBytes != null) {
                        // Batch render and import
                        final pages = await pdfNotifier.renderAllPages();
                        if (pages.isNotEmpty) {
                          ref.read(canvasStateProvider.notifier).importPdfPages(pages);
                        }
                      }
                      if (context.mounted) Navigator.pop(context);
                    } else {
                      notifier.selectTool(toolType);
                      Navigator.pop(context);
                    }
                  },
                  onLongPress: (toolType) {
                    notifier.toggleFavorite(toolType);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: const Text('Tool pinned to Favorites!'),
                        duration: const Duration(seconds: 1),
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
  final List<ToolType> favorites;
  final void Function(ToolType) onToolTap;
  final void Function(ToolType) onLongPress;

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
        final isFavorited = favorites.contains(tool.toolType);

        return GestureDetector(
          onTap: () => onToolTap(tool.toolType),
          onLongPress: () => onLongPress(tool.toolType),
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
