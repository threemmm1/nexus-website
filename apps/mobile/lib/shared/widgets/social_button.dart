import 'package:flutter/material.dart';
import '../constants/app_dimensions.dart';
import '../constants/app_durations.dart';
import '../constants/app_colors.dart';
import '../constants/app_text_styles.dart';

class SocialButton extends StatelessWidget {
  const SocialButton({
    super.key,
    required this.label,
    required this.icon,
    required this.onPressed,
  });

  final String label;
  final Widget icon;
  final VoidCallback? onPressed;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: label,
      enabled: onPressed != null,
      child: AnimatedOpacity(
        duration: const Duration(milliseconds: AppDurations.animFast),
        opacity: onPressed != null ? 1.0 : 0.4,
        child: SizedBox(
          width: double.infinity,
          child: TextButton(
            onPressed: onPressed,
            style: TextButton.styleFrom(
              backgroundColor: AppColors.textMuted,
              padding: const EdgeInsets.symmetric(
                vertical: AppDimensions.socialButtonPaddingV,
                horizontal: AppDimensions.socialButtonPaddingH,
              ),
              shape: const RoundedRectangleBorder(
                borderRadius: BorderRadius.all(Radius.circular(AppDimensions.socialButtonRadius)),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                icon,
                const SizedBox(width: AppDimensions.spacingSm),
                Text(label, style: AppTextStyles.buttonSecondary),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
