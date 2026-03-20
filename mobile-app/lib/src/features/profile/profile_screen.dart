import 'package:flutter/material.dart';

import '../../core/theme/ks_tokens.dart';
import '../../shared/widgets/glass_card.dart';
import '../auth/logic/auth_session.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key, required this.authSession});

  final AuthSession authSession;

  @override
  Widget build(BuildContext context) {
    final user = authSession.user;
    final displayName = user?.name?.trim().isNotEmpty == true
        ? user!.name!
        : 'Knowledge User';
    final initials = displayName
        .substring(0, displayName.length.clamp(0, 2))
        .toUpperCase();

    return ListView(
      padding: const EdgeInsets.fromLTRB(18, 20, 18, 8),
      children: [
        GlassCard(
          child: Row(
            children: [
              Container(
                width: 64,
                height: 64,
                decoration: const BoxDecoration(
                  gradient: KsGradients.profileAvatar,
                  shape: BoxShape.circle,
                ),
                alignment: Alignment.center,
                child: Text(
                  initials,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w800,
                    fontSize: 18,
                  ),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      displayName,
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      user?.email ?? '-',
                      style: Theme.of(context).textTheme.bodySmall,
                    ),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        Chip(label: Text(user?.accountStatus ?? 'UNKNOWN')),
                        Chip(
                          label: Text(
                            user?.isEmailVerified == true
                                ? 'Verified'
                                : 'Unverified',
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        GlassCard(
          child: Column(
            children: const [
              _TokenRow(
                tokenName: 'KNOW-U',
                tokenType: 'Utility',
                amount: '0',
                color: Color(0xFF2563EB),
              ),
              Divider(height: 20),
              _TokenRow(
                tokenName: 'KNOW-G',
                tokenType: 'Governance (View-only on mobile)',
                amount: '0',
                color: Color(0xFF7C3AED),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        GlassCard(
          child: Column(
            children: const [
              _ProfileActionRow(
                icon: Icons.manage_accounts_outlined,
                title: 'Edit profile',
                subtitle: 'Display name, avatar, bio',
              ),
              Divider(height: 20),
              _ProfileActionRow(
                icon: Icons.notifications_outlined,
                title: 'Notifications',
                subtitle: 'Feed + map activity alerts',
              ),
              Divider(height: 20),
              _ProfileActionRow(
                icon: Icons.lock_outline,
                title: 'Security',
                subtitle: 'Password and session controls',
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        FilledButton.icon(
          onPressed: authSession.logout,
          icon: const Icon(Icons.logout),
          label: const Text('Sign out'),
          style: FilledButton.styleFrom(
            backgroundColor: KsColors.textPrimary,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 14),
          ),
        ),
      ],
    );
  }
}

class _TokenRow extends StatelessWidget {
  const _TokenRow({
    required this.tokenName,
    required this.tokenType,
    required this.amount,
    required this.color,
  });

  final String tokenName;
  final String tokenType;
  final String amount;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(10),
          ),
          alignment: Alignment.center,
          child: Text(
            tokenName.split('-').last,
            style: TextStyle(color: color, fontWeight: FontWeight.w800),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(tokenName, style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 2),
              Text(tokenType, style: Theme.of(context).textTheme.bodySmall),
            ],
          ),
        ),
        Text(amount, style: Theme.of(context).textTheme.titleLarge),
      ],
    );
  }
}

class _ProfileActionRow extends StatelessWidget {
  const _ProfileActionRow({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 38,
          height: 38,
          decoration: BoxDecoration(
            color: KsColors.brandBlue.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(12),
          ),
          alignment: Alignment.center,
          child: Icon(icon, color: KsColors.brandBlue, size: 20),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 2),
              Text(subtitle, style: Theme.of(context).textTheme.bodySmall),
            ],
          ),
        ),
        const Icon(Icons.chevron_right_rounded, color: KsColors.textMuted),
      ],
    );
  }
}
