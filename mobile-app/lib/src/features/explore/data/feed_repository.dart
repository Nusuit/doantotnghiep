import '../../../core/network/api_client.dart';
import 'feed_models.dart';

class FeedRepository {
  FeedRepository(this._apiClient);

  final ApiClient _apiClient;

  Future<FeedPageData> fetchFeed({int limit = 20, String? cursor}) {
    return _apiClient.getData<FeedPageData>(
      '/api/feed',
      query: {
        'limit': limit,
        if (cursor != null && cursor.isNotEmpty) 'cursor': cursor,
      },
      parser: (data) {
        final json = data as Map<String, dynamic>;
        final items = (json['items'] as List<dynamic>? ?? const [])
            .whereType<Map<String, dynamic>>()
            .map(FeedItem.fromJson)
            .toList();
        return FeedPageData(
          items: items,
          nextCursor: json['nextCursor']?.toString(),
        );
      },
    );
  }
}
