import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../shared/constants/app_assets.dart';
import '../../shared/constants/app_colors.dart';
import '../../shared/constants/app_dimensions.dart';
import '../../shared/constants/app_durations.dart';
import '../../shared/constants/app_text_styles.dart';
import '../../shared/navigation/app_routes.dart';

// Three-phase animated welcome shown after completing registration.
// Phase 0 → logo scales in (frames 318:2524 / 318:2540).
// Phase 1 → tagline fades in beneath logo (frame 318:2556 / 300:1837).
// Phase 2 → auto-navigates to home.
class RegistrationCompleteScreen extends StatefulWidget {
  const RegistrationCompleteScreen({super.key});

  @override
  State<RegistrationCompleteScreen> createState() => _RegistrationCompleteScreenState();
}

class _RegistrationCompleteScreenState extends State<RegistrationCompleteScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _logoScale;

  bool _showTagline = false;

  @override
  void initState() {
    super.initState();

    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: AppDurations.splashLogoAnim),
    );

    _logoScale = CurvedAnimation(parent: _controller, curve: Curves.easeOutBack);

    _controller.forward();

    Future<void>.delayed(
      const Duration(milliseconds: AppDurations.splashTaglineDelay),
      () { if (mounted) setState(() => _showTagline = true); },
    );

    Future<void>.delayed(
      const Duration(milliseconds: AppDurations.splashNavDelay),
      () { if (mounted) context.go(AppRoutes.home); },
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppDimensions.spacingLg),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ScaleTransition(
                scale: _logoScale,
                child: Image.asset(
                  AppAssets.logoIcon,
                  width: AppDimensions.splashLogoSize,
                  height: AppDimensions.splashLogoSize,
                  fit: BoxFit.contain,
                ),
              ),
              const SizedBox(height: AppDimensions.spacingXxl),
              AnimatedOpacity(
                opacity: _showTagline ? 1.0 : 0.0,
                duration: const Duration(milliseconds: AppDurations.animSlow),
                child: const Text(
                  'Your feed is ready. Start exploring, creating, and connecting...',
                  style: AppTextStyles.body,
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
