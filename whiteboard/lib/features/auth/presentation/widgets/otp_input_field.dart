import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'dart:math' as math;
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../core/theme/app_theme.dart';

class OTPInputField extends StatefulWidget {
  final int length;
  final bool obscureText;
  final bool isPassword;
  final Function(List<String>) onChanged;
  final bool hasError;
  final Widget? suffix;

  const OTPInputField({
    super.key,
    required this.length,
    this.obscureText = false,
    this.isPassword = false,
    required this.onChanged,
    this.hasError = false,
    this.suffix,
  });

  bool get _hideText => obscureText || isPassword;

  @override
  State<OTPInputField> createState() => _OTPInputFieldState();
}

class _OTPInputFieldState extends State<OTPInputField> {
  final List<TextEditingController> _controllers = [];
  final List<FocusNode> _focusNodes = [];
  final List<String> _values = [];

  @override
  void initState() {
    super.initState();
    for (int i = 0; i < widget.length; i++) {
      _controllers.add(TextEditingController());
      _focusNodes.add(FocusNode());
      _values.add('');
    }
    // Global hardware keyboard handler for Ctrl+V paste
    HardwareKeyboard.instance.addHandler(_onHardwareEvent);
  }

  bool _onHardwareEvent(KeyEvent event) {
    if (event is KeyDownEvent) {
      final isCtrl = HardwareKeyboard.instance.isControlPressed;
      final isMeta = HardwareKeyboard.instance.isMetaPressed;
      final isV = event.logicalKey == LogicalKeyboardKey.keyV;

      if ((isCtrl || isMeta) && isV) {
        final hasAnyFocus = _focusNodes.any((f) => f.hasFocus);
        if (hasAnyFocus) {
          _handlePaste();
          return true;
        }
      }
    }
    return false;
  }

  void _onChanged(int index, String value) {
    if (value.isNotEmpty) {
      _values[index] = value[value.length - 1];
      _controllers[index].text = _values[index];
      _controllers[index].selection = TextSelection.fromPosition(
        TextPosition(offset: _controllers[index].text.length),
      );
      if (index < widget.length - 1) {
        _focusNodes[index + 1].requestFocus();
      } else {
        _focusNodes[index].unfocus();
      }
    } else {
      _values[index] = '';
    }
    widget.onChanged(List.from(_values));
  }

  Future<void> _handlePaste() async {
    final data = await Clipboard.getData(Clipboard.kTextPlain);
    final text = data?.text?.replaceAll(RegExp(r'[^0-9]'), '') ?? '';
    if (text.isEmpty) return;

    int startIdx = 0;
    for (int i = 0; i < widget.length; i++) {
      if (_focusNodes[i].hasFocus) {
        startIdx = i;
        break;
      }
    }

    final toProcess = text.substring(0, math.min(text.length, widget.length - startIdx));
    for (int i = 0; i < toProcess.length; i++) {
      final idx = startIdx + i;
      _controllers[idx].text = toProcess[i];
      _values[idx] = toProcess[i];
    }
    widget.onChanged(List.from(_values));

    final nextFocusIdx = startIdx + toProcess.length;
    if (nextFocusIdx < widget.length) {
      _focusNodes[nextFocusIdx].requestFocus();
    } else {
      _focusNodes[widget.length - 1].unfocus();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        ...List.generate(widget.length, (index) {
          return Container(
            width: 48.w,
            height: 56.h,
            margin: EdgeInsets.only(right: index < widget.length - 1 ? 8.w : 0),
            child: RawKeyboardListener(
              focusNode: FocusNode(skipTraversal: true),
              onKey: (event) {
                if (event is RawKeyDownEvent &&
                    event.logicalKey == LogicalKeyboardKey.backspace) {
                  if (_controllers[index].text.isEmpty && index > 0) {
                    _focusNodes[index - 1].requestFocus();
                    _controllers[index - 1].clear();
                    _values[index - 1] = '';
                    widget.onChanged(List.from(_values));
                  }
                }
              },
              child: TextField(
                controller: _controllers[index],
                focusNode: _focusNodes[index],
                textAlign: TextAlign.center,
                keyboardType: TextInputType.number,
                inputFormatters: const [],
                obscureText: widget._hideText,
                style: TextStyle(
                  fontSize: 24.sp,
                  fontWeight: FontWeight.bold,
                  color: widget.hasError ? AppTheme.errorRed : AppTheme.primaryDark,
                ),
                decoration: InputDecoration(
                  filled: true,
                  fillColor: widget.hasError
                      ? AppTheme.errorRed.withOpacity(0.1)
                      : Colors.grey.shade100,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12.r),
                    borderSide: BorderSide.none,
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12.r),
                    borderSide: BorderSide(
                      color: widget.hasError ? AppTheme.errorRed : AppTheme.primaryOrange,
                      width: 2,
                    ),
                  ),
                  contentPadding: EdgeInsets.zero,
                ),
                onChanged: (v) {
                  if (v.isEmpty) {
                    _onChanged(index, '');
                    return;
                  }

                  final digits = v.replaceAll(RegExp(r'[^0-9]'), '');
                  if (digits.isEmpty) {
                    _controllers[index].clear();
                    return;
                  }

                  if (digits.length > 1) {
                    // Multi-digit: distribute across fields (handles paste via onChanged too)
                    final slots = widget.length - index;
                    final toProcess = digits.substring(0, math.min(digits.length, slots));
                    for (int i = 0; i < toProcess.length; i++) {
                      final idx = index + i;
                      _controllers[idx].text = toProcess[i];
                      _values[idx] = toProcess[i];
                      _controllers[idx].selection = TextSelection.fromPosition(
                        TextPosition(offset: 1),
                      );
                    }
                    widget.onChanged(List.from(_values));
                    final nextIdx = index + toProcess.length;
                    if (nextIdx < widget.length) {
                      _focusNodes[nextIdx].requestFocus();
                    } else {
                      _focusNodes[widget.length - 1].unfocus();
                    }
                  } else {
                    _onChanged(index, digits);
                  }
                },
              ),
            ),
          );
        }),
        if (widget.suffix != null) ...[
          SizedBox(width: 12.w),
          widget.suffix!,
        ],
      ],
    );
  }

  @override
  void dispose() {
    HardwareKeyboard.instance.removeHandler(_onHardwareEvent);
    for (var c in _controllers) {
      c.dispose();
    }
    for (var f in _focusNodes) {
      f.dispose();
    }
    super.dispose();
  }
}
