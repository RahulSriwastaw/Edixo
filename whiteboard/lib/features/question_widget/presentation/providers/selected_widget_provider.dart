// lib/features/question_widget/presentation/providers/selected_widget_provider.dart

import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'selected_widget_provider.g.dart';

/// Simple provider for selected widget id (null = nothing selected)
@riverpod
class SelectedWidgetNotifier extends _$SelectedWidgetNotifier {
  @override
  String? build() => null;

  void select(String id) => state = id;
  void deselect()         => state = null;
}
