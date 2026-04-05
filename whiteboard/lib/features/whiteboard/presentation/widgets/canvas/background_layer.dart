import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../providers/background_settings_provider.dart';

class BackgroundLayer extends ConsumerWidget {
  const BackgroundLayer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(backgroundSettingsNotifierProvider);
    
    return Stack(
      children: [
        // Base background color
        CustomPaint(
          painter: BackgroundPainter(),
          child: const SizedBox.expand(),
        ),
        
        // Custom background image (if enabled)
        if (settings.enableCustomBackground &&
            settings.backgroundImageUrl != null)
          Positioned.fill(
            child: Opacity(
              opacity: settings.backgroundOpacity,
              child: Image.network(
                settings.backgroundImageUrl!,
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
}

class BackgroundPainter extends CustomPainter {
  BackgroundPainter();

  @override
  void paint(Canvas canvas, Size size) {
    // Fill with dark coaching app background
    final bgPaint = Paint()..color = AppColors.bgPrimary;
    canvas.drawRect(
      Rect.fromLTWH(0, 0, size.width, size.height),
      bgPaint,
    );
  }

  @override
  bool shouldRepaint(BackgroundPainter oldDelegate) => false;
}
