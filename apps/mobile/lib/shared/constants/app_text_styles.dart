import 'package:flutter/material.dart';
import 'app_colors.dart';

const String _kFontFamily = 'Inter';

abstract final class AppTextStyles {
  // ── Screen & section titles ───────────────────────────────────────────────

  /// 24px Bold White — screen headings, auth titles, welcome headlines.
  static const TextStyle displayTitle = TextStyle(
    fontFamily: _kFontFamily,
    fontWeight: FontWeight.w700,
    fontSize: 24,
    color: AppColors.white,
  );

  /// 20px Bold White — wheel picker items.
  static const TextStyle pickerItem = TextStyle(
    fontFamily: _kFontFamily,
    fontWeight: FontWeight.w700,
    fontSize: 20,
    color: AppColors.white,
  );

  /// 16px Bold White — list item primary label (creator name, card title).
  static const TextStyle listTitle = TextStyle(
    fontFamily: _kFontFamily,
    fontWeight: FontWeight.w700,
    fontSize: 16,
    color: AppColors.white,
  );

  // ── Body ──────────────────────────────────────────────────────────────────

  /// 12px SemiBold White — standard body copy, subtitles, descriptions.
  static const TextStyle body = TextStyle(
    fontFamily: _kFontFamily,
    fontWeight: FontWeight.w600,
    fontSize: 12,
    color: AppColors.white,
  );

  /// 12px SemiBold Muted — secondary info, handles, follower counts, captions.
  static const TextStyle bodyMuted = TextStyle(
    fontFamily: _kFontFamily,
    fontWeight: FontWeight.w600,
    fontSize: 12,
    color: AppColors.textMuted,
  );

  /// 12px SemiBold Primary — inline links, "Use phone instead", "Resend code".
  static const TextStyle bodyLink = TextStyle(
    fontFamily: _kFontFamily,
    fontWeight: FontWeight.w600,
    fontSize: 12,
    color: AppColors.primary,
  );

  // ── Input fields ──────────────────────────────────────────────────────────

  /// 24px Bold White — active text inside auth input fields.
  static const TextStyle inputText = TextStyle(
    fontFamily: _kFontFamily,
    fontWeight: FontWeight.w700,
    fontSize: 24,
    color: AppColors.white,
  );

  /// 24px Bold Muted — placeholder/hint text inside auth input fields.
  static const TextStyle inputHint = TextStyle(
    fontFamily: _kFontFamily,
    fontWeight: FontWeight.w700,
    fontSize: 24,
    color: AppColors.textMuted,
  );

  // ── Buttons & labels ──────────────────────────────────────────────────────

  /// 14px SemiBold Black — primary button label (white button, dark text).
  static const TextStyle buttonPrimary = TextStyle(
    fontFamily: _kFontFamily,
    fontWeight: FontWeight.w600,
    fontSize: 14,
    color: AppColors.black,
  );

  /// 14px SemiBold White — button label on dark/coloured background.
  static const TextStyle buttonSecondary = TextStyle(
    fontFamily: _kFontFamily,
    fontWeight: FontWeight.w600,
    fontSize: 14,
    color: AppColors.white,
  );

  /// 14px SemiBold Primary — text-only action links (Skip for now, Sign in bold).
  static const TextStyle buttonLink = TextStyle(
    fontFamily: _kFontFamily,
    fontWeight: FontWeight.w600,
    fontSize: 14,
    color: AppColors.primary,
  );

  // ── Sign-in link ──────────────────────────────────────────────────────────

  /// 12px Bold Primary — "Sign in" emphasis span inside sign-in link widget.
  static const TextStyle signInEmphasis = TextStyle(
    fontFamily: _kFontFamily,
    fontWeight: FontWeight.w700,
    fontSize: 12,
    color: AppColors.primary,
  );

  // ── Marquee ───────────────────────────────────────────────────────────────

  static const TextStyle marqueeActive = TextStyle(
    fontFamily: _kFontFamily,
    fontWeight: FontWeight.w700,
    fontSize: 24,
    color: AppColors.white,
  );

  static const TextStyle marqueeInactive = TextStyle(
    fontFamily: _kFontFamily,
    fontWeight: FontWeight.w700,
    fontSize: 24,
    color: AppColors.textMutedTransparent,
  );
}
