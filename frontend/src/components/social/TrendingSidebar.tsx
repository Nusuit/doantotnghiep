"use client";

import React from "react";

interface TrendingProps {
  className?: string;
}

const TrendingSidebar: React.FC<TrendingProps> = ({ className = "" }) => {
  const trendingTopics = [
    {
      id: "1",
      hashtag: "#Lorem ipsum",
      category: "Trending topic",
    },
    {
      id: "2",
      hashtag: "#Dolor sit amet",
      category: "Trending topic",
    },
    {
      id: "3",
      hashtag: "#Consectetur",
      category: "Trending topic",
    },
    {
      id: "4",
      hashtag: "#Adipiscing",
      category: "Trending topic",
    },
  ];

  const trendingNow = [
    {
      id: "1",
      hashtag: "#Lorem ipsum",
      category: "Trending topic",
    },
    {
      id: "2",
      hashtag: "#Dolor sit amet",
      category: "Trending topic",
    },
    {
      id: "3",
      hashtag: "#Consectetur",
      category: "Trending topic",
    },
  ];

  return (
    <div className={`space-y-4 trending-sidebar ${className}`}>
      {/* Trending Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 trending-section">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Trending</h2>
        </div>
        <div className="p-4 space-y-3">
          {trendingTopics.map((topic) => (
            <div
              key={topic.id}
              className="block p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">
                  {topic.hashtag}
                </span>
                <span className="text-xs text-gray-500">{topic.category}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200">
            Show more
          </button>
        </div>
      </div>

      {/* Trending Now Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Trendin</h2>
        </div>
        <div className="p-4 space-y-3">
          {trendingNow.map((topic) => (
            <div
              key={topic.id}
              className="block p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
            >
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-900">
                  {topic.hashtag}
                </span>
                <span className="text-xs text-gray-500">{topic.category}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200">
            Show more
          </button>
        </div>
      </div>

      {/* Suggested For You */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Suggested for you
          </h2>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex-shrink-0"></div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Jane Smith
                </h3>
                <p className="text-xs text-gray-500">2 mutual friends</p>
              </div>
            </div>
            <button className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200">
              Follow
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex-shrink-0"></div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Alex Johnson
                </h3>
                <p className="text-xs text-gray-500">5 mutual friends</p>
              </div>
            </div>
            <button className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200">
              Follow
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex-shrink-0"></div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  Sarah Wilson
                </h3>
                <p className="text-xs text-gray-500">1 mutual friend</p>
              </div>
            </div>
            <button className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200">
              Follow
            </button>
          </div>
        </div>
        <div className="p-4 border-t border-gray-100">
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200">
            Show more
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrendingSidebar;
