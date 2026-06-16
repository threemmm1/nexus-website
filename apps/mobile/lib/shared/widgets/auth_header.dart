import 'package:flutter/material.dart';
import '../constants/app_dimensions.dart';
import '../constants/app_colors.dart';
import '../constants/app_text_styles.dart';

class AuthHeader extends StatelessWidget {
  const AuthHeader({
    super.key,
    required this.title,
    required this.subtitle,
    required this.onBack,
  });

  final String title;
  final String subtitle;
  final VoidCallback onBack;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: AppDimensions.authHeaderTopPadding),
        Semantics(
          button: true,
          label: 'Go back',
          child: GestureDetector(
            onTap: onBack,
            child: const Icon(Icons.arrow_back, color: AppColors.white, size: AppDimensions.iconXl),
          ),
        ),
        const SizedBox(height: AppDimensions.spacingLg),
        Text(title, style: AppTextStyles.displayTitle),
        const SizedBox(height: AppDimensions.spacingMd),
        Text(subtitle, style: AppTextStyles.body),
      ],
    );
  }
}
