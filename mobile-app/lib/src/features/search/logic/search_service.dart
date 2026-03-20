import 'dart:math';

import 'package:geolocator/geolocator.dart' as geo;

import '../../../core/network/api_client.dart';
import '../../explore/data/feed_models.dart';
import '../../explore/data/feed_repository.dart';
import '../../map/data/map_models.dart';
import '../../map/data/map_repository.dart';
import '../data/private_world_store.dart';
import '../models/search_models.dart';

class SearchService {
  SearchService({
    required ApiClient apiClient,
    required MapRepository mapRepository,
    required FeedRepository feedRepository,
    required PrivateWorldStore privateWorldStore,
  }) : _apiClient = apiClient,
       _mapRepository = mapRepository,
       _feedRepository = feedRepository,
       _privateWorldStore = privateWorldStore;

  final ApiClient _apiClient;
  final MapRepository _mapRepository;
  final FeedRepository _feedRepository;
  final PrivateWorldStore _privateWorldStore;

  static const Map<String, String> _accentMap = {
    'á': 'a',
    'à': 'a',
    'ả': 'a',
    'ã': 'a',
    'ạ': 'a',
    'ă': 'a',
    'ắ': 'a',
    'ằ': 'a',
    'ẳ': 'a',
    'ẵ': 'a',
    'ặ': 'a',
    'â': 'a',
    'ấ': 'a',
    'ầ': 'a',
    'ẩ': 'a',
    'ẫ': 'a',
    'ậ': 'a',
    'é': 'e',
    'è': 'e',
    'ẻ': 'e',
    'ẽ': 'e',
    'ẹ': 'e',
    'ê': 'e',
    'ế': 'e',
    'ề': 'e',
    'ể': 'e',
    'ễ': 'e',
    'ệ': 'e',
    'í': 'i',
    'ì': 'i',
    'ỉ': 'i',
    'ĩ': 'i',
    'ị': 'i',
    'ó': 'o',
    'ò': 'o',
    'ỏ': 'o',
    'õ': 'o',
    'ọ': 'o',
    'ô': 'o',
    'ố': 'o',
    'ồ': 'o',
    'ổ': 'o',
    'ỗ': 'o',
    'ộ': 'o',
    'ơ': 'o',
    'ớ': 'o',
    'ờ': 'o',
    'ở': 'o',
    'ỡ': 'o',
    'ợ': 'o',
    'ú': 'u',
    'ù': 'u',
    'ủ': 'u',
    'ũ': 'u',
    'ụ': 'u',
    'ư': 'u',
    'ứ': 'u',
    'ừ': 'u',
    'ử': 'u',
    'ữ': 'u',
    'ự': 'u',
    'ý': 'y',
    'ỳ': 'y',
    'ỷ': 'y',
    'ỹ': 'y',
    'ỵ': 'y',
    'đ': 'd',
  };

  Future<List<SearchSuggestion>> suggest({
    required String query,
    required SearchWorldMode mode,
    required SearchFilters filters,
    double? currentLat,
    double? currentLng,
  }) async {
    final normalizedQuery = _normalizeText(query);
    if (normalizedQuery.isEmpty) {
      return _defaultSuggestions(mode);
    }

    final remote = await _fetchRemoteSuggestions(
      query: normalizedQuery,
      mode: mode,
      filters: filters,
      currentLat: currentLat,
      currentLng: currentLng,
    );
    final local = await _searchLocally(
      query: normalizedQuery,
      mode: mode,
      filters: filters,
      currentLat: currentLat,
      currentLng: currentLng,
      limit: 30,
    );
    return _mergeSuggestions(remote, local, limit: 30);
  }

  Future<List<SearchSuggestion>> search({
    required String query,
    required SearchWorldMode mode,
    required SearchFilters filters,
    double? currentLat,
    double? currentLng,
  }) async {
    final normalizedQuery = _normalizeText(query);
    if (normalizedQuery.isEmpty) {
      return const [];
    }

    final remote = await _fetchRemoteResults(
      query: normalizedQuery,
      mode: mode,
      filters: filters,
      currentLat: currentLat,
      currentLng: currentLng,
    );
    final local = await _searchLocally(
      query: normalizedQuery,
      mode: mode,
      filters: filters,
      currentLat: currentLat,
      currentLng: currentLng,
      limit: 24,
    );
    return _mergeSuggestions(remote, local, limit: 24);
  }

  Future<void> saveToPrivateWorld(MapContextItem place) {
    return _privateWorldStore.upsertPlace(place);
  }

  Future<List<SearchSuggestion>> _searchLocally({
    required String query,
    required SearchWorldMode mode,
    required SearchFilters filters,
    required double? currentLat,
    required double? currentLng,
    required int limit,
  }) async {
    if (mode == SearchWorldMode.privateWorld) {
      final privatePlaces = await _privateWorldStore.loadPlaces();
      return _rankPlaces(
        query: query,
        places: privatePlaces,
        filters: filters,
        currentLat: currentLat,
        currentLng: currentLng,
      ).take(limit).toList();
    }

    final contexts = await _mapRepository.fetchMapContexts(
      minStars: filters.minRating,
      limit: 300,
    );

    List<FeedItem> feedItems = const [];
    try {
      final page = await _feedRepository.fetchFeed(limit: 80);
      feedItems = page.items;
    } catch (_) {
      // Feed endpoint requires auth; keep knowledge search usable for guests.
    }

    final placeSuggestions = _rankPlaces(
      query: query,
      places: contexts,
      filters: filters,
      currentLat: currentLat,
      currentLng: currentLng,
    );
    final articleSuggestions = _rankArticles(
      query: query,
      items: feedItems,
      filters: filters,
      currentLat: currentLat,
      currentLng: currentLng,
    );

    final merged = [...placeSuggestions, ...articleSuggestions]
      ..sort((a, b) => b.score.compareTo(a.score));
    return merged.take(limit).toList();
  }

  Future<List<SearchSuggestion>> _fetchRemoteSuggestions({
    required String query,
    required SearchWorldMode mode,
    required SearchFilters filters,
    required double? currentLat,
    required double? currentLng,
  }) async {
    try {
      return await _apiClient.getData<List<SearchSuggestion>>(
        '/api/search/suggest',
        query: {
          'q': query,
          'world': mode == SearchWorldMode.open ? 'open' : 'private',
          'limit': 18,
          if (filters.minRating != null) 'minRating': filters.minRating,
          if (filters.nearbyOnly) 'nearby': true,
          if (currentLat != null) 'lat': currentLat,
          if (currentLng != null) 'lng': currentLng,
        },
        parser: (data) {
          final raw = data as Map<String, dynamic>;
          final items = (raw['items'] as List<dynamic>? ?? const [])
              .whereType<Map<String, dynamic>>()
              .map(_fromRemoteSuggestion)
              .whereType<SearchSuggestion>()
              .toList()
            ..sort((a, b) => b.score.compareTo(a.score));
          return items;
        },
      );
    } on ApiException {
      return const [];
    } catch (_) {
      return const [];
    }
  }

  Future<List<SearchSuggestion>> _fetchRemoteResults({
    required String query,
    required SearchWorldMode mode,
    required SearchFilters filters,
    required double? currentLat,
    required double? currentLng,
  }) async {
    try {
      return await _apiClient.getData<List<SearchSuggestion>>(
        '/api/search',
        query: {
          'q': query,
          'world': mode == SearchWorldMode.open ? 'open' : 'private',
          'types': 'place,article',
          'limit': 24,
          if (filters.minRating != null) 'minRating': filters.minRating,
          if (filters.nearbyOnly) 'nearby': true,
          if (filters.createdAfter != null)
            'recentDays':
                DateTime.now().difference(filters.createdAfter!).inDays.clamp(
                  1,
                  365,
                ),
          if (currentLat != null) 'lat': currentLat,
          if (currentLng != null) 'lng': currentLng,
        },
        parser: (data) {
          final raw = data as Map<String, dynamic>;
          return (raw['items'] as List<dynamic>? ?? const [])
              .whereType<Map<String, dynamic>>()
              .map(_fromRemoteSuggestion)
              .whereType<SearchSuggestion>()
              .toList()
            ..sort((a, b) => b.score.compareTo(a.score));
        },
      );
    } on ApiException {
      return const [];
    } catch (_) {
      return const [];
    }
  }

  SearchSuggestion? _fromRemoteSuggestion(Map<String, dynamic> json) {
    final typeValue = (json['type'] ?? '').toString().toLowerCase();
    final type = switch (typeValue) {
      'article' => SearchResultType.article,
      _ => SearchResultType.place,
    };

    final location = json['location'] as Map<String, dynamic>?;
    final lat =
        (json['lat'] as num?)?.toDouble() ??
        (location?['lat'] as num?)?.toDouble();
    final lng =
        (json['lng'] as num?)?.toDouble() ??
        (location?['lng'] as num?)?.toDouble();

    final title = (json['title'] ?? '').toString().trim();
    if (title.isEmpty) return null;

    return SearchSuggestion(
      type: type,
      id: '${typeValue.isEmpty ? 'place' : typeValue}:${json['id']}',
      title: title,
      subtitle: (json['subtitle'] ?? '').toString(),
      score: (json['score'] as num?)?.toDouble() ?? 0,
      snippet: json['snippet']?.toString(),
      locationName: location?['name']?.toString(),
      lat: lat,
      lng: lng,
      rating: (json['rating'] as num?)?.toDouble(),
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
    );
  }

  List<SearchSuggestion> _defaultSuggestions(SearchWorldMode mode) {
    final list = mode == SearchWorldMode.open
        ? const [
            'Flutter architecture',
            'Mapbox performance',
            'Product discovery',
            'Public reviews',
          ]
        : const [
            'My favorite places',
            'Saved private notes',
            'Recently imported',
            'Draft reviews',
          ];

    return list
        .map(
          (item) => SearchSuggestion(
            type: SearchResultType.place,
            id: 'hint:$item',
            title: item,
            subtitle: 'Suggestion',
            score: 0.2,
          ),
        )
        .toList();
  }

  List<SearchSuggestion> _rankPlaces({
    required String query,
    required List<MapContextItem> places,
    required SearchFilters filters,
    required double? currentLat,
    required double? currentLng,
  }) {
    final normalizedQuery = _normalizeText(query);
    final tokens = normalizedQuery
        .split(' ')
        .where((t) => t.isNotEmpty)
        .toList();
    if (tokens.isEmpty) return const [];

    final output = <SearchSuggestion>[];
    for (final place in places) {
      if (filters.minRating != null &&
          (place.avgRating ?? 0) < filters.minRating!) {
        continue;
      }

      final haystack =
          '${place.name} ${place.description ?? ''} ${place.address ?? ''} ${place.category ?? ''}';
      final textHit = _tokenMatchScore(tokens, haystack, normalizedQuery);
      if (textHit <= 0) continue;

      final ratingScore = ((place.avgRating ?? 0) / 5).clamp(0, 1).toDouble();
      final reviewWeight = min((place.reviewCount ?? 0) / 120.0, 1.0);
      final qualityScore = (ratingScore * 0.7) + (reviewWeight * 0.3);

      final distanceScore = _distanceScore(
        place.latitude,
        place.longitude,
        currentLat,
        currentLng,
      );
      if (filters.nearbyOnly && distanceScore <= 0) continue;

      final score =
          (textHit * 0.55) + (qualityScore * 0.25) + (distanceScore * 0.20);

      output.add(
        SearchSuggestion(
          type: SearchResultType.place,
          id: 'place:${place.id}',
          title: place.name,
          subtitle: _buildPlaceSubtitle(place),
          score: score,
          snippet: place.description ?? place.address,
          locationName: place.address,
          lat: place.latitude,
          lng: place.longitude,
          rating: place.avgRating,
          createdAt: place.updatedAt,
        ),
      );
    }

    output.sort((a, b) => b.score.compareTo(a.score));
    return output;
  }

  List<SearchSuggestion> _rankArticles({
    required String query,
    required List<FeedItem> items,
    required SearchFilters filters,
    required double? currentLat,
    required double? currentLng,
  }) {
    final normalizedQuery = _normalizeText(query);
    final tokens = normalizedQuery
        .split(' ')
        .where((t) => t.isNotEmpty)
        .toList();
    if (tokens.isEmpty) return const [];

    final now = DateTime.now();
    final output = <SearchSuggestion>[];

    for (final item in items) {
      if (filters.createdAfter != null &&
          item.createdAt.isBefore(filters.createdAfter!)) {
        continue;
      }

      final haystack =
          '${item.title} ${item.excerpt} ${item.field ?? ''} ${item.locationName ?? ''}';
      final textHit = _tokenMatchScore(tokens, haystack, normalizedQuery);
      if (textHit <= 0) continue;

      final engagement = min(
        (item.likes + item.comments * 1.6 + item.shares * 2) / 140.0,
        1.0,
      );
      final daysOld = now.difference(item.createdAt).inDays.clamp(0, 365);
      final freshness = max(0.0, 1 - (daysOld / 120.0));
      final distanceScore = _distanceScore(
        item.locationLat,
        item.locationLng,
        currentLat,
        currentLng,
      );

      final score =
          (textHit * 0.58) +
          (engagement * 0.22) +
          (freshness * 0.12) +
          (distanceScore * 0.08);

      output.add(
        SearchSuggestion(
          type: SearchResultType.article,
          id: 'article:${item.id}',
          title: item.title,
          subtitle: '${item.authorName} • ${item.field ?? 'Knowledge'}',
          score: score,
          snippet: item.excerpt,
          locationName: item.locationName,
          lat: item.locationLat,
          lng: item.locationLng,
          createdAt: item.createdAt,
        ),
      );
    }

    output.sort((a, b) => b.score.compareTo(a.score));
    return output;
  }

  String _buildPlaceSubtitle(MapContextItem place) {
    final rating = place.avgRating != null
        ? place.avgRating!.toStringAsFixed(1)
        : '-';
    final reviews = place.reviewCount ?? 0;
    final category = place.category ?? 'Place';
    return '$category • $rating★ • $reviews reviews';
  }

  double _tokenMatchScore(
    List<String> tokens,
    String haystack,
    String normalizedQuery,
  ) {
    if (tokens.isEmpty) return 0;
    final normalizedHaystack = _normalizeText(haystack);
    var hit = 0;
    for (final token in tokens) {
      if (normalizedHaystack.contains(token)) hit++;
    }
    final phraseBonus = normalizedHaystack.contains(normalizedQuery) ? 0.2 : 0.0;
    return ((hit / tokens.length) + phraseBonus).clamp(0, 1).toDouble();
  }

  double _distanceScore(
    double? targetLat,
    double? targetLng,
    double? currentLat,
    double? currentLng,
  ) {
    if (targetLat == null ||
        targetLng == null ||
        currentLat == null ||
        currentLng == null) {
      return 0;
    }
    final distance = geo.Geolocator.distanceBetween(
      currentLat,
      currentLng,
      targetLat,
      targetLng,
    );
    if (distance <= 500) return 1;
    if (distance <= 1500) return 0.75;
    if (distance <= 5000) return 0.5;
    if (distance <= 12000) return 0.2;
    return 0;
  }

  String _normalizeText(String value) {
    final lower = value.toLowerCase().trim();
    final buffer = StringBuffer();
    for (final rune in lower.runes) {
      final char = String.fromCharCode(rune);
      buffer.write(_accentMap[char] ?? char);
    }
    return buffer.toString().replaceAll(RegExp(r'\s+'), ' ');
  }

  List<SearchSuggestion> _mergeSuggestions(
    List<SearchSuggestion> primary,
    List<SearchSuggestion> secondary, {
    required int limit,
  }) {
    final byId = <String, SearchSuggestion>{};
    for (final item in [...primary, ...secondary]) {
      final existing = byId[item.id];
      if (existing == null || item.score > existing.score) {
        byId[item.id] = item;
      }
    }
    final merged = byId.values.toList()
      ..sort((a, b) => b.score.compareTo(a.score));
    return merged.take(limit).toList();
  }
}
