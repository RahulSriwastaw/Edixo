import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../../../../core/theme/app_theme.dart';
import '../../providers/tool_provider.dart';
import '../../providers/tool_registry.dart';
import 'tool_settings_sheet.dart';

class ToolPickerPanel extends ConsumerStatefulWidget {
  const ToolPickerPanel({super.key});

  @override
  ConsumerState<ToolPickerPanel> createState() => _ToolPickerPanelState();
}

class _ToolPickerPanelState extends ConsumerState<ToolPickerPanel>
    with SingleTickerProviderStateMixin {
  late final TabController _tabController;
  String _searchQuery = '';

  static const _tabOrder = [
    ToolLibraryCategory.freeForm,
    ToolLibraryCategory.shape,
    ToolLibraryCategory.review,
    ToolLibraryCategory.measure,
    ToolLibraryCategory.insert,
    ToolLibraryCategory.select,
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabOrder.length, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final notifier = ref.read(toolNotifierProvider.notifier);
    final toolState = ref.watch(toolNotifierProvider);

    return Container(
      height: MediaQuery.of(context).size.height * 0.72,
      decoration: BoxDecoration(
        color: const Color(0xFF151528),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24.r)),
        border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
      ),
      child: Column(
        children: [
          Container(
            width: 42.w,
            height: 4.h,
            margin: EdgeInsets.only(top: 12.h),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.22),
              borderRadius: BorderRadius.circular(2.r),
            ),
          ),
          Padding(
            padding: EdgeInsets.fromLTRB(16.w, 10.h, 10.w, 0),
            child: Row(
              children: [
                Text(
                  'Choose New Tool',
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
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
            child: TextField(
              onChanged: (v) => setState(() => _searchQuery = v.toLowerCase()),
              style: TextStyle(color: Colors.white, fontSize: 14.sp),
              decoration: InputDecoration(
                hintText: 'Search by name or category',
                hintStyle: TextStyle(color: Colors.white38, fontSize: 14.sp),
                prefixIcon: const Icon(Icons.search, color: Colors.white38),
                filled: true,
                fillColor: Colors.white.withValues(alpha: 0.08),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12.r),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),
          TabBar(
            controller: _tabController,
            isScrollable: true,
            indicatorColor: AppTheme.primaryOrange,
            labelColor: AppTheme.primaryOrange,
            unselectedLabelColor: Colors.white38,
            labelStyle: TextStyle(fontSize: 12.sp, fontWeight: FontWeight.w600),
            tabs: [
              for (final category in _tabOrder)
                Tab(text: categoryTitleMap[category] ?? category.name),
            ],
          ),
          Padding(
            padding: EdgeInsets.only(top: 6.h, bottom: 2.h),
            child: Text(
              'Tap to activate  -  Double-tap settings  -  + to pin to toolbar',
              style: TextStyle(color: Colors.white38, fontSize: 11.sp),
            ),
          ),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                for (final category in _tabOrder)
                  _ToolGrid(
                    entries: _filteredEntries(category, toolState.enabledTools),
                    activeTool: toolState.activeTool,
                    toolbarTools: toolState.toolbarTools.toSet(),
                    onTap: (tool) {
                      notifier.selectTool(tool);
                      Navigator.pop(context);
                    },
                    onDoubleTap: (tool) {
                      notifier.selectTool(tool);
                      _openQuickSettings(context, ref, tool);
                    },
                    onAddToToolbar: (tool) {
                      notifier.addToolToToolbar(tool);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text(
                            '${toolRegistryByTool[tool]?.name ?? tool.name} added to toolbar',
                          ),
                          duration: const Duration(seconds: 1),
                          backgroundColor: const Color(0xFF2A2A44),
                        ),
                      );
                    },
                    onRemoveFromToolbar: (tool) {
                      notifier.removeToolFromToolbar(tool);
                    },
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  List<ToolDefinition> _filteredEntries(
      ToolLibraryCategory category, Set<Tool> enabledTools) {
    final entries = toolRegistry
        .where((e) => e.category == category && enabledTools.contains(e.tool))
        .toList();
    if (_searchQuery.isEmpty) return entries;
    return entries.where((entry) {
      final categoryName =
          (categoryTitleMap[entry.category] ?? entry.category.name)
              .toLowerCase();
      return entry.name.toLowerCase().contains(_searchQuery) ||
          categoryName.contains(_searchQuery);
    }).toList();
  }

  void _openQuickSettings(BuildContext context, WidgetRef ref, Tool tool) {
    showToolSettingsSheet(context, ref, tool);
  }
}

class _ToolGrid extends StatelessWidget {
  final List<ToolDefinition> entries;
  final Tool activeTool;
  final Set<Tool> toolbarTools;
  final ValueChanged<Tool> onTap;
  final ValueChanged<Tool> onDoubleTap;
  final ValueChanged<Tool> onAddToToolbar;
  final ValueChanged<Tool> onRemoveFromToolbar;

  const _ToolGrid({
    required this.entries,
    required this.activeTool,
    required this.toolbarTools,
    required this.onTap,
    required this.onDoubleTap,
    required this.onAddToToolbar,
    required this.onRemoveFromToolbar,
  });

  @override
  Widget build(BuildContext context) {
    if (entries.isEmpty) {
      return Center(
        child: Text(
          'No tools found',
          style: TextStyle(color: Colors.white38, fontSize: 14.sp),
        ),
      );
    }

    return GridView.builder(
      padding: EdgeInsets.all(16.w),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        childAspectRatio: 0.86,
        crossAxisSpacing: 10.w,
        mainAxisSpacing: 10.h,
      ),
      itemCount: entries.length,
      itemBuilder: (_, idx) {
        final entry = entries[idx];
        final selected = activeTool == entry.tool;
        final isPinned = toolbarTools.contains(entry.tool);

        return LongPressDraggable<Tool>(
          data: entry.tool,
          feedback: Material(
            color: Colors.transparent,
            child: _ToolCard(
              entry: entry,
              selected: true,
              compact: true,
              isPinned: isPinned,
            ),
          ),
          childWhenDragging: Opacity(
            opacity: 0.35,
            child: _ToolCard(
              entry: entry,
              selected: selected,
              isPinned: isPinned,
            ),
          ),
          child: GestureDetector(
            onTap: () => onTap(entry.tool),
            onDoubleTap: () => onDoubleTap(entry.tool),
            child: _ToolCard(
              entry: entry,
              selected: selected,
              isPinned: isPinned,
              onTogglePin: () => isPinned
                  ? onRemoveFromToolbar(entry.tool)
                  : onAddToToolbar(entry.tool),
            ),
          ),
        );
      },
    );
  }
}

class _ToolCard extends StatelessWidget {
  final ToolDefinition entry;
  final bool selected;
  final bool compact;
  final bool isPinned;
  final VoidCallback? onTogglePin;

  const _ToolCard({
    required this.entry,
    required this.selected,
    this.compact = false,
    this.isPinned = false,
    this.onTogglePin,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          width: compact ? 84.w : null,
          decoration: BoxDecoration(
            color: selected
                ? AppTheme.primaryOrange.withValues(alpha: 0.18)
                : Colors.white.withValues(alpha: 0.06),
            borderRadius: BorderRadius.circular(14.r),
            border: Border.all(
              color: isPinned
                  ? AppTheme.primaryOrange.withValues(alpha: 0.9)
                  : selected
                      ? AppTheme.primaryOrange.withValues(alpha: 0.7)
                      : Colors.white.withValues(alpha: 0.06),
              width: isPinned ? 1.5 : 1.0,
            ),
          ),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 40.w,
                  height: 40.h,
                  decoration: BoxDecoration(
                    color: AppTheme.primaryOrange.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(12.r),
                  ),
                  child: Icon(
                    entry.icon,
                    size: 22.sp,
                    color: AppTheme.primaryOrange,
                  ),
                ),
                SizedBox(height: 6.h),
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 4.w),
                  child: Text(
                    entry.name,
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 10.sp,
                      fontWeight: FontWeight.w500,
                    ),
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
          ),
        ),
        if (!compact && onTogglePin != null)
          Positioned(
            top: 4.h,
            right: 4.w,
            child: GestureDetector(
              onTap: onTogglePin,
              child: Container(
                width: 20.w,
                height: 20.h,
                decoration: BoxDecoration(
                  color: isPinned
                      ? AppTheme.primaryOrange
                      : Colors.white.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  isPinned ? Icons.push_pin : Icons.add,
                  size: 11.sp,
                  color: Colors.white,
                ),
              ),
            ),
          ),
      ],
    );
  }
}