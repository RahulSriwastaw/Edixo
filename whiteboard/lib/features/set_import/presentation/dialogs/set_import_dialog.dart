
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../providers/set_import_provider.dart';

class SetImportDialog extends ConsumerStatefulWidget {
  const SetImportDialog({super.key});

  @override
  ConsumerState<SetImportDialog> createState() => _SetImportDialogState();
}

class _SetImportDialogState extends ConsumerState<SetImportDialog> {
  final _setIdController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void dispose() {
    _setIdController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: AppColors.bgCard,
      title: const Text('Import Question Set'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(
            controller: _setIdController,
            decoration: InputDecoration(
              labelText: 'Set ID',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
              ),
            ),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _passwordController,
            obscureText: true,
            decoration: InputDecoration(
              labelText: 'Password (optional)',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
              ),
            ),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: () {
            final setId = _setIdController.text.trim();
            final password = _passwordController.text.trim();
            if (setId.isNotEmpty) {
              ref.read(setImportNotifierProvider.notifier).importSet(
                setId: setId,
                password: password.isEmpty ? 'public' : password,
              );
              Navigator.of(context).pop();
            }
          },
          child: const Text('Import'),
        ),
      ],
    );
  }
}
