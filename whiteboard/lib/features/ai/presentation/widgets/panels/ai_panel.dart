import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../../core/theme/app_theme.dart';
import '../../../providers/ai_provider.dart';
import '../../../domain/models/ai_message.dart';
import 'package:eduhub_whiteboard/features/whiteboard/providers/whiteboard_provider.dart';
import '../../../../super_admin/providers/module_config_provider.dart'; // Added import

class AIPanel extends ConsumerStatefulWidget {
  const AIPanel({super.key});

  @override
  ConsumerState<AIPanel> createState() => _AIPanelState();
}

class _AIPanelState extends ConsumerState<AIPanel> {
  final TextEditingController _msgCtrl = TextEditingController();
  final ScrollController _scrollCtrl = ScrollController();

  @override
  Widget build(BuildContext context) {
    final aiState = ref.watch(aiProvider);
    final moduleConfig = ref.watch(moduleConfigProvider); // Added
    final aiNotifier = ref.read(aiProvider.notifier); // Added
    final isLoading = aiState.isLoading;
    final messages = aiState.messages;

    // Auto-scroll to bottom when new messages arrive
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });

    return Column(
      children: [
        // Header
        _buildHeader(aiState, aiNotifier, moduleConfig), // Modified to pass notifier and moduleConfig

        // Quick Actions
        _buildQuickActions(),

        const Divider(height: 1),

        // Quota Warning (Added)
        if (aiState.isQuotaExceeded)
          Container(
            padding: EdgeInsets.all(8.w),
            color: Colors.redAccent.withOpacity(0.1),
            child: Row(
              children: [
                const Icon(Icons.warning, color: Colors.redAccent, size: 16),
                SizedBox(width: 8.w),
                Text('AI Quota Exceeded (Session Limit)', style: TextStyle(color: Colors.redAccent, fontSize: 11.sp)),
              ],
            ),
          ),

        // Messages
        Expanded(
          child: ListView.builder(
            controller: _scrollCtrl,
            padding: EdgeInsets.all(12.w),
            itemCount: messages.length + (isLoading ? 1 : 0),
            itemBuilder: (ctx, i) {
              if (i == messages.length) return _buildTypingIndicator();
              return _buildMessage(messages[i]);
            },
          ),
        ),

        // Quota bar
        _buildQuotaBar(aiState, moduleConfig),

        // Input area
        _buildInputArea(isLoading),
      ],
    );
  }

  Widget _buildHeader(AIState aiState, AINotifier aiNotifier, ModuleConfig moduleConfig) { // Modified signature
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
      decoration: const BoxDecoration(color: Color(0xFF1E2235)),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                padding: EdgeInsets.all(6.w),
                decoration: BoxDecoration(
                  color: Colors.purpleAccent.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8.r),
                ),
                child: Icon(Icons.auto_awesome, color: Colors.purpleAccent, size: 18.w),
              ),
              SizedBox(width: 10.w),
              Expanded(
                child: Text(
                  'EduHub AI Assistant v3',
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13.sp),
                ),
              ),
              Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(color: Colors.green, shape: BoxShape.circle),
              ),
              SizedBox(width: 4.w),
              Text('Online', style: TextStyle(color: Colors.green, fontSize: 10.sp)),
            ],
          ),
          SizedBox(height: 8.h),
          Row(
            children: [
              _buildSmallDropdown<String>(
                value: aiState.language,
                items: [
                  DropdownMenuItem(value: 'hi', child: Text('Hindi', style: TextStyle(fontSize: 10.sp))),
                  DropdownMenuItem(value: 'en', child: Text('English', style: TextStyle(fontSize: 10.sp))),
                ],
                onChanged: (val) => ref.read(aiProvider.notifier).setLanguage(val!),
              ),
              SizedBox(width: 12.w),
              // Replaced with _buildGradeLevelDropdown
              _buildGradeLevelDropdown(aiState, aiNotifier, moduleConfig),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSmallDropdown<T>({
    required T value,
    required List<DropdownMenuItem<T>> items,
    required ValueChanged<T?> onChanged,
  }) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 8.w),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.1),
        borderRadius: BorderRadius.circular(4.r),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<T>(
          value: value,
          items: items,
          onChanged: onChanged,
          dropdownColor: const Color(0xFF1E2235),
          style: const TextStyle(color: Colors.white),
          icon: Icon(Icons.arrow_drop_down, color: Colors.white70, size: 16.w),
        ),
      ),
    );
  }

  // Added _buildGradeLevelDropdown
  Widget _buildGradeLevelDropdown(AIState aiState, AINotifier aiNotifier, ModuleConfig moduleConfig) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 8.w),
      decoration: BoxDecoration(color: Colors.white.withOpacity(0.1), borderRadius: BorderRadius.circular(4.r)),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<int>(
          value: moduleConfig.allowedGrades.contains(aiState.gradeLevel) ? aiState.gradeLevel : moduleConfig.allowedGrades.first,
          dropdownColor: const Color(0xFF1E2235), // Changed from AppTheme.primaryDark
          icon: Icon(Icons.arrow_drop_down, color: Colors.white70, size: 16.w), // Changed from Colors.white60
          style: TextStyle(color: Colors.white, fontSize: 10.sp), // Changed from 12.sp
          items: moduleConfig.allowedGrades.map((grade) => DropdownMenuItem(
            value: grade,
            child: Text('Class $grade', style: TextStyle(fontSize: 10.sp)), // Added style
          )).toList(),
          onChanged: (v) => v != null ? aiNotifier.setGradeLevel(v) : null,
        ),
      ),
    );
  }

  Widget _buildQuickActions() {
    final notifier = ref.read(aiProvider.notifier);
    final actions = [
      _QuickAction('Explain', Icons.lightbulb_outline, () => notifier.explainCurrentTopic(ref)),
      _QuickAction('Solve Q', Icons.calculate_outlined, () => notifier.solveCurrentQuestion(ref)),
      _QuickAction('Examples', Icons.format_list_numbered, () => notifier.generateExamples(ref)),
      _QuickAction('Summarize', Icons.summarize_outlined, () => notifier.summarizePage(ref)),
      _QuickAction('OCR', Icons.text_fields, () => notifier.recognizeHandwriting(ref)),
    ];

    return Container(
      height: 44.h,
      color: const Color(0xFFF9FAFB),
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 6.h),
        children: actions.map((a) {
          return Padding(
            padding: EdgeInsets.only(right: 6.w),
            child: ActionChip(
              avatar: Icon(a.icon, size: 14),
              label: Text(a.label, style: TextStyle(fontSize: 11.sp)),
              onPressed: a.onTap,
              backgroundColor: Colors.white,
              side: const BorderSide(color: Color(0xFFE5E7EB)),
              visualDensity: VisualDensity.compact,
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildMessage(AIMessage msg) {
    final isUser = msg.isUser;
    return Padding(
      padding: EdgeInsets.only(bottom: 12.h),
      child: Row(
        mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!isUser) ...[
            Container(
              width: 28.w,
              height: 28.w,
              decoration: BoxDecoration(
                color: Colors.purpleAccent.withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.auto_awesome, size: 16.w, color: Colors.purpleAccent),
            ),
            SizedBox(width: 8.w),
          ],
          Flexible(
            child: Container(
              padding: EdgeInsets.all(12.w),
              decoration: BoxDecoration(
                color: isUser ? AppTheme.primaryOrange : const Color(0xFFF3F4F6),
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(12),
                  topRight: const Radius.circular(12),
                  bottomLeft: isUser ? const Radius.circular(12) : const Radius.circular(2),
                  bottomRight: isUser ? const Radius.circular(2) : const Radius.circular(12),
                ),
              ),
              child: _buildMessageContent(msg, isUser),
            ),
          ),
          if (isUser) ...[
            SizedBox(width: 8.w),
            Container(
              width: 28.w,
              height: 28.w,
              decoration: BoxDecoration(
                color: AppTheme.primaryOrange.withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.person, size: 16.w, color: AppTheme.primaryOrange),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildMessageContent(AIMessage msg, bool isUser) {
    // Simple markdown-style rendering
    final parts = msg.text.split('\n');
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: parts.map((line) {
        if (line.startsWith('**') && line.endsWith('**')) {
          return Padding(
            padding: EdgeInsets.only(bottom: 4.h),
            child: Text(
              line.replaceAll('**', ''),
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 13.sp,
                color: isUser ? Colors.white : Colors.black87,
              ),
            ),
          );
        }
        if (line.startsWith('• ') || line.startsWith('- ')) {
          return Padding(
            padding: EdgeInsets.only(bottom: 2.h),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('• ', style: TextStyle(color: isUser ? Colors.white : Colors.black87)),
                Expanded(
                  child: Text(
                    line.substring(2),
                    style: TextStyle(fontSize: 12.sp, color: isUser ? Colors.white : Colors.black87),
                  ),
                ),
              ],
            ),
          );
        }
        return Text(
          line,
          style: TextStyle(fontSize: 13.sp, color: isUser ? Colors.white : Colors.black87),
        );
      }).toList(),
    );
  }

  Widget _buildTypingIndicator() {
    return Padding(
      padding: EdgeInsets.only(bottom: 12.h),
      child: Row(
        children: [
          Container(
            width: 28.w,
            height: 28.w,
            decoration: BoxDecoration(
              color: Colors.purpleAccent.withOpacity(0.15),
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.auto_awesome, size: 16.w, color: Colors.purpleAccent),
          ),
          SizedBox(width: 8.w),
          Container(
            padding: EdgeInsets.all(12.w),
            decoration: BoxDecoration(
              color: const Color(0xFFF3F4F6),
              borderRadius: BorderRadius.circular(12.r),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _dot(0),
                SizedBox(width: 4.w),
                _dot(100),
                SizedBox(width: 4.w),
                _dot(200),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _dot(int delay) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.3, end: 1.0),
      duration: Duration(milliseconds: 600 + delay),
      builder: (ctx, val, _) => Opacity(
        opacity: val,
        child: Container(
          width: 8,
          height: 8,
          decoration: const BoxDecoration(color: Colors.grey, shape: BoxShape.circle),
        ),
      ),
    );
  }

  Widget _buildQuotaBar(AIState state, ModuleConfig config) {
    final ratio = config.globalAiTokenLimit > 0 ? state.usedTokens / config.globalAiTokenLimit : 0.0;
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 6.h),
      color: const Color(0xFFF9FAFB),
      child: Row(
        children: [
          Icon(Icons.bolt, size: 14, color: ratio > 0.8 ? Colors.red : Colors.amber),
          SizedBox(width: 4.w),
          Text(
            'AI: ${state.usedTokens}/${config.globalAiTokenLimit}',
            style: TextStyle(fontSize: 11.sp, color: Colors.grey),
          ),
          SizedBox(width: 8.w),
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(4.r),
              child: LinearProgressIndicator(
                value: ratio.clamp(0.0, 1.0),
                backgroundColor: Colors.grey.shade200,
                valueColor: AlwaysStoppedAnimation(ratio > 0.8 ? Colors.red : Colors.amber),
                minHeight: 4,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInputArea(bool isLoading) {
    return Container(
      padding: EdgeInsets.all(12.w),
      decoration: const BoxDecoration(
        border: Border(top: BorderSide(color: Color(0xFFE5E7EB))),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _msgCtrl,
              maxLines: 3,
              minLines: 1,
              decoration: InputDecoration(
                hintText: 'Ask anything about this topic...',
                hintStyle: TextStyle(fontSize: 13.sp, color: Colors.grey),
                filled: true,
                fillColor: const Color(0xFFF9FAFB),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(20.r),
                  borderSide: const BorderSide(color: Color(0xFFE5E7EB)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(20.r),
                  borderSide: const BorderSide(color: Colors.purpleAccent),
                ),
                contentPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 10.h),
              ),
              onSubmitted: (_) => _sendMessage(),
            ),
          ),
          SizedBox(width: 8.w),
          if (isLoading)
            const SizedBox(
              width: 36,
              height: 36,
              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.purpleAccent),
            )
          else ...[
            InkWell(
              onTap: () => ref.read(aiProvider.notifier).startVoiceRecognition(ref),
              borderRadius: BorderRadius.circular(50),
              child: Container(
                width: 40.w,
                height: 40.w,
                decoration: BoxDecoration(
                  color: Colors.purpleAccent.withOpacity(0.1),
                  border: Border.all(color: Colors.purpleAccent.withOpacity(0.3)),
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.mic, color: Colors.purpleAccent, size: 20.w),
              ),
            ),
            SizedBox(width: 8.w),
            InkWell(
              onTap: _sendMessage,
              borderRadius: BorderRadius.circular(50),
              child: Container(
                width: 40.w,
                height: 40.w,
                decoration: const BoxDecoration(
                  color: Colors.purpleAccent,
                  shape: BoxShape.circle,
                ),
                child: Icon(Icons.send, color: Colors.white, size: 18.w),
              ),
            ),
          ],
        ],
      ),
    );
  }

  void _sendMessage() {
    final text = _msgCtrl.text.trim();
    if (text.isEmpty) return;
    ref.read(aiProvider.notifier).sendMessage(text, ref); // Modified to pass ref
    _msgCtrl.clear();
  }

  @override
  void dispose() {
    _msgCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }
}

class _QuickAction {
  final String label;
  final IconData icon;
  final VoidCallback onTap;

  _QuickAction(this.label, this.icon, this.onTap);
}
