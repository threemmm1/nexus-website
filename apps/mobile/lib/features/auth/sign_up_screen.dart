import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../shared/constants/app_dimensions.dart';
import '../../shared/navigation/app_routes.dart';
import '../../shared/constants/app_colors.dart';
import '../../shared/constants/app_text_styles.dart';
import '../../shared/widgets/sign_in_link.dart';
import '../../shared/widgets/social_button.dart';

class SignUpScreen extends StatelessWidget {
  const SignUpScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppDimensions.spacingLg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: AppDimensions.signupHeaderTopPadding),
              const Text('Create your account', style: AppTextStyles.displayTitle),
              const SizedBox(height: AppDimensions.spacingMd),
              const Text(
                'Join creators, communities, and conversations happening on Vesioh.',
                style: AppTextStyles.body,
              ),
              const SizedBox(height: AppDimensions.signupMethodsTopSpacing),
              SocialButton(
                label: 'Use phone or email',
                icon: const Icon(Icons.person_outline, color: AppColors.white, size: AppDimensions.iconMd),
                onPressed: () => context.push(AppRoutes.email),
              ),
              const SizedBox(height: AppDimensions.spacingSm),
              const SocialButton(
                label: 'Continue with Google',
                icon: Icon(Icons.g_mobiledata, color: AppColors.white, size: AppDimensions.iconLg),
                onPressed: null,
              ),
              const SizedBox(height: AppDimensions.spacingSm),
              const SocialButton(
                label: 'Continue with Apple',
                icon: Icon(Icons.apple, color: AppColors.white, size: AppDimensions.iconMd),
                onPressed: null,
              ),
              const SizedBox(height: AppDimensions.spacingXxl),
              SignInLink(onSignIn: () => context.push(AppRoutes.login)),
              const Spacer(),
              const Text(
                'By continuing, you agree to our Terms and Privacy Policy to learn how we '
                'collect, use and share your data.',
                style: AppTextStyles.bodyMuted,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppDimensions.spacingXxl),
            ],
          ),
        ),
      ),
    );
  }
}
