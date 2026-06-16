import 'app_constants.dart';

abstract final class Validators {
  static final _emailRegex = RegExp(r'^[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}$');
  static final _phoneRegex = RegExp(r'^\d{7,15}$');
  static final _usernameRegex = RegExp(
    '^[a-zA-Z0-9_.]{${AppConstants.usernameMinLength},${AppConstants.usernameMaxLength}}\$',
  );
  static final _alphaRegex = RegExp(r'[a-zA-Z]');
  static final _digitRegex = RegExp(r'[0-9]');
  static final _specialCharRegex = RegExp(r'[@$_#*!?.\-]');

  static final usernameCharFilter = RegExp(r'[a-zA-Z0-9_.]');

  static bool isValidEmail(String v) => _emailRegex.hasMatch(v.trim());

  static bool isValidPhone(String v) =>
      _phoneRegex.hasMatch(v.replaceAll(RegExp(r'[\s\-()]'), ''));

  static bool isValidUsername(String v) => _usernameRegex.hasMatch(v);

  static bool passwordHasLength(String v) =>
      v.length >= AppConstants.passwordMinLength &&
      v.length <= AppConstants.passwordMaxLength;

  static bool passwordHasAlphaNum(String v) =>
      _alphaRegex.hasMatch(v) && _digitRegex.hasMatch(v);

  static bool passwordHasSpecial(String v) => _specialCharRegex.hasMatch(v);
}
