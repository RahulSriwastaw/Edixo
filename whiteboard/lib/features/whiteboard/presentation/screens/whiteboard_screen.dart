import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../core/theme/app_theme.dart';
import '../../domain/models/whiteboard_session.dart';
import '../widgets/toolbar/top_toolbar.dart';
import '../widgets/toolbar/left_side_toolbar.dart';
import '../widgets/toolbar/bottom_main_toolbar.dart';
import '../widgets/toolbar/tool_library_drawer.dart';
import '../widgets/dialogs/set_import_dialog.dart';
import '../widgets/dialogs/pdf_import_dialog.dart';
import '../widgets/panels/page_manager_panel.dart';

import '../widgets/canvas/whiteboard_canvas.dart';
import '../../../questions/presentation/widgets/panels/question_panel.dart';
import '../../../ai/presentation/widgets/panels/ai_panel.dart';
import '../../../ai/presentation/widgets/ai_assistant_panel.dart';
import '../../../ai/providers/ai_provider.dart';
import '../../providers/whiteboard_provider.dart';
import '../../providers/canvas_provider.dart';
import '../../providers/tool_provider.dart';
import '../../providers/pdf_import_provider.dart';
import '../../services/sync_service.dart';
import '../widgets/panels/attendance_panel.dart';
import '../widgets/panels/homework_generator.dart';
import '../widgets/canvas/competition_scoreboard.dart';
import '../../../auth/providers/auth_provider.dart';
import 'timer_screen.dart';
import 'spotlight_screen.dart';
import '../../domain/services/export_service.dart';

class WhiteboardScreen extends ConsumerStatefulWidget {
  const WhiteboardScreen({super.key});

  @override
  ConsumerState<WhiteboardScreen> createState() => _WhiteboardScreenState();
}

class _WhiteboardScreenState extends ConsumerState<WhiteboardScreen> {
  bool _showQuestionPanel = false;
  bool _showTimer = false;
  bool _showSpotlight = false;
  bool _showAttendance = false;
  bool _showHomework = false;
  bool _isToolbarVisible = true;
  DateTime _lastActivityTime = DateTime.now();

  @override
  void initState() {
    super.initState();
    _startAutoHideTimer();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final sessionId = ref.read(canvasStateProvider).sessionId;
      ref.read(syncServiceProvider).connect(sessionId);
    });
  }

  @override
  void dispose() {
    ref.read(syncServiceProvider).disconnect();
    super.dispose();
  }

  void _resetActivity() {
    setState(() {
      _lastActivityTime = DateTime.now();
      _isToolbarVisible = true;
    });
  }

  void _startAutoHideTimer() {
    Future.delayed(const Duration(seconds: 1), () {
      if (!mounted) return;
      
      final elapsed = DateTime.now().difference(_lastActivityTime);
      if (elapsed.inSeconds >= 5 && _isToolbarVisible) {
        setState(() => _isToolbarVisible = false);
      }
      _startAutoHideTimer();
    });
  }

  @override
  Widget build(BuildContext context) {
    final canvasState = ref.watch(canvasStateProvider);
    final aiPanelOpen = ref.watch(aiPanelOpenProvider);
    
    final hideUI = canvasState.isFullscreen;

    return KeyboardListener(
      focusNode: FocusNode(),
      onKeyEvent: (event) {
        if (event is KeyDownEvent) {
          if (event.logicalKey == LogicalKeyboardKey.f11) {
            ref.read(canvasStateProvider.notifier).toggleFullscreen();
          }
        }
      },
      child: GestureDetector(
        onTapDown: (_) => _resetActivity(),
        onPanStart: (_) => _resetActivity(),
        child: Scaffold(
          key: GlobalKey<ScaffoldState>(),
          drawer: const Drawer(child: Center(child: Text('Tool Library'))), 
          endDrawer: const PageManagerPanel(), 
          backgroundColor: AppTheme.primaryDark,
          body: Column(
            children: [
              // 1. Top Bar (48px)
              if (!hideUI)
                TopToolbar(
                  sessionName: 'Untitled Session',
                  onSave: () => ref.read(canvasStateProvider.notifier).save(),
                  onTimer: () => setState(() => _showTimer = !_showTimer),
                  onShare: () {}, 
                  onAI: () => ref.read(aiPanelOpenProvider.notifier).state = !aiPanelOpen,
                  onMenu: _showMainMenu,
                  onLoadQuestions: () => setState(() => _showQuestionPanel = !_showQuestionPanel),
                  onAttendance: () => setState(() => _showAttendance = !_showAttendance),
                  onHomework: () => setState(() => _showHomework = !_showHomework),
                ),

              // 2. Main Content
              Expanded(
                child: Row(
                  children: [
                    // Left Side Bar (56px)
                    if (!hideUI)
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        width: _isToolbarVisible ? 56.w : 0,
                        child: const LeftSideToolbar(),
                      ),

                    // Canvas Area
                    Expanded(
                      child: Stack(
                        children: [
                          WhiteboardCanvas(
                            onDrawingStart: () => setState(() => _isToolbarVisible = false),
                            onDrawingEnd: _resetActivity,
                          ),

                          if (_showSpotlight)
                            SpotlightOverlay(onClose: () => setState(() => _showSpotlight = false)),

                          if (canvasState.isSplitScreen)
                            const Align(alignment: Alignment.topCenter, child: CompetitionScoreboard()),

                          // Timer overlay
                          if (_showTimer)
                            Positioned(
                              top: 20.h,
                              right: 16.w,
                              child: TimerWidget(onClose: () => setState(() => _showTimer = false)),
                            ),
                        ],
                      ),
                    ),

                    // Right Side Panels
                    if (aiPanelOpen) const AIAssistantPanel(),
                    if (_showQuestionPanel) const QuestionPanel(),
                    if (_showAttendance) const AttendancePanel(),
                    if (_showHomework) const HomeworkGeneratorPanel(),
                  ],
                ),
              ),

              // 3. Bottom Bar (56px)
              if (!hideUI)
                const BottomMainToolbar(),
            ],
          ),
        ),
      ),
    );
  }

  void _showMainMenu() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF2D2D3A),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20.r))),
      builder: (ctx) => _MainMenuSheet(
        onSpotlight: () {
          Navigator.pop(ctx);
          setState(() => _showSpotlight = true);
        },
        onLogout: () {
          Navigator.pop(ctx);
          ref.read(authProvider.notifier).logout();
        },
      ),
    );
  }
}

class _MainMenuSheet extends ConsumerWidget {
  final VoidCallback onSpotlight;
  final VoidCallback onLogout;

  const _MainMenuSheet({required this.onSpotlight, required this.onLogout});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Padding(
      padding: EdgeInsets.all(16.w),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 40, height: 4,
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(2)),
          ),
          _menuItem(Icons.highlight, 'Spotlight Tool', onSpotlight, context),
          _menuItem(Icons.upload_file_rounded, 'Import PDF', () {
            Navigator.pop(context);
            ref.read(pdfImportProvider.notifier).importToCanvas(ref);
          }, context),
          _menuItem(Icons.picture_as_pdf, 'Export as PDF', () {
            Navigator.pop(context);
            ExportService.exportAllPagesAsPdf(ref);
          }, context),
          _menuItem(Icons.logout, 'Logout', onLogout, context, color: Colors.red),
        ],
      ),
    );
  }

  Widget _menuItem(IconData icon, String label, VoidCallback onTap, BuildContext context, {Color color = Colors.white}) {
    return ListTile(
      leading: Icon(icon, color: color),
      title: Text(label, style: TextStyle(color: color)),
      onTap: onTap,
    );
  }
}
