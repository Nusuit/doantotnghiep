import 'package:flutter/material.dart';

class KsColors {
  static const Color brandSky = Color(0xFFC0D8F4);
  static const Color brandAqua = Color(0xFFA9CDEB);
  static const Color brandIndigo = Color(0xFFCDB8ED);
  static const Color brandViolet = Color(0xFFDCBEF2);
  static const Color brandBlue = Color(0xFF6D93E2);
  static const Color textPrimary = Color(0xFF1F2A44);
  static const Color textMuted = Color(0xFF5B6A86);
  static const Color pageBackground = Color(0xFFF4F7FE);
  static const Color surface = Color(0xFFFFFFFF);
}

class KsGradients {
  static const LinearGradient hero = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      KsColors.brandSky,
      KsColors.brandAqua,
      KsColors.brandIndigo,
      KsColors.brandViolet,
    ],
    stops: [0, 0.25, 0.6, 1],
  );

  static const LinearGradient primaryButton = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [KsColors.brandBlue, KsColors.brandIndigo, KsColors.brandViolet],
  );

  static const LinearGradient profileAvatar = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF5B7FE3), Color(0xFFA17CE6)],
  );
}
