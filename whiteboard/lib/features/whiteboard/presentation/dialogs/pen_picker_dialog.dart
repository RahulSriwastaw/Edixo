// lib/features/whiteboard/presentation/dialogs/pen_picker_dialog.dart
// v4.1 — Fixed overflow. SizedBox(fixed height) + Column.max + Expanded scroll.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../widgets/tools/pen_tool.dart';
import '../providers/tool_provider.dart';
import 'package:eduboard_pro/features/whiteboard/presentation/widgets/color_picker/tool_color_picker.dart';

// ─── Design Tokens ─────────────────────────────────────────────────────────
class _C {
  static const sidebar   = Color(0xFF141414);
  static const card      = Color(0xFF1A1A1A);
  static const cardHov   = Color(0xFF202020);
  static const border    = Color(0xFF252525);
  static const divider   = Color(0xFF1E1E1E);
  static const accent    = Color(0xFFFF6B2B);
  static const accentHov = Color(0xFFE55A1A);
  static const txtPri    = Color(0xFFEFEFEF);
  static const txtSec    = Color(0xFF888888);
  static const txtMut    = Color(0xFF555555);
  static const inputBor  = Color(0xFF2A2A2A);
  static const font      = 'Inter';
}

// ─── Entry point ──────────────────────────────────────────────────────────────

class PenPickerDialog extends ConsumerWidget {
  const PenPickerDialog({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Dialog(
      backgroundColor: Colors.transparent,
      elevation: 0,
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      child: _PenPanel(),
    );
  }
}

// ─── Panel ────────────────────────────────────────────────────────────────────

class _PenPanel extends ConsumerStatefulWidget {
  @override
  ConsumerState<_PenPanel> createState() => _PenPanelState();
}

class _PenPanelState extends ConsumerState<_PenPanel> {
  void _syncEngine(PenSettings settings) {
    ref.read(penSettingsProvider.notifier).applySettings(settings);
    
    final toolNotifier = ref.read(toolNotifierProvider.notifier);
    Tool mappedTool = Tool.softPen;
    switch (settings.type) {
      case PenType.pencil:      mappedTool = Tool.hardPen; break;
      case PenType.brush:       mappedTool = Tool.softPen; break;
      case PenType.marker:      mappedTool = Tool.hardPen; break;
      case PenType.calligraphy: mappedTool = Tool.calligraphy; break;
      case PenType.highlighter: mappedTool = Tool.highlighter; break;
      case PenType.magic:       mappedTool = Tool.magicPen; break;
      case PenType.chalk:       mappedTool = Tool.chalk; break;
    }
    
    toolNotifier.selectTool(mappedTool);
    toolNotifier.setColor(settings.color);
    toolNotifier.setStrokeWidth(settings.strokeWidth);
    toolNotifier.setOpacity(settings.opacity);
  }

  void _selectType(PenType t) {
    final current = ref.read(penSettingsProvider);
    _syncEngine(PenSettings.withDefaults(type: t, color: current.color));
  }
  
  void _setColor(Color c) => _syncEngine(ref.read(penSettingsProvider).copyWith(color: c));
  void _setWidth(double v) => _syncEngine(ref.read(penSettingsProvider).copyWith(strokeWidth: v));
  void _setOpacity(double v) => _syncEngine(ref.read(penSettingsProvider).copyWith(opacity: v));

  void _close() => Navigator.of(context).pop();

  @override
  Widget build(BuildContext context) {
    final settings = ref.watch(penSettingsProvider);
    return Container(
      width: 240,
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.85,
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(10),
        child: Container(
          decoration: BoxDecoration(
            color: _C.sidebar,
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: _C.border),
            boxShadow: const [
              BoxShadow(color: Color(0x80000000), blurRadius: 20, offset: Offset(0, 6)),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildHeader(),
              _div(),
              Flexible(
                child: SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildPenTypes(),
                      _div(),
                      _buildSlider(
                        label: 'WIDTH',
                        value: settings.strokeWidth,
                        min: 1.0, max: 50.0,
                        badge: '${settings.strokeWidth.round()}',
                        onChanged: _setWidth,
                      ),
                      _div(),
                      _buildSlider(
                        label: 'OPACITY',
                        value: settings.opacity,
                        min: 0.05, max: 1.0,
                        badge: '${(settings.opacity * 100).round()}%',
                        onChanged: _setOpacity,
                      ),
                      _div(),
                      _buildColors(),
                    ],
                  ),
                ),
              ),
              _div(),
              _buildActions(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    final settings = ref.watch(penSettingsProvider);
    return Padding(
      padding: const EdgeInsets.fromLTRB(10, 8, 8, 6),
      child: Row(
        children: [
          Container(
            width: 26, height: 26,
            decoration: BoxDecoration(
              color: _C.accent.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Icon(settings.type.icon, size: 14, color: _C.accent),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(settings.type.displayName,
                    style: const TextStyle(
                      fontFamily: _C.font, fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: _C.txtPri, height: 1.3,
                    )),
                const Text('Pen Settings',
                    style: TextStyle(
                      fontFamily: _C.font, fontSize: 10,
                      color: _C.txtMut, height: 1.3,
                    )),
              ],
            ),
          ),
          _CloseBtn(onTap: _close),
        ],
      ),
    );
  }

  Widget _buildPenTypes() {
    final settings = ref.watch(penSettingsProvider);
    return Padding(
      padding: const EdgeInsets.fromLTRB(8, 6, 8, 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          const Padding(
            padding: EdgeInsets.only(left: 2, bottom: 4),
            child: _Label('PEN TYPE'),
          ),
          // Row 1: pencil, brush, marker, calligraphy
          Row(
            children: PenType.values.take(4).map((t) => Expanded(
              child: Padding(
                padding: const EdgeInsets.only(right: 4),
                child: _PenCard(
                  type: t,
                  isActive: t == settings.type,
                  onTap: () => _selectType(t),
                ),
              ),
            )).toList(),
          ),
          const SizedBox(height: 4),
          // Row 2: highlighter, magic, chalk + empty
          Row(
            children: [
              ...PenType.values.skip(4).map((t) => Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(right: 4),
                  child: _PenCard(
                    type: t,
                    isActive: t == settings.type,
                    onTap: () => _selectType(t),
                  ),
                ),
              )),
              const Expanded(child: SizedBox()), // filler
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSlider({
    required String label,
    required double value,
    required double min,
    required double max,
    required String badge,
    required ValueChanged<double> onChanged,
  }) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(10, 6, 10, 4),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(children: [_Label(label), const Spacer(), _Badge(badge)]),
          const SizedBox(height: 2),
          _PenSlider(value: value.clamp(min, max), min: min, max: max, onChanged: onChanged),
        ],
      ),
    );
  }

  Widget _buildColors() {
    final settings = ref.watch(penSettingsProvider);
    return Padding(
      padding: const EdgeInsets.fromLTRB(8, 6, 8, 6),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          const Padding(
            padding: EdgeInsets.only(left: 2, bottom: 8),
            child: _Label('COLOR'),
          ),
          ToolColorPicker(
            selected: settings.color,
            onSelect: (c) {
              RecentColorsNotifier.add(ref, c);
              _setColor(c);
            },
          ),
        ],
      ),
    );
  }

  Widget _buildActions() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(8, 6, 8, 6),
      child: Row(children: [
        Expanded(child: _ActionBtn(label: 'Done', primary: true, onTap: _close)),
      ]),
    );
  }

  Widget _div() => Container(height: 1, color: _C.divider);
}

// ─── Pen Card ─────────────────────────────────────────────────────────────────

class _PenCard extends StatefulWidget {
  final PenType type;
  final bool isActive;
  final VoidCallback onTap;
  const _PenCard({required this.type, required this.isActive, required this.onTap});
  @override
  State<_PenCard> createState() => _PenCardState();
}

class _PenCardState extends State<_PenCard> {
  bool _hov = false;
  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _hov = true),
      onExit: (_) => setState(() => _hov = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 120),
          height: 42,
          decoration: BoxDecoration(
            color: widget.isActive
                ? _C.accent.withValues(alpha: 0.14)
                : _hov ? _C.cardHov : _C.card,
            borderRadius: BorderRadius.circular(6),
            border: Border.all(
              color: widget.isActive ? _C.accent : _hov ? _C.border : _C.divider,
              width: widget.isActive ? 1.5 : 1,
            ),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(widget.type.icon, size: 14,
                  color: widget.isActive ? _C.accent : _C.txtSec),
              const SizedBox(height: 2),
              Text(
                widget.type.displayName,
                style: TextStyle(
                  fontFamily: _C.font, fontSize: 8.5,
                  fontWeight: widget.isActive ? FontWeight.w600 : FontWeight.w500,
                  color: widget.isActive ? _C.txtPri : _C.txtMut,
                  height: 1.1,
                ),
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Slider ───────────────────────────────────────────────────────────────────

class _PenSlider extends StatelessWidget {
  final double value, min, max;
  final ValueChanged<double> onChanged;
  const _PenSlider({required this.value, required this.min, required this.max, required this.onChanged});
  @override
  Widget build(BuildContext context) {
    return SliderTheme(
      data: SliderTheme.of(context).copyWith(
        trackHeight: 3,
        activeTrackColor: _C.accent,
        inactiveTrackColor: _C.inputBor,
        thumbColor: Colors.white,
        thumbShape: const RoundSliderThumbShape(enabledThumbRadius: 7),
        overlayShape: const RoundSliderOverlayShape(overlayRadius: 13),
        overlayColor: _C.accent.withValues(alpha: 0.15),
      ),
      child: Slider(value: value, min: min, max: max, onChanged: onChanged),
    );
  }
}

// ─── Action Button ────────────────────────────────────────────────────────────

class _ActionBtn extends StatefulWidget {
  final String label;
  final bool primary;
  final VoidCallback onTap;
  const _ActionBtn({required this.label, required this.primary, required this.onTap});
  @override
  State<_ActionBtn> createState() => _ActionBtnState();
}

class _ActionBtnState extends State<_ActionBtn> {
  bool _hov = false;
  @override
  Widget build(BuildContext context) => MouseRegion(
        onEnter: (_) => setState(() => _hov = true),
        onExit: (_) => setState(() => _hov = false),
        child: GestureDetector(
          onTap: widget.onTap,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 120),
            height: 32,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: widget.primary ? (_hov ? _C.accentHov : _C.accent) : Colors.transparent,
              borderRadius: BorderRadius.circular(6),
              border: widget.primary ? null : Border.all(color: _C.inputBor),
            ),
            child: Text(
              widget.label,
              style: TextStyle(
                fontFamily: _C.font, fontSize: 12, fontWeight: FontWeight.w600,
                color: widget.primary ? Colors.white : _C.txtSec, height: 1.5,
              ),
            ),
          ),
        ),
      );
}

// ─── Micro Widgets ────────────────────────────────────────────────────────────

class _Label extends StatelessWidget {
  final String text;
  const _Label(this.text);
  @override
  Widget build(BuildContext context) => Text(text,
      style: const TextStyle(
        fontFamily: _C.font, fontSize: 10, fontWeight: FontWeight.w600,
        color: _C.txtMut, letterSpacing: 0.8, height: 1.5,
      ));
}

class _Badge extends StatelessWidget {
  final String text;
  const _Badge(this.text);
  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
        decoration: BoxDecoration(color: _C.accent, borderRadius: BorderRadius.circular(20)),
        child: Text(text,
            style: const TextStyle(
              fontFamily: _C.font, fontSize: 10, fontWeight: FontWeight.w600,
              color: Colors.white, height: 1.3,
            )),
      );
}

class _CloseBtn extends StatefulWidget {
  final VoidCallback onTap;
  const _CloseBtn({required this.onTap});
  @override
  State<_CloseBtn> createState() => _CloseBtnState();
}

class _CloseBtnState extends State<_CloseBtn> {
  bool _hov = false;
  @override
  Widget build(BuildContext context) => MouseRegion(
        onEnter: (_) => setState(() => _hov = true),
        onExit: (_) => setState(() => _hov = false),
        child: GestureDetector(
          onTap: widget.onTap,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 100),
            width: 26, height: 26,
            decoration: BoxDecoration(
              color: _hov ? _C.card : Colors.transparent,
              borderRadius: BorderRadius.circular(5),
              border: Border.all(color: _hov ? _C.border : Colors.transparent),
            ),
            child: const Icon(Icons.close, size: 14, color: _C.txtMut),
          ),
        ),
      );
}