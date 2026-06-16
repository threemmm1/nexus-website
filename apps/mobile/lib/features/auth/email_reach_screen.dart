import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../shared/constants/app_dimensions.dart';
import '../../shared/constants/validators.dart';
import '../../shared/navigation/app_routes.dart';
import '../../shared/constants/app_colors.dart';
import '../../shared/constants/app_text_styles.dart';
import '../../shared/viewmodels/field_validation_viewmodel.dart';
import '../../shared/widgets/auth_header.dart';
import '../../shared/widgets/auth_text_field.dart';
import '../../shared/widgets/vesioh_button.dart';

final _emailViewModelProvider =
    fieldValidationViewModelProvider(Validators.isValidEmail);

class EmailReachScreen extends ConsumerStatefulWidget {
  const EmailReachScreen({super.key});

  @override
  ConsumerState<EmailReachScreen> createState() => _EmailReachScreenState();
}

class _EmailReachScreenState extends ConsumerState<EmailReachScreen> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    ref.watch(_emailViewModelProvider);
    final isValid = ref.watch(_emailViewModelProvider.notifier).isValid;

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
                subtitle: 'Enter your email address to continue.',
                onBack: () => context.pop(),
              ),
              const SizedBox(height: AppDimensions.spacingXxxl),
              AuthTextField(
                controller: _controller,
                hint: 'your@email.com',
                keyboardType: TextInputType.emailAddress,
                autofocus: true,
                onChanged: (value) =>
                    ref.read(_emailViewModelProvider.notifier).setValue(value),
              ),
              const SizedBox(height: AppDimensions.spacingMd),
              GestureDetector(
                onTap: () {
                  context.pop();
                  context.push(AppRoutes.phone);
                },
                child: const Text(
                  'Use phone instead',
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
