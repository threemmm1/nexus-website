import 'package:riverpod_annotation/riverpod_annotation.dart';

part 'suggested_communities_viewmodel.g.dart';

@riverpod
class SuggestedCommunitiesViewModel extends _$SuggestedCommunitiesViewModel {
  @override
  Set<int> build() => {};

  void toggle(int index) {
    final next = Set<int>.from(state);
    if (next.contains(index)) {
      next.remove(index);
    } else {
      next.add(index);
    }
    state = next;
  }
}
