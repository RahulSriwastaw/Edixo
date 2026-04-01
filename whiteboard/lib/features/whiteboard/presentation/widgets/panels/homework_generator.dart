import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class HomeworkGeneratorPanel extends StatefulWidget {
  const HomeworkGeneratorPanel({super.key});

  @override
  State<HomeworkGeneratorPanel> createState() => _HomeworkGeneratorPanelState();
}

class _HomeworkGeneratorPanelState extends State<HomeworkGeneratorPanel> {
  bool _isGenerating = false;
  String? _generatedHomework;
  final TextEditingController _topicCtrl = TextEditingController();

  Future<void> _generate() async {
    if (_topicCtrl.text.isEmpty) return;
    setState(() => _isGenerating = true);
    await Future.delayed(const Duration(seconds: 2));
    setState(() {
      _isGenerating = false;
      _generatedHomework = '''
### Homework: ${_topicCtrl.text}
**Due Date:** March 15, 2026

**Questions:**
1. Define the core concepts discussed in class.
2. Solve the equation provided on page 2 of the notes.
3. Draw a diagram of the process and label all parts.

**Challenge:** How would you apply this in a real-world scenario?
''';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 400.w,
      height: double.infinity,
      color: Colors.white,
      padding: EdgeInsets.all(24.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('AI Homework Generator', style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.bold)),
              IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
            ],
          ),
          SizedBox(height: 24.h),
          TextField(
            controller: _topicCtrl,
            decoration: InputDecoration(
              labelText: 'Topic / Lesson Name',
              hintText: 'e.g. Photosynthesis, Motion in 1D',
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12.r)),
            ),
          ),
          SizedBox(height: 16.h),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              icon: _isGenerating ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Icon(Icons.auto_awesome),
              label: Text(_isGenerating ? 'Generating...' : 'Generate with AI'),
              onPressed: _isGenerating ? null : _generate,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.purpleAccent,
                foregroundColor: Colors.white,
                padding: EdgeInsets.symmetric(vertical: 16.h),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
              ),
            ),
          ),
          if (_generatedHomework != null) ...[
            SizedBox(height: 24.h),
            const Divider(),
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Preview:', style: TextStyle(fontSize: 14.sp, fontWeight: FontWeight.bold, color: Colors.grey)),
                    SizedBox(height: 12.h),
                    Container(
                      padding: EdgeInsets.all(16.w),
                      decoration: BoxDecoration(color: Colors.grey.shade50, borderRadius: BorderRadius.circular(12.r)),
                      child: Text(_generatedHomework!, style: TextStyle(fontSize: 13.sp, height: 1.5)),
                    ),
                    SizedBox(height: 24.h),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            icon: const Icon(Icons.qr_code),
                            label: const Text('Share QR'),
                            onPressed: () => _showQR(context),
                          ),
                        ),
                        SizedBox(width: 12.w),
                        Expanded(
                          child: ElevatedButton.icon(
                            icon: const Icon(Icons.send),
                            label: const Text('Assign'),
                            onPressed: () => Navigator.pop(context),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  void _showQR(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Homework QR Code'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 200,
              height: 200,
              color: Colors.white,
              child: const Center(child: Icon(Icons.qr_code, size: 150)),
            ),
            const SizedBox(height: 16),
            const Text('Students can scan this to view homework on their app.'),
          ],
        ),
        actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('Download'))],
      ),
    );
  }
}
