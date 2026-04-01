import 'dart:ui' as ui;
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../providers/canvas_provider.dart';

class SlideContentLayer extends ConsumerWidget {
  const SlideContentLayer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final canvasState = ref.watch(canvasStateProvider);
    final bgImageBytes = canvasState.currentPage.bgImageBytes;

    if (bgImageBytes == null) return const SizedBox.shrink();

    return FutureBuilder<ui.Image>(
      future: _decodeImage(bgImageBytes),
      builder: (context, snapshot) {
        if (!snapshot.hasData) return const SizedBox.shrink();
        return CustomPaint(
          painter: ImagePainter(image: snapshot.data!),
          child: const SizedBox.expand(),
        );
      },
    );
  }

  Future<ui.Image> _decodeImage(List<int> bytes) async {
    final codec = await ui.instantiateImageCodec(Uint8List.fromList(bytes));
    final frame = await codec.getNextFrame();
    return frame.image;
  }
}

class ImagePainter extends CustomPainter {
  final ui.Image image;
  ImagePainter({required this.image});

  @override
  void paint(Canvas canvas, Size size) {
    canvas.drawImageRect(
      image,
      Rect.fromLTWH(0, 0, image.width.toDouble(), image.height.toDouble()),
      Rect.fromLTWH(0, 0, size.width, size.height),
      Paint()..filterQuality = FilterQuality.high,
    );
  }

  @override
  bool shouldRepaint(covariant ImagePainter oldDelegate) => oldDelegate.image != image;
}
