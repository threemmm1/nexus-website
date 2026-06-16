import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../shared/constants/app_constants.dart';

part 'interests_viewmodel.g.dart';

@riverpod
class InterestsViewModel extends _$InterestsViewModel {
  @override
  Set<String> build() => <String>{};

  bool get canContinue => state.length >= AppConstants.interestsMinSelection;

  void toggle(String label) {
    final next = {...state};
    if (next.contains(label)) {
      next.remove(label);
    } else {
      next.add(label);
    }
    state = next;
  }
}
