import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../core/theme/app_theme_colors.dart';
import '../../../../../core/theme/app_theme_text_styles.dart';
import '../../../../../core/theme/app_theme_dimensions.dart';
import '../../providers/slide_provider.dart';
import '../../../data/models/page_models.dart';
import '../../../../whiteboard/data/models/slide_model.dart';



class SlidePanelDrawer extends ConsumerWidget {
  const SlidePanelDrawer({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final slideState = ref.watch(slideNotifierProvider);
    final pages = slideState.pages;
    final slideNotifier = ref.read(slideNotifierProvider.notifier);
    final theme = AppThemeColors.of(context);
    

    return Drawer(
      backgroundColor: theme.bgSidebar,
      elevation: 0,
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.fromLTRB(16, 60, 16, 16),
            decoration: BoxDecoration(
              color: theme.bgMain,
              border: Border(
                bottom: BorderSide(color: theme.divider),
              ),
            ),
            child: Row(
              children: [
                Icon(Icons.layers_outlined, color: AppThemeColors.primaryAccent, size: 20),
                const SizedBox(width: 10),
                Text('Slide Manager',
                  style: AppThemeTextStyles.cardTitle(context)),
                const Spacer(),
                Text('${pages.length} Slides', style: AppThemeTextStyles.caption(context)),
              ],
            ),
          ),


          // Slide List
          Expanded(
            child: pages.isEmpty
                ? Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.inbox_outlined, color: theme.textMuted, size: 40),
                        const SizedBox(height: 10),
                        Text('No slides imported', style: AppThemeTextStyles.body(context).copyWith(color: theme.textMuted)),
                        const SizedBox(height: 4),
                        Text('Use "Import Set" to load questions', style: AppThemeTextStyles.caption(context)),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                    itemCount: pages.length,
                    itemBuilder: (context, index) {
                      final page = pages[index];
                      final isSelected = slideState.currentPageIndex == index;
                      final hasSavedAnnotation = slideState.savedAnnotations.containsKey(page.id);

                      return Padding(
                        key: ValueKey(page.id),
                        padding: const EdgeInsets.only(bottom: 8),
                        child: _SlideTile(
                          index: index,
                          page: page,
                          isSelected: isSelected,
                          hasAnnotation: hasSavedAnnotation,
                          onTap: () {
                            slideNotifier.navigateToSlide(index);
                            Navigator.of(context).pop();
                          },
                        ),
                      );
                    },
                  ),
          ),

        ],
      ),
    );
  }
}

class _SlideTile extends StatelessWidget {
  final int index;
  final WhiteboardPage page;
  final bool isSelected;
  final bool hasAnnotation;
  final VoidCallback onTap;

  const _SlideTile({
    required this.index,
    required this.page,
    required this.isSelected,
    required this.hasAnnotation,
    required this.onTap,
  });


  /// Strip basic HTML tags for thumbnail preview text.
  String _stripHtml(String html) {
    return html
        .replaceAll(RegExp(r'<[^>]+>'), ' ')
        .replaceAll(RegExp(r'&nbsp;'), ' ')
        .replaceAll(RegExp(r'&'), '&')
        .replaceAll(RegExp(r'<'), '<')
        .replaceAll(RegExp(r'>'), '>')
        .replaceAll(RegExp(r'\s+'), ' ')
        .trim();
  }

  @override
  Widget build(BuildContext context) {
    final theme = AppThemeColors.of(context);
    
    String title = 'Blank Page';
    String previewText = 'Empty surface';
    String? source;
    int? qNum;
    int optCount = 0;

    if (page is SetImportPage) {
      final importPage = page as SetImportPage;
      final slide = importPage.slide;
      final isPdf = importPage.setId.startsWith('pdf-');

      title = isPdf ? 'Page ${slide.questionNumber}' : 'Question ${slide.questionNumber}';
      previewText = slide.questionText;
      source = isPdf ? null : slide.examSource;
      qNum = slide.questionNumber;
      optCount = isPdf ? 0 : slide.options.length;
    }

    final isPdfSource = (page is SetImportPage) && (page as SetImportPage).setId.startsWith('pdf-');

    final questionPreview = _stripHtml(previewText);
    final truncated = questionPreview.length > 80
        ? '${questionPreview.substring(0, 80)}…'
        : questionPreview;

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        decoration: BoxDecoration(
          color: isSelected
              ? AppThemeColors.primaryAccent.withValues(alpha: 0.12)
              : theme.bgCard,
          borderRadius: BorderRadius.circular(AppThemeDimensions.borderRadiusCard),
          border: Border.all(
            color: isSelected ? AppThemeColors.primaryAccent : theme.borderCard,
            width: isSelected ? 2 : 1,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Thumbnail area
            Container(
              height: 64,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: BoxDecoration(
                color: theme.bgMain.withValues(alpha: 0.5),
                borderRadius: BorderRadius.vertical(top: Radius.circular(AppThemeDimensions.borderRadiusCard - 1)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: qNum != null
                              ? (isPdfSource ? const Color(0xFF2196F3) : AppThemeColors.primaryAccent)
                              : const Color(0xFF888888),
                          borderRadius: BorderRadius.circular(AppThemeDimensions.borderRadiusPill),
                        ),
                        child: Text(
                          qNum != null ? (isPdfSource ? 'P$qNum' : 'Q$qNum') : 'PAGE',
                          style: AppThemeTextStyles.pill(context).copyWith(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      if (source != null) ...[
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            source,
                            style: AppThemeTextStyles.caption(context),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 4),
                  Expanded(
                    child: Text(
                      truncated,
                      style: AppThemeTextStyles.caption(context).copyWith(
                        color: theme.textSecondary,
                        height: 1.4,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
            // Footer
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              child: Row(
                children: [
                  Text(
                    isPdfSource ? 'Page ${index + 1}' : 'Slide ${index + 1}',
                    style: AppThemeTextStyles.caption(context).copyWith(
                      color: isSelected ? AppThemeColors.primaryAccent : theme.textSecondary,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                    ),
                  ),
                  const Spacer(),
                  if (hasAnnotation)
                    Tooltip(
                      message: 'Has annotations',
                      child: Icon(Icons.edit_note, color: AppThemeColors.primaryAccent, size: 14),
                    ),
                  if (optCount > 0) ...[
                    const SizedBox(width: 4),
                    Text(
                      '$optCount opts',
                      style: AppThemeTextStyles.caption(context),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}


