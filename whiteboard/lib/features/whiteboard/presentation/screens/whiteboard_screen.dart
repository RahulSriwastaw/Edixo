import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../core/theme/app_theme.dart';
import '../../domain/models/whiteboard_session.dart';
import '../widgets/toolbar/top_toolbar.dart';
import '../widgets/toolbar/favorites_bar.dart';
import '../widgets/sidebar/page_sidebar.dart';
import '../widgets/toolbar/bottom_toolbar.dart';
import '../widgets/canvas/whiteboard_canvas.dart';
import '../../../questions/presentation/widgets/panels/question_panel.dart';
import '../../../ai/presentation/widgets/panels/ai_panel.dart';
import '../../../ai/presentation/widgets/ai_assistant_panel.dart';
import '../../../ai/providers/ai_provider.dart';
import '../../../drawing/domain/models/drawing_tool.dart';
import '../../providers/whiteboard_provider.dart';
import '../../providers/canvas_provider.dart';
import '../../services/sync_service.dart';
import '../../../super_admin/providers/module_config_provider.dart';
import '../widgets/panels/attendance_panel.dart';
import '../widgets/panels/homework_generator.dart';
import '../widgets/canvas/competition_scoreboard.dart';
import '../../../notes/domain/models/note.dart';
import '../../../auth/providers/auth_provider.dart';
import '../../../drawing/providers/tool_provider.dart';
import 'timer_screen.dart';
import 'spotlight_screen.dart';
import '../../domain/services/export_service.dart';
import '../../../super_admin/presentation/screens/admin_dashboard.dart';

class WhiteboardScreen extends ConsumerStatefulWidget {
  final Note? initialNote;
  const WhiteboardScreen({super.key, this.initialNote});

  @override
  ConsumerState<WhiteboardScreen> createState() => _WhiteboardScreenState();
}

class _WhiteboardScreenState extends ConsumerState<WhiteboardScreen> {
  bool _showQuestionPanel = false;
  bool _showAIPanel = false;    // Legacy AI panel
  bool _showNewAIPanel = false; // New PRD-07 AI Assistant
  bool _showTimer = false;
  bool _showSpotlight = false;
  bool _showAttendance = false;
  bool _showHomework = false;
  bool _timerIsCountdown = true;
  bool _isToolbarVisible = true;
  DateTime _lastActivityTime = DateTime.now();
  Offset? _favBarPos;

  @override
  void initState() {
    super.initState();
    _startAutoHideTimer();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(syncServiceProvider).connect('demo_session_123');
    });
  }

  @override
  void dispose() {
    // Only disconnect if we are actually leaving the screen
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
      
      final drawingState = ref.read(drawingStateProvider);
      if (drawingState.autoHideDelay == AutoHideDelay.never) {
        if (!_isToolbarVisible) setState(() => _isToolbarVisible = true);
        _startAutoHideTimer();
        return;
      }
      
      int delaySeconds = 3;
      if (drawingState.autoHideDelay == AutoHideDelay.short2s) delaySeconds = 2;
      else if (drawingState.autoHideDelay == AutoHideDelay.long5s) delaySeconds = 5;

      final elapsed = DateTime.now().difference(_lastActivityTime);
      if (elapsed.inSeconds >= delaySeconds && _isToolbarVisible) {
        setState(() => _isToolbarVisible = false);
      }
      _startAutoHideTimer();
    });
  }

  @override
  Widget build(BuildContext context) {
    final canvasState = ref.watch(canvasStateProvider);
    final drawingState = ref.watch(drawingStateProvider);
    final moduleConfig = ref.watch(moduleConfigProvider);
    final isMobile = MediaQuery.of(context).size.width < 768;
    final aiPanelOpen = ref.watch(aiPanelOpenProvider);
    
    final hideUI = canvasState.isFullscreen || drawingState.isTeachingMode;

    _favBarPos ??= Offset(
      MediaQuery.of(context).size.width / 2 - 250.w,
      MediaQuery.of(context).size.height - 180.h,
    );

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
          backgroundColor: AppTheme.primaryDark,
          body: Stack(
            children: [
              // ── Main Layout
              Column(
                children: [
                  // Top Toolbar
                  if (!hideUI)
                    TopToolbar(
                      sessionName: 'Untitled Session',
                      onSave: () {},
                      onTimer: () => setState(() => _showTimer = !_showTimer),
                      onShare: _showShareDialog,
                      onAI: () {
                        if (moduleConfig.aiAssistant) {
                          ref.read(aiPanelOpenProvider.notifier).state = !aiPanelOpen;
                        }
                      },
                      onMenu: _showMainMenu,
                      onLoadQuestions: () => setState(() {
                        _showQuestionPanel = !_showQuestionPanel;
                        if (_showQuestionPanel) {
                          _showAIPanel = false; _showAttendance = false; _showHomework = false;
                        }
                      }),
                      onAttendance: () {
                        if (moduleConfig.attendance) {
                          setState(() {
                            _showAttendance = !_showAttendance;
                            if (_showAttendance) {
                              _showQuestionPanel = false; _showAIPanel = false; _showHomework = false;
                            }
                          });
                        }
                      },
                      onHomework: () {
                        if (moduleConfig.homeworkGenerator) {
                          setState(() {
                            _showHomework = !_showHomework;
                            if (_showHomework) {
                              _showQuestionPanel = false; _showAIPanel = false; _showAttendance = false;
                            }
                          });
                        }
                      },
                    ),

                  // Canvas + Sidebars
                  Expanded(
                    child: Row(
                      children: [
                        // Page Sidebar (PRD-07 F-05)
                        if (!hideUI)
                          const PageSidebar(),

                        // Canvas area
                        Expanded(
                          child: Stack(
                            children: [
                              canvasState.isSplitScreen
                                  ? _buildSplitScreenLayout()
                                  : const WhiteboardCanvas(),

                              if (_showSpotlight)
                                SpotlightOverlay(
                                  onClose: () => setState(() => _showSpotlight = false),
                                ),

                              if (canvasState.isFullscreen)
                                Positioned(
                                  top: 12,
                                  right: 12,
                                  child: FloatingActionButton.small(
                                    backgroundColor: Colors.black54,
                                    onPressed: () => ref.read(canvasStateProvider.notifier).toggleFullscreen(),
                                    child: const Icon(Icons.fullscreen_exit, color: Colors.white),
                                  ),
                                ),

                              // Mini tool indicator (always visible in fullscreen)
                              if (canvasState.isFullscreen || !_isToolbarVisible)
                                _MiniToolIndicator(onTap: _resetActivity),
                            ],
                          ),
                        ),

                        // Right panels
                        _buildRightPanel(isMobile),

                        // NEW: AI Assistant Panel (slide-in from right)
                        if (aiPanelOpen)
                          const AIAssistantPanel(),
                      ],
                    ),
                  ),

                  // Bottom Toolbar
                  if (!hideUI && _isToolbarVisible)
                    const BottomToolbar(),

                  // Page Thumbnails
                  if (canvasState.showThumbnails && !hideUI)
                    _PageThumbnailStrip(),
                ],
              ),

              // Page Swiper / Jumper
              if (!hideUI)
                Positioned(
                  bottom: 56.h,
                  left: MediaQuery.of(context).size.width / 2 - 80.w,
                  child: _PageJumperWidget(),
                ),

              // Draggable Favorites Bar (Tool Palette)
              if (!hideUI)
                Positioned(
                  left: _favBarPos!.dx,
                  top: _favBarPos!.dy,
                  child: GestureDetector(
                    onPanUpdate: (details) {
                      setState(() {
                        _favBarPos = Offset(
                          (_favBarPos!.dx + details.delta.dx).clamp(0, MediaQuery.of(context).size.width - 60.w),
                          (_favBarPos!.dy + details.delta.dy).clamp(0, MediaQuery.of(context).size.height - 60.h),
                        );
                      });
                      _resetActivity();
                    },
                    onTap: () {
                      if (!_isToolbarVisible) _resetActivity();
                    },
                    child: AnimatedOpacity(
                      opacity: _isToolbarVisible ? 1.0 : (drawingState.autoHideStyle == AutoHideStyle.collapse ? 0.0 : 0.15),
                      duration: const Duration(milliseconds: 200),
                      child: const FavoritesBar(),
                    ),
                  ),
                ),

              // Timer overlay
              if (_showTimer)
                Positioned(
                  top: 70.h,
                  right: 16.w,
                  child: TimerWidget(
                    onClose: () => setState(() => _showTimer = false),
                  ),
                ),
                
              // Exit Teaching Mode Button
              if (drawingState.isTeachingMode)
                Positioned(
                  top: 16.h,
                  right: 16.w,
                  child: FloatingActionButton.extended(
                    onPressed: () => ref.read(drawingStateProvider.notifier).toggleTeachingMode(),
                    backgroundColor: AppTheme.primaryOrange,
                    icon: const Icon(Icons.school_outlined, color: Colors.white),
                    label: const Text('Exit Teaching Mode', style: TextStyle(color: Colors.white)),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildRightPanel(bool isMobile) {
    if (!_showQuestionPanel && !_showAIPanel && !_showAttendance && !_showHomework) {
      return const SizedBox.shrink();
    }

    if (_showAttendance) return const AttendancePanel();
    if (_showHomework) return const HomeworkGeneratorPanel();

    return Container(
      width: isMobile ? MediaQuery.of(context).size.width : 340.w,
      decoration: BoxDecoration(
        color: Colors.white,
        border: const Border(left: BorderSide(color: Color(0xFFE5E7EB))),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.1), blurRadius: 8)],
      ),
      child: Column(
        children: [
          // Panel toggle header
          Container(
            decoration: const BoxDecoration(color: Color(0xFFF9FAFB)),
            child: Row(
              children: [
                _panelTab('Questions', Icons.quiz_outlined, _showQuestionPanel, () {
                  setState(() { 
                    _showQuestionPanel = true; _showAIPanel = false; 
                    _showAttendance = false; _showHomework = false;
                  });
                }),
                _panelTab('AI', Icons.auto_awesome, _showAIPanel, () {
                  setState(() { 
                    _showAIPanel = true; _showQuestionPanel = false; 
                    _showAttendance = false; _showHomework = false;
                  });
                }),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.close, size: 18),
                  onPressed: () => setState(() { 
                    _showQuestionPanel = false; _showAIPanel = false; 
                    _showAttendance = false; _showHomework = false;
                  }),
                ),
              ],
            ),
          ),
          Expanded(child: _showAIPanel ? const AIPanel() : const QuestionPanel()),
        ],
      ),
    );
  }

  Widget _buildSplitScreenLayout() {
    return Stack(
      children: [
        GridView.builder(
          padding: EdgeInsets.all(8.w),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            crossAxisSpacing: 8.w,
            mainAxisSpacing: 8.w,
            childAspectRatio: 1.5,
          ),
          itemCount: 4, // 4 panels for multi-user mode
          itemBuilder: (context, index) {
            return Container(
              decoration: BoxDecoration(
                border: Border.all(color: Colors.white24),
                borderRadius: BorderRadius.circular(12.r),
              ),
              clipBehavior: Clip.antiAlias,
              child: Stack(
                children: [
                  const WhiteboardCanvas(isMainCanvas: false),
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Container(
                      padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
                      decoration: BoxDecoration(
                        color: Colors.black54,
                        borderRadius: BorderRadius.circular(4.r),
                      ),
                      child: Text(
                        'Panel ${index + 1}',
                        style: TextStyle(color: Colors.white, fontSize: 10.sp),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
        // Overlaid Scoreboard
        const Align(
          alignment: Alignment.topCenter,
          child: CompetitionScoreboard(),
        ),
      ],
    );
  }

  Widget _panelTab(String label, IconData icon, bool active, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: active ? AppTheme.primaryOrange : Colors.transparent,
              width: 2,
            ),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 16, color: active ? AppTheme.primaryOrange : Colors.grey),
            SizedBox(width: 6.w),
            Text(
              label,
              style: TextStyle(
                fontSize: 13.sp,
                color: active ? AppTheme.primaryOrange : Colors.grey,
                fontWeight: active ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showMainMenu() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF2D2D3A),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20.r)),
      ),
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

  void _showShareDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF2D2D3A),
        title: const Text('Share with Students', style: TextStyle(color: Colors.white)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text(
              'Students can join your live session using this code:',
              style: TextStyle(color: Colors.white70),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white10,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Text(
                '8 4 7 2 9 1',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 32,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 12,
                ),
              ),
            ),
            const SizedBox(height: 12),
            const Text('0 students connected', style: TextStyle(color: Colors.green, fontSize: 12)),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Close', style: TextStyle(color: Colors.white70)),
          ),
          ElevatedButton.icon(
            icon: const Icon(Icons.stop),
            label: const Text('Stop Sharing'),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () => Navigator.pop(ctx),
          ),
        ],
      ),
    );
  }
}

// ─── Mini Tool Indicator (PRD-07 F-02) ───────────────────────────────────────
// Always visible 32dp circle showing current active tool
class _MiniToolIndicator extends ConsumerWidget {
  final VoidCallback onTap;
  const _MiniToolIndicator({required this.onTap});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final drawingState = ref.watch(drawingStateProvider);
    final toolType = drawingState.activeTool;

    return Positioned(
      bottom: 16,
      left: 12,
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: AppTheme.primaryDark.withOpacity(0.9),
            shape: BoxShape.circle,
            border: Border.all(color: AppTheme.primaryOrange, width: 1.5),
            boxShadow: [
              BoxShadow(color: Colors.black.withOpacity(0.3), blurRadius: 6),
            ],
          ),
          child: Icon(
            _toolIcon(toolType),
            size: 16,
            color: AppTheme.primaryOrange,
          ),
        ),
      ),
    );
  }

  IconData _toolIcon(ToolType t) {
    switch (t) {
      case ToolType.pen: return Icons.edit_outlined;
      case ToolType.highlighter: return Icons.highlight_outlined;
      case ToolType.eraser: return Icons.auto_fix_normal_outlined;
      case ToolType.text: return Icons.text_fields_outlined;
      case ToolType.laserPointer: return Icons.flash_on_outlined;
      default: return Icons.touch_app_outlined;
    }
  }
}

class _PageThumbnailStrip extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final canvasState = ref.watch(canvasStateProvider);
    final notifier = ref.read(canvasStateProvider.notifier);

    return Container(
      height: 90.h,
      color: const Color(0xFF1A1A2E),
      child: Row(
        children: [
          Expanded(
            child: ReorderableListView.builder(
              scrollDirection: Axis.horizontal,
              padding: EdgeInsets.all(8.w),
              itemCount: canvasState.totalPages,
              onReorder: (oldIndex, newIndex) {
                notifier.reorderPages(oldIndex, newIndex);
              },
              itemBuilder: (ctx, i) {
                final isActive = i == canvasState.currentPageIndex;
                final page = canvasState.pages[i];

                return GestureDetector(
                  key: ValueKey(page.id),
                  onTap: () => notifier.goToPage(i),
                  child: Container(
                    width: 60.w,
                    margin: EdgeInsets.only(right: 6.w),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(6.r),
                      border: Border.all(
                        color: isActive ? AppTheme.primaryOrange : Colors.transparent,
                        width: 2,
                      ),
                    ),
                    child: Stack(
                      children: [
                        Column(
                          mainAxisAlignment: MainAxisAlignment.end,
                          children: [
                            const Spacer(),
                            Container(
                              color: const Color(0xFF1A1A2E).withOpacity(0.7),
                              width: double.infinity,
                              padding: const EdgeInsets.symmetric(vertical: 2),
                              child: Text(
                                '${i + 1}',
                                textAlign: TextAlign.center,
                                style: TextStyle(color: Colors.white, fontSize: 10.sp),
                              ),
                            ),
                          ],
                        ),
                        // Delete Button
                        Positioned(
                          top: 0,
                          right: 0,
                          child: GestureDetector(
                            onTap: () => notifier.removePage(i),
                            child: Container(
                              padding: EdgeInsets.all(2.w),
                              decoration: BoxDecoration(
                                color: Colors.black54,
                                borderRadius: BorderRadius.only(
                                  bottomLeft: Radius.circular(4.r),
                                  topRight: Radius.circular(4.r),
                                ),
                              ),
                              child: Icon(Icons.close, color: Colors.white, size: 12.w),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          
          // Fixed +Add Page Button
          GestureDetector(
            onTap: () => notifier.addPage(),
            child: Container(
              width: 50.w,
              height: 74.h,
              margin: EdgeInsets.only(right: 8.w, left: 4.w),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.white30, style: BorderStyle.solid),
                borderRadius: BorderRadius.circular(6.r),
              ),
              child: const Icon(Icons.add, color: Colors.white54),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Main Menu Sheet ─────────────────────────────────────────────────────────
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
            width: 40,
            height: 4,
            margin: const EdgeInsets.only(bottom: 16),
            decoration: BoxDecoration(
              color: Colors.white24,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          _menuItem(Icons.highlight, 'Spotlight Tool', onSpotlight, context),
          _menuItem(Icons.picture_as_pdf, 'Export as PDF', () {
            Navigator.pop(context);
            ExportService.exportAllPagesAsPdf(ref);
          }, context),
          _menuItem(Icons.share, 'Share Note', () => Navigator.pop(context), context),
          _menuItem(Icons.library_books, 'Notes Library', () => Navigator.pop(context), context),
          _menuItem(Icons.admin_panel_settings, 'Super Admin Panel', () {
            Navigator.pop(context);
            Navigator.push(context, MaterialPageRoute(builder: (_) => const SuperAdminDashboard()));
          }, context, color: Colors.blueAccent),
          const Divider(color: Colors.white24),
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

class _PageJumperWidget extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final canvasState = ref.watch(canvasStateProvider);
    final notifier = ref.read(canvasStateProvider.notifier);

    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 6.h),
      decoration: BoxDecoration(
        color: AppTheme.primaryDark.withOpacity(0.9),
        borderRadius: BorderRadius.circular(20.r),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.3), blurRadius: 8),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          GestureDetector(
             onTap: () => notifier.previousPage(),
             child: Icon(Icons.chevron_left, color: Colors.white70, size: 20.w),
          ),
          SizedBox(width: 12.w),
          GestureDetector(
             onTap: () {
               showDialog(
                 context: context,
                 builder: (ctx) {
                   final controller = TextEditingController(text: '${canvasState.currentPageNumber}');
                   return AlertDialog(
                     backgroundColor: const Color(0xFF2D2D3A),
                     title: const Text('Jump to Page', style: TextStyle(color: Colors.white)),
                     content: TextField(
                       controller: controller,
                       keyboardType: TextInputType.number,
                       style: const TextStyle(color: Colors.white),
                       decoration: const InputDecoration(hintText: 'Page number', hintStyle: TextStyle(color: Colors.white30)),
                     ),
                     actions: [
                       TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel', style: TextStyle(color: Colors.grey))),
                       ElevatedButton(
                         onPressed: () {
                           final page = int.tryParse(controller.text);
                           if (page != null && page >= 1 && page <= canvasState.totalPages) {
                             notifier.goToPage(page - 1);
                           }
                           Navigator.pop(ctx);
                         },
                         style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryOrange),
                         child: const Text('Go', style: TextStyle(color: Colors.white)),
                       ),
                     ],
                   );
                 }
               );
             },
             child: Text('${canvasState.currentPageNumber} / ${canvasState.totalPages}', style: TextStyle(color: Colors.white, fontSize: 13.sp, fontWeight: FontWeight.bold)),
          ),
          SizedBox(width: 12.w),
          GestureDetector(
             onTap: () => notifier.nextPage(),
             child: Icon(Icons.chevron_right, color: Colors.white70, size: 20.w),
          ),
        ],
      ),
    );
  }
}
