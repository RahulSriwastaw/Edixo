import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../providers/background_settings_provider.dart';
import '../../../../question_widget/presentation/providers/set_layout_notifier.dart';
import '../../../../../core/constants/api_constants.dart';

class BackgroundLayer extends ConsumerWidget {
  const BackgroundLayer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(backgroundSettingsNotifierProvider);
    final setLayout = ref.watch(setLayoutNotifierProvider);
    final preset = setLayout.settings.backgroundPreset;
    
    return Stack(
      children: [
        // Base background format based on preset
        _buildPresetBackground(preset, setLayout.settings.screenBg),
        
        // Custom background image (if enabled)
        if (settings.enableCustomBackground &&
            settings.backgroundImageUrl != null)
          Positioned.fill(
            child: Opacity(
              opacity: settings.backgroundOpacity,
              child: Image.network(
                ApiConstants.resolveUrl(settings.backgroundImageUrl!),
                fit: settings.stretchBackground
                    ? BoxFit.cover
                    : BoxFit.contain,
                alignment: Alignment.center,
                errorBuilder: (_, __, ___) => const SizedBox.expand(),
                gaplessPlayback: true,
              ),
            ),
          ),
      ],
    );
  }

  Widget _buildPresetBackground(String? preset, int bgColor) {
    if (preset == null || preset.isEmpty) {
      return CustomPaint(painter: BackgroundPainter(Color(bgColor)), child: const SizedBox.expand());
    }

    BoxDecoration decoration;
    switch (preset) {
      case 'chalkboard':
        decoration = const BoxDecoration(
          color: Color(0xFF2C3E2D),
        );
        break;
      case 'blueprint':
        decoration = const BoxDecoration(
          color: Color(0xFF1E3A8A),
        );
        break;
      case 'notebook':
        decoration = const BoxDecoration(
          color: Color(0xFFFDE68A),
        );
        break;
      case 'gradient_blue':
        decoration = const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [Color(0xFF0F172A), Color(0xFF1E3A8A), Color(0xFF38BDF8)],
          ),
        );
        break;
      default:
        final resolvedUrl = ApiConstants.resolveUrl(preset ?? '');
        if (resolvedUrl.startsWith('http')) {
          return SizedBox.expand(
            child: Image.network(
              resolvedUrl,
              fit: BoxFit.cover,
              alignment: Alignment.center,
              errorBuilder: (_, __, ___) => CustomPaint(painter: BackgroundPainter(Color(bgColor)), child: const SizedBox.expand()),
            ),
          );
        }
        return CustomPaint(painter: BackgroundPainter(Color(bgColor)), child: const SizedBox.expand());
    }

    return Container(
      decoration: decoration,
      child: preset == 'blueprint' || preset == 'notebook'
          ? CustomPaint(painter: _GridLinesPainter(preset), child: const SizedBox.expand())
          : const SizedBox.expand(),
    );
  }
}

class _GridLinesPainter extends CustomPainter {
  final String preset;
  _GridLinesPainter(this.preset);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = preset == 'blueprint' ? Colors.white.withOpacity(0.2) : Colors.blue.withOpacity(0.2)
      ..strokeWidth = 1.0;
    
    final double step = preset == 'blueprint' ? 40 : 40;
    
    // Horizontal lines
    for (double i = 0; i < size.height; i += step) {
      canvas.drawLine(Offset(0, i), Offset(size.width, i), paint);
    }
    
    // Vertical lines for blueprint
    if (preset == 'blueprint') {
      for (double i = 0; i < size.width; i += step) {
        canvas.drawLine(Offset(i, 0), Offset(i, size.height), paint);
      }
    } else if (preset == 'notebook') {
      // Draw red margin line
      final redPaint = Paint()
        ..color = Colors.red.withOpacity(0.5)
        ..strokeWidth = 2.0;
      canvas.drawLine(const Offset(100, 0), Offset(100, size.height), redPaint);
      canvas.drawLine(const Offset(104, 0), Offset(104, size.height), redPaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class BackgroundPainter extends CustomPainter {
  final Color color;
  BackgroundPainter(this.color);

  @override
  void paint(Canvas canvas, Size size) {
    // Fill with provided background color
    final bgPaint = Paint()..color = color;
    canvas.drawRect(
      Rect.fromLTWH(0, 0, size.width, size.height),
      bgPaint,
    );
  }

  @override
  bool shouldRepaint(BackgroundPainter oldDelegate) => false;
}
