import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../../core/theme/app_theme.dart';
import '../data/repositories/question_repository.dart';
import '../../whiteboard/providers/canvas_provider.dart';

class SetImportDialog extends ConsumerStatefulWidget {
  const SetImportDialog({super.key});

  @override
  ConsumerState<SetImportDialog> createState() => _SetImportDialogState();
}

class _SetImportDialogState extends ConsumerState<SetImportDialog> {
  final _setIdController = TextEditingController();
  final _pwController = TextEditingController();
  bool _isLoading = false;
  String? _error;

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: const Color(0xFF1E1E30),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16.r)),
      child: Container(
        width: 400.w,
        padding: EdgeInsets.all(24.w),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Import Question Set',
              style: GoogleFonts.dmSans(
                color: Colors.white,
                fontSize: 20.sp,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 8.h),
            Text(
              'Enter the Set ID and Password provided by EduHub.',
              style: TextStyle(color: Colors.white60, fontSize: 13.sp),
            ),
            SizedBox(height: 24.h),
            
            _textField(
              controller: _setIdController,
              label: 'Set ID',
              hint: 'e.g., 505955',
              icon: Icons.numbers_rounded,
            ),
            SizedBox(height: 16.h),
            _textField(
              controller: _pwController,
              label: 'Password',
              hint: 'Enter set password',
              icon: Icons.lock_outline_rounded,
              isPassword: true,
            ),
            
            if (_error != null)
              Padding(
                padding: EdgeInsets.only(top: 16.h),
                child: Text(_error!, style: const TextStyle(color: Colors.redAccent)),
              ),
            
            SizedBox(height: 24.h),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: _isLoading ? null : () => Navigator.pop(context),
                  child: const Text('Cancel', style: TextStyle(color: Colors.white38)),
                ),
                SizedBox(width: 12.w),
                ElevatedButton(
                  onPressed: _isLoading ? null : _handleImport,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryOrange,
                    padding: EdgeInsets.symmetric(horizontal: 24.w, vertical: 12.h),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8.r)),
                  ),
                  child: _isLoading 
                    ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Text('Import Set'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _textField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    bool isPassword = false,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(color: Colors.white70, fontSize: 12.sp, fontWeight: FontWeight.bold)),
        SizedBox(height: 8.h),
        TextField(
          controller: controller,
          obscureText: isPassword,
          style: const TextStyle(color: Colors.white),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: Colors.white24),
            prefixIcon: Icon(icon, color: Colors.white38, size: 20),
            filled: true,
            fillColor: Colors.white.withOpacity(0.05),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8.r), borderSide: BorderSide.none),
            contentPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
          ),
        ),
      ],
    );
  }

  Future<void> _handleImport() async {
    if (_setIdController.text.isEmpty || _pwController.text.isEmpty) {
      setState(() => _error = 'Please fill all fields');
      return;
    }

    setState(() { _isLoading = true; _error = null; });

    try {
      final repo = ref.read(questionRepositoryProvider);
      final validateData = await repo.validateSet(_setIdController.text, _pwController.text);
      
      if (validateData['valid'] == true) {
        final questions = await repo.fetchSetQuestions(_setIdController.text);
        if (questions.isNotEmpty) {
           // Import to canvas
           ref.read(canvasStateProvider.notifier).importQuestionsAsSlides(questions);
           Navigator.pop(context);
        } else {
          setState(() => _error = 'Set has no questions');
        }
      } else {
        setState(() => _error = validateData['message'] ?? 'Invalid Set ID or Password');
      }
    } catch (e) {
      setState(() => _error = 'Connection failed. Please try again.');
    } finally {
      setState(() => _isLoading = false);
    }
  }
}
