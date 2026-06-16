import 'package:flutter/material.dart';
import '../constants/app_dimensions.dart';
import '../constants/app_durations.dart';
import '../constants/app_colors.dart';
import '../constants/app_text_styles.dart';

class InterestChip extends StatelessWidget {
  const InterestChip({
    super.key,
    required this.label,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: label,
      selected: selected,
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: AppDurations.animFast),
          padding: const EdgeInsets.symmetric(
            horizontal: AppDimensions.chipPaddingH,
            vertical: AppDimensions.chipPaddingV,
          ),
          decoration: BoxDecoration(
            color: selected ? AppColors.primary : AppColors.textMuted,
            borderRadius: const BorderRadius.all(Radius.circular(AppDimensions.chipRadius)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, color: AppColors.white, size: AppDimensions.iconMd),
              const SizedBox(width: AppDimensions.spacingSm),
              Text(label, style: AppTextStyles.buttonSecondary),
            ],
          ),
        ),
      ),
    );
  }
}
