import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../core/theme/app_theme.dart';
import '../../../providers/canvas_provider.dart';
import '../../../providers/tool_provider.dart';
import '../panels/question_settings_dialog.dart';

// Provider to control panel open/close state
final settingsPanelOpenProvider = StateProvider<bool>((ref) => false);

// ─────────────────────────────────────────────────────────────────────────────
// FloatingSettingsButton — small FAB in canvas top-left corner
// ─────────────────────────────────────────────────────────────────────────────

class FloatingSettingsButton extends ConsumerWidget {
  const FloatingSettingsButton({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isOpen = ref.watch(settingsPanelOpenProvider);

    return Stack(
      clipBehavior: Clip.none,
      children: [
        // ── FAB button ─────────────────────────────────────────────────────
        Positioned(
          left: 12,
          top: 12,
          child: Tooltip(
            message: 'Settings / Subject Modes',
            child: GestureDetector(
              onTap: () => ref
                  .read(settingsPanelOpenProvider.notifier)
                  .state = !isOpen,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: isOpen
                      ? AppTheme.primaryOrange
                      : const Color(0xFF1E2235),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isOpen
                        ? AppTheme.primaryOrange
                        : Colors.white.withOpacity(0.15),
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: isOpen
                          ? AppTheme.primaryOrange.withOpacity(0.4)
                          : Colors.black.withOpacity(0.4),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    )
                  ],
                ),
                child: Center(
                  child: AnimatedRotation(
                    turns: isOpen ? 0.125 : 0,
                    duration: const Duration(milliseconds: 200),
                    child: Icon(
                      isOpen ? Icons.close : Icons.settings_outlined,
                      color: Colors.white,
                      size: 20,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),

        // ── Panel ─────────────────────────────────────────────────────────
        if (isOpen)
          Positioned(
            left: 12,
            top: 64,
            child: _FloatingPanel(
              onClose: () =>
                  ref.read(settingsPanelOpenProvider.notifier).state = false,
            ),
          ),
      ],
    );
  }
}

// ─── Floating Panel ──────────────────────────────────────────────────────────

class _FloatingPanel extends ConsumerWidget {
  final VoidCallback onClose;
  const _FloatingPanel({required this.onClose});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final toolState = ref.watch(toolProvider);
    final canvasState = ref.watch(canvasStateProvider);
    final toolNotifier = ref.read(toolProvider.notifier);
    final canvasNotifier = ref.read(canvasStateProvider.notifier);

    return Material(
      color: Colors.transparent,
      child: Container(
        width: 220,
        constraints: const BoxConstraints(maxHeight: 500),
        decoration: BoxDecoration(
          color: const Color(0xFF1A1A2E),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withOpacity(0.1)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.5),
              blurRadius: 24,
              offset: const Offset(0, 8),
            )
          ],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(16),
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Title
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.04),
                    border: Border(bottom: BorderSide(color: Colors.white.withOpacity(0.07))),
                  ),
                  child: const Row(
                    children: [
                      Icon(Icons.tune, color: AppTheme.primaryOrange, size: 16),
                      SizedBox(width: 8),
                      Text(
                        'Settings',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                ),

                // ── Section: Subject Mode ─────────────────────────────────
                const _SectionHeader('Subject Mode'),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  child: Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: SubjectMode.values.map((mode) {
                      final isActive = toolState.activeMode == mode;
                      return _ModeChip(
                        label: _modeLabel(mode),
                        icon: _modeIcon(mode),
                        isActive: isActive,
                        onTap: () => toolNotifier.setSubjectMode(mode),
                      );
                    }).toList(),
                  ),
                ),

                const _Divider(),

                // ── Section: Canvas ───────────────────────────────────────
                const _SectionHeader('Canvas'),
                _PanelToggleTile(
                  icon: canvasState.showGrid ? Icons.grid_on : Icons.grid_off_outlined,
                  label: 'Show Grid',
                  value: canvasState.showGrid,
                  onChanged: (_) => canvasNotifier.toggleGrid(),
                ),
                _PanelToggleTile(
                  icon: Icons.fullscreen,
                  label: 'Fullscreen',
                  value: canvasState.isFullscreen,
                  onChanged: (_) => canvasNotifier.toggleFullscreen(),
                ),

                const _Divider(),

                // ── Section: Question Style ───────────────────────────────
                const _SectionHeader('Question Style'),
                _PanelActionTile(
                  icon: Icons.palette_outlined,
                  label: 'Presentation Settings',
                  onTap: () {
                    onClose();
                    showDialog(
                      context: context,
                      builder: (_) => const QuestionSettingsDialog(),
                    );
                  },
                ),

                const SizedBox(height: 8),
              ],
            ),
          ),
        ),
      ),
    );
  }

  String _modeLabel(SubjectMode m) {
    switch (m) {
      case SubjectMode.general: return 'General';
      case SubjectMode.math: return 'Math';
      case SubjectMode.physics: return 'Physics';
      case SubjectMode.chemistry: return 'Chem';
      case SubjectMode.englishHindi: return 'Eng/Hi';
      case SubjectMode.sscRailway: return 'SSC';
      case SubjectMode.upsc: return 'UPSC';
    }
  }

  IconData _modeIcon(SubjectMode m) {
    switch (m) {
      case SubjectMode.general: return Icons.dashboard_outlined;
      case SubjectMode.math: return Icons.calculate_outlined;
      case SubjectMode.physics: return Icons.bolt_outlined;
      case SubjectMode.chemistry: return Icons.science_outlined;
      case SubjectMode.englishHindi: return Icons.translate_outlined;
      case SubjectMode.sscRailway: return Icons.train_outlined;
      case SubjectMode.upsc: return Icons.account_balance_outlined;
    }
  }
}

// ─── Small Components ─────────────────────────────────────────────────────────

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader(this.title);
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 6),
        child: Text(
          title.toUpperCase(),
          style: const TextStyle(
            color: Colors.white38,
            fontSize: 9,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.4,
          ),
        ),
      );
}

class _Divider extends StatelessWidget {
  const _Divider();
  @override
  Widget build(BuildContext context) => Container(
        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        height: 1,
        color: Colors.white.withOpacity(0.07),
      );
}

class _ModeChip extends StatelessWidget {
  final String label;
  final IconData icon;
  final bool isActive;
  final VoidCallback onTap;
  const _ModeChip({
    required this.label,
    required this.icon,
    required this.isActive,
    required this.onTap,
  });
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 150),
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
        decoration: BoxDecoration(
          color: isActive
              ? AppTheme.primaryOrange.withOpacity(0.2)
              : Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: isActive
                ? AppTheme.primaryOrange
                : Colors.white.withOpacity(0.1),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon,
                size: 12,
                color: isActive ? AppTheme.primaryOrange : Colors.white54),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                color: isActive ? AppTheme.primaryOrange : Colors.white60,
                fontSize: 10,
                fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PanelToggleTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool value;
  final ValueChanged<bool> onChanged;
  const _PanelToggleTile(
      {required this.icon, required this.label, required this.value, required this.onChanged});
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 2),
      child: Row(
        children: [
          Icon(icon, size: 14, color: Colors.white54),
          const SizedBox(width: 8),
          Expanded(
            child: Text(label,
                style: const TextStyle(color: Colors.white70, fontSize: 12)),
          ),
          Transform.scale(
            scale: 0.75,
            child: Switch(
              value: value,
              onChanged: onChanged,
              activeThumbColor: AppTheme.primaryOrange,
            ),
          ),
        ],
      ),
    );
  }
}

class _PanelActionTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  const _PanelActionTile(
      {required this.icon, required this.label, required this.onTap});
  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        child: Row(
          children: [
            Icon(icon, size: 14, color: AppTheme.primaryOrange),
            const SizedBox(width: 8),
            Expanded(
              child: Text(label,
                  style: const TextStyle(color: Colors.white70, fontSize: 12)),
            ),
            const Icon(Icons.chevron_right, size: 14, color: Colors.white30),
          ],
        ),
      ),
    );
  }
}


