import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import '../../../../../core/theme/app_theme.dart';

class AttendancePanel extends StatefulWidget {
  const AttendancePanel({super.key});

  @override
  State<AttendancePanel> createState() => _AttendancePanelState();
}

class _AttendancePanelState extends State<AttendancePanel> {
  final List<Map<String, dynamic>> _students = List.generate(20, (i) => {
    'id': 'ID-10${i+1}',
    'name': 'Student ${i+1}',
    'present': true,
  });

  @override
  Widget build(BuildContext context) {
    int presentCount = _students.where((s) => s['present']).length;

    return Container(
      width: 400.w,
      height: double.infinity,
      color: Colors.white,
      child: Column(
        children: [
          _buildHeader(presentCount),
          Expanded(
            child: ListView.separated(
              padding: EdgeInsets.all(16.w),
              itemCount: _students.length,
              separatorBuilder: (context, index) => const Divider(),
              itemBuilder: (context, index) {
                final student = _students[index];
                return ListTile(
                  leading: CircleAvatar(
                    backgroundColor: AppTheme.primaryOrange.withOpacity(0.1),
                    child: Text(student['name'][0], style: const TextStyle(color: AppTheme.primaryOrange)),
                  ),
                  title: Text(student['name'], style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13.sp)),
                  subtitle: Text(student['id'], style: TextStyle(fontSize: 11.sp, color: Colors.grey)),
                  trailing: Switch(
                    value: student['present'],
                    activeThumbColor: Colors.green,
                    onChanged: (val) {
                      setState(() => student['present'] = val);
                    },
                  ),
                );
              },
            ),
          ),
          _buildFooter(),
        ],
      ),
    );
  }

  Widget _buildHeader(int presentCount) {
    return Container(
      padding: EdgeInsets.all(24.w),
      color: AppTheme.primaryOrange,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Attendance',
                style: TextStyle(color: Colors.white, fontSize: 20.sp, fontWeight: FontWeight.bold),
              ),
              IconButton(
                icon: const Icon(Icons.close, color: Colors.white),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          SizedBox(height: 8.h),
          Text(
            'Present: $presentCount / ${_students.length}',
            style: TextStyle(color: Colors.white.withOpacity(0.9), fontSize: 13.sp),
          ),
        ],
      ),
    );
  }

  Widget _buildFooter() {
    return Container(
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -4))],
      ),
      child: SizedBox(
        width: double.infinity,
        child: ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppTheme.primaryOrange,
            foregroundColor: Colors.white,
            padding: EdgeInsets.symmetric(vertical: 16.h),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.r)),
          ),
          onPressed: () {
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(content: Text('Attendance Saved and Synced to Cloud!')),
            );
          },
          child: const Text('Save & Sync'),
        ),
      ),
    );
  }
}
