import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../shared/constants/app_constants.dart';
import '../../shared/constants/app_dimensions.dart';
import '../../shared/constants/validators.dart';
import '../../shared/navigation/app_routes.dart';
import '../../shared/constants/app_colors.dart';
import '../../shared/constants/app_text_styles.dart';
import '../../shared/viewmodels/field_validation_viewmodel.dart';
import '../../shared/widgets/auth_header.dart';
import '../../shared/widgets/vesioh_button.dart';

final _usernameViewModelProvider =
    fieldValidationViewModelProvider(Validators.isValidUsername);

class UsernameScreen extends ConsumerStatefulWidget {
  const UsernameScreen({super.key});

  @override
  ConsumerState<UsernameScreen> createState() => _UsernameScreenState();
}

class _UsernameScreenState extends ConsumerState<UsernameScreen> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    ref.watch(_usernameViewModelProvider);
    final isValid = ref.watch(_usernameViewModelProvider.notifier).isValid;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppDimensions.spacingLg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AuthHeader(
                title: "What's your username?",
                subtitle: "This is how you'll appear across Vesioh.",
                onBack: () => context.pop(),
              ),
              const SizedBox(height: AppDimensions.spacingXxxl),
              Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const Text('@', style: AppTextStyles.inputText),
                  const SizedBox(width: AppDimensions.spacingSm),
                  Expanded(
                    child: TextField(
                      controller: _controller,
                      autofocus: true,
                      style: AppTextStyles.inputText,
                      maxLength: AppConstants.usernameMaxLength,
                      inputFormatters: [
                        FilteringTextInputFormatter.allow(Validators.usernameCharFilter),
                      ],
                      decoration: const InputDecoration(
                        hintText: 'yourhandle',
                        hintStyle: AppTextStyles.inputHint,
                        border: InputBorder.none,
                        isDense: true,
                        contentPadding: EdgeInsets.zero,
                        counterText: '',
                      ),
                      cursorColor: AppColors.primary,
                      onChanged: (value) =>
                          ref.read(_usernameViewModelProvider.notifier).setValue(value),
                    ),
                  ),
                  Semantics(
                    label: isValid ? 'Username format valid' : 'Username invalid',
                    child: Icon(
                      isValid ? Icons.check_circle : Icons.circle_outlined,
                      color: isValid ? AppColors.primary : AppColors.textMuted,
                      size: AppDimensions.iconSm,
                    ),
                  ),
                ],
              ),
              const Divider(color: AppColors.textMuted, thickness: 1, height: AppDimensions.spacingXxl),
              const Spacer(),
              VesiohButton(
                label: 'Continue',
                onPressed: isValid ? () => context.push(AppRoutes.password) : null,
              ),
              const SizedBox(height: AppDimensions.spacingXxl),
            ],
          ),
        ),
      ),
    );
  }
}
