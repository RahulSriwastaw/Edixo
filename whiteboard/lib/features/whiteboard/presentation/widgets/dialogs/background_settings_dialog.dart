import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/constants/app_dimensions.dart';
import '../../../../../core/constants/app_text_styles.dart';
import '../../providers/background_settings_provider.dart';

Future<void> showBackgroundSettingsDialog(BuildContext context) {
  return showDialog<void>(
    context: context,
    builder: (_) => const BackgroundSettingsDialog(),
  );
}

class BackgroundSettingsDialog extends ConsumerStatefulWidget {
  const BackgroundSettingsDialog({super.key});

  @override
  ConsumerState<BackgroundSettingsDialog> createState() =>
      _BackgroundSettingsDialogState();
}

class _BackgroundSettingsDialogState
    extends ConsumerState<BackgroundSettingsDialog> {
  late TextEditingController _urlController;

  @override
  void initState() {
    super.initState();
    final settings = ref.read(backgroundSettingsNotifierProvider);
    _urlController = TextEditingController(
      text: settings.backgroundImageUrl ?? '',
    );
  }

  @override
  void dispose() {
    _urlController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final settings = ref.watch(backgroundSettingsNotifierProvider);

    return Dialog(
      backgroundColor: AppColors.bgPrimary,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppDimensions.borderRadiusL),
      ),
      child: SizedBox(
        width: 450,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 20, 8, 0),
              child: Row(
                children: [
                  Icon(
                    Icons.image_search_outlined,
                    color: AppColors.accentOrange,
                    size: 26,
                  ),
                  const SizedBox(width: 10),
                  Text('Background Settings', style: AppTextStyles.heading2),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.close, size: 20),
                    onPressed: () => Navigator.of(context).pop(),
                    tooltip: 'Close',
                  ),
                ],
              ),
            ),

            const Divider(height: 1, color: Color(0x22FFFFFF)),

            // Content
            Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  // Enable Custom Background Toggle
                  Container(
                    padding: const EdgeInsets.all(AppDimensions.borderRadiusL),
                    decoration: BoxDecoration(
                      color: AppColors.bgCard,
                      borderRadius:
                          BorderRadius.circular(AppDimensions.borderRadiusM),
                      border: Border.all(
                        color: AppColors.textTertiary.withValues(alpha: 0.2),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          settings.enableCustomBackground
                              ? Icons.check_circle
                              : Icons.radio_button_unchecked,
                          color: settings.enableCustomBackground
                              ? AppColors.accentOrange
                              : AppColors.textTertiary,
                          size: 24,
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Enable Custom Background',
                                style: AppTextStyles.body.copyWith(
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Load a background image for the whiteboard',
                                style: AppTextStyles.caption.copyWith(
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Transform.scale(
                          scale: 1.2,
                          child: Checkbox(
                            value: settings.enableCustomBackground,
                            onChanged: (_) => ref
                                .read(backgroundSettingsNotifierProvider
                                    .notifier)
                                .toggleCustomBackground(),
                          fillColor: WidgetStateColor.resolveWith(
                              (_) => AppColors.accentOrange,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // Image URL Input
                  if (settings.enableCustomBackground) ...[
                    Text(
                      'Image URL',
                      style: AppTextStyles.body.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _urlController,
                      decoration: InputDecoration(
                        hintText:
                            'https://example.com/background.jpg',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(
                            AppDimensions.borderRadiusM,
                          ),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(
                            AppDimensions.borderRadiusM,
                          ),
                          borderSide: BorderSide(
                            color: AppColors.textTertiary.withValues(
                              alpha: 0.3,
                            ),
                          ),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(
                            AppDimensions.borderRadiusM,
                          ),
                          borderSide: const BorderSide(
                            color: AppColors.accentOrange,
                            width: 2,
                          ),
                        ),
                        filled: true,
                        fillColor:
                            AppColors.bgCard.withValues(alpha: 0.7),
                        suffixIcon: _urlController.text.isNotEmpty
                            ? IconButton(
                                icon:
                                    const Icon(Icons.clear, size: 18),
                                onPressed: () {
                                  _urlController.clear();
                                  setState(() {});
                                },
                              )
                            : null,
                      ),
                      onChanged: (_) => setState(() {}),
                    ),

                    const SizedBox(height: 16),

                    // Background Opacity
                    Text(
                      'Background Opacity',
                      style: AppTextStyles.body.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        Icon(
                          Icons.visibility_off,
                          color: AppColors.textTertiary,
                          size: 18,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Slider(
                            value: settings.backgroundOpacity,
                            min: 0.0,
                            max: 1.0,
                            divisions: 10,
                            label:
                                '${(settings.backgroundOpacity * 100).toStringAsFixed(0)}%',
                            onChanged: (value) => ref
                                .read(backgroundSettingsNotifierProvider
                                    .notifier)
                                .setBackgroundOpacity(value),
                            activeColor: AppColors.accentOrange,
                            inactiveColor: AppColors.textTertiary
                                .withValues(alpha: 0.3),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Icon(
                          Icons.visibility,
                          color: AppColors.textSecondary,
                          size: 18,
                        ),
                      ],
                    ),

                    const SizedBox(height: 16),

                    // Stretch Background
                    Container(
                      padding: const EdgeInsets.all(
                        AppDimensions.borderRadiusM,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.bgCard,
                        borderRadius:
                            BorderRadius.circular(AppDimensions.borderRadiusM),
                        border: Border.all(
                          color: AppColors.textTertiary.withValues(
                            alpha: 0.2,
                          ),
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            settings.stretchBackground
                                ? Icons.check_circle
                                : Icons.radio_button_unchecked,
                            color: settings.stretchBackground
                                ? AppColors.accentOrange
                                : AppColors.textTertiary,
                            size: 20,
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment:
                                  CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Stretch to Fill',
                                  style: AppTextStyles.body.copyWith(
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  'Stretch image to cover entire canvas',
                                  style: AppTextStyles.caption.copyWith(
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Transform.scale(
                            scale: 1.2,
                            child: Checkbox(
                              value: settings.stretchBackground,
                              onChanged: (value) => ref
                                  .read(backgroundSettingsNotifierProvider
                                      .notifier)
                                  .setStretchBackground(value ?? false),
                            fillColor: WidgetStateColor.resolveWith(
                                (_) => AppColors.accentOrange,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  const SizedBox(height: 24),

                  // Action Buttons
                  Row(
                    children: [
                      // Clear Button
                      if (settings.backgroundImageUrl != null)
                        OutlinedButton.icon(
                          onPressed: () => ref
                              .read(backgroundSettingsNotifierProvider
                                  .notifier)
                              .clearBackground(),
                          icon: const Icon(Icons.delete_outline, size: 16),
                          label: const Text('Clear'),
                        ),
                      const Spacer(),
                      TextButton(
                        onPressed: () =>
                            Navigator.of(context).pop(),
                        child: const Text('Cancel'),
                      ),
                      const SizedBox(width: 12),
                      ElevatedButton.icon(
                        onPressed: _urlController.text
                                .isNotEmpty
                            ? () {
                                ref
                                    .read(backgroundSettingsNotifierProvider
                                        .notifier)
                                    .setCustomBackground(
                                      _urlController.text,
                                    );
                                Navigator.of(context).pop();
                              }
                            : null,
                        icon: const Icon(Icons.save, size: 16),
                        label: const Text('Apply'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.accentOrange,
                          disabledBackgroundColor: AppColors.accentOrange
                              .withValues(alpha: 0.5),
                          foregroundColor: AppColors.bgPrimary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
