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
import '../widgets/teaching_tools/screen_cover.dart';

import '../widgets/subject_tools/ruler_widget.dart';
import '../widgets/subject_tools/protractor_widget.dart';
import '../widgets/subject_tools/compass_widget.dart';
import '../widgets/ai/ai_assistant_panel.dart';
import '../widgets/panels/next_question_preview_panel.dart';
import '../../services/keyboard_shortcut_service.dart';
import '../providers/app_mode_provider.dart';
import '../providers/slide_provider.dart';



class WhiteboardScreen extends ConsumerStatefulWidget {
  const WhiteboardScreen({super.key});

  @override
  ConsumerState<WhiteboardScreen> createState() => _WhiteboardScreenState();
}

class _WhiteboardScreenState extends ConsumerState<WhiteboardScreen> {
  bool _showRuler = false;
  bool _showProtractor = false;
  bool _showCompass = false;
  bool _showTimer = false;
  bool _showAiAssistant = false;
  bool _showNextPreview = false;
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

  void _toggleSubjectTool(String tool) {
    setState(() {
      switch (tool) {
        case 'ruler':
          _showRuler = !_showRuler;
          _showProtractor = false;
          _showCompass = false;
        case 'protractor':
          _showProtractor = !_showProtractor;
          _showRuler = false;
          _showCompass = false;
        case 'compass':
          _showCompass = !_showCompass;
          _showRuler = false;
          _showProtractor = false;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final appMode = ref.watch(appModeNotifierProvider);

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


          // 7.5 Next Question Preview (Left side, toggleable)
          if (_showNextPreview && ref.watch(slideNotifierProvider).hasSlides)
            Positioned(
              top: 70,
              left: 20,
              bottom: 100,
              child: SizedBox(
                height: MediaQuery.of(context).size.height - 170,
                child: const NextQuestionPreviewPanel(),
              ),
            ),

          // 8. Subject Tools
          if (_showRuler) const RulerWidget(),
          if (_showProtractor) const ProtractorWidget(),
          if (_showCompass) const CompassWidget(),

          // 9. Subject Tools Toggle (Bottom-left)
          Positioned(
            bottom: 80,
            left: 20,
            child: _SubjectToolsToggle(
              onToggle: _toggleSubjectTool,
              showRuler: _showRuler,
              showProtractor: _showProtractor,
              showCompass: _showCompass,
            ),
          ),

          // 10. AI Assistant Panel (Right side)
          if (_showAiAssistant)
            const Positioned(
              top: 0,
              right: 0,
              bottom: 0,
              child: AiAssistantPanel(),
            ),

          // Next Question Preview Toggle Button
          Positioned(
            top: 70,
            left: _showNextPreview ? 340 : 20,
            child: _ToolButton(
              icon: _showNextPreview
                  ? Icons.preview
                  : Icons.preview_outlined,
              label: _showNextPreview ? 'Hide Preview' : 'Show Preview',
              isActive: _showNextPreview,
              onTap: () => setState(() => _showNextPreview = !_showNextPreview),
            ),
          ),
        ],
      ),
    );
  }
}

class _SubjectToolsToggle extends StatelessWidget {
  final Function(String) onToggle;
  final bool showRuler;
  final bool showProtractor;
  final bool showCompass;

  const _SubjectToolsToggle({
    required this.onToggle,
    required this.showRuler,
    required this.showProtractor,
    required this.showCompass,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.7),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white12),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          _ToolButton(
            icon: Icons.straighten,
            label: 'Ruler',
            isActive: showRuler,
            onTap: () => onToggle('ruler'),
          ),
          const SizedBox(height: 4),
          _ToolButton(
            icon: Icons.architecture,
            label: 'Protractor',
            isActive: showProtractor,
            onTap: () => onToggle('protractor'),
          ),
          const SizedBox(height: 4),
          _ToolButton(
            icon: Icons.circle,
            label: 'Compass',
            isActive: showCompass,
            onTap: () => onToggle('compass'),
          ),
        ],
      ),
    );
  }
}

class _ToolButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool isActive;
  final VoidCallback onTap;

  const _ToolButton({
    required this.icon,
    required this.label,
    required this.isActive,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: isActive ? Colors.orange : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Tooltip(
          message: label,
          child: Icon(
            icon,
            size: 20,
            color: isActive ? Colors.white : Colors.white70,
          ),
        ),
      ),
    );
  }
}
