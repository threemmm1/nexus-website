import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';

import '../../shared/constants/app_colors.dart';
import '../../shared/constants/app_dimensions.dart';
import '../../shared/constants/app_text_styles.dart';
import '../../shared/navigation/app_routes.dart';
import '../../shared/widgets/auth_header.dart';
import '../../shared/widgets/vesioh_button.dart';
import 'profile_picture_viewmodel.dart';

class ProfilePictureScreen extends ConsumerWidget {
  const ProfilePictureScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(profilePictureViewModelProvider);
    final viewModel = ref.read(profilePictureViewModelProvider.notifier);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppDimensions.spacingLg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AuthHeader(
                title: 'Set a profile picture',
                subtitle: 'Want to be recognizable? Upload a selfie',
                onBack: () => context.pop(),
              ),
              const Spacer(),
              Center(
                child: Semantics(
                  label: 'Profile picture',
                  child: Container(
                    width: AppDimensions.avatarXl,
                    height: AppDimensions.avatarXl,
                    decoration: const BoxDecoration(
                      color: AppColors.textMuted,
                      borderRadius: BorderRadius.all(
                        Radius.circular(AppDimensions.avatarXl / 2),
                      ),
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: state.pickedFile != null
                        ? Image.file(File(state.pickedFile!.path), fit: BoxFit.cover)
                        : const Icon(
                            Icons.person,
                            color: Color(0xFF636367),
                            size: AppDimensions.avatarXl / 2,
                          ),
                  ),
                ),
              ),
              const Spacer(),
              VesiohButton(
                label: state.pickedFile != null ? 'Continue' : 'Add profile photo',
                isLoading: state.isUploading,
                onPressed: state.isUploading
                    ? null
                    : state.pickedFile != null
                        ? () async {
                            final ok = await viewModel.upload();
                            if (ok && context.mounted) {
                              context.go(AppRoutes.suggestedCommunities);
                            }
                          }
                        : () => viewModel.pickImage(ImageSource.gallery),
              ),
              const SizedBox(height: AppDimensions.spacingLg),
              Center(
                child: GestureDetector(
                  onTap: state.pickedFile != null
                      ? () => viewModel.pickImage(ImageSource.gallery)
                      : () => context.go(AppRoutes.suggestedCommunities),
                  child: Text(
                    state.pickedFile != null ? 'Change photo' : 'Skip for now',
                    style: AppTextStyles.buttonLink,
                  ),
                ),
              ),
              const SizedBox(height: AppDimensions.spacingXxl),
            ],
          ),
        ),
      ),
    );
  }
}
