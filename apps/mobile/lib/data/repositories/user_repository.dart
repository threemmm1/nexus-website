import 'package:dio/dio.dart';

import '../models/auth_model.dart';
import '../models/result.dart';
import '../models/user_model.dart';
import '../services/api_client.dart';

class UserRepository {
  UserRepository({ApiClient? apiClient}) : _apiClient = apiClient ?? ApiClient.instance;

  final ApiClient _apiClient;

  Future<Result<UserModel, AppError>> getProfileByHandle(String username) async {
    try {
      final response = await _apiClient.dio.get('/users/$username');
      final data = (response.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
      return Success(UserModel.fromJson(data));
    } on DioException catch (e) {
      return Failure(_mapError(e));
    } catch (_) {
      return Failure(AppError.unknown());
    }
  }

  Future<Result<UserModel, AppError>> getCurrentUser() async {
    try {
      final response = await _apiClient.dio.get('/users/me');
      final data = (response.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
      return Success(UserModel.fromJson(data));
    } on DioException catch (e) {
      return Failure(_mapError(e));
    } catch (_) {
      return Failure(AppError.unknown());
    }
  }

  Future<Result<bool, AppError>> checkUsernameAvailable(String username) async {
    try {
      final response = await _apiClient.dio.get('/users/check-username/$username');
      final data = (response.data as Map<String, dynamic>)['data'] as Map<String, dynamic>;
      return Success(data['available'] as bool);
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
