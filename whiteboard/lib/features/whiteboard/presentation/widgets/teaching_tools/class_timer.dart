// lib/features/whiteboard/presentation/widgets/teaching_tools/class_timer.dart

import 'dart:async';
import 'package:flutter/material.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/constants/app_text_styles.dart';

enum TimerMode { stopwatch, countdown }

/// Teacher-controlled timer panel.
/// Hidden by default and opened via watch icon from whiteboard screen.
class ClassTimer extends StatefulWidget {
  final VoidCallback? onClose;

  const ClassTimer({super.key, this.onClose});

  @override
  State<ClassTimer> createState() => _ClassTimerState();
}

class _ClassTimerState extends State<ClassTimer> {
  Timer? _timer;
  TimerMode _mode = TimerMode.stopwatch;
  Duration _elapsed = Duration.zero;
  Duration _remaining = const Duration(minutes: 10);
  Duration _selectedCountdown = const Duration(minutes: 10);
  bool _isRunning = false;

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _startStopwatch() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        _elapsed += const Duration(seconds: 1);
      });
    });
    setState(() => _isRunning = true);
  }

  void _startCountdown() {
    _timer?.cancel();
    if (_remaining.inSeconds <= 0) {
      _remaining = _selectedCountdown;
    }
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remaining.inSeconds <= 1) {
        _timer?.cancel();
        setState(() {
          _remaining = Duration.zero;
          _isRunning = false;
        });
        _showCompletionNotification();
        return;
      }
      setState(() {
        _remaining -= const Duration(seconds: 1);
      });
    });
    setState(() => _isRunning = true);
  }

  void _startTimer() {
    if (_mode == TimerMode.stopwatch) {
      _startStopwatch();
      return;
    }
    _startCountdown();
  }

  void _pauseTimer() {
    _timer?.cancel();
    setState(() => _isRunning = false);
  }

  void _resetTimer() {
    _timer?.cancel();
    setState(() {
      _isRunning = false;
      if (_mode == TimerMode.stopwatch) {
        _elapsed = Duration.zero;
      } else {
        _remaining = _selectedCountdown;
      }
    });
  }

  void _setMode(TimerMode mode) {
    _timer?.cancel();
    setState(() {
      _mode = mode;
      _isRunning = false;
      if (mode == TimerMode.countdown && _remaining == Duration.zero) {
        _remaining = _selectedCountdown;
      }
    });
  }

  void _setCountdown(Duration duration) {
    _timer?.cancel();
    setState(() {
      _selectedCountdown = duration;
      _remaining = duration;
      _isRunning = false;
    });
  }

  void _showCompletionNotification() {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Timer complete'),
        backgroundColor: AppColors.accentOrange,
        duration: Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isCountdown = _mode == TimerMode.countdown;
    final primaryTime = isCountdown ? _remaining : _elapsed;

    return Container(
      width: 320,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary.withValues(alpha: 0.9),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.textDisabled.withValues(alpha: 0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Icon(
                Icons.watch_later_outlined,
                color: _isRunning ? AppColors.success : AppColors.textDisabled,
                size: 18,
              ),
              const SizedBox(width: 8),
              Text(
                'Teacher Timer',
                style: AppTextStyles.body.copyWith(
                  color: AppColors.textPrimary,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const Spacer(),
              IconButton(
                tooltip: 'Close timer',
                onPressed: widget.onClose,
                icon: const Icon(Icons.close, size: 18, color: AppColors.textPrimary),
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(),
              ),
            ],
          ),

          const SizedBox(height: 10),
          SegmentedButton<TimerMode>(
            segments: const [
              ButtonSegment<TimerMode>(
                value: TimerMode.stopwatch,
                label: Text('Stopwatch'),
                icon: Icon(Icons.timelapse, size: 16),
              ),
              ButtonSegment<TimerMode>(
                value: TimerMode.countdown,
                label: Text('Countdown'),
                icon: Icon(Icons.hourglass_bottom, size: 16),
              ),
            ],
            selected: {_mode},
            onSelectionChanged: (selection) {
              if (selection.isNotEmpty) {
                _setMode(selection.first);
              }
            },
          ),

          if (isCountdown) ...[
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              children: [
                _PresetChip(
                  label: '5m',
                  selected: _selectedCountdown == const Duration(minutes: 5),
                  onTap: () => _setCountdown(const Duration(minutes: 5)),
                ),
                _PresetChip(
                  label: '10m',
                  selected: _selectedCountdown == const Duration(minutes: 10),
                  onTap: () => _setCountdown(const Duration(minutes: 10)),
                ),
                _PresetChip(
                  label: '15m',
                  selected: _selectedCountdown == const Duration(minutes: 15),
                  onTap: () => _setCountdown(const Duration(minutes: 15)),
                ),
                _PresetChip(
                  label: '30m',
                  selected: _selectedCountdown == const Duration(minutes: 30),
                  onTap: () => _setCountdown(const Duration(minutes: 30)),
                ),
              ],
            ),
          ],

          const SizedBox(height: 12),
          Text(
            _formatDuration(primaryTime),
            style: AppTextStyles.body.copyWith(
              color: AppColors.textPrimary,
              fontFamily: 'monospace',
              fontSize: 28,
              fontWeight: FontWeight.w700,
            ),
          ),

          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: _isRunning ? _pauseTimer : _startTimer,
                  icon: Icon(_isRunning ? Icons.pause : Icons.play_arrow),
                  label: Text(_isRunning ? 'Pause' : 'Start'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.accentOrange,
                    foregroundColor: Colors.white,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              OutlinedButton(
                onPressed: _resetTimer,
                child: const Text('Reset'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _formatDuration(Duration duration) {
    final hours = duration.inHours.toString().padLeft(2, '0');
    final minutes = (duration.inMinutes % 60).toString().padLeft(2, '0');
    final seconds = (duration.inSeconds % 60).toString().padLeft(2, '0');
    return '$hours:$minutes:$seconds';
  }
}

class _PresetChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _PresetChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: selected ? AppColors.accentOrange.withValues(alpha: 0.2) : Colors.transparent,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: selected ? AppColors.accentOrange : AppColors.textDisabled.withValues(alpha: 0.4),
            ),
        ),
        child: Text(
          label,
          style: AppTextStyles.caption.copyWith(
            color: selected ? AppColors.accentOrange : AppColors.textPrimary,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}
