enum SearchWorldMode { open, privateWorld }

enum SearchResultType { place, article }

class SearchFilters {
  const SearchFilters({
    this.minRating,
    this.nearbyOnly = false,
    this.createdAfter,
  });

  final double? minRating;
  final bool nearbyOnly;
  final DateTime? createdAfter;

  SearchFilters copyWith({
    double? minRating,
    bool? nearbyOnly,
    DateTime? createdAfter,
  }) {
    return SearchFilters(
      minRating: minRating ?? this.minRating,
      nearbyOnly: nearbyOnly ?? this.nearbyOnly,
      createdAfter: createdAfter ?? this.createdAfter,
    );
  }
}

class SearchSuggestion {
  const SearchSuggestion({
    required this.type,
    required this.id,
    required this.title,
    required this.subtitle,
    required this.score,
    this.snippet,
    this.locationName,
    this.lat,
    this.lng,
    this.rating,
    this.createdAt,
  });

  final SearchResultType type;
  final String id;
  final String title;
  final String subtitle;
  final double score;
  final String? snippet;
  final String? locationName;
  final double? lat;
  final double? lng;
  final double? rating;
  final DateTime? createdAt;

  bool get canLookInMap => lat != null && lng != null;
}
