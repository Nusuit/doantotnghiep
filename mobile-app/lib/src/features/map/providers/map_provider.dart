import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../../../core/storage/auth_token_store.dart';
import '../../../core/network/api_client.dart';
import '../data/map_models.dart';
import '../data/map_repository.dart';

// Provides a default AuthTokenStore instance
final tokenStoreProvider = Provider<AuthTokenStore>((ref) {
  return AuthTokenStore(const FlutterSecureStorage());
});

// Provides the ApiClient instance
final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient(ref.watch(tokenStoreProvider));
});

// Provides the MapRepository instance
final mapRepositoryProvider = Provider<MapRepository>((ref) {
  return MapRepository(ref.watch(apiClientProvider)); 
});

// Provides the list of contexts (places) fetched from the API
final mapContextsProvider = NotifierProvider<MapContextsNotifier, List<MapContextItem>>(MapContextsNotifier.new);

class MapContextsNotifier extends Notifier<List<MapContextItem>> {
  @override
  List<MapContextItem> build() {
    return [];
  }

  // To keep track of the center of the last fetched 10km radius
  Position? _lastFetchedCenter;
  
  // Flag to prevent concurrent fetches
  bool _isFetching = false;

  Future<void> fetchContextsIfNeeded(Position currentCenter) async {
    if (_isFetching) return;

    if (_lastFetchedCenter == null || _distanceInKm(_lastFetchedCenter!, currentCenter) > 7) {
      _isFetching = true;
      try {
        final repository = ref.read(mapRepositoryProvider);
        // Calculate rough bounding box for ~10km radius
        // 1 degree latitude ~= 111km
        // 10km ~= 0.09 degrees
        final double offset = 0.09; 
        
        final contexts = await repository.fetchMapContexts(
          minLat: currentCenter.latitude - offset,
          maxLat: currentCenter.latitude + offset,
          minLng: currentCenter.longitude - offset,
          maxLng: currentCenter.longitude + offset,
          limit: 1000, // Large limit for 10km radius
        );
        
        // Merge new contexts with existing ones, avoiding duplicates
        final existingIds = state.map((e) => e.id).toSet();
        final newContexts = contexts.where((c) => !existingIds.contains(c.id)).toList();
        
        if (newContexts.isNotEmpty) {
           state = [...state, ...newContexts];
        }

        _lastFetchedCenter = currentCenter;
      } catch (e) {
        // Handle error implicitly
      } finally {
        _isFetching = false;
      }
    }
  }

  // Helper calculation for distance
  double _distanceInKm(Position p1, Position p2) {
    return Geolocator.distanceBetween(
      p1.latitude, p1.longitude,
      p2.latitude, p2.longitude,
    ) / 1000.0;
  }
}

class SelectedMapContextNotifier extends Notifier<MapContextItem?> {
  @override
  MapContextItem? build() => null;
  void update(MapContextItem? contextItem) => state = contextItem;
}

final selectedMapContextProvider = NotifierProvider<SelectedMapContextNotifier, MapContextItem?>(SelectedMapContextNotifier.new);

class MapCameraTargetNotifier extends Notifier<Position?> {
  @override
  Position? build() => null;
  void update(Position? position) => state = position;
}

final mapCameraTargetProvider = NotifierProvider<MapCameraTargetNotifier, Position?>(MapCameraTargetNotifier.new);
