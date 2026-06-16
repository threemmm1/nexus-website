import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'field_validation_viewmodel.g.dart';

// Backs any single text field whose only state is "current value + is it valid".
// Parameterized by a validator so email/phone/username screens share one notifier
// instead of three copies of the same setState-on-every-keystroke pattern.
@riverpod
class FieldValidationViewModel extends _$FieldValidationViewModel {
  @override
  String build(bool Function(String) validator) => '';

  bool get isValid => validator(state);

  void setValue(String value) => state = value;
}
