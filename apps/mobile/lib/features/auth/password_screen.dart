import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../shared/constants/app_colors_extended.dart';
import '../../shared/constants/app_dimensions.dart';
import '../../shared/constants/app_durations.dart';
import '../../shared/navigation/app_routes.dart';
import '../../shared/constants/app_colors.dart';
import '../../shared/constants/app_text_styles.dart';
import '../../shared/widgets/auth_header.dart';
import '../../shared/widgets/auth_text_field.dart';
import '../../shared/widgets/vesioh_button.dart';
import 'password_viewmodel.dart';

Color _strengthColor(PasswordStrength strength) => switch (strength) {
      PasswordStrength.weak => AppColorsExtended.error,
      PasswordStrength.good => AppColorsExtended.warning,
      PasswordStrength.strong => AppColorsExtended.success,
      PasswordStrength.none => AppColors.textMutedTransparent,
    };

String _strengthLabel(PasswordStrength strength) => switch (strength) {
      PasswordStrength.weak => 'Weak',
      PasswordStrength.good => 'Good!',
      PasswordStrength.strong => 'Strong!',
      PasswordStrength.none => '',
    };

double _strengthFraction(PasswordStrength strength) => switch (strength) {
      PasswordStrength.weak => 0.25,
      PasswordStrength.good => 0.65,
      PasswordStrength.strong => 1.0,
      PasswordStrength.none => 0.0,
    };

class PasswordScreen extends ConsumerStatefulWidget {
  const PasswordScreen({super.key});

  @override
  ConsumerState<PasswordScreen> createState() => _PasswordScreenState();
}

class _PasswordScreenState extends ConsumerState<PasswordScreen> {
  final _controller = TextEditingController();
  bool _obscure = true;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Widget _rule(bool met, String text) {
    return Row(
      children: [
        Icon(
          met ? Icons.check_circle : Icons.circle_outlined,
          size: AppDimensions.iconMd,
          color: met ? AppColors.primary : AppColors.textMuted,
        ),
        const SizedBox(width: AppDimensions.spacingSm),
        Text(text, style: AppTextStyles.body),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final viewModel = ref.watch(passwordViewModelProvider.notifier);
    ref.watch(passwordViewModelProvider);
    final strength = viewModel.strength;
    final label = _strengthLabel(strength);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppDimensions.spacingLg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AuthHeader(
                title: 'Secure your account',
                subtitle: 'Create a password to keep your account safe.',
                onBack: () => context.pop(),
              ),
              const SizedBox(height: AppDimensions.spacingXxxl),
              AuthTextField(
                controller: _controller,
                hint: 'Enter your password',
                obscureText: _obscure,
                autofocus: true,
                onChanged: (value) => viewModel.setValue(value),
                suffix: Icon(
                  _obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                  color: AppColors.white,
                  size: AppDimensions.iconLg,
                ),
                onSuffixTap: () => setState(() => _obscure = !_obscure),
              ),
              const SizedBox(height: AppDimensions.spacingXl),
              _rule(viewModel.hasLength, '8 characters (20 max)'),
              const SizedBox(height: AppDimensions.spacingSm),
              _rule(viewModel.hasAlphaNum, '1 alphabet and 1 number'),
              const SizedBox(height: AppDimensions.spacingSm),
              _rule(viewModel.hasSpecial, r'A special character e.g. @ $ _ # *'),
              const SizedBox(height: AppDimensions.spacingXl),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Text('Password strength', style: AppTextStyles.body),
                  if (label.isNotEmpty)
                    Text(
                      label,
                      style: AppTextStyles.body.copyWith(color: _strengthColor(strength)),
                    ),
                ],
              ),
              const SizedBox(height: AppDimensions.spacingSm),
              ClipRRect(
                borderRadius: const BorderRadius.all(Radius.circular(AppDimensions.radiusSm)),
                child: SizedBox(
                  height: AppDimensions.strengthBarHeight,
                  child: Stack(
                    children: [
                      Container(color: AppColors.textMuted),
                      FractionallySizedBox(
                        widthFactor: _strengthFraction(strength),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: AppDurations.animMed),
                          color: _strengthColor(strength),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const Spacer(),
              VesiohButton(
                label: 'Continue',
                onPressed: strength != PasswordStrength.none && strength != PasswordStrength.weak
                    ? () => context.push(AppRoutes.interests)
                    : null,
              ),
              const SizedBox(height: AppDimensions.spacingXxl),
            ],
          ),
        ),
      ),
    );
  }
}
