import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../providers/tool_provider.dart';
import 'background_layer.dart';
import 'slide_content_layer.dart';
import 'editable_question_layer.dart';
import 'annotation_layer.dart';
import 'overlay_layer.dart';
import '../../providers/canvas_provider.dart';
import '../../../../question_widget/presentation/providers/interaction_state_provider.dart';
import '../../../../question_widget/presentation/providers/set_layout_notifier.dart';
import '../../providers/floating_overlay_provider.dart';
import '../../providers/floating_overlay_provider.dart';
import '../tools/lasso_selection_overlay.dart';


class WhiteboardCanvas extends ConsumerStatefulWidget {
  const WhiteboardCanvas({super.key});

  @override
  ConsumerState<WhiteboardCanvas> createState() => _WhiteboardCanvasState();
}

class _WhiteboardCanvasState extends ConsumerState<WhiteboardCanvas> {
  final TransformationController _transformController = TransformationController();

  // Canvas dimensions - MUST maintain 16:9 aspect ratio
  // All exports, imports, and pages use this size
  static const double _canvasWidth = 1920;   // 16 units
  static const double _canvasHeight = 1080;  // 9 units (1920/1080 = 16/9)

  @override
  void dispose() {
    _transformController.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    _transformController.addListener(() {
      ref.read(canvasTransformationProvider.notifier).state = _transformController.value;
    });
  }


  @override
  Widget build(BuildContext context) {
    final toolState = ref.watch(toolNotifierProvider);
    final isDraggingWidget = ref.watch(isDraggingWidgetProvider);

    // Zoom/Pan is enabled in Navigate mode AND only if no widget is being dragged
    final panEnabled = toolState.activeTool == Tool.navigate && !isDraggingWidget;

    final setLayout = ref.watch(setLayoutNotifierProvider);

    return LayoutBuilder(
        builder: (context, constraints) {
          final canvasKey = ref.watch(canvasRepaintKeyProvider);

          return Stack(
            children: [
              ClipRect(
                child: Container(
                  color: Color(setLayout.settings.screenBg),
                  child: InteractiveViewer(
                    transformationController: _transformController,
                    boundaryMargin: const EdgeInsets.all(500),
                    minScale: 0.25,
                    maxScale: 4.0,
                    panEnabled: panEnabled,
                    scaleEnabled: panEnabled,
                    child: RepaintBoundary(
                      key: canvasKey,
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

                              // 6. Lasso Selection Overlay
                              LassoSelectionOverlay(),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),


              // ── Floating Overlays Layer ────────────────────────────────────
              Consumer(
                builder: (context, ref, _) {
                  final overlays = ref.watch(floatingOverlayNotifierProvider);
                  if (overlays.isEmpty) return const SizedBox.shrink();
                  return Stack(
                    children: overlays.values.map((panel) => panel.child).toList(),
                  );
                },
              ),
            ],
          );
        },
      );
  }
}
