import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:eduhub_whiteboard/core/theme/app_theme.dart';
import 'package:eduhub_whiteboard/features/super_admin/providers/module_config_provider.dart';

class SuperAdminDashboard extends ConsumerStatefulWidget {
  const SuperAdminDashboard({super.key});

  @override
  ConsumerState<SuperAdminDashboard> createState() => _SuperAdminDashboardState();
}

class _SuperAdminDashboardState extends ConsumerState<SuperAdminDashboard> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6),
      body: Row(
        children: [
          _buildSidebar(),
          Expanded(
            child: Column(
              children: [
                _buildHeader(),
                Expanded(
                  child: _selectedIndex == 0 
                      ? _buildDashboardHome() 
                      : _selectedIndex == 1 
                          ? _buildModuleConfig() 
                          : _selectedIndex == 2
                              ? _buildClassCalibration()
                              : _buildPlaceholderPage(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDashboardHome() {
    return SingleChildScrollView(
      padding: EdgeInsets.all(24.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildStatsGrid(),
          SizedBox(height: 24.h),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(flex: 2, child: _buildRecentSessions()),
              SizedBox(width: 24.w),
              Expanded(child: _buildQuickToggleSummary()),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildModuleConfig() {
    final config = ref.watch(moduleConfigProvider);
    final notifier = ref.read(moduleConfigProvider.notifier);

    return SingleChildScrollView(
      padding: EdgeInsets.all(24.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Module Configuration', style: TextStyle(fontSize: 20.sp, fontWeight: FontWeight.bold)),
          SizedBox(height: 8.h),
          Text('Enable or disable whiteboard features globally.', style: TextStyle(color: Colors.grey, fontSize: 13.sp)),
          SizedBox(height: 24.h),
          _buildConfigSection('Core AI Features', [
            _configTile('AI Teacher Assistant', 'aiAssistant', config.aiAssistant, notifier),
            _configTile('Homework Generator', 'homeworkGenerator', config.homeworkGenerator, notifier),
          ]),
          SizedBox(height: 24.h),
          _buildConfigSection('Subject Simulations', [
            _configTile('Periodic Table (Chemistry)', 'periodicTable', config.periodicTable, notifier),
            _configTile('3D Shape Builder (Math)', 'shapeBuilder3D', config.shapeBuilder3D, notifier),
            _configTile('Physics Simulations', 'physicsSimulations', config.physicsSimulations, notifier),
          ]),
          SizedBox(height: 24.h),
          _buildConfigSection('Classroom Management', [
            _configTile('Digital Attendance', 'attendance', config.attendance, notifier),
            _configTile('Split-Screen Mode', 'splitScreen', config.splitScreen, notifier),
          ]),
        ],
      ),
    );
  }

  Widget _buildClassCalibration() {
    final config = ref.watch(moduleConfigProvider);
    final notifier = ref.read(moduleConfigProvider.notifier);

    return SingleChildScrollView(
      padding: EdgeInsets.all(24.w),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Global Class Calibration', style: TextStyle(fontSize: 20.sp, fontWeight: FontWeight.bold)),
          SizedBox(height: 8.h),
          Text('Configure AI behavior and student access per grade level.', style: TextStyle(color: Colors.grey, fontSize: 13.sp)),
          SizedBox(height: 24.h),
          
          _buildConfigSection('Authorized Grade Levels', [
            Wrap(
              spacing: 12.w,
              runSpacing: 12.h,
              children: List.generate(12, (index) {
                final grade = index + 1;
                final isAllowed = config.allowedGrades.contains(grade);
                return FilterChip(
                  label: Text('Class $grade'),
                  selected: isAllowed,
                  onSelected: (selected) {
                    final newList = List<int>.from(config.allowedGrades);
                    if (selected) newList.add(grade); else newList.remove(grade);
                    notifier.updateAllowedGrades(newList);
                  },
                  selectedColor: Colors.blueAccent.withOpacity(0.2),
                  checkmarkColor: Colors.blueAccent,
                );
              }),
            ),
          ]),

          SizedBox(height: 24.h),
          _buildConfigSection('AI Performance Quotas', [
            _label('Daily Token Limit per Session: ${config.globalAiTokenLimit}'),
            Slider(
              value: config.globalAiTokenLimit.toDouble(),
              min: 1000,
              max: 20000,
              divisions: 19,
              onChanged: (v) => notifier.updateTokenLimit(v.toInt()),
              activeColor: Colors.blueAccent,
            ),
            SizedBox(height: 8.h),
            Text(
              'Limits the number of AI words/objects generated per session to optimize costs.',
              style: TextStyle(color: Colors.grey, fontSize: 11.sp),
            ),
          ]),
        ],
      ),
    );
  }

  Widget _label(String text) {
    return Padding(
      padding: EdgeInsets.only(bottom: 8.h),
      child: Text(text, style: TextStyle(color: Colors.black87, fontSize: 13.sp, fontWeight: FontWeight.w500)),
    );
  }

  Widget _buildConfigSection(String title, List<Widget> children) {
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12.r)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.bold, color: Colors.blueAccent)),
          SizedBox(height: 16.h),
          ...children,
        ],
      ),
    );
  }

  Widget _configTile(String name, String key, bool value, ModuleConfigNotifier notifier) {
    return ListTile(
      title: Text(name, style: TextStyle(fontSize: 14.sp)),
      trailing: Switch(
        value: value,
        onChanged: (v) => notifier.toggleModule(key, v),
        activeColor: Colors.blueAccent,
      ),
    );
  }

  Widget _buildSidebar() {
    return Container(
      width: 240.w,
      color: const Color(0xFF1F2937),
      child: Column(
        children: [
          Container(
            padding: EdgeInsets.all(24.w),
            child: Row(
              children: [
                const Icon(Icons.admin_panel_settings, color: Colors.blueAccent),
                SizedBox(width: 12.w),
                Text('EDU-ADMIN', style: TextStyle(color: Colors.white, fontSize: 16.sp, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
          _sidebarItem(0, Icons.dashboard, 'Dashboard'),
          _sidebarItem(1, Icons.settings_suggest, 'Module Config'),
          _sidebarItem(2, Icons.tune, 'Class Calibration'),
          _sidebarItem(3, Icons.history, 'Session Logs'),
          _sidebarItem(4, Icons.analytics, 'Analytics'),
          _sidebarItem(5, Icons.people, 'User Management'),
          const Spacer(),
          _sidebarItem(99, Icons.logout, 'Exit Admin'),
          SizedBox(height: 12.w),
        ],
      ),
    );
  }

  Widget _sidebarItem(int index, IconData icon, String label) {
    final active = _selectedIndex == index;
    return Container(
      margin: EdgeInsets.symmetric(horizontal: 12.h, vertical: 4.h),
      decoration: BoxDecoration(
        color: active ? Colors.blueAccent.withOpacity(0.1) : Colors.transparent,
        borderRadius: BorderRadius.circular(8.r),
      ),
      child: ListTile(
        leading: Icon(icon, color: active ? Colors.blueAccent : Colors.grey, size: 18),
        title: Text(label, style: TextStyle(color: active ? Colors.white : Colors.grey, fontSize: 13.sp)),
        onTap: () {
          if (index == 99) {
            Navigator.pop(context);
          } else {
            setState(() => _selectedIndex = index);
          }
        },
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      height: 64.h,
      color: Colors.white,
      padding: EdgeInsets.symmetric(horizontal: 24.w),
      child: Row(
        children: [
          Text(
            _selectedIndex == 0 ? 'Whiteboard Management Overview' : 'System Configuration',
            style: TextStyle(fontSize: 16.sp, fontWeight: FontWeight.bold),
          ),
          const Spacer(),
          const CircleAvatar(backgroundColor: Colors.blueAccent, child: Icon(Icons.person, color: Colors.white, size: 20)),
        ],
      ),
    );
  }

  Widget _buildStatsGrid() {
    return GridView.count(
      shrinkWrap: true,
      crossAxisCount: 4,
      crossAxisSpacing: 16.w,
      mainAxisSpacing: 16.w,
      childAspectRatio: 2.2,
      children: [
        _statCard('Total Sessions', '1,284', Icons.history, Colors.blue),
        _statCard('Active Nodes', '42', Icons.router, Colors.green),
        _statCard('AI Tokens Used', '842K', Icons.auto_awesome, Colors.purple),
        _statCard('Storage Used', '124 GB', Icons.storage, Colors.orange),
      ],
    );
  }

  Widget _statCard(String label, String value, IconData icon, Color color) {
    return Container(
      padding: EdgeInsets.all(16.w),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12.r)),
      child: Row(
        children: [
          Container(padding: EdgeInsets.all(8.w), decoration: BoxDecoration(color: color.withOpacity(0.1), shape: BoxShape.circle), child: Icon(icon, color: color, size: 20)),
          SizedBox(width: 12.w),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(label, style: TextStyle(color: Colors.grey, fontSize: 11.sp)),
              Text(value, style: TextStyle(fontSize: 18.sp, fontWeight: FontWeight.bold)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRecentSessions() {
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12.r)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Live Whiteboard Sessions', style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.bold)),
          SizedBox(height: 16.h),
          ListView.separated(
            shrinkWrap: true,
            itemCount: 4,
            separatorBuilder: (c, i) => const Divider(),
            itemBuilder: (c, i) => ListTile(
              leading: const Icon(Icons.draw, color: AppTheme.primaryOrange, size: 20),
              title: Text('Session #$i - Class 10 Math', style: TextStyle(fontSize: 13.sp)),
              subtitle: Text('Admin: Rahul S. | 24 Students', style: TextStyle(fontSize: 11.sp)),
              trailing: const Text('Live', style: TextStyle(color: Colors.green)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickToggleSummary() {
    final config = ref.watch(moduleConfigProvider);
    return Container(
      padding: EdgeInsets.all(20.w),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12.r)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Quick Health Check', style: TextStyle(fontSize: 15.sp, fontWeight: FontWeight.bold)),
          SizedBox(height: 16.h),
          _moduleIndicator('AI Engine', config.aiAssistant),
          _moduleIndicator('Simulation Node', config.periodicTable || config.shapeBuilder3D),
          _moduleIndicator('Cloud Storage', true),
          _moduleIndicator('Student Sync', config.splitScreen),
        ],
      ),
    );
  }

  Widget _moduleIndicator(String name, bool status) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: 8.h),
      child: Row(
        children: [
          Icon(status ? Icons.check_circle : Icons.cancel, color: status ? Colors.green : Colors.red, size: 16),
          SizedBox(width: 8.w),
          Text(name, style: TextStyle(fontSize: 12.sp)),
        ],
      ),
    );
  }

  Widget _buildPlaceholderPage() {
    return Center(child: Text('This section is coming soon...', style: TextStyle(color: Colors.grey, fontSize: 16.sp)));
  }
}
