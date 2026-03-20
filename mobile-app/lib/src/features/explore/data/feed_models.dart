class FeedItem {
  const FeedItem({
    required this.id,
    required this.title,
    required this.excerpt,
    required this.authorName,
    required this.createdAt,
    required this.likes,
    required this.comments,
    required this.shares,
    this.field,
    this.locationName,
    this.locationLat,
    this.locationLng,
  });

  final int id;
  final String title;
  final String excerpt;
  final String authorName;
  final DateTime createdAt;
  final int likes;
  final int comments;
  final int shares;
  final String? field;
  final String? locationName;
  final double? locationLat;
  final double? locationLng;

  factory FeedItem.fromJson(Map<String, dynamic> json) {
    final author = json['author'] as Map<String, dynamic>? ?? const {};
    final location = json['location'] as Map<String, dynamic>?;
    return FeedItem(
      id: (json['id'] as num?)?.toInt() ?? 0,
      title: (json['title'] ?? '').toString(),
      excerpt: (json['excerpt'] ?? '').toString(),
      authorName: (author['name'] ?? 'Unknown').toString(),
      createdAt:
          DateTime.tryParse((json['createdAt'] ?? '').toString()) ??
          DateTime.now(),
      likes: (json['likes'] as num?)?.toInt() ?? 0,
      comments: (json['comments'] as num?)?.toInt() ?? 0,
      shares: (json['shares'] as num?)?.toInt() ?? 0,
      field: json['field']?.toString(),
      locationName: location?['name']?.toString(),
      locationLat: (location?['lat'] as num?)?.toDouble(),
      locationLng: (location?['lng'] as num?)?.toDouble(),
    );
  }
}

class FeedPageData {
  const FeedPageData({required this.items, this.nextCursor});

  final List<FeedItem> items;
  final String? nextCursor;
}
