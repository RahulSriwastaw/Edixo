// lib/features/whiteboard/presentation/dialogs/pen_picker_dialog.dart
// Compact professional pen settings dialog — v4.0
// All 7 pen types fully wired. Cancel/Apply pattern. No scroll needed.

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../widgets/tools/pen_tool.dart';

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
  static const inputBg   = Color(0xFF1A1A1A);
  static const inputBor  = Color(0xFF2A2A2A);
  static const font      = 'Inter';
}

// ─── 12-color whiteboard palette ─────────────────────────────────────────────
const _kColors = [
  Color(0xFF000000), Color(0xFFFFFFFF), Color(0xFFE53935), Color(0xFFFF5722),
  Color(0xFFFF9800), Color(0xFFFFD600), Color(0xFF43A047), Color(0xFF00BCD4),
  Color(0xFF2196F3), Color(0xFF3F51B5), Color(0xFF9C27B0), Color(0xFF795548),
];

// ─── Dialog entry ─────────────────────────────────────────────────────────────

class PenPickerDialog extends ConsumerWidget {
  const PenPickerDialog({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
      child: Align(
        alignment: Alignment.center,
        child: _PenPanel(),
      ),
    );
  }
}

// ─── Main panel ───────────────────────────────────────────────────────────────

class _PenPanel extends ConsumerStatefulWidget {
  @override
  ConsumerState<_PenPanel> createState() => _PenPanelState();
}

class _PenPanelState extends ConsumerState<_PenPanel> {
  late PenSettings _staged;

  @override
  void initState() {
    super.initState();
    _staged = ref.read(penSettingsProvider);
  }

  void _selectType(PenType t) => setState(() {
        _staged = PenSettings.withDefaults(type: t, color: _staged.color);
      });

  void _setColor(Color c) =>
      setState(() => _staged = _staged.copyWith(color: c));

  void _setWidth(double v) =>
      setState(() => _staged = _staged.copyWith(strokeWidth: v));

  void _setOpacity(double v) =>
      setState(() => _staged = _staged.copyWith(opacity: v));

  void _apply() {
    ref.read(penSettingsProvider.notifier).applySettings(_staged);
    Navigator.of(context).pop();
  }

  void _cancel() => Navigator.of(context).pop();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 280,
      decoration: BoxDecoration(
        color: _C.sidebar,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: _C.border),
        boxShadow: const [
          BoxShadow(
            color: Color(0x80000000),
            blurRadius: 24,
            offset: Offset(0, 8),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _header(),
          _div(),
          _penTypes(),
          _div(),
          _sliderRow(
            label: 'WIDTH',
            value: _staged.strokeWidth,
            min: 1, max: 50,
            display: '${_staged.strokeWidth.round()}',
            onChanged: _setWidth,
          ),
          _div(),
          _sliderRow(
            label: 'OPACITY',
            value: _staged.opacity,
            min: 0.05, max: 1.0,
            display: '${(_staged.opacity * 100).round()}%',
            onChanged: _setOpacity,
          ),
          _div(),
          _colorGrid(),
          _div(),
          _actions(),
        ],
      ),
    );
  }

  // ── Header ─────────────────────────────────────────────────────────────────

  Widget _header() => Padding(
        padding: const EdgeInsets.fromLTRB(12, 10, 10, 8),
        child: Row(
          children: [
            Container(
              width: 28,
              height: 28,
              decoration: BoxDecoration(
                color: _C.accent.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Icon(_staged.type.icon, size: 15, color: _C.accent),
            ),
            const SizedBox(width: 8),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _staged.type.displayName,
                  style: const TextStyle(
                    fontFamily: _C.font,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: _C.txtPri,
                    height: 1.4,
                  ),
                ),
                const Text(
                  'Pen Settings',
                  style: TextStyle(
                    fontFamily: _C.font,
                    fontSize: 10,
                    color: _C.txtMut,
                    height: 1.3,
                  ),
                ),
              ],
            ),
            const Spacer(),
            _CloseBtn(onTap: _cancel),
          ],
        ),
      );

  // ── Pen Types 4-col grid ───────────────────────────────────────────────────

  Widget _penTypes() => Padding(
        padding: const EdgeInsets.fromLTRB(10, 8, 10, 8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Padding(
              padding: EdgeInsets.only(left: 2, bottom: 6),
              child: _Label('PEN TYPE'),
            ),
            GridView.count(
              crossAxisCount: 4,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 6,
              mainAxisSpacing: 6,
              childAspectRatio: 1.05,
              children: PenType.values
                  .map((t) => _PenTypeCard(
                        type: t,
                        isActive: t == _staged.type,
                        onTap: () => _selectType(t),
                      ))
                  .toList(),
            ),
          ],
        ),
      );

  // ── Slider row ─────────────────────────────────────────────────────────────

  Widget _sliderRow({
    required String label,
    required double value,
    required double min,
    required double max,
    required String display,
    required ValueChanged<double> onChanged,
  }) =>
      Padding(
        padding: const EdgeInsets.fromLTRB(12, 8, 12, 6),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                _Label(label),
                const Spacer(),
                _Badge(display),
              ],
            ),
            const SizedBox(height: 2),
            _PenSlider(
              value: value.clamp(min, max),
              min: min,
              max: max,
              onChanged: onChanged,
            ),
          ],
        ),
      );

  // ── Color 4×3 grid ─────────────────────────────────────────────────────────

  Widget _colorGrid() => Padding(
        padding: const EdgeInsets.fromLTRB(10, 8, 10, 8),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.only(left: 2, bottom: 6),
              child: Row(
                children: [
                  const _Label('COLOR'),
                  const Spacer(),
                  Container(
                    width: 16,
                    height: 16,
                    decoration: BoxDecoration(
                      color: _staged.color,
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: _staged.color == Colors.white
                            ? _C.border
                            : Colors.transparent,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            GridView.count(
              crossAxisCount: 4,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 6,
              mainAxisSpacing: 6,
              childAspectRatio: 1.0,
              children: _kColors
                  .map((c) => _ColorTile(
                        color: c,
                        isSelected: _staged.color.value == c.value,
                        onTap: () => _setColor(c),
                      ))
                  .toList(),
            ),
          ],
        ),
      );

  // ── Cancel / Apply buttons ─────────────────────────────────────────────────

  Widget _actions() => Padding(
        padding: const EdgeInsets.fromLTRB(10, 8, 10, 10),
        child: Row(
          children: [
            Expanded(child: _ActionBtn(label: 'Cancel', primary: false, onTap: _cancel)),
            const SizedBox(width: 8),
            Expanded(child: _ActionBtn(label: 'Apply', primary: true, onTap: _apply)),
          ],
        ),
      );

  Widget _div() => Container(height: 1, color: _C.divider);
}

// ─── Pen Type Card ────────────────────────────────────────────────────────────

class _PenTypeCard extends StatefulWidget {
  final PenType type;
  final bool isActive;
  final VoidCallback onTap;

  const _PenTypeCard({
    required this.type,
    required this.isActive,
    required this.onTap,
  });

  @override
  State<_PenTypeCard> createState() => _PenTypeCardState();
}

class _PenTypeCardState extends State<_PenTypeCard> {
  bool _hov = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _hov = true),
      onExit:  (_) => setState(() => _hov = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 120),
          decoration: BoxDecoration(
            color: widget.isActive
                ? _C.accent.withValues(alpha: 0.14)
                : _hov
                    ? _C.cardHov
                    : _C.card,
            borderRadius: BorderRadius.circular(7),
            border: Border.all(
              color: widget.isActive
                  ? _C.accent
                  : _hov
                      ? _C.border
                      : _C.divider,
              width: widget.isActive ? 1.5 : 1,
            ),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                widget.type.icon,
                size: 18,
                color: widget.isActive ? _C.accent : _C.txtSec,
              ),
              const SizedBox(height: 3),
              Text(
                widget.type.displayName,
                style: TextStyle(
                  fontFamily: _C.font,
                  fontSize: 9,
                  fontWeight: widget.isActive
                      ? FontWeight.w600
                      : FontWeight.w400,
                  color: widget.isActive ? _C.txtPri : _C.txtMut,
                  height: 1.3,
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

// ─── Color Tile ───────────────────────────────────────────────────────────────

class _ColorTile extends StatefulWidget {
  final Color color;
  final bool isSelected;
  final VoidCallback onTap;
  const _ColorTile({required this.color, required this.isSelected, required this.onTap});

  @override
  State<_ColorTile> createState() => _ColorTileState();
}

class _ColorTileState extends State<_ColorTile> {
  bool _hov = false;

  bool get _isDark =>
      (widget.color.red * 0.299 + widget.color.green * 0.587 +
              widget.color.blue * 0.114) <
          128;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _hov = true),
      onExit:  (_) => setState(() => _hov = false),
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 100),
          decoration: BoxDecoration(
            color: widget.color,
            borderRadius: BorderRadius.circular(6),
            border: Border.all(
              color: widget.isSelected
                  ? _C.accent
                  : _hov
                      ? Colors.white.withValues(alpha: 0.3)
                      : widget.color == Colors.white
                          ? _C.border
                          : Colors.transparent,
              width: widget.isSelected ? 2 : 1,
            ),
            boxShadow: widget.isSelected
                ? [
                    BoxShadow(
                      color: _C.accent.withValues(alpha: 0.35),
                      blurRadius: 6,
                    ),
                  ]
                : null,
          ),
          child: widget.isSelected
              ? Center(
                  child: Icon(Icons.check, size: 14,
                      color: _isDark ? Colors.white : Colors.black87))
              : null,
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
        overlayShape: const RoundSliderOverlayShape(overlayRadius: 14),
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
        onExit:  (_) => setState(() => _hov = false),
        child: GestureDetector(
          onTap: widget.onTap,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 120),
            height: 34,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: widget.primary
                  ? (_hov ? _C.accentHov : _C.accent)
                  : Colors.transparent,
              borderRadius: BorderRadius.circular(6),
              border: widget.primary ? null : Border.all(color: _C.inputBor),
            ),
            child: Text(
              widget.label,
              style: TextStyle(
                fontFamily: _C.font,
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: widget.primary ? Colors.white : _C.txtSec,
                height: 1.5,
              ),
            ),
          ),
        ),
      );
}

// ─── Micro widgets ────────────────────────────────────────────────────────────

class _Label extends StatelessWidget {
  final String text;
  const _Label(this.text);

  @override
  Widget build(BuildContext context) => Text(
        text,
        style: const TextStyle(
          fontFamily: _C.font,
          fontSize: 10,
          fontWeight: FontWeight.w600,
          color: _C.txtMut,
          letterSpacing: 0.8,
          height: 1.5,
        ),
      );
}

class _Badge extends StatelessWidget {
  final String text;
  const _Badge(this.text);

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
        decoration: BoxDecoration(
          color: _C.accent,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          text,
          style: const TextStyle(
            fontFamily: _C.font,
            fontSize: 10,
            fontWeight: FontWeight.w600,
            color: Colors.white,
            height: 1.4,
          ),
        ),
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
        onExit:  (_) => setState(() => _hov = false),
        child: GestureDetector(
          onTap: widget.onTap,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 100),
            width: 26,
            height: 26,
            decoration: BoxDecoration(
              color: _hov ? _C.card : Colors.transparent,
              borderRadius: BorderRadius.circular(5),
              border: Border.all(
                  color: _hov ? _C.border : Colors.transparent),
            ),
            child: const Icon(Icons.close, size: 14, color: _C.txtMut),
          ),
        ),
      );
}