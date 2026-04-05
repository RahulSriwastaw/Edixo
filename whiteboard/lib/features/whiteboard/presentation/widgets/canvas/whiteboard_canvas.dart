import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/tool_provider.dart';
import 'background_layer.dart';
import 'slide_content_layer.dart';
import 'editable_question_layer.dart';
import 'annotation_layer.dart';
import 'overlay_layer.dart';

class WhiteboardCanvas extends ConsumerStatefulWidget {
  const WhiteboardCanvas({super.key});

  @override
  ConsumerState<WhiteboardCanvas> createState() => _WhiteboardCanvasState();
}

class _WhiteboardCanvasState extends ConsumerState<WhiteboardCanvas> {
  final TransformationController _transformController = TransformationController();

  static const double _canvasWidth = 1920; 
  static const double _canvasHeight = 1080;

  @override
  void dispose() {
    _transformController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final toolState = ref.watch(toolNotifierProvider);
    
    // Zoom/Pan is only enabled in Navigate mode OR via 2-finger gesture (handled by InteractiveViewer automatically)
    final panEnabled = toolState.activeTool == Tool.navigate;

    return LayoutBuilder(
      builder: (context, constraints) {
        return ClipRect(
          child: Container(
            color: const Color(0xFF0D0D0D),
            child: InteractiveViewer(
              transformationController: _transformController,
              boundaryMargin: const EdgeInsets.all(500),
              minScale: 0.25,
              maxScale: 4.0,
              panEnabled: panEnabled,
              scaleEnabled: panEnabled,
              child: const Center(
                child: SizedBox(
                   width: _canvasWidth,
                   height: _canvasHeight,
                   child: Stack(
                     clipBehavior: Clip.none,
                     children: [
                       // 1. Background Layer (Templates/Grids)
                       BackgroundLayer(),
                       
                       // 2. Slide Content Layer (Read-only background images)
                       SlideContentLayer(),
                       
                       // 3. Editable Question Layer (Interactive widgets)
                       EditableQuestionLayer(),
                       
                       // 4. Annotation Layer (Strokes, shapes, textboxes)
                       AnnotationLayer(),
                       
                       // 5. Overlay Layer (Laser pointer, spotlight)
                       OverlayLayer(),
                     ],
                   ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
