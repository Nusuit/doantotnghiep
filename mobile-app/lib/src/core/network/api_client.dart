import 'package:dio/dio.dart';

import '../config/app_config.dart';
import '../storage/auth_token_store.dart';

class ApiException implements Exception {
  const ApiException(this.message, {this.statusCode, this.code});

  final String message;
  final int? statusCode;
  final String? code;

  @override
  String toString() =>
      'ApiException(statusCode: $statusCode, code: $code, message: $message)';
}

class ApiClient {
  ApiClient(this._tokenStore)
    : _dio = Dio(
        BaseOptions(
          baseUrl: AppConfig.apiBaseUrl,
          connectTimeout: AppConfig.networkTimeout,
          receiveTimeout: AppConfig.networkTimeout,
          sendTimeout: AppConfig.networkTimeout,
          headers: {'Content-Type': 'application/json'},
        ),
      ) {
    _dio.interceptors.add(
      LogInterceptor(
        requestBody: true,
        responseBody: true,
        error: true,
        requestHeader: true,
      ),
    );
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await _tokenStore.readAccessToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
      ),
    );
  }

  final Dio _dio;
  final AuthTokenStore _tokenStore;

  Future<T> getData<T>(
    String path, {
    Map<String, dynamic>? query,
    required T Function(dynamic data) parser,
  }) async {
    try {
      final response = await _dio.get<dynamic>(path, queryParameters: query);
      return _parseEnvelope(response.data, parser);
    } on DioException catch (error) {
      throw _toApiException(error);
    }
  }

  Future<T> postData<T>(
    String path, {
    Object? body,
    Map<String, dynamic>? query,
    required T Function(dynamic data) parser,
  }) async {
    try {
      final response = await _dio.post<dynamic>(
        path,
        data: body,
        queryParameters: query,
      );
      return _parseEnvelope(response.data, parser);
    } on DioException catch (error) {
      throw _toApiException(error);
    }
  }

  Future<T> putData<T>(
    String path, {
    Object? body,
    required T Function(dynamic data) parser,
  }) async {
    try {
      final response = await _dio.put<dynamic>(path, data: body);
      return _parseEnvelope(response.data, parser);
    } on DioException catch (error) {
      throw _toApiException(error);
    }
  }

  T _parseEnvelope<T>(dynamic raw, T Function(dynamic data) parser) {
    if (raw is! Map<String, dynamic>) {
      throw const ApiException('Invalid server response');
    }

    final success = raw['success'] == true;
    if (!success) {
      final error = raw['error'];
      if (error is Map<String, dynamic>) {
        throw ApiException(
          (error['message'] ?? 'Request failed').toString(),
          code: error['code']?.toString(),
        );
      }
      throw const ApiException('Request failed');
    }

    return parser(raw['data']);
  }

  ApiException _toApiException(DioException error) {
    final data = error.response?.data;
    String? code;
    String message = error.message ?? 'Network error';

    // Logging detailed error info
    print('--- API Error Details ---');
    print('Type: ${error.type}');
    print('Message: $message');
    print('Request: ${error.requestOptions.method} ${error.requestOptions.uri}');
    if (error.response != null) {
      print('Status Code: ${error.response?.statusCode}');
      print('Response Data: ${error.response?.data}');
    }
    print('-------------------------');

    if (data is Map<String, dynamic>) {
      final errorMap = data['error'];
      if (errorMap is Map<String, dynamic>) {
        code = errorMap['code']?.toString();
        message = (errorMap['message'] ?? message).toString();
      }
    }
    return ApiException(
      message,
      statusCode: error.response?.statusCode,
      code: code,
    );
  }
}
