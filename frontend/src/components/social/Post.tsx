"use client";

import React, { useState } from "react";
import PlaceholderImage from "./PlaceholderImage";

interface PostProps {
  id: string;
  author: {
    name: string;
    avatar?: string;
    time: string;
  };
  content: {
    text?: string;
    image?: string;
  };
  likes: number;
  comments: number;
  shares: number;
  isLiked?: boolean;
  className?: string;
}

const Post: React.FC<PostProps> = ({
  id,
  author,
  content,
  likes,
  comments,
  shares,
  isLiked = false,
  className = "",
}) => {
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = () => {
    if (liked) {
      setLiked(false);
      setLikeCount(likeCount - 1);
    } else {
      setLiked(true);
      setLikeCount(likeCount + 1);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 social-post ${className}`}
    >
      {/* Post Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
              {author.avatar ? (
                <img
                  src={author.avatar}
                  alt={author.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {author.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                {author.name}
              </h3>
              <p className="text-gray-500 text-xs">{author.time}</p>
            </div>
          </div>

          <button className="text-gray-400 hover:text-gray-600 transition-colors duration-200">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        {content.text && (
          <p className="text-gray-800 text-sm leading-relaxed mb-3">
            {content.text}
          </p>
        )}

        {content.image && (
          <div className="rounded-lg overflow-hidden bg-gray-100">
            {content.image.startsWith("/api/placeholder") ? (
              <PlaceholderImage height={300} text="Post Image" />
            ) : (
              <img
                src={content.image}
                alt="Post content"
                className="w-full h-auto object-cover"
              />
            )}
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="border-t border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              liked
                ? "text-blue-600 bg-blue-50"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <svg
              className={`w-4 h-4 ${liked ? "fill-blue-600" : "fill-none"}`}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 9m-5 4h2m0 0h2m-2 0v4m0-4V9m-2 4a2 2 0 01-2-2V7a2 2 0 012-2h2m-4 7h4"
              />
            </svg>
            <span>Like</span>
            {likeCount > 0 && (
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                {likeCount}
              </span>
            )}
          </button>

          <button className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-200">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span>Comment</span>
            {comments > 0 && (
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                {comments}
              </span>
            )}
          </button>

          <button className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors duration-200">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
            <span>Share</span>
            {shares > 0 && (
              <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">
                {shares}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Post;
