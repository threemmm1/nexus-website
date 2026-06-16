import 'package:dio/dio.dart';

// Single Dio instance for the entire app.
// Base URL, auth headers, and token refresh interceptors are configured here only.
// Nothing else in the codebase should instantiate Dio directly.
class ApiClient {
  ApiClient._({required String baseUrl}) {
    _dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 30),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );
  }

  static ApiClient? _instance;
  late final Dio _dio;

  static ApiClient get instance {
    assert(_instance != null, 'ApiClient.init() must be called before use.');
    return _instance!;
  }

  static void init({required String baseUrl}) {
    _instance ??= ApiClient._(baseUrl: baseUrl);
  }

  Dio get dio => _dio;
}
