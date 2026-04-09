
import 'package:flutter/material.dart';
import 'package:flutter_math_fork/flutter_math.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../data/models/set_layout_models.dart';
import '../../../../core/constants/api_constants.dart';


class QuestionDisplayWidget extends StatelessWidget {
  final int questionNumber;
  final String text;
  final String? source;
  final String? imageUrl;
  final SetSettingsModel settings;

  const QuestionDisplayWidget({
    super.key,
    required this.questionNumber,
    required this.text,
    this.source,
    this.imageUrl,
    required this.settings,
  });

  @override
  Widget build(BuildContext context) {
    final showBg = settings.showCardBackground;

    return Container(
      decoration: BoxDecoration(
        color: showBg ? Color(settings.questionBg) : Colors.transparent,
        borderRadius: BorderRadius.circular(12),
        border: (showBg && settings.questionBorderWidth > 0)
            ? Border.all(
                color: Color(settings.questionBorderColor),
                width: settings.questionBorderWidth,
              )
            : null,
        boxShadow: showBg
            ? [
                BoxShadow(
                  color: Colors.black.withOpacity(0.2),
                  blurRadius: 8,
                  offset: const Offset(0, 4),
                ),
              ]
            : [],
      ),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          // Question Content (Wraps natively)
          Positioned.fill(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(16, 28, 16, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (imageUrl != null)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12.0),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.network(
                          ApiConstants.resolveUrl(imageUrl!),
                          fit: BoxFit.contain,
                          errorBuilder: (context, error, stackTrace) =>
                              const Icon(Icons.broken_image, color: Colors.white24),
                        ),
                      ),
                    ),
                  _buildText(context),
                ],
              ),
            ),
          ),

          // Question Number Badge
          if (showBg)
            Positioned(
              top: 0,
              left: 0,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                decoration: const BoxDecoration(
                  color: Colors.orange,
                  borderRadius: BorderRadius.only(
                    topLeft: Radius.circular(11),
                    bottomRight: Radius.circular(12),
                  ),
                ),
                child: Text(
                  'Q $questionNumber',
                  style: const TextStyle(
                    color: Colors.black,
                    fontWeight: FontWeight.w800,
                    fontSize: 12,
                  ),
                ),
              ),
            ),

          // Source Badge
          if (showBg && settings.showSourceBadge && source != null)
            Positioned(
              top: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.15),
                  borderRadius: const BorderRadius.only(
                    topRight: Radius.circular(11),
                    bottomLeft: Radius.circular(12),
                  ),
                ),
                child: Text(
                  source!,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                    fontSize: 10,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildText(BuildContext context) {
    // Check if text contains LaTeX (wrapped in $$ or \( \))
    if (text.contains(RegExp(r'\$.*?\$')) || text.contains(r'\(')) {
      return Math.tex(
        text.replaceAll(r'$', ''),
        textStyle: TextStyle(
          fontSize: settings.questionFontSize,
          color: Color(settings.questionColor),
        ),
      );
    }

    // Default rendering with Hindi support
    return Text(
      text,
      style: GoogleFonts.notoSansDevanagari(
        fontSize: settings.questionFontSize,
        color: Color(settings.questionColor),
        height: 1.5,
      ),
    );
  }
}
