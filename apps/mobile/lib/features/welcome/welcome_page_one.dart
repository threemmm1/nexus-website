import 'package:flutter/material.dart';
import '../../shared/constants/app_assets.dart';
import '../../shared/constants/app_dimensions.dart';
import '../../shared/constants/app_text_styles.dart';
import '../../shared/widgets/page_indicator.dart';
import '../../shared/widgets/sign_in_link.dart';
import '../../shared/widgets/vesioh_button.dart';
import '../../shared/widgets/vesioh_logo.dart';

class WelcomePageOne extends StatelessWidget {
  const WelcomePageOne({
    super.key,
    required this.onGetStarted,
    required this.onSignIn,
  });

  final VoidCallback onGetStarted;
  final VoidCallback onSignIn;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        const Positioned(
          top: AppDimensions.welcomeLogoTop,
          left: 0,
          right: 0,
          child: Center(
            child: VesiohLogo(variant: VesiohLogoVariant.iconOnly, iconSize: 40),
          ),
        ),
        Positioned(
          top: AppDimensions.welcomeIconGridTop,
          left: 0,
          right: 0,
          child: Image.asset(AppAssets.welcomeIconGrid, fit: BoxFit.fitWidth),
        ),
        const Positioned(
          top: AppDimensions.welcomeContentTop,
          left: AppDimensions.spacingLg,
          right: AppDimensions.spacingLg,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              PageIndicator(pageCount: 2, currentPage: 0),
              SizedBox(height: 32),
              Text(
                'Create. Connect. Earn.',
                style: AppTextStyles.displayTitle,
                textAlign: TextAlign.center,
              ),
              SizedBox(height: AppDimensions.spacingMd),
              Text(
                'Join a platform where creators, gamers, and communities come together to share content, build audiences, and unlock new opportunities.',
                style: AppTextStyles.body,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
        Positioned(
          top: AppDimensions.welcomeActionsTop,
          left: AppDimensions.spacingLg,
          right: AppDimensions.spacingLg,
          child: Column(
            children: [
              VesiohButton(label: 'Get started', onPressed: onGetStarted),
              const SizedBox(height: AppDimensions.spacingXxl),
              SignInLink(onSignIn: onSignIn),
            ],
          ),
        ),
      ],
    );
  }
}
