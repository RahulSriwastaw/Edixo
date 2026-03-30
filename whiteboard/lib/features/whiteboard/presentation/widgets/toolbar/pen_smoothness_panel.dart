import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:eduhub_whiteboard/features/drawing/providers/tool_provider.dart';
import 'package:eduhub_whiteboard/features/drawing/domain/models/drawing_tool.dart';

// ─── Constants ────────────────────────────────────────────────────────────────
const _kNavy = Color(0xFF1A1A2E);
const _kOrange = Color(0xFFF4511E);
const _kGray = Color(0xFF9CA3AF);
const _kSurface = Color(0xFF222240);
const _kBorder = Color(0x18FFFFFF);

// ─── Smoothness Panel ─────────────────────────────────────────────────────────
/// A compact floating settings strip that appears below/near the toolbar
/// when a drawing tool is selected. Shows: Smoothing Level, Stabilizer, Taper.
class PenSmoothnessPanel extends ConsumerWidget {
  const PenSmoothnessPanel({super.key});

  static const _smoothingLabels = ['Off', 'Low', 'Med', 'High'];

  static bool shouldShow(ToolType tool) {
    return [
      ToolType.pen,
      ToolType.pencil,
      ToolType.ballpoint,
      ToolType.highlighter,
      ToolType.marker,
      ToolType.laserPointer,
    ].contains(tool);
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final drawingState = ref.watch(drawingStateProvider);
    final notifier = ref.read(drawingStateProvider.notifier);
    final tool = drawingState.activeTool;

    if (!shouldShow(tool)) return const SizedBox.shrink();

    final smoothing = drawingState.currentSettings.smoothing;
    final isPen = tool == ToolType.pen ||
        tool == ToolType.pencil ||
        tool == ToolType.ballpoint;

    return AnimatedSlide(
      offset: Offset.zero,
      duration: const Duration(milliseconds: 200),
      curve: Curves.easeOut,
      child: AnimatedOpacity(
        opacity: 1.0,
        duration: const Duration(milliseconds: 180),
        child: Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          decoration: BoxDecoration(
            color: _kNavy.withOpacity(0.95),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: _kBorder),
            boxShadow: const [
              BoxShadow(
                color: Color(0x55000000),
                blurRadius: 20,
                offset: Offset(0, 4),
              ),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              // ── Section label ──────────────────────────────────────────────
              Text(
                'Smoothing',
                style: GoogleFonts.dmSans(
                  color: _kGray,
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(width: 10),

              // ── Level Selector (Off / Low / Med / High) ────────────────────
              ...List.generate(4, (level) {
                final isActive = smoothing.level == level;
                return GestureDetector(
                  onTap: () => notifier.setSmoothingLevel(level),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 150),
                    margin: const EdgeInsets.symmetric(horizontal: 2),
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: isActive ? _kOrange : _kSurface,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: isActive ? _kOrange : _kBorder,
                      ),
                    ),
                    child: Text(
                      _smoothingLabels[level],
                      style: GoogleFonts.dmSans(
                        color: isActive ? Colors.white : _kGray,
                        fontSize: 10,
                        fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
                      ),
                    ),
                  ),
                );
              }),

              const SizedBox(width: 12),
              _vDivider(),
              const SizedBox(width: 12),

              // ── Stabilizer toggle ──────────────────────────────────────────
              _ToggleChip(
                label: 'Stabilizer',
                icon: Icons.gesture,
                value: smoothing.stabilizerEnabled,
                onChanged: (v) => notifier.setStabilizer(v),
              ),

              const SizedBox(width: 8),

              // ── Taper toggle (only for pen-type tools) ─────────────────────
              if (isPen) ...[
                _ToggleChip(
                  label: 'Taper',
                  icon: Icons.edit_outlined,
                  value: smoothing.taperEnabled,
                  onChanged: (v) => notifier.setTaperEnabled(v),
                ),
                const SizedBox(width: 12),
                _vDivider(),
                const SizedBox(width: 12),
              ],

              // ── Min/Max Width display + quick adjust ───────────────────────
              _WidthControl(
                label: 'Min',
                value: smoothing.minWidth,
                min: 0.5,
                max: 8.0,
                onChanged: (v) => notifier.setStrokeWidthRange(v, smoothing.maxWidth),
              ),
              const SizedBox(width: 8),
              _WidthControl(
                label: 'Max',
                value: smoothing.maxWidth,
                min: 2.0,
                max: 30.0,
                onChanged: (v) => notifier.setStrokeWidthRange(smoothing.minWidth, v),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _vDivider() => Container(
        width: 1,
        height: 24,
        color: _kBorder,
      );
}

// ─── Toggle Chip ──────────────────────────────────────────────────────────────
class _ToggleChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool value;
  final ValueChanged<bool> onChanged;

  const _ToggleChip({
    required this.label,
    required this.icon,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => onChanged(!value),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          color: value ? _kOrange.withOpacity(0.15) : _kSurface,
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: value ? _kOrange.withOpacity(0.6) : _kBorder,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              color: value ? _kOrange : _kGray,
              size: 12,
            ),
            const SizedBox(width: 4),
            Text(
              label,
              style: GoogleFonts.dmSans(
                color: value ? _kOrange : _kGray,
                fontSize: 10,
                fontWeight: value ? FontWeight.w700 : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Width Control ────────────────────────────────────────────────────────────
class _WidthControl extends StatelessWidget {
  final String label;
  final double value;
  final double min;
  final double max;
  final ValueChanged<double> onChanged;

  const _WidthControl({
    required this.label,
    required this.value,
    required this.min,
    required this.max,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          label,
          style: GoogleFonts.dmSans(color: _kGray, fontSize: 9),
        ),
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _microBtn(Icons.remove, () {
              final next = (value - 0.5).clamp(min, max);
              if (next != value) onChanged(next);
            }),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: Text(
                value.toStringAsFixed(1),
                style: GoogleFonts.dmSans(
                  color: Colors.white70,
                  fontSize: 10,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            _microBtn(Icons.add, () {
              final next = (value + 0.5).clamp(min, max);
              if (next != value) onChanged(next);
            }),
          ],
        ),
      ],
    );
  }

  Widget _microBtn(IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 18,
        height: 18,
        decoration: BoxDecoration(
          color: _kSurface,
          borderRadius: BorderRadius.circular(4),
          border: Border.all(color: _kBorder),
        ),
        child: Icon(icon, color: _kGray, size: 12),
      ),
    );
  }
}

// ─── Positioned Wrapper ───────────────────────────────────────────────────────
/// Place this in the same Stack as FloatingToolBarWrapper.
/// It floats above the toolbar and auto-shows/hides with the active tool.
///
///   Stack(
///     children: [
///       WhiteboardCanvas(),
///       const PenSmoothnessPanelWrapper(),   // ← add this
///       const FloatingToolBarWrapper(),
///     ],
///   )
class PenSmoothnessPanelWrapper extends ConsumerWidget {
  const PenSmoothnessPanelWrapper({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final tool = ref.watch(drawingStateProvider).activeTool;
    if (!PenSmoothnessPanel.shouldShow(tool)) return const SizedBox.shrink();

    return Positioned(
      bottom: 92, // above the 64dp toolbar + 16dp gap + 12dp margin
      left: 0,
      right: 0,
      child: Center(
        child: const PenSmoothnessPanel(),
      ),
    );
  }
}
