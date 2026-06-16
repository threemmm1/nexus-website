import 'package:flutter/material.dart';
import '../../shared/constants/app_dimensions.dart';
import '../../shared/constants/app_text_styles.dart';
import '../../shared/widgets/marquee_tag_row.dart';
import '../../shared/widgets/page_indicator.dart';
import '../../shared/widgets/sign_in_link.dart';
import '../../shared/widgets/vesioh_button.dart';
import '../../shared/widgets/vesioh_logo.dart';

class WelcomePageTwo extends StatelessWidget {
  const WelcomePageTwo({
    super.key,
    required this.onGetStarted,
    required this.onSignIn,
  });

  final VoidCallback onGetStarted;
  final VoidCallback onSignIn;

  static const _row1 = ['Football', 'Gaming', 'Anime', 'Music', 'Valorant', 'Business', 'EA FC', 'Marketplace'];
  static const _row2 = ['Music', 'Fitness', 'Travel', 'Comedy', 'Streaming', 'Crypto', 'Wellness', 'Pets'];
  static const _row3 = ['Marketplace', 'Earn', 'Chats', 'Livestream', 'Esports', 'Arts', 'Photography', 'Food'];
  static const _row4 = ['Gaming', 'Anime', 'Football', 'Valorant', 'Business', 'EA FC', 'Education', 'Beauty'];

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        const Positioned(
          top: AppDimensions.welcomeLogoTop,
          left: 0,
          right: 0,
          child: Center(
            child: VesiohLogo(variant: VesiohLogoVariant.iconOnly, iconSize: 40),
          ),
        ),
        const Positioned(
          top: AppDimensions.welcomeMarqueeTop,
          left: 0,
          right: 0,
          child: Column(
            children: [
              SizedBox(height: 32, child: MarqueeTagRow(tags: _row1, activeTag: 'Gaming')),
              SizedBox(height: AppDimensions.spacingSm + 1),
              SizedBox(height: 32, child: MarqueeTagRow(tags: _row2, activeTag: 'Music', reverse: true)),
              SizedBox(height: AppDimensions.spacingSm + 1),
              SizedBox(height: 32, child: MarqueeTagRow(tags: _row3, activeTag: 'Marketplace')),
              SizedBox(height: AppDimensions.spacingSm + 1),
              SizedBox(height: 32, child: MarqueeTagRow(tags: _row4, activeTag: 'Football', reverse: true)),
            ],
          ),
        ),
        const Positioned(
          top: AppDimensions.welcomeContentTop,
          left: AppDimensions.spacingLg,
          right: AppDimensions.spacingLg,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              PageIndicator(pageCount: 2, currentPage: 1),
              SizedBox(height: 32),
              Text(
                'Your Corner of the Internet',
                style: AppTextStyles.displayTitle,
                textAlign: TextAlign.center,
              ),
              SizedBox(height: AppDimensions.spacingMd),
              Text(
                'A place to discover new interests, connect with like-minded people, and be part of communities that make every visit feel a little more personal.',
                style: AppTextStyles.body,
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
        Positioned(
          top: AppDimensions.welcomeActionsTop,
          left: AppDimensions.spacingLg,
          right: AppDimensions.spacingLg,
          child: Column(
            children: [
              VesiohButton(label: 'Get started', onPressed: onGetStarted),
              const SizedBox(height: AppDimensions.spacingXxl),
              SignInLink(onSignIn: onSignIn),
            ],
          ),
        ),
      ],
    );
  }
}
