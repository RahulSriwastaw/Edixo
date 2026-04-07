import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../widgets/canvas/whiteboard_canvas.dart';
import '../widgets/toolbar/bottom_main_toolbar.dart';
import '../widgets/toolbar/floating_style_panel.dart';
import '../widgets/toolbar/top_toolbar.dart';
import '../widgets/overlays/slide_panel_drawer.dart';
import '../widgets/teaching_tools/spotlight_overlay.dart';
import '../widgets/teaching_tools/class_timer.dart';
import '../widgets/subject_tools/ruler_widget.dart';
import '../widgets/subject_tools/protractor_widget.dart';
import '../widgets/subject_tools/compass_widget.dart';
import '../widgets/ai/ai_assistant_panel.dart';
import '../../services/keyboard_shortcut_service.dart';
import '../providers/teaching_tools_provider.dart';


class WhiteboardScreen extends ConsumerStatefulWidget {
  const WhiteboardScreen({super.key});

  @override
  ConsumerState<WhiteboardScreen> createState() => _WhiteboardScreenState();
}

class _WhiteboardScreenState extends ConsumerState<WhiteboardScreen> {
  bool _showTimer = false;
  bool _showAiAssistant = false;
  late KeyboardShortcutService _shortcutService;

  @override
  void initState() {
    super.initState();
    _shortcutService = KeyboardShortcutService(ref);
    // Register keyboard shortcut handler
    HardwareKeyboard.instance.addHandler(_handleKeyEvent);
  }

  @override
  void dispose() {
    HardwareKeyboard.instance.removeHandler(_handleKeyEvent);
    super.dispose();
  }

  bool _handleKeyEvent(KeyEvent event) {
    return _shortcutService.handleKeyEvent(event);
  }

  @override
  Widget build(BuildContext context) {
    final teachingState = ref.watch(teachingToolsNotifierProvider);

    return Scaffold(
      backgroundColor: const Color(0xFF0D0D0D),
      drawer: const SlidePanelDrawer(),
      body: Stack(
        children: [
          // 1. The 5-Layer Canvas (Layer 1-5 already inside)
          const WhiteboardCanvas(),

          // 2. Top Toolbar (Session info, Import Set, End Class, AI, Timer)
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: TopToolbar(
              isAiActive: _showAiAssistant,
              isTimerActive: _showTimer,
              onToggleAi: () => setState(() => _showAiAssistant = !_showAiAssistant),
              onToggleTimer: () => setState(() => _showTimer = !_showTimer),
            ),
          ),

          // 3. Main Tool Controls (Bottom)
          const BottomMainToolbar(),

          // 4. Style Panel (Right side, conditional)
          const FloatingStylePanel(),

          // 5. Teaching Tools Overlays
          const SpotlightOverlay(),

          // 6. Timer panel (teacher-controlled)
          if (_showTimer)
            Positioned(
              top: 70,
              right: _showAiAssistant ? 340 : 20,
              child: ClassTimer(
                onClose: () => setState(() => _showTimer = false),
              ),
            ),


          // 8. Subject Tools
          if (teachingState.activeMathTools.contains('ruler')) const RulerWidget(),
          if (teachingState.activeMathTools.contains('protractor')) const ProtractorWidget(),
          if (teachingState.activeMathTools.contains('compass')) const CompassWidget(),

          // 10. AI Assistant Panel (Right side)
          if (_showAiAssistant)
            const Positioned(
              top: 0,
              right: 0,
              bottom: 0,
              child: AiAssistantPanel(),
            ),
        ],
      ),
    );
  }
}

