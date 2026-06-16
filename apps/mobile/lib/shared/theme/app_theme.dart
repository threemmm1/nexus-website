import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../constants/app_colors.dart';
import '../constants/app_dimensions.dart';
import '../constants/app_text_styles.dart';

abstract final class AppTheme {
  static ThemeData build() {
    return ThemeData(
      useMaterial3: true,
      fontFamily: 'Inter',
      scaffoldBackgroundColor: AppColors.background,
      colorScheme: const ColorScheme.dark(
        surface: AppColors.background,
        primary: AppColors.primary,
        onPrimary: AppColors.white,
        secondary: AppColors.surface,
        onSecondary: AppColors.white,
        error: Color(0xFFE53935),
        onError: AppColors.white,
        onSurface: AppColors.white,
      ),

      // App bar
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.background,
        elevation: 0,
        scrolledUnderElevation: 0,
        systemOverlayStyle: SystemUiOverlayStyle.light,
        titleTextStyle: AppTextStyles.displayTitle,
        iconTheme: IconThemeData(color: AppColors.white),
      ),

      // Text theme — maps Material roles to our named styles
      textTheme: const TextTheme(
        displayLarge: AppTextStyles.displayTitle,
        displayMedium: AppTextStyles.displayTitle,
        displaySmall: AppTextStyles.displayTitle,
        headlineLarge: AppTextStyles.displayTitle,
        headlineMedium: AppTextStyles.listTitle,
        headlineSmall: AppTextStyles.listTitle,
        titleLarge: AppTextStyles.listTitle,
        titleMedium: AppTextStyles.body,
        titleSmall: AppTextStyles.bodyMuted,
        bodyLarge: AppTextStyles.body,
        bodyMedium: AppTextStyles.body,
        bodySmall: AppTextStyles.bodyMuted,
        labelLarge: AppTextStyles.buttonPrimary,
        labelMedium: AppTextStyles.buttonSecondary,
        labelSmall: AppTextStyles.bodyMuted,
      ),

      // Input fields — establishes baseline; individual fields can override
      inputDecorationTheme: const InputDecorationTheme(
        filled: false,
        border: UnderlineInputBorder(
          borderSide: BorderSide(color: AppColors.textMuted),
        ),
        enabledBorder: UnderlineInputBorder(
          borderSide: BorderSide(color: AppColors.textMuted),
        ),
        focusedBorder: UnderlineInputBorder(
          borderSide: BorderSide(color: AppColors.primary),
        ),
        hintStyle: AppTextStyles.inputHint,
        isDense: true,
        contentPadding: EdgeInsets.zero,
      ),

      // Primary button (TextButton used as VesiohButton base)
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          backgroundColor: AppColors.white,
          foregroundColor: AppColors.black,
          textStyle: AppTextStyles.buttonPrimary,
          padding: const EdgeInsets.symmetric(
            vertical: AppDimensions.buttonPaddingV,
            horizontal: AppDimensions.buttonPaddingH,
          ),
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(AppDimensions.radiusPill)),
          ),
          minimumSize: const Size(double.infinity, AppDimensions.buttonHeight),
        ),
      ),

      // Divider
      dividerTheme: const DividerThemeData(
        color: AppColors.textMuted,
        thickness: 1,
        space: 1,
      ),

      // Icon defaults
      iconTheme: const IconThemeData(
        color: AppColors.white,
        size: AppDimensions.iconXl,
      ),
    );
  }
}
