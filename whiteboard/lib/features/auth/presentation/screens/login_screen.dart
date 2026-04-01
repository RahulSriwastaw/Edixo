
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:eduhub_whiteboard/core/constants/app_colors.dart';
import 'package:eduhub_whiteboard/core/constants/app_dimensions.dart';
import 'package:eduhub_whiteboard/core/constants/app_text_styles.dart';
import '../providers/login_provider.dart';

class LoginScreen extends ConsumerWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: AppColors.bgPrimary,
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 320),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('EduBoard Pro', 
                style: AppTextStyles.heading1, 
                textAlign: TextAlign.center,
              ),
              SizedBox(height: AppDimensions.topBarHeight),
              TextField(
                decoration: InputDecoration(
                  labelText: 'Email',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
                  ),
                ),
              ),
              SizedBox(height: AppDimensions.borderRadiusL),
              TextField(
                obscureText: true,
                decoration: InputDecoration(
                  labelText: 'Password',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
                  ),
                ),
              ),
              SizedBox(height: AppDimensions.stylePanelWidth / 10),
              ElevatedButton(
                onPressed: () {
                  // TODO: Implement login logic
                  ref.read(loginProvider.notifier).login('test@eduhub.in', 'password');
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.accentOrange,
                  padding: EdgeInsets.symmetric(vertical: AppDimensions.borderRadiusL),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppDimensions.borderRadiusM),
                  ),
                ),
                child: ref.watch(loginProvider).isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : Text('Login', style: AppTextStyles.body.copyWith(color: AppColors.textPrimary)),
              ),
              if (ref.watch(loginProvider).failure != null)
                Padding(
                  padding: EdgeInsets.only(top: AppDimensions.borderRadiusL),
                  child: Text(
                    ref.watch(loginProvider).failure!.message,
                    style: AppTextStyles.body.copyWith(color: AppColors.error),
                    textAlign: TextAlign.center,
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
