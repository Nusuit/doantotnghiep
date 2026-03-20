import 'package:mapbox_maps_flutter/mapbox_maps_flutter.dart';

const String _mapboxToken = String.fromEnvironment(
  'MAPBOX_ACCESS_TOKEN',
  defaultValue: '',
);

void initializeMapbox() {
  if (_mapboxToken.isNotEmpty) {
    MapboxOptions.setAccessToken(_mapboxToken);
  }
}
