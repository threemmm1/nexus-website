import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../shared/constants/app_colors.dart';
import '../../shared/constants/app_dimensions.dart';
import '../../shared/constants/app_durations.dart';
import '../../shared/constants/app_text_styles.dart';
import '../../shared/navigation/app_routes.dart';
import '../../shared/widgets/auth_header.dart';
import '../../shared/widgets/vesioh_button.dart';
import 'suggested_communities_viewmodel.dart';

class _Community {
  const _Community({
    required this.name,
    required this.description,
    required this.members,
  });
  final String name;
  final String description;
  final String members;
}

// PLACEHOLDER DATA — replace with a communities endpoint when available.
const _placeholderCommunities = [
  _Community(name: 'Valorant Africa', description: 'Ranked queues & scrims', members: '48K members'),
  _Community(name: 'Creator Lounge', description: 'Tips, collabs & feedback', members: '126K members'),
  _Community(name: 'Beat Makers', description: 'Share loops & samples', members: '31K members'),
  _Community(name: 'Indie Devs', description: 'Build in public', members: '19K members'),
];

class SuggestedCommunitiesScreen extends ConsumerWidget {
  const SuggestedCommunitiesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final joined = ref.watch(suggestedCommunitiesViewModelProvider);
    final viewModel = ref.read(suggestedCommunitiesViewModelProvider.notifier);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppDimensions.spacingLg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AuthHeader(
                title: 'Find your people',
                subtitle: 'Join communities to chat and catch events.',
                onBack: () => context.pop(),
              ),
              const SizedBox(height: AppDimensions.spacingLg),
              Expanded(
                child: ListView.separated(
                  itemCount: _placeholderCommunities.length,
                  separatorBuilder: (_, __) => const SizedBox(height: AppDimensions.spacingLg),
                  itemBuilder: (context, i) {
                    final community = _placeholderCommunities[i];
                    final isJoined = joined.contains(i);
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
                              Text(community.name, style: AppTextStyles.listTitle),
                              Text(community.description, style: AppTextStyles.body),
                              Text(
                                community.members,
                                style: AppTextStyles.bodyMuted.copyWith(
                                  color: const Color(0xFF636367),
                                ),
                              ),
                            ],
                          ),
                        ),
                        Semantics(
                          button: true,
                          label: isJoined ? 'Leave ${community.name}' : 'Join ${community.name}',
                          child: GestureDetector(
                            onTap: () => viewModel.toggle(i),
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: AppDurations.animFast),
                              padding: const EdgeInsets.symmetric(
                                horizontal: AppDimensions.chipPaddingH,
                                vertical: AppDimensions.chipPaddingV,
                              ),
                              decoration: BoxDecoration(
                                color: isJoined ? AppColors.primary : AppColors.textMuted,
                                borderRadius: const BorderRadius.all(
                                  Radius.circular(AppDimensions.chipRadius),
                                ),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    isJoined ? Icons.check : Icons.add,
                                    color: AppColors.white,
                                    size: AppDimensions.iconMd,
                                  ),
                                  const SizedBox(width: AppDimensions.spacingSm),
                                  Text(
                                    isJoined ? 'Joined' : 'Join',
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
                onPressed: () => context.go(AppRoutes.registrationComplete),
              ),
              const SizedBox(height: AppDimensions.spacingLg),
              Center(
                child: GestureDetector(
                  onTap: () => context.go(AppRoutes.registrationComplete),
                  child: const Text('Skip for now', style: AppTextStyles.buttonLink),
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
