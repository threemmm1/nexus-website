import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../shared/constants/app_constants.dart';

part 'birthday_viewmodel.g.dart';

class BirthdaySelection {
  const BirthdaySelection({required this.day, required this.month, required this.year});

  final int day;
  final int month;
  final int year;

  BirthdaySelection copyWith({int? day, int? month, int? year}) {
    return BirthdaySelection(
      day: day ?? this.day,
      month: month ?? this.month,
      year: year ?? this.year,
    );
  }
}

@riverpod
class BirthdayViewModel extends _$BirthdayViewModel {
  static final _defaultYear = DateTime.now().year - AppConstants.minimumAgeYears;

  @override
  BirthdaySelection build() => BirthdaySelection(day: 1, month: 1, year: _defaultYear);

  bool get hasSelection =>
      !(state.day == 1 && state.month == 1 && state.year == _defaultYear);

  bool get meetsAgeRequirement {
    final selected = DateTime(state.year, state.month, state.day);
    final now = DateTime.now();
    final cutoff = DateTime(now.year - AppConstants.minimumAgeYears, now.month, now.day);
    return selected.isBefore(cutoff) || selected.isAtSameMomentAs(cutoff);
  }

  String get displayDate {
    if (!hasSelection) return '__ __ ____';
    final d = state.day.toString().padLeft(2, '0');
    final m = state.month.toString().padLeft(2, '0');
    return '$d $m ${state.year}';
  }

  void setDate({required int day, required int month, required int year}) {
    state = BirthdaySelection(day: day, month: month, year: year);
  }
}
