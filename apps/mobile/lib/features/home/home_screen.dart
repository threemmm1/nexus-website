import 'package:flutter/material.dart';

import '../../shared/constants/app_colors.dart';
import '../../shared/constants/app_text_styles.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      backgroundColor: AppColors.background,
      body: Center(
        child: Text('Home', style: AppTextStyles.displayTitle),
      ),
    );
  }
}
