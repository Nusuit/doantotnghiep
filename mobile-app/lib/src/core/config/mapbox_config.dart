// Conditional import: chọn native (iOS/Android) hoặc web stub
// dart.library.html chỉ tồn tại trên web → dùng để phân biệt
import 'mapbox_config_native.dart'
    if (dart.library.html) 'mapbox_config_web.dart';

const String _mapboxToken = String.fromEnvironment(
  'MAPBOX_ACCESS_TOKEN',
  defaultValue: '',
);

class MapboxConfig {
  static String get accessToken => _mapboxToken;
  static bool get hasToken => _mapboxToken.isNotEmpty;

  static void initialize() {
    // Delegates to native impl or web stub via conditional import
    initializeMapbox();
  }
}
