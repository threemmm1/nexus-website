import 'package:flutter/material.dart';
import '../constants/app_dimensions.dart';
import '../constants/app_durations.dart';
import '../constants/app_colors.dart';

class PageIndicator extends StatelessWidget {
  const PageIndicator({
    super.key,
    required this.pageCount,
    required this.currentPage,
  });

  final int pageCount;
  final int currentPage;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Page ${currentPage + 1} of $pageCount',
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: List.generate(pageCount, (i) {
          final isActive = i == currentPage;
          return Padding(
            padding: EdgeInsets.only(right: i < pageCount - 1 ? AppDimensions.spacingXs : 0),
            child: AnimatedContainer(
              duration: const Duration(milliseconds: AppDurations.animMed),
              width: AppDimensions.indicatorHeight,
              height: isActive ? AppDimensions.indicatorActiveWidth : AppDimensions.indicatorInactiveWidth,
              decoration: BoxDecoration(
                color: isActive ? AppColors.primary : AppColors.textMuted,
                borderRadius: const BorderRadius.all(Radius.circular(AppDimensions.indicatorRadius)),
              ),
            ),
          );
        }),
      ),
    );
  }
}
