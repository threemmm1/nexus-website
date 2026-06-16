import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../shared/constants/app_constants.dart';
import '../../shared/constants/app_dimensions.dart';
import '../../shared/navigation/app_routes.dart';
import '../../shared/constants/app_colors.dart';
import '../../shared/constants/app_text_styles.dart';
import '../../shared/widgets/auth_header.dart';
import '../../shared/widgets/otp_field.dart';
import '../../shared/widgets/vesioh_button.dart';
import 'verify_code_viewmodel.dart';

class VerifyCodeScreen extends ConsumerWidget {
  const VerifyCodeScreen({super.key, required this.destination});

  final String destination;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(verifyCodeViewModelProvider);
    final viewModel = ref.watch(verifyCodeViewModelProvider.notifier);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppDimensions.spacingLg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AuthHeader(
                title: 'Check your inbox',
                subtitle: 'Enter the ${AppConstants.otpLength}-digit code sent to $destination',
                onBack: () => context.pop(),
              ),
              const SizedBox(height: AppDimensions.spacingXxxl),
              OtpField(
                length: AppConstants.otpLength,
                onCompleted: viewModel.setOtp,
              ),
              const SizedBox(height: AppDimensions.spacingLg),
              state.retrySeconds > 0
                  ? Text.rich(
                      TextSpan(
                        style: AppTextStyles.bodyMuted,
                        children: [
                          const TextSpan(text: "Didn't receive code? Retry in "),
                          TextSpan(
                            text: '${state.retrySeconds}s',
                            style: AppTextStyles.body,
                          ),
                        ],
                      ),
                    )
                  : GestureDetector(
                      onTap: viewModel.resend,
                      child: const Text(
                        'Resend code',
                        style: AppTextStyles.bodyLink,
                      ),
                    ),
              const Spacer(),
              VesiohButton(
                label: 'Continue',
                onPressed: state.otp.length == AppConstants.otpLength
                    ? () => context.push(AppRoutes.username)
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
