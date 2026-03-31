import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_colorpicker/flutter_colorpicker.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../providers/canvas_provider.dart';

class QuestionThemeDialog extends ConsumerStatefulWidget {
  const QuestionThemeDialog({super.key});

  @override
  ConsumerState<QuestionThemeDialog> createState() => _QuestionThemeDialogState();
}

class _QuestionThemeDialogState extends ConsumerState<QuestionThemeDialog> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 5, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final canvasState = ref.watch(canvasStateProvider);
    final notifier = ref.read(canvasStateProvider.notifier);
    final theme = canvasState.questionTheme;

    return Dialog(
      backgroundColor: const Color(0xFF1E1E30),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16.r)),
      child: Container(
        width: 500.w,
        padding: EdgeInsets.all(24.w),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Color Management',
              style: GoogleFonts.dmSans(
                color: Colors.white,
                fontSize: 18.sp,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 16.h),
            
            TabBar(
              controller: _tabController,
              isScrollable: true,
              labelColor: Colors.orange,
              unselectedLabelColor: Colors.white38,
              indicatorColor: Colors.orange,
              dividerColor: Colors.transparent,
              tabs: const [
                Tab(text: 'Q Color'),
                Tab(text: 'Q BG'),
                Tab(text: 'Opt Color'),
                Tab(text: 'Opt BG'),
                Tab(text: 'Screen BG'),
              ],
            ),
            
            SizedBox(height: 24.h),
            SizedBox(
              height: 300.h,
              child: TabBarView(
                controller: _tabController,
                children: [
                   _buildPicker(theme.questionColor, (c) => notifier.updateQuestionTheme(theme.copyWith(questionColor: c))),
                   _buildPicker(theme.questionBgColor, (c) => notifier.updateQuestionTheme(theme.copyWith(questionBgColor: c))),
                   _buildPicker(theme.optionColor, (c) => notifier.updateQuestionTheme(theme.copyWith(optionColor: c))),
                   _buildPicker(theme.optionBgColor, (c) => notifier.updateQuestionTheme(theme.copyWith(optionBgColor: c))),
                   _buildPicker(theme.screenBgColor, (c) => notifier.updateQuestionTheme(theme.copyWith(screenBgColor: c))),
                ],
              ),
            ),
            
            SizedBox(height: 24.h),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                 ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.orange),
                  child: const Text('Save & Close', style: TextStyle(color: Colors.white)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPicker(Color color, ValueChanged<Color> onColorChanged) {
    return SingleChildScrollView(
      child: ColorPicker(
        pickerColor: color,
        onColorChanged: onColorChanged,
        pickerAreaHeightPercent: 0.7,
        enableAlpha: false,
        displayThumbColor: true,
        paletteType: PaletteType.hsvWithHue,
        labelTypes: const [],
        pickerAreaBorderRadius: BorderRadius.circular(8.r),
      ),
    );
  }
}
