
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:hive/hive.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../data/models/set_layout_models.dart';

import '../../../whiteboard/presentation/providers/slide_provider.dart';
import '../../../../core/network/dio_client.dart';
import '../../../../core/constants/api_constants.dart';


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
    final setId = slideState.importedSets.isNotEmpty 
        ? slideState.importedSets.first.setId 
        : 'default';
    
    // Initial state
    return SetLayoutState(
      setId: setId,
      questionLayouts: {},
      optionsLayouts: {},
      settings: SetSettingsModel.defaults,
    );
  }

  Future<void> initSet(String setId, {Map<String, dynamic>? visualSettings}) async {
    // If set is already active and we don't have new settings from API, skip
    if (state.setId == setId && visualSettings == null) return;

    final box = await Hive.openBox(_boxName);
    
    SetSettingsModel settings = SetSettingsModel.defaults;
    
    // If visual settings are provided from API, parse and apply them
    if (visualSettings != null) {
      try {
        settings = _parseVisualSettings(visualSettings);
        // Save to Hive for offline use
        await box.put('${setId}_settings', settings);
      } catch (e) {
        print('Failed to parse visual settings: $e');
      }
    } else {
      // Load from Hive
      final savedSettings = box.get('${setId}_settings') as SetSettingsModel? ?? SetSettingsModel.defaults;
      settings = savedSettings;
    }
    
    // Update state
    state = state.copyWith(setId: setId, settings: settings);
  }

  SetSettingsModel _parseVisualSettings(Map<String, dynamic> v) {
    return SetSettingsModel(
      questionColor: _ensureAlpha(v['questionColor'] ?? 0xFFFFFFFF),
      questionBg: _ensureAlpha(v['questionBg'] ?? 0xFF262626),
      optionColor: _ensureAlpha(v['optionColor'] ?? 0xFFFFFF00),
      optionBg: _ensureAlpha(v['optionBg'] ?? 0x00000000),
      screenBg: _ensureAlpha(v['screenBg'] ?? 0xFF0D0D0D),
      questionFontSize: double.tryParse(v['questionFontSize']?.toString() ?? '24') ?? 24,
      optionFontSize: double.tryParse(v['optionFontSize']?.toString() ?? '20') ?? 20,
      questionBorderColor: _ensureAlpha(v['questionBorderColor'] ?? 0x00000000),
      questionBorderWidth: double.tryParse(v['questionBorderWidth']?.toString() ?? '0') ?? 0,
      optionBorderColor: _ensureAlpha(v['optionBorderColor'] ?? 0x00000000),
      optionBorderWidth: double.tryParse(v['optionBorderWidth']?.toString() ?? '0') ?? 0,
      backgroundPreset: v['backgroundPreset'],
      showCardBackground: v['showCardBackground'] ?? true,
      showSourceBadge: v['showSourceBadge'] ?? true,
      showOptions: v['showOptions'] ?? true,
    );
  }

  /// Ensures that a color value has a valid alpha channel (not transparent by accident)
  int _ensureAlpha(dynamic value) {
    if (value == null) return 0xFFFFFFFF;
    int color = int.tryParse(value.toString()) ?? 0xFFFFFFFF;
    
    // If color is less than 0xFFFFFF, it's likely a 24-bit RGB value without Alpha
    // We add 0xFF000000 to make it opaque.
    if (color > 0 && color <= 0xFFFFFF) {
      return 0xFF000000 | color;
    }
    return color;
  }

  int _hexToArgb(String hexColor) {
    if (hexColor.isEmpty) return 0xFFFFFFFF;
    final hex = hexColor.replaceAll('#', '');
    switch (hex.length) {
      case 6: // RGB
        return 0xFF000000 + int.parse(hex, radix: 16);
      case 8: // ARGB
        return int.parse(hex, radix: 16);
      default:
        return 0xFFFFFFFF;
    }
  }

  Future<void> loadLayoutsForQuestion(int qNum) async {
    final box = await Hive.openBox(_boxName);
    final setId = state.setId;

    final qLayout = box.get('${setId}_q${qNum}_question') as QuestionLayout? ?? 
        QuestionLayout(x: 50, y: 100, width: 450, height: 300);
    
    final oLayout = box.get('${setId}_q${qNum}_options') as OptionsLayout? ?? 
        OptionsLayout(x: 550, y: 100, width: 350, height: 300);

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
    _syncSettingsToBackend();
  }

  void resetLayout(int qNum) {
    final qLayout = QuestionLayout(x: 50, y: 100, width: 450, height: 300);
    final oLayout = OptionsLayout(x: 550, y: 100, width: 350, height: 300);
    
    state = state.copyWith(
      questionLayouts: {...state.questionLayouts, qNum: qLayout},
      optionsLayouts: {...state.optionsLayouts, qNum: oLayout},
    );
    _saveLayouts(qNum, qLayout, oLayout);
  }

  Future<void> applyLayoutToAll(int currentQNum) async {
    _saveSettings();
    
    final qLayout = state.questionLayouts[currentQNum];
    final oLayout = state.optionsLayouts[currentQNum];
    
    if (qLayout == null || oLayout == null) return;

    final box = await Hive.openBox(_boxName);
    
    final slideState = ref.read(slideNotifierProvider);
    
    // Find the correct metadata for current setId to get accurate questionCount
    final metadata = slideState.importedSets.firstWhere(
      (m) => m.setId == state.setId,
      orElse: () => slideState.importedSets.isNotEmpty 
          ? slideState.importedSets.first 
          : throw Exception('No imported set found for ${state.setId}'),
    );
    
    final count = metadata.questionCount;

    final newQLayouts = Map<int, QuestionLayout>.from(state.questionLayouts);
    final newOLayouts = Map<int, OptionsLayout>.from(state.optionsLayouts);

    for (int i = 1; i <= count; i++) {
        if (i != currentQNum) {
            final qCopy = qLayout.copyWith();
            final oCopy = oLayout.copyWith();
            
            newQLayouts[i] = qCopy;
            newOLayouts[i] = oCopy;
            await box.put('${state.setId}_q${i}_question', qCopy);
            await box.put('${state.setId}_q${i}_options', oCopy);
        }
    }

    state = state.copyWith(
      questionLayouts: newQLayouts,
      optionsLayouts: newOLayouts,
    );

    // Sync to backend so other teammates/sessions see the update
    await _syncSettingsToBackend();
  }

  Future<void> _syncSettingsToBackend() async {
    if (state.setId == 'default') return;

    try {
      final dio = ref.read(dioProvider);
      final visualSettings = {
        'questionColor': state.settings.questionColor,
        'questionBg': state.settings.questionBg,
        'optionColor': state.settings.optionColor,
        'optionBg': state.settings.optionBg,
        'screenBg': state.settings.screenBg,
        'questionFontSize': state.settings.questionFontSize,
        'optionFontSize': state.settings.optionFontSize,
        'questionBorderColor': state.settings.questionBorderColor,
        'questionBorderWidth': state.settings.questionBorderWidth,
        'optionBorderColor': state.settings.optionBorderColor,
        'optionBorderWidth': state.settings.optionBorderWidth,
        'backgroundPreset': state.settings.backgroundPreset,
        'showCardBackground': state.settings.showCardBackground,
        'showSourceBadge': state.settings.showSourceBadge,
        'showOptions': state.settings.showOptions,
      };

      await dio.post(
        '/whiteboard/sets/${state.setId}/visual-settings',
        data: {'visual_settings': visualSettings},
      );
    } catch (e) {
      debugPrint('Failed to sync settings to backend: $e');
    }
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
