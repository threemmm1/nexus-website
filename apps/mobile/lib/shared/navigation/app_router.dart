import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/birthday_screen.dart';
import '../../features/auth/email_reach_screen.dart';
import '../../features/auth/interests_screen.dart';
import '../../features/auth/password_screen.dart';
import '../../features/auth/phone_reach_screen.dart';
import '../../features/auth/sign_up_screen.dart';
import '../../features/auth/profile_picture_screen.dart';
import '../../features/auth/registration_complete_screen.dart';
import '../../features/auth/suggested_communities_screen.dart';
import '../../features/auth/suggested_creators_screen.dart';
import '../../features/auth/username_screen.dart';
import '../../features/auth/verify_code_screen.dart';
import '../../features/home/home_screen.dart';
import '../../features/splash/splash_screen.dart';
import '../../features/welcome/welcome_screen.dart';
import 'app_routes.dart';
import '../constants/app_colors.dart';
import '../constants/app_text_styles.dart';

final appRouter = GoRouter(
  initialLocation: AppRoutes.splash,
  errorBuilder: (context, state) => const Scaffold(
    backgroundColor: AppColors.background,
    body: Center(
      child: Text('Page not found.', style: AppTextStyles.body),
    ),
  ),
  routes: [
    GoRoute(path: AppRoutes.splash, builder: (_, __) => const SplashScreen()),
    GoRoute(path: AppRoutes.welcome, builder: (_, __) => const WelcomeScreen()),
    GoRoute(path: AppRoutes.signup, builder: (_, __) => const SignUpScreen()),
    GoRoute(path: AppRoutes.login, builder: (_, __) => const SignUpScreen()),
    GoRoute(path: AppRoutes.email, builder: (_, __) => const EmailReachScreen()),
    GoRoute(path: AppRoutes.phone, builder: (_, __) => const PhoneReachScreen()),
    GoRoute(path: AppRoutes.birthday, builder: (_, __) => const BirthdayScreen()),
    GoRoute(
      path: AppRoutes.verifyCode,
      builder: (_, state) => VerifyCodeScreen(
        destination: state.uri.queryParameters['to'] ?? 'your inbox',
      ),
    ),
    GoRoute(path: AppRoutes.username, builder: (_, __) => const UsernameScreen()),
    GoRoute(path: AppRoutes.password, builder: (_, __) => const PasswordScreen()),
    GoRoute(path: AppRoutes.interests, builder: (_, __) => const InterestsScreen()),
    GoRoute(
      path: AppRoutes.suggestedCreators,
      builder: (_, __) => const SuggestedCreatorsScreen(),
    ),
    GoRoute(path: AppRoutes.profilePicture, builder: (_, __) => const ProfilePictureScreen()),
    GoRoute(
      path: AppRoutes.suggestedCommunities,
      builder: (_, __) => const SuggestedCommunitiesScreen(),
    ),
    GoRoute(
      path: AppRoutes.registrationComplete,
      builder: (_, __) => const RegistrationCompleteScreen(),
    ),
    GoRoute(path: AppRoutes.home, builder: (_, __) => const HomeScreen()),
  ],
);
