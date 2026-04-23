// lib/core/widgets/color_picker/tool_color_picker.dart
// Shared compact color picker used across ALL whiteboard tools.
// Shows 3 recent/preset swatches + 1 "+" custom button that opens full HSV picker.

import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// ─── Design Tokens ─────────────────────────────────────────────────────────
class _C {
  static const body      = Color(0xFF0F0F0F);
  static const sidebar   = Color(0xFF141414);
  static const card      = Color(0xFF1A1A1A);
  static const border    = Color(0xFF252525);
  static const divider   = Color(0xFF1E1E1E);
  static const accent    = Color(0xFFFF6B2B);
  static const inputBg   = Color(0xFF1A1A1A);
  static const inputBor  = Color(0xFF2A2A2A);
  static const txtPri    = Color(0xFFEFEFEF);
  static const txtSec    = Color(0xFF888888);
  static const txtMut    = Color(0xFF555555);
}

// ─── Recent Colors Provider (shared across all tools) ──────────────────────
// Keeps last 3 used colors in memory — persists across tool switches.

final recentColorsProvider = StateProvider<List<Color>>((ref) => [
  const Color(0xFFE53935), // Red
  const Color(0xFF1E88E5), // Blue
  const Color(0xFF212121), // Black
]);

class RecentColorsNotifier {
  static void add(WidgetRef ref, Color color) {
    final current = List<Color>.from(ref.read(recentColorsProvider));
    current.removeWhere((c) => c.value == color.value);
    current.insert(0, color);
    if (current.length > 3) current.removeLast();
    ref.read(recentColorsProvider.notifier).state = current;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN WIDGET: ToolColorPicker
// Usage:
//   ToolColorPicker(
//     selected: currentColor,
//     onSelect: (color) => setState(() => _color = color),
//   )
// ════════════════════════════════════════════════════════════════════════════

class ToolColorPicker extends ConsumerWidget {
  final Color selected;
  final ValueChanged<Color> onSelect;

  /// If true, shows inline row. If false (default), shows as a compact row.
  final bool inline;

  const ToolColorPicker({
    super.key,
    required this.selected,
    required this.onSelect,
    this.inline = true,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final recents = ref.watch(recentColorsProvider);

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        // ── 3 recent/preset swatches ──────────────────────────────────────
        ...recents.map(
          (c) => _Swatch(
            color: c,
            isSelected: selected.value == c.value,
            onTap: () {
              RecentColorsNotifier.add(ref, c);
              onSelect(c);
            },
          ),
        ),

        const SizedBox(width: 4),

        // ── Vertical divider ──────────────────────────────────────────────
        Container(width: 1, height: 20, color: _C.divider),

        const SizedBox(width: 4),

        // ── Custom color "+" button ───────────────────────────────────────
        _CustomBtn(
          currentColor: selected,
          onSelect: (c) {
            RecentColorsNotifier.add(ref, c);
            onSelect(c);
          },
        ),
      ],
    );
  }
}

// ─── Swatch dot ─────────────────────────────────────────────────────────────

class _Swatch extends StatefulWidget {
  final Color color;
  final bool isSelected;
  final VoidCallback onTap;

  const _Swatch({
    required this.color,
    required this.isSelected,
    required this.onTap,
  });

  @override
  State<_Swatch> createState() => _SwatchState();
}

class _SwatchState extends State<_Swatch> {
  bool _hov = false;

  bool _isDark(Color c) =>
      (c.red * 0.299 + c.green * 0.587 + c.blue * 0.114) < 128;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 5),
      child: MouseRegion(
        onEnter: (_) => setState(() => _hov = true),
        onExit:  (_) => setState(() => _hov = false),
        child: GestureDetector(
          onTap: widget.onTap,
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 120),
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              color: widget.color,
              shape: BoxShape.circle,
              border: Border.all(
                color: widget.isSelected
                    ? _C.accent
                    : _hov
                        ? Colors.white30
                        : widget.color == Colors.white ||
                                widget.color.computeLuminance() > 0.8
                            ? _C.border
                            : Colors.transparent,
                width: widget.isSelected ? 2.5 : 1.5,
              ),
            ),
            child: widget.isSelected
                ? Icon(
                    Icons.check_rounded,
                    size: 13,
                    color: _isDark(widget.color) ? Colors.white : Colors.black87,
                  )
                : null,
          ),
        ),
      ),
    );
  }
}

// ─── Custom Color Button ──────────────────────────────────────────────────────

class _CustomBtn extends StatefulWidget {
  final Color currentColor;
  final ValueChanged<Color> onSelect;

  const _CustomBtn({required this.currentColor, required this.onSelect});

  @override
  State<_CustomBtn> createState() => _CustomBtnState();
}

class _CustomBtnState extends State<_CustomBtn> {
  bool _hov = false;

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _hov = true),
      onExit:  (_) => setState(() => _hov = false),
      child: Tooltip(
        message: 'Custom color',
        waitDuration: const Duration(milliseconds: 500),
        child: GestureDetector(
          onTap: () => _openPicker(context),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 120),
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              color: _hov ? _C.inputBor : _C.card,
              shape: BoxShape.circle,
              border: Border.all(color: _C.border, width: 1.5),
            ),
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Rainbow ring hint
                Container(
                  width: 16,
                  height: 16,
                  decoration: const BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: SweepGradient(
                      colors: [
                        Color(0xFFFF0000),
                        Color(0xFFFFFF00),
                        Color(0xFF00FF00),
                        Color(0xFF00FFFF),
                        Color(0xFF0000FF),
                        Color(0xFFFF00FF),
                        Color(0xFFFF0000),
                      ],
                    ),
                  ),
                ),
                // White center dot
                Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: Color(0xFF1A1A1A),
                    shape: BoxShape.circle,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  void _openPicker(BuildContext context) {
    showDialog<Color>(
      context: context,
      barrierColor: Colors.black45,
      builder: (_) => _FullColorPicker(initial: widget.currentColor),
    ).then((c) {
      if (c != null) widget.onSelect(c);
    });
  }
}

// ════════════════════════════════════════════════════════════════════════════
// FULL COLOR PICKER DIALOG — HSV wheel + sliders + hex input
// ════════════════════════════════════════════════════════════════════════════

class _FullColorPicker extends StatefulWidget {
  final Color initial;
  const _FullColorPicker({required this.initial});

  @override
  State<_FullColorPicker> createState() => _FullColorPickerState();
}

class _FullColorPickerState extends State<_FullColorPicker>
    with SingleTickerProviderStateMixin {
  late double _h, _s, _v, _a;
  late TextEditingController _hexCtrl;
  late TabController _tabCtrl;

  // Preset palette (full)
  static const _palette = [
    // Row 1 - Reds/Pinks
    Color(0xFFFFFFFF), Color(0xFFF5F5F5), Color(0xFFE0E0E0),
    Color(0xFF9E9E9E), Color(0xFF616161), Color(0xFF212121),
    // Row 2 - Blues
    Color(0xFFE53935), Color(0xFFD81B60), Color(0xFF8E24AA),
    Color(0xFF5E35B1), Color(0xFF1E88E5), Color(0xFF039BE5),
    // Row 3 - Greens
    Color(0xFF00ACC1), Color(0xFF00897B), Color(0xFF43A047),
    Color(0xFF7CB342), Color(0xFFC0CA33), Color(0xFFFDD835),
    // Row 4 - Oranges
    Color(0xFFFFB300), Color(0xFFFB8C00), Color(0xFFFF6B2B),
    Color(0xFFE53935), Color(0xFF6D4C41), Color(0xFF546E7A),
  ];

  @override
  void initState() {
    super.initState();
    final hsv = HSVColor.fromColor(widget.initial);
    _h = hsv.hue;
    _s = hsv.saturation;
    _v = hsv.value;
    _a = hsv.alpha;
    _hexCtrl = TextEditingController(text: _toHex(_current));
    _tabCtrl = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _hexCtrl.dispose();
    _tabCtrl.dispose();
    super.dispose();
  }

  Color get _current => HSVColor.fromAHSV(_a, _h, _s, _v).toColor();

  String _toHex(Color c) =>
      '#${c.red.toRadixString(16).padLeft(2, '0')}'
      '${c.green.toRadixString(16).padLeft(2, '0')}'
      '${c.blue.toRadixString(16).padLeft(2, '0')}'.toUpperCase();

  Color? _fromHex(String hex) {
    final clean = hex.replaceAll('#', '');
    if (clean.length != 6) return null;
    final val = int.tryParse('FF$clean', radix: 16);
    return val != null ? Color(val) : null;
  }

  void _syncHex() {
    _hexCtrl.text = _toHex(_current);
    _hexCtrl.selection = TextSelection.fromPosition(
        TextPosition(offset: _hexCtrl.text.length));
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: Colors.transparent,
      insetPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
      child: Container(
        width: 280,
        decoration: BoxDecoration(
          color: _C.sidebar,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: _C.border),
          boxShadow: const [
            BoxShadow(color: Color(0x77000000), blurRadius: 24, offset: Offset(0, 8)),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // ── Header ────────────────────────────────────────────────────
            Container(
              height: 44,
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: _C.divider)),
              ),
              child: Row(
                children: [
                  // Live preview swatch
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 80),
                    width: 22,
                    height: 22,
                    decoration: BoxDecoration(
                      color: _current,
                      borderRadius: BorderRadius.circular(5),
                      border: Border.all(color: _C.border),
                    ),
                  ),
                  const SizedBox(width: 10),
                  const Text(
                    'Color Picker',
                    style: TextStyle(
                      fontFamily: 'Inter',
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: _C.txtPri,
                      height: 1.5,
                    ),
                  ),
                  const Spacer(),
                  GestureDetector(
                    onTap: () => Navigator.pop(context),
                    child: const Icon(Icons.close_rounded,
                        size: 16, color: _C.txtMut),
                  ),
                ],
              ),
            ),

            // ── Tabs: Sliders | Palette ────────────────────────────────
            Container(
              height: 36,
              margin: const EdgeInsets.fromLTRB(14, 10, 14, 0),
              decoration: BoxDecoration(
                color: _C.card,
                borderRadius: BorderRadius.circular(6),
                border: Border.all(color: _C.border),
              ),
              child: TabBar(
                controller: _tabCtrl,
                indicator: BoxDecoration(
                  color: _C.accent,
                  borderRadius: BorderRadius.circular(5),
                ),
                indicatorSize: TabBarIndicatorSize.tab,
                labelColor: Colors.white,
                unselectedLabelColor: _C.txtMut,
                labelStyle: const TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                ),
                dividerColor: Colors.transparent,
                tabs: const [
                  Tab(text: 'Sliders'),
                  Tab(text: 'Palette'),
                ],
              ),
            ),

            // ── Tab Content ────────────────────────────────────────────
            SizedBox(
              height: 220,
              child: TabBarView(
                controller: _tabCtrl,
                children: [
                  // ── SLIDERS tab ──────────────────────────────────────
                  Padding(
                    padding: const EdgeInsets.fromLTRB(14, 10, 14, 0),
                    child: Column(
                      children: [
                        _HueSlider(
                          hue: _h,
                          onChanged: (v) {
                            setState(() => _h = v);
                            _syncHex();
                          },
                        ),
                        const SizedBox(height: 10),
                        _GradientSlider(
                          label: 'S',
                          value: _s,
                          gradient: LinearGradient(colors: [
                            HSVColor.fromAHSV(1, _h, 0, _v).toColor(),
                            HSVColor.fromAHSV(1, _h, 1, _v).toColor(),
                          ]),
                          onChanged: (v) {
                            setState(() => _s = v);
                            _syncHex();
                          },
                        ),
                        const SizedBox(height: 8),
                        _GradientSlider(
                          label: 'V',
                          value: _v,
                          gradient: LinearGradient(colors: [
                            Colors.black,
                            HSVColor.fromAHSV(1, _h, _s, 1).toColor(),
                          ]),
                          onChanged: (v) {
                            setState(() => _v = v);
                            _syncHex();
                          },
                        ),
                        const SizedBox(height: 8),
                        _GradientSlider(
                          label: 'A',
                          value: _a,
                          gradient: LinearGradient(colors: [
                            _current.withValues(alpha: 0),
                            _current.withValues(alpha: 1),
                          ]),
                          onChanged: (v) {
                            setState(() => _a = v);
                            _syncHex();
                          },
                        ),
                      ],
                    ),
                  ),

                  // ── PALETTE tab ──────────────────────────────────────
                  Padding(
                    padding: const EdgeInsets.all(12),
                    child: Wrap(
                      spacing: 7,
                      runSpacing: 7,
                      children: _palette
                          .map((c) => GestureDetector(
                                onTap: () {
                                  final hsv = HSVColor.fromColor(c);
                                  setState(() {
                                    _h = hsv.hue;
                                    _s = hsv.saturation;
                                    _v = hsv.value;
                                    _a = 1.0;
                                  });
                                  _syncHex();
                                },
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 100),
                                  width: 26,
                                  height: 26,
                                  decoration: BoxDecoration(
                                    color: c,
                                    borderRadius: BorderRadius.circular(5),
                                    border: Border.all(
                                      color: _current.value == c.value
                                          ? _C.accent
                                          : c.computeLuminance() > 0.8
                                              ? _C.border
                                              : Colors.transparent,
                                      width: _current.value == c.value ? 2.5 : 1,
                                    ),
                                  ),
                                  child: _current.value == c.value
                                      ? Icon(Icons.check_rounded,
                                          size: 13,
                                          color: c.computeLuminance() > 0.5
                                              ? Colors.black87
                                              : Colors.white)
                                      : null,
                                ),
                              ))
                          .toList(),
                    ),
                  ),
                ],
              ),
            ),

            // ── Hex input + opacity ────────────────────────────────────
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 8, 14, 0),
              child: Row(
                children: [
                  // Hex field
                  Expanded(
                    child: Container(
                      height: 32,
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                      decoration: BoxDecoration(
                        color: _C.inputBg,
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: _C.inputBor),
                      ),
                      child: Row(
                        children: [
                          const Text('#',
                              style: TextStyle(
                                  fontFamily: 'Inter',
                                  fontSize: 11,
                                  color: _C.txtMut)),
                          Expanded(
                            child: TextField(
                              controller: _hexCtrl,
                              style: const TextStyle(
                                fontFamily: 'Inter',
                                fontSize: 11,
                                color: _C.txtPri,
                                letterSpacing: 1,
                              ),
                              decoration: const InputDecoration(
                                isDense: true,
                                border: InputBorder.none,
                                contentPadding:
                                    EdgeInsets.symmetric(horizontal: 4),
                              ),
                              maxLength: 7,
                              buildCounter: (_, {required currentLength,
                                      required isFocused,
                                      maxLength}) =>
                                  null,
                              onSubmitted: (val) {
                                final c = _fromHex(val);
                                if (c != null) {
                                  final hsv = HSVColor.fromColor(c);
                                  setState(() {
                                    _h = hsv.hue;
                                    _s = hsv.saturation;
                                    _v = hsv.value;
                                  });
                                }
                              },
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  // Opacity badge
                  Container(
                    height: 32,
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    decoration: BoxDecoration(
                      color: _C.inputBg,
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: _C.inputBor),
                    ),
                    child: Center(
                      child: Text(
                        '${(_a * 100).round()}%',
                        style: const TextStyle(
                          fontFamily: 'Inter',
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                          color: _C.txtPri,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            // ── Action buttons ─────────────────────────────────────────
            Padding(
              padding: const EdgeInsets.all(14),
              child: Row(
                children: [
                  Expanded(
                    child: _Btn(
                      label: 'Cancel',
                      bg: Colors.transparent,
                      border: _C.border,
                      fg: _C.txtSec,
                      onTap: () => Navigator.pop(context),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _Btn(
                      label: 'Apply',
                      bg: _C.accent,
                      border: _C.accent,
                      fg: Colors.white,
                      onTap: () => Navigator.pop(context, _current),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Hue Slider ──────────────────────────────────────────────────────────────

class _HueSlider extends StatelessWidget {
  final double hue;
  final ValueChanged<double> onChanged;

  const _HueSlider({required this.hue, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const SizedBox(
          width: 14,
          child: Text('H',
              style: TextStyle(fontFamily: 'Inter', fontSize: 10, color: _C.txtSec)),
        ),
        Expanded(
          child: SizedBox(
            height: 20,
            child: LayoutBuilder(builder: (_, constraints) {
              return GestureDetector(
                onHorizontalDragUpdate: (d) {
                  final frac = (d.localPosition.dx / constraints.maxWidth)
                      .clamp(0.0, 1.0);
                  onChanged(frac * 360);
                },
                onTapDown: (d) {
                  final frac = (d.localPosition.dx / constraints.maxWidth)
                      .clamp(0.0, 1.0);
                  onChanged(frac * 360);
                },
                child: CustomPaint(
                  painter: _HueBarPainter(hue: hue),
                ),
              );
            }),
          ),
        ),
        const SizedBox(width: 6),
        _ValBadge(label: '${hue.round()}°'),
      ],
    );
  }
}

class _HueBarPainter extends CustomPainter {
  final double hue;
  const _HueBarPainter({required this.hue});

  @override
  void paint(Canvas canvas, Size size) {
    final rect = Rect.fromLTWH(0, (size.height - 10) / 2, size.width, 10);
    final rrect = RRect.fromRectAndRadius(rect, const Radius.circular(5));

    // Hue gradient
    final grad = LinearGradient(colors: List.generate(
      7,
      (i) => HSVColor.fromAHSV(1, i * 60.0, 1, 1).toColor(),
    )).createShader(rect);
    canvas.drawRRect(rrect, Paint()..shader = grad);

    // Thumb
    final tx = (hue / 360) * size.width;
    canvas.drawCircle(
      Offset(tx, size.height / 2),
      7,
      Paint()
        ..color = Colors.white
        ..style = PaintingStyle.fill
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 2),
    );
    canvas.drawCircle(
      Offset(tx, size.height / 2),
      6,
      Paint()
        ..color = HSVColor.fromAHSV(1, hue, 1, 1).toColor()
        ..style = PaintingStyle.fill,
    );
    canvas.drawCircle(
      Offset(tx, size.height / 2),
      6,
      Paint()
        ..color = Colors.white
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.5,
    );
  }

  @override
  bool shouldRepaint(_HueBarPainter old) => old.hue != hue;
}

// ─── Gradient Slider (S / V / A) ─────────────────────────────────────────────

class _GradientSlider extends StatelessWidget {
  final String label;
  final double value;
  final LinearGradient gradient;
  final ValueChanged<double> onChanged;

  const _GradientSlider({
    required this.label,
    required this.value,
    required this.gradient,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        SizedBox(
          width: 14,
          child: Text(label,
              style: const TextStyle(
                  fontFamily: 'Inter', fontSize: 10, color: _C.txtSec)),
        ),
        Expanded(
          child: SizedBox(
            height: 20,
            child: LayoutBuilder(builder: (_, c) {
              return GestureDetector(
                onHorizontalDragUpdate: (d) {
                  onChanged((d.localPosition.dx / c.maxWidth).clamp(0.0, 1.0));
                },
                onTapDown: (d) {
                  onChanged((d.localPosition.dx / c.maxWidth).clamp(0.0, 1.0));
                },
                child: CustomPaint(
                  painter: _GradBarPainter(
                      value: value, gradient: gradient, width: c.maxWidth),
                ),
              );
            }),
          ),
        ),
        const SizedBox(width: 6),
        _ValBadge(label: '${(value * 100).round()}%'),
      ],
    );
  }
}

class _GradBarPainter extends CustomPainter {
  final double value;
  final LinearGradient gradient;
  final double width;

  const _GradBarPainter({
    required this.value,
    required this.gradient,
    required this.width,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final rect = Rect.fromLTWH(0, (size.height - 10) / 2, size.width, 10);
    final rrect = RRect.fromRectAndRadius(rect, const Radius.circular(5));

    // Checkerboard for alpha
    canvas.drawRRect(rrect, Paint()..color = const Color(0xFF444444));

    canvas.drawRRect(
      rrect,
      Paint()..shader = gradient.createShader(rect),
    );

    // Thumb
    final tx = value * size.width;
    canvas.drawCircle(
      Offset(tx, size.height / 2),
      7,
      Paint()..color = Colors.white..maskFilter = const MaskFilter.blur(BlurStyle.normal, 2),
    );
    canvas.drawCircle(Offset(tx, size.height / 2), 6,
        Paint()..color = Colors.white);
    canvas.drawCircle(
      Offset(tx, size.height / 2),
      6,
      Paint()
        ..color = Colors.black26
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1,
    );
  }

  @override
  bool shouldRepaint(_GradBarPainter old) =>
      old.value != value || old.gradient != gradient;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

class _ValBadge extends StatelessWidget {
  final String label;
  const _ValBadge({required this.label});

  @override
  Widget build(BuildContext context) => Container(
        width: 42,
        height: 22,
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: _C.inputBg,
          borderRadius: BorderRadius.circular(5),
          border: Border.all(color: _C.inputBor),
        ),
        child: Text(label,
            style: const TextStyle(
                fontFamily: 'Inter', fontSize: 9,
                fontWeight: FontWeight.w500, color: _C.txtPri)),
      );
}

class _Btn extends StatelessWidget {
  final String label;
  final Color bg;
  final Color border;
  final Color fg;
  final VoidCallback onTap;

  const _Btn({
    required this.label,
    required this.bg,
    required this.border,
    required this.fg,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: onTap,
        child: Container(
          height: 34,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: bg,
            borderRadius: BorderRadius.circular(6),
            border: Border.all(color: border),
          ),
          child: Text(label,
              style: TextStyle(
                  fontFamily: 'Inter',
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: fg)),
        ),
      );
}