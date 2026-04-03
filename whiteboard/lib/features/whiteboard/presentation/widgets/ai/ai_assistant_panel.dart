// lib/features/whiteboard/presentation/widgets/ai/ai_assistant_panel.dart

import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'dart:async';
import 'dart:convert';
import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/constants/app_text_styles.dart';
import '../../../../../core/constants/app_dimensions.dart';

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
    Future.delayed(Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: Duration(milliseconds: 300),
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
    Future.delayed(Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<String> _callClaudeApi(String message) async {
    // TODO: Replace with actual Claude API endpoint and API key
    // This is a placeholder implementation
    await Future.delayed(Duration(seconds: 2));
    
    // Simulated response
    return 'This is a simulated AI response. In production, this would call the Claude API with your question: "$message"';
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: Duration(milliseconds: 300),
      width: _isExpanded ? 320 : 48,
      height: double.infinity,
      child: _isExpanded ? _buildExpandedPanel() : _buildCollapsedButton(),
    );
  }

  Widget _buildCollapsedButton() {
    return GestureDetector(
      onTap: () => setState(() => _isExpanded = true),
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.accentOrange,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(12),
            bottomLeft: Radius.circular(12),
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.smart_toy, color: Colors.white, size: 24),
            SizedBox(height: 8),
            Transform.rotate(
              angle: -pi / 2,
              child: Text(
                'AI Assistant',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 12,
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
    return Container(
      decoration: BoxDecoration(
        color: AppColors.bgSecondary,
        border: Border(
          left: BorderSide(color: AppColors.textDisabled.withOpacity(0.2)),
        ),
      ),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.bgPrimary,
              border: Border(
                bottom: BorderSide(color: AppColors.textDisabled.withOpacity(0.2)),
              ),
            ),
            child: Row(
              children: [
                Icon(Icons.smart_toy, color: AppColors.accentOrange, size: 24),
                const SizedBox(width: 12),
                Text(
                  'AI Assistant',
                  style: AppTextStyles.heading2,
                ),
                const Spacer(),
                IconButton(
                  icon: Icon(Icons.close, color: AppColors.textSecondary),
                  onPressed: () => setState(() => _isExpanded = false),
                ),
              ],
            ),
          ),

          // Chat messages
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(12),
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
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Row(
                children: [
                  SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(AppColors.accentOrange),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'AI is thinking...',
                    style: AppTextStyles.bodySmall.copyWith(color: AppColors.textDisabled),
                  ),
                ],
              ),
            ),

          // Input field
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.bgPrimary,
              border: Border(
                top: BorderSide(color: AppColors.textDisabled.withOpacity(0.2)),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    maxLines: 3,
                    minLines: 1,
                    style: AppTextStyles.body.copyWith(color: AppColors.textPrimary),
                    decoration: InputDecoration(
                      hintText: 'Ask AI for help...',
                      hintStyle: AppTextStyles.bodySmall.copyWith(color: AppColors.textDisabled),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: AppColors.textDisabled.withOpacity(0.3)),
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 12,
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
                    backgroundColor: AppColors.accentOrange,
                    padding: const EdgeInsets.all(12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Icon(Icons.send, color: Colors.white),
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
    final isUser = message.role == 'user';

    return Padding(
      padding: EdgeInsets.only(bottom: AppDimensions.borderRadiusM),
      child: Row(
        mainAxisAlignment: isUser ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (!isUser) ...[
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: AppColors.accentOrange,
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.smart_toy, size: 18, color: Colors.white),
            ),
            SizedBox(width: AppDimensions.borderRadiusS),
          ],
          Flexible(
            child: Container(
              padding: EdgeInsets.all(AppDimensions.borderRadiusM),
              decoration: BoxDecoration(
                color: isUser
                    ? AppColors.accentOrange.withOpacity(0.2)
                    : AppColors.bgPrimary,
                borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
                border: Border.all(
                  color: isUser
                      ? AppColors.accentOrange.withOpacity(0.3)
                      : AppColors.textTertiary.withOpacity(0.2),
                ),
              ),
              child: Text(
                message.content,
                style: AppTextStyles.body.copyWith(
                  color: AppColors.textPrimary,
                ),
              ),
            ),
          ),
          if (isUser) ...[
            SizedBox(width: AppDimensions.borderRadiusS),
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: AppColors.textTertiary,
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.person, size: 18, color: Colors.white),
            ),
          ],
        ],
      ),
    );
  }
}
