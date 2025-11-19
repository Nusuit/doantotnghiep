"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, MapPin, Clock, Star, X } from "lucide-react";
import { useMap } from "../Map";

interface SearchResult {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number]; // [lng, lat]
  category?: string;
  rating?: number;
}

interface MapSearchProps {
  onResultSelect?: (result: SearchResult) => void;
  placeholder?: string;
}

const MapSearch: React.FC<MapSearchProps> = ({
  onResultSelect,
  placeholder = "Tìm kiếm địa điểm...",
}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const { flyTo } = useMap();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("mapSearchHistory");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.warn("Failed to load search history:", e);
      }
    }
  }, []);

  // Mock search function (replace with real API)
  const performSearch = async (
    searchQuery: string
  ): Promise<SearchResult[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock results for Vietnamese food places
    const mockResults: SearchResult[] = [
      {
        id: "1",
        name: "Phở Hòa Pasteur",
        address: "421C Nguyễn Thị Minh Khai, Quận 3, TP.HCM",
        coordinates: [106.6924, 10.7831],
        category: "Phở",
        rating: 4.5,
      },
      {
        id: "2",
        name: "Bánh mì Huỳnh Hoa",
        address: "26 Lê Thị Riêng, Quận 1, TP.HCM",
        coordinates: [106.6529, 10.8142],
        category: "Bánh mì",
        rating: 4.3,
      },
      {
        id: "3",
        name: "Cơm tấm Sài Gòn",
        address: "15 Nguyễn Thông, Quận 3, TP.HCM",
        coordinates: [106.6825, 10.7898],
        category: "Cơm tấm",
        rating: 4.2,
      },
    ].filter(
      (result) =>
        result.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        result.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return mockResults;
  };

  // Handle search input
  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    setShowResults(true);

    try {
      const searchResults = await performSearch(searchQuery);
      setResults(searchResults);
    } catch (error) {
      console.error("Search failed:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        handleSearch(query);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Handle result selection
  const handleResultClick = (result: SearchResult) => {
    // Save to recent searches
    const newRecentSearches = [
      result.name,
      ...recentSearches.filter((s) => s !== result.name),
    ].slice(0, 5);
    setRecentSearches(newRecentSearches);
    localStorage.setItem("mapSearchHistory", JSON.stringify(newRecentSearches));

    // Fly to location
    flyTo({
      longitude: result.coordinates[0],
      latitude: result.coordinates[1],
      zoom: 16,
    });

    // Close search
    setQuery("");
    setShowResults(false);
    setResults([]);

    // Callback
    onResultSelect?.(result);
  };

  // Handle recent search click
  const handleRecentSearchClick = (searchTerm: string) => {
    setQuery(searchTerm);
    searchInputRef.current?.focus();
  };

  // Clear search
  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <div className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          ref={searchInputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowResults(true)}
          className="block w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl bg-white/95 backdrop-blur-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          placeholder={placeholder}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Search Results */}
      {showResults && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 max-h-96 overflow-y-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Đang tìm kiếm...</p>
            </div>
          )}

          {/* Search Results */}
          {!isLoading && results.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Kết quả tìm kiếm
              </div>
              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleResultClick(result)}
                  className="w-full px-3 py-3 text-left hover:bg-gray-50 border-b border-gray-50 last:border-b-0 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <MapPin className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {result.name}
                        </h4>
                        {result.rating && (
                          <div className="flex items-center gap-1 text-xs text-yellow-600">
                            <Star className="h-3 w-3 fill-current" />
                            {result.rating}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {result.address}
                      </p>
                      {result.category && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                          {result.category}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && query && results.length === 0 && (
            <div className="p-4 text-center">
              <MapPin className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                Không tìm thấy địa điểm nào cho "{query}"
              </p>
            </div>
          )}

          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div className="py-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Tìm kiếm gần đây
              </div>
              {recentSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleRecentSearchClick(search)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-50 last:border-b-0 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{search}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!query && recentSearches.length === 0 && (
            <div className="p-4 text-center">
              <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                Tìm kiếm địa điểm, nhà hàng, quán café...
              </p>
            </div>
          )}
        </div>
      )}

      {/* Overlay to close results */}
      {showResults && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
};

export default MapSearch;
