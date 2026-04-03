
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_dimensions.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../providers/login_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  late final TextEditingController _emailController;
  late final TextEditingController _passwordController;
  late final FocusNode _emailFocus;
  late final FocusNode _passwordFocus;

  @override
  void initState() {
    super.initState();
    _emailController    = TextEditingController();
    _passwordController = TextEditingController();
    _emailFocus         = FocusNode();
    _passwordFocus      = FocusNode();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Auto-redirect on successful login
    final loginState = ref.watch(loginNotifierProvider);
    if (loginState.state == LoginState.success) {
      context.go('/whiteboard');
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _emailFocus.dispose();
    _passwordFocus.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    final email    = _emailController.text.trim();
    final password = _passwordController.text;

    if (email.isEmpty || password.isEmpty) {
      _showError('Please enter email and password');
      return;
    }

    if (!email.contains('@')) {
      _showError('Please enter a valid email');
      return;
    }

    await ref.read(loginNotifierProvider.notifier).login(email, password);
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: AppColors.error,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final loginState = ref.watch(loginNotifierProvider);
    final isLoading  = loginState.state == LoginState.loading;

    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      body: GestureDetector(
        onTap: () => FocusScope.of(context).unfocus(),
        child: SingleChildScrollView(
          child: SizedBox(
            height: MediaQuery.of(context).size.height,
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 400),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Header
                      Text(
                        'Welcome to EduBoard Pro',
                        style: AppTextStyles.heading1,
                        textAlign: TextAlign.center,
                      ),
                      SizedBox(height: AppDimensions.borderRadiusL),
                      Text(
                        'Sign in to your coaching account',
                        style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
                        textAlign: TextAlign.center,
                      ),
                      SizedBox(height: AppDimensions.topBarHeight),

                      // Email Field
                      TextField(
                        controller: _emailController,
                        focusNode: _emailFocus,
                        enabled: !isLoading,
                        keyboardType: TextInputType.emailAddress,
                        textInputAction: TextInputAction.next,
                        onSubmitted: (_) => _passwordFocus.requestFocus(),
                        decoration: InputDecoration(
                          labelText: 'Email',
                          prefixIcon: const Icon(Icons.email),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
                            borderSide: BorderSide(color: AppColors.textTertiary.withOpacity(0.3)),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
                            borderSide: const BorderSide(color: AppColors.accentOrange, width: 2),
                          ),
                        ),
                      ),
                      SizedBox(height: AppDimensions.borderRadiusL),

                      // Password Field
                      TextField(
                        controller: _passwordController,
                        focusNode: _passwordFocus,
                        enabled: !isLoading,
                        obscureText: true,
                        textInputAction: TextInputAction.done,
                        onSubmitted: isLoading ? null : (_) => _handleLogin(),
                        decoration: InputDecoration(
                          labelText: 'Password',
                          prefixIcon: const Icon(Icons.lock),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
                            borderSide: BorderSide(color: AppColors.textTertiary.withOpacity(0.3)),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
                            borderSide: const BorderSide(color: AppColors.accentOrange, width: 2),
                          ),
                        ),
                      ),
                      SizedBox(height: AppDimensions.topBarHeight),

                      // Error Message
                      if (loginState.state == LoginState.failure && loginState.error != null)
                        Padding(
                          padding: EdgeInsets.only(bottom: AppDimensions.borderRadiusL),
                          child: Container(
                            padding: EdgeInsets.symmetric(
                              horizontal: AppDimensions.borderRadiusL,
                              vertical: AppDimensions.borderRadiusM,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.error.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
                              border: Border.all(color: AppColors.error.withOpacity(0.3)),
                            ),
                            child: Text(
                              loginState.error!.message,
                              style: AppTextStyles.body.copyWith(color: AppColors.error),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ),

                      // Login Button
                      ElevatedButton(
                        onPressed: isLoading ? null : _handleLogin,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.accentOrange,
                          disabledBackgroundColor: AppColors.accentOrange.withOpacity(0.5),
                          padding: EdgeInsets.symmetric(vertical: AppDimensions.borderRadiusL),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
                          ),
                        ),
                        child: isLoading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                  strokeWidth: 2,
                                ),
                              )
                            : Text(
                                'Sign In',
                                style: AppTextStyles.body.copyWith(
                                  color: AppColors.bgPrimary,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                      ),
                      SizedBox(height: AppDimensions.borderRadiusL * 2),

                      // Demo Credentials
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.info,
                            size: 16,
                            color: AppColors.textTertiary,
                          ),
                          SizedBox(width: AppDimensions.borderRadiusS),
                          Flexible(
                            child: Text(
                              'Demo: teacher@eduhub.in / password',
                              style: AppTextStyles.caption.copyWith(color: AppColors.textTertiary),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
