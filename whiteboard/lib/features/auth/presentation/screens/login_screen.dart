
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
  late final TextEditingController _loginIdController;
  late final TextEditingController _passwordController;
  late final FocusNode _loginIdFocus;
  late final FocusNode _passwordFocus;

  @override
  void initState() {
    super.initState();
    _loginIdController  = TextEditingController();
    _passwordController = TextEditingController();
    _loginIdFocus       = FocusNode();
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
    _loginIdController.dispose();
    _passwordController.dispose();
    _loginIdFocus.dispose();
    _passwordFocus.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    final loginId  = _loginIdController.text.trim();
    final password = _passwordController.text;

    if (loginId.isEmpty || password.isEmpty) {
      _showError('Please enter ID and password');
      return;
    }

    await ref.read(loginNotifierProvider.notifier).login(loginId, password);
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
                      const SizedBox(height: AppDimensions.borderRadiusL),
                      Text(
                        'Sign in to your coaching account',
                        style: AppTextStyles.body.copyWith(color: AppColors.textSecondary),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: AppDimensions.topBarHeight),

                      // Login ID Field
                      TextField(
                        controller: _loginIdController,
                        focusNode: _loginIdFocus,
                        enabled: !isLoading,
                        keyboardType: TextInputType.text,
                        textInputAction: TextInputAction.next,
                        onSubmitted: (_) => _passwordFocus.requestFocus(),
                        decoration: InputDecoration(
                          labelText: 'Whiteboard ID',
                          prefixIcon: const Icon(Icons.person),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
                            borderSide: BorderSide(color: AppColors.textTertiary.withValues(alpha: 0.3)),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
                            borderSide: const BorderSide(color: AppColors.accentOrange, width: 2),
                          ),
                        ),
                      ),
                      const SizedBox(height: AppDimensions.borderRadiusL),

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
                            borderSide: BorderSide(color: AppColors.textTertiary.withValues(alpha: 0.3)),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
                            borderSide: const BorderSide(color: AppColors.accentOrange, width: 2),
                          ),
                        ),
                      ),
                      const SizedBox(height: AppDimensions.topBarHeight),

                      // Error Message
                      if (loginState.state == LoginState.failure && loginState.error != null)
                        Padding(
                          padding: const EdgeInsets.only(bottom: AppDimensions.borderRadiusL),
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: AppDimensions.borderRadiusL,
                              vertical: AppDimensions.borderRadiusM,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.error.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
                              border: Border.all(color: AppColors.error.withValues(alpha: 0.3)),
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
                          disabledBackgroundColor: AppColors.accentOrange.withValues(alpha: 0.5),
                          padding: const EdgeInsets.symmetric(vertical: AppDimensions.borderRadiusL),
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
                      const SizedBox(height: AppDimensions.borderRadiusL),

                      // Development Bypass Button
                      OutlinedButton(
                        onPressed: isLoading
                            ? null
                            : () => ref.read(loginNotifierProvider.notifier).devLogin(),
                        style: OutlinedButton.styleFrom(
                          side: BorderSide(color: AppColors.accentOrange.withValues(alpha: 0.5)),
                          padding: const EdgeInsets.symmetric(vertical: AppDimensions.borderRadiusL),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
                          ),
                        ),
                        child: Text(
                          'Quick Dev Login',
                          style: AppTextStyles.body.copyWith(
                            color: AppColors.accentOrange,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                      const SizedBox(height: AppDimensions.borderRadiusL * 2),

                      // Demo Credentials
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(
                            Icons.info,
                            size: 16,
                            color: AppColors.textTertiary,
                          ),
                          const SizedBox(width: AppDimensions.borderRadiusS),
                          Flexible(
                            child: Text(
                              'Contact Super Admin for your credentials',
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
