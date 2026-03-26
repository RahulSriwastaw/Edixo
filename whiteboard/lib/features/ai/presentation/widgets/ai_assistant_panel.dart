import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:dio/dio.dart';

import '../../../../../core/theme/app_theme.dart';
import '../../providers/ai_provider.dart';
import '../../../whiteboard/providers/canvas_provider.dart';

// ─── AI Quick Actions ─────────────────────────────────────────────────────────
const _quickActions = [
  ('Explain', Icons.school_outlined, 'Is topic ko step-by-step explain karo'),
  ('Solve', Icons.calculate_outlined, 'Is problem ka full step-by-step solution do'),
  ('Summarize', Icons.summarize_outlined, 'Key points mein summarize karo'),
  ('Quiz Me', Icons.quiz_outlined, 'Is topic par 3-5 MCQs banao'),
  ('Hints', Icons.lightbulb_outline_rounded, 'Sirf hints do, full answer nahi'),
  ('Translate', Icons.translate_rounded, 'Hindi ↔ English translate karo'),
];

// ─── AI Panel Provider ────────────────────────────────────────────────────────
final aiPanelOpenProvider = StateProvider<bool>((ref) => false);
final aiSelectedContextProvider = StateProvider<String?>((ref) => null);

class AIAssistantPanel extends ConsumerStatefulWidget {
  const AIAssistantPanel({super.key});

  @override
  ConsumerState<AIAssistantPanel> createState() => _AIAssistantPanelState();
}

class _AIAssistantPanelState extends ConsumerState<AIAssistantPanel>
    with SingleTickerProviderStateMixin {
  late AnimationController _slideController;
  late Animation<Offset> _slideAnim;
  final TextEditingController _inputController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _slideController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _slideAnim = Tween<Offset>(
      begin: const Offset(1.0, 0.0),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _slideController, curve: Curves.easeOut));

    // Auto-open animation
    _slideController.forward();
  }

  @override
  void dispose() {
    _slideController.dispose();
    _inputController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _sendMessage(String prompt) {
    if (prompt.trim().isEmpty) return;
    _inputController.clear();
    final context = ref.read(aiSelectedContextProvider);
    ref.read(aiProvider.notifier).sendMessage(prompt, ref);
    _scrollToBottom();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final aiState = ref.watch(aiProvider);
    final selectedContext = ref.watch(aiSelectedContextProvider);

    return SlideTransition(
      position: _slideAnim,
      child: Container(
        width: 320.w,
        decoration: BoxDecoration(
          color: const Color(0xFF14142A),
          border: Border(
            left: BorderSide(color: Colors.white.withOpacity(0.1)),
          ),
        ),
        child: Column(
          children: [
            // ── Header
            Container(
              padding: EdgeInsets.symmetric(horizontal: 14.w, vertical: 12.h),
              decoration: BoxDecoration(
                color: AppTheme.primaryDark,
                border: Border(
                  bottom: BorderSide(color: Colors.white.withOpacity(0.08)),
                ),
              ),
              child: Row(
                children: [
                  Container(
                    width: 28.w,
                    height: 28.h,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [
                        Color(0xFF2ECC71),
                        Color(0xFF1ABC9C),
                      ]),
                      borderRadius: BorderRadius.circular(8.r),
                    ),
                    child: Icon(Icons.auto_awesome_rounded, size: 16.sp, color: Colors.white),
                  ),
                  SizedBox(width: 8.w),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'AI Assistant',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 14.sp,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        Text(
                          'Claude • Grade 10',
                          style: TextStyle(color: Colors.white38, fontSize: 10.sp),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    padding: EdgeInsets.zero,
                    constraints: BoxConstraints(minWidth: 28.w, minHeight: 28.h),
                    icon: Icon(Icons.close_rounded, color: Colors.white54, size: 18.sp),
                    onPressed: () => ref.read(aiPanelOpenProvider.notifier).state = false,
                  ),
                ],
              ),
            ),

            // ── Selected context badge
            if (selectedContext != null)
              Container(
                margin: EdgeInsets.all(10.w),
                padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 6.h),
                decoration: BoxDecoration(
                  color: const Color(0xFF2ECC71).withOpacity(0.12),
                  borderRadius: BorderRadius.circular(8.r),
                  border: Border.all(color: const Color(0xFF2ECC71).withOpacity(0.3)),
                ),
                child: Row(
                  children: [
                    Icon(Icons.crop_free_rounded, size: 14.sp, color: const Color(0xFF2ECC71)),
                    SizedBox(width: 6.w),
                    Expanded(
                      child: Text(
                        'Selected: $selectedContext',
                        style: TextStyle(color: const Color(0xFF2ECC71), fontSize: 11.sp),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
              ),

            // ── Quick action buttons
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 4.h),
              child: Wrap(
                spacing: 6.w,
                runSpacing: 6.h,
                children: _quickActions.map((action) {
                  final (label, icon, prompt) = action;
                  return GestureDetector(
                    onTap: () => _sendMessage(prompt),
                    child: Container(
                      padding: EdgeInsets.symmetric(horizontal: 10.w, vertical: 5.h),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.07),
                        borderRadius: BorderRadius.circular(20.r),
                        border: Border.all(color: Colors.white.withOpacity(0.12)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(icon, size: 12.sp, color: Colors.white60),
                          SizedBox(width: 4.w),
                          Text(
                            label,
                            style: TextStyle(color: Colors.white70, fontSize: 11.sp),
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),

            Divider(color: Colors.white.withOpacity(0.07), height: 1),

            // ── Message list
            Expanded(
              child: aiState.messages.isEmpty
                  ? _EmptyStateView()
                  : ListView.builder(
                      controller: _scrollController,
                      padding: EdgeInsets.all(10.w),
                      itemCount: aiState.messages.length + (aiState.isLoading ? 1 : 0),
                      itemBuilder: (_, idx) {
                        if (idx == aiState.messages.length) {
                          return _ThinkingBubble();
                        }
                        final msg = aiState.messages[idx];
                        return _MessageBubble(
                          text: msg.text,
                          isUser: msg.isUser,
                        );
                      },
                    ),
            ),

            // ── Input bar
            Container(
              padding: EdgeInsets.all(10.w),
              decoration: BoxDecoration(
                color: AppTheme.primaryDark,
                border: Border(
                  top: BorderSide(color: Colors.white.withOpacity(0.08)),
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _inputController,
                      style: TextStyle(color: Colors.white, fontSize: 13.sp),
                      maxLines: 3,
                      minLines: 1,
                      textInputAction: TextInputAction.send,
                      onSubmitted: _sendMessage,
                      decoration: InputDecoration(
                        hintText: 'Ya kuch bhi poocho...',
                        hintStyle: TextStyle(color: Colors.white30, fontSize: 13.sp),
                        filled: true,
                        fillColor: Colors.white.withOpacity(0.07),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12.r),
                          borderSide: BorderSide.none,
                        ),
                        contentPadding: EdgeInsets.symmetric(
                          horizontal: 12.w, vertical: 8.h,
                        ),
                      ),
                    ),
                  ),
                  SizedBox(width: 8.w),
                  GestureDetector(
                    onTap: () => _sendMessage(_inputController.text),
                    child: Container(
                      width: 38.w,
                      height: 38.h,
                      decoration: BoxDecoration(
                        color: const Color(0xFF2ECC71),
                        borderRadius: BorderRadius.circular(12.r),
                      ),
                      child: Icon(
                        Icons.send_rounded,
                        color: Colors.white,
                        size: 18.sp,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
class _MessageBubble extends ConsumerWidget {
  final String text;
  final bool isUser;
  const _MessageBubble({required this.text, required this.isUser});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Column(
        crossAxisAlignment: isUser ? CrossAxisAlignment.end : CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            margin: const EdgeInsets.only(bottom: 4),
            padding: EdgeInsets.all(10.w),
            constraints: BoxConstraints(maxWidth: 260.w),
            decoration: BoxDecoration(
              color: isUser
                  ? AppTheme.primaryOrange.withOpacity(0.9)
                  : Colors.white.withOpacity(0.07),
              borderRadius: BorderRadius.circular(12.r).copyWith(
                bottomRight: isUser ? Radius.zero : null,
                bottomLeft: isUser ? null : Radius.zero,
              ),
            ),
            child: SelectableText(
              text,
              style: TextStyle(
                color: Colors.white,
                fontSize: 12.sp,
                height: 1.4,
              ),
            ),
          ),
          if (!isUser && text.isNotEmpty)
            Padding(
              padding: EdgeInsets.only(bottom: 12.h, left: 4.w),
              child: InkWell(
                onTap: () {
                  final stroke = Stroke(
                    id: 'ai_${DateTime.now().millisecondsSinceEpoch}',
                    points: [const StrokePoint(100, 100)],
                    color: Colors.black,
                    thickness: 16.0,
                    opacity: 1.0,
                    type: StrokeType.text,
                    text: text,
                  );
                  ref.read(canvasStateProvider.notifier).addStroke(stroke);
                  ref.read(aiPanelOpenProvider.notifier).state = false;
                },
                borderRadius: BorderRadius.circular(4.r),
                child: Padding(
                  padding: EdgeInsets.symmetric(horizontal: 4.w, vertical: 2.h),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.add_circle_outline, color: const Color(0xFF2ECC71), size: 14.sp),
                      SizedBox(width: 4.w),
                      Text('Add to Canvas', style: TextStyle(color: const Color(0xFF2ECC71), fontSize: 11.sp)),
                    ],
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

// ─── Thinking Bubble ──────────────────────────────────────────────────────────
class _ThinkingBubble extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: EdgeInsets.all(10.w),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.07),
          borderRadius: BorderRadius.circular(12.r),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              width: 16.w,
              height: 16.h,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: const Color(0xFF2ECC71),
              ),
            ),
            SizedBox(width: 8.w),
            Text(
              'Thinking...',
              style: TextStyle(color: Colors.white38, fontSize: 12.sp),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Empty State ─────────────────────────────────────────────────────────────
class _EmptyStateView extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.auto_awesome_outlined, size: 40.sp, color: Colors.white12),
          SizedBox(height: 12.h),
          Text(
            'Select content on canvas\nor ask anything',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.white24, fontSize: 13.sp),
          ),
        ],
      ),
    );
  }
}
