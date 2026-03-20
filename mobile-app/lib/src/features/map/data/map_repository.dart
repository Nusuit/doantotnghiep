import '../../../core/network/api_client.dart';
import 'map_models.dart';

class MapRepository {
  MapRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<List<MapContextItem>> fetchMapContexts({
    double? minLat,
    double? minLng,
    double? maxLat,
    double? maxLng,
    List<String>? categories,
    double? minStars,
    String reviewStatus = 'all',
    int limit = 200,
  }) {
    final query = <String, dynamic>{
      'reviewStatus': reviewStatus,
      'limit': limit,
    };
    if (minLat != null) query['minLat'] = minLat;
    if (minLng != null) query['minLng'] = minLng;
    if (maxLat != null) query['maxLat'] = maxLat;
    if (maxLng != null) query['maxLng'] = maxLng;
    if (categories != null && categories.isNotEmpty) {
      query['categories'] = categories.join(',');
    }
    if (minStars != null) query['minStars'] = minStars;

    return _apiClient.getData<List<MapContextItem>>(
      '/api/map/contexts',
      query: query,
      parser: (data) {
        final raw = data as Map<String, dynamic>;
        final contexts = (raw['contexts'] as List<dynamic>? ?? const [])
            .whereType<Map<String, dynamic>>()
            .map(MapContextItem.fromJson)
            .toList();
        return contexts;
      },
    );
  }

  Future<PremiumReviewEligibility?> fetchPremiumEligibility() async {
    try {
      return await _apiClient.getData<PremiumReviewEligibility>(
        '/api/reputation/me/eligibility/premium-review',
        parser: (data) => PremiumReviewEligibility.fromJson(
          data as Map<String, dynamic>,
        ),
      );
    } on ApiException catch (error) {
      if (error.statusCode == 404) return null;
      rethrow;
    }
  }

  Future<MapContextItem> createPlace(CreatePlaceRequest request) {
    return _apiClient.postData<MapContextItem>(
      '/api/map/places',
      body: request.toJson(),
      parser: (data) {
        final raw = data as Map<String, dynamic>;
        final place = raw['place'] as Map<String, dynamic>? ?? const {};
        return MapContextItem.fromJson(place);
      },
    );
  }

  Future<PublishReviewResult> publishReview({
    required int placeId,
    required PublishReviewRequest request,
  }) {
    return _apiClient.postData<PublishReviewResult>(
      '/api/map/places/$placeId/reviews/publish',
      body: request.toJson(),
      parser: (data) =>
          PublishReviewResult.fromJson(data as Map<String, dynamic>),
    );
  }

  Future<void> upsertContextReview({
    required int contextId,
    required int stars,
    String? comment,
  }) async {
    await _apiClient.postData<void>(
      '/api/map/contexts/$contextId/reviews',
      body: {
        'stars': stars,
        // ignore: use_null_aware_elements
        if (comment != null) 'comment': comment,
      },
      parser: (_) {},
    );
  }

  Future<int> createDeposit({
    required int placeId,
    required int amount,
    String? reason,
  }) {
    return _apiClient.postData<int>(
      '/api/map/places/$placeId/deposits',
      body: {
        'amount': amount,
        if (reason != null && reason.isNotEmpty) 'reason': reason,
      },
      parser: (data) {
        final raw = data as Map<String, dynamic>;
        return (raw['remainingKnowU'] as num?)?.toInt() ?? 0;
      },
    );
  }

  Future<WorldImportResult> importWorld({
    required bool full,
    WorldImportBounds? region,
  }) {
    return _apiClient.postData<WorldImportResult>(
      '/api/world/import',
      body: {
        'mode': full ? 'full' : 'region',
        if (!full && region != null) 'region': region.toJson(),
      },
      parser: (data) => WorldImportResult.fromJson(data as Map<String, dynamic>),
    );
  }
}
