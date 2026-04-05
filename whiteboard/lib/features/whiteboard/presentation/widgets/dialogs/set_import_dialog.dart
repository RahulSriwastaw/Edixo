// lib/features/whiteboard/presentation/widgets/dialogs/set_import_dialog.dart

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/constants/app_dimensions.dart';
import '../../../../../core/constants/app_text_styles.dart';
import '../../providers/set_import_provider.dart';

class SetImportDialog extends ConsumerStatefulWidget {
  const SetImportDialog({super.key});

  @override
  ConsumerState<SetImportDialog> createState() => _SetImportDialogState();
}

class _SetImportDialogState extends ConsumerState<SetImportDialog> {
  late final TextEditingController _setIdController;
  late final TextEditingController _passwordController;
  late final FocusNode _setIdFocus;
  late final FocusNode _passwordFocus;

  @override
  void initState() {
    super.initState();
    _setIdController = TextEditingController();
    _passwordController = TextEditingController();
    _setIdFocus = FocusNode();
    _passwordFocus = FocusNode();
  }

  @override
  void dispose() {
    _setIdController.dispose();
    _passwordController.dispose();
    _setIdFocus.dispose();
    _passwordFocus.dispose();
    super.dispose();
  }

  Future<void> _handleImport() async {
    final setId = _setIdController.text.trim();
    final password = _passwordController.text;

    if (setId.isEmpty || password.isEmpty) {
      _showError('Please enter set ID and password');
      return;
    }

    await ref.read(setImportNotifierProvider.notifier).importSet(
      setId: setId,
      password: password,
    );

    // Check if import was successful
    final importState = ref.read(setImportNotifierProvider);
    if (importState.state == SetImportState.success) {
      if (mounted) {
        context.pop(); // Close dialog
      }
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppColors.error,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final importState = ref.watch(setImportNotifierProvider);
    final isLoading = importState.state == SetImportState.validating ||
        importState.state == SetImportState.importing;

    return Dialog(
      backgroundColor: AppColors.bgPrimary,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppDimensions.borderRadiusL),
      ),
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Header
            Row(
              children: [
                const Icon(
                  Icons.folder_open,
                  color: AppColors.accentOrange,
                  size: 28,
                ),
                const SizedBox(width: AppDimensions.borderRadiusM),
                Text(
                  'Import Set',
                  style: AppTextStyles.heading2,
                ),
              ],
            ),
            const SizedBox(height: AppDimensions.borderRadiusL),

            // Set ID Field
            TextField(
              controller: _setIdController,
              focusNode: _setIdFocus,
              enabled: !isLoading,
              keyboardType: TextInputType.number,
              textInputAction: TextInputAction.next,
              onSubmitted: (_) => _passwordFocus.requestFocus(),
              decoration: InputDecoration(
                labelText: 'Set ID',
                prefixIcon: const Icon(Icons.numbers),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
                  borderSide: BorderSide(color: AppColors.textTertiary.withValues(alpha: 0.3)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
                  borderSide: const BorderSide(color: AppColors.accentOrange, width: 2),
                ),
              ),
            ),
            const SizedBox(height: AppDimensions.borderRadiusL),

            // Password Field
            TextField(
              controller: _passwordController,
              focusNode: _passwordFocus,
              enabled: !isLoading,
              obscureText: true,
              textInputAction: TextInputAction.done,
              onSubmitted: isLoading ? null : (_) => _handleImport(),
              decoration: InputDecoration(
                labelText: 'Password',
                prefixIcon: const Icon(Icons.lock),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
                  borderSide: BorderSide(color: AppColors.textTertiary.withValues(alpha: 0.3)),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
                  borderSide: const BorderSide(color: AppColors.accentOrange, width: 2),
                ),
              ),
            ),
            const SizedBox(height: AppDimensions.topBarHeight),

            // Error Message
            if (importState.state == SetImportState.failure && importState.error != null)
              Padding(
                padding: const EdgeInsets.only(bottom: AppDimensions.borderRadiusL),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppDimensions.borderRadiusL,
                    vertical: AppDimensions.borderRadiusM,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.error.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
                    border: Border.all(color: AppColors.error.withValues(alpha: 0.3)),
                  ),
                  child: Text(
                    importState.error!.message,
                    style: AppTextStyles.body.copyWith(color: AppColors.error),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),

            // Action Buttons
            Row(
              children: [
                // Cancel Button
                Expanded(
                  child: OutlinedButton(
                    onPressed: isLoading ? null : () => context.pop(),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: AppDimensions.borderRadiusM),
                      side: BorderSide(color: AppColors.textTertiary.withValues(alpha: 0.3)),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
                      ),
                    ),
                    child: Text(
                      'Cancel',
                      style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
                    ),
                  ),
                ),
                const SizedBox(width: AppDimensions.borderRadiusL),

                // Import Button
                Expanded(
                  child: ElevatedButton(
                    onPressed: isLoading ? null : _handleImport,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.accentOrange,
                      disabledBackgroundColor: AppColors.accentOrange.withValues(alpha: 0.5),
                      padding: const EdgeInsets.symmetric(vertical: AppDimensions.borderRadiusM),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
                      ),
                    ),
                    child: isLoading
                        ? const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                              valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                              strokeWidth: 2,
                            ),
                          )
                        : Text(
                            'Import',
                            style: AppTextStyles.body.copyWith(
                              color: AppColors.bgPrimary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
