class AuthTokens {
  const AuthTokens({required this.accessToken, required this.refreshToken});

  final String accessToken;
  final String refreshToken;

  factory AuthTokens.fromJson(Map<String, dynamic> json) {
    return AuthTokens(
      accessToken: json['data']['accessToken'] as String,
      refreshToken: json['data']['refreshToken'] as String,
    );
  }
}

class AppError {
  const AppError({required this.code, required this.message});

  final String code;
  final String message;

  factory AppError.fromJson(Map<String, dynamic> json) {
    return AppError(
      code: json['code'] as String? ?? 'UNKNOWN_ERROR',
      message: json['message'] as String? ?? 'An unexpected error occurred.',
    );
  }

  factory AppError.network() => const AppError(
        code: 'NETWORK_ERROR',
        message: 'No internet connection. Please try again.',
      );

  factory AppError.unknown() => const AppError(
        code: 'UNKNOWN_ERROR',
        message: 'Something went wrong. Please try again.',
      );
}
