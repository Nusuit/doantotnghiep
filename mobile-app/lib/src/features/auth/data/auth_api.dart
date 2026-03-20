import '../../../core/config/app_config.dart';
import '../../../core/network/api_client.dart';
import '../models/auth_models.dart';

class AuthApi {
  AuthApi(this._apiClient);

  final ApiClient _apiClient;

  Future<(AuthTokens, SessionUser)> login({
    required String email,
    required String password,
  }) {
    return _apiClient.postData<(AuthTokens, SessionUser)>(
      '/api/auth/login',
      body: {'email': email, 'password': password},
      parser: (data) {
        final json = data as Map<String, dynamic>;
        final token = (json['token'] ?? '').toString();
        final refresh = json['refreshToken']?.toString();
        final user = SessionUser.fromJson(
          json['user'] as Map<String, dynamic>? ?? <String, dynamic>{},
        );
        return (AuthTokens(accessToken: token, refreshToken: refresh), user);
      },
    );
  }

  Future<RegisterResult> register({
    required String email,
    required String password,
    required String name,
  }) {
    return _apiClient.postData<RegisterResult>(
      '/api/auth/register',
      body: {'email': email, 'password': password, 'name': name},
      parser: (data) {
        final json = data as Map<String, dynamic>;
        return RegisterResult(
          requireVerification: json['requireVerification'] == true,
          email: (json['email'] ?? email).toString(),
          message: json['message']?.toString(),
        );
      },
    );
  }

  Future<void> verifyEmailOtp({
    required String email,
    required String otpCode,
  }) async {
    await _apiClient.postData<void>(
      '/api/auth/verify-email-otp',
      body: {'email': email, 'otpCode': otpCode},
      parser: (_) {},
    );
  }

  Future<SessionUser> me() {
    return _apiClient.getData<SessionUser>(
      '/api/auth/me',
      parser: (data) => SessionUser.fromJson(data as Map<String, dynamic>),
    );
  }

  Future<String> fetchGoogleAuthUrl() {
    return _apiClient.getData<String>(
      '/api/auth/google',
      query: {'mobile_redirect_uri': AppConfig.oauthCallbackUri},
      parser: (data) {
        final json = data as Map<String, dynamic>;
        return (json['authUrl'] ?? '').toString();
      },
    );
  }

  Future<(AuthTokens, SessionUser)> exchangeMobileOAuthCode(String code) {
    return _apiClient.postData<(AuthTokens, SessionUser)>(
      '/api/auth/mobile/exchange',
      body: {'code': code},
      parser: (data) {
        final json = data as Map<String, dynamic>;
        final token = (json['token'] ?? '').toString();
        final refresh = json['refreshToken']?.toString();
        final user = SessionUser.fromJson(
          json['user'] as Map<String, dynamic>? ?? <String, dynamic>{},
        );
        return (AuthTokens(accessToken: token, refreshToken: refresh), user);
      },
    );
  }

  Future<void> logout() async {
    await _apiClient.postData<void>('/api/auth/logout', parser: (_) {});
  }
}
