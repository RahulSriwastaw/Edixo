// lib/features/whiteboard/presentation/widgets/teaching_tools/random_picker.dart

import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/constants/app_dimensions.dart';
import '../../../../../core/constants/app_text_styles.dart';

/// Random student picker for classroom engagement
class RandomPicker extends ConsumerStatefulWidget {
  final List<String> students;
  const RandomPicker({super.key, required this.students});

  @override
  ConsumerState<RandomPicker> createState() => _RandomPickerState();
}

class _RandomPickerState extends ConsumerState<RandomPicker>
    with SingleTickerProviderStateMixin {
  String? _selectedStudent;
  bool _isSpinning = false;
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    _animation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOut,
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _pickRandom() async {
    if (widget.students.isEmpty || _isSpinning) return;

    setState(() => _isSpinning = true);
    _controller.reset();
    _controller.forward();

    // Simulate spinning animation
    await Future.delayed(const Duration(milliseconds: 1500));

    final random = Random();
    final selected = widget.students[random.nextInt(widget.students.length)];

    setState(() {
      _selectedStudent = selected;
      _isSpinning = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppDimensions.borderRadiusL),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary.withValues(alpha: 0.9),
        borderRadius: BorderRadius.circular(AppDimensions.borderRadiusL),
        border: Border.all(color: AppColors.textTertiary.withValues(alpha: 0.2)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Header
          Row(
            children: [
              const Icon(Icons.casino, color: AppColors.accentOrange, size: 24),
              const SizedBox(width: AppDimensions.borderRadiusM),
              Text(
                'Random Picker',
                style: AppTextStyles.heading3,
              ),
            ],
          ),
          const SizedBox(height: AppDimensions.borderRadiusL),

          // Selected student display
          AnimatedBuilder(
            animation: _animation,
            builder: (context, child) {
              return Transform.scale(
                scale: _isSpinning ? 1.0 + (_animation.value * 0.1) : 1.0,
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(AppDimensions.borderRadiusL),
                  decoration: BoxDecoration(
                    color: _selectedStudent != null
                        ? AppColors.accentOrange.withValues(alpha: 0.2)
                        : AppColors.bgPrimary,
                    borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
                    border: Border.all(
                      color: _selectedStudent != null
                          ? AppColors.accentOrange
                          : AppColors.textTertiary.withValues(alpha: 0.2),
                      width: 2,
                    ),
                  ),
                  child: Text(
                    _isSpinning
                        ? 'Picking...'
                        : _selectedStudent ?? 'Tap to pick a student',
                    style: AppTextStyles.heading2.copyWith(
                      color: _selectedStudent != null
                          ? AppColors.accentOrange
                          : AppColors.textSecondary,
                      fontSize: _selectedStudent != null ? 28 : 18,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              );
            },
          ),
          const SizedBox(height: AppDimensions.borderRadiusL),

          // Pick button
          ElevatedButton.icon(
            onPressed: _isSpinning ? null : _pickRandom,
            icon: const Icon(Icons.casino, size: 20),
            label: const Text('Pick Random Student'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.accentOrange,
              foregroundColor: AppColors.bgPrimary,
              padding: const EdgeInsets.symmetric(
                horizontal: AppDimensions.borderRadiusL * 2,
                vertical: AppDimensions.borderRadiusM,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
              ),
            ),
          ),
          const SizedBox(height: AppDimensions.borderRadiusM),

          // Student count
          Text(
            '${widget.students.length} students in class',
            style: AppTextStyles.caption.copyWith(color: AppColors.textTertiary),
          ),
        ],
      ),
    );
  }
}

/// Dice roller for random number generation
class DiceRoller extends ConsumerStatefulWidget {
  final int sides;
  const DiceRoller({super.key, this.sides = 6});

  @override
  ConsumerState<DiceRoller> createState() => _DiceRollerState();
}

class _DiceRollerState extends ConsumerState<DiceRoller>
    with SingleTickerProviderStateMixin {
  int? _result;
  bool _isRolling = false;
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _rollDice() async {
    if (_isRolling) return;

    setState(() => _isRolling = true);
    _controller.reset();
    _controller.forward();

    await Future.delayed(const Duration(milliseconds: 800));

    final random = Random();
    final result = random.nextInt(widget.sides) + 1;

    setState(() {
      _result = result;
      _isRolling = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _isRolling ? null : _rollDice,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          final rotation = _isRolling
              ? _controller.value * 4 * pi
              : 0.0;

          return Transform.rotate(
            angle: rotation,
            child: Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: _result != null
                    ? AppColors.accentOrange
                    : AppColors.bgSecondary,
                borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
                border: Border.all(
                  color: AppColors.textTertiary.withValues(alpha: 0.3),
                  width: 2,
                ),
              ),
              child: Center(
                child: Text(
                  _isRolling ? '?' : (_result?.toString() ?? '?'),
                  style: AppTextStyles.heading1.copyWith(
                    color: _result != null
                        ? AppColors.bgPrimary
                        : AppColors.textPrimary,
                    fontSize: 36,
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
