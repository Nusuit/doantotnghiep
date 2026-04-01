import 'package:flutter/material.dart';

import '../../../core/theme/ks_tokens.dart';
import '../../../shared/widgets/glass_card.dart';
import '../logic/auth_session.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key, required this.session});

  final AuthSession session;

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  bool _isLogin = true;

  final _emailCtrl = TextEditingController();
  final _nameCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _otpCtrl = TextEditingController();

  @override
  void dispose() {
    _emailCtrl.dispose();
    _nameCtrl.dispose();
    _passwordCtrl.dispose();
    _otpCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final email = _emailCtrl.text.trim();
    final password = _passwordCtrl.text.trim();
    if (email.isEmpty || password.isEmpty) return;

    if (_isLogin) {
      await widget.session.login(email: email, password: password);
      return;
    }

    final name = _nameCtrl.text.trim().isEmpty
        ? 'Knowledge User'
        : _nameCtrl.text.trim();
    await widget.session.register(email: email, password: password, name: name);
  }

  Future<void> _verifyOtp() async {
    final pendingEmail = widget.session.pendingVerificationEmail;
    final otp = _otpCtrl.text.trim();
    final password = _passwordCtrl.text.trim();
    if (pendingEmail == null || otp.isEmpty || password.isEmpty) return;
    await widget.session.verifyEmailOtp(
      email: pendingEmail,
      otpCode: otp,
      password: password,
    );
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: widget.session,
      builder: (context, _) {
        final pendingEmail = widget.session.pendingVerificationEmail;
        final isBusy = widget.session.isBusy;
        return Scaffold(
          body: Center(
            child: SingleChildScrollView(
              child: Padding(
                padding: const EdgeInsets.all(18),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 460),
                  child: GlassCard(
                    padding: const EdgeInsets.fromLTRB(18, 18, 18, 16),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text(
                          'Knowledge Share',
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.headlineMedium,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Authenticate trước, sau đó mới bật full Search + Map.',
                          textAlign: TextAlign.center,
                          style: Theme.of(context).textTheme.bodySmall,
                        ),
                        const SizedBox(height: 16),
                        SegmentedButton<bool>(
                          showSelectedIcon: false,
                          segments: const [
                            ButtonSegment(value: true, label: Text('Sign In')),
                            ButtonSegment(value: false, label: Text('Sign Up')),
                          ],
                          selected: {_isLogin},
                          onSelectionChanged: pendingEmail == null
                              ? (value) {
                                  setState(() => _isLogin = value.first);
                                }
                              : null,
                        ),
                        const SizedBox(height: 12),
                        if (!_isLogin && pendingEmail == null) ...[
                          TextField(
                            controller: _nameCtrl,
                            decoration: const InputDecoration(
                              labelText: 'Display name',
                              prefixIcon: Icon(Icons.person_outline),
                            ),
                          ),
                          const SizedBox(height: 10),
                        ],
                        TextField(
                          controller: _emailCtrl,
                          enabled: pendingEmail == null,
                          decoration: const InputDecoration(
                            labelText: 'Email',
                            prefixIcon: Icon(Icons.email_outlined),
                          ),
                        ),
                        const SizedBox(height: 10),
                        TextField(
                          controller: _passwordCtrl,
                          obscureText: true,
                          decoration: const InputDecoration(
                            labelText: 'Password',
                            prefixIcon: Icon(Icons.lock_outline),
                          ),
                        ),
                        if (pendingEmail != null) ...[
                          const SizedBox(height: 10),
                          TextField(
                            controller: _otpCtrl,
                            decoration: InputDecoration(
                              labelText: 'Verification OTP',
                              prefixIcon: const Icon(Icons.verified_outlined),
                              helperText: 'Code has been sent to $pendingEmail',
                            ),
                          ),
                        ],
                        const SizedBox(height: 12),
                        FilledButton(
                          onPressed: isBusy
                              ? null
                              : (pendingEmail != null ? _verifyOtp : _submit),
                          style: FilledButton.styleFrom(
                            backgroundColor: KsColors.brandBlue,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 13),
                          ),
                          child: Text(
                            isBusy
                                ? 'Processing...'
                                : pendingEmail != null
                                ? 'Verify OTP'
                                : _isLogin
                                ? 'Sign In'
                                : 'Create Account',
                          ),
                        ),
                        const SizedBox(height: 10),
                        OutlinedButton.icon(
                          onPressed: isBusy ? null : widget.session.loginWithGoogle,
                          icon: const Icon(Icons.login),
                          label: const Text('Continue with Google'),
                        ),
                        if (widget.session.error != null) ...[
                          const SizedBox(height: 8),
                          Text(
                            widget.session.error!,
                            style: Theme.of(context).textTheme.bodySmall?.copyWith(
                              color: const Color(0xFFB91C1C),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
