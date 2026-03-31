import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'dart:math' as math;
import 'dart:async';
import '../../../../core/theme/app_theme.dart';
import '../../providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen>
    with TickerProviderStateMixin {
  final _idController = TextEditingController();
  final _orgController = TextEditingController(text: 'demo-org');
  final _passController = TextEditingController();
  bool _obscurePass = true;
  bool _isLoading = false;
  String? _error;
  int _failedAttempts = 0;
  int _lockoutSeconds = 0;
  Timer? _lockoutTimer;

  // Shake animation
  late final AnimationController _shakeCtrl = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 500),
  );
  late final Animation<double> _shakeAnim = Tween<double>(begin: 0, end: 1)
      .animate(CurvedAnimation(parent: _shakeCtrl, curve: Curves.elasticOut));

  // Fade-in animation
  late final AnimationController _fadeCtrl = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 800),
  )..forward();
  late final Animation<double> _fadeAnim =
      CurvedAnimation(parent: _fadeCtrl, curve: Curves.easeOut);

  // Floating particles animation
  late final AnimationController _particleCtrl = AnimationController(
    vsync: this,
    duration: const Duration(seconds: 20),
  )..repeat();

  @override
  void dispose() {
    _idController.dispose();
    _orgController.dispose();
    _passController.dispose();
    _shakeCtrl.dispose();
    _fadeCtrl.dispose();
    _particleCtrl.dispose();
    _lockoutTimer?.cancel();
    super.dispose();
  }

  void _triggerShake() {
    _shakeCtrl.reset();
    _shakeCtrl.forward();
  }

  void _startLockout(int seconds) {
    setState(() {
      _lockoutSeconds = seconds;
    });
    _lockoutTimer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_lockoutSeconds <= 1) {
        t.cancel();
        setState(() {
          _lockoutSeconds = 0;
          _failedAttempts = 0;
        });
      } else {
        setState(() => _lockoutSeconds--);
      }
    });
  }

  Future<void> _submit() async {
    if (_lockoutSeconds > 0) return;
    final id = _idController.text.trim();
    final org = _orgController.text.trim().isEmpty ? null : _orgController.text.trim();
    final pass = _passController.text;
    if (id.isEmpty || pass.isEmpty) {
      setState(() => _error = 'Please enter your ID, org ID, and password');
      _triggerShake();
      return;
    }
    setState(() {
      _isLoading = true;
      _error = null;
    });
    final success = await ref.read(authProvider.notifier).login(
      id,
      pass,
      role: 'ORG_STAFF',
      orgId: org,
    );
    if (!mounted) return;
    
    if (!success) {
      final authState = ref.read(authProvider);
      String errorMessage = 'Invalid ID or password. Please try again.';
      
      if (authState is AsyncError) {
        errorMessage = authState.error.toString();
        // Remove 'Exception: ' prefix if present
        if (errorMessage.startsWith('Exception: ')) {
          errorMessage = errorMessage.substring(11);
        }
      }

      _failedAttempts++;
      setState(() {
        _isLoading = false;
        if (_failedAttempts >= 5) {
          _error = 'Too many attempts. Locked for 30 seconds.';
          _startLockout(30);
        } else if (_failedAttempts >= 3) {
          _error = '$errorMessage ${5 - _failedAttempts} attempts left.';
        } else {
          _error = errorMessage;
        }
      });
      _triggerShake();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // Animated background
          _AnimatedBackground(controller: _particleCtrl),

          // Content
          Center(
            child: FadeTransition(
              opacity: _fadeAnim,
              child: AnimatedBuilder(
                animation: _shakeAnim,
                builder: (context, child) {
                  final shakeX = _shakeAnim.value > 0
                      ? math.sin(_shakeAnim.value * math.pi * 8) * 12
                      : 0.0;
                  return Transform.translate(
                    offset: Offset(shakeX, 0),
                    child: child,
                  );
                },
                child: _buildCard(),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCard() {
    return Container(
      width: 440.w,
      padding: EdgeInsets.all(40.w),
      decoration: BoxDecoration(
        color: const Color(0xFF1E2235),
        borderRadius: BorderRadius.circular(24.r),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.4),
            blurRadius: 40,
            offset: const Offset(0, 20),
          ),
          BoxShadow(
            color: AppTheme.primaryOrange.withOpacity(0.05),
            blurRadius: 60,
            spreadRadius: 10,
          ),
        ],
        border: Border.all(color: Colors.white.withOpacity(0.07)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Logo
          Container(
            width: 72.w,
            height: 72.w,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppTheme.primaryOrange, Color(0xFFFF6B35)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(18.r),
              boxShadow: [
                BoxShadow(
                  color: AppTheme.primaryOrange.withOpacity(0.35),
                  blurRadius: 20,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: Icon(Icons.school, color: Colors.white, size: 36.w),
          ),
          SizedBox(height: 20.h),

          Text('EduHub Whiteboard',
              style: TextStyle(
                color: Colors.white,
                fontSize: 22.sp,
                fontWeight: FontWeight.bold,
                letterSpacing: -0.3,
              )),
          SizedBox(height: 4.h),
          Text('Sign in to your teaching workspace',
              style: TextStyle(color: Colors.white54, fontSize: 13.sp)),
          SizedBox(height: 32.h),

          // ID field
          _InputField(
            controller: _idController,
            label: 'Employee / Teacher ID',
            icon: Icons.badge_outlined,
            hint: 'e.g. TCH-2024-001',
            enabled: _lockoutSeconds == 0,
          ),
          SizedBox(height: 16.h),

          // Org ID field
          _InputField(
            controller: _orgController,
            label: 'Org ID',
            icon: Icons.apartment_outlined,
            hint: 'e.g. demo-org',
            enabled: _lockoutSeconds == 0,
          ),
          SizedBox(height: 16.h),

          // Password field
          _InputField(
            controller: _passController,
            label: 'Password',
            icon: Icons.lock_outline,
            hint: '••••••••',
            obscureText: _obscurePass,
            enabled: _lockoutSeconds == 0,
            suffix: IconButton(
              icon: Icon(
                _obscurePass ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                color: Colors.white38,
                size: 18.w,
              ),
              onPressed: () => setState(() => _obscurePass = !_obscurePass),
            ),
            onSubmitted: (_) => _submit(),
          ),
          SizedBox(height: 8.h),

          // Error message / lockout
          if (_lockoutSeconds > 0)
            _LockoutBar(seconds: _lockoutSeconds)
          else if (_error != null)
            _ErrorMessage(message: _error!),

          SizedBox(height: 24.h),

          // Submit button
          SizedBox(
            width: double.infinity,
            height: 48.h,
            child: ElevatedButton(
              onPressed: (_isLoading || _lockoutSeconds > 0) ? null : _submit,
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryOrange,
                foregroundColor: Colors.white,
                disabledBackgroundColor: Colors.grey.shade800,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12.r)),
                elevation: 4,
                shadowColor: AppTheme.primaryOrange.withOpacity(0.4),
              ),
              child: _isLoading
                  ? SizedBox(
                      width: 20.w,
                      height: 20.w,
                      child: const CircularProgressIndicator(
                          color: Colors.white, strokeWidth: 2))
                  : Text('Sign In',
                      style: TextStyle(
                          fontSize: 15.sp, fontWeight: FontWeight.bold)),
            ),
          ),
          SizedBox(height: 20.h),

          // Dev bypass
          GestureDetector(
            onTap: () {
              ref.read(authProvider.notifier).loginDev();
            },
            child: Text(
              'Dev Mode — Skip Login',
              style: TextStyle(
                color: Colors.white24,
                fontSize: 11.sp,
                decoration: TextDecoration.underline,
                decorationColor: Colors.white24,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Input Field ──────────────────────────────────────────────────────────────
class _InputField extends StatelessWidget {
  final TextEditingController controller;
  final String label;
  final IconData icon;
  final String hint;
  final bool obscureText;
  final bool enabled;
  final Widget? suffix;
  final Function(String)? onSubmitted;

  const _InputField({
    required this.controller,
    required this.label,
    required this.icon,
    required this.hint,
    this.obscureText = false,
    this.enabled = true,
    this.suffix,
    this.onSubmitted,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label,
            style: TextStyle(
                color: Colors.white60,
                fontSize: 11.sp,
                fontWeight: FontWeight.w500)),
        SizedBox(height: 6.h),
        Container(
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(10.r),
            border: Border.all(color: Colors.white.withOpacity(0.1)),
          ),
          child: TextField(
            controller: controller,
            obscureText: obscureText,
            enabled: enabled,
            onSubmitted: onSubmitted,
            style: TextStyle(color: Colors.white, fontSize: 14.sp),
            decoration: InputDecoration(
              hintText: hint,
              hintStyle: TextStyle(color: Colors.white24, fontSize: 13.sp),
              prefixIcon: Icon(icon, color: Colors.white38, size: 18.w),
              suffixIcon: suffix,
              border: InputBorder.none,
              contentPadding:
                  EdgeInsets.symmetric(horizontal: 16.w, vertical: 14.h),
            ),
          ),
        ),
      ],
    );
  }
}

// ─── Error Message ─────────────────────────────────────────────────────────────
class _ErrorMessage extends StatelessWidget {
  final String message;
  const _ErrorMessage({required this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(10.w),
      decoration: BoxDecoration(
        color: AppTheme.errorRed.withOpacity(0.12),
        borderRadius: BorderRadius.circular(8.r),
        border: Border.all(color: AppTheme.errorRed.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Icon(Icons.error_outline, color: AppTheme.errorRed, size: 16.w),
          SizedBox(width: 8.w),
          Expanded(
            child: Text(message,
                style: TextStyle(color: AppTheme.errorRed, fontSize: 12.sp)),
          ),
        ],
      ),
    );
  }
}

// ─── Lockout Bar ──────────────────────────────────────────────────────────────
class _LockoutBar extends StatelessWidget {
  final int seconds;
  const _LockoutBar({required this.seconds});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: EdgeInsets.all(10.w),
      decoration: BoxDecoration(
        color: Colors.amber.withOpacity(0.12),
        borderRadius: BorderRadius.circular(8.r),
        border: Border.all(color: Colors.amber.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Icon(Icons.timer_outlined, color: Colors.amber, size: 16.w),
          SizedBox(width: 8.w),
          Text('Account locked — wait ${seconds}s',
              style: TextStyle(color: Colors.amber, fontSize: 12.sp)),
        ],
      ),
    );
  }
}

// ─── Animated Background ──────────────────────────────────────────────────────
class _AnimatedBackground extends StatelessWidget {
  final AnimationController controller;
  const _AnimatedBackground({required this.controller});

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: controller,
      builder: (context, _) {
        return CustomPaint(
          size: Size.infinite,
          painter: _BackgroundPainter(controller.value),
        );
      },
    );
  }
}

class _BackgroundPainter extends CustomPainter {
  final double t;
  _BackgroundPainter(this.t);

  @override
  void paint(Canvas canvas, Size size) {
    // Gradient background
    final bgPaint = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [Color(0xFF0F1117), Color(0xFF1A1F35), Color(0xFF0F1117)],
      ).createShader(Rect.fromLTWH(0, 0, size.width, size.height));
    canvas.drawRect(Rect.fromLTWH(0, 0, size.width, size.height), bgPaint);

    // Animated gradient orb (top-right)
    final orbPaint1 = Paint()
      ..color = AppTheme.primaryOrange.withOpacity(0.08)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 80);
    final x1 = size.width * (0.7 + 0.1 * math.sin(t * 2 * math.pi));
    final y1 = size.height * (0.2 + 0.08 * math.cos(t * 2 * math.pi));
    canvas.drawCircle(Offset(x1, y1), 200, orbPaint1);

    // Orb 2 (bottom left)
    final orbPaint2 = Paint()
      ..color = const Color(0xFF3B82F6).withOpacity(0.07)
      ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 80);
    final x2 = size.width * (0.2 + 0.05 * math.cos(t * 2 * math.pi + 1));
    final y2 = size.height * (0.75 + 0.07 * math.sin(t * 2 * math.pi + 1));
    canvas.drawCircle(Offset(x2, y2), 180, orbPaint2);

    // Grid dots
    final dotPaint = Paint()
      ..color = Colors.white.withOpacity(0.025)
      ..strokeWidth = 1;
    const dotSpacing = 50.0;
    for (double x = 0; x < size.width; x += dotSpacing) {
      for (double y = 0; y < size.height; y += dotSpacing) {
        canvas.drawCircle(Offset(x, y), 1.5, dotPaint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _BackgroundPainter old) => old.t != t;
}
