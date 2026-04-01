import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../../map/data/map_models.dart';

class PrivateWorldStore {
  static const _privatePlacesKey = 'private_world_places_v1';

  Future<List<MapContextItem>> loadPlaces() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_privatePlacesKey);
    if (raw == null || raw.isEmpty) return const [];

    try {
      final decoded = jsonDecode(raw) as List<dynamic>;
      return decoded
          .whereType<Map<String, dynamic>>()
          .map(MapContextItem.fromJson)
          .toList();
    } catch (_) {
      return const [];
    }
  }

  Future<void> savePlaces(List<MapContextItem> places) async {
    final prefs = await SharedPreferences.getInstance();
    final json = jsonEncode(places.map((p) => p.toJson()).toList());
    await prefs.setString(_privatePlacesKey, json);
  }

  Future<void> upsertPlace(MapContextItem place) async {
    final places = await loadPlaces();
    final next = [...places.where((item) => item.id != place.id), place];
    await savePlaces(next);
  }
}
