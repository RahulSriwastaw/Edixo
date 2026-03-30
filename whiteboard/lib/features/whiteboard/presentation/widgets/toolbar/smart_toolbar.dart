import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../../core/theme/app_theme.dart';
import '../../../../drawing/domain/models/drawing_tool.dart';
import '../../../../drawing/providers/tool_provider.dart';
import '../../../providers/canvas_provider.dart';
import 'tool_picker_panel.dart';

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const _kBg         = Color(0xFF12121F);
const _kSurface    = Color(0xFF1E1E30);
const _kBorder     = Color(0x1AFFFFFF);
const _kOrange     = Color(0xFFF4511E);
const _kGray       = Color(0xFF7A7A9A);
const _kToolbarH   = 52.0;   // ← compact height
const _kBtnSize    = 36.0;   // ← compact button size
const _kIconSize   = 17.0;
const _kRadius     = 26.0;

// ─── Default tools shown when favorites is empty ───────────────────────────────
const _kDefaultTools = <ToolType>[
  ToolType.pen,
  ToolType.highlighter,
  ToolType.eraser,
  ToolType.shapes,
  ToolType.text,
];

// ─── Icon & Label map for every ToolType ──────────────────────────────────────
const Map<ToolType, IconData> _toolIcons = {
  ToolType.pen:         Icons.edit_outlined,
  ToolType.pencil:      Icons.create_outlined,
  ToolType.ballpoint:   Icons.radio_button_unchecked,
  ToolType.highlighter: Icons.highlight_outlined,
  ToolType.marker:      Icons.brush_outlined,
  ToolType.laserPointer:Icons.local_fire_department_outlined,
  ToolType.eraser:      Icons.auto_fix_normal_outlined,
  ToolType.lasso:       Icons.highlight_alt_outlined,
  ToolType.shapes:      Icons.crop_square_outlined,
  ToolType.text:        Icons.text_fields_outlined,
  ToolType.stickyNote:  Icons.sticky_note_2_outlined,
  ToolType.equation:    Icons.functions_outlined,
  ToolType.image:       Icons.image_outlined,
  ToolType.pdf:         Icons.picture_as_pdf_outlined,
  ToolType.ruler:       Icons.straighten_outlined,
  ToolType.protractor:  Icons.architecture_outlined,
};

const Map<ToolType, String> _toolLabels = {
  ToolType.pen:         'Pen',
  ToolType.pencil:      'Pencil',
  ToolType.ballpoint:   'Ball',
  ToolType.highlighter: 'Hlt',
  ToolType.marker:      'Marker',
  ToolType.laserPointer:'Laser',
  ToolType.eraser:      'Erase',
  ToolType.lasso:       'Lasso',
  ToolType.shapes:      'Shape',
  ToolType.text:        'Text',
  ToolType.stickyNote:  'Note',
  ToolType.equation:    'Eq',
  ToolType.image:       'Image',
  ToolType.pdf:         'PDF',
  ToolType.ruler:       'Ruler',
  ToolType.protractor:  'Angle',
};

// ─── Smart Toolbar ─────────────────────────────────────────────────────────────
class SmartToolbar extends ConsumerStatefulWidget {
  const SmartToolbar({super.key});

  @override
  ConsumerState<SmartToolbar> createState() => _SmartToolbarState();
}

class _SmartToolbarState extends ConsumerState<SmartToolbar>
    with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double> _slideAnim;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 240),
    );
    _slideAnim = CurvedAnimation(parent: _ctrl, curve: Curves.easeOutCubic);
    _ctrl.forward();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  void _openToolLibrary() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      barrierColor: Colors.black54,
      builder: (_) => const ToolPickerPanel(),
    );
  }

  void _showColorPicker() {
    final notifier = ref.read(drawingStateProvider.notifier);
    final current  = ref.read(drawingStateProvider).currentSettings.color;
    const colors   = [
      Colors.black, Colors.white, _kOrange,
      Color(0xFF4A90D9), Color(0xFF10B981),
      Color(0xFFFFD600), Color(0xFFE74C3C),
      Color(0xFF9B59B6), Color(0xFF795548),
    ];
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (_) => _ColorSheet(
        colors:   colors,
        current:  current,
        onPick:   (c) { notifier.setColor(c); Navigator.pop(context); },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final drawing  = ref.watch(drawingStateProvider);
    final canvas   = ref.watch(canvasStateProvider);
    final cN       = ref.read(canvasStateProvider.notifier);
    final dN       = ref.read(drawingStateProvider.notifier);

    // Use favorites if pinned, else fall back to defaults
    final pinned = drawing.favorites.isEmpty ? _kDefaultTools : drawing.favorites;
    final active = drawing.activeTool;
    final color  = drawing.currentSettings.color;
    final canUndo = canvas.undoHistory.isNotEmpty;
    final canRedo = canvas.redoHistory.isNotEmpty;

    return SlideTransition(
      position: Tween<Offset>(begin: const Offset(0, 1), end: Offset.zero)
          .animate(_slideAnim),
      child: Padding(
        padding: const EdgeInsets.only(bottom: 12, left: 12, right: 12),
        child: Center(   // pill doesn't stretch full width
          child: ClipRRect(
            borderRadius: BorderRadius.circular(_kRadius),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
              child: Container(
                height: _kToolbarH,
                decoration: BoxDecoration(
                  color: _kBg.withOpacity(0.94),
                  borderRadius: BorderRadius.circular(_kRadius),
                  border: Border.all(color: _kBorder),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x55000000),
                      blurRadius: 24,
                      offset: Offset(0, 6),
                    ),
                  ],
                ),
                child: SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  physics: const NeverScrollableScrollPhysics(),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const SizedBox(width: 8),

                      // ── Pinned tools (from Tool Library) ─────────────────
                      ...pinned.map((toolType) => _ToolBtn(
                            icon:     _toolIcons[toolType] ?? Icons.edit,
                            label:    _toolLabels[toolType] ?? '',
                            isActive: active == toolType,
                            onTap:    () => dN.selectTool(toolType),
                          )),

                      // ── Add / Customize (opens Tool Library) ─────────────
                      _AddBtn(onTap: _openToolLibrary),

                      _div(),

                      // ── Color dot ─────────────────────────────────────────
                      _ColorDot(color: color, onTap: _showColorPicker),

                      const SizedBox(width: 2),

                      // ── Undo / Redo ───────────────────────────────────────
                      _IBtn(icon: Icons.undo_rounded, on: canUndo, tap: cN.undo),
                      _IBtn(icon: Icons.redo_rounded, on: canRedo, tap: cN.redo),

                      _div(),

                      // ── Page nav ──────────────────────────────────────────
                      _IBtn(
                        icon: Icons.chevron_left_rounded,
                        on:   canvas.currentPageIndex > 0,
                        tap:  cN.previousPage,
                      ),
                      _PageChip(
                        cur:   canvas.currentPageNumber,
                        total: canvas.totalPages,
                        onAdd: cN.addPage,
                      ),
                      _IBtn(
                        icon: Icons.chevron_right_rounded,
                        on:   canvas.currentPageIndex < canvas.totalPages - 1,
                        tap:  cN.nextPage,
                      ),

                      _div(),

                      // ── Zoom ──────────────────────────────────────────────
                      _IBtn(icon: Icons.remove_rounded, on: true, tap: cN.zoomOut),
                      _ZoomChip(zoom: canvas.zoom, onReset: cN.resetZoom),
                      _IBtn(icon: Icons.add_rounded, on: true, tap: cN.zoomIn),

                      _div(),

                      // ── Fullscreen ────────────────────────────────────────
                      _IBtn(
                        icon: canvas.isFullscreen
                            ? Icons.fullscreen_exit_rounded
                            : Icons.fullscreen_rounded,
                        on:  true,
                        tap: cN.toggleFullscreen,
                        tooltip: canvas.isFullscreen ? 'Exit fullscreen' : 'Fullscreen',
                      ),

                      const SizedBox(width: 8),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _div() => Container(
        width: 1, height: 22,
        margin: const EdgeInsets.symmetric(horizontal: 5),
        color: _kBorder,
      );
}

// ─── Tool Button ────────────────────────────────────────────────────────────────
class _ToolBtn extends StatefulWidget {
  final IconData icon;
  final String label;
  final bool isActive;
  final VoidCallback onTap;

  const _ToolBtn({
    required this.icon,
    required this.label,
    required this.isActive,
    required this.onTap,
  });

  @override
  State<_ToolBtn> createState() => _ToolBtnState();
}

class _ToolBtnState extends State<_ToolBtn> with SingleTickerProviderStateMixin {
  late final AnimationController _ac;
  late final Animation<double>   _s;

  @override
  void initState() {
    super.initState();
    _ac = AnimationController(vsync: this, duration: const Duration(milliseconds: 100));
    _s  = Tween<double>(begin: 1.0, end: 0.85)
        .animate(CurvedAnimation(parent: _ac, curve: Curves.easeOut));
  }

  @override
  void dispose() { _ac.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: widget.label,
      preferBelow: false,
      child: GestureDetector(
        onTapDown:   (_) => _ac.forward(),
        onTapUp:     (_) { _ac.reverse(); widget.onTap(); },
        onTapCancel: ()  => _ac.reverse(),
        child: AnimatedBuilder(
          animation: _s,
          builder: (_, child) => Transform.scale(scale: _s.value, child: child),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 140),
            margin:   const EdgeInsets.symmetric(horizontal: 2, vertical: 8),
            width:    _kBtnSize,
            height:   _kBtnSize,
            decoration: BoxDecoration(
              color: widget.isActive ? _kOrange : _kSurface,
              borderRadius: BorderRadius.circular(10),
              boxShadow: widget.isActive
                  ? [BoxShadow(
                      color: _kOrange.withOpacity(0.4),
                      blurRadius: 10, offset: const Offset(0, 2))]
                  : null,
            ),
            child: Icon(
              widget.icon,
              color: widget.isActive ? Colors.white : _kGray,
              size:  _kIconSize,
            ),
          ),
        ),
      ),
    );
  }
}

// ─── Add Button ────────────────────────────────────────────────────────────────
/// Opens the Tool Library so the user can long-press to pin tools to the bar.
class _AddBtn extends StatefulWidget {
  final VoidCallback onTap;
  const _AddBtn({required this.onTap});

  @override
  State<_AddBtn> createState() => _AddBtnState();
}

class _AddBtnState extends State<_AddBtn> {
  bool _hov = false;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: 'Tool Library — long-press any tool to pin it here',
      preferBelow: false,
      child: MouseRegion(
        onEnter: (_) => setState(() => _hov = true),
        onExit:  (_) => setState(() => _hov = false),
        child: GestureDetector(
          onTap: widget.onTap,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 140),
            margin:  const EdgeInsets.symmetric(horizontal: 3, vertical: 10),
            width:   _kBtnSize,
            height:  _kBtnSize,
            decoration: BoxDecoration(
              color: _hov ? _kOrange.withOpacity(0.18) : Colors.transparent,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: _hov ? _kOrange.withOpacity(0.5) : _kGray.withOpacity(0.3),
                width: 1.2,
                style: BorderStyle.solid,
              ),
            ),
            child: Icon(
              Icons.add_rounded,
              color: _hov ? _kOrange : _kGray,
              size:  _kIconSize,
            ),
          ),
        ),
      ),
    );
  }
}

// ─── Color Dot ─────────────────────────────────────────────────────────────────
class _ColorDot extends StatelessWidget {
  final Color color;
  final VoidCallback onTap;
  const _ColorDot({required this.color, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: 'Stroke color',
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          width:  22, height: 22,
          margin: const EdgeInsets.symmetric(horizontal: 3),
          decoration: BoxDecoration(
            color:  color,
            shape:  BoxShape.circle,
            border: Border.all(color: Colors.white24, width: 1.5),
            boxShadow: [BoxShadow(color: color.withOpacity(0.5), blurRadius: 6)],
          ),
        ),
      ),
    );
  }
}

// ─── Icon Button ────────────────────────────────────────────────────────────────
class _IBtn extends StatelessWidget {
  final IconData icon;
  final bool on;
  final VoidCallback? tap;
  final String? tooltip;

  const _IBtn({required this.icon, required this.on, this.tap, this.tooltip});

  @override
  Widget build(BuildContext context) {
    final w = GestureDetector(
      onTap: on ? tap : null,
      child: SizedBox(
        width: 30, height: 30,
        child: Icon(icon,
          size:  16,
          color: on
              ? Colors.white.withOpacity(0.78)
              : Colors.white.withOpacity(0.18),
        ),
      ),
    );
    return tooltip != null ? Tooltip(message: tooltip!, child: w) : w;
  }
}

// ─── Page Chip ─────────────────────────────────────────────────────────────────
class _PageChip extends StatelessWidget {
  final int cur, total;
  final VoidCallback onAdd;
  const _PageChip({required this.cur, required this.total, required this.onAdd});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Scaffold.of(context).openEndDrawer(),
      child: Tooltip(
        message: 'Page Manager',
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
          margin:  const EdgeInsets.symmetric(horizontal: 1),
          decoration: BoxDecoration(
            color:        _kSurface,
            borderRadius: BorderRadius.circular(6),
            border:       Border.all(color: _kBorder),
          ),
          child: Text('$cur/$total',
            style: GoogleFonts.dmSans(
              color: Colors.white.withOpacity(0.75),
              fontSize: 11, fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ),
    );
  }
}

// ─── Zoom Chip ─────────────────────────────────────────────────────────────────
class _ZoomChip extends StatelessWidget {
  final double zoom;
  final VoidCallback onReset;
  const _ZoomChip({required this.zoom, required this.onReset});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onReset,
      child: Tooltip(
        message: 'Reset zoom',
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
          margin:  const EdgeInsets.symmetric(horizontal: 1),
          decoration: BoxDecoration(
            color:        _kSurface,
            borderRadius: BorderRadius.circular(6),
            border:       Border.all(color: _kBorder),
          ),
          child: Text('${(zoom * 100).toInt()}%',
            style: GoogleFonts.dmSans(
              color: _kGray, fontSize: 11, fontWeight: FontWeight.w500,
            ),
          ),
        ),
      ),
    );
  }
}

// ─── Color Picker Sheet ─────────────────────────────────────────────────────────
class _ColorSheet extends StatelessWidget {
  final List<Color> colors;
  final Color current;
  final ValueChanged<Color> onPick;
  const _ColorSheet({
    required this.colors, required this.current, required this.onPick,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin:  const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF16162A),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: _kBorder),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Text('Stroke Color',
              style: GoogleFonts.dmSans(
                color: Colors.white, fontSize: 16, fontWeight: FontWeight.w700,
              )),
            const Spacer(),
            GestureDetector(
              onTap: () => Navigator.pop(context),
              child: const Icon(Icons.close, color: Colors.white38, size: 20),
            ),
          ]),
          const SizedBox(height: 16),
          Wrap(
            spacing: 12, runSpacing: 12,
            children: colors.map((c) {
              final sel = c.value == current.value;
              return GestureDetector(
                onTap: () => onPick(c),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 140),
                  width: sel ? 40 : 34, height: sel ? 40 : 34,
                  decoration: BoxDecoration(
                    color: c, shape: BoxShape.circle,
                    border: Border.all(
                      color: sel ? _kOrange : Colors.white24,
                      width: sel ? 2.5 : 1.5,
                    ),
                    boxShadow: sel
                        ? [BoxShadow(color: _kOrange.withOpacity(0.5), blurRadius: 10)]
                        : null,
                  ),
                  child: sel
                      ? Icon(Icons.check_rounded,
                          color: c.computeLuminance() > 0.5
                              ? Colors.black87 : Colors.white,
                          size: 16)
                      : null,
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}
