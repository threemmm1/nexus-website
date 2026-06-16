import 'package:flutter/material.dart';
import '../constants/app_dimensions.dart';
import '../constants/app_durations.dart';
import '../constants/app_colors.dart';
import '../constants/app_text_styles.dart';

class VesiohButton extends StatelessWidget {
  const VesiohButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.isLoading = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool isLoading;

  bool get _isDisabled => onPressed == null || isLoading;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: label,
      enabled: !_isDisabled,
      child: AnimatedOpacity(
        duration: const Duration(milliseconds: AppDurations.animFast),
        opacity: _isDisabled ? 0.4 : 1.0,
        child: SizedBox(
          width: double.infinity,
          child: TextButton(
            onPressed: isLoading ? null : onPressed,
            style: TextButton.styleFrom(
              backgroundColor: AppColors.white,
              padding: const EdgeInsets.symmetric(
                vertical: AppDimensions.buttonPaddingV,
                horizontal: AppDimensions.buttonPaddingH,
              ),
              shape: const RoundedRectangleBorder(
                borderRadius: BorderRadius.all(Radius.circular(AppDimensions.radiusPill)),
              ),
            ),
            child: isLoading
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: AppColors.black,
                    ),
                  )
                : Text(label, style: AppTextStyles.buttonPrimary),
          ),
        ),
      ),
    );
  }
}
