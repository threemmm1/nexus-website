abstract final class AppConstants {
  // Password rules
  static const int passwordMinLength = 8;
  static const int passwordMaxLength = 20;

  // Username rules
  static const int usernameMinLength = 3;
  static const int usernameMaxLength = 30;

  // OTP
  static const int otpLength = 6;

  // Interests
  static const int interestsMinSelection = 3;

  // Age gate
  static const int minimumAgeYears = 13;

  // Phone
  static const String defaultDialCode = 'US +1';
  static const String defaultDialCountryCode = '+1';
}
