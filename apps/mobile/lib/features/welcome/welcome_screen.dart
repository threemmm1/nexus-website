import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../shared/constants/app_colors.dart';
import '../../shared/constants/app_durations.dart';
import '../../shared/navigation/app_routes.dart';
import 'welcome_page_one.dart';
import 'welcome_page_two.dart';

class WelcomeScreen extends StatefulWidget {
  const WelcomeScreen({super.key});

  @override
  State<WelcomeScreen> createState() => _WelcomeScreenState();
}

class _WelcomeScreenState extends State<WelcomeScreen> {
  final _pageController = PageController();
  int _currentPage = 0;

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _onGetStarted() {
    if (_currentPage == 0) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: AppDurations.welcomePageSwipe),
        curve: Curves.easeInOut,
      );
    } else {
      context.push(AppRoutes.signup);
    }
  }

  void _onSignIn() => context.push(AppRoutes.login);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: PageView(
        controller: _pageController,
        onPageChanged: (i) => setState(() => _currentPage = i),
        children: [
          WelcomePageOne(onGetStarted: _onGetStarted, onSignIn: _onSignIn),
          WelcomePageTwo(onGetStarted: _onGetStarted, onSignIn: _onSignIn),
        ],
      ),
    );
  }
}
