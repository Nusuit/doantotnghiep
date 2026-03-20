"use client";

import React from "react";
import TiptapEditor from "../ui/TiptapEditor";
import api from "../../lib/api";
import { toast } from "sonner";

interface CreatePostProps {
  className?: string;
  onPost?: (content: string, contextId?: number) => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ className = "", onPost }) => {
  const [content, setContent] = React.useState("");
  const [showLocationSearch, setShowLocationSearch] = React.useState(false);
  const [locationQuery, setLocationQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<any[]>([]);
  const [selectedContext, setSelectedContext] = React.useState<{id: string, title: string, subtitle: string} | null>(null);
  const [isSearching, setIsSearching] = React.useState(false);

  React.useEffect(() => {
    if (!locationQuery.trim()) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.search.suggest(locationQuery);
        if (res && res.items) {
          setSuggestions(res.items);
        }
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [locationQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim() && onPost) {
      onPost(content, selectedContext ? parseInt(selectedContext.id) : undefined);
      setContent("");
      setSelectedContext(null);
      setShowLocationSearch(false);
      setLocationQuery("");
    }
  };

  const handlePickOnMap = () => {
    toast.info("Tính năng chọn trên bản đồ sẽ được cập nhật ở version sau 📍");
    setShowLocationSearch(false);
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 create-post ${className}`}
    >
      <div className="p-4">
        <form onSubmit={handleSubmit}>
          <div className="flex items-start space-x-3">
            {/* User Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">U</span>
            </div>

            {/* Input Area */}
            <div className="flex-1">
              <TiptapEditor
                content={content}
                onChange={setContent}
                placeholder="What's on your mind?"
              />
              {/* Location Badge */}
              {selectedContext && (
                <div className="flex items-center space-x-2 mt-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full w-max text-sm shadow-sm transition-all duration-300 transform scale-100">
                   <span className="text-xl">📍</span> 
                   <span className="font-medium">{selectedContext.title}</span>
                   <button type="button" onClick={() => setSelectedContext(null)} className="ml-2 hover:text-blue-900 border-l border-blue-200 pl-2">✕</button>
                </div>
              )}
              {/* Location Search Bar with Animation */}
              <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showLocationSearch && !selectedContext ? 'max-h-[300px] mt-3 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="relative">
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="Nhập tên quán, địa chỉ..."
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm outline-none"
                  />
                  {isSearching && (
                    <div className="absolute right-3 top-2.5">
                       <span className="w-4 h-4 rounded-full border-2 border-solid border-blue-500 border-r-transparent animate-spin inline-block"></span>
                    </div>
                  )}
                </div>
                {locationQuery.trim() && (
                  <div className="mt-1 border border-gray-100 rounded-lg shadow-sm bg-white overflow-hidden max-h-48 overflow-y-auto">
                    {suggestions.length > 0 ? (
                      suggestions.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => { setSelectedContext(item); setShowLocationSearch(false); setLocationQuery(""); }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors"
                        >
                          <div className="text-sm font-medium text-gray-800">{item.title}</div>
                          <div className="text-xs text-gray-500 truncate">{item.subtitle}</div>
                        </button>
                      ))
                    ) : !isSearching ? (
                      <div className="px-4 py-3 text-sm text-center">
                        <p className="text-gray-500 mb-2">Không tìm thấy trong hệ thống?</p>
                        <button type="button" onClick={handlePickOnMap} className="text-blue-600 font-medium hover:underline flex items-center justify-center w-full">
                          Chọn trên bản đồ 📍
                        </button>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Post Actions */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
            <div className="flex items-center space-x-4">
              <button
                type="button"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">Photo</span>
              </button>

              <button
                type="button"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                <span className="text-sm">Video</span>
              </button>

              <button
                type="button"
                onClick={() => setShowLocationSearch(!showLocationSearch)}
                className={`flex items-center space-x-2 transition-colors duration-200 ${showLocationSearch || selectedContext ? 'text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">Location</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={!content.trim()}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
