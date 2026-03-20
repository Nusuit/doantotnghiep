class AppConfig {
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:1002',
  );

  static const String oauthCallbackScheme = String.fromEnvironment(
    'OAUTH_CALLBACK_SCHEME',
    defaultValue: 'knowledgeshare',
  );

  static const String oauthCallbackHost = String.fromEnvironment(
    'OAUTH_CALLBACK_HOST',
    defaultValue: 'auth',
  );

  static String get oauthCallbackUri =>
      '$oauthCallbackScheme://$oauthCallbackHost/callback';

  static const Duration networkTimeout = Duration(seconds: 30);
}
