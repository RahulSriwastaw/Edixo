import 'package:flutter/material.dart';
import '../widgets/canvas/whiteboard_canvas.dart';
import '../widgets/toolbar/bottom_main_toolbar.dart';
import '../widgets/toolbar/floating_style_panel.dart';
import '../widgets/overlays/slide_panel_drawer.dart';

class WhiteboardScreen extends StatelessWidget {
  const WhiteboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D0D0D),
      drawer: const SlidePanelDrawer(),
      body: Stack(
        children: [
          // 1. The 5-Layer Canvas (Layer 1-5 already inside)
          const WhiteboardCanvas(),

          // 2. Main Tool Controls (Sticky UI)
          const BottomMainToolbar(),

          // 3. Style Panel (Conditional or always visible based on PRD)
          const FloatingStylePanel(),
          
          // 4. Navigation Aids (Top Bar if needed)
          Positioned(
            top: 20,
            left: 20,
            child: _TopActionControl(),
          ),
        ],
      ),
    );
  }
}

class _TopActionControl extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        IconButton(
          onPressed: () => Scaffold.of(context).openDrawer(),
          icon: const Icon(Icons.menu, color: Colors.white70),
          style: IconButton.styleFrom(backgroundColor: Colors.black45),
        ),
      ],
    );
  }
}
