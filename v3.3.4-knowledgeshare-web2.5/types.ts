
export interface User {
  name: string;
  handle: string;
  avatar: string;
  balance_u: number;
  balance_g: number;
  isGold?: boolean;
  // Social Graph
  followers?: number;
  following?: number;
  isFollowing?: boolean; 
}

export type LocationType = 'store' | 'bookstore' | 'coworking' | 'university' | 'cafe' | 'library';

export interface Review {
    id: string;
    author: string;
    avatar: string;
    rating: number;
    text: string;
    date: string;
}

export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: LocationType;
  description?: string;
  image?: string;
  address?: string;
  rating?: number;
  reviewsCount?: number;
  hasNewActivity?: boolean; // For Pulse Animation
  recentReviewSnippet?: string; // For Hover Card
  reviews?: Review[]; // Full reviews for Side Panel
}

export type FieldType = 'Technology' | 'Science' | 'Art' | 'Finance' | 'Health' | 'General';

export type PostVisibility = 'public' | 'private';
export type PostContentType = 'standard' | 'premium';

export interface Post {
  id: string;
  author: User;
  title: string; 
  content: string;
  timestamp: string;
  likes: number;
  knowledgeValue: number; // KV Score (0-100)
  comments: number;
  shares: number;
  tags: string[];
  field: FieldType;
  location?: Location;
  link?: string; // New field for URL reviews
  image?: string; 
  
  // New Access Control Fields
  visibility: PostVisibility;
  contentType: PostContentType;
  premiumHint?: string; // The teaser for premium posts
  unlockPrice?: number; // Cost in KNOW-U
}

export interface Proposal {
  id: string;
  title: string;
  description: string;
  votesFor: number;
  votesAgainst: number;
  status: 'Active' | 'Passed' | 'Rejected';
  endDate: string;
  tags: string[];
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  articles: number;
  reviews: number;
  points: number;
}
