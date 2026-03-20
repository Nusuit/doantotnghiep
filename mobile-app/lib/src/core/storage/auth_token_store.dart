import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../../features/auth/models/auth_models.dart';

class AuthTokenStore {
  AuthTokenStore(this._storage);

  final FlutterSecureStorage _storage;

  static const _accessTokenKey = 'auth_access_token';
  static const _refreshTokenKey = 'auth_refresh_token';
  static const _userKey = 'auth_user_json';

  Future<void> saveTokens(AuthTokens tokens) async {
    await _storage.write(key: _accessTokenKey, value: tokens.accessToken);
    if (tokens.refreshToken != null) {
      await _storage.write(key: _refreshTokenKey, value: tokens.refreshToken);
    }
  }

  Future<AuthTokens?> readTokens() async {
    final accessToken = await _storage.read(key: _accessTokenKey);
    if (accessToken == null || accessToken.isEmpty) return null;

    final refreshToken = await _storage.read(key: _refreshTokenKey);
    return AuthTokens(accessToken: accessToken, refreshToken: refreshToken);
  }

  Future<String?> readAccessToken() => _storage.read(key: _accessTokenKey);

  Future<void> saveUser(SessionUser user) async {
    await _storage.write(key: _userKey, value: jsonEncode(user.toJson()));
  }

  Future<SessionUser?> readUser() async {
    final jsonRaw = await _storage.read(key: _userKey);
    if (jsonRaw == null || jsonRaw.isEmpty) return null;

    try {
      return SessionUser.fromJson(jsonDecode(jsonRaw) as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }

  Future<void> clear() async {
    await _storage.delete(key: _accessTokenKey);
    await _storage.delete(key: _refreshTokenKey);
    await _storage.delete(key: _userKey);
  }
}
