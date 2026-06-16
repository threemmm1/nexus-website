import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../shared/constants/validators.dart';

part 'password_viewmodel.g.dart';

enum PasswordStrength { none, weak, good, strong }

@riverpod
class PasswordViewModel extends _$PasswordViewModel {
  @override
  String build() => '';

  bool get hasLength => Validators.passwordHasLength(state);
  bool get hasAlphaNum => Validators.passwordHasAlphaNum(state);
  bool get hasSpecial => Validators.passwordHasSpecial(state);

  PasswordStrength get strength {
    if (state.isEmpty) return PasswordStrength.none;
    final score = [hasLength, hasAlphaNum, hasSpecial].where((v) => v).length;
    if (score == 1) return PasswordStrength.weak;
    if (score == 2) return PasswordStrength.good;
    return PasswordStrength.strong;
  }

  void setValue(String value) => state = value;
}
