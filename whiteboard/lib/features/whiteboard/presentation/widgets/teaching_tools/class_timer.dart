// lib/features/whiteboard/presentation/widgets/teaching_tools/class_timer.dart

import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../../core/constants/app_colors.dart';
import '../../../../../core/constants/app_text_styles.dart';

/// Class session timer - tracks total class duration
class ClassTimer extends ConsumerStatefulWidget {
  const ClassTimer({super.key});

  @override
  ConsumerState<ClassTimer> createState() => _ClassTimerState();
}

class _ClassTimerState extends ConsumerState<ClassTimer> {
  Timer? _timer;
  Duration _elapsed = Duration.zero;
  bool _isRunning = false;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        _elapsed += const Duration(seconds: 1);
      });
    });
    setState(() => _isRunning = true);
  }

  void _pauseTimer() {
    _timer?.cancel();
    setState(() => _isRunning = false);
  }

  void _resetTimer() {
    _timer?.cancel();
    setState(() {
      _elapsed = Duration.zero;
      _isRunning = false;
    });
    _startTimer();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 16,
        vertical: 12,
      ),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary.withOpacity(0.9),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.textDisabled.withOpacity(0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.timer,
            color: _isRunning ? AppColors.success : AppColors.textDisabled,
            size: 18,
          ),
          const SizedBox(width: 8),
          Text(
            _formatDuration(_elapsed),
            style: AppTextStyles.body.copyWith(
              color: AppColors.textPrimary,
              fontFamily: 'monospace',
              fontSize: 18,
            ),
          ),
          const SizedBox(width: 12),
          // Pause/Play button
          IconButton(
            icon: Icon(
              _isRunning ? Icons.pause : Icons.play_arrow,
              size: 18,
              color: AppColors.textPrimary,
            ),
            onPressed: _isRunning ? _pauseTimer : _startTimer,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
          ),
          const SizedBox(width: 8),
          // Reset button
          IconButton(
            icon: Icon(
              Icons.refresh,
              size: 18,
              color: AppColors.textPrimary,
            ),
            onPressed: _resetTimer,
            padding: EdgeInsets.zero,
            constraints: const BoxConstraints(),
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

/// Countdown timer for activities
class CountdownTimer extends ConsumerStatefulWidget {
  final Duration initialDuration;
  final VoidCallback? onCompleted;

  const CountdownTimer({
    super.key,
    this.initialDuration = const Duration(minutes: 5),
    this.onCompleted,
  });

  @override
  ConsumerState<CountdownTimer> createState() => _CountdownTimerState();
}

class _CountdownTimerState extends ConsumerState<CountdownTimer> {
  Timer? _timer;
  late Duration _remaining;
  bool _isRunning = false;

  @override
  void initState() {
    super.initState();
    _remaining = widget.initialDuration;
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remaining.inSeconds > 0) {
        setState(() {
          _remaining -= const Duration(seconds: 1);
        });
      } else {
        _timer?.cancel();
        setState(() => _isRunning = false);
        widget.onCompleted?.call();
        _showCompletionNotification();
      }
    });
    setState(() => _isRunning = true);
  }

  void _pauseTimer() {
    _timer?.cancel();
    setState(() => _isRunning = false);
  }

  void _resetTimer() {
    _timer?.cancel();
    setState(() {
      _remaining = widget.initialDuration;
      _isRunning = false;
    });
  }

  void _showCompletionNotification() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Countdown complete!'),
        backgroundColor: AppColors.accentOrange,
        duration: const Duration(seconds: 3),
        action: SnackBarAction(
          label: 'Dismiss',
          textColor: Colors.white,
          onPressed: () {},
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final progress = 1.0 - (_remaining.inSeconds / widget.initialDuration.inSeconds);

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.bgSecondary.withOpacity(0.9),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.textDisabled.withOpacity(0.2)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Circular progress indicator
          Stack(
            alignment: Alignment.center,
            children: [
              SizedBox(
                width: 80,
                height: 80,
                child: CircularProgressIndicator(
                  value: progress,
                  strokeWidth: 6,
                  backgroundColor: AppColors.bgPrimary,
                  valueColor: AlwaysStoppedAnimation<Color>(
                    _remaining.inSeconds < 30 ? AppColors.error : AppColors.accentOrange,
                  ),
                ),
              ),
              Text(
                _formatDuration(_remaining),
                style: AppTextStyles.heading2.copyWith(
                  fontFamily: 'monospace',
                  color: _remaining.inSeconds < 30 ? AppColors.error : AppColors.textPrimary,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Controls
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              IconButton(
                icon: Icon(
                  _isRunning ? Icons.pause : Icons.play_arrow,
                  color: AppColors.textPrimary,
                ),
                onPressed: _isRunning ? _pauseTimer : _startTimer,
              ),
              IconButton(
                icon: Icon(Icons.refresh, color: AppColors.textPrimary),
                onPressed: _resetTimer,
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _formatDuration(Duration duration) {
    final minutes = duration.inMinutes.toString().padLeft(2, '0');
    final seconds = (duration.inSeconds % 60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }
}
