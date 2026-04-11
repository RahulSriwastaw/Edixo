import 'package:flutter/material.dart';
import 'package:flutter_html/flutter_html.dart';
import 'package:flutter_math_fork/flutter_math.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../data/models/set_layout_models.dart';
import '../../../whiteboard/data/models/slide_model.dart';

class OptionsDisplayWidget extends StatefulWidget {
  final List<SlideOption> options;
  final SetSettingsModel settings;

  const OptionsDisplayWidget({
    super.key,
    required this.options,
    required this.settings,
  });

  @override
  State<OptionsDisplayWidget> createState() => _OptionsDisplayWidgetState();
}

class _OptionsDisplayWidgetState extends State<OptionsDisplayWidget> {
  @override
  Widget build(BuildContext context) {
    final showBg = widget.settings.showCardBackground;

    return Container(
      decoration: BoxDecoration(
        color: showBg ? Color(widget.settings.optionBg) : Colors.transparent,
        borderRadius: BorderRadius.circular(8), // Using default radius as SetSettingsModel lacks one
        border: isSelectedBorder()
            ? Border.all(color: Colors.orange, width: 2)
            : (showBg ? Border.all(color: Color(widget.settings.optionBorderColor), width: widget.settings.optionBorderWidth > 0 ? widget.settings.optionBorderWidth : 1) : null),
        boxShadow: (showBg && widget.settings.optionBg != 0x00000000)
            ? [const BoxShadow(color: Colors.black26, blurRadius: 4, offset: Offset(2, 2))]
            : [],
      ),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: ListView.separated(
          itemCount: widget.options.length,
          separatorBuilder: (context, index) => const SizedBox(height: 8),
          itemBuilder: (context, index) {
            final option = widget.options[index];

            return Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.05),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Option Label (A, B, C, D)
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.orange,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      option.label,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  
                  // Option Text
                  Expanded(
                    child: _buildOptionText(option.text),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  bool isSelectedBorder() {
    // Logic for selection border if needed
    return false;
  }

  Widget _buildOptionText(String text) {
    // 1. Check if text contains LaTeX
    if (text.contains(RegExp(r'\$.*?\$')) || text.contains(r'\(')) {
      return Math.tex(
        text.replaceAll(r'$', ''),
        textStyle: TextStyle(
          fontSize: widget.settings.optionFontSize,
          color: Color(widget.settings.optionColor),
        ),
      );
    }

    // 2. Use HTML rendering if tags are present
    if (text.contains('<')) {
      return Html(
        data: text,
        style: {
          "body": Style(
            margin: Margins.zero,
            padding: HtmlPaddings.zero,
            fontSize: FontSize(widget.settings.optionFontSize),
            color: Color(widget.settings.optionColor),
            fontFamily: GoogleFonts.notoSansDevanagari().fontFamily,
          ),
          "p": Style(
            margin: Margins.zero,
            padding: HtmlPaddings.zero,
          ),
        },
      );
    }

    // 3. Fallback to standard Text
    return Text(
      text,
      style: GoogleFonts.notoSansDevanagari(
        fontSize: widget.settings.optionFontSize,
        color: Color(widget.settings.optionColor),
      ),
    );
  }
}
