// lib/features/whiteboard/presentation/widgets/ai/ai_assistant_panel.dart

import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:async';
import '../../../../../core/theme/app_theme_colors.dart';
import '../../../../../core/theme/app_theme_text_styles.dart';
import '../../../../../core/theme/app_theme_dimensions.dart';

/// AI Assistant Panel - Claude API integration for teaching assistance
class AiAssistantPanel extends ConsumerStatefulWidget {
  const AiAssistantPanel({super.key});

  @override
  ConsumerState<AiAssistantPanel> createState() => _AiAssistantPanelState();
}

class _AiAssistantPanelState extends ConsumerState<AiAssistantPanel> {
  final TextEditingController _controller = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<_ChatMessage> _messages = [];
  bool _isLoading = false;
  bool _isExpanded = false;

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _sendMessage() async {
    final message = _controller.text.trim();
    if (message.isEmpty || _isLoading) return;

    setState(() {
      _messages.add(_ChatMessage(role: 'user', content: message));
      _isLoading = true;
      _controller.clear();
    });

    // Scroll to bottom
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });

    try {
      // Call Claude API
      final response = await _callClaudeApi(message);

      setState(() {
        _messages.add(_ChatMessage(role: 'assistant', content: response));
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _messages.add(_ChatMessage(
          role: 'assistant',
          content: 'Error: Failed to get response. Please try again.',
        ));
        _isLoading = false;
      });
    }

    // Scroll to bottom
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<String> _callClaudeApi(String message) async {
    // TODO: Replace with actual Claude API endpoint and API key
    // This is a placeholder implementation
    await Future.delayed(const Duration(seconds: 2));

    // Simulated response
    return 'This is a simulated AI response. In production, this would call the Claude API with your question: "$message"';
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      width: _isExpanded ? 300 : 40,
      height: double.infinity,
      child: _isExpanded ? _buildExpandedPanel() : _buildCollapsedButton(),
    );
  }

  Widget _buildCollapsedButton() {
    return GestureDetector(
      onTap: () => setState(() => _isExpanded = true),
      child: Container(
        decoration: const BoxDecoration(
          color: AppThemeColors.primaryAccent,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(8),
            bottomLeft: Radius.circular(8),
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.smart_toy, color: Colors.white, size: 20),
            const SizedBox(height: 6),
            Transform.rotate(
              angle: -pi / 2,
              child: const Text(
                'AI Assistant',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildExpandedPanel() {
    final theme = AppThemeColors.of(context);
    
    return Container(
      decoration: BoxDecoration(
        color: theme.bgSidebar,
        border: Border(
          left: BorderSide(color: theme.divider),
        ),
      ),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: theme.bgBody,
              border: Border(
                bottom: BorderSide(color: theme.divider),
              ),
            ),
            child: Row(
              children: [
                const Icon(Icons.smart_toy, color: AppThemeColors.primaryAccent, size: 20),
                const SizedBox(width: 10),
                Text(
                  'AI Assistant',
                  style: AppThemeTextStyles.cardTitle(context),
                ),
                const Spacer(),
                IconButton(
                  icon: Icon(Icons.close, color: theme.textSecondary, size: 18),
                  onPressed: () => setState(() => _isExpanded = false),
                  padding: const EdgeInsets.all(4),
                  constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                ),
              ],
            ),
          ),

          // Chat messages
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(10),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final message = _messages[index];
                return _ChatBubble(message: message);
              },
            ),
          ),

          // Loading indicator
          if (_isLoading)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              child: Row(
                children: [
                  const SizedBox(
                    width: 14,
                    height: 14,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(AppThemeColors.primaryAccent),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'AI is thinking...',
                    style: AppThemeTextStyles.caption(context),
                  ),
                ],
              ),
            ),

          // Input field
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: theme.bgBody,
              border: Border(
                top: BorderSide(color: theme.divider),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    maxLines: 3,
                    minLines: 1,
                    style: AppThemeTextStyles.body(context),
                    decoration: InputDecoration(
                      hintText: 'Ask AI for help...',
                      hintStyle: AppThemeTextStyles.caption(context),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(AppThemeDimensions.borderRadiusButton),
                        borderSide: BorderSide(color: theme.borderInput),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(AppThemeDimensions.borderRadiusButton),
                        borderSide: BorderSide(color: theme.borderInput),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(AppThemeDimensions.borderRadiusButton),
                        borderSide: const BorderSide(color: AppThemeColors.primaryAccent, width: 2),
                      ),
                      filled: true,
                      fillColor: theme.bgInput,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 8,
                      ),
                    ),
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 8),
                ElevatedButton(
                  onPressed: _isLoading ? null : _sendMessage,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppThemeColors.primaryAccent,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.all(10),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppThemeDimensions.borderRadiusButton),
                    ),
                    elevation: 0,
                    minimumSize: const Size(36, 36),
                  ),
                  child: const Icon(Icons.send, color: Colors.white, size: 18),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ChatMessage {
  final String role; // 'user' or 'assistant'
  final String content;

  _ChatMessage({required this.role, required this.content});
}

class _ChatBubble extends StatelessWidget {
  final _ChatMessage message;

  const _ChatBubble({required this.message});

  @override
  Widget build(BuildContext context) {
    final theme = AppThemeColors.of(context);
    final isUser = message.role == 'user';

    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!isUser) ...[
            Container(
              width: 28,
              height: 28,
              decoration: const BoxDecoration(
                color: AppThemeColors.primaryAccent,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.smart_toy, size: 16, color: Colors.white),
            ),
            const SizedBox(width: 6),
          ],
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: BoxDecoration(
                color: isUser
                    ? AppThemeColors.primaryAccent.withValues(alpha: 0.15)
                    : theme.bgCard,
                borderRadius: BorderRadius.circular(AppThemeDimensions.borderRadiusM),
                border: Border.all(
                  color: isUser
                      ? AppThemeColors.primaryAccent.withValues(alpha: 0.3)
                      : theme.borderCard,
                ),
              ),
              child: Text(
                message.content,
                style: AppThemeTextStyles.body(context),
              ),
            ),
          ),
          if (isUser) ...[
            const SizedBox(width: 6),
            Container(
              width: 28,
              height: 28,
              decoration: BoxDecoration(
                color: theme.textMuted,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.person, size: 16, color: Colors.white),
            ),
          ],
        ],
      ),
    );
  }
}
