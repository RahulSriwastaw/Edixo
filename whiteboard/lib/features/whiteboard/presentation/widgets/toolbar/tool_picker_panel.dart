import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

import '../../providers/tool_provider.dart';
import '../../providers/tool_registry.dart';
import 'tool_settings_sheet.dart';
// ✅ BUG FIX: import new pen dialog
import '../../dialogs/pen_picker_dialog.dart';

// ─── Design Tokens ────────────────────────────────────────────────────────────
class _C {
  static const body          = Color(0xFF0F0F0F);
  static const sidebar       = Color(0xFF141414);
  static const card          = Color(0xFF1A1A1A);
  static const cardHov       = Color(0xFF202020);
  static const border        = Color(0xFF252525);
  static const divider       = Color(0xFF1E1E1E);
  static const accent        = Color(0xFFFF6B2B);
  static const accentHover   = Color(0xFFE55A1A);
  static const txtPri        = Color(0xFFEFEFEF);
  static const txtSec        = Color(0xFF888888);
  static const txtMut        = Color(0xFF555555);
  static const inputBg       = Color(0xFF1A1A1A);
  static const inputBor      = Color(0xFF2A2A2A);

  static const fontFamily    = 'Inter';
}

// Pen tools set — shared with bottom_main_toolbar
const _kPenTools = {
  Tool.softPen, Tool.hardPen, Tool.highlighter,
  Tool.chalk, Tool.calligraphy, Tool.spray,
};

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
    final notifier  = ref.read(toolNotifierProvider.notifier);
    final toolState = ref.watch(toolNotifierProvider);

    return Container(
      // 30% compact: was 0.72 height
      height: MediaQuery.of(context).size.height * 0.68,
      decoration: BoxDecoration(
        color: _C.sidebar,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
        border: Border.all(color: _C.border),
      ),
      child: Column(
        children: [
          // ── Drag handle ────────────────────────────────────────────────
          Container(
            width: 36,
            height: 3,
            margin: const EdgeInsets.only(top: 10, bottom: 4),
            decoration: BoxDecoration(
              color: _C.inputBor,
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // ── Header ─────────────────────────────────────────────────────
          Padding(
            // compact: was 16/10/0 → 12/8/0
            padding: const EdgeInsets.fromLTRB(14, 6, 10, 0),
            child: Row(
              children: [
                const Text(
                  'Choose New Tool',
                  style: TextStyle(
                    fontFamily: _C.fontFamily,
                    color: _C.txtPri,
                    fontSize: 16,      // was 18sp
                    fontWeight: FontWeight.w700,
                    height: 1.5,
                  ),
                ),
                const Spacer(),
                GestureDetector(
                  onTap: () => Navigator.pop(context),
                  child: Container(
                    width: 28,
                    height: 28,
                    decoration: BoxDecoration(
                      color: _C.card,
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: _C.border),
                    ),
                    child: const Icon(Icons.close, color: _C.txtSec, size: 15),
                  ),
                ),
              ],
            ),
          ),

          // ── Search ────────────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 8, 14, 6),
            child: TextField(
              onChanged: (v) => setState(() => _searchQuery = v.toLowerCase()),
              style: const TextStyle(
                fontFamily: _C.fontFamily,
                color: _C.txtPri,
                fontSize: 12,
                height: 1.5,
              ),
              decoration: InputDecoration(
                hintText: 'Search by name or category',
                hintStyle: const TextStyle(
                  fontFamily: _C.fontFamily,
                  color: _C.txtMut,
                  fontSize: 12,
                  height: 1.5,
                ),
                prefixIcon: const Icon(Icons.search, color: _C.txtMut, size: 16),
                filled: true,
                fillColor: _C.inputBg,
                contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(color: _C.inputBor),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(color: _C.inputBor),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(color: _C.accent),
                ),
              ),
            ),
          ),

          // ── Tabs ──────────────────────────────────────────────────────
          TabBar(
            controller: _tabController,
            isScrollable: true,
            indicatorColor: _C.accent,
            indicatorWeight: 2,
            labelColor: _C.accent,
            unselectedLabelColor: _C.txtMut,
            labelStyle: const TextStyle(
              fontFamily: _C.fontFamily,
              fontSize: 11,             // was 12sp
              fontWeight: FontWeight.w600,
              height: 1.5,
              letterSpacing: 0.4,
            ),
            unselectedLabelStyle: const TextStyle(
              fontFamily: _C.fontFamily,
              fontSize: 11,
              fontWeight: FontWeight.w400,
              height: 1.5,
            ),
            tabs: [
              for (final category in _tabOrder)
                Tab(text: categoryTitleMap[category] ?? category.name),
            ],
          ),

          // ── Hint row ──────────────────────────────────────────────────
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 5, horizontal: 14),
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: _C.divider)),
            ),
            child: const Text(
              'Tap · activate   Double-tap · settings   + · pin to toolbar',
              style: TextStyle(
                fontFamily: _C.fontFamily,
                color: _C.txtMut,
                fontSize: 10,
                height: 1.5,
              ),
            ),
          ),

          // ── Tool grid tabs ────────────────────────────────────────────
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
                            style: const TextStyle(
                              fontFamily: _C.fontFamily,
                              fontSize: 12,
                              color: _C.txtPri,
                            ),
                          ),
                          duration: const Duration(seconds: 1),
                          backgroundColor: _C.card,
                          behavior: SnackBarBehavior.floating,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                            side: const BorderSide(color: _C.border),
                          ),
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

  /// ✅ BUG FIX: pen tools → PenPickerDialog, others → old sheet
  void _openQuickSettings(BuildContext context, WidgetRef ref, Tool tool) {
    if (_kPenTools.contains(tool)) {
      showDialog(
        context: context,
        barrierColor: Colors.transparent,
        barrierDismissible: true,
        builder: (_) => const PenPickerDialog(),
      );
    } else {
      showToolSettingsSheet(context, ref, tool);
    }
  }
}

// ── Tool Grid ─────────────────────────────────────────────────────────────────

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
      return const Center(
        child: Text(
          'No tools found',
          style: TextStyle(
            fontFamily: _C.fontFamily,
            color: _C.txtMut,
            fontSize: 13,
            height: 1.5,
          ),
        ),
      );
    }

    return GridView.builder(
      // compact: was 16 → 12px padding, 10 → 8 spacing
      padding: const EdgeInsets.all(12),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        childAspectRatio: 0.88,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
      ),
      itemCount: entries.length,
      itemBuilder: (_, idx) {
        final entry    = entries[idx];
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

// ── Tool Card ─────────────────────────────────────────────────────────────────

class _ToolCard extends StatefulWidget {
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
  State<_ToolCard> createState() => _ToolCardState();
}

class _ToolCardState extends State<_ToolCard> {
  bool _hovered = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _hovered = true),
      onExit:  (_) => setState(() => _hovered = false),
      child: Stack(
        children: [
          AnimatedContainer(
            duration: const Duration(milliseconds: 130),
            curve: Curves.easeOut,
            width: widget.compact ? 80 : null,
            decoration: BoxDecoration(
              color: widget.selected
                  ? _C.accent.withValues(alpha: 0.15)
                  : _hovered
                      ? _C.cardHov
                      : _C.card,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: widget.isPinned
                    ? _C.accent
                    : widget.selected
                        ? _C.accent.withValues(alpha: 0.7)
                        : _hovered
                            ? _C.border
                            : const Color(0xFF1E1E1E),
                width: widget.isPinned ? 1.5 : 1.0,
              ),
              // Hover shadow only
              boxShadow: _hovered
                  ? const [
                      BoxShadow(
                        color: Color(0x59000000),
                        blurRadius: 8,
                        offset: Offset(0, 2),
                      ),
                    ]
                  : null,
            ),
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Icon circle — compact: was 40 → 34
                  Container(
                    width: 34,
                    height: 34,
                    decoration: BoxDecoration(
                      color: _C.accent.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      widget.entry.icon,
                      size: 18,
                      color: widget.selected ? _C.accent : _C.txtSec,
                    ),
                  ),
                  const SizedBox(height: 5),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    child: Text(
                      widget.entry.name,
                      style: TextStyle(
                        fontFamily: _C.fontFamily,
                        color: widget.selected ? _C.txtPri : _C.txtSec,
                        fontSize: 10,
                        fontWeight: widget.selected
                            ? FontWeight.w600
                            : FontWeight.w400,
                        height: 1.5,
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

          // Pin badge
          if (!widget.compact && widget.onTogglePin != null)
            Positioned(
              top: 4,
              right: 4,
              child: GestureDetector(
                onTap: widget.onTogglePin,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 130),
                  width: 18,
                  height: 18,
                  decoration: BoxDecoration(
                    color: widget.isPinned
                        ? _C.accent
                        : _C.inputBor,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    widget.isPinned ? Icons.push_pin : Icons.add,
                    size: 10,
                    color: widget.isPinned ? Colors.white : _C.txtMut,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}