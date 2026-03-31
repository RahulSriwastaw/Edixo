import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_widget_from_html/flutter_widget_from_html.dart';
import '../../providers/canvas_provider.dart';
import '../../../questions/data/models/question_model.dart';

class SlideContentLayer extends ConsumerWidget {
  const SlideContentLayer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final canvasState = ref.watch(canvasStateProvider);
    final page = canvasState.currentPage;
    final question = page.question;
    final theme = canvasState.questionTheme;

    if (question == null) return const SizedBox.shrink();

    return Container(
      width: double.infinity,
      height: double.infinity,
      color: theme.screenBgColor,
      padding: EdgeInsets.symmetric(horizontal: 100.w, vertical: 60.h),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Question Box
          Container(
            width: double.infinity,
            padding: EdgeInsets.all(32.w),
            decoration: BoxDecoration(
              color: theme.questionBgColor,
              borderRadius: BorderRadius.circular(16.r),
              border: Border.all(color: Colors.white12, width: 1),
              boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 10)],
            ),
            child: HtmlWidget(
              question.text,
              textStyle: TextStyle(
                color: theme.questionColor,
                fontSize: 24.sp,
                height: 1.5,
              ),
            ),
          ),
          
          SizedBox(height: 48.h),
          
          // Options Grid/List
          Expanded(
            child: GridView.builder(
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 4,
                crossAxisSpacing: 32.w,
                mainAxisSpacing: 24.h,
              ),
              itemCount: question.options.length,
              itemBuilder: (context, index) {
                return _optionItem(
                  index, 
                  question.options[index],
                  theme,
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _optionItem(int index, String text, QuestionTheme theme) {
    final label = String.fromCharCode(65 + index); // A, B, C, D
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 12.h),
      decoration: BoxDecoration(
        color: theme.optionBgColor,
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(color: Colors.white10),
      ),
      child: Row(
        children: [
          Container(
            width: 32.w, height: 32.w,
            decoration: BoxDecoration(
              color: theme.optionColor.withOpacity(0.2),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                label,
                style: TextStyle(color: theme.optionColor, fontWeight: FontWeight.bold, fontSize: 14.sp),
              ),
            ),
          ),
          SizedBox(width: 16.w),
          Expanded(
            child: HtmlWidget(
              text,
              textStyle: TextStyle(color: Colors.white, fontSize: 18.sp),
            ),
          ),
        ],
      ),
    );
  }
}
