import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../shared/constants/app_dimensions.dart';
import '../../shared/constants/app_durations.dart';
import '../../shared/navigation/app_routes.dart';
import '../../shared/constants/app_colors.dart';
import '../../shared/constants/app_text_styles.dart';
import '../../shared/widgets/auth_header.dart';
import '../../shared/widgets/vesioh_button.dart';
import 'suggested_creators_viewmodel.dart';

class _Creator {
  const _Creator({required this.name, required this.handle, required this.followers});
  final String name;
  final String handle;
  final String followers;
}

// PLACEHOLDER DATA — there is no suggested-creators endpoint on the backend yet.
// Replace with UserRepository.getSuggestedCreators() (AsyncValue-driven) once that
// endpoint exists. Do not treat this list as real user data.
const _placeholderCreators = [
  _Creator(name: 'Novaplays', handle: '@nova', followers: '2.1M followers'),
  _Creator(name: 'Lyra', handle: '@lyrabeats', followers: '890K followers'),
  _Creator(name: 'Kojofit', handle: '@kojofit', followers: '430K followers'),
  _Creator(name: 'Zara', handle: '@zaradraws', followers: '210K followers'),
  _Creator(name: 'Mako', handle: '@makobeats', followers: '98K followers'),
];

class SuggestedCreatorsScreen extends ConsumerWidget {
  const SuggestedCreatorsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final following = ref.watch(suggestedCreatorsViewModelProvider);
    final viewModel = ref.watch(suggestedCreatorsViewModelProvider.notifier);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppDimensions.spacingLg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AuthHeader(
                title: 'Follow a few creators',
                subtitle: "Start building a feed you'll actually enjoy.",
                onBack: () => context.pop(),
              ),
              const SizedBox(height: AppDimensions.spacingLg),
              Expanded(
                child: ListView.separated(
                  itemCount: _placeholderCreators.length,
                  separatorBuilder: (_, __) => const SizedBox(height: AppDimensions.spacingLg),
                  itemBuilder: (context, i) {
                    final creator = _placeholderCreators[i];
                    final isFollowing = following.contains(i);
                    return Row(
                      children: [
                        Container(
                          width: AppDimensions.avatarMd,
                          height: AppDimensions.avatarMd,
                          decoration: const BoxDecoration(
                            color: AppColors.textMuted,
                            borderRadius: BorderRadius.all(
                              Radius.circular(AppDimensions.radiusCircle),
                            ),
                          ),
                        ),
                        const SizedBox(width: AppDimensions.spacingMd),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                creator.name,
                                style: AppTextStyles.listTitle,
                              ),
                              Text(
                                creator.handle,
                                style: AppTextStyles.bodyMuted,
                              ),
                              Text(
                                creator.followers,
                                style: AppTextStyles.bodyMuted,
                              ),
                            ],
                          ),
                        ),
                        Semantics(
                          button: true,
                          label: isFollowing ? 'Unfollow ${creator.name}' : 'Follow ${creator.name}',
                          child: GestureDetector(
                            onTap: () => viewModel.toggle(i),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: AppDurations.animFast),
                              padding: const EdgeInsets.symmetric(
                                horizontal: AppDimensions.chipPaddingH,
                                vertical: AppDimensions.chipPaddingV,
                              ),
                              decoration: BoxDecoration(
                                color: isFollowing ? AppColors.primary : AppColors.textMuted,
                                borderRadius: const BorderRadius.all(
                                  Radius.circular(AppDimensions.chipRadius),
                                ),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    isFollowing ? Icons.check : Icons.add,
                                    color: AppColors.white,
                                    size: AppDimensions.iconMd,
                                  ),
                                  const SizedBox(width: AppDimensions.spacingSm),
                                  Text(
                                    isFollowing ? 'Following' : 'Follow',
                                    style: AppTextStyles.buttonSecondary,
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    );
                  },
                ),
              ),
              const SizedBox(height: AppDimensions.spacingLg),
              VesiohButton(
                label: 'Continue',
                onPressed: () => context.go(AppRoutes.home),
              ),
              const SizedBox(height: AppDimensions.spacingLg),
              Center(
                child: GestureDetector(
                  onTap: () => context.go(AppRoutes.home),
                  child: const Text(
                    'Skip for now',
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
