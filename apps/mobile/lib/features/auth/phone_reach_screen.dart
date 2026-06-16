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
import '../../shared/widgets/auth_text_field.dart';
import '../../shared/widgets/vesioh_button.dart';

final _phoneViewModelProvider =
    fieldValidationViewModelProvider(Validators.isValidPhone);

class PhoneReachScreen extends ConsumerStatefulWidget {
  const PhoneReachScreen({super.key});

  @override
  ConsumerState<PhoneReachScreen> createState() => _PhoneReachScreenState();
}

class _PhoneReachScreenState extends ConsumerState<PhoneReachScreen> {
  final _controller = TextEditingController();
  final String _dialCode = AppConstants.defaultDialCode;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    ref.watch(_phoneViewModelProvider);
    final isValid = ref.watch(_phoneViewModelProvider.notifier).isValid;

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppDimensions.spacingLg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AuthHeader(
                title: 'How can we reach you?',
                subtitle: 'Enter your phone number to continue.',
                onBack: () => context.pop(),
              ),
              const SizedBox(height: AppDimensions.spacingXxxl),
              AuthTextField(
                controller: _controller,
                hint: 'Enter phone number',
                keyboardType: TextInputType.phone,
                autofocus: true,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                onChanged: (value) =>
                    ref.read(_phoneViewModelProvider.notifier).setValue(value),
                prefix: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(_dialCode, style: AppTextStyles.inputText),
                    const SizedBox(width: AppDimensions.spacingXs),
                    const Icon(
                      Icons.keyboard_arrow_down,
                      color: AppColors.white,
                      size: AppDimensions.iconMd,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppDimensions.spacingMd),
              GestureDetector(
                onTap: () => context.pop(),
                child: const Text(
                  'Use email instead',
                  style: AppTextStyles.bodyLink,
                ),
              ),
              const Spacer(),
              VesiohButton(
                label: 'Continue',
                onPressed: isValid ? () => context.push(AppRoutes.birthday) : null,
              ),
              const SizedBox(height: AppDimensions.spacingXxl),
            ],
          ),
        ),
      ),
    );
  }
}
