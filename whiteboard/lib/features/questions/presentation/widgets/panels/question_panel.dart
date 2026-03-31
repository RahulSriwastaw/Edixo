import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../../core/theme/app_theme.dart';
import '../../../providers/question_provider.dart';
import '../../../domain/models/question.dart';
import '../../../../whiteboard/providers/whiteboard_provider.dart';
import '../../../../whiteboard/providers/canvas_provider.dart';
import '../../../../ai/providers/ai_provider.dart';
import '../set_loader_dialog.dart';

class QuestionPanel extends ConsumerWidget {
  const QuestionPanel({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final questionState = ref.watch(questionPanelProvider);

    return Column(
      children: [
        // Header
        _buildHeader(context, ref),

        // Content
        Expanded(
          child: questionState.when(
            data: (state) {
              if (state.questions.isEmpty) {
                return _buildEmptyState(context, ref);
              }
              return _buildQuestionView(context, ref, state);
            },
            loading: () => const Center(
              child: CircularProgressIndicator(),
            ),
            error: (err, _) => Center(
              child: Text('Error: $err', style: const TextStyle(color: Colors.red)),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildHeader(BuildContext context, WidgetRef ref) {
    return Container(
      padding: EdgeInsets.all(16.w),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [Color(0xFF1E2235), Color(0xFF2D2D3A)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                padding: EdgeInsets.all(6.w),
                decoration: BoxDecoration(
                  color: AppTheme.primaryOrange.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8.r),
                ),
                child: Icon(Icons.quiz_outlined, color: AppTheme.primaryOrange, size: 18.w),
              ),
              SizedBox(width: 10.w),
              Text(
                'Questions Panel',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15.sp),
              ),
            ],
          ),
          SizedBox(height: 12.h),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: () => _showSetLoader(context),
              icon: const Icon(Icons.add_circle_outline, size: 18),
              label: const Text('Load Questions (Set ID)'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryOrange,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8.r)),
                minimumSize: Size(0, 40.h),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, WidgetRef ref) {
    return Center(
      child: Padding(
        padding: EdgeInsets.all(24.w),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.inventory_2_outlined, size: 72.w, color: Colors.grey.shade300),
            SizedBox(height: 16.h),
            Text(
              'No Questions Loaded',
              style: TextStyle(
                fontSize: 18.sp,
                fontWeight: FontWeight.bold,
                color: Colors.grey.shade700,
              ),
            ),
            SizedBox(height: 8.h),
            Text(
              'Enter a Set ID or MockTest ID to load questions from EduHub',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13.sp, color: Colors.grey.shade500),
            ),
            SizedBox(height: 24.h),
            ElevatedButton.icon(
              onPressed: () => _showSetLoader(context),
              icon: const Icon(Icons.add),
              label: const Text('Load Questions'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuestionView(BuildContext context, WidgetRef ref, QuestionPanelState state) {
    final currentQ = state.currentQuestion;

    return SingleChildScrollView(
      child: Padding(
        padding: EdgeInsets.all(16.w),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Set Info Card
            Container(
              padding: EdgeInsets.all(12.w),
              decoration: BoxDecoration(
                color: const Color(0xFFF0F4F8),
                borderRadius: BorderRadius.circular(10.r),
                border: Border.all(color: const Color(0xFFDBEAFE)),
              ),
              child: Row(
                children: [
                  Icon(Icons.inventory_2, size: 16.w, color: AppTheme.accentBlue),
                  SizedBox(width: 8.w),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          state.setName,
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13.sp),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                        Text(
                          '${state.totalQuestions} Questions • ${state.creatorName}',
                          style: TextStyle(color: Colors.grey.shade600, fontSize: 11.sp),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 8.w, vertical: 2.h),
                    decoration: BoxDecoration(
                      color: AppTheme.accentBlue,
                      borderRadius: BorderRadius.circular(12.r),
                    ),
                    child: Text(
                      '#${state.setId}',
                      style: TextStyle(color: Colors.white, fontSize: 10.sp),
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(height: 16.h),

            // Navigation row
            Container(
              padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 8.h),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(8.r),
              ),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.chevron_left),
                    onPressed: state.currentIndex > 0
                        ? () => ref.read(questionPanelProvider.notifier).previousQuestion()
                        : null,
                    visualDensity: VisualDensity.compact,
                  ),
                  Expanded(
                    child: Center(
                      child: Text(
                        'Q ${state.currentIndex + 1} / ${state.totalQuestions}',
                        style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14.sp),
                      ),
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.chevron_right),
                    onPressed: state.currentIndex < state.totalQuestions - 1
                        ? () => ref.read(questionPanelProvider.notifier).nextQuestion()
                        : null,
                    visualDensity: VisualDensity.compact,
                  ),
                ],
              ),
            ),
            SizedBox(height: 16.h),

            // Question Content
            if (currentQ != null) ...[
              Container(
                padding: EdgeInsets.all(16.w),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12.r),
                  border: Border.all(color: Colors.grey.shade200),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2)),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Question text
                    Text(
                      currentQ.questionText,
                      style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.w500, height: 1.5),
                    ),
                    SizedBox(height: 16.h),

                    // Options
                    ...currentQ.options.asMap().entries.map((entry) {
                      final labels = ['A', 'B', 'C', 'D', 'E'];
                      final label = labels[entry.key];
                      final option = entry.value;
                      return Container(
                        margin: EdgeInsets.only(bottom: 8.h),
                        padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 10.h),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade50,
                          borderRadius: BorderRadius.circular(8.r),
                          border: Border.all(color: Colors.grey.shade200),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 26.w,
                              height: 26.w,
                              decoration: BoxDecoration(
                                color: AppTheme.accentBlue.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(13.r),
                              ),
                              child: Center(
                                child: Text(label, style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.accentBlue, fontSize: 12.sp)),
                              ),
                            ),
                            SizedBox(width: 10.w),
                            Expanded(child: Text(option, style: TextStyle(fontSize: 13.sp))),
                          ],
                        ),
                      );
                    }),
                  ],
                ),
              ),
              SizedBox(height: 16.h),

              // Action buttons
              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => _copyToCanvas(context, ref, currentQ),
                      icon: const Icon(Icons.content_copy, size: 16),
                      label: const Text('Copy to Canvas', style: TextStyle(fontSize: 12)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF10B981),
                        minimumSize: Size(0, 40.h),
                      ),
                    ),
                  ),
                ],
              ),
              SizedBox(height: 8.h),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _showAnswer(context, currentQ),
                      icon: const Icon(Icons.visibility, size: 16),
                      label: const Text('Answer', style: TextStyle(fontSize: 12)),
                      style: OutlinedButton.styleFrom(
                        minimumSize: Size(0, 38.h),
                      ),
                    ),
                  ),
                  SizedBox(width: 8.w),
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _askAI(context, ref, currentQ),
                      icon: Icon(Icons.auto_awesome, size: 16, color: Colors.purpleAccent),
                      label: const Text('Ask AI', style: TextStyle(fontSize: 12)),
                      style: OutlinedButton.styleFrom(
                        minimumSize: Size(0, 38.h),
                        side: const BorderSide(color: Colors.purpleAccent),
                        foregroundColor: Colors.purpleAccent,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _showSetLoader(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const SetLoaderDialog(),
    );
  }

  void _copyToCanvas(BuildContext context, WidgetRef ref, Question question) {
    ref.read(canvasStateProvider.notifier).addQuestion(question);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('Question copied to canvas!'),
        backgroundColor: const Color(0xFF10B981),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8.r)),
      ),
    );
  }

  void _showAnswer(BuildContext context, Question question) {
    final labels = ['A', 'B', 'C', 'D'];
    final correctLabel = labels[question.correctOption];
    final correctText = question.options[question.correctOption];

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: [
            const Icon(Icons.check_circle, color: Color(0xFF10B981)),
            const SizedBox(width: 8),
            const Text('Correct Answer'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: const Color(0xFF10B981).withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFF10B981).withOpacity(0.3)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 28,
                    height: 28,
                    decoration: BoxDecoration(color: const Color(0xFF10B981), borderRadius: BorderRadius.circular(14)),
                    child: Center(child: Text(correctLabel, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold))),
                  ),
                  const SizedBox(width: 10),
                  Expanded(child: Text(correctText, style: const TextStyle(fontWeight: FontWeight.w500))),
                ],
              ),
            ),
            if (question.explanation != null) ...[
              const SizedBox(height: 12),
              Text('Explanation:', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey.shade700)),
              const SizedBox(height: 6),
              Text(question.explanation!, style: const TextStyle(height: 1.4)),
            ],
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Close')),
        ],
      ),
    );
  }

  void _askAI(BuildContext context, WidgetRef ref, Question question) {
    ref.read(aiProvider.notifier).askAboutQuestion(question, ref);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Question sent to AI panel!')),
    );
  }
}
