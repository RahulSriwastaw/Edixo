import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/canvas_provider.dart';

class WorkspaceSettingsDialog extends ConsumerWidget {
  const WorkspaceSettingsDialog({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final canvasState = ref.watch(canvasNotifierProvider);
    final notifier = ref.read(canvasNotifierProvider.notifier);

    return Dialog(
      backgroundColor: const Color(0xFF2D2D3A),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Container(
        width: 340,
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.tune, color: Color(0xFFFF6B35), size: 24),
                const SizedBox(width: 8),
                const Text('Workspace Settings', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.white54),
                  onPressed: () => Navigator.pop(context),
                  visualDensity: VisualDensity.compact,
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Show Grid Toggle
            _toggleRow(
              icon: Icons.grid_on,
              label: 'Show Grid',
              value: canvasState.showGrid,
              onChanged: (_) => notifier.toggleGrid(),
            ),
            const SizedBox(height: 12),

            // Fullscreen Toggle
            _toggleRow(
              icon: Icons.fullscreen,
              label: 'Fullscreen Mode',
              value: canvasState.isFullscreen,
              onChanged: (_) => notifier.toggleFullscreen(),
            ),
            const SizedBox(height: 20),

            // Teaching Mode (disabled for now)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white10,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Row(
                children: [
                  Icon(Icons.school_outlined, size: 28, color: Colors.white70),
                  SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Teaching Mode', style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600)),
                        SizedBox(height: 2),
                        Text('Hide all UI chrome to maximize canvas area', style: TextStyle(color: Colors.white54, fontSize: 12)),
                      ],
                    ),
                  ),
                  Text('Soon', style: TextStyle(color: Colors.white54, fontSize: 12)),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Open Theme Settings Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.pop(context);
                },
                icon: const Icon(Icons.palette_outlined, color: Colors.white),
                label: const Text('Question & Background Colors'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white10,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _toggleRow({
    required IconData icon,
    required String label,
    required bool value,
    required ValueChanged<bool> onChanged,
  }) {
    return Row(
      children: [
        Icon(icon, size: 20, color: Colors.white70),
        const SizedBox(width: 12),
        Expanded(
          child: Text(label, style: const TextStyle(color: Colors.white, fontSize: 15)),
        ),
        Switch(
          value: value,
          onChanged: onChanged,
          activeThumbColor: const Color(0xFFFF6B35),
          activeTrackColor: const Color(0xFFFF6B35).withValues(alpha: 0.3),
        ),
      ],
    );
  }
}
