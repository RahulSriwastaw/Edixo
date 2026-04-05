// Per-tool settings bottom sheet.
// Shown on double-tap of any toolbar button or tool card.
// Each tool category shows only the settings relevant to it.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../providers/tool_provider.dart';
import '../../providers/tool_registry.dart';
import '../../../../../core/constants/app_colors.dart';

// ── Internal kind mapping ───────────────────────────────────────────────────

enum _ToolKind {
  drawingPen,  // softPen, hardPen, chalk, calligraphy, magicPen
  highlighter,
  spray,
  laser,
  eraser,      // softEraser, hardEraser, areaEraser
  shape,       // all shape tools
  textBox,
  stickyNote,
  noSettings,  // select, selectObject, navigate, objectEraser, eyedropper
}

_ToolKind _kindFor(Tool tool) => switch (tool) {
  Tool.softPen || Tool.hardPen || Tool.chalk ||
  Tool.calligraphy || Tool.magicPen       => _ToolKind.drawingPen,
  Tool.highlighter                        => _ToolKind.highlighter,
  Tool.spray                              => _ToolKind.spray,
  Tool.laserPointer                       => _ToolKind.laser,
  Tool.softEraser || Tool.hardEraser ||
  Tool.areaEraser                         => _ToolKind.eraser,
  Tool.line || Tool.arrow || Tool.doubleArrow ||
  Tool.rectangle || Tool.roundedRect || Tool.circle ||
  Tool.triangle || Tool.star || Tool.polygon ||
  Tool.callout                            => _ToolKind.shape,
  Tool.textBox                            => _ToolKind.textBox,
  Tool.stickyNote                         => _ToolKind.stickyNote,
  _                                       => _ToolKind.noSettings,
};

// ── Public API ──────────────────────────────────────────────────────────────

void showToolSettingsSheet(BuildContext context, WidgetRef ref, Tool tool) {
  showModalBottomSheet<void>(
    context: context,
    useRootNavigator: true,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (_) => _ToolSettingsSheet(tool: tool),
  );
}

// ── Sheet widget ────────────────────────────────────────────────────────────

class _ToolSettingsSheet extends ConsumerStatefulWidget {
  final Tool tool;
  const _ToolSettingsSheet({required this.tool});

  @override
  ConsumerState<_ToolSettingsSheet> createState() => _ToolSettingsSheetState();
}

class _ToolSettingsSheetState extends ConsumerState<_ToolSettingsSheet> {
  late double    _strokeWidth;
  late double    _opacity;
  late Color     _color;
  late StrokeTip _tip;

  @override
  void initState() {
    super.initState();
    final s = _readSettings();
    _strokeWidth = s.strokeWidth;
    _opacity     = s.opacity;
    _color       = s.color;
    _tip         = s.tip;
  }

  ToolSettings _readSettings() {
    final state = ref.read(toolNotifierProvider);
    return state.toolSettings[widget.tool]
        ?? toolRegistryByTool[widget.tool]?.defaultSettings
        ?? const ToolSettings();
  }

  void _save(ToolSettings Function(ToolSettings) fn) {
    ref.read(toolNotifierProvider.notifier)
        .updateSettings(widget.tool, fn(_readSettings()));
  }

  void _onColorPick(Color c) {
    setState(() => _color = c);
    _save((s) => s.copyWith(color: c));
  }

  @override
  Widget build(BuildContext context) {
    final def  = toolRegistryByTool[widget.tool];
    final kind = _kindFor(widget.tool);

    return SafeArea(
      child: Container(
        margin: const EdgeInsets.fromLTRB(10, 0, 10, 16),
        decoration: BoxDecoration(
          color: const Color(0xFF1B1B32),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Drag handle
            Center(
              child: Container(
                width: 36, height: 4,
                margin: const EdgeInsets.only(top: 10, bottom: 6),
                decoration: BoxDecoration(
                  color: Colors.white24,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 2, 12, 0),
              child: Row(
                children: [
                  Container(
                    width: 34, height: 34,
                    decoration: BoxDecoration(
                      color: AppColors.accentOrange.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(def?.icon ?? Icons.brush_outlined,
                        size: 18, color: AppColors.accentOrange),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    '${def?.name ?? widget.tool.name} Settings',
                    style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                        fontSize: 15),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white38, size: 20),
                    onPressed: () => Navigator.pop(context),
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(minWidth: 36, minHeight: 36),
                  ),
                ],
              ),
            ),
            const Divider(color: Colors.white12, height: 16),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 20),
              child: _buildBody(kind),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBody(_ToolKind kind) => switch (kind) {
    _ToolKind.noSettings  => _noSettings(),
    _ToolKind.eraser      => _eraserBody(),
    _ToolKind.laser       => _laserBody(),
    _ToolKind.highlighter => _highlighterBody(),
    _ToolKind.drawingPen  => _penBody(),
    _ToolKind.spray       => _sprayBody(),
    _ToolKind.shape       => _shapeBody(),
    _ToolKind.textBox     => _textBoxBody(),
    _ToolKind.stickyNote  => _stickyNoteBody(),
  };

  // ── Body variants ─────────────────────────────────────────────────────────

  Widget _noSettings() => const Padding(
    padding: EdgeInsets.symmetric(vertical: 16),
    child: Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(Icons.info_outline, color: Colors.white38, size: 18),
        SizedBox(width: 8),
        Text('No configurable settings for this tool',
            style: TextStyle(color: Colors.white38, fontSize: 13)),
      ],
    ),
  );

  // softPen / hardPen / chalk / calligraphy / magicPen
  Widget _penBody() => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _label('Color'),
      _ColorGrid(selected: _color, onSelect: _onColorPick),
      const SizedBox(height: 14),
      _sliderTile('Stroke Width', '${_strokeWidth.toInt()}px',
          _strokeWidth, 1, 50, 49,
          (v) => setState(() => _strokeWidth = v),
          (v) { setState(() => _strokeWidth = v); _save((s) => s.copyWith(strokeWidth: v)); }),
      _sliderTile('Opacity', '${(_opacity * 100).toInt()}%',
          _opacity, 0.1, 1.0, 9,
          (v) => setState(() => _opacity = v),
          (v) { setState(() => _opacity = v); _save((s) => s.copyWith(opacity: v)); }),
      const SizedBox(height: 10),
      _label('Tip Style'),
      _TipSelector(
        selected: _tip,
        onSelect: (t) { setState(() => _tip = t); _save((s) => s.copyWith(tip: t)); },
      ),
    ],
  );

  // highlighter
  Widget _highlighterBody() => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _label('Highlight Color'),
      _ColorGrid(selected: _color, onSelect: _onColorPick,
          preset: _ColorPreset.highlighter),
      const SizedBox(height: 14),
      _sliderTile('Width', '${_strokeWidth.clamp(5, 40).toInt()}px',
          _strokeWidth.clamp(5, 40), 5, 40, 35,
          (v) => setState(() => _strokeWidth = v),
          (v) { setState(() => _strokeWidth = v); _save((s) => s.copyWith(strokeWidth: v)); }),
      _sliderTile('Opacity', '${(_opacity.clamp(0.1, 0.7) * 100).toInt()}%',
          _opacity.clamp(0.1, 0.7), 0.1, 0.7, 6,
          (v) => setState(() => _opacity = v),
          (v) { setState(() => _opacity = v); _save((s) => s.copyWith(opacity: v)); }),
    ],
  );

  // spray
  Widget _sprayBody() => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _label('Color'),
      _ColorGrid(selected: _color, onSelect: _onColorPick),
      const SizedBox(height: 14),
      _sliderTile('Spray Size', '${_strokeWidth.clamp(5, 60).toInt()}px',
          _strokeWidth.clamp(5, 60), 5, 60, 55,
          (v) => setState(() => _strokeWidth = v),
          (v) { setState(() => _strokeWidth = v); _save((s) => s.copyWith(strokeWidth: v)); }),
      _sliderTile('Density', '${(_opacity * 100).toInt()}%',
          _opacity, 0.1, 1.0, 9,
          (v) => setState(() => _opacity = v),
          (v) { setState(() => _opacity = v); _save((s) => s.copyWith(opacity: v)); }),
    ],
  );

  // laserPointer
  Widget _laserBody() => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _label('Pointer Color'),
      _ColorGrid(selected: _color, onSelect: _onColorPick,
          preset: _ColorPreset.laser),
    ],
  );

  // softEraser / hardEraser / areaEraser
  Widget _eraserBody() => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _sliderTile('Eraser Size', '${_strokeWidth.clamp(5, 80).toInt()}px',
          _strokeWidth.clamp(5, 80), 5, 80, 75,
          (v) => setState(() => _strokeWidth = v),
          (v) { setState(() => _strokeWidth = v); _save((s) => s.copyWith(strokeWidth: v)); }),
    ],
  );

  // all shape tools
  Widget _shapeBody() => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _label('Stroke Color'),
      _ColorGrid(selected: _color, onSelect: _onColorPick),
      const SizedBox(height: 14),
      _sliderTile('Stroke Width', '${_strokeWidth.clamp(1, 20).toInt()}px',
          _strokeWidth.clamp(1, 20), 1, 20, 19,
          (v) => setState(() => _strokeWidth = v),
          (v) { setState(() => _strokeWidth = v); _save((s) => s.copyWith(strokeWidth: v)); }),
      _sliderTile('Opacity', '${(_opacity * 100).toInt()}%',
          _opacity, 0.1, 1.0, 9,
          (v) => setState(() => _opacity = v),
          (v) { setState(() => _opacity = v); _save((s) => s.copyWith(opacity: v)); }),
    ],
  );

  // textBox
  Widget _textBoxBody() => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _label('Text Color'),
      _ColorGrid(selected: _color, onSelect: _onColorPick),
      const SizedBox(height: 14),
      _sliderTile('Font Size', '${_strokeWidth.clamp(8, 72).toInt()}sp',
          _strokeWidth.clamp(8, 72), 8, 72, 64,
          (v) => setState(() => _strokeWidth = v),
          (v) { setState(() => _strokeWidth = v); _save((s) => s.copyWith(strokeWidth: v)); }),
    ],
  );

  // stickyNote
  Widget _stickyNoteBody() => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      _label('Note Color'),
      _ColorGrid(selected: _color, onSelect: _onColorPick,
          preset: _ColorPreset.stickyNote),
      const SizedBox(height: 14),
      _sliderTile('Opacity', '${(_opacity.clamp(0.5, 1.0) * 100).toInt()}%',
          _opacity.clamp(0.5, 1.0), 0.5, 1.0, 5,
          (v) => setState(() => _opacity = v),
          (v) { setState(() => _opacity = v); _save((s) => s.copyWith(opacity: v)); }),
    ],
  );

  // ── Shared helpers ────────────────────────────────────────────────────────

  Widget _label(String text) => Padding(
    padding: const EdgeInsets.only(bottom: 8),
    child: Text(text,
        style: const TextStyle(
            color: Colors.white54,
            fontSize: 12,
            fontWeight: FontWeight.w600)),
  );

  Widget _sliderTile(
    String label,
    String valueText,
    double value,
    double min,
    double max,
    int divisions,
    ValueChanged<double> onChanged,
    ValueChanged<double> onChangeEnd,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label,
                style: const TextStyle(
                    color: Colors.white54,
                    fontSize: 12,
                    fontWeight: FontWeight.w600)),
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: AppColors.accentOrange.withValues(alpha: 0.16),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(valueText,
                  style: const TextStyle(
                      color: AppColors.accentOrange,
                      fontSize: 11,
                      fontWeight: FontWeight.w600)),
            ),
          ],
        ),
        SliderTheme(
          data: SliderThemeData(
            trackHeight: 4,
            thumbShape:
                const RoundSliderThumbShape(enabledThumbRadius: 6),
            overlayShape:
                const RoundSliderOverlayShape(overlayRadius: 12),
            activeTrackColor: AppColors.accentOrange,
            inactiveTrackColor: Colors.white.withValues(alpha: 0.12),
            thumbColor: AppColors.accentOrange,
            overlayColor: AppColors.accentOrange.withValues(alpha: 0.12),
          ),
          child: Slider(
            value: value.clamp(min, max),
            min: min,
            max: max,
            divisions: divisions,
            onChanged: onChanged,
            onChangeEnd: onChangeEnd,
          ),
        ),
      ],
    );
  }
}

// ── Color preset enum ───────────────────────────────────────────────────────

enum _ColorPreset { standard, highlighter, laser, stickyNote }

// ── Color palettes ──────────────────────────────────────────────────────────

const _standardColors = <Color>[
  Colors.white,
  Color(0xFFFF0000), Color(0xFFFF6600), Color(0xFFFFFF00),
  Color(0xFF00FF00), Color(0xFF00FFFF), Color(0xFF00BFFF), Color(0xFF4169E1),
  Color(0xFF8000FF), Color(0xFFFF00FF), Color(0xFFFF6B9D), Color(0xFF000000),
  Color(0xFF808080), Color(0xFFFFD700), Color(0xFF32CD32), Color(0xFFFF4500),
  Color(0xFF9370DB), Color(0xFF00CED1), Color(0xFF8B4513), Color(0xFFADFF2F),
];

const _highlighterColors = <Color>[
  Color(0xFFFFFF00), Color(0xFFFFE66D), Color(0xFF7CFC00),
  Color(0xFF00FFFF), Color(0xFFFF80FF), Color(0xFFFFA500),
  Color(0xFFFF69B4), Color(0xFF00FA9A),
];

const _laserColors = <Color>[
  Color(0xFFFF0000), Color(0xFFFF6600), Color(0xFFFFFFFF),
  Color(0xFF00FF00), Color(0xFF00BFFF), Color(0xFFFF00FF),
];

const _stickyNoteColors = <Color>[
  Color(0xFFFFFFCC), Color(0xFFFFD6B0), Color(0xFFFFB3B3),
  Color(0xFFB3FFB3), Color(0xFFB3D9FF), Color(0xFFE8B3FF),
  Color(0xFF90EE90), Color(0xFFADD8E6),
];

// ── Color grid ──────────────────────────────────────────────────────────────

class _ColorGrid extends StatelessWidget {
  final Color selected;
  final ValueChanged<Color> onSelect;
  final _ColorPreset preset;

  const _ColorGrid({
    required this.selected,
    required this.onSelect,
    this.preset = _ColorPreset.standard,
  });

  List<Color> get _palette => switch (preset) {
    _ColorPreset.highlighter => _highlighterColors,
    _ColorPreset.laser       => _laserColors,
    _ColorPreset.stickyNote  => _stickyNoteColors,
    _                        => _standardColors,
  };

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: _palette.map((c) {
        final isSel = c.red == selected.red &&
            c.green == selected.green &&
            c.blue == selected.blue;
        return GestureDetector(
          onTap: () => onSelect(c),
          child: Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: c,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: isSel ? AppColors.accentOrange : Colors.white24,
                width: isSel ? 2.5 : 1,
              ),
              boxShadow: isSel
                  ? [
                      BoxShadow(
                          color: AppColors.accentOrange
                              .withValues(alpha: 0.4),
                          blurRadius: 6)
                    ]
                  : null,
            ),
            child: isSel
                ? Icon(Icons.check,
                    size: 16,
                    color: c.computeLuminance() > 0.5
                        ? Colors.black87
                        : Colors.white)
                : null,
          ),
        );
      }).toList(),
    );
  }
}

// ── Tip selector ────────────────────────────────────────────────────────────

class _TipSelector extends StatelessWidget {
  final StrokeTip selected;
  final ValueChanged<StrokeTip> onSelect;

  const _TipSelector({required this.selected, required this.onSelect});

  static const _labels = {
    StrokeTip.round: 'Round',
    StrokeTip.flat:  'Flat',
    StrokeTip.brush: 'Brush',
  };

  @override
  Widget build(BuildContext context) {
    return Row(
      children: StrokeTip.values.map((tip) {
        final sel = tip == selected;
        return GestureDetector(
          onTap: () => onSelect(tip),
          child: Container(
            margin: const EdgeInsets.only(right: 8),
            padding:
                const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
            decoration: BoxDecoration(
              color: sel
                  ? AppColors.accentOrange
                  : Colors.white.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                  color: sel ? AppColors.accentOrange : Colors.white12),
            ),
            child: Text(
              _labels[tip] ?? tip.name,
              style: TextStyle(
                  color: sel ? Colors.white : Colors.white60,
                  fontSize: 12,
                  fontWeight: FontWeight.w500),
            ),
          ),
        );
      }).toList(),
    );
  }
}
