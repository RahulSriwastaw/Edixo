
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:eduhub_whiteboard/core/constants/app_colors.dart';
import 'package:eduhub_whiteboard/core/constants/app_dimensions.dart';

class SetImportDialog extends ConsumerWidget {
  const SetImportDialog({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return AlertDialog(
      backgroundColor: AppColors.bgCard,
      title: const Text('Import Question Set'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(
            decoration: InputDecoration(
              labelText: 'Set ID',
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
              ),
            ),
          ),
          const SizedBox(height: AppDimensions.borderRadiusL),
          TextField(
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
            // TODO: Get Set ID and password from text fields
            ref.read(setImportProvider).import('some-set-id');
            Navigator.of(context).pop();
          },
          child: const Text('Import'),
        ),
      ],
    );
  }
}
