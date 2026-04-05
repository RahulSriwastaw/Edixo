import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class CompetitionScoreboard extends StatefulWidget {
  final int panelCount;
  const CompetitionScoreboard({super.key, this.panelCount = 4});

  @override
  State<CompetitionScoreboard> createState() => _CompetitionScoreboardState();
}

class _CompetitionScoreboardState extends State<CompetitionScoreboard> {
  late List<int> _scores;

  @override
  void initState() {
    super.initState();
    _scores = List.filled(widget.panelCount, 0);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 12.h),
      margin: EdgeInsets.all(12.w),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.85),
        borderRadius: BorderRadius.circular(12.r),
        border: Border.all(color: Colors.white12),
        boxShadow: const [BoxShadow(color: Colors.black26, blurRadius: 10)],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              const Icon(Icons.emoji_events, color: Colors.amber, size: 20),
              SizedBox(width: 8.w),
              Text('Live Scoreboard', style: TextStyle(color: Colors.white, fontSize: 13.sp, fontWeight: FontWeight.bold)),
              const Spacer(),
              _resetBtn(),
            ],
          ),
          SizedBox(height: 12.h),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: List.generate(widget.panelCount, (i) => _scoreItem(i)),
          ),
        ],
      ),
    );
  }

  Widget _scoreItem(int index) {
    return Column(
      children: [
        Text('P${index + 1}', style: TextStyle(color: Colors.white54, fontSize: 10.sp)),
        SizedBox(height: 4.h),
        GestureDetector(
          onTap: () => setState(() => _scores[index] += 10),
          child: Container(
            width: 40.w,
            height: 40.w,
            decoration: BoxDecoration(
              color: Colors.blueAccent.withValues(alpha: 0.2),
              shape: BoxShape.circle,
              border: Border.all(color: Colors.blueAccent.withValues(alpha: 0.5)),
            ),
            child: Center(
              child: Text('${_scores[index]}', style: TextStyle(color: Colors.white, fontSize: 14.sp, fontWeight: FontWeight.bold)),
            ),
          ),
        ),
      ],
    );
  }

  Widget _resetBtn() {
    return InkWell(
      onTap: () => setState(() => _scores = List.filled(widget.panelCount, 0)),
      child: Icon(Icons.refresh, color: Colors.white38, size: 16.w),
    );
  }
}
