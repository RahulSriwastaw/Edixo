import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../core/constants/app_colors.dart';

class BackgroundLayer extends ConsumerWidget {
  const BackgroundLayer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return CustomPaint(
      painter: BackgroundPainter(),
      child: const SizedBox.expand(),
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
