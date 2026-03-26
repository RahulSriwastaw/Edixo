import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'dart:math' as math;
import 'package:eduhub_whiteboard/core/theme/app_theme.dart';
import 'package:eduhub_whiteboard/features/whiteboard/providers/whiteboard_provider.dart';

class PhysicsToolbar extends ConsumerStatefulWidget {
  const PhysicsToolbar({super.key});

  @override
  ConsumerState<PhysicsToolbar> createState() => _PhysicsToolbarState();
}

class _PhysicsToolbarState extends ConsumerState<PhysicsToolbar>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      backgroundColor: const Color(0xFF1E2235),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16.r)),
      child: Container(
        width: 600.w,
        height: 500.h,
        padding: EdgeInsets.all(20.w),
        child: Column(
          children: [
            Row(
              children: [
                Icon(Icons.bolt, color: const Color(0xFF3B82F6), size: 22.w),
                SizedBox(width: 10.w),
                Text('Physics Tools',
                    style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 16.sp)),
                const Spacer(),
                IconButton(
                  icon: const Icon(Icons.close, color: Colors.white54),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            SizedBox(height: 12.h),
            TabBar(
              controller: _tabController,
              indicatorColor: const Color(0xFF3B82F6),
              labelColor: const Color(0xFF3B82F6),
              unselectedLabelColor: Colors.white54,
              isScrollable: true,
              tabs: const [
                Tab(text: 'Formulas'),
                Tab(text: 'Vectors'),
                Tab(text: 'Circuits'),
                Tab(text: 'Waves'),
              ],
            ),
            SizedBox(height: 12.h),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _FormulasTab(),
                  _VectorsTab(),
                  _CircuitsTab(),
                  _WavesTab(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Formulas Tab ─────────────────────────────────────────────────────────────
class _FormulasTab extends ConsumerWidget {
  final _formulas = [
    ['Newton\'s 2nd Law', r'F = ma', 'Mechanics'],
    ['Kinematic Eq.', r'v = u + at', 'Mechanics'],
    ['Kinematic Eq.', r's = ut + \frac{1}{2}at^2', 'Mechanics'],
    ['Kinetic Energy', r'KE = \frac{1}{2}mv^2', 'Energy'],
    ['Potential Energy', r'PE = mgh', 'Energy'],
    ['Work Done', r'W = Fs\cos\theta', 'Energy'],
    ['Ohm\'s Law', r'V = IR', 'Electricity'],
    ['Power (Elec.)', r'P = IV = I^2R = \frac{V^2}{R}', 'Electricity'],
    ['Coulomb\'s Law', r'F = k\frac{q_1 q_2}{r^2}', 'Electrostatics'],
    ['Wave Speed', r'v = f\lambda', 'Waves'],
    ['Snell\'s Law', r'n_1\sin\theta_1 = n_2\sin\theta_2', 'Optics'],
    ['Gravity', r'F = G\frac{m_1 m_2}{r^2}', 'Gravity'],
    ['Einstein Ei.', r'E = mc^2', 'Relativity'],
    ['Ideal Gas', r'PV = nRT', 'Thermodynamics'],
    ['Momentum', r'p = mv', 'Mechanics'],
    ['Pressure', r'P = \frac{F}{A}', 'Mechanics'],
    ['Centripetal F.', r'F = \frac{mv^2}{r}', 'Circular Motion'],
    ['Time Period', r'T = \frac{1}{f}', 'Waves'],
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final grouped = <String, List<List<String>>>{};
    for (final f in _formulas) {
      grouped.putIfAbsent(f[2], () => []).add(f);
    }

    return ListView(
      children: grouped.entries.map((entry) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: EdgeInsets.symmetric(vertical: 6.h),
              child: Text(
                entry.key,
                style: TextStyle(
                    color: const Color(0xFF3B82F6),
                    fontWeight: FontWeight.bold,
                    fontSize: 12.sp),
              ),
            ),
            Wrap(
              spacing: 8.w,
              runSpacing: 8.h,
              children: entry.value.map((f) {
                return GestureDetector(
                  onTap: () {
                    ref.read(whiteboardContentProvider.notifier).addLatex(f[1]);
                    Navigator.pop(context);
                  },
                  child: Container(
                    padding: EdgeInsets.symmetric(horizontal: 12.w, vertical: 8.h),
                    decoration: BoxDecoration(
                      color: const Color(0xFF3B82F6).withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8.r),
                      border: Border.all(
                          color: const Color(0xFF3B82F6).withOpacity(0.3)),
                    ),
                    child: Column(
                      children: [
                        Text(f[0],
                            style: TextStyle(
                                color: Colors.white70, fontSize: 9.sp)),
                        SizedBox(height: 2.h),
                        Text(f[1],
                            style: TextStyle(
                                color: const Color(0xFF3B82F6),
                                fontSize: 13.sp,
                                fontFamily: 'monospace',
                                fontWeight: FontWeight.bold)),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
            SizedBox(height: 8.h),
          ],
        );
      }).toList(),
    );
  }
}

// ─── Vectors Tab ──────────────────────────────────────────────────────────────
class _VectorsTab extends ConsumerWidget {
  final _vectors = [
    ['Velocity', r'\vec{v}', r'\vec{v} = v\hat{r}'],
    ['Force', r'\vec{F}', r'\vec{F} = m\vec{a}'],
    ['Displacement', r'\vec{s}', r'\Delta\vec{r}'],
    ['Acceleration', r'\vec{a}', r'\vec{a} = \frac{\Delta\vec{v}}{\Delta t}'],
    ['Momentum', r'\vec{p}', r'\vec{p} = m\vec{v}'],
    ['Electric Field', r'\vec{E}', r'\vec{E} = \frac{F}{q}'],
    ['Magnetic Field', r'\vec{B}', r'\vec{B}'],
    ['Resultant', r'\vec{R}', r'\vec{R} = \vec{A} + \vec{B}'],
    ['Dot Product', '·', r'\vec{A}\cdot\vec{B} = AB\cos\theta'],
    ['Cross Product', '×', r'\vec{A}\times\vec{B} = AB\sin\theta\hat{n}'],
    ['Unit Vector', r'\hat{n}', r'\hat{n} = \frac{\vec{A}}{|\vec{A}|}'],
    ['Gradient', '∇', r'\nabla f'],
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return GridView.builder(
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        childAspectRatio: 1.8,
        crossAxisSpacing: 8.w,
        mainAxisSpacing: 8.h,
      ),
      itemCount: _vectors.length,
      itemBuilder: (ctx, i) {
        return GestureDetector(
          onTap: () {
            ref.read(whiteboardContentProvider.notifier).addLatex(_vectors[i][2]);
            Navigator.pop(context);
          },
          child: Container(
            padding: EdgeInsets.all(8.w),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              borderRadius: BorderRadius.circular(8.r),
              border: Border.all(color: Colors.white12),
            ),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(_vectors[i][0],
                    style: TextStyle(color: Colors.white70, fontSize: 9.sp)),
                Text(_vectors[i][1],
                    style: TextStyle(
                        color: const Color(0xFF93C5FD),
                        fontSize: 18.sp,
                        fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        );
      },
    );
  }
}

// ─── Circuits Tab ─────────────────────────────────────────────────────────────
class _CircuitsTab extends StatelessWidget {
  final _circuitSymbols = [
    ['Resistor', Icons.horizontal_rule, 'R'],
    ['Capacitor', Icons.battery_0_bar, 'C'],
    ['Battery', Icons.battery_full, 'EMF'],
    ['Switch', Icons.toggle_on, 'S'],
    ['LED', Icons.lightbulb_outline, 'LED'],
    ['Ground', Icons.vertical_align_bottom, 'GND'],
    ['Voltmeter', Icons.speed, 'V'],
    ['Ammeter', Icons.speed_outlined, 'A'],
    ['Diode', Icons.arrow_right_alt, 'D'],
    ['Transistor', Icons.memory, 'T'],
    ['Inductor', Icons.settings_input_component, 'L'],
    ['Galvanometer', Icons.radio_button_checked, 'G'],
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          padding: EdgeInsets.all(12.w),
          decoration: BoxDecoration(
            color: const Color(0xFF3B82F6).withOpacity(0.1),
            borderRadius: BorderRadius.circular(8.r),
          ),
          child: Row(
            children: [
              Icon(Icons.info_outline, color: const Color(0xFF3B82F6), size: 16),
              SizedBox(width: 8.w),
              Expanded(
                child: Text(
                  'Tap a component to insert its LaTeX symbol. Circuit diagrams use the drawing tools.',
                  style: TextStyle(color: Colors.white70, fontSize: 11.sp),
                ),
              ),
            ],
          ),
        ),
        SizedBox(height: 12.h),
        Expanded(
          child: GridView.builder(
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 4,
              childAspectRatio: 1.2,
              crossAxisSpacing: 8.w,
              mainAxisSpacing: 8.h,
            ),
            itemCount: _circuitSymbols.length,
            itemBuilder: (ctx, i) {
              return Container(
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(8.r),
                  border: Border.all(color: Colors.white12),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(_circuitSymbols[i][1] as IconData,
                        color: const Color(0xFF93C5FD), size: 24.w),
                    SizedBox(height: 4.h),
                    Text(_circuitSymbols[i][0] as String,
                        style: TextStyle(color: Colors.white70, fontSize: 9.sp),
                        textAlign: TextAlign.center),
                    Text(_circuitSymbols[i][2] as String,
                        style: TextStyle(
                            color: const Color(0xFF3B82F6),
                            fontSize: 11.sp,
                            fontWeight: FontWeight.bold)),
                  ],
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

// ─── Waves Tab ────────────────────────────────────────────────────────────────
class _WavesTab extends ConsumerWidget {
  final _waveFormulas = [
    ['Wave Equation', r'y = A\sin(kx - \omega t + \phi)'],
    ['Wave Speed', r'v = f\lambda = \frac{\omega}{k}'],
    ['Angular Freq.', r'\omega = 2\pi f = \frac{2\pi}{T}'],
    ['Wave Number', r'k = \frac{2\pi}{\lambda}'],
    ['Intensity', r'I = \frac{P}{A} \propto A^2'],
    ['Doppler Effect', r"f' = f\frac{v \pm v_o}{v \mp v_s}"],
    ['Standing Wave', r'y = 2A\sin(kx)\cos(\omega t)'],
    ['Resonance Freq.', r'f_n = \frac{nv}{2L}'],
    ['Diffraction', r'd\sin\theta = n\lambda'],
    ['Interference', r'\Delta = n\lambda \text{ (constructive)}'],
  ];

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(
      children: [
        // Wave visualizer
        Container(
          height: 80.h,
          margin: EdgeInsets.only(bottom: 12.h),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(8.r),
          ),
          child: CustomPaint(
            size: Size.infinite,
            painter: _WavePreviewPainter(),
          ),
        ),
        Expanded(
          child: GridView.builder(
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 3,
              crossAxisSpacing: 8.w,
              mainAxisSpacing: 6.h,
            ),
            itemCount: _waveFormulas.length,
            itemBuilder: (ctx, i) {
              return GestureDetector(
                onTap: () {
                  ref.read(whiteboardContentProvider.notifier).addLatex(_waveFormulas[i][1]);
                  Navigator.pop(context);
                },
                child: Container(
                  padding: EdgeInsets.all(8.w),
                  decoration: BoxDecoration(
                    color: const Color(0xFF3B82F6).withOpacity(0.08),
                    borderRadius: BorderRadius.circular(8.r),
                    border: Border.all(color: const Color(0xFF3B82F6).withOpacity(0.2)),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(_waveFormulas[i][0],
                          style: TextStyle(color: Colors.white54, fontSize: 9.sp)),
                      Text(_waveFormulas[i][1],
                          style: TextStyle(
                              color: const Color(0xFF93C5FD),
                              fontSize: 10.sp,
                              fontFamily: 'monospace'),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _WavePreviewPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint1 = Paint()
      ..color = const Color(0xFF3B82F6)
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;
    final paint2 = Paint()
      ..color = const Color(0xFF10B981)
      ..strokeWidth = 1.5
      ..style = PaintingStyle.stroke;

    final cx = size.width;
    final cy = size.height / 2;
    const amp = 25.0;

    final path1 = Path();
    final path2 = Path();

    for (double x = 0; x <= cx; x += 2) {
      final y1 = cy + amp * math.sin(x / cx * 2 * 2 * math.pi);
      final y2 = cy + (amp * 0.6) * math.sin(x / cx * 3 * 2 * math.pi);
      if (x == 0) {
        path1.moveTo(x, y1);
        path2.moveTo(x, y2);
      } else {
        path1.lineTo(x, y1);
        path2.lineTo(x, y2);
      }
    }
    canvas.drawPath(path1, paint1);
    canvas.drawPath(path2, paint2);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

