import 'package:dio/dio.dart';

import '../models/auth_model.dart';
import '../models/result.dart';
import '../services/api_client.dart';
import '../services/secure_storage_service.dart';

// Screens never call ApiClient directly — they go through a repository.
// Repositories never throw; every failure path resolves to a Result.Failure.
class AuthRepository {
  AuthRepository({ApiClient? apiClient, SecureStorageService? storage})
      : _apiClient = apiClient ?? ApiClient.instance,
        _storage = storage ?? SecureStorageService.instance;

  final ApiClient _apiClient;
  final SecureStorageService _storage;

  Future<Result<AuthTokens, AppError>> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _apiClient.dio.post(
        '/auth/login',
        data: {'email': email, 'password': password},
      );
      final tokens = AuthTokens.fromJson(response.data as Map<String, dynamic>);
      await _storage.saveTokens(
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      );
      return Success(tokens);
    } on DioException catch (e) {
      return Failure(_mapError(e));
    } catch (_) {
      return Failure(AppError.unknown());
    }
  }

  Future<Result<void, AppError>> register({
    required String email,
    required String password,
    required String username,
  }) async {
    try {
      await _apiClient.dio.post(
        '/auth/register',
        data: {'email': email, 'password': password, 'username': username},
      );
      return const Success(null);
    } on DioException catch (e) {
      return Failure(_mapError(e));
    } catch (_) {
      return Failure(AppError.unknown());
    }
  }

  Future<Result<void, AppError>> logout() async {
    try {
      await _apiClient.dio.post('/auth/logout');
      await _storage.clearTokens();
      return const Success(null);
    } on DioException catch (e) {
      return Failure(_mapError(e));
    } catch (_) {
      return Failure(AppError.unknown());
    }
  }

  AppError _mapError(DioException e) {
    if (e.type == DioExceptionType.connectionError ||
        e.type == DioExceptionType.connectionTimeout) {
      return AppError.network();
    }
    final data = e.response?.data;
    if (data is Map<String, dynamic> && data['error'] is Map<String, dynamic>) {
      return AppError.fromJson(data['error'] as Map<String, dynamic>);
    }
    return AppError.unknown();
  }
}
