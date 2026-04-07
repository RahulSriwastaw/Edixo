import 'package:flutter/material.dart';
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
    if (!widget.settings.showOptions) return const SizedBox.shrink();

    return Container(
      decoration: BoxDecoration(
        color: Color(widget.settings.optionBg),
        borderRadius: BorderRadius.circular(12),
        border: widget.settings.optionBorderWidth > 0
            ? Border.all(
                color: Color(widget.settings.optionBorderColor),
                width: widget.settings.optionBorderWidth,
              )
            : Border.all(color: Colors.white12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: FittedBox(
          fit: BoxFit.contain,
          alignment: Alignment.topLeft,
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 800),
            child: ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: widget.options.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
        itemBuilder: (context, index) {
          final option = widget.options[index];

          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(
                color: Colors.white24,
                width: 1.0,
              ),
            ),
            child: Row(
              children: [
                // Option Label (A, B, C, D)
                Container(
                  width: 32,
                  height: 32,
                  decoration: const BoxDecoration(
                    color: Colors.orange,
                    shape: BoxShape.circle,
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    option.label,
                    style: const TextStyle(
                      color: Colors.black,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                
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
        ),
      ),
    );
  }

  Widget _buildOptionText(String text) {
    // Check if text contains LaTeX
    if (text.contains(RegExp(r'\$.*?\$')) || text.contains(r'\(')) {
      return Math.tex(
        text.replaceAll(r'$', ''),
        textStyle: TextStyle(
          fontSize: widget.settings.optionFontSize,
          color: Color(widget.settings.optionColor),
        ),
      );
    }

    return Text(
      text,
      style: GoogleFonts.notoSansDevanagari(
        fontSize: widget.settings.optionFontSize,
        color: Color(widget.settings.optionColor),
      ),
    );
  }
}
