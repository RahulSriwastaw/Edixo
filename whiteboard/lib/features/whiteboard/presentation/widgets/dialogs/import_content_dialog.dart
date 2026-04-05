// lib/features/whiteboard/presentation/widgets/dialogs/import_content_dialog.dart
//
// Unified import dialog with two tabs:
//   - Question Set: Set ID + Password via setImportNotifierProvider
//   - PDF Document: File picker via pdfImportNotifierProvider

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/constants/app_dimensions.dart';
import '../../../../../core/constants/app_text_styles.dart';
import '../../providers/set_import_provider.dart';
import '../../providers/pdf_import_provider.dart';

Future<void> showImportContentDialog(BuildContext context) {
  return showDialog<void>(
    context: context,
    barrierDismissible: false,
    builder: (_) => const ImportContentDialog(),
  );
}

class ImportContentDialog extends ConsumerStatefulWidget {
  const ImportContentDialog({super.key});

  @override
  ConsumerState<ImportContentDialog> createState() =>
      _ImportContentDialogState();
}

class _ImportContentDialogState extends ConsumerState<ImportContentDialog>
    with SingleTickerProviderStateMixin {
  late final TabController _tab;

  @override
  void initState() {
    super.initState();
    _tab = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tab.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: AppColors.bgPrimary,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppDimensions.borderRadiusL),
      ),
      child: SizedBox(
        width: 420,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 20, 8, 0),
              child: Row(
                children: [
                  const Icon(
                    Icons.download_rounded,
                    color: AppColors.accentOrange,
                    size: 26,
                  ),
                  const SizedBox(width: 10),
                  Text('Import Content', style: AppTextStyles.heading2),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.close, size: 20),
                    onPressed: () => context.pop(),
                    tooltip: 'Close',
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
              child: Container(
                decoration: BoxDecoration(
                  color: AppColors.bgCard,
                  borderRadius:
                      BorderRadius.circular(AppDimensions.borderRadiusM),
                ),
                child: TabBar(
                  controller: _tab,
                  indicatorSize: TabBarIndicatorSize.tab,
                  dividerColor: Colors.transparent,
                  indicator: BoxDecoration(
                    color: AppColors.accentOrange,
                    borderRadius:
                        BorderRadius.circular(AppDimensions.borderRadiusM),
                  ),
                  labelStyle: AppTextStyles.body
                      .copyWith(fontWeight: FontWeight.w600, fontSize: 13),
                  unselectedLabelStyle:
                      AppTextStyles.body.copyWith(fontSize: 13),
                  labelColor: AppColors.bgPrimary,
                  unselectedLabelColor: AppColors.textSecondary,
                  tabs: const [
                    Tab(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.quiz_outlined, size: 16),
                          SizedBox(width: 6),
                          Text('Question Set'),
                        ],
                      ),
                    ),
                    Tab(
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.picture_as_pdf_outlined, size: 16),
                          SizedBox(width: 6),
                          Text('PDF Document'),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const Divider(height: 1, color: Color(0x22FFFFFF)),
            SizedBox(
              height: 300,
              child: TabBarView(
                controller: _tab,
                children: const [
                  _SetImportTab(),
                  _PdfImportTab(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SetImportTab extends ConsumerStatefulWidget {
  const _SetImportTab();

  @override
  ConsumerState<_SetImportTab> createState() => _SetImportTabState();
}

class _SetImportTabState extends ConsumerState<_SetImportTab> {
  late final TextEditingController _setIdCtrl;
  late final TextEditingController _passwordCtrl;
  late final FocusNode _setIdFocus;
  late final FocusNode _passwordFocus;

  @override
  void initState() {
    super.initState();
    _setIdCtrl = TextEditingController();
    _passwordCtrl = TextEditingController();
    _setIdFocus = FocusNode();
    _passwordFocus = FocusNode();
  }

  @override
  void dispose() {
    _setIdCtrl.dispose();
    _passwordCtrl.dispose();
    _setIdFocus.dispose();
    _passwordFocus.dispose();
    super.dispose();
  }

  Future<void> _import() async {
    final setId = _setIdCtrl.text.trim();
    final password = _passwordCtrl.text;
    if (setId.isEmpty) return;

    await ref.read(setImportNotifierProvider.notifier).importSet(
          setId: setId,
          password: password.isEmpty ? 'public' : password,
        );

    final importState = ref.read(setImportNotifierProvider);
    if (importState.state == SetImportState.success && mounted) {
      context.pop();
    }
  }

  InputDecoration _inputDecoration(String label, IconData icon) {
    return InputDecoration(
      labelText: label,
      isDense: true,
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      prefixIcon: Icon(icon, size: 17),
      prefixIconConstraints: const BoxConstraints(minWidth: 36),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
        borderSide:
            BorderSide(color: AppColors.textTertiary.withValues(alpha: 0.3)),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
        borderSide: const BorderSide(color: AppColors.accentOrange, width: 2),
      ),
      filled: true,
      fillColor: AppColors.bgPrimary.withValues(alpha: 0.7),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(setImportNotifierProvider);
    final loading = state.state == SetImportState.validating ||
        state.state == SetImportState.importing;

    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            decoration: BoxDecoration(
              color: AppColors.bgCard.withValues(alpha: 0.65),
              borderRadius: BorderRadius.circular(AppDimensions.borderRadiusL),
              border: Border.all(
                color: AppColors.textTertiary.withValues(alpha: 0.18),
              ),
            ),
            padding: const EdgeInsets.fromLTRB(14, 14, 14, 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.quiz_outlined,
                      size: 16,
                      color: AppColors.accentOrange.withValues(alpha: 0.9),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'Question Set Import',
                      style: AppTextStyles.body.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  'Enter your set credentials to load questions instantly.',
                  style: AppTextStyles.caption,
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _setIdCtrl,
                  focusNode: _setIdFocus,
                  enabled: !loading,
                  keyboardType: TextInputType.number,
                  textInputAction: TextInputAction.next,
                  onSubmitted: (_) => _passwordFocus.requestFocus(),
                  decoration: _inputDecoration('Set ID', Icons.numbers),
                ),
                const SizedBox(height: 10),
                TextField(
                  controller: _passwordCtrl,
                  focusNode: _passwordFocus,
                  enabled: !loading,
                  obscureText: true,
                  textInputAction: TextInputAction.done,
                  onSubmitted: loading ? null : (_) => _import(),
                  decoration: _inputDecoration('Password', Icons.lock_outline),
                ),
              ],
            ),
          ),
          if (state.state == SetImportState.failure && state.error != null) ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
              decoration: BoxDecoration(
                color: AppColors.error.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
                border:
                    Border.all(color: AppColors.error.withValues(alpha: 0.4)),
              ),
              child: Text(
                state.error!.message,
                style: AppTextStyles.caption.copyWith(color: AppColors.error),
                textAlign: TextAlign.center,
              ),
            ),
          ],
          const Spacer(),
          Row(
            children: [
              TextButton(
                onPressed: loading ? null : () => context.pop(),
                style: TextButton.styleFrom(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
                  foregroundColor: AppColors.textSecondary,
                ),
                child: Text('Cancel', style: AppTextStyles.bodySmall),
              ),
              const Spacer(),
              SizedBox(
                width: 130,
                child: ElevatedButton(
                  onPressed: loading ? null : _import,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.accentOrange,
                    disabledBackgroundColor:
                        AppColors.accentOrange.withValues(alpha: 0.5),
                    elevation: 0,
                    padding: const EdgeInsets.symmetric(vertical: 11),
                    shape: RoundedRectangleBorder(
                      borderRadius:
                          BorderRadius.circular(AppDimensions.borderRadiusM),
                    ),
                  ),
                  child: loading
                      ? const SizedBox(
                          height: 18,
                          width: 18,
                          child: CircularProgressIndicator(
                            valueColor: AlwaysStoppedAnimation(Colors.white),
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
    );
  }
}

class _PdfImportTab extends ConsumerWidget {
  const _PdfImportTab();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final s = ref.watch(pdfImportNotifierProvider);

    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 28, 24, 24),
      child: Column(
        children: [
          Expanded(
            child: _PdfStatusBody(state: s),
          ),
          const SizedBox(height: 16),
          if (s.status == PdfImportStatus.idle ||
              s.status == PdfImportStatus.error)
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: () => context.pop(),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      side: BorderSide(
                        color: AppColors.textTertiary.withValues(alpha: 0.3),
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius:
                            BorderRadius.circular(AppDimensions.borderRadiusM),
                      ),
                    ),
                    child: Text(
                      'Cancel',
                      style: AppTextStyles.body
                          .copyWith(color: AppColors.textSecondary),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () =>
                        ref.read(pdfImportNotifierProvider.notifier).importPdf(),
                    icon: const Icon(Icons.upload_file, size: 18),
                    label: Text(
                      s.status == PdfImportStatus.error ? 'Try Again' : 'Select PDF',
                      style: AppTextStyles.body.copyWith(
                        color: AppColors.bgPrimary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.accentOrange,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      shape: RoundedRectangleBorder(
                        borderRadius:
                            BorderRadius.circular(AppDimensions.borderRadiusM),
                      ),
                    ),
                  ),
                ),
              ],
            )
          else if (s.status == PdfImportStatus.done)
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => context.pop(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.success,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius:
                        BorderRadius.circular(AppDimensions.borderRadiusM),
                  ),
                ),
                child: Text(
                  'Done',
                  style: AppTextStyles.body.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _PdfStatusBody extends StatelessWidget {
  final PdfImportState state;
  const _PdfStatusBody({required this.state});

  @override
  Widget build(BuildContext context) {
    return switch (state.status) {
      PdfImportStatus.idle => const _IllustrationPlaceholder(
          icon: Icons.picture_as_pdf_outlined,
          label: 'Select a PDF file to import as slides',
          color: AppColors.accentOrange,
        ),
      PdfImportStatus.picking => const _SpinnerMessage(
          message: 'Opening file picker...',
        ),
      PdfImportStatus.rendering => _RenderingProgress(state: state),
      PdfImportStatus.done => _IllustrationPlaceholder(
          icon: Icons.check_circle_outline,
          label:
              'Imported ${state.totalPages} page${state.totalPages == 1 ? '' : 's'} successfully!',
          color: AppColors.success,
        ),
      PdfImportStatus.error => _IllustrationPlaceholder(
          icon: Icons.error_outline,
          label: state.errorMessage ?? 'Import failed. Please try again.',
          color: AppColors.error,
        ),
    };
  }
}

class _IllustrationPlaceholder extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;

  const _IllustrationPlaceholder({
    required this.icon,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(icon, size: 52, color: color.withValues(alpha: 0.75)),
        const SizedBox(height: 12),
        Text(
          label,
          style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }
}

class _SpinnerMessage extends StatelessWidget {
  final String message;
  const _SpinnerMessage({required this.message});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const CircularProgressIndicator(
          valueColor: AlwaysStoppedAnimation(AppColors.accentOrange),
          strokeWidth: 3,
        ),
        const SizedBox(height: 16),
        Text(
          message,
          style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
        ),
      ],
    );
  }
}

class _RenderingProgress extends StatelessWidget {
  final PdfImportState state;
  const _RenderingProgress({required this.state});

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        const Icon(
          Icons.picture_as_pdf_outlined,
          size: 40,
          color: AppColors.accentOrange,
        ),
        const SizedBox(height: 12),
        Text(
          'Rendering page ${state.renderedPages} of ${state.totalPages}...',
          style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
        ),
        const SizedBox(height: 16),
        ClipRRect(
          borderRadius: BorderRadius.circular(4),
          child: LinearProgressIndicator(
            value: state.progress,
            minHeight: 8,
            backgroundColor: AppColors.bgCard,
            valueColor: const AlwaysStoppedAnimation(AppColors.accentOrange),
          ),
        ),
        const SizedBox(height: 6),
        Text(
          '${(state.progress * 100).toStringAsFixed(0)}%',
          style: AppTextStyles.caption.copyWith(color: AppColors.textTertiary),
        ),
      ],
    );
  }
}

