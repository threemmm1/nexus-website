import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../shared/constants/app_constants.dart';
import '../../shared/constants/app_dimensions.dart';
import '../../shared/navigation/app_routes.dart';
import '../../shared/constants/app_colors.dart';
import '../../shared/constants/app_text_styles.dart';
import '../../shared/widgets/auth_header.dart';
import '../../shared/widgets/interest_chip.dart';
import '../../shared/widgets/vesioh_button.dart';
import 'interests_viewmodel.dart';

const _interests = [
  (label: 'Gaming', icon: Icons.sports_esports_outlined),
  (label: 'Music', icon: Icons.music_note_outlined),
  (label: 'Fitness', icon: Icons.fitness_center_outlined),
  (label: 'Entertainment', icon: Icons.movie_outlined),
  (label: 'Technology', icon: Icons.laptop_outlined),
  (label: 'Travel', icon: Icons.card_travel_outlined),
  (label: 'Finance', icon: Icons.bar_chart_outlined),
  (label: 'Beauty', icon: Icons.face_retouching_natural_outlined),
  (label: 'Photography', icon: Icons.camera_alt_outlined),
  (label: 'Comedy', icon: Icons.sentiment_satisfied_outlined),
  (label: 'Wellness', icon: Icons.self_improvement_outlined),
  (label: 'Sports', icon: Icons.sports_basketball_outlined),
  (label: 'Arts', icon: Icons.palette_outlined),
  (label: 'Streaming', icon: Icons.live_tv_outlined),
  (label: 'Crypto', icon: Icons.currency_bitcoin_outlined),
  (label: 'Pets', icon: Icons.pets_outlined),
  (label: 'Education', icon: Icons.menu_book_outlined),
  (label: 'Food', icon: Icons.restaurant_outlined),
];

class InterestsScreen extends ConsumerWidget {
  const InterestsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selected = ref.watch(interestsViewModelProvider);
    final viewModel = ref.watch(interestsViewModelProvider.notifier);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppDimensions.spacingLg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AuthHeader(
                title: 'What are you into?',
                subtitle: 'Pick at least ${AppConstants.interestsMinSelection}. This shapes your For You feed from day one.',
                onBack: () => context.pop(),
              ),
              const SizedBox(height: AppDimensions.spacingLg),
              Expanded(
                child: SingleChildScrollView(
                  child: Wrap(
                    spacing: AppDimensions.spacingSm,
                    runSpacing: AppDimensions.spacingSm,
                    children: _interests.map((item) {
                      return InterestChip(
                        label: item.label,
                        icon: item.icon,
                        selected: selected.contains(item.label),
                        onTap: () => viewModel.toggle(item.label),
                      );
                    }).toList(),
                  ),
                ),
              ),
              const SizedBox(height: AppDimensions.spacingLg),
              VesiohButton(
                label: 'Continue',
                onPressed:
                    viewModel.canContinue ? () => context.push(AppRoutes.suggestedCreators) : null,
              ),
              const SizedBox(height: AppDimensions.spacingLg),
              Center(
                child: GestureDetector(
                  onTap: () => context.push(AppRoutes.suggestedCreators),
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
