import 'package:flutter/material.dart';

import '../../core/theme/ks_tokens.dart';

class GradientBackground extends StatelessWidget {
  const GradientBackground({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return DecoratedBox(
      decoration: const BoxDecoration(gradient: KsGradients.hero),
      child: Stack(
        children: [
          Positioned(
            top: -80,
            left: -60,
            child: _GlowBubble(
              size: 220,
              color: Colors.white.withValues(alpha: 0.18),
            ),
          ),
          Positioned(
            bottom: -60,
            right: -70,
            child: _GlowBubble(
              size: 210,
              color: KsColors.brandBlue.withValues(alpha: 0.16),
            ),
          ),
          Positioned(
            top: 180,
            right: -40,
            child: _GlowBubble(
              size: 140,
              color: KsColors.brandViolet.withValues(alpha: 0.15),
            ),
          ),
          child,
        ],
      ),
    );
  }
}

class _GlowBubble extends StatelessWidget {
  const _GlowBubble({required this.size, required this.color});

  final double size;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(shape: BoxShape.circle, color: color),
      ),
    );
  }
}
