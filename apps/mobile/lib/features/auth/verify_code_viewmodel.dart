import 'dart:async';

import 'package:riverpod_annotation/riverpod_annotation.dart';

import '../../shared/constants/app_durations.dart';

part 'verify_code_viewmodel.g.dart';

class VerifyCodeState {
  const VerifyCodeState({required this.otp, required this.retrySeconds});

  final String otp;
  final int retrySeconds;

  VerifyCodeState copyWith({String? otp, int? retrySeconds}) {
    return VerifyCodeState(
      otp: otp ?? this.otp,
      retrySeconds: retrySeconds ?? this.retrySeconds,
    );
  }
}

@riverpod
class VerifyCodeViewModel extends _$VerifyCodeViewModel {
  Timer? _timer;

  @override
  VerifyCodeState build() {
    ref.onDispose(() => _timer?.cancel());
    _startTimer();
    return const VerifyCodeState(otp: '', retrySeconds: AppDurations.otpRetrySeconds);
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (state.retrySeconds == 0) {
        t.cancel();
      } else {
        state = state.copyWith(retrySeconds: state.retrySeconds - 1);
      }
    });
  }

  void resend() {
    state = state.copyWith(retrySeconds: AppDurations.otpRetrySeconds);
    _startTimer();
  }

  void setOtp(String value) => state = state.copyWith(otp: value);
}
