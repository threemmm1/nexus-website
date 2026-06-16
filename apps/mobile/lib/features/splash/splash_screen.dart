import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import '../../shared/constants/app_durations.dart';
import '../../shared/navigation/app_routes.dart';
import '../../shared/constants/app_colors.dart';
import '../../shared/widgets/vesioh_logo.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with TickerProviderStateMixin {
  late final AnimationController _iconFadeController;
  late final AnimationController _textFadeController;
  late final Animation<double> _iconFade;
  late final Animation<double> _textFade;

  bool _showText = false;

  @override
  void initState() {
    super.initState();
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);

    _iconFadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: AppDurations.splashIconFade),
    );
    _textFadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: AppDurations.splashTextFade),
    );

    _iconFade = CurvedAnimation(parent: _iconFadeController, curve: Curves.easeIn);
    _textFade = CurvedAnimation(parent: _textFadeController, curve: Curves.easeIn);

    _runSequence();
  }

  Future<void> _runSequence() async {
    await _iconFadeController.forward();
    await Future.delayed(const Duration(milliseconds: AppDurations.splashIconHold));

    if (!mounted) return;
    setState(() => _showText = true);
    await _textFadeController.forward();
    await Future.delayed(const Duration(milliseconds: AppDurations.splashTextHold));

    if (!mounted) return;
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    context.go(AppRoutes.welcome);
  }

  @override
  void dispose() {
    _iconFadeController.dispose();
    _textFadeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Center(
        child: FadeTransition(
          opacity: _iconFade,
          child: _showText
              ? FadeTransition(
                  opacity: _textFade,
                  child: const VesiohLogo(variant: VesiohLogoVariant.iconWithText, iconSize: 76),
                )
              : const VesiohLogo(variant: VesiohLogoVariant.iconOnly, iconSize: 76),
        ),
      ),
    );
  }
}
