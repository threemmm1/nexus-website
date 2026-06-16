import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'suggested_creators_viewmodel.g.dart';

@riverpod
class SuggestedCreatorsViewModel extends _$SuggestedCreatorsViewModel {
  @override
  Set<int> build() => <int>{};

  void toggle(int index) {
    final next = {...state};
    if (next.contains(index)) {
      next.remove(index);
    } else {
      next.add(index);
    }
    state = next;
  }
}
