// lib/features/whiteboard/presentation/providers/set_import_provider.dart

import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../../../core/error/failure.dart';
import '../../../../core/providers/auth_provider.dart';
import '../../data/datasources/set_remote_ds.dart';
import '../../data/models/set_metadata_model.dart';
import '../../data/models/slide_model.dart';
import 'slide_provider.dart';
import 'session_provider.dart';
import '../../../question_widget/presentation/providers/question_widget_provider.dart';
import 'app_mode_provider.dart';

part 'set_import_provider.g.dart';

enum SetImportState { initial, validating, importing, success, failure }

class SetImportNotifierState {
  final SetImportState state;
  final Failure? error;
  final String? debugMessage;
  final SetMetadataModel? metadata;
  final List<SetSlideModel>? slides;

  const SetImportNotifierState({
    this.state = SetImportState.initial,
    this.error,
    this.debugMessage,
    this.metadata,
    this.slides,
  });

  SetImportNotifierState copyWith({
    SetImportState? state,
    Failure? error,
    String? debugMessage,
    SetMetadataModel? metadata,
    List<SetSlideModel>? slides,
  }) => SetImportNotifierState(
    state: state ?? this.state,
    error: error,
    debugMessage: debugMessage ?? this.debugMessage,
    metadata: metadata ?? this.metadata,
    slides: slides ?? this.slides,
  );
}

@riverpod
class SetImportNotifier extends _$SetImportNotifier {
  @override
  SetImportNotifierState build() => const SetImportNotifierState();

  /// Import a set by ID and password
  /// Full flow: validate → fetch questions → fetch metadata → start session → load slides
  Future<void> importSet({
    required String setId,
    required String password,
  }) async {
    // Step 1: Validate set
    state = state.copyWith(state: SetImportState.validating);

    final validateResult = await ref.read(setRemoteDsProvider).validateSet(
      setId: setId,
      password: password,
    );

    await validateResult.fold(
      (_) async {
        // Validation passed — fetch questions
        state = state.copyWith(state: SetImportState.importing);

        final questionsResult = await ref.read(setRemoteDsProvider).fetchQuestions(setId);

        await questionsResult.fold(
          (questions) async {
            // Guard: empty question set (extra safety)
            if (questions.isEmpty) {
              state = state.copyWith(
                state: SetImportState.failure,
                error: const NotFoundFailure(
                  'This set has no questions. Please add questions from the Super Admin panel.',
                ),
                debugMessage: 'Set returned 0 questions',
              );
              return;
            }

            // Step 3: Fetch metadata
            final metadataResult = await ref.read(setRemoteDsProvider).fetchMetadata(setId);

            await metadataResult.fold(
              (metadata) async {
                // Step 4: Start session
                final teacher = ref.read(authNotifierProvider);
                if (teacher == null) {
                  state = state.copyWith(
                    state: SetImportState.failure,
                    error: const UnauthorizedFailure('Not authenticated'),
                    debugMessage: 'Teacher not authenticated',
                  );
                  return;
                }

                final sessionResult = await ref.read(setRemoteDsProvider).startSession(
                  setId: setId,
                  teacherId: teacher.id,
                );

                await sessionResult.fold(
                  (sessionId) async {
                    // Step 5: Load slides into providers
                    ref.read(slideNotifierProvider.notifier).loadSlides(questions, metadata);
                    ref.read(questionWidgetNotifierProvider.notifier).clear();
                    ref.read(appModeNotifierProvider.notifier).enterSlideMode();
                    ref.read(sessionNotifierProvider.notifier).startSession(sessionId);

                    state = state.copyWith(
                      state: SetImportState.success,
                      metadata: metadata,
                      slides: questions,
                    );
                  },
                  (failure) {
                    state = state.copyWith(
                      state: SetImportState.failure,
                      error: failure,
                      debugMessage: failure.message,
                    );
                  },
                );
              },
              (failure) {
                state = state.copyWith(
                  state: SetImportState.failure,
                  error: failure,
                  debugMessage: failure.message,
                );
              },
            );
          },
          (failure) {
            state = state.copyWith(
              state: SetImportState.failure,
              error: failure,
              debugMessage: failure.message,
            );
          },
        );
      },
      (failure) {
        // validate-set returned valid:false — backend's reason message is shown
        state = state.copyWith(
          state: SetImportState.failure,
          error: failure,
          debugMessage: failure.message,
        );
      },
    );
  }

  void reset() => state = const SetImportNotifierState();
}
