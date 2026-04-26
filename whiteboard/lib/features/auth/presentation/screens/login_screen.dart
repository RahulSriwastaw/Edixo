import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_theme_colors.dart';
import '../../../../core/theme/app_theme_text_styles.dart';
import '../../../../core/theme/app_theme_dimensions.dart';
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
    final theme = AppThemeColors.of(context);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: theme.error,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final loginState = ref.watch(loginNotifierProvider);
    final isLoading  = loginState.state == LoginState.loading;
    final theme = AppThemeColors.of(context);
    
    return Scaffold(
      backgroundColor: theme.bgBody,
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
                        style: AppThemeTextStyles.heading1(context),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Sign in to your coaching account',
                        style: AppThemeTextStyles.body(context).copyWith(color: theme.textSecondary),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 40),

                      // Login ID Field
                      TextField(
                        controller: _loginIdController,
                        focusNode: _loginIdFocus,
                        enabled: !isLoading,
                        keyboardType: TextInputType.text,
                        textInputAction: TextInputAction.next,
                        onSubmitted: (_) => _passwordFocus.requestFocus(),
                        style: AppThemeTextStyles.body(context),
                        decoration: InputDecoration(
                          labelText: 'Whiteboard ID',
                          labelStyle: AppThemeTextStyles.bodySmall(context),
                          prefixIcon: Icon(Icons.person, color: theme.textMuted, size: 20),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(AppThemeDimensions.borderRadiusButton),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(AppThemeDimensions.borderRadiusButton),
                            borderSide: BorderSide(color: theme.borderInput),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(AppThemeDimensions.borderRadiusButton),
                            borderSide: const BorderSide(color: AppThemeColors.primaryAccent, width: 2),
                          ),
                          filled: true,
                          fillColor: theme.bgInput,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Password Field
                      TextField(
                        controller: _passwordController,
                        focusNode: _passwordFocus,
                        enabled: !isLoading,
                        obscureText: true,
                        textInputAction: TextInputAction.done,
                        onSubmitted: isLoading ? null : (_) => _handleLogin(),
                        style: AppThemeTextStyles.body(context),
                        decoration: InputDecoration(
                          labelText: 'Password',
                          labelStyle: AppThemeTextStyles.bodySmall(context),
                          prefixIcon: Icon(Icons.lock, color: theme.textMuted, size: 20),
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(AppThemeDimensions.borderRadiusButton),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(AppThemeDimensions.borderRadiusButton),
                            borderSide: BorderSide(color: theme.borderInput),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(AppThemeDimensions.borderRadiusButton),
                            borderSide: const BorderSide(color: AppThemeColors.primaryAccent, width: 2),
                          ),
                          filled: true,
                          fillColor: theme.bgInput,
                          contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                        ),
                      ),
                      const SizedBox(height: 32),

                      // Error Message
                      if (loginState.state == LoginState.failure && loginState.error != null)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 10,
                            ),
                            decoration: BoxDecoration(
                              color: theme.badgeErrorBg,
                              borderRadius: BorderRadius.circular(AppThemeDimensions.borderRadiusM),
                              border: Border.all(color: theme.error.withValues(alpha: 0.3)),
                            ),
                            child: Text(
                              loginState.error!.message,
                              style: AppThemeTextStyles.body(context).copyWith(color: theme.error),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ),

                      // Login Button
                      ElevatedButton(
                        onPressed: isLoading ? null : _handleLogin,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppThemeColors.primaryAccent,
                          foregroundColor: Colors.white,
                          disabledBackgroundColor: AppThemeColors.primaryAccent.withValues(alpha: 0.5),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(AppThemeDimensions.borderRadiusButton),
                          ),
                          elevation: 0,
                          minimumSize: const Size(double.infinity, 40),
                        ),
                        child: isLoading
                            ? const SizedBox(
                                height: 18,
                                width: 18,
                                child: CircularProgressIndicator(
                                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                  strokeWidth: 2,
                                ),
                              )
                            : Text(
                                'Sign In',
                                style: AppThemeTextStyles.button(context).copyWith(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                      ),
                      const SizedBox(height: 12),

                      // Development Bypass Button
                      OutlinedButton(
                        onPressed: isLoading
                            ? null
                            : () => ref.read(loginNotifierProvider.notifier).devLogin(),
                        style: OutlinedButton.styleFrom(
                          side: BorderSide(color: theme.btnSecondaryBorder),
                          foregroundColor: theme.btnSecondaryText,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(AppThemeDimensions.borderRadiusButton),
                          ),
                        ),
                        child: Text(
                          'Quick Dev Login',
                          style: AppThemeTextStyles.button(context).copyWith(
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                      const SizedBox(height: 32),

                      // Demo Credentials
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.info,
                            size: 14,
                            color: theme.textMuted,
                          ),
                          const SizedBox(width: 6),
                          Flexible(
                            child: Text(
                              'Contact Super Admin for your credentials',
                              style: AppThemeTextStyles.caption(context),
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
