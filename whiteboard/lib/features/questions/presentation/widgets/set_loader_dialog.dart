import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../../core/theme/app_theme.dart';
import '../../providers/question_provider.dart';
import '../../../auth/presentation/widgets/otp_input_field.dart';
import '../../../whiteboard/providers/canvas_provider.dart';

class SetLoaderDialog extends ConsumerStatefulWidget {
  const SetLoaderDialog({super.key});

  @override
  ConsumerState<SetLoaderDialog> createState() => _SetLoaderDialogState();
}

class _SetLoaderDialogState extends ConsumerState<SetLoaderDialog> {
  String _contentType = 'set';
  List<String> _idDigits = List.filled(6, '');
  List<String> _pwDigits = List.filled(6, '');
  bool _isLoading = false;
  String? _error;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20.r)),
      ),
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom + 24.h,
        left: 24.w,
        right: 24.w,
        top: 16.h,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)),
            ),
          ),
          SizedBox(height: 20.h),
          Row(
            children: [
              Icon(Icons.inventory_2_outlined, color: AppTheme.primaryOrange),
              SizedBox(width: 10.w),
              Text('Load Questions', style: TextStyle(fontSize: 20.sp, fontWeight: FontWeight.bold)),
            ],
          ),
          SizedBox(height: 20.h),

          // Type toggle
          Row(
            children: [
              _typeTab('📦 Set', 'set'),
              SizedBox(width: 12.w),
              _typeTab('📋 MockTest', 'mocktest'),
            ],
          ),
          SizedBox(height: 20.h),

          // Set ID
          Text('${_contentType == 'set' ? 'Set' : 'MockTest'} ID (6 digits):',
              style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13.sp)),
          SizedBox(height: 8.h),
          OTPInputField(
            length: 6,
            onChanged: (vals) => setState(() => _idDigits = vals),
            isPassword: false,
          ),
          SizedBox(height: 16.h),

          // Password
          Text('Password (6 digits):', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13.sp)),
          SizedBox(height: 8.h),
          OTPInputField(
            length: 6,
            onChanged: (vals) => setState(() => _pwDigits = vals),
            isPassword: true,
          ),
          SizedBox(height: 12.h),

          if (_error != null) ...[
            Container(
              padding: EdgeInsets.all(10.w),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                borderRadius: BorderRadius.circular(8.r),
                border: Border.all(color: Colors.red.shade200),
              ),
              child: Row(
                children: [
                  const Icon(Icons.error_outline, color: Colors.red, size: 16),
                  SizedBox(width: 6.w),
                  Expanded(child: Text(_error!, style: const TextStyle(color: Colors.red, fontSize: 12))),
                ],
              ),
            ),
            SizedBox(height: 8.h),
          ],

          SizedBox(height: 16.h),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: (_isLoading || _idDigits.join().length < 6 || _pwDigits.join().length < 6) 
                  ? null 
                  : _fetchQuestions,
              icon: _isLoading
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Icon(Icons.download_rounded),
              label: Text(_isLoading ? 'Fetching...' : 'Fetch Questions →'),
              style: ElevatedButton.styleFrom(
                minimumSize: Size(0, 50.h),
                backgroundColor: AppTheme.primaryOrange,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _typeTab(String label, String value) {
    final isActive = _contentType == value;
    return GestureDetector(
      onTap: () => setState(() { _contentType = value; _error = null; }),
      child: Container(
        padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 10.h),
        decoration: BoxDecoration(
          color: isActive ? AppTheme.primaryOrange.withOpacity(0.1) : Colors.grey.shade100,
          borderRadius: BorderRadius.circular(8.r),
          border: Border.all(
            color: isActive ? AppTheme.primaryOrange : Colors.grey.shade300,
            width: isActive ? 2 : 1,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontWeight: isActive ? FontWeight.bold : FontWeight.normal,
            color: isActive ? AppTheme.primaryOrange : Colors.grey.shade700,
          ),
        ),
      ),
    );
  }

  Future<void> _fetchQuestions() async {
    final id = _idDigits.join().trim();
    final pw = _pwDigits.join().trim();

    if (id.length < 6) {
      setState(() => _error = 'Please enter the complete 6-digit ID');
      return;
    }
    if (pw.length < 6) {
      setState(() => _error = 'Please enter the complete 6-digit Password');
      return;
    }

    setState(() { _isLoading = true; _error = null; });

    final success = await ref.read(questionPanelProvider.notifier).loadSet(
      id: id,
      password: pw,
      type: _contentType,
    );

    if (!mounted) return;
    setState(() => _isLoading = false);

    if (success) {
      final questionState = ref.read(questionPanelProvider).value;
      if (questionState != null && questionState.questions.isNotEmpty) {
        ref.read(canvasStateProvider.notifier).setSetId(id);
        final firstQuestion = questionState.questions.first;
        // Use microtask to ensure state is stable before canvas injection
        Future.microtask(() {
          ref.read(canvasStateProvider.notifier).addQuestion(firstQuestion);
        });
      }
      if (mounted) Navigator.pop(context);
      Future.delayed(const Duration(milliseconds: 100), () {
        // Show snackbar after dialog is dismissed so Scaffold context is valid
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Questions loaded! First question added to canvas.'),
            backgroundColor: Color(0xFF10B981),
            behavior: SnackBarBehavior.floating,
            duration: Duration(seconds: 3),
          ),
        );
      });
    } else {
      setState(() => _error = 'Invalid ID or Password. Please try again.');
    }
  }
}
