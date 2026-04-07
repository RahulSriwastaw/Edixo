
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:hive/hive.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../data/models/set_layout_models.dart';

import '../../../whiteboard/presentation/providers/slide_provider.dart';


part 'set_layout_notifier.g.dart';

class SetLayoutState {
  final String setId;
  final Map<int, QuestionLayout> questionLayouts;
  final Map<int, OptionsLayout> optionsLayouts;
  final SetSettingsModel settings;

  const SetLayoutState({
    required this.setId,
    required this.questionLayouts,
    required this.optionsLayouts,
    required this.settings,
  });

  SetLayoutState copyWith({
    String? setId,
    Map<int, QuestionLayout>? questionLayouts,
    Map<int, OptionsLayout>? optionsLayouts,
    SetSettingsModel? settings,
  }) => SetLayoutState(
    setId: setId ?? this.setId,
    questionLayouts: questionLayouts ?? this.questionLayouts,
    optionsLayouts: optionsLayouts ?? this.optionsLayouts,
    settings: settings ?? this.settings,
  );
}

@riverpod
class SetLayoutNotifier extends _$SetLayoutNotifier {
  Timer? _debounceTimer;
  static const String _boxName = 'set_widget_layouts';

  @override
  SetLayoutState build() {
    final slideState = ref.watch(slideNotifierProvider);
    final setId = slideState.setMetadata?.setId ?? 'default';
    
    // Initial state
    return SetLayoutState(
      setId: setId,
      questionLayouts: {},
      optionsLayouts: {},
      settings: SetSettingsModel.defaults,
    );
  }

  Future<void> initSet(String setId) async {
    final box = await Hive.openBox(_boxName);
    
    final settings = box.get('${setId}_settings') as SetSettingsModel? ?? SetSettingsModel.defaults;
    
    // We don't load all layouts at once to save memory, 
    // or we can load them as needed. For now, let's just update the setId.
    state = state.copyWith(setId: setId, settings: settings);
  }

  Future<void> loadLayoutsForQuestion(int qNum) async {
    final box = await Hive.openBox(_boxName);
    final setId = state.setId;

    final qLayout = box.get('${setId}_q${qNum}_question') as QuestionLayout? ?? 
        QuestionLayout(x: 50, y: 100, width: 800, height: 600);
    
    final oLayout = box.get('${setId}_q${qNum}_options') as OptionsLayout? ?? 
        OptionsLayout(x: 900, y: 100, width: 400, height: 600);

    state = state.copyWith(
      questionLayouts: {...state.questionLayouts, qNum: qLayout},
      optionsLayouts: {...state.optionsLayouts, qNum: oLayout},
    );
  }

  void updateQuestionLayout(int qNum, QuestionLayout layout) {
    state = state.copyWith(
      questionLayouts: {...state.questionLayouts, qNum: layout},
    );
    _debounceSave(qNum);
  }

  void updateOptionsLayout(int qNum, OptionsLayout layout) {
    state = state.copyWith(
      optionsLayouts: {...state.optionsLayouts, qNum: layout},
    );
    _debounceSave(qNum);
  }

  void updateSettings(SetSettingsModel settings) {
    state = state.copyWith(settings: settings);
    _saveSettings();
  }

  void resetLayout(int qNum) {
    final qLayout = QuestionLayout(x: 50, y: 100, width: 800, height: 600);
    final oLayout = OptionsLayout(x: 900, y: 100, width: 400, height: 600);
    
    state = state.copyWith(
      questionLayouts: {...state.questionLayouts, qNum: qLayout},
      optionsLayouts: {...state.optionsLayouts, qNum: oLayout},
    );
    _saveLayouts(qNum, qLayout, oLayout);
  }

  void applySettingsToAll() {
    _saveSettings();
    // In a real app, you might want to show a toast that styles were applied globally.
  }

  void _debounceSave(int qNum) {
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 500), () {
      final qLayout = state.questionLayouts[qNum];
      final oLayout = state.optionsLayouts[qNum];
      if (qLayout != null && oLayout != null) {
        _saveLayouts(qNum, qLayout, oLayout);
      }
    });
  }

  Future<void> _saveLayouts(int qNum, QuestionLayout q, OptionsLayout o) async {
    final box = await Hive.openBox(_boxName);
    await box.put('${state.setId}_q${qNum}_question', q);
    await box.put('${state.setId}_q${qNum}_options', o);
  }

  Future<void> _saveSettings() async {
    final box = await Hive.openBox(_boxName);
    await box.put('${state.setId}_settings', state.settings);
  }
}
