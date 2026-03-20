import 'package:flutter/material.dart';

import 'ks_tokens.dart';

ThemeData buildKnowledgeShareTheme() {
  final base = ThemeData(useMaterial3: true);
  const scheme = ColorScheme(
    brightness: Brightness.light,
    primary: KsColors.brandBlue,
    onPrimary: Colors.white,
    secondary: KsColors.brandIndigo,
    onSecondary: KsColors.textPrimary,
    error: Color(0xFFB91C1C),
    onError: Colors.white,
    surface: KsColors.surface,
    onSurface: KsColors.textPrimary,
  );

  return base.copyWith(
    colorScheme: scheme,
    scaffoldBackgroundColor: Colors.transparent,
    textTheme: base.textTheme.copyWith(
      headlineMedium: const TextStyle(
        color: KsColors.textPrimary,
        fontWeight: FontWeight.w700,
        letterSpacing: -0.2,
      ),
      titleLarge: const TextStyle(
        color: KsColors.textPrimary,
        fontWeight: FontWeight.w700,
      ),
      titleMedium: const TextStyle(
        color: KsColors.textPrimary,
        fontWeight: FontWeight.w600,
      ),
      bodyMedium: const TextStyle(color: KsColors.textPrimary),
      bodySmall: const TextStyle(color: KsColors.textMuted),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: Colors.white.withValues(alpha: 0.9),
      indicatorColor: KsColors.brandBlue.withValues(alpha: 0.14),
      surfaceTintColor: Colors.transparent,
      labelTextStyle: WidgetStateProperty.resolveWith((states) {
        if (states.contains(WidgetState.selected)) {
          return const TextStyle(
            color: KsColors.textPrimary,
            fontWeight: FontWeight.w700,
          );
        }
        return const TextStyle(
          color: KsColors.textMuted,
          fontWeight: FontWeight.w600,
        );
      }),
    ),
    chipTheme: ChipThemeData(
      backgroundColor: Colors.white.withValues(alpha: 0.75),
      selectedColor: KsColors.brandBlue.withValues(alpha: 0.2),
      side: BorderSide(color: KsColors.brandBlue.withValues(alpha: 0.16)),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(999)),
      labelStyle: const TextStyle(
        color: KsColors.textPrimary,
        fontWeight: FontWeight.w600,
      ),
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
    ),
    cardTheme: CardThemeData(
      color: Colors.white.withValues(alpha: 0.86),
      elevation: 0,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white.withValues(alpha: 0.9),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(999),
        borderSide: BorderSide(
          color: KsColors.brandBlue.withValues(alpha: 0.12),
        ),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(999),
        borderSide: BorderSide(
          color: KsColors.brandBlue.withValues(alpha: 0.12),
        ),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(999),
        borderSide: const BorderSide(color: KsColors.brandBlue, width: 1.4),
      ),
      hintStyle: const TextStyle(color: KsColors.textMuted),
    ),
  );
}
