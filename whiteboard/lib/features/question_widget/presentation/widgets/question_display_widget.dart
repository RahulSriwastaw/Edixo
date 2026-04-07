
import 'package:flutter/material.dart';
import 'package:flutter_math_fork/flutter_math.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../data/models/set_layout_models.dart';


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
    return Container(
      decoration: BoxDecoration(
        color: Color(settings.questionBg),
        borderRadius: BorderRadius.circular(12),
        border: settings.questionBorderWidth > 0
            ? Border.all(
                color: Color(settings.questionBorderColor),
                width: settings.questionBorderWidth,
              )
            : null,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Stack(
        children: [
          // Question Content (Auto-scaling)
          Positioned.fill(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: FittedBox(
                fit: BoxFit.contain,
                alignment: Alignment.topLeft,
                child: ConstrainedBox(
                  // constrain the width to something reasonable so text wraps
                  constraints: const BoxConstraints(maxWidth: 800),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const SizedBox(height: 32), // Space for badge
                      if (imageUrl != null)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 12.0),
                          child: Image.network(
                            imageUrl!,
                            fit: BoxFit.contain,
                            errorBuilder: (context, error, stackTrace) =>
                                const Icon(Icons.broken_image, color: Colors.white24),
                          ),
                        ),
                      _buildText(context),
                    ],
                  ),
                ),
              ),
            ),
          ),
          // ... [rest of the badges logic stays same or fits below]

          // Question Number Badge
          Positioned(
            top: 0,
            left: 0,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.orange,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                'Q $questionNumber',
                style: const TextStyle(
                  color: Colors.black,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ),
          ),

          // Source Badge
          if (settings.showSourceBadge && source != null)
            Positioned(
              top: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: Colors.white10,
                  borderRadius: BorderRadius.circular(4),
                  border: Border.all(color: Colors.white24),
                ),
                child: Text(
                  source!,
                  style: const TextStyle(
                    color: Colors.white70,
                    fontSize: 10,
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
