import 'package:flutter/foundation.dart';
import 'package:flutter_web_auth_2/flutter_web_auth_2.dart';

import '../../../core/config/app_config.dart';
import '../../../core/network/api_client.dart';
import '../../../core/storage/auth_token_store.dart';
import '../data/auth_api.dart';
import '../models/auth_models.dart';

enum AuthStatus { loading, unauthenticated, authenticated }

class AuthSession extends ChangeNotifier {
  AuthSession({required AuthApi authApi, required AuthTokenStore tokenStore})
    : _authApi = authApi,
      _tokenStore = tokenStore;

  final AuthApi _authApi;
  final AuthTokenStore _tokenStore;

  AuthStatus _status = AuthStatus.loading;
  SessionUser? _user;
  String? _error;
  String? _pendingVerificationEmail;
  bool _busy = false;

  AuthStatus get status => _status;
  SessionUser? get user => _user;
  String? get error => _error;
  String? get pendingVerificationEmail => _pendingVerificationEmail;
  bool get isBusy => _busy;
  bool get isAuthenticated => _status == AuthStatus.authenticated;

  Future<void> restore() async {
    _status = AuthStatus.loading;
    notifyListeners();
    final storedUser = await _tokenStore.readUser();
    if (storedUser != null) _user = storedUser;

    final token = await _tokenStore.readAccessToken();
    if (token == null || token.isEmpty) {
      _status = AuthStatus.unauthenticated;
      notifyListeners();
      return;
    }

    try {
      final me = await _authApi.me();
      _user = me;
      await _tokenStore.saveUser(me);
      _status = AuthStatus.authenticated;
      _error = null;
    } catch (_) {
      await _tokenStore.clear();
      _user = null;
      _status = AuthStatus.unauthenticated;
    }
    notifyListeners();
  }

  Future<bool> login({required String email, required String password}) async {
    return _runGuarded(() async {
      final (tokens, user) = await _authApi.login(
        email: email,
        password: password,
      );
      await _tokenStore.saveTokens(tokens);
      await _tokenStore.saveUser(user);
      _user = user;
      _status = AuthStatus.authenticated;
      _pendingVerificationEmail = null;
    });
  }

  Future<bool> register({
    required String email,
    required String password,
    required String name,
  }) async {
    return _runGuarded(() async {
      final result = await _authApi.register(
        email: email,
        password: password,
        name: name,
      );
      if (result.requireVerification) {
        _pendingVerificationEmail = result.email;
        _status = AuthStatus.unauthenticated;
      } else {
        await login(email: email, password: password);
      }
    });
  }

  Future<bool> verifyEmailOtp({
    required String email,
    required String otpCode,
    required String password,
  }) async {
    return _runGuarded(() async {
      await _authApi.verifyEmailOtp(email: email, otpCode: otpCode);
      await login(email: email, password: password);
    });
  }

  Future<bool> loginWithGoogle() async {
    return _runGuarded(() async {
      final authUrl = await _authApi.fetchGoogleAuthUrl();
      if (authUrl.isEmpty) {
        throw const ApiException('Google OAuth URL is empty');
      }

      final callbackResult = await FlutterWebAuth2.authenticate(
        url: authUrl,
        callbackUrlScheme: AppConfig.oauthCallbackScheme,
      );
      final callbackUri = Uri.parse(callbackResult);
      final code = callbackUri.queryParameters['code'];
      if (code == null || code.isEmpty) {
        throw const ApiException('OAuth callback did not include code');
      }

      final (tokens, user) = await _authApi.exchangeMobileOAuthCode(code);
      await _tokenStore.saveTokens(tokens);
      await _tokenStore.saveUser(user);
      _user = user;
      _status = AuthStatus.authenticated;
      _pendingVerificationEmail = null;
    });
  }

  Future<void> logout() async {
    try {
      await _authApi.logout();
    } catch (_) {
      // ignore network failures when local logout is requested
    }
    await _tokenStore.clear();
    _status = AuthStatus.unauthenticated;
    _user = null;
    _pendingVerificationEmail = null;
    _error = null;
    notifyListeners();
  }

  Future<bool> _runGuarded(Future<void> Function() action) async {
    _busy = true;
    _error = null;
    notifyListeners();
    try {
      await action();
      return true;
    } on ApiException catch (error) {
      _error = error.message;
      return false;
    } catch (error) {
      _error = error.toString();
      return false;
    } finally {
      _busy = false;
      notifyListeners();
    }
  }
}
