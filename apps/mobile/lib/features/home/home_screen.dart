import 'package:flutter/material.dart';

import '../../shared/constants/app_assets.dart';
import '../../shared/constants/app_colors.dart';
import '../../shared/constants/app_dimensions.dart';
import '../../shared/constants/app_text_styles.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> with SingleTickerProviderStateMixin {
  late final TabController _tabController;

  static const _tabs = ['For You', 'Following', 'Communities'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
    _tabController.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            _TopBar(tabController: _tabController, tabs: _tabs),
            const _StoryRow(),
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: const [
                  _FeedView(),
                  Center(child: Text('Following', style: AppTextStyles.body)),
                  Center(child: Text('Communities', style: AppTextStyles.body)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TopBar extends StatelessWidget {
  const _TopBar({required this.tabController, required this.tabs});

  final TabController tabController;
  final List<String> tabs;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AppDimensions.spacingLg,
        vertical: AppDimensions.spacingSm,
      ),
      child: Stack(
        alignment: Alignment.center,
        children: [
          Image.asset(
            AppAssets.logoIcon,
            width: AppDimensions.logoIconSize,
            height: AppDimensions.logoIconSize,
            fit: BoxFit.contain,
          ),
          const Align(
            alignment: Alignment.centerLeft,
            child: _LiveButton(),
          ),
          Align(
            alignment: Alignment.centerRight,
            child: Semantics(
              label: 'Search',
              button: true,
              child: GestureDetector(
                onTap: null,
                child: const Icon(
                  Icons.search_rounded,
                  color: AppColors.white,
                  size: AppDimensions.iconXl,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _LiveButton extends StatelessWidget {
  const _LiveButton();

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Live',
      button: true,
      child: GestureDetector(
        onTap: null,
        child: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.tv_rounded, color: AppColors.white, size: AppDimensions.iconXl),
            Text('LIVE', style: AppTextStyles.body),
          ],
        ),
      ),
    );
  }
}

class _StoryRow extends StatelessWidget {
  const _StoryRow();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: AppDimensions.storyRowHeight,
      child: ListView(
        padding: const EdgeInsets.symmetric(horizontal: AppDimensions.spacingLg),
        scrollDirection: Axis.horizontal,
        children: const [
          _AddStoryItem(),
          SizedBox(width: AppDimensions.spacingMd),
          _StoryItem(label: 'Lyra', isLive: false, hasOrangeRing: true),
          SizedBox(width: AppDimensions.spacingMd),
          _StoryItem(label: 'Tundeednut', isLive: true, hasOrangeRing: false),
          SizedBox(width: AppDimensions.spacingMd),
          _StoryItem(label: 'Chisom', isLive: false, hasOrangeRing: true),
          SizedBox(width: AppDimensions.spacingMd),
          _StoryItem(label: 'Ajinomoh', isLive: false, hasOrangeRing: true),
        ],
      ),
    );
  }
}

class _AddStoryItem extends StatelessWidget {
  const _AddStoryItem();

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Add your story',
      button: true,
      child: GestureDetector(
        onTap: null,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Stack(
              children: [
                Container(
                  width: AppDimensions.storyAvatarSize,
                  height: AppDimensions.storyAvatarSize,
                  decoration: const BoxDecoration(
                    color: AppColors.textMuted,
                    borderRadius: BorderRadius.all(
                      Radius.circular(AppDimensions.storyAvatarSize / 2),
                    ),
                  ),
                ),
                Positioned(
                  right: 0,
                  bottom: 0,
                  child: Container(
                    width: AppDimensions.storyAddBadge,
                    height: AppDimensions.storyAddBadge,
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      border: Border.all(color: AppColors.background, width: 1.5),
                      borderRadius: const BorderRadius.all(
                        Radius.circular(AppDimensions.storyAddBadge / 2),
                      ),
                    ),
                    child: const Icon(
                      Icons.add,
                      color: AppColors.white,
                      size: AppDimensions.iconSm,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppDimensions.spacingXs),
            const Text('Your story', style: AppTextStyles.storyLabel),
          ],
        ),
      ),
    );
  }
}

class _StoryItem extends StatelessWidget {
  const _StoryItem({
    required this.label,
    required this.isLive,
    required this.hasOrangeRing,
  });

  final String label;
  final bool isLive;
  final bool hasOrangeRing;

  @override
  Widget build(BuildContext context) {
    final ringColor = isLive ? const Color(0xFFF44336) : AppColors.primary;

    return Semantics(
      label: isLive ? '$label is live' : '$label\'s story',
      button: true,
      child: GestureDetector(
        onTap: null,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Container(
                  width: AppDimensions.storyAvatarSize,
                  height: AppDimensions.storyAvatarSize,
                  decoration: BoxDecoration(
                    color: AppColors.textMuted,
                    border: (hasOrangeRing || isLive)
                        ? Border.all(color: ringColor, width: 2)
                        : null,
                    borderRadius: const BorderRadius.all(
                      Radius.circular(AppDimensions.storyAvatarSize / 2),
                    ),
                  ),
                ),
                if (isLive)
                  Positioned(
                    bottom: -AppDimensions.spacingSm,
                    left: 0,
                    right: 0,
                    child: Center(
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppDimensions.spacingSm,
                          vertical: 2,
                        ),
                        decoration: const BoxDecoration(
                          color: Color(0xFFF44336),
                          borderRadius: BorderRadius.all(Radius.circular(AppDimensions.chipRadius)),
                        ),
                        child: const Text('LIVE', style: AppTextStyles.liveBadge),
                      ),
                    ),
                  ),
              ],
            ),
            SizedBox(height: isLive ? AppDimensions.spacingMd : AppDimensions.spacingXs),
            Text(label, style: AppTextStyles.storyLabel),
          ],
        ),
      ),
    );
  }
}

class _FeedView extends StatelessWidget {
  const _FeedView();

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.symmetric(
        horizontal: AppDimensions.spacingLg,
        vertical: AppDimensions.spacingMd,
      ),
      children: const [_PostCard()],
    );
  }
}

class _PostCard extends StatelessWidget {
  const _PostCard();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Stack(
              children: [
                Container(
                  width: AppDimensions.avatarMd,
                  height: AppDimensions.avatarMd,
                  decoration: const BoxDecoration(
                    color: AppColors.textMuted,
                    borderRadius: BorderRadius.all(Radius.circular(AppDimensions.radiusCircle)),
                  ),
                ),
                const Positioned(
                  right: 0,
                  bottom: 0,
                  child: Icon(
                    Icons.verified,
                    color: AppColors.primary,
                    size: AppDimensions.iconMd,
                  ),
                ),
              ],
            ),
            const SizedBox(width: AppDimensions.spacingMd),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Lyra', style: AppTextStyles.listTitle),
                  Row(
                    children: [
                      Text('@lyrabeats', style: AppTextStyles.bodyMuted),
                      SizedBox(width: AppDimensions.spacingXs),
                      Text('·', style: AppTextStyles.bodyMuted),
                      SizedBox(width: AppDimensions.spacingXs),
                      Text('2h', style: AppTextStyles.bodyMuted),
                    ],
                  ),
                ],
              ),
            ),
            Semantics(
              label: 'Post options',
              button: true,
              child: GestureDetector(
                onTap: null,
                child: const Icon(
                  Icons.more_horiz,
                  color: AppColors.white,
                  size: AppDimensions.iconXl,
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: AppDimensions.spacingMd),
        const Text(
          'Hit Radiant this season finally 😤',
          style: AppTextStyles.body,
        ),
      ],
    );
  }
}
