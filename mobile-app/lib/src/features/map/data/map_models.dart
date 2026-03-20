class MapContextItem {
  const MapContextItem({
    required this.id,
    required this.name,
    this.description,
    this.address,
    this.latitude,
    this.longitude,
    this.category,
    this.isReviewed,
    this.reviewCount,
    this.avgRating,
    this.updatedAt,
  });

  final int id;
  final String name;
  final String? description;
  final String? address;
  final double? latitude;
  final double? longitude;
  final String? category;
  final bool? isReviewed;
  final int? reviewCount;
  final double? avgRating;
  final DateTime? updatedAt;

  bool get hasCoordinates => latitude != null && longitude != null;

  factory MapContextItem.fromJson(Map<String, dynamic> json) {
    return MapContextItem(
      id: (json['id'] as num?)?.toInt() ?? 0,
      name: (json['name'] ?? '').toString(),
      description: json['description']?.toString(),
      address: json['address']?.toString(),
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      category: json['category']?.toString(),
      isReviewed: json['isReviewed'] == true,
      reviewCount: (json['reviewCount'] as num?)?.toInt(),
      avgRating: (json['avgRating'] as num?)?.toDouble(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'].toString())
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'address': address,
      'latitude': latitude,
      'longitude': longitude,
      'category': category,
      'isReviewed': isReviewed,
      'reviewCount': reviewCount,
      'avgRating': avgRating,
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }
}

enum MapReviewVisibility { publicWorld, privateWorld, premium }

extension MapReviewVisibilityApiValue on MapReviewVisibility {
  String get apiValue {
    switch (this) {
      case MapReviewVisibility.publicWorld:
        return 'PUBLIC';
      case MapReviewVisibility.privateWorld:
        return 'PRIVATE';
      case MapReviewVisibility.premium:
        return 'PREMIUM';
    }
  }
}

class PublishReviewRequest {
  const PublishReviewRequest({
    required this.stars,
    required this.content,
    required this.visibility,
    this.depositAmount = 0,
    this.isPremium = false,
  });

  final int stars;
  final String content;
  final MapReviewVisibility visibility;
  final int depositAmount;
  final bool isPremium;

  Map<String, dynamic> toJson() {
    return {
      'stars': stars,
      'content': content,
      'visibility': visibility.apiValue,
      'depositAmount': depositAmount,
      'isPremium': isPremium,
    };
  }
}

class PublishReviewResult {
  const PublishReviewResult({
    required this.reviewId,
    required this.wordCount,
    required this.depositAmount,
    this.remainingKnowU,
    this.isPremium = false,
  });

  final int reviewId;
  final int wordCount;
  final int depositAmount;
  final int? remainingKnowU;
  final bool isPremium;

  factory PublishReviewResult.fromJson(Map<String, dynamic> json) {
    final review = json['review'] as Map<String, dynamic>? ?? const {};
    return PublishReviewResult(
      reviewId: (review['id'] as num?)?.toInt() ?? 0,
      wordCount: (json['wordCount'] as num?)?.toInt() ?? 0,
      depositAmount: (json['depositAmount'] as num?)?.toInt() ?? 0,
      remainingKnowU: (json['remainingKnowU'] as num?)?.toInt(),
      isPremium: json['isPremium'] == true,
    );
  }
}

class PremiumReviewEligibility {
  const PremiumReviewEligibility({
    required this.eligible,
    required this.upvotes,
    required this.downvotes,
    required this.ratio,
    required this.avgStars,
    required this.reviewCount,
  });

  final bool eligible;
  final int upvotes;
  final int downvotes;
  final double ratio;
  final double avgStars;
  final int reviewCount;

  factory PremiumReviewEligibility.fromJson(Map<String, dynamic> json) {
    return PremiumReviewEligibility(
      eligible: json['eligible'] == true,
      upvotes: (json['upvotes'] as num?)?.toInt() ?? 0,
      downvotes: (json['downvotes'] as num?)?.toInt() ?? 0,
      ratio: (json['ratio'] as num?)?.toDouble() ?? 0,
      avgStars: (json['avgStars'] as num?)?.toDouble() ?? 0,
      reviewCount: (json['reviewCount'] as num?)?.toInt() ?? 0,
    );
  }
}

class WorldImportBounds {
  const WorldImportBounds({
    required this.minLat,
    required this.minLng,
    required this.maxLat,
    required this.maxLng,
  });

  final double minLat;
  final double minLng;
  final double maxLat;
  final double maxLng;

  Map<String, dynamic> toJson() => {
    'minLat': minLat,
    'minLng': minLng,
    'maxLat': maxLat,
    'maxLng': maxLng,
  };
}

class WorldImportResult {
  const WorldImportResult({
    required this.mode,
    required this.imported,
    required this.scanned,
  });

  final String mode;
  final int imported;
  final int scanned;

  factory WorldImportResult.fromJson(Map<String, dynamic> json) {
    return WorldImportResult(
      mode: (json['mode'] ?? '').toString(),
      imported: (json['imported'] as num?)?.toInt() ?? 0,
      scanned: (json['scanned'] as num?)?.toInt() ?? 0,
    );
  }
}

class CreatePlaceRequest {
  const CreatePlaceRequest({
    required this.name,
    required this.latitude,
    required this.longitude,
    this.description,
    this.category,
    this.address,
  });

  final String name;
  final double latitude;
  final double longitude;
  final String? description;
  final String? category;
  final String? address;

  Map<String, dynamic> toJson() => {
    'name': name,
    'latitude': latitude,
    'longitude': longitude,
    if (description != null && description!.isNotEmpty)
      'description': description,
    if (category != null && category!.isNotEmpty) 'category': category,
    if (address != null && address!.isNotEmpty) 'address': address,
  };
}
