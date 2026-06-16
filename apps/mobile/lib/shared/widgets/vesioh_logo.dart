import 'package:flutter/material.dart';
import '../constants/app_assets.dart';

enum VesiohLogoVariant { iconOnly, iconWithText }

// Aspect ratios derived from the original SVG viewport — do not change without updating assets.
const double _kIconWidthRatio = 118.068 / 76.881;
const double _kTextWidthRatio = 139.595 / 76.881;
const double _kTextHeightRatio = 14.644 / 76.881;
const double _kIconTextGap = 16.5;

class VesiohLogo extends StatelessWidget {
  const VesiohLogo({
    super.key,
    this.variant = VesiohLogoVariant.iconOnly,
    this.iconSize = 76.0,
  });

  final VesiohLogoVariant variant;
  final double iconSize;

  @override
  Widget build(BuildContext context) {
    final icon = Image.asset(
      AppAssets.logoIcon,
      width: iconSize * _kIconWidthRatio,
      height: iconSize,
      fit: BoxFit.contain,
    );

    if (variant == VesiohLogoVariant.iconOnly) return icon;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        icon,
        const SizedBox(height: _kIconTextGap),
        Image.asset(
          AppAssets.logoText,
          width: iconSize * _kTextWidthRatio,
          height: iconSize * _kTextHeightRatio,
          fit: BoxFit.contain,
        ),
      ],
    );
  }
}
