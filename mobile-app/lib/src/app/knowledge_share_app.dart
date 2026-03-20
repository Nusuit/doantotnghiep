import 'package:flutter/material.dart';

import '../core/theme/ks_theme.dart';
import '../features/auth/logic/auth_session.dart';
import '../features/auth/ui/auth_screen.dart';
import 'app_shell.dart';
import 'app_services.dart';

class KnowledgeShareApp extends StatefulWidget {
  const KnowledgeShareApp({super.key});

  @override
  State<KnowledgeShareApp> createState() => _KnowledgeShareAppState();
}

class _KnowledgeShareAppState extends State<KnowledgeShareApp> {
  late final AppServices _services;
  late final AuthSession _authSession;

  @override
  void initState() {
    super.initState();
    _services = AppServices();
    _authSession = AuthSession(
      authApi: _services.authApi,
      tokenStore: _services.tokenStore,
    );
    _authSession.restore();
  }

  @override
  void dispose() {
    _authSession.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AppServicesScope(
      services: _services,
      child: MaterialApp(
        title: 'Knowledge Share',
        debugShowCheckedModeBanner: false,
        theme: buildKnowledgeShareTheme(),
        home: AnimatedBuilder(
          animation: _authSession,
          builder: (context, _) {
            if (_authSession.status == AuthStatus.loading) {
              return const Scaffold(
                body: Center(child: CircularProgressIndicator()),
              );
            }
            if (_authSession.isAuthenticated) {
              return AppShell(authSession: _authSession);
            }
            return AuthScreen(session: _authSession);
          },
        ),
      ),
    );
  }
}
