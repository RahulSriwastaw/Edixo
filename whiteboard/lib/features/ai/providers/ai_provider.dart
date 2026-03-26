import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:async';
import '../domain/models/ai_message.dart';
import 'package:uuid/uuid.dart';
import 'dart:convert';
import 'dart:ui' as ui;
import 'package:flutter/rendering.dart';
import 'package:flutter/material.dart';
import '../../super_admin/providers/module_config_provider.dart';
import '../../../core/api/api_client.dart';
import '../../whiteboard/providers/canvas_provider.dart';

class AIState {
  final List<AIMessage> messages;
  final bool isLoading;
  final String language;
  final int gradeLevel;
  final int usedTokens;
  final bool isQuotaExceeded;

  AIState({
    this.messages = const [],
    this.isLoading = false,
    this.language = 'English',
    this.gradeLevel = 10,
    this.usedTokens = 0,
    this.isQuotaExceeded = false,
  });

  AIState copyWith({
    List<AIMessage>? messages,
    bool? isLoading,
    String? language,
    int? gradeLevel,
    int? usedTokens,
    bool? isQuotaExceeded,
  }) {
    return AIState(
      messages: messages ?? this.messages,
      isLoading: isLoading ?? this.isLoading,
      language: language ?? this.language,
      gradeLevel: gradeLevel ?? this.gradeLevel,
      usedTokens: usedTokens ?? this.usedTokens,
      isQuotaExceeded: isQuotaExceeded ?? this.isQuotaExceeded,
    );
  }
}

class AINotifier extends StateNotifier<AIState> {
  AINotifier() : super(AIState());

  void _addMessage(AIMessage message) {
    state = state.copyWith(messages: [...state.messages, message]);
  }

  Future<String?> _captureCanvas(WidgetRef ref) async {
    try {
      final boundaryKey = ref.read(canvasBoundaryKeyProvider) as GlobalKey;
      if (boundaryKey.currentContext == null) return null;
      final boundary = boundaryKey.currentContext!.findRenderObject() as RenderRepaintBoundary;
      final image = await boundary.toImage(pixelRatio: 1.0);
      final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
      if (byteData == null) return null;
      return base64Encode(byteData.buffer.asUint8List());
    } catch (e) {
      return null;
    }
  }

  Future<void> sendMessage(String text, WidgetRef ref) async {
    final config = ref.read(moduleConfigProvider);
    if (state.usedTokens >= config.globalAiTokenLimit) {
      state = state.copyWith(isQuotaExceeded: true);
      _addMessage(AIMessage(
        id: const Uuid().v4(),
        text: "AI limit reached for this session. Please contact your admin.",
        isUser: false,
        timestamp: DateTime.now(),
      ));
      return;
    }

    final userMsg = AIMessage(
      id: const Uuid().v4(),
      text: text,
      isUser: true,
      timestamp: DateTime.now(),
    );

    state = state.copyWith(messages: [...state.messages, userMsg], isLoading: true);

    try {
      final base64Img = await _captureCanvas(ref);
      final dio = ref.read(dioProvider);
      final response = await dio.post(
        '/ai/canvas-query',
        data: {
          'query': text,
          'language': state.language,
          'gradeLevel': state.gradeLevel,
          if (base64Img != null) 'image': base64Img,
        },
      );

      final aiText = response.data['data'] as String? ?? 'No response received.';
      state = state.copyWith(isLoading: false);
      
      final msgId = const Uuid().v4();
      _addMessage(AIMessage(
        id: msgId,
        text: '',
        isUser: false,
        timestamp: DateTime.now(),
      ));
      
      final words = aiText.split(' ');
      String currentText = '';
      for (final word in words) {
        await Future.delayed(const Duration(milliseconds: 30));
        currentText += '$word ';
        
        final msgs = List<AIMessage>.from(state.messages);
        final idx = msgs.indexWhere((m) => m.id == msgId);
        if (idx != -1) {
          msgs[idx] = msgs[idx].copyWith(text: currentText.trim());
          state = state.copyWith(
            messages: msgs,
            usedTokens: state.usedTokens + (word.length + 1),
          );
        }
      }
    } catch (e) {
      _addMessage(AIMessage(
        id: const Uuid().v4(),
        text: '⚠️ AI unavailable. Error: ${e.toString().substring(0, 60)}',
        isUser: false,
        timestamp: DateTime.now(),
      ));
      state = state.copyWith(isLoading: false);
    }
  }

  Future<void> explainCurrentTopic(WidgetRef ref) => sendMessage('Is topic ko step-by-step explain karo aur samajhne mein aasaan banao.', ref);
  Future<void> solveCurrentQuestion(WidgetRef ref) => sendMessage('Is question ka solution step-by-step dikhao.', ref);
  Future<void> generateExamples(WidgetRef ref) => sendMessage('Is concept ke 3 aur examples do jo students ke liye helpful hon.', ref);
  Future<void> summarizePage(WidgetRef ref) => sendMessage('Current whiteboard page ka content summarize karo.', ref);
  Future<void> recognizeHandwriting(WidgetRef ref) => sendMessage('[OCR] Whiteboard ka handwritten text identify karo.', ref);
  Future<void> askAboutQuestion(dynamic question, WidgetRef ref) => sendMessage('Is question ke baare mein explain karo: ${question.questionText}', ref);

  void setLanguage(String lang) => state = state.copyWith(language: lang);
  void setGradeLevel(int level) => state = state.copyWith(gradeLevel: level);

  Future<void> startVoiceRecognition(WidgetRef ref) async {
    state = state.copyWith(isLoading: true);
    await Future.delayed(const Duration(seconds: 2));
    // Simulated transcript
    final transcript = state.language == 'hi' ? 'Newton ka second law samjhao' : 'Explain Newtons second law';
    state = state.copyWith(isLoading: false);
    sendMessage(transcript, ref);
  }

  String _generateResponse(String query) {
    final q = query.toLowerCase();
    final isHindi = state.language == 'hi';
    final isAdvanced = state.gradeLevel > 10;

    if (q.contains('newton') || q.contains('law')) {
      if (isHindi) {
        return isAdvanced 
          ? '**Newton ka Second Law (Advanced):**\n\nForce (F) momentum ke change ki rate ke barabar hota hai: \$F = \\frac{dp}{dt} = ma\$. Ye vector quantity hai.\n\n*Class ${state.gradeLevel} ke hisaab se.*'
          : '**Newton ka Second Law (Simple):**\n\nKisi object ko push ya pull (Force) karne se uska acceleration mass par depend karta hai: \$F = ma\$.\n\n*Class ${state.gradeLevel} ke hisaab se.*';
      } else {
        return isAdvanced
          ? '**Newton\'s Second Law (Advanced):**\n\nForce is the rate of change of momentum: \$F = \\frac{dp}{dt} = ma\$. It involves vector calculus.\n\n*Grade ${state.gradeLevel} complexity.*'
          : '**Newton\'s Second Law (Simple):**\n\nForce equals mass times acceleration: \$F = ma\$. It means heavy things need more force to move.\n\n*Grade ${state.gradeLevel} complexity.*';
      }
    }

    if (q.contains('explain')) {
      return isHindi 
        ? '**Explanation (Class ${state.gradeLevel}):**\n\n1. Concept ki shuruat\n2. Main point\n3. Daily life example'
        : '**Explanation (Grade ${state.gradeLevel}):**\n\n1. Concept Foundation\n2. Theoretical core\n3. Real-world application';
    }
    
    return isHindi 
      ? 'Main Class ${state.gradeLevel} ke level par Hindi mein aapki help kar sakta hun. Kya puchna chahte hain?'
      : 'I can assist you in English for Grade ${state.gradeLevel} level. What is your question?';
  }
}

final aiProvider = StateNotifierProvider<AINotifier, AIState>((ref) => AINotifier());
final aiMessagesProvider = Provider<List<AIMessage>>((ref) => ref.watch(aiProvider).messages);
final aiLoadingProvider = Provider<bool>((ref) => ref.watch(aiProvider).isLoading);
final aiPanelVisibilityProvider = StateProvider<bool>((ref) => false);
